-- Criar o primeiro usuário administrador do sistema
INSERT INTO public.profiles (id, user_id, nome_completo, email, tipo_usuario)
VALUES (
  gen_random_uuid(),
  gen_random_uuid(), -- Será substituído quando o usuário se registrar
  'Bruno Santos',
  'Bruno@move.com',
  'admin'
);

-- Adicionar comentário para identificar que este é um perfil placeholder
COMMENT ON TABLE public.profiles IS 'Tabela de perfis de usuários. Perfis placeholder são criados antes do registro efetivo no Supabase Auth.';