import { Pool, PoolConfig } from 'pg';
import { logger } from '../services/logger';

class Database {
  private pool: Pool;
  private static instance: Database;

  private constructor() {
    const config: PoolConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'assist_move_assist',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      max: 20, // máximo de conexões no pool
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };

    this.pool = new Pool(config);

    // Event listeners para monitoramento
    this.pool.on('connect', (client) => {
      logger.info('Nova conexão com o banco de dados estabelecida');
    });

    this.pool.on('error', (err) => {
      logger.error('Erro inesperado no pool de conexões:', err);
    });

    // Testar conexão inicial
    this.testConnection();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async testConnection(): Promise<void> {
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      logger.info('✅ Conexão com PostgreSQL estabelecida com sucesso');
    } catch (error) {
      logger.error('❌ Erro ao conectar com PostgreSQL:', error);
      throw error;
    }
  }

  public async query(text: string, params?: any[]): Promise<any[]> {
    const start = Date.now();
    try {
      const result = await this.pool.query(text, params);
      const duration = Date.now() - start;
      
      logger.info(`Query executada em ${duration}ms`);
      return result.rows;
    } catch (error) {
      logger.error('Erro na query:', { query: text, params, error });
      throw error;
    }
  }

  public async transaction<T>(callback: (query: (text: string, params?: any[]) => Promise<any[]>) => Promise<T>): Promise<T> {
    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const transactionQuery = async (text: string, params?: any[]) => {
        const result = await client.query(text, params);
        return result.rows;
      };
      
      const result = await callback(transactionQuery);
      await client.query('COMMIT');
      
      logger.info('Transação completada com sucesso');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      logger.error('Transação revertida devido a erro:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  public async close(): Promise<void> {
    await this.pool.end();
    logger.info('Pool de conexões fechado');
  }

  // Métodos utilitários para operações comuns
  public async findById(table: string, id: string): Promise<any | null> {
    const result = await this.query(`SELECT * FROM ${table} WHERE id = $1`, [id]);
    return result[0] || null;
  }

  public async findMany(table: string, conditions: Record<string, any> = {}, orderBy?: string): Promise<any[]> {
    let query = `SELECT * FROM ${table}`;
    const params: any[] = [];
    
    if (Object.keys(conditions).length > 0) {
      const whereConditions = Object.keys(conditions).map((key, index) => {
        params.push(conditions[key]);
        return `${key} = $${index + 1}`;
      });
      query += ` WHERE ${whereConditions.join(' AND ')}`;
    }
    
    if (orderBy) {
      query += ` ORDER BY ${orderBy}`;
    }
    
    return this.query(query, params);
  }

  public async insert(table: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    
    const query = `
      INSERT INTO ${table} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;
    
    const result = await this.query(query, values);
    return result[0];
  }

  public async update(table: string, id: string, data: Record<string, any>): Promise<any> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');
    
    const query = `
      UPDATE ${table}
      SET ${setClause}, updated_at = NOW()
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    
    const result = await this.query(query, [...values, id]);
    return result[0];
  }

  public async delete(table: string, id: string): Promise<boolean> {
    const result = await this.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    return result.length > 0;
  }

  // Métodos específicos do domínio
  public async getBeneficiarias(filters: any = {}): Promise<any[]> {
    let query = `
      SELECT *
      FROM beneficiarias
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters.search) {
      params.push(`%${filters.search}%`);
      query += ` AND (nome_completo ILIKE $${params.length} OR cpf ILIKE $${params.length})`;
    }

    if (filters.status) {
      params.push(filters.status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    if (filters.limit) {
      params.push(Number(filters.limit));
      query += ` LIMIT $${params.length}`;
    }

    if (filters.offset) {
      params.push(Number(filters.offset));
      query += ` OFFSET $${params.length}`;
    }

    return this.query(query, params);
  }

  public async getStats(): Promise<any> {
    const queries = [
      'SELECT COUNT(*) as total_beneficiarias FROM beneficiarias',
      'SELECT COUNT(*) as total_usuarios FROM profiles',
      'SELECT COUNT(*) as formularios_mes FROM anamneses_social WHERE created_at >= date_trunc(\'month\', CURRENT_DATE)',
      'SELECT COUNT(*) as atendimentos_mes FROM declaracoes_comparecimento WHERE created_at >= date_trunc(\'month\', CURRENT_DATE)'
    ];

    const results = await Promise.all(
      queries.map(query => this.query(query))
    );

    return {
      totalBeneficiarias: results[0][0].total_beneficiarias,
      totalUsuarios: results[1][0].total_usuarios,
      formulariosMes: results[2][0].formularios_mes,
      atendimentosMes: results[3][0].atendimentos_mes
    };
  }
}

export const db = Database.getInstance();
