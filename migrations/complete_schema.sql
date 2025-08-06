-- ================================================
-- SISTEMA MOVE MARIAS - MIGRATIONS COMPLETAS
-- ================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================
-- TIPOS ENUMS
-- ================================================

CREATE TYPE user_type AS ENUM ('admin', 'profissional');
CREATE TYPE permission_type AS ENUM ('read', 'write', 'delete', 'admin');
CREATE TYPE module_type AS ENUM ('beneficiarias', 'formularios', 'oficinas', 'relatorios', 'usuarios', 'sistema');

-- ================================================
-- TABELA DE PERFIS (PROFILES)
-- ================================================

CREATE TABLE public.profiles (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    nome_completo VARCHAR NOT NULL,
    email VARCHAR NOT NULL UNIQUE,
    avatar_url TEXT,
    tipo_usuario user_type NOT NULL DEFAULT 'profissional',
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

CREATE POLICY "Admins can insert profiles" ON public.profiles
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin') 
        OR NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
    );

-- ================================================
-- TABELA DE BENEFICIÁRIAS
-- ================================================

CREATE TABLE public.beneficiarias (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome_completo VARCHAR NOT NULL,
    cpf VARCHAR NOT NULL UNIQUE,
    rg VARCHAR,
    orgao_emissor_rg VARCHAR,
    data_emissao_rg DATE,
    data_nascimento DATE NOT NULL,
    idade INTEGER,
    endereco TEXT,
    bairro VARCHAR,
    nis VARCHAR,
    contato1 VARCHAR NOT NULL,
    contato2 VARCHAR,
    referencia VARCHAR,
    programa_servico VARCHAR,
    data_inicio_instituto DATE,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now(),
    data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.beneficiarias ENABLE ROW LEVEL SECURITY;

-- Policies for beneficiarias
CREATE POLICY "Authenticated users can view beneficiarias" ON public.beneficiarias
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert beneficiarias" ON public.beneficiarias
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update beneficiarias" ON public.beneficiarias
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- ANAMNESES SOCIAL
-- ================================================

CREATE TABLE public.anamneses_social (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_anamnese DATE NOT NULL,
    doenca_cronica_degenerativa BOOLEAN DEFAULT false,
    desafios_doenca TEXT,
    idosos_dependentes BOOLEAN DEFAULT false,
    desafios_idosos TEXT,
    deficiencia BOOLEAN DEFAULT false,
    desafios_deficiencia TEXT,
    transtorno_mental_desenvolvimento BOOLEAN DEFAULT false,
    desafios_transtorno TEXT,
    uso_cigarros BOOLEAN DEFAULT false,
    uso_drogas_ilicitas BOOLEAN DEFAULT false,
    uso_alcool BOOLEAN DEFAULT false,
    uso_outros VARCHAR,
    vulnerabilidades TEXT[],
    observacoes_importantes TEXT,
    assinatura_tecnica BOOLEAN DEFAULT false,
    assinatura_beneficiaria BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anamneses_social ENABLE ROW LEVEL SECURITY;

-- Policies for anamneses_social
CREATE POLICY "Authenticated users can view anamneses_social" ON public.anamneses_social
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert anamneses_social" ON public.anamneses_social
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update anamneses_social" ON public.anamneses_social
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- MEMBROS DA FAMÍLIA
-- ================================================

CREATE TABLE public.membros_familia (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    anamnese_id UUID NOT NULL REFERENCES public.anamneses_social(id),
    nome VARCHAR NOT NULL,
    data_nascimento DATE,
    idade INTEGER,
    trabalha BOOLEAN DEFAULT false,
    renda NUMERIC,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.membros_familia ENABLE ROW LEVEL SECURITY;

-- Policies for membros_familia
CREATE POLICY "Authenticated users can view membros_familia" ON public.membros_familia
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert membros_familia" ON public.membros_familia
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update membros_familia" ON public.membros_familia
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- FICHAS DE EVOLUÇÃO
-- ================================================

CREATE TABLE public.fichas_evolucao (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_evolucao DATE NOT NULL,
    responsavel VARCHAR NOT NULL,
    descricao TEXT NOT NULL,
    assinatura_beneficiaria BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fichas_evolucao ENABLE ROW LEVEL SECURITY;

-- Policies for fichas_evolucao
CREATE POLICY "Authenticated users can view fichas_evolucao" ON public.fichas_evolucao
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert fichas_evolucao" ON public.fichas_evolucao
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update fichas_evolucao" ON public.fichas_evolucao
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- VISÕES HOLÍSTICAS
-- ================================================

CREATE TABLE public.visoes_holisticas (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_visao DATE NOT NULL,
    historia_vida TEXT,
    rede_apoio TEXT,
    visao_tecnica_referencia TEXT,
    encaminhamento_projeto TEXT,
    assinatura_tecnica BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visoes_holisticas ENABLE ROW LEVEL SECURITY;

-- Policies for visoes_holisticas
CREATE POLICY "Authenticated users can view visoes_holisticas" ON public.visoes_holisticas
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert visoes_holisticas" ON public.visoes_holisticas
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update visoes_holisticas" ON public.visoes_holisticas
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- RODA DA VIDA
-- ================================================

CREATE TABLE public.roda_vida (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_roda DATE NOT NULL,
    amor_score INTEGER CHECK (amor_score BETWEEN 1 AND 10),
    proposito_score INTEGER CHECK (proposito_score BETWEEN 1 AND 10),
    espiritualidade_score INTEGER CHECK (espiritualidade_score BETWEEN 1 AND 10),
    recursos_financeiros_score INTEGER CHECK (recursos_financeiros_score BETWEEN 1 AND 10),
    relacionamento_familiar_score INTEGER CHECK (relacionamento_familiar_score BETWEEN 1 AND 10),
    contribuicao_social_score INTEGER CHECK (contribuicao_social_score BETWEEN 1 AND 10),
    vida_social_score INTEGER CHECK (vida_social_score BETWEEN 1 AND 10),
    equilibrio_emocional_score INTEGER CHECK (equilibrio_emocional_score BETWEEN 1 AND 10),
    lazer_score INTEGER CHECK (lazer_score BETWEEN 1 AND 10),
    saude_score INTEGER CHECK (saude_score BETWEEN 1 AND 10),
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.roda_vida ENABLE ROW LEVEL SECURITY;

-- Policies for roda_vida
CREATE POLICY "Authenticated users can view roda_vida" ON public.roda_vida
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert roda_vida" ON public.roda_vida
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update roda_vida" ON public.roda_vida
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- PLANOS DE AÇÃO
-- ================================================

CREATE TABLE public.planos_acao (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    objetivos TEXT NOT NULL,
    acoes TEXT NOT NULL,
    responsaveis VARCHAR,
    prazos VARCHAR,
    resultados_esperados TEXT,
    acompanhamento TEXT,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planos_acao ENABLE ROW LEVEL SECURITY;

-- Policies for planos_acao
CREATE POLICY "Authenticated users can view planos_acao" ON public.planos_acao
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert planos_acao" ON public.planos_acao
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update planos_acao" ON public.planos_acao
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- TERMOS DE CONSENTIMENTO
-- ================================================

CREATE TABLE public.termos_consentimento (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_consentimento DATE NOT NULL,
    nacionalidade VARCHAR,
    estado_civil VARCHAR,
    tratamento_dados_autorizado BOOLEAN NOT NULL,
    uso_imagem_autorizado BOOLEAN NOT NULL,
    assinatura_voluntaria BOOLEAN DEFAULT false,
    assinatura_responsavel_familiar BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.termos_consentimento ENABLE ROW LEVEL SECURITY;

-- Policies for termos_consentimento
CREATE POLICY "Authenticated users can view termos_consentimento" ON public.termos_consentimento
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert termos_consentimento" ON public.termos_consentimento
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update termos_consentimento" ON public.termos_consentimento
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- MATRÍCULAS DE PROJETOS
-- ================================================

CREATE TABLE public.matriculas_projetos (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    nome_projeto VARCHAR NOT NULL,
    data_inicio_projeto DATE NOT NULL,
    data_termino_projeto DATE,
    carga_horaria VARCHAR,
    escolaridade VARCHAR,
    profissao VARCHAR,
    renda_familiar NUMERIC,
    observacoes_matricula TEXT,
    assinatura_participante BOOLEAN DEFAULT false,
    assinatura_coordenador BOOLEAN DEFAULT false,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.matriculas_projetos ENABLE ROW LEVEL SECURITY;

-- Policies for matriculas_projetos
CREATE POLICY "Authenticated users can view matriculas_projetos" ON public.matriculas_projetos
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert matriculas_projetos" ON public.matriculas_projetos
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update matriculas_projetos" ON public.matriculas_projetos
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- DECLARAÇÕES DE COMPARECIMENTO
-- ================================================

CREATE TABLE public.declaracoes_comparecimento (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    data_comparecimento DATE NOT NULL,
    hora_entrada TIME,
    hora_saida TIME,
    profissional_responsavel VARCHAR NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.declaracoes_comparecimento ENABLE ROW LEVEL SECURITY;

-- Policies for declaracoes_comparecimento
CREATE POLICY "Authenticated users can view declaracoes_comparecimento" ON public.declaracoes_comparecimento
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert declaracoes_comparecimento" ON public.declaracoes_comparecimento
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update declaracoes_comparecimento" ON public.declaracoes_comparecimento
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- RECIBOS DE BENEFÍCIO
-- ================================================

CREATE TABLE public.recibos_beneficio (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    beneficiaria_id UUID NOT NULL REFERENCES public.beneficiarias(id),
    tipo_beneficio VARCHAR NOT NULL,
    data_recebimento DATE NOT NULL,
    data_criacao TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recibos_beneficio ENABLE ROW LEVEL SECURITY;

-- Policies for recibos_beneficio
CREATE POLICY "Authenticated users can view recibos_beneficio" ON public.recibos_beneficio
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can insert recibos_beneficio" ON public.recibos_beneficio
    FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Authenticated users can update recibos_beneficio" ON public.recibos_beneficio
    FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- SISTEMA DE PERMISSÕES
-- ================================================

CREATE TABLE public.user_permissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    module module_type NOT NULL,
    permission permission_type NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(user_id, module, permission)
);

-- Enable RLS
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Policies for user_permissions
CREATE POLICY "Admins can manage permissions" ON public.user_permissions
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

-- ================================================
-- OFICINAS E CONTROLE DE PRESENÇA
-- ================================================

CREATE TABLE public.oficinas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    instrutor VARCHAR NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    dias_semana TEXT[] NOT NULL,
    vagas_totais INTEGER DEFAULT 20,
    vagas_ocupadas INTEGER DEFAULT 0,
    ativa BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;

-- Policies for oficinas
CREATE POLICY "Authenticated users can view oficinas" ON public.oficinas
    FOR SELECT USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage oficinas" ON public.oficinas
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

CREATE TABLE public.oficinas_participantes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    oficina_id UUID REFERENCES public.oficinas(id) ON DELETE CASCADE,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    data_matricula DATE DEFAULT CURRENT_DATE,
    status VARCHAR DEFAULT 'ativa' CHECK (status IN ('ativa', 'suspensa', 'concluida', 'desistente')),
    observacoes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(oficina_id, beneficiaria_id)
);

-- Enable RLS
ALTER TABLE public.oficinas_participantes ENABLE ROW LEVEL SECURITY;

-- Policies for oficinas_participantes
CREATE POLICY "Authenticated users can manage participants" ON public.oficinas_participantes
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

CREATE TABLE public.presencas_oficinas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    oficina_id UUID REFERENCES public.oficinas(id) ON DELETE CASCADE,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    data_aula DATE NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT false,
    observacoes TEXT,
    registrado_por UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(oficina_id, beneficiaria_id, data_aula)
);

-- Enable RLS
ALTER TABLE public.presencas_oficinas ENABLE ROW LEVEL SECURITY;

-- Policies for presencas_oficinas
CREATE POLICY "Authenticated users can manage attendance" ON public.presencas_oficinas
    FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid()));

-- ================================================
-- SISTEMA DE MENSAGENS
-- ================================================

CREATE TABLE public.conversas (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tipo VARCHAR DEFAULT 'individual' CHECK (tipo IN ('individual', 'grupo')),
    nome_grupo VARCHAR,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.conversas ENABLE ROW LEVEL SECURITY;

-- Policies for conversas
CREATE POLICY "Users can view their conversations" ON public.conversas
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.conversas_participantes WHERE conversa_id = id AND user_id = auth.uid())
    );

CREATE TABLE public.conversas_participantes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversa_id UUID REFERENCES public.conversas(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversa_id, user_id)
);

-- Enable RLS
ALTER TABLE public.conversas_participantes ENABLE ROW LEVEL SECURITY;

-- Policies for conversas_participantes
CREATE POLICY "Users can manage conversation participants" ON public.conversas_participantes
    FOR ALL USING (
        user_id = auth.uid() OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

CREATE TABLE public.mensagens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversa_id UUID REFERENCES public.conversas(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    tipo VARCHAR DEFAULT 'texto' CHECK (tipo IN ('texto', 'arquivo', 'imagem')),
    arquivo_url TEXT,
    editada BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Policies for mensagens
CREATE POLICY "Users can view messages in their conversations" ON public.mensagens
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.conversas_participantes WHERE conversa_id = mensagens.conversa_id AND user_id = auth.uid())
    );

CREATE POLICY "Users can send messages" ON public.mensagens
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (SELECT 1 FROM public.conversas_participantes WHERE conversa_id = mensagens.conversa_id AND user_id = auth.uid())
    );

-- ================================================
-- SISTEMA DE NOTIFICAÇÕES
-- ================================================

CREATE TABLE public.notificacoes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR DEFAULT 'info' CHECK (tipo IN ('info', 'aviso', 'aniversario', 'sistema', 'urgente')),
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMPTZ,
    url_acao VARCHAR,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Policies for notificacoes
CREATE POLICY "Users can view their notifications" ON public.notificacoes
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their notifications" ON public.notificacoes
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notificacoes
    FOR INSERT WITH CHECK (true);

-- ================================================
-- FEED DE AVISOS/POSTS
-- ================================================

CREATE TABLE public.feed_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    titulo VARCHAR NOT NULL,
    conteudo TEXT NOT NULL,
    tipo VARCHAR DEFAULT 'aviso' CHECK (tipo IN ('aviso', 'noticia', 'evento', 'importante')),
    anexo_url TEXT,
    fixado BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Policies for feed_posts
CREATE POLICY "Authenticated users can view feed" ON public.feed_posts
    FOR SELECT USING (
        ativo = true AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Admins can manage feed" ON public.feed_posts
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

-- ================================================
-- FUNÇÕES AUXILIARES
-- ================================================

-- Função para calcular idade
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$;

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.data_atualizacao = now();
  RETURN NEW;
END;
$$;

-- Função para atualizar updated_at (versão genérica)
CREATE OR REPLACE FUNCTION public.update_updated_at_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Função para atualizar idade automaticamente
CREATE OR REPLACE FUNCTION public.update_beneficiaria_age()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF NEW.data_nascimento IS NOT NULL THEN
    NEW.idade = public.calculate_age(NEW.data_nascimento);
  END IF;
  RETURN NEW;
END;
$$;

-- Função para criar perfil automaticamente quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, nome_completo, email, tipo_usuario)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'tipo_usuario')::user_type, 'profissional')
  );
  RETURN NEW;
END;
$$;

-- Função para criar usuário admin
CREATE OR REPLACE FUNCTION public.create_admin_user(p_email text, p_nome_completo text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Esta função deve ser usada apenas para configuração inicial do admin
  -- Usuários reais devem se registrar através do sistema de auth
  
  -- Criar um perfil placeholder que será atualizado quando o usuário se registrar
  INSERT INTO public.profiles (id, user_id, nome_completo, email, tipo_usuario)
  VALUES (
    uuid_generate_v4(),
    uuid_generate_v4(), -- Será substituído quando o usuário realmente se registrar
    p_nome_completo,
    p_email,
    'admin'
  );
  
  RAISE NOTICE 'Perfil de usuário admin criado. Usuário deve se registrar com email: %', p_email;
END;
$$;

-- ================================================
-- TRIGGERS
-- ================================================

-- Trigger para atualizar timestamps
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_beneficiarias_updated_at
    BEFORE UPDATE ON public.beneficiarias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar idade das beneficiárias
CREATE TRIGGER update_beneficiaria_age_trigger
    BEFORE INSERT OR UPDATE ON public.beneficiarias
    FOR EACH ROW
    EXECUTE FUNCTION public.update_beneficiaria_age();

-- Triggers para timestamps genéricos
CREATE TRIGGER update_oficinas_updated_at
    BEFORE UPDATE ON public.oficinas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_conversas_updated_at
    BEFORE UPDATE ON public.conversas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_mensagens_updated_at
    BEFORE UPDATE ON public.mensagens
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

CREATE TRIGGER update_feed_posts_updated_at
    BEFORE UPDATE ON public.feed_posts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_timestamp();

-- ================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================

-- Índices para queries frequentes
CREATE INDEX idx_beneficiarias_cpf ON public.beneficiarias(cpf);
CREATE INDEX idx_beneficiarias_nome ON public.beneficiarias(nome_completo);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_anamneses_beneficiaria ON public.anamneses_social(beneficiaria_id);
CREATE INDEX idx_fichas_evolucao_beneficiaria ON public.fichas_evolucao(beneficiaria_id);
CREATE INDEX idx_mensagens_conversa ON public.mensagens(conversa_id);
CREATE INDEX idx_notificacoes_user ON public.notificacoes(user_id);
CREATE INDEX idx_feed_posts_ativo ON public.feed_posts(ativo, created_at);

-- ================================================
-- DADOS INICIAIS
-- ================================================

-- Criar perfil admin master
SELECT public.create_admin_user('bruno@move.com', 'Bruno - Administrador Master');

-- ================================================
-- COMENTÁRIOS E DOCUMENTAÇÃO
-- ================================================

COMMENT ON TABLE public.profiles IS 'Perfis de usuários do sistema';
COMMENT ON TABLE public.beneficiarias IS 'Cadastro das beneficiárias do instituto';
COMMENT ON TABLE public.anamneses_social IS 'Anamneses sociais das beneficiárias';
COMMENT ON TABLE public.oficinas IS 'Oficinas oferecidas pelo instituto';
COMMENT ON TABLE public.mensagens IS 'Sistema de mensagens entre usuários';
COMMENT ON TABLE public.notificacoes IS 'Sistema de notificações do sistema';
COMMENT ON TABLE public.feed_posts IS 'Feed de avisos e comunicados';

-- ================================================
-- FIM DAS MIGRATIONS
-- ================================================