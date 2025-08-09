#!/bin/bash

# Deploy script completo para produção - Assist Move Assist
# Sistema: Ubuntu 24.04 LTS
# Domínio: movemarias.squadsolucoes.com.br
# Admin: bruno@move.com

set -e  # Parar execução em caso de erro

echo "🚀 Iniciando deploy completo do Assist Move Assist..."
echo "📅 $(date)"
echo "🌐 Domínio: movemarias.squadsolucoes.com.br"
echo ""

# Variáveis de configuração
DOMAIN="movemarias.squadsolucoes.com.br"
APP_DIR="/var/www/assist-move-assist"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
NGINX_CONFIG="/etc/nginx/sites-available/assist-move-assist"
DB_NAME="assist_move_assist"
DB_USER="assist_user"
DB_PASSWORD=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 64)
ADMIN_EMAIL="bruno@move.com"
ADMIN_PASSWORD="15002031"
ADMIN_NAME="Bruno Administrador"

echo "🔧 Atualizando sistema Ubuntu 24.04..."
sudo apt update && sudo apt upgrade -y

echo "📦 Instalando dependências do sistema..."
sudo apt install -y \
    curl \
    wget \
    git \
    nginx \
    postgresql \
    postgresql-contrib \
    certbot \
    python3-certbot-nginx \
    ufw \
    fail2ban \
    htop \
    nano \
    unzip

echo "🟢 Instalando Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "📊 Verificando versões instaladas..."
node --version
npm --version
psql --version
nginx -v

echo "🔒 Configurando firewall UFW..."
sudo ufw --force reset
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (apenas local)
sudo ufw --force enable

echo "🔐 Configurando Fail2Ban..."
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

echo "🗄️ Configurando PostgreSQL..."
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar usuário e banco PostgreSQL
sudo -u postgres psql << EOF
CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
CREATE DATABASE $DB_NAME OWNER $DB_USER;
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER USER $DB_USER CREATEDB;
\q
EOF

echo "✅ PostgreSQL configurado: banco '$DB_NAME', usuário '$DB_USER'"

echo "📁 Criando estrutura de diretórios..."
sudo mkdir -p $APP_DIR
sudo mkdir -p $BACKEND_DIR
sudo mkdir -p $FRONTEND_DIR
sudo mkdir -p /var/log/assist-move-assist
sudo chown -R $USER:$USER $APP_DIR
sudo chown -R www-data:www-data /var/log/assist-move-assist

echo "📥 Clonando repositório..."
cd /tmp
if [ -d "assist-move-assist" ]; then
    rm -rf assist-move-assist
fi
git clone https://github.com/brunonatanaelsr/assist-move-assist.git
cd assist-move-assist

echo "🔧 Configurando backend..."
cp -r backend/* $BACKEND_DIR/
cd $BACKEND_DIR

# Instalar dependências do backend
npm install --production

# Criar arquivo .env de produção
cat > .env << EOF
NODE_ENV=production
PORT=3001
HOST=0.0.0.0

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=24h

# CORS
CORS_ORIGIN=https://$DOMAIN

# Logs
LOG_LEVEL=info

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

# Email (configurar depois se necessário)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@$DOMAIN

# URLs
FRONTEND_URL=https://$DOMAIN
FRONTEND_DOMAIN=$DOMAIN

# Segurança
BCRYPT_ROUNDS=12
SESSION_SECRET=$(openssl rand -base64 32)
EOF

echo "📊 Executando migrações do banco..."
# Executar migrações SQL
cd /tmp/assist-move-assist
psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/001_initial_schema.sql
psql -h localhost -U $DB_USER -d $DB_NAME -f migrations/002_audit_system.sql

echo "👤 Criando usuário super administrador..."
cd $BACKEND_DIR

# Script para criar admin
cat > create_admin.js << 'EOF'
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
    
    const result = await pool.query(`
      INSERT INTO profiles (
        id,
        email,
        password_hash,
        nome_completo,
        role,
        active,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        $1,
        $2,
        $3,
        'admin',
        true,
        NOW(),
        NOW()
      ) ON CONFLICT (email) 
      DO UPDATE SET 
        password_hash = $2,
        nome_completo = $3,
        role = 'admin',
        active = true,
        updated_at = NOW()
      RETURNING id, email, nome_completo, role;
    `, [process.env.ADMIN_EMAIL, hashedPassword, process.env.ADMIN_NAME]);
    
    console.log('✅ Super administrador criado/atualizado:', result.rows[0]);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar administrador:', error);
    process.exit(1);
  }
}

createAdmin();
EOF

# Executar criação do admin
ADMIN_EMAIL=$ADMIN_EMAIL ADMIN_PASSWORD=$ADMIN_PASSWORD ADMIN_NAME="$ADMIN_NAME" node create_admin.js
rm create_admin.js

echo "🔨 Compilando backend..."
npm run build

echo "🎨 Configurando frontend..."
cd /tmp/assist-move-assist
cp -r src $FRONTEND_DIR/
cp -r public $FRONTEND_DIR/
cp package.json $FRONTEND_DIR/
cp vite.config.ts $FRONTEND_DIR/
cp tsconfig.json $FRONTEND_DIR/
cp tailwind.config.ts $FRONTEND_DIR/
cp postcss.config.js $FRONTEND_DIR/
cp components.json $FRONTEND_DIR/
cp index.html $FRONTEND_DIR/

cd $FRONTEND_DIR

# Atualizar configurações do frontend para produção
cat > .env.production << EOF
VITE_API_URL=https://$DOMAIN/api
VITE_WS_URL=wss://$DOMAIN/ws
VITE_APP_URL=https://$DOMAIN
EOF

# Instalar dependências e buildar
npm install
npm run build

echo "🌐 Configurando Nginx..."
sudo tee $NGINX_CONFIG > /dev/null << EOF
# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=login:10m rate=5r/m;

# Upstream para backend
upstream backend {
    server 127.0.0.1:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Redirect HTTP to HTTPS
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;
    
    # SSL será configurado pelo Certbot
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' wss://$DOMAIN;" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Logs
    access_log /var/log/nginx/assist-move-assist-access.log;
    error_log /var/log/nginx/assist-move-assist-error.log;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;
    
    # Root para frontend
    root $FRONTEND_DIR/dist;
    index index.html;
    
    # Frontend - SPA routing
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API Backend
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://backend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # WebSocket
    location /ws {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Auth endpoints with stricter rate limiting
    location /api/auth/login {
        limit_req zone=login burst=3 nodelay;
        proxy_pass http://backend/auth/login;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Block access to sensitive files
    location ~ /\. {
        deny all;
    }
    
    location ~ \.(env|log)\$ {
        deny all;
    }
}
EOF

# Ativar site
sudo ln -sf $NGINX_CONFIG /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

echo "🔒 Configurando SSL com Let's Encrypt..."
sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

echo "🔄 Configurando renovação automática SSL..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet && systemctl reload nginx"; } | sudo crontab -

echo "⚙️ Criando serviço systemd para backend..."
sudo tee /etc/systemd/system/assist-move-assist.service > /dev/null << EOF
[Unit]
Description=Assist Move Assist Backend
After=network.target postgresql.service
Wants=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=$BACKEND_DIR
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/app.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=assist-move-assist

# Security
NoNewPrivileges=yes
PrivateTmp=yes
ProtectSystem=strict
ReadWritePaths=$BACKEND_DIR /var/log/assist-move-assist

[Install]
WantedBy=multi-user.target
EOF

echo "🔄 Configurando logrotate..."
sudo tee /etc/logrotate.d/assist-move-assist > /dev/null << EOF
/var/log/assist-move-assist/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    copytruncate
}

/var/log/nginx/assist-move-assist-*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    sharedscripts
    postrotate
        systemctl reload nginx
    endscript
}
EOF

echo "🎯 Configurando permissões finais..."
sudo chown -R www-data:www-data $APP_DIR
sudo chmod -R 755 $APP_DIR
sudo chmod 600 $BACKEND_DIR/.env

echo "🚀 Iniciando serviços..."
sudo systemctl daemon-reload
sudo systemctl enable assist-move-assist
sudo systemctl start assist-move-assist
sudo systemctl enable nginx
sudo systemctl restart nginx

echo "📊 Criando script de monitoramento..."
sudo tee /usr/local/bin/assist-status.sh > /dev/null << 'EOF'
#!/bin/bash
echo "=== Assist Move Assist - Status do Sistema ==="
echo "Data: $(date)"
echo ""

echo "🌐 Nginx:"
systemctl is-active nginx
echo ""

echo "⚙️ Backend:"
systemctl is-active assist-move-assist
echo ""

echo "🗄️ PostgreSQL:"
systemctl is-active postgresql
echo ""

echo "🔒 SSL Certificate:"
certbot certificates | grep -A 1 "movemarias.squadsolucoes.com.br" || echo "Certificado não encontrado"
echo ""

echo "💾 Espaço em disco:"
df -h / | tail -n 1
echo ""

echo "🔄 Logs recentes (últimas 5 linhas):"
echo "--- Backend ---"
journalctl -u assist-move-assist --no-pager -n 5
echo ""
echo "--- Nginx ---"
tail -n 5 /var/log/nginx/assist-move-assist-error.log 2>/dev/null || echo "Sem erros no Nginx"
EOF

sudo chmod +x /usr/local/bin/assist-status.sh

echo "📝 Criando script de backup..."
sudo tee /usr/local/bin/assist-backup.sh > /dev/null << EOF
#!/bin/bash
BACKUP_DIR="/var/backups/assist-move-assist"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

echo "🗄️ Backup do banco PostgreSQL..."
sudo -u postgres pg_dump $DB_NAME > \$BACKUP_DIR/database_\$DATE.sql

echo "📁 Backup dos arquivos..."
tar -czf \$BACKUP_DIR/files_\$DATE.tar.gz $APP_DIR

echo "🧹 Limpando backups antigos (mantendo últimos 7 dias)..."
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "✅ Backup concluído: \$BACKUP_DIR"
EOF

sudo chmod +x /usr/local/bin/assist-backup.sh

# Configurar backup diário
sudo crontab -l 2>/dev/null | { cat; echo "0 2 * * * /usr/local/bin/assist-backup.sh"; } | sudo crontab -

echo "🔍 Verificando status dos serviços..."
sleep 5

echo ""
echo "=== STATUS FINAL ==="
echo "🌐 Nginx: $(systemctl is-active nginx)"
echo "⚙️ Backend: $(systemctl is-active assist-move-assist)"
echo "🗄️ PostgreSQL: $(systemctl is-active postgresql)"
echo "🔒 UFW: $(sudo ufw status | head -1)"
echo ""

echo "📋 URLs de acesso:"
echo "🌐 Site: https://$DOMAIN"
echo "🔑 API: https://$DOMAIN/api"
echo "📊 Health: https://$DOMAIN/health"
echo ""

echo "👤 Credenciais do Super Administrador:"
echo "📧 Email: $ADMIN_EMAIL"
echo "🔑 Senha: $ADMIN_PASSWORD"
echo ""

echo "🔧 Comandos úteis:"
echo "📊 Status: sudo /usr/local/bin/assist-status.sh"
echo "💾 Backup: sudo /usr/local/bin/assist-backup.sh"
echo "📝 Logs Backend: journalctl -u assist-move-assist -f"
echo "📝 Logs Nginx: tail -f /var/log/nginx/assist-move-assist-error.log"
echo "🔄 Restart Backend: sudo systemctl restart assist-move-assist"
echo "🔄 Restart Nginx: sudo systemctl restart nginx"
echo ""

echo "🎉 Deploy completo finalizado com sucesso!"
echo "📅 $(date)"
echo "🌐 Acesse: https://$DOMAIN"

# Limpar arquivos temporários
cd /
rm -rf /tmp/assist-move-assist

echo ""
echo "⚠️  IMPORTANTE: Anote as credenciais do banco PostgreSQL:"
echo "🗄️  Usuário: $DB_USER"
echo "🔑  Senha: $DB_PASSWORD"
echo "📝  Banco: $DB_NAME"
echo ""
echo "🔐 JWT Secret foi gerado automaticamente e está em $BACKEND_DIR/.env"
echo ""
echo "✅ Sistema pronto para uso!"
