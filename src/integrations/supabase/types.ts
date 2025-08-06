export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      anamneses_social: {
        Row: {
          assinatura_beneficiaria: boolean | null
          assinatura_tecnica: boolean | null
          beneficiaria_id: string
          data_anamnese: string
          data_criacao: string
          deficiencia: boolean | null
          desafios_deficiencia: string | null
          desafios_doenca: string | null
          desafios_idosos: string | null
          desafios_transtorno: string | null
          doenca_cronica_degenerativa: boolean | null
          id: string
          idosos_dependentes: boolean | null
          observacoes_importantes: string | null
          transtorno_mental_desenvolvimento: boolean | null
          uso_alcool: boolean | null
          uso_cigarros: boolean | null
          uso_drogas_ilicitas: boolean | null
          uso_outros: string | null
          vulnerabilidades: string[] | null
        }
        Insert: {
          assinatura_beneficiaria?: boolean | null
          assinatura_tecnica?: boolean | null
          beneficiaria_id: string
          data_anamnese: string
          data_criacao?: string
          deficiencia?: boolean | null
          desafios_deficiencia?: string | null
          desafios_doenca?: string | null
          desafios_idosos?: string | null
          desafios_transtorno?: string | null
          doenca_cronica_degenerativa?: boolean | null
          id?: string
          idosos_dependentes?: boolean | null
          observacoes_importantes?: string | null
          transtorno_mental_desenvolvimento?: boolean | null
          uso_alcool?: boolean | null
          uso_cigarros?: boolean | null
          uso_drogas_ilicitas?: boolean | null
          uso_outros?: string | null
          vulnerabilidades?: string[] | null
        }
        Update: {
          assinatura_beneficiaria?: boolean | null
          assinatura_tecnica?: boolean | null
          beneficiaria_id?: string
          data_anamnese?: string
          data_criacao?: string
          deficiencia?: boolean | null
          desafios_deficiencia?: string | null
          desafios_doenca?: string | null
          desafios_idosos?: string | null
          desafios_transtorno?: string | null
          doenca_cronica_degenerativa?: boolean | null
          id?: string
          idosos_dependentes?: boolean | null
          observacoes_importantes?: string | null
          transtorno_mental_desenvolvimento?: boolean | null
          uso_alcool?: boolean | null
          uso_cigarros?: boolean | null
          uso_drogas_ilicitas?: boolean | null
          uso_outros?: string | null
          vulnerabilidades?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "anamneses_social_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiarias: {
        Row: {
          bairro: string | null
          contato1: string
          contato2: string | null
          cpf: string
          data_atualizacao: string
          data_criacao: string
          data_emissao_rg: string | null
          data_inicio_instituto: string | null
          data_nascimento: string
          endereco: string | null
          id: string
          idade: number | null
          nis: string | null
          nome_completo: string
          orgao_emissor_rg: string | null
          programa_servico: string | null
          referencia: string | null
          rg: string | null
        }
        Insert: {
          bairro?: string | null
          contato1: string
          contato2?: string | null
          cpf: string
          data_atualizacao?: string
          data_criacao?: string
          data_emissao_rg?: string | null
          data_inicio_instituto?: string | null
          data_nascimento: string
          endereco?: string | null
          id?: string
          idade?: number | null
          nis?: string | null
          nome_completo: string
          orgao_emissor_rg?: string | null
          programa_servico?: string | null
          referencia?: string | null
          rg?: string | null
        }
        Update: {
          bairro?: string | null
          contato1?: string
          contato2?: string | null
          cpf?: string
          data_atualizacao?: string
          data_criacao?: string
          data_emissao_rg?: string | null
          data_inicio_instituto?: string | null
          data_nascimento?: string
          endereco?: string | null
          id?: string
          idade?: number | null
          nis?: string | null
          nome_completo?: string
          orgao_emissor_rg?: string | null
          programa_servico?: string | null
          referencia?: string | null
          rg?: string | null
        }
        Relationships: []
      }
      conversas: {
        Row: {
          created_at: string | null
          id: string
          nome_grupo: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          nome_grupo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          nome_grupo?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      conversas_participantes: {
        Row: {
          conversa_id: string | null
          id: string
          joined_at: string | null
          last_read_at: string | null
          user_id: string | null
        }
        Insert: {
          conversa_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Update: {
          conversa_id?: string | null
          id?: string
          joined_at?: string | null
          last_read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversas_participantes_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      declaracoes_comparecimento: {
        Row: {
          beneficiaria_id: string
          data_comparecimento: string
          data_criacao: string
          hora_entrada: string | null
          hora_saida: string | null
          id: string
          profissional_responsavel: string
        }
        Insert: {
          beneficiaria_id: string
          data_comparecimento: string
          data_criacao?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          profissional_responsavel: string
        }
        Update: {
          beneficiaria_id?: string
          data_comparecimento?: string
          data_criacao?: string
          hora_entrada?: string | null
          hora_saida?: string | null
          id?: string
          profissional_responsavel?: string
        }
        Relationships: [
          {
            foreignKeyName: "declaracoes_comparecimento_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      feed_posts: {
        Row: {
          anexo_url: string | null
          ativo: boolean | null
          author_id: string | null
          conteudo: string
          created_at: string | null
          fixado: boolean | null
          id: string
          tipo: string | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          anexo_url?: string | null
          ativo?: boolean | null
          author_id?: string | null
          conteudo: string
          created_at?: string | null
          fixado?: boolean | null
          id?: string
          tipo?: string | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          anexo_url?: string | null
          ativo?: boolean | null
          author_id?: string | null
          conteudo?: string
          created_at?: string | null
          fixado?: boolean | null
          id?: string
          tipo?: string | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      fichas_evolucao: {
        Row: {
          assinatura_beneficiaria: boolean | null
          beneficiaria_id: string
          data_criacao: string
          data_evolucao: string
          descricao: string
          id: string
          responsavel: string
        }
        Insert: {
          assinatura_beneficiaria?: boolean | null
          beneficiaria_id: string
          data_criacao?: string
          data_evolucao: string
          descricao: string
          id?: string
          responsavel: string
        }
        Update: {
          assinatura_beneficiaria?: boolean | null
          beneficiaria_id?: string
          data_criacao?: string
          data_evolucao?: string
          descricao?: string
          id?: string
          responsavel?: string
        }
        Relationships: [
          {
            foreignKeyName: "fichas_evolucao_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      matriculas_projetos: {
        Row: {
          assinatura_coordenador: boolean | null
          assinatura_participante: boolean | null
          beneficiaria_id: string
          carga_horaria: string | null
          data_criacao: string
          data_inicio_projeto: string
          data_termino_projeto: string | null
          escolaridade: string | null
          id: string
          nome_projeto: string
          observacoes_matricula: string | null
          profissao: string | null
          renda_familiar: number | null
        }
        Insert: {
          assinatura_coordenador?: boolean | null
          assinatura_participante?: boolean | null
          beneficiaria_id: string
          carga_horaria?: string | null
          data_criacao?: string
          data_inicio_projeto: string
          data_termino_projeto?: string | null
          escolaridade?: string | null
          id?: string
          nome_projeto: string
          observacoes_matricula?: string | null
          profissao?: string | null
          renda_familiar?: number | null
        }
        Update: {
          assinatura_coordenador?: boolean | null
          assinatura_participante?: boolean | null
          beneficiaria_id?: string
          carga_horaria?: string | null
          data_criacao?: string
          data_inicio_projeto?: string
          data_termino_projeto?: string | null
          escolaridade?: string | null
          id?: string
          nome_projeto?: string
          observacoes_matricula?: string | null
          profissao?: string | null
          renda_familiar?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matriculas_projetos_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      membros_familia: {
        Row: {
          anamnese_id: string
          data_criacao: string
          data_nascimento: string | null
          id: string
          idade: number | null
          nome: string
          renda: number | null
          trabalha: boolean | null
        }
        Insert: {
          anamnese_id: string
          data_criacao?: string
          data_nascimento?: string | null
          id?: string
          idade?: number | null
          nome: string
          renda?: number | null
          trabalha?: boolean | null
        }
        Update: {
          anamnese_id?: string
          data_criacao?: string
          data_nascimento?: string | null
          id?: string
          idade?: number | null
          nome?: string
          renda?: number | null
          trabalha?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "membros_familia_anamnese_id_fkey"
            columns: ["anamnese_id"]
            isOneToOne: false
            referencedRelation: "anamneses_social"
            referencedColumns: ["id"]
          },
        ]
      }
      mensagens: {
        Row: {
          arquivo_url: string | null
          conteudo: string
          conversa_id: string | null
          created_at: string | null
          editada: boolean | null
          id: string
          sender_id: string | null
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          arquivo_url?: string | null
          conteudo: string
          conversa_id?: string | null
          created_at?: string | null
          editada?: boolean | null
          id?: string
          sender_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          arquivo_url?: string | null
          conteudo?: string
          conversa_id?: string | null
          created_at?: string | null
          editada?: boolean | null
          id?: string
          sender_id?: string | null
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_conversa_id_fkey"
            columns: ["conversa_id"]
            isOneToOne: false
            referencedRelation: "conversas"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          conteudo: string
          created_at: string | null
          data_leitura: string | null
          id: string
          lida: boolean | null
          metadata: Json | null
          tipo: string | null
          titulo: string
          url_acao: string | null
          user_id: string | null
        }
        Insert: {
          conteudo: string
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          metadata?: Json | null
          tipo?: string | null
          titulo: string
          url_acao?: string | null
          user_id?: string | null
        }
        Update: {
          conteudo?: string
          created_at?: string | null
          data_leitura?: string | null
          id?: string
          lida?: boolean | null
          metadata?: Json | null
          tipo?: string | null
          titulo?: string
          url_acao?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      oficinas: {
        Row: {
          ativa: boolean | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string
          descricao: string | null
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id: string
          instrutor: string
          nome: string
          updated_at: string | null
          vagas_ocupadas: number | null
          vagas_totais: number | null
        }
        Insert: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio: string
          descricao?: string | null
          dias_semana: string[]
          horario_fim: string
          horario_inicio: string
          id?: string
          instrutor: string
          nome: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_totais?: number | null
        }
        Update: {
          ativa?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string
          descricao?: string | null
          dias_semana?: string[]
          horario_fim?: string
          horario_inicio?: string
          id?: string
          instrutor?: string
          nome?: string
          updated_at?: string | null
          vagas_ocupadas?: number | null
          vagas_totais?: number | null
        }
        Relationships: []
      }
      oficinas_participantes: {
        Row: {
          beneficiaria_id: string | null
          created_at: string | null
          data_matricula: string | null
          id: string
          observacoes: string | null
          oficina_id: string | null
          status: string | null
        }
        Insert: {
          beneficiaria_id?: string | null
          created_at?: string | null
          data_matricula?: string | null
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          status?: string | null
        }
        Update: {
          beneficiaria_id?: string | null
          created_at?: string | null
          data_matricula?: string | null
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oficinas_participantes_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "oficinas_participantes_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      planos_acao: {
        Row: {
          acoes: string
          acoes_realizadas: string | null
          acompanhamento: string | null
          areas_prioritarias: Json | null
          assinatura_beneficiaria: boolean | null
          assinatura_responsavel_tecnico: boolean | null
          beneficiaria_id: string
          data_criacao: string
          data_plano: string | null
          id: string
          objetivo_principal: string | null
          objetivos: string
          outras_areas: string | null
          prazos: string | null
          primeira_avaliacao_data: string | null
          primeira_avaliacao_progresso: string | null
          responsaveis: string | null
          resultados_esperados: string | null
          segunda_avaliacao_data: string | null
          segunda_avaliacao_progresso: string | null
          suporte_instituto: string | null
        }
        Insert: {
          acoes: string
          acoes_realizadas?: string | null
          acompanhamento?: string | null
          areas_prioritarias?: Json | null
          assinatura_beneficiaria?: boolean | null
          assinatura_responsavel_tecnico?: boolean | null
          beneficiaria_id: string
          data_criacao?: string
          data_plano?: string | null
          id?: string
          objetivo_principal?: string | null
          objetivos: string
          outras_areas?: string | null
          prazos?: string | null
          primeira_avaliacao_data?: string | null
          primeira_avaliacao_progresso?: string | null
          responsaveis?: string | null
          resultados_esperados?: string | null
          segunda_avaliacao_data?: string | null
          segunda_avaliacao_progresso?: string | null
          suporte_instituto?: string | null
        }
        Update: {
          acoes?: string
          acoes_realizadas?: string | null
          acompanhamento?: string | null
          areas_prioritarias?: Json | null
          assinatura_beneficiaria?: boolean | null
          assinatura_responsavel_tecnico?: boolean | null
          beneficiaria_id?: string
          data_criacao?: string
          data_plano?: string | null
          id?: string
          objetivo_principal?: string | null
          objetivos?: string
          outras_areas?: string | null
          prazos?: string | null
          primeira_avaliacao_data?: string | null
          primeira_avaliacao_progresso?: string | null
          responsaveis?: string | null
          resultados_esperados?: string | null
          segunda_avaliacao_data?: string | null
          segunda_avaliacao_progresso?: string | null
          suporte_instituto?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "planos_acao_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      presencas_oficinas: {
        Row: {
          beneficiaria_id: string | null
          created_at: string | null
          data_aula: string
          id: string
          observacoes: string | null
          oficina_id: string | null
          presente: boolean
          registrado_por: string | null
        }
        Insert: {
          beneficiaria_id?: string | null
          created_at?: string | null
          data_aula: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          presente?: boolean
          registrado_por?: string | null
        }
        Update: {
          beneficiaria_id?: string | null
          created_at?: string | null
          data_aula?: string
          id?: string
          observacoes?: string | null
          oficina_id?: string | null
          presente?: boolean
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "presencas_oficinas_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "presencas_oficinas_oficina_id_fkey"
            columns: ["oficina_id"]
            isOneToOne: false
            referencedRelation: "oficinas"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          data_atualizacao: string
          data_criacao: string
          email: string
          id: string
          nome_completo: string
          tipo_usuario: Database["public"]["Enums"]["user_type"]
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          data_atualizacao?: string
          data_criacao?: string
          email: string
          id?: string
          nome_completo: string
          tipo_usuario?: Database["public"]["Enums"]["user_type"]
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          data_atualizacao?: string
          data_criacao?: string
          email?: string
          id?: string
          nome_completo?: string
          tipo_usuario?: Database["public"]["Enums"]["user_type"]
          user_id?: string
        }
        Relationships: []
      }
      recibos_beneficio: {
        Row: {
          beneficiaria_id: string
          data_criacao: string
          data_recebimento: string
          id: string
          tipo_beneficio: string
        }
        Insert: {
          beneficiaria_id: string
          data_criacao?: string
          data_recebimento: string
          id?: string
          tipo_beneficio: string
        }
        Update: {
          beneficiaria_id?: string
          data_criacao?: string
          data_recebimento?: string
          id?: string
          tipo_beneficio?: string
        }
        Relationships: [
          {
            foreignKeyName: "recibos_beneficio_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      roda_vida: {
        Row: {
          amor_score: number | null
          beneficiaria_id: string
          contribuicao_social_score: number | null
          data_criacao: string
          data_roda: string
          equilibrio_emocional_score: number | null
          espiritualidade_score: number | null
          id: string
          lazer_score: number | null
          proposito_score: number | null
          recursos_financeiros_score: number | null
          relacionamento_familiar_score: number | null
          saude_score: number | null
          vida_social_score: number | null
        }
        Insert: {
          amor_score?: number | null
          beneficiaria_id: string
          contribuicao_social_score?: number | null
          data_criacao?: string
          data_roda: string
          equilibrio_emocional_score?: number | null
          espiritualidade_score?: number | null
          id?: string
          lazer_score?: number | null
          proposito_score?: number | null
          recursos_financeiros_score?: number | null
          relacionamento_familiar_score?: number | null
          saude_score?: number | null
          vida_social_score?: number | null
        }
        Update: {
          amor_score?: number | null
          beneficiaria_id?: string
          contribuicao_social_score?: number | null
          data_criacao?: string
          data_roda?: string
          equilibrio_emocional_score?: number | null
          espiritualidade_score?: number | null
          id?: string
          lazer_score?: number | null
          proposito_score?: number | null
          recursos_financeiros_score?: number | null
          relacionamento_familiar_score?: number | null
          saude_score?: number | null
          vida_social_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "roda_vida_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      termos_consentimento: {
        Row: {
          assinatura_responsavel_familiar: boolean | null
          assinatura_voluntaria: boolean | null
          beneficiaria_id: string
          data_consentimento: string
          data_criacao: string
          estado_civil: string | null
          id: string
          nacionalidade: string | null
          tratamento_dados_autorizado: boolean
          uso_imagem_autorizado: boolean
        }
        Insert: {
          assinatura_responsavel_familiar?: boolean | null
          assinatura_voluntaria?: boolean | null
          beneficiaria_id: string
          data_consentimento: string
          data_criacao?: string
          estado_civil?: string | null
          id?: string
          nacionalidade?: string | null
          tratamento_dados_autorizado: boolean
          uso_imagem_autorizado: boolean
        }
        Update: {
          assinatura_responsavel_familiar?: boolean | null
          assinatura_voluntaria?: boolean | null
          beneficiaria_id?: string
          data_consentimento?: string
          data_criacao?: string
          estado_civil?: string | null
          id?: string
          nacionalidade?: string | null
          tratamento_dados_autorizado?: boolean
          uso_imagem_autorizado?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "termos_consentimento_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          module: Database["public"]["Enums"]["module_type"]
          permission: Database["public"]["Enums"]["permission_type"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          module: Database["public"]["Enums"]["module_type"]
          permission: Database["public"]["Enums"]["permission_type"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          module?: Database["public"]["Enums"]["module_type"]
          permission?: Database["public"]["Enums"]["permission_type"]
          user_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          data_atualizacao: string
          data_criacao: string
          email: string
          id: string
          nome: string
          senha_hash: string
          tipo_usuario: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          data_atualizacao?: string
          data_criacao?: string
          email: string
          id?: string
          nome: string
          senha_hash: string
          tipo_usuario: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          data_atualizacao?: string
          data_criacao?: string
          email?: string
          id?: string
          nome?: string
          senha_hash?: string
          tipo_usuario?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      visoes_holisticas: {
        Row: {
          acoes: string | null
          areas_prioritarias: Json | null
          assinatura_beneficiaria: boolean | null
          assinatura_responsavel_tecnico: boolean | null
          assinatura_tecnica: boolean | null
          beneficiaria_id: string
          data_criacao: string
          data_visao: string
          encaminhamento_projeto: string | null
          historia_vida: string | null
          id: string
          objetivo_principal: string | null
          primeira_avaliacao_data: string | null
          primeira_avaliacao_progresso: string | null
          rede_apoio: string | null
          segunda_avaliacao_data: string | null
          segunda_avaliacao_progresso: string | null
          suporte_instituto: string | null
          visao_tecnica_referencia: string | null
        }
        Insert: {
          acoes?: string | null
          areas_prioritarias?: Json | null
          assinatura_beneficiaria?: boolean | null
          assinatura_responsavel_tecnico?: boolean | null
          assinatura_tecnica?: boolean | null
          beneficiaria_id: string
          data_criacao?: string
          data_visao: string
          encaminhamento_projeto?: string | null
          historia_vida?: string | null
          id?: string
          objetivo_principal?: string | null
          primeira_avaliacao_data?: string | null
          primeira_avaliacao_progresso?: string | null
          rede_apoio?: string | null
          segunda_avaliacao_data?: string | null
          segunda_avaliacao_progresso?: string | null
          suporte_instituto?: string | null
          visao_tecnica_referencia?: string | null
        }
        Update: {
          acoes?: string | null
          areas_prioritarias?: Json | null
          assinatura_beneficiaria?: boolean | null
          assinatura_responsavel_tecnico?: boolean | null
          assinatura_tecnica?: boolean | null
          beneficiaria_id?: string
          data_criacao?: string
          data_visao?: string
          encaminhamento_projeto?: string | null
          historia_vida?: string | null
          id?: string
          objetivo_principal?: string | null
          primeira_avaliacao_data?: string | null
          primeira_avaliacao_progresso?: string | null
          rede_apoio?: string | null
          segunda_avaliacao_data?: string | null
          segunda_avaliacao_progresso?: string | null
          suporte_instituto?: string | null
          visao_tecnica_referencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visoes_holisticas_beneficiaria_id_fkey"
            columns: ["beneficiaria_id"]
            isOneToOne: false
            referencedRelation: "beneficiarias"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_age: {
        Args: { birth_date: string }
        Returns: number
      }
      create_admin_user: {
        Args: { p_email: string; p_nome_completo: string }
        Returns: undefined
      }
    }
    Enums: {
      module_type:
        | "beneficiarias"
        | "formularios"
        | "oficinas"
        | "relatorios"
        | "usuarios"
        | "sistema"
      permission_type: "read" | "write" | "delete" | "admin"
      user_type: "admin" | "profissional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      module_type: [
        "beneficiarias",
        "formularios",
        "oficinas",
        "relatorios",
        "usuarios",
        "sistema",
      ],
      permission_type: ["read", "write", "delete", "admin"],
      user_type: ["admin", "profissional"],
    },
  },
} as const
