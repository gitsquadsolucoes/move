export interface Attachment {
  id: string;
  tipo: 'imagem' | 'video' | 'documento' | 'link';
  url: string;
  nome: string;
  tamanho?: number;
  mime_type?: string;
  thumbnail_url?: string;
  metadata?: Record<string, any>;
}

export interface PostMention {
  user_id: string;
  nome: string;
  inicio_index: number;
  fim_index: number;
}

export interface PostReaction {
  tipo: '👍' | '❤️' | '😂' | '😮' | '😢' | '😡';
  count: number;
  reacted_by_user: boolean;
}

export interface PostMetadata {
  evento?: {
    data_inicio: string;
    data_fim?: string;
    local?: string;
    participantes?: string[];
    status: 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
  };
  comunicado?: {
    prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
    data_validade?: string;
    departamentos_alvo?: string[];
  };
  noticia?: {
    fonte?: string;
    tags?: string[];
    categoria?: string;
  };
}

export interface Post {
  id: string;
  titulo: string;
  conteudo: string;
  conteudo_html?: string;
  autor_id: string;
  data_criacao: string;
  data_atualizacao: string;
  tipo: 'noticia' | 'comunicado' | 'evento';
  status: 'rascunho' | 'publicado' | 'arquivado' | 'removido';
  visibilidade: 'todos' | 'departamento' | 'especifico';
  destinatarios?: string[];
  tags?: string[];
  likes_count: number;
  comentarios_count: number;
  visualizacoes_count: number;
  compartilhamentos_count: number;
  metadata: PostMetadata;
  attachments: Attachment[];
  mentions: PostMention[];
  reactions: PostReaction[];
  permite_comentarios: boolean;
  fixado: boolean;
  ordem_fixacao?: number;
}

export interface CommentReaction {
  tipo: '👍' | '❤️';
  count: number;
  reacted_by_user: boolean;
}

export interface Comment {
  id: string;
  post_id: string;
  autor_id: string;
  conteudo: string;
  conteudo_html?: string;
  data_criacao: string;
  data_atualizacao: string;
  parent_id?: string;
  respostas_count: number;
  reactions: CommentReaction[];
  mentions: PostMention[];
  attachments: Attachment[];
  editado: boolean;
}

export interface Author {
  id: string;
  nome_completo: string;
  foto_url?: string;
  cargo?: string;
  departamento?: string;
  bio?: string;
  status?: 'online' | 'ausente' | 'ocupado' | 'offline';
  ultimo_acesso?: string;
}

export interface FeedItemMeta {
  visualizado: boolean;
  data_visualizacao?: string;
  salvo: boolean;
  relevancia: number;
}

export type FeedItem = Post & {
  autor: Author;
  liked_by_user: boolean;
  comentarios?: (Comment & { autor: Author })[];
  meta: FeedItemMeta;
};
