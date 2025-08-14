import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Heart, MessageCircle, Share2, Image as ImageIcon } from 'lucide-react';
import { feedApi } from '@/lib/feed-api';
import type { FeedItem } from '@/types/feed';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Feed() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [novoPost, setNovoPost] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const { toast } = useToast();

  const carregarPosts = async () => {
    try {
      setIsLoading(true);
      const response = await feedApi.getPosts();
      setPosts(response.data);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o feed.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    carregarPosts();
  }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const publicarPost = async () => {
    if (!novoPost.trim()) return;

    try {
      let imageUrl;
      if (selectedImage) {
        const uploadResult = await feedApi.uploadImage(selectedImage);
        imageUrl = uploadResult.url;
      }

      await feedApi.createPost({
        titulo: 'Comunicado',
        conteudo: novoPost,
        tipo: 'comunicado',
        imagem_url: imageUrl || undefined,
        tags: []
      });

      setNovoPost('');
      setSelectedImage(null);
      await carregarPosts();
      
      toast({
        title: 'Sucesso',
        description: 'Post publicado com sucesso!',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível publicar o post.',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-2xl">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <Input
              placeholder="O que você está pensando?"
              value={novoPost}
              onChange={(e) => setNovoPost(e.target.value)}
              className="flex-1"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  id="image-upload"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('image-upload')?.click()}
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {selectedImage ? 'Imagem selecionada' : 'Adicionar imagem'}
                </Button>
              </div>
              <Button onClick={publicarPost}>Publicar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {posts.map((post) => (
        <Card key={post.id} className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={post.autor.foto_url || undefined} />
                <AvatarFallback>{post.autor.nome_completo.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{post.autor.nome_completo}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(post.data_criacao), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-4">{post.conteudo}</p>
            {post.imagem_url && (
              <img
                src={post.imagem_url}
                alt="Imagem do post"
                className="rounded-lg w-full object-cover mb-4"
              />
            )}
            <div className="flex gap-6">
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Heart className="h-4 w-4 mr-2" />
                {post.likes_count}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageCircle className="h-4 w-4 mr-2" />
                {post.comentarios?.length || 0}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
