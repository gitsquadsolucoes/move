# 🚀 Deploy Automático VPS - Assist Move Assist

## Scripts de Deploy

### 1. Deploy Completo Automatizado
```bash
./scripts/deploy-vps-auto.sh
```

**O que faz:**
- Conecta na VPS via SSH automaticamente
- Instala todas as dependências (Node.js, PostgreSQL, Nginx, SSL)
- Configura banco de dados PostgreSQL
- Faz deploy do backend completo
- Configura SSL com Let's Encrypt
- Cria usuários superadmin e admin
- Configura firewall e segurança
- Testa tudo automaticamente

### 2. Deploy Rápido
```bash
./scripts/deploy-now.sh
```

## Informações da VPS

- **IP:** 145.79.6.36
- **Usuário:** root
- **Senha:** AGzzcso1@1500
- **Domínio:** movemarias.squadsolucoes.com.br

## Credenciais do Sistema

### Superadmin
- **Email:** bruno@move.com
- **Senha:** 15002031

### Admin
- **Email:** admin@movemarias.com
- **Senha:** movemarias123

## URLs de Acesso

- **Sistema:** https://movemarias.squadsolucoes.com.br
- **API:** https://movemarias.squadsolucoes.com.br/api
- **Health Check:** https://movemarias.squadsolucoes.com.br/health

## Comandos Úteis na VPS

```bash
# Conectar na VPS
ssh root@145.79.6.36

# Status dos serviços
systemctl status nginx postgresql
pm2 status

# Logs do backend
pm2 logs movemarias-backend

# Reiniciar serviços
systemctl restart nginx postgresql
pm2 restart movemarias-backend

# Verificar banco
sudo -u postgres psql -d movemarias -c "SELECT * FROM usuarios;"
```

## Pré-requisitos

O script instala automaticamente o `sshpass`:

- **Linux:** `sudo apt-get install sshpass`
- **macOS:** `brew install hudochenkov/sshpass/sshpass`

## Como Usar

1. **Execute o deploy:**
   ```bash
   ./scripts/deploy-now.sh
   ```

2. **Aguarde a conclusão** (processo leva cerca de 10-15 minutos)

3. **Acesse o sistema:**
   ```
   https://movemarias.squadsolucoes.com.br
   ```

4. **Faça login com:**
   - Email: bruno@move.com
   - Senha: 15002031

## Resolução de Problemas

### Script não executa
```bash
chmod +x scripts/deploy-vps-auto.sh scripts/deploy-now.sh
```

### sshpass não encontrado
```bash
# Linux
sudo apt-get install sshpass

# macOS
brew install hudochenkov/sshpass/sshpass
```

### Erro de conexão SSH
- Verificar se a VPS está online
- Confirmar IP e credenciais
- Testar conexão manual: `ssh root@145.79.6.36`

### Sistema não carrega
```bash
# Conectar na VPS e verificar serviços
ssh root@145.79.6.36
systemctl status nginx postgresql
pm2 status
```

## Arquitetura Implantada

- **Frontend:** Nginx (proxy reverso)
- **Backend:** Node.js Express (PM2)
- **Banco:** PostgreSQL
- **SSL:** Let's Encrypt
- **Firewall:** UFW
- **Domínio:** movemarias.squadsolucoes.com.br

## Segurança

- Rate limiting (5 tentativas/15min)
- Headers de segurança (Helmet)
- Firewall configurado
- SSL/HTTPS obrigatório
- Senhas com bcrypt
- Autenticação JWT

---

**🎯 Resultado:** Sistema completo funcionando em produção com um único comando!
