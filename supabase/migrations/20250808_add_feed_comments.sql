-- Migration para adicionar sistema de comentários no feed
-- Data: 2025-08-08

-- Tabela de comentários nos posts do feed
CREATE TABLE public.feed_comentarios (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    conteudo TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.feed_comentarios ENABLE ROW LEVEL SECURITY;

-- Policies para comentários
CREATE POLICY "Authenticated users can view comments" ON public.feed_comentarios
    FOR SELECT USING (
        ativo = true AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Authenticated users can create comments" ON public.feed_comentarios
    FOR INSERT WITH CHECK (
        auth.uid() = author_id AND 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid())
    );

CREATE POLICY "Authors can update their comments" ON public.feed_comentarios
    FOR UPDATE USING (
        auth.uid() = author_id
    );

CREATE POLICY "Authors and admins can delete comments" ON public.feed_comentarios
    FOR DELETE USING (
        auth.uid() = author_id OR 
        EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND tipo_usuario = 'admin')
    );

-- Trigger para updated_at
CREATE TRIGGER update_feed_comentarios_updated_at
    BEFORE UPDATE ON public.feed_comentarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_feed_comentarios_post_id ON public.feed_comentarios(post_id, created_at);
CREATE INDEX idx_feed_comentarios_author ON public.feed_comentarios(author_id);

-- View para comentários com dados do autor
CREATE VIEW public.feed_comentarios_with_author AS
SELECT 
    c.*,
    p.nome_completo as author_nome,
    p.avatar_url as author_foto
FROM public.feed_comentarios c
JOIN public.profiles p ON c.author_id = p.user_id
WHERE c.ativo = true
ORDER BY c.created_at ASC;

-- Função para contar comentários por post
CREATE OR REPLACE FUNCTION public.count_post_comments(post_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT COUNT(*)::INTEGER 
        FROM public.feed_comentarios 
        WHERE post_id = post_uuid AND ativo = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
