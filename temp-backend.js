const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'assist_move_assist',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as current_time');
    res.json({ success: true, time: result.rows[0].current_time });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@movemarias.com' && password === 'admin123') {
    res.json({ 
      success: true, 
      user: { id: 1, name: 'Admin', email },
      token: 'token-' + Date.now()
    });
  } else {
    res.status(401).json({ success: false, message: 'Credenciais invalidas' });
  }
});

app.get('/api/beneficiarias', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome_completo as nome, cpf, contato1 as telefone, endereco, data_criacao as created_at, data_atualizacao as updated_at FROM beneficiarias ORDER BY data_criacao DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/beneficiarias', async (req, res) => {
  try {
    const { nome, cpf, telefone, endereco } = req.body;
    
    if (!nome || !cpf) {
      return res.status(400).json({ success: false, message: 'Nome e CPF obrigatorios' });
    }

    // Calcular idade aproximada baseada na data atual (se não for fornecida)
    const dataAtual = new Date();
    const idadeAproximada = 25; // Idade padrão se não for informada

    const result = await pool.query(
      'INSERT INTO beneficiarias (nome_completo, cpf, contato1, endereco, data_nascimento, idade, data_criacao, data_atualizacao) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING id, nome_completo as nome, cpf, contato1 as telefone, endereco, data_criacao as created_at, data_atualizacao as updated_at',
      [nome, cpf, telefone, endereco, new Date(dataAtual.getFullYear() - idadeAproximada, 0, 1), idadeAproximada]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log('Servidor rodando na porta ' + PORT);
  console.log('Health check: http://localhost:' + PORT + '/health');
});

module.exports = app;
