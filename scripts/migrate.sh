#!/bin/bash

# ============================================================================
# Script de Migração PostgreSQL - Assist Move Assist
# Executa migrações de banco de dados de forma segura e controlada
# ============================================================================

set -e  # Parar em caso de erro
set -u  # Parar em caso de variável não definida

# Configurações
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/migrations"
ROLLBACK_DIR="$MIGRATIONS_DIR/rollback"
BACKUP_DIR="$PROJECT_ROOT/backups"
LOG_FILE="$PROJECT_ROOT/migration.log"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função de log
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Função para verificar pré-requisitos
check_prerequisites() {
    log "🔍 Verificando pré-requisitos..."
    
    # Verificar se DATABASE_URL está definida
    if [ -z "${DATABASE_URL:-}" ]; then
        error "DATABASE_URL não está definida"
        echo "Configure: export DATABASE_URL='sua_url_do_banco'"
        exit 1
    fi
    
    # Verificar se psql está disponível
    if ! command -v psql &> /dev/null; then
        error "psql não encontrado. Instale PostgreSQL client"
        exit 1
    fi
    
    # Verificar conectividade
    if ! psql "$DATABASE_URL" -c "SELECT 1;" &> /dev/null; then
        error "Não foi possível conectar ao banco de dados"
        exit 1
    fi
    
    # Verificar espaço em disco
    DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$DISK_USAGE" -gt 90 ]; then
        error "Espaço em disco insuficiente: ${DISK_USAGE}% usado"
        exit 1
    fi
    
    # Criar diretórios necessários
    mkdir -p "$BACKUP_DIR"
    mkdir -p "$ROLLBACK_DIR"
    
    success "Pré-requisitos verificados com sucesso"
}

# Função para criar backup
create_backup() {
    log "💾 Criando backup pré-migração..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/backup_pre_migration_$timestamp.sql"
    
    if pg_dump "$DATABASE_URL" > "$backup_file"; then
        success "Backup criado: $backup_file"
        
        # Verificar tamanho do backup
        local backup_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file")
        if [ "$backup_size" -lt 1000 ]; then
            error "Backup muito pequeno ($backup_size bytes) - possível problema"
            return 1
        fi
        
        echo "$backup_file" > "$BACKUP_DIR/.last_backup"
        log "Tamanho do backup: $(( backup_size / 1024 )) KB"
    else
        error "Falha ao criar backup"
        return 1
    fi
}

# Função para verificar se migração já foi executada
is_migration_executed() {
    local migration_name="$1"
    
    # Verificar se tabela de log existe
    if ! psql "$DATABASE_URL" -c "SELECT 1 FROM logs.migration_log LIMIT 1;" &> /dev/null; then
        return 1  # Tabela não existe, migração não foi executada
    fi
    
    # Verificar se migração específica já foi executada
    local count=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) FROM logs.migration_log 
        WHERE migration = '$migration_name' AND status = 'success';
    " | xargs)
    
    [ "$count" -gt 0 ]
}

# Função para executar uma migração
execute_migration() {
    local migration_file="$1"
    local migration_name=$(basename "$migration_file" .sql)
    
    log "▶️  Executando migração: $migration_name"
    
    # Verificar se já foi executada
    if is_migration_executed "$migration_name"; then
        warning "Migração $migration_name já foi executada - pulando"
        return 0
    fi
    
    # Verificar se arquivo existe
    if [ ! -f "$migration_file" ]; then
        error "Arquivo de migração não encontrado: $migration_file"
        return 1
    fi
    
    # Executar migração
    local start_time=$(date +%s)
    
    if psql "$DATABASE_URL" -f "$migration_file" 2>&1 | tee -a "$LOG_FILE"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        success "Migração $migration_name executada com sucesso em ${duration}s"
        
        # Registrar no log (se a tabela existir)
        psql "$DATABASE_URL" -c "
            INSERT INTO logs.migration_log (migration, status, executed_at, execution_time) 
            VALUES ('$migration_name', 'success', NOW(), INTERVAL '$duration seconds')
            ON CONFLICT DO NOTHING;
        " &> /dev/null || true
        
        return 0
    else
        error "Falha na migração: $migration_name"
        
        # Registrar falha no log (se possível)
        psql "$DATABASE_URL" -c "
            INSERT INTO logs.migration_log (migration, status, executed_at, error_message) 
            VALUES ('$migration_name', 'failed', NOW(), 'Erro durante execução')
            ON CONFLICT DO NOTHING;
        " &> /dev/null || true
        
        return 1
    fi
}

# Função para executar rollback
execute_rollback() {
    local migration_name="$1"
    local rollback_file="$ROLLBACK_DIR/${migration_name}.sql"
    
    log "🔄 Executando rollback: $migration_name"
    
    if [ ! -f "$rollback_file" ]; then
        error "Arquivo de rollback não encontrado: $rollback_file"
        return 1
    fi
    
    if psql "$DATABASE_URL" -f "$rollback_file"; then
        success "Rollback executado com sucesso: $migration_name"
        
        # Registrar rollback no log
        psql "$DATABASE_URL" -c "
            INSERT INTO logs.migration_log (migration, status, executed_at) 
            VALUES ('$migration_name', 'rollback', NOW());
        " &> /dev/null || true
        
        return 0
    else
        error "Falha no rollback: $migration_name"
        return 1
    fi
}

# Função para validar migração
validate_migration() {
    log "✅ Validando migração..."
    
    # Verificar tabelas essenciais
    local essential_tables=("profiles" "beneficiarias" "tarefas" "oficinas" "feed_posts")
    
    for table in "${essential_tables[@]}"; do
        local exists=$(psql "$DATABASE_URL" -t -c "
            SELECT EXISTS (
                SELECT 1 FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = '$table'
            );
        " | xargs)
        
        if [ "$exists" = "t" ]; then
            success "Tabela $table: OK"
        else
            error "Tabela $table: FALTANDO"
            return 1
        fi
    done
    
    # Verificar índices críticos
    local index_count=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
    " | xargs)
    
    if [ "$index_count" -gt 20 ]; then
        success "Índices criados: $index_count"
    else
        warning "Poucos índices encontrados: $index_count"
    fi
    
    # Verificar triggers de auditoria
    local trigger_count=$(psql "$DATABASE_URL" -t -c "
        SELECT COUNT(*) FROM information_schema.triggers 
        WHERE trigger_schema = 'public' AND trigger_name LIKE '%audit%';
    " | xargs)
    
    if [ "$trigger_count" -gt 0 ]; then
        success "Triggers de auditoria: $trigger_count"
    else
        warning "Nenhum trigger de auditoria encontrado"
    fi
    
    success "Validação concluída"
}

# Função para mostrar status das migrações
show_migration_status() {
    log "📊 Status das Migrações:"
    
    if psql "$DATABASE_URL" -c "SELECT 1 FROM logs.migration_log LIMIT 1;" &> /dev/null; then
        psql "$DATABASE_URL" -c "
            SELECT 
                migration,
                status,
                executed_at,
                COALESCE(execution_time, INTERVAL '0') as execution_time
            FROM logs.migration_log 
            ORDER BY executed_at DESC;
        "
    else
        warning "Tabela de log de migrações não encontrada"
    fi
}

# Função para executar todas as migrações
run_migrations() {
    log "🚀 Iniciando processo de migração..."
    
    # Verificar pré-requisitos
    check_prerequisites
    
    # Criar backup
    create_backup
    
    # Encontrar e executar migrações em ordem
    local migrations=($(find "$MIGRATIONS_DIR" -name "*.sql" -not -path "*/rollback/*" | sort))
    
    if [ ${#migrations[@]} -eq 0 ]; then
        warning "Nenhuma migração encontrada em $MIGRATIONS_DIR"
        return 0
    fi
    
    log "Encontradas ${#migrations[@]} migrações:"
    for migration in "${migrations[@]}"; do
        log "  - $(basename "$migration")"
    done
    
    # Executar migrações
    local failed_migrations=()
    
    for migration in "${migrations[@]}"; do
        if ! execute_migration "$migration"; then
            failed_migrations+=("$(basename "$migration" .sql)")
            error "Migração falhou: $(basename "$migration")"
            
            # Perguntar se deve continuar ou fazer rollback
            echo
            echo "Opções:"
            echo "1) Continuar com próxima migração"
            echo "2) Fazer rollback das migrações executadas"
            echo "3) Parar execução"
            read -p "Escolha (1-3): " choice
            
            case $choice in
                1)
                    warning "Continuando com próxima migração..."
                    continue
                    ;;
                2)
                    log "Iniciando rollback..."
                    rollback_migrations
                    return 1
                    ;;
                3)
                    error "Execução interrompida pelo usuário"
                    return 1
                    ;;
                *)
                    error "Opção inválida. Parando execução."
                    return 1
                    ;;
            esac
        fi
    done
    
    # Validar resultado
    validate_migration
    
    # Mostrar status final
    show_migration_status
    
    if [ ${#failed_migrations[@]} -eq 0 ]; then
        success "🎉 Todas as migrações executadas com sucesso!"
    else
        warning "⚠️  Algumas migrações falharam: ${failed_migrations[*]}"
    fi
}

# Função para fazer rollback de migrações
rollback_migrations() {
    log "🔄 Iniciando rollback de migrações..."
    
    # Obter lista de migrações executadas (em ordem reversa)
    local executed_migrations
    if psql "$DATABASE_URL" -c "SELECT 1 FROM logs.migration_log LIMIT 1;" &> /dev/null; then
        executed_migrations=($(psql "$DATABASE_URL" -t -c "
            SELECT migration FROM logs.migration_log 
            WHERE status = 'success' 
            ORDER BY executed_at DESC;
        " | xargs))
    else
        error "Não foi possível obter lista de migrações executadas"
        return 1
    fi
    
    if [ ${#executed_migrations[@]} -eq 0 ]; then
        warning "Nenhuma migração para rollback"
        return 0
    fi
    
    log "Migrações para rollback: ${executed_migrations[*]}"
    
    # Executar rollback em ordem reversa
    for migration in "${executed_migrations[@]}"; do
        execute_rollback "$migration"
    done
    
    success "Rollback concluído"
}

# Função para mostrar ajuda
show_help() {
    echo "Uso: $0 [comando]"
    echo
    echo "Comandos:"
    echo "  migrate     Executar todas as migrações pendentes"
    echo "  rollback    Fazer rollback de todas as migrações"
    echo "  status      Mostrar status das migrações"
    echo "  validate    Validar estado atual do banco"
    echo "  backup      Criar backup do banco"
    echo "  help        Mostrar esta ajuda"
    echo
    echo "Variáveis de ambiente:"
    echo "  DATABASE_URL    URL de conexão com o banco (obrigatória)"
    echo
    echo "Exemplos:"
    echo "  export DATABASE_URL='postgresql://user:pass@host:5432/db'"
    echo "  $0 migrate"
    echo "  $0 status"
}

# Função principal
main() {
    local command="${1:-migrate}"
    
    echo "============================================================================"
    echo "🗄️  Script de Migração PostgreSQL - Assist Move Assist"
    echo "============================================================================"
    echo
    
    case "$command" in
        "migrate")
            run_migrations
            ;;
        "rollback")
            rollback_migrations
            ;;
        "status")
            show_migration_status
            ;;
        "validate")
            validate_migration
            ;;
        "backup")
            check_prerequisites
            create_backup
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            error "Comando desconhecido: $command"
            show_help
            exit 1
            ;;
    esac
}

# Verificar se script está sendo executado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
