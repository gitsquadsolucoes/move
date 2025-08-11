import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Users, Calendar, Target, Edit, Trash2, UserPlus, Eye, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  objetivo: string;
  responsavel: string;
  data_inicio: string;
  data_fim?: string;
  status: 'planejamento' | 'ativo' | 'pausado' | 'concluido';
  vagas_totais: number;
  participantes_inscritos: number;
  local?: string;
  ativo: boolean;
  created_at: string;
}

const Projetos = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: 'planejamento', label: 'Planejamento', color: 'secondary' },
    { value: 'ativo', label: 'Ativo', color: 'default' },
    { value: 'pausado', label: 'Pausado', color: 'outline' },
    { value: 'concluido', label: 'Concluído', color: 'secondary' }
  ];

  const loadProjetos = async () => {
    try {
      setLoading(true);
      
      // Usar API PostgreSQL
      const response = await api.getProjetos(1, 50);
      
      if (response.success) {
        setProjetos(response.data || []);
      } else {
        // Fallback para dados mock
        const mockProjetos: Projeto[] = [
          {
            id: '1',
            nome: 'Marias Empreendedoras',
            descricao: 'Projeto de capacitação em empreendedorismo feminino, fornecendo ferramentas e conhecimentos para criação e gestão de negócios próprios.',
            objetivo: 'Capacitar mulheres para empreender e gerar renda própria através de negócios sustentáveis.',
            responsavel: 'Ana Paula Santos',
            data_inicio: '2024-01-15',
            data_fim: '2024-12-15',
            status: 'ativo',
            vagas_totais: 30,
            participantes_inscritos: 25,
            local: 'Sala de Capacitação - Bloco A',
            ativo: true,
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            nome: 'Inclusão Digital',
            descricao: 'Projeto focado em alfabetização digital, capacitando beneficiárias no uso de tecnologias básicas e ferramentas digitais.',
            objetivo: 'Promover a inclusão digital e reduzir a exclusão tecnológica entre as beneficiárias.',
            responsavel: 'Carlos Oliveira',
            data_inicio: '2024-02-01',
            data_fim: '2024-08-01',
            status: 'ativo',
            vagas_totais: 25,
            participantes_inscritos: 23,
            local: 'Laboratório de Informática',
            ativo: true,
            created_at: new Date().toISOString()
          },
          {
            id: '3',
            nome: 'Artesãs do Futuro',
            descricao: 'Projeto de formação em artesanato com foco na comercialização e profissionalização da atividade artesanal.',
            objetivo: 'Desenvolver habilidades artesanais e criar oportunidades de geração de renda através do artesanato.',
            responsavel: 'Maria José Silva',
            data_inicio: '2023-09-01',
            data_fim: '2024-03-01',
            status: 'concluido',
            vagas_totais: 20,
            participantes_inscritos: 18,
            local: 'Ateliê de Artesanato',
            ativo: true,
            created_at: new Date().toISOString()
          },
          {
            id: '4',
            nome: 'Cozinheiras Solidárias',
            descricao: 'Projeto de capacitação culinária com foco em alimentação saudável e oportunidades no setor gastronômico.',
            objetivo: 'Capacitar em técnicas culinárias e promover o empreendedorismo no setor de alimentação.',
            responsavel: 'Lucia Fernandes',
            data_inicio: '2024-03-01',
            data_fim: undefined,
            status: 'planejamento',
            vagas_totais: 15,
            participantes_inscritos: 0,
            local: 'Cozinha Pedagógica',
            ativo: true,
            created_at: new Date().toISOString()
          }
        ];
        
        setProjetos(mockProjetos);
        return;
      }

      const { data, error } = await supabase
        .from('projetos')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjetos(data || []);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar projetos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const projeto = {
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      objetivo: formData.get('objetivo') as string,
      responsavel: formData.get('responsavel') as string,
      data_inicio: formData.get('data_inicio') as string,
      data_fim: formData.get('data_fim') as string || null,
      status: formData.get('status') as string,
      vagas_totais: parseInt(formData.get('vagas_totais') as string),
      local: formData.get('local') as string || null,
      ativo: formData.get('ativo') === 'on'
    };

    try {
      if (selectedProjeto) {
        const { error } = await supabase
          .from('projetos')
          .update(projeto)
          .eq('id', selectedProjeto.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Projeto atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('projetos')
          .insert([projeto]);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Projeto criado com sucesso!" });
      }
      
      setShowForm(false);
      setSelectedProjeto(null);
      loadProjetos();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (projeto: Projeto) => {
    if (!confirm(`Tem certeza que deseja excluir o projeto "${projeto.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projetos')
        .update({ ativo: false })
        .eq('id', projeto.id);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Projeto excluído com sucesso!" });
      loadProjetos();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir projeto",
        variant: "destructive",
      });
    }
  };

  const projetosFiltrados = projetos.filter(projeto => {
    const matchesSearch = projeto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         projeto.responsavel.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || projeto.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption || { label: status, color: 'outline' };
  };

  if (loading) {
    return <div className="p-6">Carregando projetos...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">Gerencie os projetos sociais e suas participantes</p>
        </div>
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedProjeto(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedProjeto ? 'Editar Projeto' : 'Novo Projeto'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome do Projeto</Label>
                    <Input
                      id="nome"
                      name="nome"
                      defaultValue={selectedProjeto?.nome}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="responsavel">Responsável</Label>
                    <Input
                      id="responsavel"
                      name="responsavel"
                      defaultValue={selectedProjeto?.responsavel}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    defaultValue={selectedProjeto?.descricao}
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="objetivo">Objetivo</Label>
                  <Textarea
                    id="objetivo"
                    name="objetivo"
                    defaultValue={selectedProjeto?.objetivo}
                    rows={2}
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      name="data_inicio"
                      type="date"
                      defaultValue={selectedProjeto?.data_inicio}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data de Fim</Label>
                    <Input
                      id="data_fim"
                      name="data_fim"
                      type="date"
                      defaultValue={selectedProjeto?.data_fim}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vagas_totais">Vagas Totais</Label>
                    <Input
                      id="vagas_totais"
                      name="vagas_totais"
                      type="number"
                      min="1"
                      defaultValue={selectedProjeto?.vagas_totais || 20}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={selectedProjeto?.status || 'planejamento'}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="local">Local</Label>
                    <Input
                      id="local"
                      name="local"
                      defaultValue={selectedProjeto?.local}
                      placeholder="Local de realização"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativo"
                    name="ativo"
                    defaultChecked={selectedProjeto?.ativo !== false}
                  />
                  <Label htmlFor="ativo">Projeto ativo</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {selectedProjeto ? 'Atualizar' : 'Criar'} Projeto
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, descrição ou responsável..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statusOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Projetos</p>
                <p className="text-2xl font-bold">{projetos.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projetos Ativos</p>
                <p className="text-2xl font-bold">{projetos.filter(p => p.status === 'ativo').length}</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Vagas</p>
                <p className="text-2xl font-bold">{projetos.reduce((acc, p) => acc + p.vagas_totais, 0)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserPlus className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Participantes</p>
                <p className="text-2xl font-bold">{projetos.reduce((acc, p) => acc + (p.participantes_inscritos || 0), 0)}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projetosFiltrados.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filtroStatus !== 'todos' 
                ? 'Nenhum projeto encontrado com os filtros aplicados.' 
                : 'Nenhum projeto cadastrado ainda.'}
            </p>
          </div>
        ) : (
          projetosFiltrados.map((projeto) => (
            <Card key={projeto.id} className="shadow-soft">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Responsável: {projeto.responsavel}
                    </p>
                  </div>
                  <Badge variant={getStatusBadge(projeto.status).color as any}>
                    {getStatusBadge(projeto.status).label}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{projeto.descricao}</p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center">
                    <Target className="w-4 h-4 mr-2 text-primary" />
                    <span className="font-medium">Objetivo:</span>
                  </div>
                  <p className="text-muted-foreground ml-6">{projeto.objetivo}</p>
                  
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                    <span>{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')} 
                      {projeto.data_fim && ` - ${new Date(projeto.data_fim).toLocaleDateString('pt-BR')}`}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-primary" />
                    <span>{projeto.participantes_inscritos || 0}/{projeto.vagas_totais} participantes</span>
                  </div>
                  
                  {projeto.local && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      <span>{projeto.local}</span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between pt-3">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/projetos/${projeto.id}/participantes`)}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    Participantes
                  </Button>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedProjeto(projeto);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(projeto)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default Projetos;
