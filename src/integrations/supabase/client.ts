// Arquivo temporário para evitar erros de importação
// Este arquivo será removido após migração completa para PostgreSQL

const createMockQuery = () => ({
  select: (fields?: string) => createMockQuery(),
  insert: (data?: any) => Promise.resolve({ data: null, error: null }),
  update: (data?: any) => Promise.resolve({ data: null, error: null }),
  delete: () => Promise.resolve({ data: null, error: null }),
  eq: (field: string, value: any) => createMockQuery(),
  neq: (field: string, value: any) => createMockQuery(),
  in: (field: string, values: any[]) => createMockQuery(),
  order: (field: string, options?: any) => createMockQuery(),
  limit: (count: number) => createMockQuery(),
  single: () => Promise.resolve({ data: null, error: null }),
  maybeSingle: () => Promise.resolve({ data: null, error: null }),
  then: (resolve: Function) => {
    resolve({ data: [], error: null, count: 0 });
    return Promise.resolve({ data: [], error: null, count: 0 });
  }
});

export const supabase = {
  from: (table: string) => createMockQuery(),
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: null, error: null }),
    signOut: () => Promise.resolve({ error: null })
  },
  channel: (name: string) => ({
    on: (event: string, config: any, callback: Function) => ({
      subscribe: () => ({ unsubscribe: () => {} })
    }),
    subscribe: () => ({ unsubscribe: () => {} })
  }),
  removeChannel: (channel: any) => {}
};
