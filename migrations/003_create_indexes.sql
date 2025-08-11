-- Índices para otimização de performance
-- Criado em: 2025-08-11

-- Índice para buscas por CPF (campo único e muito consultado)
CREATE INDEX IF NOT EXISTS idx_beneficiarias_cpf ON beneficiarias(cpf);

-- Índice para pesquisa por nome (busca frequente)
CREATE INDEX IF NOT EXISTS idx_beneficiarias_nome ON beneficiarias USING gin(nome_completo gin_trgm_ops);

-- Índice para buscas por data de criação (ordenação padrão)
CREATE INDEX IF NOT EXISTS idx_beneficiarias_data_criacao ON beneficiarias(data_criacao DESC);

-- Índice para status ativo/inativo
CREATE INDEX IF NOT EXISTS idx_beneficiarias_ativo ON beneficiarias(ativo) WHERE ativo = true;

-- Índices para relacionamentos frequentes
-- Presenças em oficinas
CREATE INDEX IF NOT EXISTS idx_presencas_oficina_id ON presencas_oficinas(oficina_id);
CREATE INDEX IF NOT EXISTS idx_presencas_beneficiaria_id ON presencas_oficinas(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_presencas_data ON presencas_oficinas(data_presenca DESC);

-- Índices para feed/posts (se existir)
CREATE INDEX IF NOT EXISTS idx_feed_posts_data ON feed_posts(data_criacao DESC) WHERE ativo = true;
CREATE INDEX IF NOT EXISTS idx_feed_posts_autor ON feed_posts(autor_id);

-- Índices para comentários (se existir)
CREATE INDEX IF NOT EXISTS idx_comentarios_post_id ON comentarios(post_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_data ON comentarios(data_criacao DESC);

-- Índices para formulários e documentos
CREATE INDEX IF NOT EXISTS idx_anamneses_beneficiaria ON anamneses_social(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_anamneses_data ON anamneses_social(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_evolucoes_beneficiaria ON fichas_evolucao(beneficiaria_id);
CREATE INDEX IF NOT EXISTS idx_evolucoes_data ON fichas_evolucao(created_at DESC);

-- Índices para logs de auditoria (se existir)
CREATE INDEX IF NOT EXISTS idx_audit_logs_tabela ON audit_logs(tabela_afetada);
CREATE INDEX IF NOT EXISTS idx_audit_logs_data ON audit_logs(data_alteracao DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_usuario ON audit_logs(usuario_id);

-- Extensão para busca textual (se não existir)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índice composto para filtros comuns
CREATE INDEX IF NOT EXISTS idx_beneficiarias_status_data 
ON beneficiarias(ativo, data_criacao DESC) 
WHERE ativo = true;

-- Estatísticas para o otimizador
ANALYZE beneficiarias;
ANALYZE presencas_oficinas;
ANALYZE anamneses_social;
ANALYZE fichas_evolucao;

-- Comentários explicativos
COMMENT ON INDEX idx_beneficiarias_cpf IS 'Índice para busca rápida por CPF';
COMMENT ON INDEX idx_beneficiarias_nome IS 'Índice GIN para busca textual no nome';
COMMENT ON INDEX idx_beneficiarias_data_criacao IS 'Índice para ordenação por data de criação';
COMMENT ON INDEX idx_beneficiarias_status_data IS 'Índice composto para filtros comuns (ativo + data)';
