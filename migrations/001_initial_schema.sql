-- ============================================================================
-- Migration 001: Schema Inicial Completo
-- Assist Move Assist - PostgreSQL Production Schema
-- Data: Agosto 2025
-- ============================================================================

BEGIN;

-- Verificar se estamos em uma transação
SELECT txid_current();

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Criar schema para logs se não existir
CREATE SCHEMA IF NOT EXISTS logs;

-- ============================================================================
-- TABELA: profiles (Estende auth.users do Supabase)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    nome_completo TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'readonly')) DEFAULT 'user',
    ativo BOOLEAN DEFAULT true,
    ultimo_acesso TIMESTAMPTZ,
    configuracoes JSONB DEFAULT '{}',
    avatar_url TEXT,
    telefone TEXT,
    cargo TEXT,
    departamento TEXT,
    data_admissao DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_ativo ON profiles(ativo);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);

-- ============================================================================
-- TABELA: beneficiarias
-- ============================================================================
CREATE TABLE IF NOT EXISTS beneficiarias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_completo TEXT NOT NULL,
    cpf TEXT UNIQUE NOT NULL,
    rg TEXT,
    orgao_emissor_rg TEXT,
    data_emissao_rg DATE,
    data_nascimento DATE NOT NULL,
    endereco TEXT,
    bairro TEXT,
    cep TEXT,
    cidade TEXT DEFAULT 'São Paulo',
    estado TEXT DEFAULT 'SP',
    nis TEXT,
    contato1 TEXT NOT NULL,
    contato2 TEXT,
    email TEXT,
    escolaridade TEXT,
    profissao TEXT,
    renda_familiar DECIMAL(10,2),
    composicao_familiar INTEGER,
    referencia TEXT,
    data_inicio_instituto DATE DEFAULT CURRENT_DATE,
    programa_servico TEXT,
    status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'suspensa', 'transferida', 'desligada')),
    motivo_status TEXT,
    observacoes TEXT,
    documentos_pendentes TEXT[],
    necessidades_especiais TEXT,
    alergias TEXT,
    medicamentos TEXT,
    contato_emergencia TEXT,
    responsavel_cadastro UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Índices para beneficiarias
CREATE INDEX IF NOT EXISTS idx_beneficiarias_cpf ON beneficiarias(cpf);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_nome ON beneficiarias USING GIN (to_tsvector('portuguese', nome_completo));
CREATE INDEX IF NOT EXISTS idx_beneficiarias_status ON beneficiarias(status);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_programa ON beneficiarias(programa_servico);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_data_inicio ON beneficiarias(data_inicio_instituto);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_created_at ON beneficiarias(created_at);
CREATE INDEX IF NOT EXISTS idx_beneficiarias_updated_at ON beneficiarias(updated_at);

-- ============================================================================
-- TABELA: projetos
-- ============================================================================
CREATE TABLE IF NOT EXISTS projetos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    data_inicio DATE NOT NULL,
    data_fim_prevista DATE,
    data_fim_real DATE,
    status TEXT DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'em_andamento', 'pausado', 'concluido', 'cancelado')),
    responsavel_id UUID REFERENCES profiles(id),
    coordenador_id UUID REFERENCES profiles(id),
    orcamento DECIMAL(10,2),
    orcamento_usado DECIMAL(10,2) DEFAULT 0,
    meta_beneficiarias INTEGER,
    beneficiarias_atingidas INTEGER DEFAULT 0,
    objetivos TEXT,
    metodologia TEXT,
    resultados_esperados TEXT,
    indicadores TEXT[],
    parceiros TEXT[],
    local_execucao TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Índices para projetos
CREATE INDEX IF NOT EXISTS idx_projetos_status ON projetos(status);
CREATE INDEX IF NOT EXISTS idx_projetos_responsavel ON projetos(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_projetos_data_inicio ON projetos(data_inicio);
CREATE INDEX IF NOT EXISTS idx_projetos_data_fim ON projetos(data_fim_prevista);

-- ============================================================================
-- TABELA: tarefas
-- ============================================================================
CREATE TABLE IF NOT EXISTS tarefas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    descricao TEXT,
    projeto_id UUID REFERENCES projetos(id),
    beneficiaria_id UUID REFERENCES beneficiarias(id),
    responsavel_id UUID NOT NULL REFERENCES profiles(id),
    atribuida_por UUID REFERENCES profiles(id),
    data_vencimento TIMESTAMPTZ NOT NULL,
    data_conclusao TIMESTAMPTZ,
    data_inicio_real TIMESTAMPTZ,
    prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada', 'reagendada', 'pausada')),
    categoria TEXT,
    tags TEXT[],
    tempo_estimado INTERVAL,
    tempo_gasto INTERVAL,
    progresso INTEGER DEFAULT 0 CHECK (progresso BETWEEN 0 AND 100),
    observacoes TEXT,
    resultado TEXT,
    anexos TEXT[],
    dependencias UUID[],
    recorrente BOOLEAN DEFAULT false,
    frequencia_recorrencia TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Índices para tarefas
CREATE INDEX IF NOT EXISTS idx_tarefas_responsavel ON tarefas(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_beneficiaria ON tarefas(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_projeto ON tarefas(projeto_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_vencimento ON tarefas(data_vencimento);
CREATE INDEX IF NOT EXISTS idx_tarefas_status ON tarefas(status);
CREATE INDEX IF NOT EXISTS idx_tarefas_prioridade ON tarefas(prioridade);
CREATE INDEX IF NOT EXISTS idx_tarefas_categoria ON tarefas(categoria);

-- ============================================================================
-- TABELA: oficinas
-- ============================================================================
CREATE TABLE IF NOT EXISTS oficinas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    categoria TEXT,
    instrutor TEXT,
    instrutor_id UUID REFERENCES profiles(id),
    data_oficina TIMESTAMPTZ NOT NULL,
    duracao INTERVAL DEFAULT '2 hours',
    local TEXT,
    endereco_local TEXT,
    capacidade_maxima INTEGER DEFAULT 20,
    capacidade_minima INTEGER DEFAULT 5,
    material_necessario TEXT[],
    pre_requisitos TEXT,
    objetivo TEXT,
    conteudo_programatico TEXT,
    publico_alvo TEXT,
    faixa_etaria TEXT,
    nivel_dificuldade TEXT CHECK (nivel_dificuldade IN ('iniciante', 'intermediario', 'avancado')),
    status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada', 'confirmada', 'em_andamento', 'concluida', 'cancelada', 'adiada')),
    motivo_cancelamento TEXT,
    feedback_instrutor TEXT,
    avaliacao_media DECIMAL(3,2),
    total_avaliacoes INTEGER DEFAULT 0,
    certificado_template TEXT,
    carga_horaria DECIMAL(4,2),
    valor_investimento DECIMAL(10,2),
    observacoes TEXT,
    fotos TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id),
    updated_by UUID REFERENCES profiles(id)
);

-- Índices para oficinas
CREATE INDEX IF NOT EXISTS idx_oficinas_data ON oficinas(data_oficina);
CREATE INDEX IF NOT EXISTS idx_oficinas_status ON oficinas(status);
CREATE INDEX IF NOT EXISTS idx_oficinas_instrutor ON oficinas(instrutor_id);
CREATE INDEX IF NOT EXISTS idx_oficinas_categoria ON oficinas(categoria);
CREATE INDEX IF NOT EXISTS idx_oficinas_local ON oficinas(local);

-- ============================================================================
-- TABELA: oficina_presencas
-- ============================================================================
CREATE TABLE IF NOT EXISTS oficina_presencas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    oficina_id UUID NOT NULL REFERENCES oficinas(id) ON DELETE CASCADE,
    beneficiaria_id UUID NOT NULL REFERENCES beneficiarias(id),
    inscricao_data TIMESTAMPTZ DEFAULT NOW(),
    presente BOOLEAN DEFAULT false,
    chegada TIMESTAMPTZ,
    saida TIMESTAMPTZ,
    observacoes TEXT,
    avaliacao INTEGER CHECK (avaliacao BETWEEN 1 AND 5),
    comentario_avaliacao TEXT,
    certificado_emitido BOOLEAN DEFAULT false,
    certificado_numero TEXT,
    data_certificado DATE,
    aproveitamento TEXT CHECK (aproveitamento IN ('excelente', 'bom', 'regular', 'insuficiente')),
    frequencia_percentual DECIMAL(5,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(oficina_id, beneficiaria_id)
);

-- Índices para oficina_presencas
CREATE INDEX IF NOT EXISTS idx_presencas_oficina ON oficina_presencas(oficina_id);
CREATE INDEX IF NOT EXISTS idx_presencas_beneficiaria ON oficina_presencas(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_presencas_presente ON oficina_presencas(presente);
CREATE INDEX IF NOT EXISTS idx_presencas_inscricao ON oficina_presencas(inscricao_data);

-- ============================================================================
-- TABELA: feed_posts
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    conteudo TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('anuncio', 'noticia', 'evento', 'comunicado', 'destaque', 'emergencia')),
    autor_id UUID NOT NULL REFERENCES profiles(id),
    imagem_url TEXT,
    anexos TEXT[],
    link_externo TEXT,
    visibilidade TEXT DEFAULT 'todos' CHECK (visibilidade IN ('todos', 'admins', 'equipe', 'beneficiarias')),
    fixado BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    destaque BOOLEAN DEFAULT false,
    data_publicacao TIMESTAMPTZ DEFAULT NOW(),
    data_expiracao TIMESTAMPTZ,
    tags TEXT[],
    prioridade INTEGER DEFAULT 1 CHECK (prioridade BETWEEN 1 AND 5),
    visualizacoes INTEGER DEFAULT 0,
    curtidas INTEGER DEFAULT 0,
    comentarios_count INTEGER DEFAULT 0,
    permite_comentarios BOOLEAN DEFAULT true,
    moderacao_ativa BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para feed_posts
CREATE INDEX IF NOT EXISTS idx_feed_posts_tipo ON feed_posts(tipo);
CREATE INDEX IF NOT EXISTS idx_feed_posts_autor ON feed_posts(autor_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_data ON feed_posts(data_publicacao DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_visibilidade ON feed_posts(visibilidade);
CREATE INDEX IF NOT EXISTS idx_feed_posts_ativo ON feed_posts(ativo);
CREATE INDEX IF NOT EXISTS idx_feed_posts_fixado ON feed_posts(fixado);
CREATE INDEX IF NOT EXISTS idx_feed_posts_tags ON feed_posts USING GIN(tags);

-- ============================================================================
-- TABELA: feed_comments
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES feed_posts(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES feed_comments(id),
    conteudo TEXT NOT NULL,
    autor_id UUID NOT NULL REFERENCES profiles(id),
    editado BOOLEAN DEFAULT false,
    data_edicao TIMESTAMPTZ,
    aprovado BOOLEAN DEFAULT true,
    moderado_por UUID REFERENCES profiles(id),
    data_moderacao TIMESTAMPTZ,
    denuncias INTEGER DEFAULT 0,
    curtidas INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 0, -- Para hierarquia de comentários
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para feed_comments
CREATE INDEX IF NOT EXISTS idx_feed_comments_post ON feed_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_autor ON feed_comments(autor_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_parent ON feed_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_feed_comments_aprovado ON feed_comments(aprovado);
CREATE INDEX IF NOT EXISTS idx_feed_comments_created_at ON feed_comments(created_at);

-- ============================================================================
-- TABELA: feed_likes
-- ============================================================================
CREATE TABLE IF NOT EXISTS feed_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES feed_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    tipo TEXT DEFAULT 'like' CHECK (tipo IN ('like', 'love', 'care', 'laugh', 'wow', 'sad', 'angry')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT feed_likes_target_check CHECK (
        (post_id IS NOT NULL AND comment_id IS NULL) OR 
        (post_id IS NULL AND comment_id IS NOT NULL)
    ),
    UNIQUE(post_id, user_id),
    UNIQUE(comment_id, user_id)
);

-- Índices para feed_likes
CREATE INDEX IF NOT EXISTS idx_feed_likes_post ON feed_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_comment ON feed_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_user ON feed_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_likes_tipo ON feed_likes(tipo);

-- ============================================================================
-- VERIFICAÇÕES DE INTEGRIDADE
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
DO $$
DECLARE
    table_count INTEGER;
    expected_tables TEXT[] := ARRAY[
        'profiles', 'beneficiarias', 'projetos', 'tarefas', 'oficinas',
        'oficina_presencas', 'feed_posts', 'feed_comments', 'feed_likes'
    ];
    table_name TEXT;
BEGIN
    -- Contar tabelas criadas
    SELECT COUNT(*) INTO table_count
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = ANY(expected_tables);
    
    -- Verificar se todas as tabelas esperadas foram criadas
    FOREACH table_name IN ARRAY expected_tables
    LOOP
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = table_name
        ) THEN
            RAISE EXCEPTION 'Tabela % não foi criada', table_name;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Migração 001 concluída com sucesso: % tabelas criadas', table_count;
END $$;

-- Log da migração
INSERT INTO logs.migration_log (migration, status, executed_at) 
VALUES ('001_initial_schema', 'success', NOW())
ON CONFLICT DO NOTHING;

COMMIT;
