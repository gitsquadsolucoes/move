#!/bin/bash

# Script de Backup Automático para Move Marias
# Compatível com Ubuntu 24.04 LTS + PostgreSQL 16

# Configurações
BACKUP_DIR="/var/backups/movemarias"
DB_NAME="${POSTGRES_DB:-movemarias}"
DB_USER="${POSTGRES_USER:-movemarias_user}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILENAME="${BACKUP_DIR}/movemarias_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"
RETENTION_DAYS=30

# Cores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Criar diretório de backup se não existir
mkdir -p $BACKUP_DIR

# Função de log com timestamp
log() {
    local level=$1
    local message=$2
    local timestamp=$(date +'%Y-%m-%d %H:%M:%S')
    
    echo -e "[$timestamp] $level: $message" | tee -a $LOG_FILE
    
    case $level in
        "ERROR")
            echo -e "${RED}[$timestamp] ERROR: $message${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[$timestamp] SUCCESS: $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}[$timestamp] WARNING: $message${NC}"
            ;;
        *)
            echo "[$timestamp] INFO: $message"
            ;;
    esac
}

# Verificar dependências
check_dependencies() {
    log "INFO" "Verificando dependências..."
    
    if ! command -v pg_dump &> /dev/null; then
        log "ERROR" "pg_dump não encontrado. Instale o postgresql-client"
        exit 1
    fi
    
    if ! command -v gzip &> /dev/null; then
        log "ERROR" "gzip não encontrado"
        exit 1
    fi
    
    log "SUCCESS" "Todas as dependências encontradas"
}

# Verificar conectividade com o banco
test_db_connection() {
    log "INFO" "Testando conexão com o banco de dados..."
    
    if PGPASSWORD="${POSTGRES_PASSWORD}" psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        log "SUCCESS" "Conexão com o banco estabelecida"
        return 0
    else
        log "ERROR" "Não foi possível conectar ao banco de dados"
        log "ERROR" "Host: $DB_HOST, Port: $DB_PORT, User: $DB_USER, DB: $DB_NAME"
        return 1
    fi
}

# Realizar backup do banco de dados
backup_database() {
    log "INFO" "Iniciando backup do banco $DB_NAME..."
    
    # Backup completo com dados e estrutura
    if PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
        -h $DB_HOST \
        -p $DB_PORT \
        -U $DB_USER \
        -d $DB_NAME \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=plain \
        -f $FILENAME 2>> $LOG_FILE; then
        
        log "SUCCESS" "Backup do banco concluído: $FILENAME"
        
        # Verificar se o arquivo foi criado e não está vazio
        if [ -s "$FILENAME" ]; then
            local file_size=$(du -h "$FILENAME" | cut -f1)
            log "INFO" "Tamanho do backup: $file_size"
        else
            log "ERROR" "Arquivo de backup está vazio"
            return 1
        fi
        
        return 0
    else
        log "ERROR" "Falha ao realizar backup do banco"
        return 1
    fi
}

# Backup dos arquivos da aplicação
backup_application() {
    log "INFO" "Iniciando backup dos arquivos da aplicação..."
    
    local app_dir="/var/www/movemarias"
    local app_backup_file="${BACKUP_DIR}/app_files_${TIMESTAMP}.tar.gz"
    
    if [ -d "$app_dir" ]; then
        if tar -czf $app_backup_file -C /var/www movemarias \
            --exclude="movemarias/node_modules" \
            --exclude="movemarias/logs" \
            --exclude="movemarias/.git" \
            --exclude="movemarias/build" \
            --exclude="movemarias/dist" 2>> $LOG_FILE; then
            
            log "SUCCESS" "Backup dos arquivos concluído: $app_backup_file"
            local file_size=$(du -h "$app_backup_file" | cut -f1)
            log "INFO" "Tamanho do backup de arquivos: $file_size"
        else
            log "WARNING" "Falha ao fazer backup dos arquivos da aplicação"
        fi
    else
        log "WARNING" "Diretório da aplicação não encontrado: $app_dir"
    fi
}

# Comprimir backup do banco
compress_backup() {
    log "INFO" "Comprimindo backup do banco..."
    
    if gzip "$FILENAME"; then
        log "SUCCESS" "Backup comprimido: ${FILENAME}.gz"
        local compressed_size=$(du -h "${FILENAME}.gz" | cut -f1)
        log "INFO" "Tamanho comprimido: $compressed_size"
    else
        log "ERROR" "Falha ao comprimir backup"
        return 1
    fi
}

# Limpar backups antigos
cleanup_old_backups() {
    log "INFO" "Removendo backups com mais de $RETENTION_DAYS dias..."
    
    local deleted_count=0
    
    # Limpar backups do banco
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted_count=$((deleted_count + 1))
        log "INFO" "Removido: $(basename "$file")"
    done < <(find $BACKUP_DIR -name "movemarias_*.sql.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    # Limpar backups de arquivos
    while IFS= read -r -d '' file; do
        rm "$file"
        deleted_count=$((deleted_count + 1))
        log "INFO" "Removido: $(basename "$file")"
    done < <(find $BACKUP_DIR -name "app_files_*.tar.gz" -type f -mtime +$RETENTION_DAYS -print0)
    
    if [ $deleted_count -gt 0 ]; then
        log "SUCCESS" "$deleted_count backups antigos removidos"
    else
        log "INFO" "Nenhum backup antigo para remover"
    fi
}

# Verificar espaço em disco
check_disk_space() {
    log "INFO" "Verificando espaço em disco..."
    
    local disk_usage=$(df -h $BACKUP_DIR | tail -1 | awk '{print $5}' | sed 's/%//')
    local available_space=$(df -h $BACKUP_DIR | tail -1 | awk '{print $4}')
    
    log "INFO" "Uso do disco: ${disk_usage}%"
    log "INFO" "Espaço disponível: $available_space"
    
    if [ $disk_usage -gt 90 ]; then
        log "ERROR" "CRÍTICO: Espaço em disco acima de 90% ($disk_usage%)!"
        return 1
    elif [ $disk_usage -gt 85 ]; then
        log "WARNING" "ALERTA: Espaço em disco acima de 85% ($disk_usage%)!"
    else
        log "SUCCESS" "Espaço em disco OK (${disk_usage}%)"
    fi
    
    return 0
}

# Enviar notificação (via email se configurado)
send_notification() {
    local status=$1
    local message=$2
    
    # Se o comando 'mail' estiver disponível e configurado
    if command -v mail &> /dev/null && [ -n "$ADMIN_EMAIL" ]; then
        echo "$message" | mail -s "Move Marias Backup - $status" $ADMIN_EMAIL
        log "INFO" "Notificação enviada para $ADMIN_EMAIL"
    fi
}

# Gerar relatório de backup
generate_report() {
    local status=$1
    
    log "INFO" "Gerando relatório de backup..."
    
    local report_file="${BACKUP_DIR}/backup_report_${TIMESTAMP}.txt"
    
    {
        echo "RELATÓRIO DE BACKUP - MOVE MARIAS"
        echo "=================================="
        echo "Data/Hora: $(date)"
        echo "Status: $status"
        echo "Banco: $DB_NAME"
        echo "Arquivo: ${FILENAME}.gz (se bem-sucedido)"
        echo ""
        echo "ESTATÍSTICAS:"
        echo "- Backups no diretório: $(ls -1 ${BACKUP_DIR}/movemarias_*.sql.gz 2>/dev/null | wc -l)"
        echo "- Espaço total usado: $(du -sh $BACKUP_DIR | cut -f1)"
        echo "- Espaço disponível: $(df -h $BACKUP_DIR | tail -1 | awk '{print $4}')"
        echo ""
        echo "LOGS DO BACKUP:"
        tail -50 $LOG_FILE
    } > $report_file
    
    log "INFO" "Relatório salvo em: $report_file"
}

# Função principal
main() {
    log "INFO" "==========================================="
    log "INFO" "INICIANDO BACKUP - MOVE MARIAS"
    log "INFO" "==========================================="
    
    # Verificar dependências
    check_dependencies
    
    # Testar conexão
    if ! test_db_connection; then
        log "ERROR" "Falha na conexão com o banco. Abortando backup."
        generate_report "FALHOU"
        send_notification "ERRO" "Backup falhou: Não foi possível conectar ao banco"
        exit 1
    fi
    
    # Verificar espaço em disco
    if ! check_disk_space; then
        log "ERROR" "Espaço em disco insuficiente. Abortando backup."
        generate_report "FALHOU"
        send_notification "ERRO" "Backup falhou: Espaço em disco insuficiente"
        exit 1
    fi
    
    # Realizar backup do banco
    if backup_database; then
        # Comprimir backup
        if compress_backup; then
            log "SUCCESS" "Backup do banco concluído com sucesso"
        else
            log "ERROR" "Falha na compressão do backup"
            generate_report "PARCIAL"
            exit 1
        fi
    else
        log "ERROR" "Falha no backup do banco"
        generate_report "FALHOU"
        send_notification "ERRO" "Backup falhou: Erro no backup do banco"
        exit 1
    fi
    
    # Backup dos arquivos (não crítico)
    backup_application
    
    # Limpar backups antigos
    cleanup_old_backups
    
    # Verificar espaço final
    check_disk_space
    
    # Gerar relatório
    generate_report "SUCESSO"
    
    log "SUCCESS" "==========================================="
    log "SUCCESS" "BACKUP CONCLUÍDO COM SUCESSO!"
    log "SUCCESS" "==========================================="
    
    # Enviar notificação de sucesso
    send_notification "SUCESSO" "Backup do Move Marias concluído com sucesso em $(date)"
}

# Executar função principal
main "$@"
