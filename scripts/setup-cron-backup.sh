#!/bin/bash

# Script de configuração do cron para backup automático
# Move Marias - Sistema de Backup

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}==========================================="
echo -e "CONFIGURAÇÃO DE BACKUP AUTOMÁTICO"
echo -e "Move Marias - Sistema de Backup"
echo -e "===========================================${NC}"

# Verificar se está executando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}Este script deve ser executado como root (sudo)${NC}"
    exit 1
fi

# Caminho para o script de backup
BACKUP_SCRIPT="/var/www/movemarias/scripts/backup-database.sh"
CRON_FILE="/etc/cron.d/movemarias-backup"
LOG_DIR="/var/log/movemarias"

echo -e "${YELLOW}Configurando backup automático...${NC}"

# Criar diretório de logs se não existir
mkdir -p $LOG_DIR
chown www-data:www-data $LOG_DIR

# Criar arquivo de cron
cat > $CRON_FILE << 'EOF'
# Backup automático do Move Marias
# Executado todos os dias às 2:00 AM
# Formato: min hora dia mês dia_semana usuário comando

# Backup diário às 2:00 AM
0 2 * * * root /bin/bash /var/www/movemarias/scripts/backup-database.sh >> /var/log/movemarias/backup-cron.log 2>&1

# Backup semanal completo aos domingos às 3:00 AM
0 3 * * 0 root /bin/bash /var/www/movemarias/scripts/backup-database.sh >> /var/log/movemarias/backup-weekly.log 2>&1

# Limpeza de logs antigos - todo primeiro dia do mês às 4:00 AM
0 4 1 * * root find /var/log/movemarias -name "*.log" -mtime +30 -delete
EOF

# Definir permissões corretas
chmod 644 $CRON_FILE

echo -e "${GREEN}✅ Arquivo de cron criado: $CRON_FILE${NC}"

# Mostrar conteúdo do cron
echo -e "\n${BLUE}Configuração do cron:${NC}"
cat $CRON_FILE

# Reiniciar serviço cron
echo -e "\n${YELLOW}Reiniciando serviço cron...${NC}"
systemctl restart cron
systemctl enable cron

if systemctl is-active --quiet cron; then
    echo -e "${GREEN}✅ Serviço cron está ativo${NC}"
else
    echo -e "${RED}❌ Erro: Serviço cron não está ativo${NC}"
    exit 1
fi

# Criar script de teste de backup
cat > /tmp/test-backup.sh << 'EOF'
#!/bin/bash
echo "Testando script de backup..."
cd /var/www/movemarias
export POSTGRES_DB=movemarias
export POSTGRES_USER=movemarias_user
export POSTGRES_PASSWORD=MoveMarias2024!Strong#Secure
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432

./scripts/backup-database.sh
EOF

chmod +x /tmp/test-backup.sh

echo -e "\n${BLUE}Configurações aplicadas:${NC}"
echo -e "• Backup diário às 2:00 AM"
echo -e "• Backup semanal aos domingos às 3:00 AM"
echo -e "• Limpeza automática de logs antigos"
echo -e "• Logs salvos em: $LOG_DIR"

echo -e "\n${YELLOW}Para testar o backup manualmente:${NC}"
echo -e "sudo /tmp/test-backup.sh"

echo -e "\n${YELLOW}Para verificar logs do cron:${NC}"
echo -e "tail -f /var/log/movemarias/backup-cron.log"

echo -e "\n${YELLOW}Para verificar status do cron:${NC}"
echo -e "systemctl status cron"

echo -e "\n${GREEN}✅ Configuração de backup automático concluída!${NC}"
