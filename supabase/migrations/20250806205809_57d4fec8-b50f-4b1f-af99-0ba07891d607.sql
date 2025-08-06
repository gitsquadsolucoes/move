-- Testar se a senha está correta para o usuário Bruno
SELECT 
  email,
  encrypted_password,
  crypt('15002031', encrypted_password) = encrypted_password as senha_correta
FROM auth.users 
WHERE email = 'Bruno@move.com';