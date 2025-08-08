# Guia de Migração PostgreSQL para Produção

## Estrutura do Banco de Dados em Produção

### 1. Tabelas Principais

#### Usuários e Autenticação
```sql
-- Perfis de usuário (estende auth.users do Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    nome VARCHAR NOT NULL,
    sobrenome VARCHAR,
    foto_url VARCHAR,
    cargo VARCHAR,
    departamento VARCHAR,
    bio TEXT,
    data_nascimento DATE,
    telefone VARCHAR(20),
    endereco TEXT,
    nivel_acesso VARCHAR(20) DEFAULT 'funcionario' CHECK (nivel_acesso IN ('admin', 'coordenador', 'funcionario', 'estagiario')),
    permissions JSONB DEFAULT '{}',
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver todos os perfis" ON public.profiles
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins podem atualizar qualquer perfil" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND nivel_acesso = 'admin'
        )
    );
```

#### Beneficiárias
```sql
CREATE TABLE public.beneficiarias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    sobrenome VARCHAR,
    data_nascimento DATE,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR,
    endereco TEXT,
    cep VARCHAR(10),
    cidade VARCHAR,
    estado VARCHAR(2),
    profissao VARCHAR,
    estado_civil VARCHAR(20),
    renda_familiar DECIMAL(10,2),
    beneficio_social VARCHAR,
    responsavel_id UUID REFERENCES public.profiles(id),
    observacoes TEXT,
    foto_url VARCHAR,
    documentos JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'pausada')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_beneficiarias_nome ON public.beneficiarias(nome);
CREATE INDEX idx_beneficiarias_cpf ON public.beneficiarias(cpf);
CREATE INDEX idx_beneficiarias_responsavel ON public.beneficiarias(responsavel_id);
CREATE INDEX idx_beneficiarias_status ON public.beneficiarias(status);
```

#### Projetos
```sql
CREATE TABLE public.projetos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    objetivo TEXT,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    orcamento DECIMAL(12,2),
    status VARCHAR(20) DEFAULT 'planejamento' CHECK (status IN ('planejamento', 'ativo', 'pausado', 'concluido', 'cancelado')),
    coordenador_id UUID REFERENCES public.profiles(id),
    vagas_total INTEGER DEFAULT 0,
    vagas_ocupadas INTEGER DEFAULT 0,
    carga_horaria INTEGER,
    local VARCHAR,
    requisitos TEXT,
    beneficios TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participantes dos projetos (relação N:N)
CREATE TABLE public.projeto_participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    projeto_id UUID REFERENCES public.projetos(id) ON DELETE CASCADE,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    data_inscricao DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'inscrita' CHECK (status IN ('inscrita', 'participando', 'concluida', 'desistente')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(projeto_id, beneficiaria_id)
);
```

#### Oficinas
```sql
CREATE TABLE public.oficinas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR NOT NULL,
    descricao TEXT,
    instrutor VARCHAR,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    horario_inicio TIME,
    horario_fim TIME,
    dias_semana VARCHAR[] DEFAULT '{}', -- ['segunda', 'quarta', 'sexta']
    vagas_total INTEGER DEFAULT 0,
    vagas_ocupadas INTEGER DEFAULT 0,
    local VARCHAR,
    materiais TEXT,
    pre_requisitos TEXT,
    valor DECIMAL(10,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa', 'pausada', 'concluida')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participantes das oficinas
CREATE TABLE public.oficina_participantes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    oficina_id UUID REFERENCES public.oficinas(id) ON DELETE CASCADE,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    data_inscricao DATE DEFAULT CURRENT_DATE,
    status VARCHAR(20) DEFAULT 'inscrita' CHECK (status IN ('inscrita', 'participando', 'concluida', 'desistente')),
    presencas INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(oficina_id, beneficiaria_id)
);
```

#### Formulários e Documentos
```sql
-- Anamnese Social
CREATE TABLE public.anamnese_social (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES public.profiles(id),
    situacao_moradia JSONB,
    composicao_familiar JSONB,
    situacao_saude JSONB,
    situacao_financeira JSONB,
    necessidades_identificadas TEXT[],
    recursos_comunitarios TEXT[],
    observacoes TEXT,
    data_aplicacao DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ficha de Evolução
CREATE TABLE public.fichas_evolucao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES public.profiles(id),
    data_atendimento DATE NOT NULL,
    tipo_atendimento VARCHAR(50),
    atividades_realizadas TEXT,
    evolucao_observada TEXT,
    dificuldades_encontradas TEXT,
    proximos_passos TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Plano de Ação
CREATE TABLE public.planos_acao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    beneficiaria_id UUID REFERENCES public.beneficiarias(id) ON DELETE CASCADE,
    responsavel_id UUID REFERENCES public.profiles(id),
    objetivos JSONB,
    metas JSONB,
    atividades JSONB,
    recursos_necessarios TEXT[],
    prazo_conclusao DATE,
    status VARCHAR(20) DEFAULT 'em_andamento' CHECK (status IN ('planejado', 'em_andamento', 'concluido', 'suspenso')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Sistema de Mensagens
```sql
CREATE TABLE public.mensagens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    remetente_id UUID REFERENCES public.profiles(id),
    destinatario_id UUID REFERENCES public.profiles(id),
    assunto VARCHAR(255),
    conteudo TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'individual' CHECK (tipo IN ('individual', 'grupo', 'broadcast')),
    prioridade VARCHAR(20) DEFAULT 'normal' CHECK (prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    lida BOOLEAN DEFAULT false,
    data_leitura TIMESTAMP WITH TIME ZONE,
    anexos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance de mensagens
CREATE INDEX idx_mensagens_destinatario ON public.mensagens(destinatario_id);
CREATE INDEX idx_mensagens_remetente ON public.mensagens(remetente_id);
CREATE INDEX idx_mensagens_lida ON public.mensagens(lida);
CREATE INDEX idx_mensagens_created_at ON public.mensagens(created_at DESC);
```

#### Atividades e Tarefas
```sql
CREATE TABLE public.atividades (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    tipo VARCHAR(50), -- 'atendimento', 'oficina', 'reuniao', 'visita'
    responsavel_id UUID REFERENCES public.profiles(id),
    beneficiaria_id UUID REFERENCES public.beneficiarias(id),
    projeto_id UUID REFERENCES public.projetos(id),
    data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
    data_fim TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.tarefas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo VARCHAR NOT NULL,
    descricao TEXT,
    responsavel_id UUID REFERENCES public.profiles(id),
    criador_id UUID REFERENCES public.profiles(id),
    prioridade VARCHAR(20) DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
    prazo DATE,
    status VARCHAR(20) DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'cancelada')),
    tags VARCHAR[],
    anexos JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Funções e Triggers

```sql
-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beneficiarias_updated_at BEFORE UPDATE ON public.beneficiarias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projetos_updated_at BEFORE UPDATE ON public.projetos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_oficinas_updated_at BEFORE UPDATE ON public.oficinas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_anamnese_social_updated_at BEFORE UPDATE ON public.anamnese_social
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_planos_acao_updated_at BEFORE UPDATE ON public.planos_acao
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_atividades_updated_at BEFORE UPDATE ON public.atividades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tarefas_updated_at BEFORE UPDATE ON public.tarefas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Funções de Negócio

```sql
-- Função para inscrever beneficiária em projeto
CREATE OR REPLACE FUNCTION inscrever_projeto(
    p_projeto_id UUID,
    p_beneficiaria_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    vagas_disponiveis INTEGER;
BEGIN
    -- Verificar vagas disponíveis
    SELECT (vagas_total - vagas_ocupadas) INTO vagas_disponiveis
    FROM public.projetos
    WHERE id = p_projeto_id AND status = 'ativo';
    
    IF vagas_disponiveis <= 0 THEN
        RETURN FALSE; -- Sem vagas
    END IF;
    
    -- Inserir participante
    INSERT INTO public.projeto_participantes (projeto_id, beneficiaria_id)
    VALUES (p_projeto_id, p_beneficiaria_id)
    ON CONFLICT (projeto_id, beneficiaria_id) DO NOTHING;
    
    -- Atualizar vagas ocupadas
    UPDATE public.projetos
    SET vagas_ocupadas = vagas_ocupadas + 1
    WHERE id = p_projeto_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas de projeto
CREATE OR REPLACE FUNCTION estatisticas_projeto(p_projeto_id UUID)
RETURNS JSONB AS $$
DECLARE
    stats JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_participantes', COUNT(*),
        'participantes_ativas', COUNT(*) FILTER (WHERE status = 'participando'),
        'concluidas', COUNT(*) FILTER (WHERE status = 'concluida'),
        'desistentes', COUNT(*) FILTER (WHERE status = 'desistente'),
        'taxa_conclusao', ROUND(
            (COUNT(*) FILTER (WHERE status = 'concluida')::DECIMAL / 
             NULLIF(COUNT(*), 0) * 100), 2
        )
    ) INTO stats
    FROM public.projeto_participantes
    WHERE projeto_id = p_projeto_id;
    
    RETURN stats;
END;
$$ LANGUAGE plpgsql;
```

### 4. Views para Relatórios

```sql
-- View para relatório de beneficiárias
CREATE VIEW v_relatorio_beneficiarias AS
SELECT 
    b.id,
    b.nome,
    b.sobrenome,
    b.data_nascimento,
    DATE_PART('year', AGE(b.data_nascimento)) as idade,
    b.telefone,
    b.email,
    b.profissao,
    b.renda_familiar,
    b.status,
    p.nome as responsavel_nome,
    COUNT(pp.projeto_id) as projetos_participando,
    COUNT(op.oficina_id) as oficinas_participando,
    b.created_at,
    b.updated_at
FROM public.beneficiarias b
LEFT JOIN public.profiles p ON b.responsavel_id = p.id
LEFT JOIN public.projeto_participantes pp ON b.id = pp.beneficiaria_id AND pp.status = 'participando'
LEFT JOIN public.oficina_participantes op ON b.id = op.beneficiaria_id AND op.status = 'participando'
GROUP BY b.id, p.nome;

-- View para relatório de projetos
CREATE VIEW v_relatorio_projetos AS
SELECT 
    pr.id,
    pr.nome,
    pr.descricao,
    pr.data_inicio,
    pr.data_fim,
    pr.status,
    prof.nome as coordenador_nome,
    pr.vagas_total,
    pr.vagas_ocupadas,
    (pr.vagas_total - pr.vagas_ocupadas) as vagas_disponiveis,
    ROUND((pr.vagas_ocupadas::DECIMAL / NULLIF(pr.vagas_total, 0) * 100), 2) as percentual_ocupacao,
    COUNT(pp.beneficiaria_id) as total_participantes,
    COUNT(pp.beneficiaria_id) FILTER (WHERE pp.status = 'participando') as participantes_ativas
FROM public.projetos pr
LEFT JOIN public.profiles prof ON pr.coordenador_id = prof.id
LEFT JOIN public.projeto_participantes pp ON pr.id = pp.projeto_id
GROUP BY pr.id, prof.nome;
```

### 5. Configuração de RLS (Row Level Security)

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE public.beneficiarias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oficinas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anamnese_social ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fichas_evolucao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens ENABLE ROW LEVEL SECURITY;

-- Políticas básicas de acesso
CREATE POLICY "Acesso baseado em nível" ON public.beneficiarias
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND (nivel_acesso IN ('admin', 'coordenador') OR id = responsavel_id)
        )
    );

CREATE POLICY "Mensagens visíveis para remetente e destinatário" ON public.mensagens
    FOR SELECT USING (
        remetente_id = auth.uid() OR destinatario_id = auth.uid()
    );
```

## Processo de Migração

### 1. Backup dos Dados Atuais
```bash
# Exportar dados do Supabase atual
supabase db dump --local > backup_pre_migration.sql
```

### 2. Aplicar Schema em Produção
```bash
# Aplicar as migrações
supabase migration up
```

### 3. Migração de Dados
```sql
-- Script de migração dos dados existentes
-- Adaptar conforme estrutura atual
```

### 4. Configuração de Ambiente
```bash
# Variáveis de ambiente para produção
SUPABASE_URL=sua_url_de_producao
SUPABASE_ANON_KEY=sua_chave_anonima
SUPABASE_SERVICE_ROLE_KEY=sua_chave_de_servico
```

### 5. Testes Pós-Migração
- Verificar integridade dos dados
- Testar funcionalidades críticas
- Validar permissões e segurança
- Testar performance das consultas

## Considerações de Performance

### Índices Recomendados
```sql
-- Índices para otimização de consultas frequentes
CREATE INDEX CONCURRENTLY idx_beneficiarias_search 
ON public.beneficiarias USING gin(to_tsvector('portuguese', nome || ' ' || COALESCE(sobrenome, '')));

CREATE INDEX CONCURRENTLY idx_projetos_status_data 
ON public.projetos(status, data_inicio);

CREATE INDEX CONCURRENTLY idx_mensagens_composite 
ON public.mensagens(destinatario_id, lida, created_at DESC);
```

### Configurações de Cache
```sql
-- Configurar cache para views materialized se necessário
CREATE MATERIALIZED VIEW mv_estatisticas_gerais AS
SELECT 
    COUNT(*) as total_beneficiarias,
    COUNT(*) FILTER (WHERE status = 'ativa') as beneficiarias_ativas,
    COUNT(DISTINCT responsavel_id) as responsaveis_unicos
FROM public.beneficiarias;

-- Refresh automático
CREATE OR REPLACE FUNCTION refresh_estatisticas()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW mv_estatisticas_gerais;
END;
$$ LANGUAGE plpgsql;
```

## Monitoramento e Manutenção

### Logs e Auditoria
```sql
-- Tabela de auditoria
CREATE TABLE public.audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tabela VARCHAR NOT NULL,
    operacao VARCHAR NOT NULL, -- INSERT, UPDATE, DELETE
    registro_id UUID,
    dados_anteriores JSONB,
    dados_novos JSONB,
    usuario_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Função de auditoria
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_anteriores, usuario_id)
        VALUES (TG_TABLE_NAME, TG_OP, OLD.id, row_to_json(OLD), auth.uid());
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_anteriores, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(OLD), row_to_json(NEW), auth.uid());
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (tabela, operacao, registro_id, dados_novos, usuario_id)
        VALUES (TG_TABLE_NAME, TG_OP, NEW.id, row_to_json(NEW), auth.uid());
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;
```

### Backup e Recuperação
```bash
# Script de backup diário
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -h seu_host -U seu_usuario -d sua_database > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://seu-bucket/backups/
```
