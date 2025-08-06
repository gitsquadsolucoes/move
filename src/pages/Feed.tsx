import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pin, Edit, Trash2, MessageSquare, Heart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface FeedPost {
  id: string;
  titulo: string;
  conteudo: string;
  tipo: 'aviso' | 'noticia' | 'evento' | 'importante';
  author_id: string;
  author_name: string;
  anexo_url?: string;
  fixado: boolean;
  created_at: string;
  updated_at: string;
}

const Feed = () => {
  const { isAdmin, profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPost, setSelectedPost] = useState<FeedPost | null>(null);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select(`
          id,
          titulo,
          conteudo,
          tipo,
          author_id,
          anexo_url,
          fixado,
          created_at,
          updated_at,
          profiles!inner(nome_completo)
        `)
        .eq('ativo', true)
        .order('fixado', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setPosts(data?.map(post => ({
        id: post.id,
        titulo: post.titulo,
        conteudo: post.conteudo,
        tipo: post.tipo,
        author_id: post.author_id,
        author_name: post.profiles.nome_completo,
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

  const deletePost = async (postId: string) => {
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

      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Nenhum post no feed ainda</p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
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
                        onClick={() => deletePost(post.id)}
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Feed;