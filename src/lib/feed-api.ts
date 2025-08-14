import { apiFetch, API_BASE_URL } from '@/lib/api';
import type { 
  FeedItem, 
  Post, 
  Comment, 
  Attachment, 
  PostReaction, 
  CommentReaction,
  Author
} from '@/types/feed';

const FEED_API = `${API_BASE_URL}/feed`;

interface FeedResponse {
  data: FeedItem[];
  total: number;
  pagina_atual: number;
  total_paginas: number;
  has_more: boolean;
}

interface PostResponse {
  data: FeedItem;
}

interface FeedQueryParams {
  page?: number;
  limit?: number;
  tipo?: Post['tipo'][];
  tag?: string;
  autor_id?: string;
  departamento?: string;
  data_inicio?: string;
  data_fim?: string;
  busca?: string;
  ordenar_por?: 'recentes' | 'relevancia' | 'engajamento' | 'visualizacoes';
  status?: Post['status'][];
}

interface ReactionResponse {
  reactions: PostReaction[] | CommentReaction[];
  user_reactions: string[];
}

interface AttachmentResponse {
  attachment: Attachment;
}

export const feedApi = {
  // Buscar posts do feed com filtros avançados
  getPosts: async (params: FeedQueryParams = {}): Promise<FeedResponse> => {
    const queryString = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, v));
      } else if (value !== undefined) {
        queryString.append(key, String(value));
      }
    });

    return apiFetch<FeedResponse>(`${FEED_API}/posts?${queryString.toString()}`);
  },

  // Buscar um post específico com seus comentários
  getPost: async (id: string, include_comments = true): Promise<PostResponse> => {
    return apiFetch<PostResponse>(`${FEED_API}/posts/${id}?include_comments=${include_comments}`);
  },

  // Criar novo post
  createPost: async (data: Partial<Post>, draft = false): Promise<PostResponse> => {
    return apiFetch<PostResponse>(`${FEED_API}/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, status: draft ? 'rascunho' : 'publicado' })
    });
  },

  // Atualizar um post
  updatePost: async (id: string, data: Partial<Post>): Promise<PostResponse> => {
    return apiFetch<PostResponse>(`${FEED_API}/posts/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  // Arquivar um post
  archivePost: async (id: string): Promise<PostResponse> => {
    return apiFetch<PostResponse>(`${FEED_API}/posts/${id}/archive`, {
      method: 'POST'
    });
  },

  // Fixar/Desafixar post
  togglePin: async (id: string, ordem?: number): Promise<PostResponse> => {
    return apiFetch<PostResponse>(`${FEED_API}/posts/${id}/pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ordem })
    });
  },

  // Deletar um post
  deletePost: async (id: string): Promise<void> => {
    return apiFetch(`${FEED_API}/posts/${id}`, {
      method: 'DELETE'
    });
  },

  // Gerenciar reações
  addReaction: async (postId: string, tipo: PostReaction['tipo']): Promise<ReactionResponse> => {
    return apiFetch(`${FEED_API}/posts/${postId}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo })
    });
  },

  removeReaction: async (postId: string, tipo: PostReaction['tipo']): Promise<ReactionResponse> => {
    return apiFetch(`${FEED_API}/posts/${postId}/reactions/${tipo}`, {
      method: 'DELETE'
    });
  },

  // Gerenciar comentários
  getComments: async (postId: string, params: { page?: number; limit?: number; parent_id?: string } = {}): Promise<{
    data: (Comment & { autor: Author })[];
    total: number;
  }> => {
    const queryString = new URLSearchParams(params as Record<string, string>);
    return apiFetch(`${FEED_API}/posts/${postId}/comments?${queryString.toString()}`);
  },

  addComment: async (
    postId: string, 
    data: { 
      conteudo: string;
      parent_id?: string;
      mentions?: string[];
      attachments?: File[];
    }
  ): Promise<Comment & { autor: Author }> => {
    const formData = new FormData();
    formData.append('data', JSON.stringify({
      conteudo: data.conteudo,
      parent_id: data.parent_id,
      mentions: data.mentions
    }));

    if (data.attachments) {
      data.attachments.forEach(file => {
        formData.append('attachments', file);
      });
    }

    return apiFetch(`${FEED_API}/posts/${postId}/comments`, {
      method: 'POST',
      body: formData
    });
  },

  updateComment: async (
    postId: string,
    commentId: string,
    data: {
      conteudo: string;
      mentions?: string[];
    }
  ): Promise<Comment & { autor: Author }> => {
    return apiFetch(`${FEED_API}/posts/${postId}/comments/${commentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  deleteComment: async (postId: string, commentId: string): Promise<void> => {
    return apiFetch(`${FEED_API}/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE'
    });
  },

  // Gerenciamento de anexos
  uploadAttachment: async (file: File, tipo: Attachment['tipo']): Promise<AttachmentResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tipo', tipo);

    return apiFetch(`${FEED_API}/attachments`, {
      method: 'POST',
      body: formData
    });
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    return apiFetch(`${FEED_API}/attachments/${attachmentId}`, {
      method: 'DELETE'
    });
  },

  // Interações e métricas
  markAsRead: async (postId: string): Promise<void> => {
    return apiFetch(`${FEED_API}/posts/${postId}/read`, {
      method: 'POST'
    });
  },

  toggleSave: async (postId: string): Promise<{ saved: boolean }> => {
    return apiFetch(`${FEED_API}/posts/${postId}/save`, {
      method: 'POST'
    });
  },

  sharePost: async (postId: string, { destinatarios, mensagem }: { 
    destinatarios: string[];
    mensagem?: string;
  }): Promise<void> => {
    return apiFetch(`${FEED_API}/posts/${postId}/share`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinatarios, mensagem })
    });
  },

  // Websocket para updates em tempo real
  subscribeToUpdates: (callbacks: {
    onPost?: (post: FeedItem) => void;
    onComment?: (comment: Comment & { autor: Author }) => void;
    onReaction?: (reaction: ReactionResponse) => void;
    onDelete?: (data: { tipo: 'post' | 'comment'; id: string }) => void;
  }) => {
    const ws = new WebSocket(API_BASE_URL.replace('http', 'ws') + '/feed/live');
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      switch (update.tipo) {
        case 'post':
          callbacks.onPost?.(update.data);
          break;
        case 'comment':
          callbacks.onComment?.(update.data);
          break;
        case 'reaction':
          callbacks.onReaction?.(update.data);
          break;
        case 'delete':
          callbacks.onDelete?.(update.data);
          break;
      }
    };

    return () => {
      ws.close();
    };
  }
};
};
