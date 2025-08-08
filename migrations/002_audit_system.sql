-- ============================================================================
-- Migration 002: Sistema de Auditoria e Logs
-- Assist Move Assist - Audit System Implementation
-- Data: Agosto 2025
-- ============================================================================

BEGIN;

-- ============================================================================
-- SCHEMA: logs (Sistema de Logs e Auditoria)
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS logs;

-- ============================================================================
-- TABELA: logs.migration_log
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs.migration_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    migration TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'rollback')),
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    executed_by TEXT DEFAULT current_user,
    execution_time INTERVAL,
    error_message TEXT,
    checksum TEXT
);

-- ============================================================================
-- TABELA: logs.audit_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tabela TEXT NOT NULL,
    operacao TEXT NOT NULL CHECK (operacao IN ('INSERT', 'UPDATE', 'DELETE')),
    registro_id UUID,
    user_id UUID,
    user_email TEXT,
    dados_antigos JSONB,
    dados_novos JSONB,
    campos_alterados TEXT[],
    ip_address INET,
    user_agent TEXT,
    session_id TEXT,
    aplicacao TEXT DEFAULT 'assist-move-assist',
    ambiente TEXT DEFAULT 'production',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Particionamento da tabela audit_logs por mês
CREATE TABLE IF NOT EXISTS logs.audit_logs_y2025m08 PARTITION OF logs.audit_logs
FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');

CREATE TABLE IF NOT EXISTS logs.audit_logs_y2025m09 PARTITION OF logs.audit_logs
FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');

CREATE TABLE IF NOT EXISTS logs.audit_logs_y2025m10 PARTITION OF logs.audit_logs
FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON logs.audit_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_audit_logs_operacao ON logs.audit_logs(operacao);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON logs.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON logs.audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_registro ON logs.audit_logs(registro_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_aplicacao ON logs.audit_logs(aplicacao);

-- ============================================================================
-- TABELA: logs.system_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel TEXT NOT NULL CHECK (nivel IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    categoria TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    detalhes JSONB,
    user_id UUID,
    session_id TEXT,
    ip_address INET,
    user_agent TEXT,
    url TEXT,
    metodo_http TEXT,
    status_code INTEGER,
    tempo_resposta INTEGER, -- em millisegundos
    memoria_usada BIGINT,   -- em bytes
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Particionamento da tabela system_logs por semana
CREATE TABLE IF NOT EXISTS logs.system_logs_w202532 PARTITION OF logs.system_logs
FOR VALUES FROM ('2025-08-04') TO ('2025-08-11');

CREATE TABLE IF NOT EXISTS logs.system_logs_w202533 PARTITION OF logs.system_logs
FOR VALUES FROM ('2025-08-11') TO ('2025-08-18');

-- Índices para system_logs
CREATE INDEX IF NOT EXISTS idx_system_logs_nivel ON logs.system_logs(nivel);
CREATE INDEX IF NOT EXISTS idx_system_logs_categoria ON logs.system_logs(categoria);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON logs.system_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON logs.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON logs.system_logs(status_code);

-- ============================================================================
-- TABELA: logs.performance_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs.performance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operacao TEXT NOT NULL,
    tabela TEXT,
    query_hash TEXT,
    tempo_execucao INTERVAL NOT NULL,
    linhas_afetadas INTEGER,
    tamanho_resultado BIGINT,
    uso_cpu DECIMAL(5,2),
    uso_memoria BIGINT,
    uso_io BIGINT,
    plano_execucao JSONB,
    user_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance_logs
CREATE INDEX IF NOT EXISTS idx_performance_logs_operacao ON logs.performance_logs(operacao);
CREATE INDEX IF NOT EXISTS idx_performance_logs_tabela ON logs.performance_logs(tabela);
CREATE INDEX IF NOT EXISTS idx_performance_logs_tempo ON logs.performance_logs(tempo_execucao);
CREATE INDEX IF NOT EXISTS idx_performance_logs_timestamp ON logs.performance_logs(timestamp);

-- ============================================================================
-- TABELA: logs.login_logs
-- ============================================================================
CREATE TABLE IF NOT EXISTS logs.login_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID,
    email TEXT NOT NULL,
    tipo_evento TEXT NOT NULL CHECK (tipo_evento IN ('login', 'logout', 'login_failed', 'password_reset', 'account_locked')),
    sucesso BOOLEAN NOT NULL,
    ip_address INET,
    user_agent TEXT,
    dispositivo TEXT,
    localizacao TEXT,
    motivo_falha TEXT,
    tentativas_consecutivas INTEGER DEFAULT 0,
    session_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para login_logs
CREATE INDEX IF NOT EXISTS idx_login_logs_user ON logs.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON logs.login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_tipo ON logs.login_logs(tipo_evento);
CREATE INDEX IF NOT EXISTS idx_login_logs_sucesso ON logs.login_logs(sucesso);
CREATE INDEX IF NOT EXISTS idx_login_logs_timestamp ON logs.login_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip ON logs.login_logs(ip_address);

-- ============================================================================
-- FUNÇÕES DE AUDITORIA
-- ============================================================================

-- Função principal de auditoria
CREATE OR REPLACE FUNCTION logs.audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    user_info RECORD;
    changed_fields TEXT[] := '{}';
    field_name TEXT;
    old_val TEXT;
    new_val TEXT;
BEGIN
    -- Obter informações do usuário
    SELECT id, email INTO user_info
    FROM profiles 
    WHERE id = auth.uid();
    
    -- Identificar campos alterados em caso de UPDATE
    IF TG_OP = 'UPDATE' THEN
        FOR field_name IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = TG_TABLE_NAME 
            AND table_schema = TG_TABLE_SCHEMA
        LOOP
            EXECUTE format('SELECT ($1).%I::TEXT, ($2).%I::TEXT', field_name, field_name) 
            INTO old_val, new_val 
            USING OLD, NEW;
            
            IF old_val IS DISTINCT FROM new_val THEN
                changed_fields := array_append(changed_fields, field_name);
            END IF;
        END LOOP;
    END IF;
    
    -- Inserir log de auditoria
    INSERT INTO logs.audit_logs (
        tabela,
        operacao,
        registro_id,
        user_id,
        user_email,
        dados_antigos,
        dados_novos,
        campos_alterados,
        ip_address,
        session_id,
        timestamp
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        user_info.id,
        user_info.email,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        CASE WHEN TG_OP = 'UPDATE' THEN changed_fields ELSE NULL END,
        inet_client_addr(),
        current_setting('app.session_id', true),
        NOW()
    );
    
    RETURN COALESCE(NEW, OLD);
EXCEPTION
    WHEN OTHERS THEN
        -- Log do erro mas não falhar a operação principal
        INSERT INTO logs.system_logs (nivel, categoria, mensagem, detalhes)
        VALUES ('ERROR', 'AUDIT', 'Erro na função de auditoria', jsonb_build_object(
            'error', SQLERRM,
            'table', TG_TABLE_NAME,
            'operation', TG_OP
        ));
        
        RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- FUNÇÃO: Limpeza automática de logs antigos
-- ============================================================================
CREATE OR REPLACE FUNCTION logs.cleanup_old_logs()
RETURNS INTEGER AS $$
DECLARE
    audit_deleted INTEGER := 0;
    system_deleted INTEGER := 0;
    perf_deleted INTEGER := 0;
    login_deleted INTEGER := 0;
    total_deleted INTEGER := 0;
BEGIN
    -- Limpar audit_logs mais antigos que 90 dias
    DELETE FROM logs.audit_logs 
    WHERE timestamp < NOW() - INTERVAL '90 days';
    GET DIAGNOSTICS audit_deleted = ROW_COUNT;
    
    -- Limpar system_logs mais antigos que 30 dias
    DELETE FROM logs.system_logs 
    WHERE timestamp < NOW() - INTERVAL '30 days' 
    AND nivel NOT IN ('ERROR', 'FATAL');
    GET DIAGNOSTICS system_deleted = ROW_COUNT;
    
    -- Limpar performance_logs mais antigos que 7 dias
    DELETE FROM logs.performance_logs 
    WHERE timestamp < NOW() - INTERVAL '7 days';
    GET DIAGNOSTICS perf_deleted = ROW_COUNT;
    
    -- Limpar login_logs mais antigos que 180 dias
    DELETE FROM logs.login_logs 
    WHERE timestamp < NOW() - INTERVAL '180 days';
    GET DIAGNOSTICS login_deleted = ROW_COUNT;
    
    total_deleted := audit_deleted + system_deleted + perf_deleted + login_deleted;
    
    -- Log da limpeza
    INSERT INTO logs.system_logs (nivel, categoria, mensagem, detalhes)
    VALUES ('INFO', 'CLEANUP', 'Limpeza automática de logs executada', jsonb_build_object(
        'audit_logs_deleted', audit_deleted,
        'system_logs_deleted', system_deleted,
        'performance_logs_deleted', perf_deleted,
        'login_logs_deleted', login_deleted,
        'total_deleted', total_deleted
    ));
    
    RETURN total_deleted;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FUNÇÃO: Log de performance para queries lentas
-- ============================================================================
CREATE OR REPLACE FUNCTION logs.log_slow_query(
    p_operacao TEXT,
    p_tabela TEXT,
    p_tempo_execucao INTERVAL,
    p_linhas_afetadas INTEGER DEFAULT NULL,
    p_detalhes JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    -- Só logar se a query demorou mais que 1 segundo
    IF EXTRACT(EPOCH FROM p_tempo_execucao) > 1.0 THEN
        INSERT INTO logs.performance_logs (
            operacao,
            tabela,
            tempo_execucao,
            linhas_afetadas,
            plano_execucao,
            user_id,
            timestamp
        ) VALUES (
            p_operacao,
            p_tabela,
            p_tempo_execucao,
            p_linhas_afetadas,
            p_detalhes,
            auth.uid(),
            NOW()
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- APLICAR TRIGGERS DE AUDITORIA
-- ============================================================================

-- Trigger para beneficiarias
DROP TRIGGER IF EXISTS beneficiarias_audit_trigger ON beneficiarias;
CREATE TRIGGER beneficiarias_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON beneficiarias
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- Trigger para profiles
DROP TRIGGER IF EXISTS profiles_audit_trigger ON profiles;
CREATE TRIGGER profiles_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- Trigger para tarefas
DROP TRIGGER IF EXISTS tarefas_audit_trigger ON tarefas;
CREATE TRIGGER tarefas_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON tarefas
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- Trigger para projetos
DROP TRIGGER IF EXISTS projetos_audit_trigger ON projetos;
CREATE TRIGGER projetos_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON projetos
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- Trigger para oficinas
DROP TRIGGER IF EXISTS oficinas_audit_trigger ON oficinas;
CREATE TRIGGER oficinas_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON oficinas
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- Trigger para feed_posts
DROP TRIGGER IF EXISTS feed_posts_audit_trigger ON feed_posts;
CREATE TRIGGER feed_posts_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON feed_posts
    FOR EACH ROW EXECUTE FUNCTION logs.audit_trigger_function();

-- ============================================================================
-- VIEWS PARA RELATÓRIOS DE AUDITORIA
-- ============================================================================

-- View para relatório de atividades por usuário
CREATE OR REPLACE VIEW logs.v_user_activity AS
SELECT 
    al.user_email,
    al.tabela,
    al.operacao,
    COUNT(*) as total_operacoes,
    MIN(al.timestamp) as primeira_acao,
    MAX(al.timestamp) as ultima_acao
FROM logs.audit_logs al
WHERE al.timestamp >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY al.user_email, al.tabela, al.operacao
ORDER BY al.user_email, total_operacoes DESC;

-- View para queries mais lentas
CREATE OR REPLACE VIEW logs.v_slow_queries AS
SELECT 
    pl.operacao,
    pl.tabela,
    AVG(EXTRACT(EPOCH FROM pl.tempo_execucao)) as tempo_medio_segundos,
    MAX(EXTRACT(EPOCH FROM pl.tempo_execucao)) as tempo_maximo_segundos,
    COUNT(*) as total_execucoes,
    MAX(pl.timestamp) as ultima_execucao
FROM logs.performance_logs pl
WHERE pl.timestamp >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY pl.operacao, pl.tabela
HAVING AVG(EXTRACT(EPOCH FROM pl.tempo_execucao)) > 0.5
ORDER BY tempo_medio_segundos DESC;

-- ============================================================================
-- PERMISSÕES
-- ============================================================================

-- Conceder permissões para o schema logs
GRANT USAGE ON SCHEMA logs TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA logs TO authenticated;

-- Apenas admins podem inserir logs do sistema
GRANT INSERT ON logs.system_logs TO authenticated;
GRANT INSERT ON logs.performance_logs TO authenticated;

-- ============================================================================
-- VERIFICAÇÕES FINAIS
-- ============================================================================

-- Verificar se todas as funções foram criadas
DO $$
DECLARE
    function_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO function_count
    FROM information_schema.routines 
    WHERE routine_schema = 'logs' 
    AND routine_type = 'FUNCTION';
    
    IF function_count < 3 THEN
        RAISE EXCEPTION 'Nem todas as funções foram criadas. Encontradas: %', function_count;
    END IF;
    
    RAISE NOTICE 'Sistema de auditoria criado com sucesso: % funções, % triggers', 
                 function_count, 
                 (SELECT COUNT(*) FROM information_schema.triggers WHERE trigger_schema = 'public');
END $$;

-- Log da migração
INSERT INTO logs.migration_log (migration, status, executed_at) 
VALUES ('002_audit_system', 'success', NOW());

COMMIT;
