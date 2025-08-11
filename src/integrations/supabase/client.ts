// Arquivo temporário para evitar erros de importação
// Este arquivo será removido após migração completa para PostgreSQL
export const supabase = {
  from: () => ({
    select: () => ({ 
      count: 0,
      data: [],
      error: null
    }),
    insert: () => ({ error: null }),
    update: () => ({ error: null }),
    delete: () => ({ error: null })
  }),
  auth: {
    getSession: () => ({ data: { session: null }, error: null }),
    signInWithPassword: () => ({ data: null, error: null }),
    signOut: () => ({ error: null })
  }
};
