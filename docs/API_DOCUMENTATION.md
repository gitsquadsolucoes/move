# Documentação das APIs Customizadas
## Sistema Assist Move Assist

### Índice
1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [APIs do Sistema](#apis-do-sistema)
4. [Modelos de Dados](#modelos-de-dados)
5. [Códigos de Erro](#códigos-de-erro)
6. [Exemplos de Uso](#exemplos-de-uso)

---

## Visão Geral

O sistema Assist Move Assist utiliza **Supabase** como backend principal, fornecendo APIs REST automáticas e subscriptions em tempo real. Além disso, implementa serviços customizados para funcionalidades específicas.

### Tecnologias
- **Backend**: Supabase (PostgreSQL + API REST automática)
- **Autenticação**: Supabase Auth com RLS (Row Level Security)
- **Real-time**: Supabase Realtime Subscriptions
- **Frontend**: React + TypeScript

---

## Autenticação

### Configuração Base
```typescript
import { supabase } from '@/integrations/supabase/client';
```

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'usuario@exemplo.com',
  password: 'senha123'
});
```

### Logout
```typescript
const { error } = await supabase.auth.signOut();
```

### Verificar Sessão Atual
```typescript
const { data: session } = await supabase.auth.getSession();
```

---

## APIs do Sistema

### 1. Beneficiárias

#### Listar Beneficiárias
```typescript
// GET - Listar todas as beneficiárias
const { data, error } = await supabase
  .from('beneficiarias')
  .select('*')
  .order('nome_completo', { ascending: true });

// GET - Buscar por CPF
const { data, error } = await supabase
  .from('beneficiarias')
  .select('*')
  .eq('cpf', '12345678901');
```

#### Criar Beneficiária
```typescript
// POST - Criar nova beneficiária
const { data, error } = await supabase
  .from('beneficiarias')
  .insert([{
    nome_completo: 'Maria Silva',
    cpf: '12345678901',
    data_nascimento: '1990-01-01',
    endereco: 'Rua das Flores, 123',
    contato1: '11999999999',
    created_by: userId,
    updated_by: userId
  }]);
```

#### Atualizar Beneficiária
```typescript
// PUT - Atualizar beneficiária existente
const { data, error } = await supabase
  .from('beneficiarias')
  .update({
    endereco: 'Novo endereço',
    updated_by: userId,
    updated_at: new Date().toISOString()
  })
  .eq('id', beneficiariaId);
```

#### Excluir Beneficiária
```typescript
// DELETE - Excluir beneficiária
const { error } = await supabase
  .from('beneficiarias')
  .delete()
  .eq('id', beneficiariaId);
```

### 2. Feed e Comentários

#### Criar Post no Feed
```typescript
const { data, error } = await supabase
  .from('feed_posts')
  .insert([{
    titulo: 'Título do post',
    conteudo: 'Conteúdo do post',
    autor_id: userId,
    tipo: 'anuncio' // ou 'noticia', 'evento'
  }]);
```

#### Listar Posts com Comentários
```typescript
const { data, error } = await supabase
  .from('feed_posts')
  .select(`
    *,
    autor:profiles(nome_completo),
    comentarios:feed_comments(
      *,
      autor:profiles(nome_completo)
    )
  `)
  .order('created_at', { ascending: false });
```

#### Adicionar Comentário
```typescript
const { data, error } = await supabase
  .from('feed_comments')
  .insert([{
    post_id: postId,
    conteudo: 'Texto do comentário',
    autor_id: userId
  }]);
```

#### Curtir/Descurtir Post
```typescript
// Curtir
const { data, error } = await supabase
  .from('feed_likes')
  .insert([{
    post_id: postId,
    user_id: userId
  }]);

// Descurtir
const { error } = await supabase
  .from('feed_likes')
  .delete()
  .eq('post_id', postId)
  .eq('user_id', userId);
```

### 3. Oficinas e Presenças

#### Listar Oficinas
```typescript
const { data, error } = await supabase
  .from('oficinas')
  .select(`
    *,
    presencas:oficina_presencas(
      *,
      beneficiaria:beneficiarias(nome_completo)
    )
  `)
  .order('data_oficina', { ascending: false });
```

#### Registrar Presença
```typescript
const { data, error } = await supabase
  .from('oficina_presencas')
  .insert([{
    oficina_id: oficinaId,
    beneficiaria_id: beneficiariaId,
    presente: true,
    observacoes: 'Participou ativamente'
  }]);
```

### 4. Tarefas

#### Listar Tarefas
```typescript
const { data, error } = await supabase
  .from('tarefas')
  .select(`
    *,
    responsavel:profiles(nome_completo),
    beneficiaria:beneficiarias(nome_completo)
  `)
  .order('data_vencimento', { ascending: true });
```

#### Marcar Tarefa como Concluída
```typescript
const { data, error } = await supabase
  .from('tarefas')
  .update({
    status: 'concluida',
    data_conclusao: new Date().toISOString(),
    updated_by: userId
  })
  .eq('id', tarefaId);
```

### 5. Relatórios

#### Gerar Relatório de Beneficiárias
```typescript
const { data, error } = await supabase
  .from('beneficiarias')
  .select(`
    nome_completo,
    cpf,
    data_nascimento,
    endereco,
    contato1,
    data_inicio_instituto,
    programa_servico
  `)
  .order('nome_completo');
```

#### Relatório de Atividades por Período
```typescript
const { data, error } = await supabase
  .from('atividades')
  .select(`
    *,
    responsavel:profiles(nome_completo)
  `)
  .gte('data_atividade', '2025-01-01')
  .lte('data_atividade', '2025-12-31')
  .order('data_atividade', { ascending: false });
```

---

## Modelos de Dados

### Beneficiária
```typescript
interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  orgao_emissor_rg?: string;
  data_emissao_rg?: string;
  data_nascimento: string;
  endereco?: string;
  bairro?: string;
  nis?: string;
  contato1: string;
  contato2?: string;
  referencia?: string;
  data_inicio_instituto: string;
  programa_servico?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
```

### Post do Feed
```typescript
interface FeedPost {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'anuncio' | 'noticia' | 'evento';
  autor_id: string;
  imagem_url?: string;
  created_at: string;
  updated_at: string;
}
```

### Comentário
```typescript
interface FeedComment {
  id: string;
  post_id: string;
  conteudo: string;
  autor_id: string;
  created_at: string;
}
```

### Tarefa
```typescript
interface Tarefa {
  id: string;
  titulo: string;
  descricao?: string;
  beneficiaria_id?: string;
  responsavel_id: string;
  data_vencimento: string;
  prioridade: 'baixa' | 'media' | 'alta';
  status: 'pendente' | 'em_andamento' | 'concluida' | 'cancelada';
  categoria?: string;
  data_conclusao?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}
```

---

## Códigos de Erro

### Códigos Supabase Comuns
- **23505**: Violação de chave única (ex: CPF duplicado)
- **23503**: Violação de chave estrangeira
- **42501**: Permissão negada (RLS)
- **PGRST116**: Nenhum resultado encontrado

### Tratamento de Erros
```typescript
try {
  const { data, error } = await supabase
    .from('beneficiarias')
    .insert([beneficiaria]);
    
  if (error) {
    if (error.code === '23505') {
      throw new Error('CPF já cadastrado no sistema');
    }
    throw new Error(error.message);
  }
  
  return data;
} catch (error) {
  logger.error('Erro ao criar beneficiária', error);
  throw error;
}
```

---

## Exemplos de Uso

### 1. Sistema de Busca Avançada
```typescript
// Buscar beneficiárias com filtros múltiplos
const { data, error } = await supabase
  .from('beneficiarias')
  .select('*')
  .ilike('nome_completo', `%${nome}%`)
  .eq('programa_servico', programa)
  .gte('data_inicio_instituto', dataInicio)
  .order('nome_completo');
```

### 2. Subscription em Tempo Real
```typescript
// Escutar mudanças no feed
const subscription = supabase
  .channel('feed_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'feed_posts'
  }, (payload) => {
    console.log('Mudança no feed:', payload);
    // Atualizar estado local
  })
  .subscribe();

// Cleanup
return () => {
  subscription.unsubscribe();
};
```

### 3. Upload de Arquivos
```typescript
// Upload de imagem para o feed
const file = event.target.files[0];
const fileName = `feed/${Date.now()}_${file.name}`;

const { data, error } = await supabase.storage
  .from('images')
  .upload(fileName, file);

if (!error) {
  const { data: urlData } = supabase.storage
    .from('images')
    .getPublicUrl(fileName);
    
  // Usar urlData.publicUrl no post
}
```

### 4. Relatórios Complexos
```typescript
// Relatório de produtividade mensal
const { data, error } = await supabase
  .rpc('relatorio_produtividade', {
    mes_inicio: '2025-01-01',
    mes_fim: '2025-01-31'
  });
```

---

## Segurança e Permissões

### Row Level Security (RLS)
Todas as tabelas possuem políticas RLS ativas que garantem:
- Usuários só acessam dados de sua organização
- Admins têm acesso completo
- Usuários comuns têm acesso limitado

### Exemplo de Política RLS
```sql
-- Beneficiárias: usuários autenticados podem ver todas
CREATE POLICY "Usuários podem ver beneficiárias" ON beneficiarias
FOR SELECT USING (auth.role() = 'authenticated');

-- Beneficiárias: apenas admins podem inserir
CREATE POLICY "Apenas admins podem criar beneficiárias" ON beneficiarias
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);
```

---

## Performance e Otimização

### Índices Recomendados
```sql
-- Índice para busca por CPF
CREATE INDEX idx_beneficiarias_cpf ON beneficiarias(cpf);

-- Índice para ordenação por nome
CREATE INDEX idx_beneficiarias_nome ON beneficiarias(nome_completo);

-- Índice para posts do feed por data
CREATE INDEX idx_feed_posts_created_at ON feed_posts(created_at DESC);
```

### Paginação
```typescript
const ITEMS_PER_PAGE = 50;

const { data, error } = await supabase
  .from('beneficiarias')
  .select('*')
  .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
  .order('nome_completo');
```

---

## Monitoramento e Logs

### Sistema de Logging
```typescript
import { logger } from '@/lib/logger';

// Log de ação do usuário
logger.info('Beneficiária criada', {
  page: '/beneficiarias/novo',
  action: 'create_beneficiaria',
  userId: user.id
});

// Log de erro
logger.error('Erro ao salvar', error, {
  page: '/beneficiarias',
  action: 'save_error'
});
```

### Métricas de Performance
```typescript
// Monitorar tempo de carregamento
const startTime = performance.now();
const data = await fetchBeneficiarias();
const endTime = performance.now();

logger.info('Performance de consulta', {
  action: 'beneficiarias_fetch',
  duration: endTime - startTime,
  recordCount: data.length
});
```
