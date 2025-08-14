#!/bin/bash

# Inicia o serviço do PostgreSQL
sudo service postgresql start

# Espera o PostgreSQL iniciar
sleep 3

# Cria o usuário e banco de dados
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE move_db;"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE move_db TO postgres;"

echo "Configuração do PostgreSQL concluída!"
