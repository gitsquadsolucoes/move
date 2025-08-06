-- Criar usuário Bruno diretamente no banco de dados
-- Inserir na tabela auth.users com estrutura simplificada
INSERT INTO auth.users (
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'Bruno@move.com',
  crypt('15002031', gen_salt('bf')),
  now(),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"nome_completo": "Bruno Santos", "tipo_usuario": "admin"}',
  now(),
  now()
);