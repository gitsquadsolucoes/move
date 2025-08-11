import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Heart, 
  MessageCircle, 
  Share2, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  Megaphone,
  Trophy,
  Newspaper,
  Search,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  author_nome: string;
  author_foto?: string;
  conteudo: string;
  created_at: string;
}

interface Post {
  id: string;
  tipo: 'anuncio' | 'evento' | 'noticia' | 'conquista';
  titulo: string;
  conteudo: string;
  autor_nome: string;
  autor_foto?: string;
  data_criacao: string;
  curtidas: number;
  comentarios: Comment[];
  imagem_url?: string;
}

const mockPosts: Post[] = [
  {
    id: '1',
    tipo: 'anuncio',
    titulo: 'Nova Oficina de Artesanato',
    conteudo: 'Estamos com inscrições abertas para a nova oficina de artesanato em macramê! As aulas começam na próxima segunda-feira, das 14h às 16h. Vagas limitadas!',
    autor_nome: 'Ana Silva Santos',
    autor_foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b526?w=400',
    data_criacao: '2024-08-07T10:30:00Z',
    curtidas: 15,
    comentarios: [
      {
        id: 'c1',
        post_id: '1',
        author_id: 'user1',
        author_nome: 'Maria João',
        author_foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
        conteudo: 'Que ótima notícia! Já posso me inscrever?',
        created_at: '2024-08-07T11:15:00Z'
      },
      {
        id: 'c2',
        post_id: '1',
        author_id: 'user2',
        author_nome: 'Carla Santos',
        conteudo: 'Estou muito interessada! Como faço para garantir minha vaga?',
        created_at: '2024-08-07T12:30:00Z'
      }
    ],
    imagem_url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600'
  },
  {
    id: '2',
    tipo: 'evento',
    titulo: 'Reunião Mensal das Marias',
    conteudo: 'Nossa reunião mensal acontece nesta sexta-feira, 09/08, às 19h no salão comunitário. Vamos discutir os próximos projetos e ouvir sugestões de todas as participantes.',
    autor_nome: 'Maria Oliveira',
    autor_foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    data_criacao: '2024-08-06T15:45:00Z',
    curtidas: 28,
    comentarios: [
      {
        id: 'c3',
        post_id: '2',
        author_id: 'user3',
        author_nome: 'Fernanda Lima',
        conteudo: 'Estarei lá! Tenho algumas ideias para compartilhar.',
        created_at: '2024-08-06T16:20:00Z'
      }
    ],
    imagem_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600'
  }
];

const tiposPost = [
  { value: 'anuncio', label: 'Anúncio', icon: Megaphone, color: 'bg-blue-100 text-blue-800' },
  { value: 'evento', label: 'Evento', icon: Calendar, color: 'bg-green-100 text-green-800' },
  { value: 'noticia', label: 'Notícia', icon: Newspaper, color: 'bg-purple-100 text-purple-800' },
  { value: 'conquista', label: 'Conquista', icon: Trophy, color: 'bg-yellow-100 text-yellow-800' }
];

export default function Feed() {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(mockPosts);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [curtidas, setCurtidas] = useState<Record<string, boolean>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});

  // Estados para estatísticas
  const [stats, setStats] = useState({
    total: 0,
    anuncios: 0,
    eventos: 0,
    noticias: 0,
    conquistas: 0,
    totalCurtidas: 0,
    totalComentarios: 0
  });

  // Efeito para calcular estatísticas
  useEffect(() => {
    const total = posts.length;
    const anuncios = posts.filter(p => p.tipo === 'anuncio').length;
    const eventos = posts.filter(p => p.tipo === 'evento').length;
    const noticias = posts.filter(p => p.tipo === 'noticia').length;
    const conquistas = posts.filter(p => p.tipo === 'conquista').length;
    const totalCurtidas = posts.reduce((sum, p) => sum + p.curtidas, 0);
    const totalComentarios = posts.reduce((sum, p) => sum + p.comentarios.length, 0);

    setStats({
      total,
      anuncios,
      eventos,
      noticias,
      conquistas,
      totalCurtidas,
      totalComentarios
    });
  }, [posts]);

  // Efeito para filtrar posts
  useEffect(() => {
    let filtered = posts;
    
    if (filtroTipo !== 'todos') {
      filtered = filtered.filter(post => post.tipo === filtroTipo);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.autor_nome.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, filtroTipo, searchTerm]);

  const handleCreatePost = async (formData: FormData) => {
    const titulo = formData.get('titulo') as string;
    const conteudo = formData.get('conteudo') as string;
    const tipo = formData.get('tipo') as string;

    if (!titulo || !conteudo || !tipo) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    const newPost: Post = {
      id: Date.now().toString(),
      tipo: tipo as Post['tipo'],
      titulo,
      conteudo,
      autor_nome: profile?.nome_completo || 'Usuário',
      autor_foto: profile?.avatar_url,
      data_criacao: new Date().toISOString(),
      curtidas: 0,
      comentarios: [],
      imagem_url: undefined
    };

    setPosts([newPost, ...posts]);
    setShowForm(false);
    
    toast({
      title: "Sucesso",
      description: "Post criado com sucesso!"
    });
  };

  const handleLike = (postId: string) => {
    setCurtidas(prev => ({ ...prev, [postId]: !prev[postId] }));
    
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          const isLiked = curtidas[postId];
          return {
            ...post,
            curtidas: isLiked ? post.curtidas - 1 : post.curtidas + 1
          };
        }
        return post;
      })
    );
  };

  const handleShare = (post: Post) => {
    navigator.clipboard.writeText(`${post.titulo}\n\n${post.conteudo}`);
    toast({
      title: "Copiado!",
      description: "O conteúdo do post foi copiado para a área de transferência."
    });
  };

  const toggleComments = (postId: string) => {
    setShowComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleAddComment = (postId: string) => {
    const comentario = newComment[postId]?.trim();
    if (!comentario) return;

    const novoComentario: Comment = {
      id: `c_${Date.now()}`,
      post_id: postId,
      author_id: profile?.user_id || 'current_user',
      author_nome: profile?.nome_completo || 'Usuário Atual',
      author_foto: profile?.avatar_url,
      conteudo: comentario,
      created_at: new Date().toISOString()
    };

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comentarios: [...post.comentarios, novoComentario]
          };
        }
        return post;
      })
    );

    setNewComment(prev => ({ ...prev, [postId]: '' }));
    
    toast({
      title: "Comentário adicionado!",
      description: "Seu comentário foi publicado com sucesso."
    });
  };

  const handleDeleteComment = (postId: string, commentId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comentarios: post.comentarios.filter(c => c.id !== commentId)
          };
        }
        return post;
      })
    );

    toast({
      title: "Comentário removido",
      description: "O comentário foi excluído com sucesso."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total de Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Megaphone className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-green-600">{stats.anuncios}</p>
                <p className="text-xs text-muted-foreground">Anúncios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-purple-600">{stats.eventos}</p>
                <p className="text-xs text-muted-foreground">Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-red-600">{stats.totalCurtidas}</p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MessageCircle className="h-8 w-8 text-indigo-600" />
              <div className="ml-3">
                <p className="text-2xl font-bold text-indigo-600">{stats.totalComentarios}</p>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  {tiposPost.map(tipo => (
                    <SelectItem key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(isAdmin || profile?.tipo_usuario === 'profissional') && (
              <Dialog open={showForm} onOpenChange={setShowForm}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Post</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleCreatePost(new FormData(e.target as HTMLFormElement));
                  }} className="space-y-4">
                    <div>
                      <Label>Título</Label>
                      <Input name="titulo" placeholder="Digite o título do post" required />
                    </div>
                    <div>
                      <Label>Tipo de Post</Label>
                      <Select name="tipo" required>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposPost.map(tipo => (
                            <SelectItem key={tipo.value} value={tipo.value}>
                              {tipo.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Conteúdo</Label>
                      <Textarea 
                        name="conteudo" 
                        placeholder="Digite o conteúdo do post"
                        rows={4}
                        required 
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="flex-1">
                        Cancelar
                      </Button>
                      <Button type="submit" className="flex-1">
                        Publicar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post) => {
          const isLiked = curtidas[post.id] || false;
          const tipoConfig = tiposPost.find(t => t.value === post.tipo);
          const showPostComments = showComments[post.id] || false;

          return (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  {/* Header do Post */}
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={post.autor_foto} />
                      <AvatarFallback>
                        {post.autor_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{post.autor_nome}</p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(post.data_criacao), { 
                              addSuffix: true, 
                              locale: ptBR 
                            })}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={tipoConfig?.color}>
                            {tipoConfig?.label}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="mt-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.titulo}</h3>
                    <p className="text-gray-700 leading-relaxed">{post.conteudo}</p>
                  </div>

                  {/* Imagem do Post */}
                  {post.imagem_url && (
                    <div className="mt-4">
                      <img 
                        src={post.imagem_url} 
                        alt={post.titulo}
                        className="w-full h-64 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-4 border-t mt-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`${isLiked ? 'text-red-600' : 'text-gray-600'} hover:text-red-600`}
                      >
                        <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                        {post.curtidas}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleComments(post.id)}
                        className="text-gray-600 hover:text-blue-600"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comentarios.length}
                        {showPostComments ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />}
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleShare(post)}
                        className="text-gray-600 hover:text-green-600"
                      >
                        <Share2 className="h-4 w-4 mr-1" />
                        Compartilhar
                      </Button>
                    </div>
                  </div>

                  {/* Seção de Comentários */}
                  {showPostComments && (
                    <div className="mt-4 border-t pt-4">
                      {/* Lista de Comentários */}
                      <div className="space-y-3 mb-4">
                        {post.comentarios.map((comment) => (
                          <div key={comment.id} className="flex space-x-3">
                            <Avatar className="h-8 w-8 flex-shrink-0">
                              <AvatarImage src={comment.author_foto} />
                              <AvatarFallback>
                                {comment.author_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-medium text-sm">{comment.author_nome}</p>
                                <div className="flex items-center space-x-2">
                                  <p className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(comment.created_at), { 
                                      addSuffix: true, 
                                      locale: ptBR 
                                    })}
                                  </p>
                                  {(comment.author_id === profile?.user_id || isAdmin) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(post.id, comment.id)}
                                      className="h-6 w-6 p-0 text-gray-400 hover:text-red-600"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{comment.conteudo}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Formulário para Novo Comentário */}
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={profile?.avatar_url} />
                          <AvatarFallback>
                            {profile?.nome_completo?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 flex space-x-2">
                          <Input
                            placeholder="Escreva um comentário..."
                            value={newComment[post.id] || ''}
                            onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddComment(post.id);
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        
        {filteredPosts.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <p>Nenhum post encontrado</p>
                <p className="text-sm">Tente ajustar os filtros ou termos de busca</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
