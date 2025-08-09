#!/bin/bash

# Script de monitoramento e health check
# Para verificar se todos os serviços estão funcionando

set -e

DOMAIN="movemarias.squadsolucoes.com.br"
LOG_FILE="/var/log/assist-move-assist/health-check.log"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | sudo tee -a $LOG_FILE
}

echo "🔍 Health Check - Assist Move Assist"
echo "📅 $(date)"
echo "🌐 Domínio: $DOMAIN"
echo ""

# Verificar serviços systemd
echo "=== SERVIÇOS SYSTEMD ==="
services=("nginx" "assist-move-assist" "postgresql" "fail2ban")

for service in "${services[@]}"; do
    if systemctl is-active --quiet $service; then
        echo "✅ $service: ATIVO"
        log "OK: $service está ativo"
    else
        echo "❌ $service: INATIVO"
        log "ERRO: $service está inativo"
    fi
done

echo ""

# Verificar conectividade de rede
echo "=== CONECTIVIDADE ==="

# Test HTTP
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN | grep -q "200"; then
    echo "✅ HTTPS: Respondendo (200)"
    log "OK: Site HTTPS respondendo"
else
    echo "❌ HTTPS: Não respondendo"
    log "ERRO: Site HTTPS não está respondendo"
fi

# Test API
if curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/health | grep -q "200"; then
    echo "✅ API Health: OK"
    log "OK: API health check respondendo"
else
    echo "❌ API Health: Falha"
    log "ERRO: API health check falhou"
fi

# Test Database
echo ""
echo "=== BANCO DE DADOS ==="
if sudo -u postgres psql -c "SELECT 1;" assist_move_assist >/dev/null 2>&1; then
    echo "✅ PostgreSQL: Conectando"
    log "OK: PostgreSQL conectando"
else
    echo "❌ PostgreSQL: Falha na conexão"
    log "ERRO: PostgreSQL falha na conexão"
fi

# Verificar espaço em disco
echo ""
echo "=== RECURSOS DO SISTEMA ==="
disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $disk_usage -lt 80 ]; then
    echo "✅ Disco: ${disk_usage}% usado"
    log "OK: Uso de disco em ${disk_usage}%"
else
    echo "⚠️ Disco: ${disk_usage}% usado (alto)"
    log "AVISO: Uso de disco alto - ${disk_usage}%"
fi

# Verificar memória
memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $memory_usage -lt 80 ]; then
    echo "✅ Memória: ${memory_usage}% usada"
    log "OK: Uso de memória em ${memory_usage}%"
else
    echo "⚠️ Memória: ${memory_usage}% usada (alto)"
    log "AVISO: Uso de memória alto - ${memory_usage}%"
fi

# Verificar certificado SSL
echo ""
echo "=== CERTIFICADO SSL ==="
ssl_expiry=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
ssl_expiry_epoch=$(date -d "$ssl_expiry" +%s)
current_epoch=$(date +%s)
days_until_expiry=$(( (ssl_expiry_epoch - current_epoch) / 86400 ))

if [ $days_until_expiry -gt 30 ]; then
    echo "✅ SSL: Válido por $days_until_expiry dias"
    log "OK: SSL válido por $days_until_expiry dias"
elif [ $days_until_expiry -gt 7 ]; then
    echo "⚠️ SSL: Expira em $days_until_expiry dias"
    log "AVISO: SSL expira em $days_until_expiry dias"
else
    echo "❌ SSL: EXPIRA EM $days_until_expiry DIAS!"
    log "CRÍTICO: SSL expira em $days_until_expiry dias"
fi

# Verificar logs de erro recentes
echo ""
echo "=== LOGS DE ERRO RECENTES ==="
nginx_errors=$(sudo tail -n 100 /var/log/nginx/assist-move-assist-error.log 2>/dev/null | wc -l)
backend_errors=$(sudo journalctl -u assist-move-assist --since "1 hour ago" | grep -i error | wc -l)

echo "📝 Nginx erros (última hora): $nginx_errors"
echo "📝 Backend erros (última hora): $backend_errors"

if [ $nginx_errors -gt 10 ] || [ $backend_errors -gt 5 ]; then
    log "AVISO: Muitos erros detectados - Nginx: $nginx_errors, Backend: $backend_errors"
fi

# Verificar processos
echo ""
echo "=== PROCESSOS ==="
node_processes=$(pgrep -f "node.*assist" | wc -l)
nginx_processes=$(pgrep nginx | wc -l)

echo "🟢 Node.js processes: $node_processes"
echo "🟢 Nginx processes: $nginx_processes"

# Verificar conexões ativas
echo ""
echo "=== CONEXÕES ATIVAS ==="
http_connections=$(netstat -an | grep :443 | grep ESTABLISHED | wc -l)
echo "🌐 Conexões HTTPS ativas: $http_connections"

# Backup check
echo ""
echo "=== BACKUPS ==="
backup_count=$(find /var/backups/assist-move-assist -name "*.sql" -mtime -1 | wc -l)
if [ $backup_count -gt 0 ]; then
    echo "✅ Backup: Executado nas últimas 24h"
    log "OK: Backup executado nas últimas 24h"
else
    echo "❌ Backup: Não executado nas últimas 24h"
    log "ERRO: Backup não executado nas últimas 24h"
fi

echo ""
echo "=== RESUMO ==="

# Calcular score geral
total_checks=10
passed_checks=0

systemctl is-active --quiet nginx && ((passed_checks++))
systemctl is-active --quiet assist-move-assist && ((passed_checks++))
systemctl is-active --quiet postgresql && ((passed_checks++))
curl -s -o /dev/null https://$DOMAIN && ((passed_checks++))
curl -s -o /dev/null https://$DOMAIN/health && ((passed_checks++))
[ $disk_usage -lt 80 ] && ((passed_checks++))
[ $memory_usage -lt 80 ] && ((passed_checks++))
[ $days_until_expiry -gt 7 ] && ((passed_checks++))
[ $backup_count -gt 0 ] && ((passed_checks++))
[ $nginx_errors -lt 10 ] && [ $backend_errors -lt 5 ] && ((passed_checks++))

score=$((passed_checks * 100 / total_checks))

if [ $score -ge 90 ]; then
    status="🟢 EXCELENTE"
elif [ $score -ge 70 ]; then
    status="🟡 BOM"
elif [ $score -ge 50 ]; then
    status="🟠 ATENÇÃO"
else
    status="🔴 CRÍTICO"
fi

echo "📊 Score de saúde: $score% - $status"
log "Health check concluído - Score: $score%"

echo ""
echo "📅 Próximo health check automático em 1 hora"
echo "🔍 Para monitoring em tempo real: watch -n 30 'sudo /usr/local/bin/assist-health-check.sh'"
