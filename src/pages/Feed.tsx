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
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Pin, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Heart, 
  MessageCircle, 
  Share2, 
  Filter, 
  Calendar, 
  Users, 
  TrendingUp, 
  Megaphone,
  Trophy,
  News as Newspaper,
  Search,
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Post {
  id: string;
  tipo: 'anuncio' | 'evento' | 'noticia' | 'conquista';
  titulo: string;
  conteudo: string;
  autor_nome: string;
  autor_foto?: string;
  data_criacao: string;
  curtidas: number;
  comentarios: number;
  imagem_url?: string;
}

const Feed = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFixedOnly, setShowFixedOnly] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig || import.meta.env.VITE_SUPABASE_URL?.includes('dummy')) {
        // Dados mock para desenvolvimento
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
    comentarios: 3,
    imagem_url: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=600'
  },
  {
    id: '2',
    tipo: 'evento',
    titulo: 'Reunião Mensal das Marias',
    conteudo: 'Nossa reunião mensal acontece nesta sexta-feira, 09/08, às 19h no salão comunitário. Vamos discutir os próximos projetos e ouvir sugestões de todas as participantes. Sua presença é muito importante!',
    autor_nome: 'Maria Oliveira',
    autor_foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    data_criacao: '2024-08-06T15:45:00Z',
    curtidas: 28,
    comentarios: 7,
    imagem_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600'
  },
  {
    id: '3',
    tipo: 'conquista',
    titulo: 'Parabéns Maria Fernanda! 🎉',
    conteudo: 'A Maria Fernanda concluiu com sucesso o curso de empreendedorismo e já abriu sua própria confeitaria! Que orgulho de ver nossas marias realizando seus sonhos. Sucesso sempre! 💪',
    autor_nome: 'Carlos Roberto',
    autor_foto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
    data_criacao: '2024-08-05T09:15:00Z',
    curtidas: 42,
    comentarios: 12,
    imagem_url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600'
  },
  {
    id: '4',
    tipo: 'noticia',
    titulo: 'Novo Projeto Aprovado',
    conteudo: 'Temos uma excelente notícia! O projeto "Marias Digitais" foi aprovado e receberemos recursos para um laboratório de informática. Em breve teremos cursos de inclusão digital para todas!',
    autor_nome: 'Ana Silva Santos',
    autor_foto: 'https://images.unsplash.com/photo-1494790108755-2616b612b526?w=400',
    data_criacao: '2024-08-04T14:20:00Z',
    curtidas: 35,
    comentarios: 8,
    imagem_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600'
  },
  {
    id: '5',
    tipo: 'anuncio',
    titulo: 'Mutirão de Limpeza no Bairro',
    conteudo: 'No próximo sábado, 10/08, às 8h, faremos um mutirão de limpeza e plantio de mudas na praça do bairro. Vamos juntas cuidar do nosso espaço! Tragam luvas e garrafas de água.',
    autor_nome: 'Juliana Costa',
    autor_foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    data_criacao: '2024-08-03T16:30:00Z',
    curtidas: 22,
    comentarios: 5,
    imagem_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600'
  },
  {
    id: '6',
    tipo: 'evento',
    titulo: 'Feira de Produtos das Marias',
    conteudo: 'Nossa feira mensal será no dia 15/08, das 9h às 17h, na praça central. Venham conhecer e apoiar os produtos feitos pelas nossas participantes: doces, artesanatos, cosméticos naturais e muito mais!',
    autor_nome: 'Maria Oliveira',
    autor_foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
    data_criacao: '2024-08-02T11:45:00Z',
    curtidas: 31,
    comentarios: 9,
    imagem_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600'
  }
]
        // Ordena: fixados primeiro, depois por data de criação
        .sort((a, b) => {
          try {
            const dateA = a.data_criacao ? new Date(a.data_criacao) : new Date(0);
            const dateB = b.data_criacao ? new Date(b.data_criacao) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          } catch (error) {
            console.warn('Erro ao ordenar posts:', error);
            return 0;
          }
        });
        });
        
        setPosts(sortedPosts);
        return;
      }

      const { data, error } = await supabase
        .from('feed_posts')
        .select('id, titulo, conteudo, tipo, author_id, anexo_url, fixado, created_at, updated_at')
        .eq('ativo', true)
        .order('fixado', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get author names separately
      const authorIds = [...new Set(data?.map(p => p.author_id) || [])];
      const { data: authors } = await supabase
        .from('profiles')
        .select('user_id, nome_completo')
        .in('user_id', authorIds);

      const authorsMap = new Map(authors?.map(a => [a.user_id, a.nome_completo]) || []);

      setPosts(data?.map(post => ({
        id: post.id,
        titulo: post.titulo,
        conteudo: post.conteudo,
        tipo: post.tipo as 'aviso' | 'noticia' | 'evento' | 'importante',
        author_id: post.author_id,
        author_name: authorsMap.get(post.author_id) || 'Usuário',
        anexo_url: post.anexo_url,
        fixado: post.fixado,
        created_at: post.created_at,
        updated_at: post.updated_at
      })) || []);
    } catch (error) {
      console.error('Erro ao carregar feed:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar feed",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();

    // Real-time updates
    const channel = supabase
      .channel('feed-posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'feed_posts'
        },
        () => {
          loadPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const post = {
      titulo: formData.get('titulo') as string,
      conteudo: formData.get('conteudo') as string,
      tipo: formData.get('tipo') as string,
      fixado: formData.get('fixado') === 'on',
      anexo_url: formData.get('anexo_url') as string || null
    };

    try {
      if (selectedPost) {
        const { error } = await supabase
          .from('feed_posts')
          .update(post)
          .eq('id', selectedPost.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Post atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('feed_posts')
          .insert([{ ...post, author_id: profile?.user_id }]);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Post criado com sucesso!" });
      }
      
      setShowForm(false);
      setSelectedPost(null);
      loadPosts();
    } catch (error) {
      console.error('Erro ao salvar post:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar post",
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string, titulo: string) => {
    if (!confirm(`Tem certeza que deseja excluir o post "${titulo}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ ativo: false })
        .eq('id', postId);

      if (error) throw error;
      toast({ title: "Sucesso", description: "Post removido com sucesso!" });
      loadPosts();
    } catch (error) {
      console.error('Erro ao remover post:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover post",
        variant: "destructive",
      });
    }
  };

  const togglePin = async (postId: string, currentPinned: boolean) => {
    try {
      const { error } = await supabase
        .from('feed_posts')
        .update({ fixado: !currentPinned })
        .eq('id', postId);

      if (error) throw error;
      loadPosts();
    } catch (error) {
      console.error('Erro ao fixar/desafixar post:', error);
    }
  };

  const getTypeColor = (tipo: string) => {
    switch (tipo) {
      case 'importante':
        return 'destructive';
      case 'evento':
        return 'default';
      case 'noticia':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getTypeLabel = (tipo: string) => {
    switch (tipo) {
      case 'importante':
        return 'Importante';
      case 'evento':
        return 'Evento';
      case 'noticia':
        return 'Notícia';
      default:
        return 'Aviso';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const postsFiltrados = posts.filter(post => {
    const matchesSearch = post.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.conteudo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTipo = filtroTipo === 'todos' || post.tipo === filtroTipo;
    
    const matchesFixed = !showFixedOnly || post.fixado;
    
    return matchesSearch && matchesTipo && matchesFixed;
  });

  if (loading) {
    return <div className="p-6">Carregando feed...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Feed de Avisos</h1>
          <p className="text-muted-foreground">Acompanhe as últimas novidades e avisos</p>
        </div>
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedPost(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedPost ? 'Editar Post' : 'Novo Post'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="titulo">Título</Label>
                  <Input
                    id="titulo"
                    name="titulo"
                    defaultValue={selectedPost?.titulo}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tipo">Tipo</Label>
                  <Select name="tipo" defaultValue={selectedPost?.tipo || 'aviso'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aviso">Aviso</SelectItem>
                      <SelectItem value="noticia">Notícia</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                      <SelectItem value="importante">Importante</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    name="conteudo"
                    defaultValue={selectedPost?.conteudo}
                    rows={5}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="anexo_url">URL do Anexo (opcional)</Label>
                  <Input
                    id="anexo_url"
                    name="anexo_url"
                    type="url"
                    defaultValue={selectedPost?.anexo_url}
                    placeholder="https://..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="fixado"
                    name="fixado"
                    defaultChecked={selectedPost?.fixado}
                  />
                  <Label htmlFor="fixado">Fixar post</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {selectedPost ? 'Atualizar' : 'Publicar'} Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título, conteúdo ou autor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
          <div className="flex gap-2">
            <Select value={filtroTipo} onValueChange={setFiltroTipo}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                <SelectItem value="importante">Importante</SelectItem>
                <SelectItem value="evento">Evento</SelectItem>
                <SelectItem value="noticia">Notícia</SelectItem>
                <SelectItem value="aviso">Aviso</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showFixedOnly"
                checked={showFixedOnly}
                onCheckedChange={(checked) => setShowFixedOnly(checked === true)}
              />
              <Label htmlFor="showFixedOnly" className="text-sm">Apenas fixados</Label>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{posts.length}</p>
                <p className="text-sm text-muted-foreground">Total de Posts</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{posts.filter(p => p.tipo === 'importante').length}</p>
                <p className="text-sm text-muted-foreground">Importantes</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{posts.filter(p => p.tipo === 'evento').length}</p>
                <p className="text-sm text-muted-foreground">Eventos</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{posts.filter(p => p.tipo === 'noticia').length}</p>
                <p className="text-sm text-muted-foreground">Notícias</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{posts.filter(p => p.fixado).length}</p>
                <p className="text-sm text-muted-foreground">Fixados</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="space-y-4">
        {postsFiltrados.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {searchTerm || filtroTipo !== 'todos' || showFixedOnly 
                  ? 'Nenhum post encontrado com os filtros aplicados'
                  : 'Nenhum post no feed ainda'}
              </p>
            </CardContent>
          </Card>
        ) : (
          postsFiltrados.map((post) => (
            <Card key={post.id} className={`shadow-soft ${post.fixado ? 'border-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(post.author_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getTypeColor(post.tipo)}>
                          {getTypeLabel(post.tipo)}
                        </Badge>
                        {post.fixado && (
                          <Badge variant="outline" className="border-primary text-primary">
                            <Pin className="w-3 h-3 mr-1" />
                            Fixado
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg mt-1">{post.titulo}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Por {post.author_name} • {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: ptBR
                        })}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePin(post.id, post.fixado)}
                        title={post.fixado ? 'Desafixar' : 'Fixar'}
                      >
                        <Pin className={`w-4 h-4 ${post.fixado ? 'fill-current' : ''}`} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePost(post.id, post.titulo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{post.conteudo}</p>
                </div>
                {post.anexo_url && (
                  <div className="mt-4">
                    <Button variant="outline" size="sm" asChild>
                      <a href={post.anexo_url} target="_blank" rel="noopener noreferrer">
                        Ver Anexo
                      </a>
                    </Button>
                  </div>
                )}
                
                {/* Ações do post */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-muted">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    {post.curtidas || 0} curtidas
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Comentar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;