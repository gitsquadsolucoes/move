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
      planos_acao: {
        Row: {
          acoes: string
          acompanhamento: string | null
          beneficiaria_id: string
          data_criacao: string
          id: string
          objetivos: string
          prazos: string | null
          responsaveis: string | null
          resultados_esperados: string | null
        }
        Insert: {
          acoes: string
          acompanhamento?: string | null
          beneficiaria_id: string
          data_criacao?: string
          id?: string
          objetivos: string
          prazos?: string | null
          responsaveis?: string | null
          resultados_esperados?: string | null
        }
        Update: {
          acoes?: string
          acompanhamento?: string | null
          beneficiaria_id?: string
          data_criacao?: string
          id?: string
          objetivos?: string
          prazos?: string | null
          responsaveis?: string | null
          resultados_esperados?: string | null
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
          assinatura_tecnica: boolean | null
          beneficiaria_id: string
          data_criacao: string
          data_visao: string
          encaminhamento_projeto: string | null
          historia_vida: string | null
          id: string
          rede_apoio: string | null
          visao_tecnica_referencia: string | null
        }
        Insert: {
          assinatura_tecnica?: boolean | null
          beneficiaria_id: string
          data_criacao?: string
          data_visao: string
          encaminhamento_projeto?: string | null
          historia_vida?: string | null
          id?: string
          rede_apoio?: string | null
          visao_tecnica_referencia?: string | null
        }
        Update: {
          assinatura_tecnica?: boolean | null
          beneficiaria_id?: string
          data_criacao?: string
          data_visao?: string
          encaminhamento_projeto?: string | null
          historia_vida?: string | null
          id?: string
          rede_apoio?: string | null
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
    }
    Enums: {
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
      user_type: ["admin", "profissional"],
    },
  },
} as const
