#!/bin/bash

# Deploy Rápido VPS - Assist Move Assist
echo "🚀 Iniciando Deploy na VPS..."
echo "VPS: 145.79.6.36"
echo "Domínio: movemarias.squadsolucoes.com.br"
echo ""

# Executar deploy automático
cd "$(dirname "$0")"
./deploy-vps-auto.sh

echo ""
echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://movemarias.squadsolucoes.com.br"
echo "👤 Login: bruno@move.com / 15002031"
