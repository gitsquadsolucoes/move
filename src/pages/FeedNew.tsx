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
  Trash2
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

  useEffect(() => {
    filterPosts();
    calculateStats();
  }, [posts, filtroTipo, searchTerm]);

  const filterPosts = () => {
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

    // Ordenar por data de criação (mais recente primeiro)
    filtered.sort((a, b) => new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime());

    setFilteredPosts(filtered);
  };

  const calculateStats = () => {
    const total = posts.length;
    const anuncios = posts.filter(p => p.tipo === 'anuncio').length;
    const eventos = posts.filter(p => p.tipo === 'evento').length;
    const noticias = posts.filter(p => p.tipo === 'noticia').length;
    const conquistas = posts.filter(p => p.tipo === 'conquista').length;
    const totalCurtidas = posts.reduce((sum, p) => sum + p.curtidas, 0);
    const totalComentarios = posts.reduce((sum, p) => sum + p.comentarios, 0);

    setStats({
      total,
      anuncios,
      eventos,
      noticias,
      conquistas,
      totalCurtidas,
      totalComentarios
    });
  };

  const handleLike = async (postId: string) => {
    setCurtidas(prev => ({ ...prev, [postId]: !prev[postId] }));
    
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { ...post, curtidas: curtidas[postId] ? post.curtidas - 1 : post.curtidas + 1 }
        : post
    ));

    toast({
      title: curtidas[postId] ? "Curtida removida" : "Post curtido!",
      description: curtidas[postId] ? "" : "Obrigada pela interação! 💕"
    });
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.titulo,
          text: post.conteudo,
          url: window.location.href
        });
      } catch (error) {
        // Fallback para cópia
        handleCopyLink(post);
      }
    } else {
      handleCopyLink(post);
    }
  };

  const handleCopyLink = (post: Post) => {
    navigator.clipboard.writeText(`${window.location.origin}/feed#${post.id}`);
    toast({
      title: "Link copiado!",
      description: "O link do post foi copiado para a área de transferência."
    });
  };

  const handleSubmit = async (formData: FormData) => {
    try {
      setLoading(true);
      
      const newPost: Post = {
        id: Date.now().toString(),
        tipo: formData.get('tipo') as Post['tipo'],
        titulo: formData.get('titulo') as string,
        conteudo: formData.get('conteudo') as string,
        autor_nome: profile?.nome_completo || 'Usuário',
        autor_foto: profile?.foto_url,
        data_criacao: new Date().toISOString(),
        curtidas: 0,
        comentarios: 0
      };

      setPosts(prev => [newPost, ...prev]);
      setShowForm(false);
      
      toast({
        title: "Sucesso",
        description: "Post publicado com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível publicar o post.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPostIcon = (tipo: Post['tipo']) => {
    const tipoInfo = tiposPost.find(t => t.value === tipo);
    return tipoInfo?.icon || Megaphone;
  };

  const getPostColor = (tipo: Post['tipo']) => {
    const tipoInfo = tiposPost.find(t => t.value === tipo);
    return tipoInfo?.color || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Feed da Comunidade</h1>
          <p className="text-gray-600">Fique por dentro das novidades do Move Marias</p>
        </div>
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nova Publicação
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova Publicação</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(new FormData(e.target as HTMLFormElement));
              }} className="space-y-4">
                <div>
                  <Label>Tipo de Publicação</Label>
                  <Select name="tipo" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposPost.map(tipo => (
                        <SelectItem key={tipo.value} value={tipo.value}>
                          <div className="flex items-center space-x-2">
                            <tipo.icon className="h-4 w-4" />
                            <span>{tipo.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Título</Label>
                  <Input name="titulo" required placeholder="Título da publicação" />
                </div>
                <div>
                  <Label>Conteúdo</Label>
                  <Textarea 
                    name="conteudo" 
                    required 
                    placeholder="Escreva o conteúdo da publicação..."
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    Publicar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
                <p className="text-sm text-gray-600">Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.anuncios}</p>
                <p className="text-sm text-gray-600">Anúncios</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.eventos}</p>
                <p className="text-sm text-gray-600">Eventos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Newspaper className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-600">{stats.noticias}</p>
                <p className="text-sm text-gray-600">Notícias</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.conquistas}</p>
                <p className="text-sm text-gray-600">Conquistas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl font-bold text-red-600">{stats.totalCurtidas}</p>
                <p className="text-sm text-gray-600">Curtidas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalComentarios}</p>
                <p className="text-sm text-gray-600">Comentários</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filtroTipo} onValueChange={setFiltroTipo}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {tiposPost.map(tipo => (
              <SelectItem key={tipo.value} value={tipo.value}>
                <div className="flex items-center space-x-2">
                  <tipo.icon className="h-4 w-4" />
                  <span>{tipo.label}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post) => {
          const PostIcon = getPostIcon(post.tipo);
          const isLiked = curtidas[post.id];
          
          return (
            <Card key={post.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header do Post */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.autor_foto} />
                        <AvatarFallback>
                          {post.autor_nome.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{post.autor_nome}</p>
                        <p className="text-sm text-gray-500">
                          {formatDistanceToNow(new Date(post.data_criacao), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPostColor(post.tipo)}>
                        <PostIcon className="h-3 w-3 mr-1" />
                        {tiposPost.find(t => t.value === post.tipo)?.label}
                      </Badge>
                      {isAdmin && (
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Conteúdo do Post */}
                  <div className="space-y-3">
                    <h3 className="text-lg font-semibold">{post.titulo}</h3>
                    <p className="text-gray-700 leading-relaxed">{post.conteudo}</p>
                    
                    {/* Imagem do Post */}
                    {post.imagem_url && (
                      <div className="rounded-lg overflow-hidden">
                        <img 
                          src={post.imagem_url} 
                          alt={post.titulo}
                          className="w-full h-64 object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Ações do Post */}
                  <div className="flex items-center justify-between pt-3 border-t">
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
                      <Button variant="ghost" size="sm" className="text-gray-600 hover:text-blue-600">
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.comentarios}
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
