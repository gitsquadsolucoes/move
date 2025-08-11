-- ============================================================================
-- Schema PostgreSQL Puro - Assist Move Assist
-- Migração completa do Supabase para PostgreSQL standalone
-- Data: Agosto 2025
-- ============================================================================

BEGIN;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA: usuarios (Autenticação local)
-- ============================================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    papel VARCHAR(50) DEFAULT 'admin' CHECK (papel IN ('admin', 'superadmin', 'user')),
    ativo BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMPTZ,
    tentativas_login INTEGER DEFAULT 0,
    bloqueado_ate TIMESTAMPTZ,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_ativo ON usuarios(ativo);
CREATE INDEX IF NOT EXISTS idx_usuarios_papel ON usuarios(papel);

-- ============================================================================
-- TABELA: beneficiarias
-- ============================================================================
CREATE TABLE IF NOT EXISTS beneficiarias (
    id SERIAL PRIMARY KEY,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    orgao_emissor_rg VARCHAR(50),
    data_emissao_rg DATE,
    data_nascimento DATE,
    idade INTEGER,
    endereco TEXT,
    bairro VARCHAR(100),
    cep VARCHAR(10),
    cidade VARCHAR(100) DEFAULT 'São Paulo',
    estado VARCHAR(2) DEFAULT 'SP',
    nis VARCHAR(20),
    contato1 VARCHAR(20),
    contato2 VARCHAR(20),
    email VARCHAR(255),
    escolaridade VARCHAR(100),
    profissao VARCHAR(100),
    renda_familiar DECIMAL(10,2),
    composicao_familiar INTEGER,
    referencia TEXT,
    data_inicio_instituto DATE DEFAULT CURRENT_DATE,
    programa_servico VARCHAR(255),
    observacoes TEXT,
    necessidades_especiais TEXT,
    medicamentos TEXT,
    alergias TEXT,
    contato_emergencia TEXT,
    documentos_pendentes TEXT[],
    responsavel_cadastro INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para beneficiarias
CREATE INDEX IF NOT EXISTS idx_beneficiarias_nome ON beneficiarias USING GIN (to_tsvector('portuguese', nome_completo));
CREATE INDEX IF NOT EXISTS idx_beneficiarias_cpf ON beneficiarias(cpf) WHERE cpf IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_beneficiarias_ativo ON beneficiarias(ativo);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_programa ON beneficiarias(programa_servico);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_data_criacao ON beneficiarias(data_criacao);

-- ============================================================================
-- TABELA: projetos
-- ============================================================================
CREATE TABLE IF NOT EXISTS projetos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim_prevista DATE,
    data_fim_real DATE,
    status VARCHAR(50) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
    responsavel_id INTEGER REFERENCES usuarios(id),
    coordenador_id INTEGER REFERENCES usuarios(id),
    orcamento DECIMAL(12,2),
    orcamento_usado DECIMAL(12,2) DEFAULT 0,
    meta_beneficiarias INTEGER,
    beneficiarias_atingidas INTEGER DEFAULT 0,
    objetivos TEXT,
    metodologia TEXT,
    resultados_esperados TEXT,
    indicadores TEXT[],
    local_execucao TEXT,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel ON projetos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_projetos_ativo ON projetos(ativo);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);

-- ============================================================================
-- TABELA: oficinas
-- ============================================================================
CREATE TABLE IF NOT EXISTS oficinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    instrutor VARCHAR(255),
    data_inicio DATE NOT NULL,
    data_fim DATE,
    horario_inicio TIME,
    horario_fim TIME,
    dias_semana TEXT[], -- ['segunda', 'quarta', 'sexta']
    vagas_total INTEGER DEFAULT 0,
    vagas_ocupadas INTEGER DEFAULT 0,
    local VARCHAR(255),
    materiais TEXT,
    pre_requisitos TEXT,
    valor DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'pausada', 'concluida')),
    projeto_id INTEGER REFERENCES projetos(id),
    responsavel_id INTEGER REFERENCES usuarios(id),
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para oficinas
CREATE INDEX IF NOT EXISTS idx_oficinas_status ON oficinas(status);
CREATE INDEX IF NOT EXISTS idx_oficinas_projeto ON oficinas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_oficinas_ativo ON oficinas(ativo);
CREATE INDEX IF NOT EXISTS idx_oficinas_data_inicio ON oficinas(data_inicio);

-- ============================================================================
-- TABELA: participacoes (Relação Beneficiária-Projeto)
-- ============================================================================
CREATE TABLE IF NOT EXISTS participacoes (
    id SERIAL PRIMARY KEY,
    beneficiaria_id INTEGER NOT NULL REFERENCES beneficiarias(id) ON DELETE CASCADE,
    projeto_id INTEGER NOT NULL REFERENCES projetos(id) ON DELETE CASCADE,
    data_inscricao DATE DEFAULT CURRENT_DATE,
    data_inicio_participacao DATE,
    data_fim_participacao DATE,
    status VARCHAR(50) DEFAULT 'inscrita' CHECK (status IN ('inscrita', 'participando', 'concluida', 'desistente', 'transferida')),
    motivo_status TEXT,
    observacoes TEXT,
    avaliacao_final TEXT,
    nota_final DECIMAL(3,1),
    frequencia_percentual DECIMAL(5,2),
    certificado_emitido BOOLEAN DEFAULT false,
    data_certificado DATE,
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(beneficiaria_id, projeto_id)
);

-- Índices para participacoes
CREATE INDEX IF NOT EXISTS idx_participacoes_beneficiaria ON participacoes(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_projeto ON participacoes(projeto_id);
CREATE INDEX IF NOT EXISTS idx_participacoes_status ON participacoes(status);
CREATE INDEX IF NOT EXISTS idx_participacoes_ativo ON participacoes(ativo);

-- ============================================================================
-- TABELA: declaracoes_comparecimento
-- ============================================================================
CREATE TABLE IF NOT EXISTS declaracoes_comparecimento (
    id SERIAL PRIMARY KEY,
    beneficiaria_id INTEGER NOT NULL REFERENCES beneficiarias(id),
    data_comparecimento DATE NOT NULL,
    hora_entrada TIME,
    hora_saida TIME,
    profissional_responsavel VARCHAR(255) NOT NULL,
    projeto_id INTEGER REFERENCES projetos(id),
    oficina_id INTEGER REFERENCES oficinas(id),
    tipo_atividade VARCHAR(100),
    observacoes TEXT,
    assinatura_digital TEXT,
    data_criacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para declaracoes_comparecimento
CREATE INDEX IF NOT EXISTS idx_declaracoes_beneficiaria ON declaracoes_comparecimento(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_declaracoes_data ON declaracoes_comparecimento(data_comparecimento);
CREATE INDEX IF NOT EXISTS idx_declaracoes_projeto ON declaracoes_comparecimento(projeto_id);

-- ============================================================================
-- TABELA: mensagens (Sistema de mensagens)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mensagens (
    id SERIAL PRIMARY KEY,
    remetente_id INTEGER NOT NULL REFERENCES usuarios(id),
    destinatario_id INTEGER REFERENCES usuarios(id),
    beneficiaria_id INTEGER REFERENCES beneficiarias(id),
    assunto VARCHAR(255) NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR(50) DEFAULT 'mensagem' CHECK (tipo IN ('mensagem', 'notificacao', 'lembrete', 'alerta')),
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMPTZ,
    anexos TEXT[],
    tags TEXT[],
    ativo BOOLEAN DEFAULT true,
    data_criacao TIMESTAMPTZ DEFAULT NOW(),
    data_atualizacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mensagens
CREATE INDEX IF NOT EXISTS idx_mensagens_remetente ON mensagens(remetente_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario ON mensagens(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_beneficiaria ON mensagens(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_lida ON mensagens(lida);
CREATE INDEX IF NOT EXISTS idx_mensagens_tipo ON mensagens(tipo);
CREATE INDEX IF NOT EXISTS idx_mensagens_data_criacao ON mensagens(data_criacao);

-- ============================================================================
-- TABELA: log_auditoria (Log de todas as ações)
-- ============================================================================
CREATE TABLE IF NOT EXISTS log_auditoria (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES usuarios(id),
    tabela VARCHAR(100) NOT NULL,
    operacao VARCHAR(20) NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id VARCHAR(50),
    dados_anteriores JSONB,
    dados_novos JSONB,
    ip_address INET,
    user_agent TEXT,
    data_operacao TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para log_auditoria
CREATE INDEX IF NOT EXISTS idx_log_auditoria_usuario ON log_auditoria(usuario_id);
CREATE INDEX IF NOT EXISTS idx_log_auditoria_tabela ON log_auditoria(tabela);
CREATE INDEX IF NOT EXISTS idx_log_auditoria_operacao ON log_auditoria(operacao);
CREATE INDEX IF NOT EXISTS idx_log_auditoria_data ON log_auditoria(data_operacao);

-- ============================================================================
-- TRIGGERS PARA AUDITORIA E TIMESTAMPS
-- ============================================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.data_atualizacao = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar data_atualizacao
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiarias_updated_at
    BEFORE UPDATE ON beneficiarias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at
    BEFORE UPDATE ON projetos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oficinas_updated_at
    BEFORE UPDATE ON oficinas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participacoes_updated_at
    BEFORE UPDATE ON participacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mensagens_updated_at
    BEFORE UPDATE ON mensagens
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- INSERIR DADOS INICIAIS
-- ============================================================================

-- Inserir usuário superadmin padrão (senha deve ser alterada)
INSERT INTO usuarios (nome, email, senha_hash, papel) VALUES 
('Bruno Superadmin', 'bruno@move.com', '$2a$12$example_hash_change_this', 'superadmin'),
('Admin Sistema', 'admin@movemarias.com', '$2a$12$example_hash_change_this', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir dados de exemplo para beneficiárias
INSERT INTO beneficiarias (nome_completo, cpf, contato1, endereco, programa_servico) VALUES 
('Maria Silva Santos', '123.456.789-00', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo, SP', 'Capacitação Profissional'),
('Ana Paula Oliveira', '987.654.321-00', '(11) 99999-2222', 'Av. Principal, 456 - São Paulo, SP', 'Apoio Psicológico'),
('Joana Ferreira Lima', '456.789.123-00', '(11) 99999-3333', 'Rua da Esperança, 789 - São Paulo, SP', 'Oficinas Culturais')
ON CONFLICT (cpf) DO NOTHING;

-- Inserir projeto exemplo
INSERT INTO projetos (nome, descricao, data_inicio, responsavel_id, meta_beneficiarias) VALUES 
('Capacitação Digital 2025', 'Programa de capacitação em tecnologia digital para beneficiárias', '2025-01-01', 1, 50),
('Apoio Psicossocial', 'Atendimento psicológico e social continuado', '2025-01-01', 2, 100)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- VIEWS ÚTEIS
-- ============================================================================

-- View para estatísticas gerais
CREATE OR REPLACE VIEW estatisticas_gerais AS
SELECT 
    (SELECT COUNT(*) FROM beneficiarias WHERE ativo = true) AS total_beneficiarias,
    (SELECT COUNT(*) FROM projetos WHERE ativo = true) AS total_projetos,
    (SELECT COUNT(*) FROM oficinas WHERE ativo = true) AS total_oficinas,
    (SELECT COUNT(*) FROM participacoes WHERE ativo = true) AS total_participacoes,
    (SELECT COUNT(*) FROM usuarios WHERE ativo = true) AS total_usuarios;

-- View para beneficiárias com participações
CREATE OR REPLACE VIEW beneficiarias_completo AS
SELECT 
    b.*,
    COUNT(p.id) as total_participacoes,
    ARRAY_AGG(pr.nome) FILTER (WHERE pr.nome IS NOT NULL) as projetos_participando
FROM beneficiarias b
LEFT JOIN participacoes p ON b.id = p.beneficiaria_id AND p.ativo = true
LEFT JOIN projetos pr ON p.projeto_id = pr.id AND pr.ativo = true
WHERE b.ativo = true
GROUP BY b.id;

-- ============================================================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================================================

-- Função para calcular idade
CREATE OR REPLACE FUNCTION calcular_idade(data_nascimento DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(data_nascimento));
END;
$$ LANGUAGE plpgsql;

-- Função para buscar beneficiárias
CREATE OR REPLACE FUNCTION buscar_beneficiarias(termo TEXT DEFAULT '', limite INTEGER DEFAULT 10, offset_valor INTEGER DEFAULT 0)
RETURNS TABLE(
    id INTEGER,
    nome_completo VARCHAR,
    cpf VARCHAR,
    contato1 VARCHAR,
    programa_servico VARCHAR,
    data_criacao TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        b.id,
        b.nome_completo,
        b.cpf,
        b.contato1,
        b.programa_servico,
        b.data_criacao
    FROM beneficiarias b
    WHERE b.ativo = true
    AND (termo = '' OR b.nome_completo ILIKE '%' || termo || '%' OR b.cpf ILIKE '%' || termo || '%')
    ORDER BY b.nome_completo
    LIMIT limite
    OFFSET offset_valor;
END;
$$ LANGUAGE plpgsql;
