import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users, Calendar, Clock, Edit, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { useToast } from '@/components/ui/use-toast';

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  coordenador: string;
  data_inicio: string;
  data_fim?: string;
  status: 'planejamento' | 'em_andamento' | 'concluido' | 'cancelado';
  vagas_totais: number;
  vagas_ocupadas?: number;
  orcamento?: number;
  local?: string;
}

export default function Projetos() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjeto, setSelectedProjeto] = useState<Projeto | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    coordenador: '',
    data_inicio: '',
    data_fim: '',
    status: 'planejamento',
    local: '',
    vagas_totais: 10,
    orcamento: 0
  });

  const loadProjetos = async () => {
    try {
      setLoading(true);
      const response = await api.getProjetos();
      const projetosData = Array.isArray(response.data) ? response.data : 
                          Array.isArray(response) ? response : [];
      setProjetos(projetosData);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os projetos.",
        variant: "destructive",
      });
      setProjetos([]); // Garantir que sempre será um array
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjetos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (selectedProjeto) {
        await api.updateProjeto(selectedProjeto.id, formData);
        toast({ title: "Sucesso", description: "Projeto atualizado com sucesso!" });
      } else {
        await api.createProjeto(formData);
        toast({ title: "Sucesso", description: "Projeto criado com sucesso!" });
      }
      
      setShowForm(false);
      setSelectedProjeto(null);
      resetForm();
      loadProjetos();
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o projeto.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
    
    try {
      await api.deleteProjeto(id);
      toast({ title: "Sucesso", description: "Projeto excluído com sucesso!" });
      loadProjetos();
    } catch (error) {
      console.error('Erro ao excluir projeto:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o projeto.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      coordenador: '',
      data_inicio: '',
      data_fim: '',
      status: 'planejamento',
      local: '',
      vagas_totais: 10,
      orcamento: 0
    });
  };

  const openEditForm = (projeto: Projeto) => {
    setSelectedProjeto(projeto);
    setFormData({
      nome: projeto.nome,
      descricao: projeto.descricao,
      coordenador: projeto.coordenador,
      data_inicio: projeto.data_inicio,
      data_fim: projeto.data_fim || '',
      status: projeto.status,
      local: projeto.local || '',
      vagas_totais: projeto.vagas_totais,
      orcamento: projeto.orcamento || 0
    });
    setShowForm(true);
  };

  const openCreateForm = () => {
    setSelectedProjeto(null);
    resetForm();
    setShowForm(true);
  };

  const filteredProjetos = Array.isArray(projetos) ? projetos.filter(projeto => {
    const matchesSearch = projeto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       projeto.coordenador?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todos' || projeto.status === filtroStatus;
    
    return matchesSearch && matchesStatus;
  }) : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando projetos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Projetos</h1>
        {isAdmin && (
          <Button onClick={openCreateForm}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Projeto
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome ou coordenador..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="planejamento">Planejamento</SelectItem>
            <SelectItem value="em_andamento">Em Andamento</SelectItem>
            <SelectItem value="concluido">Concluído</SelectItem>
            <SelectItem value="cancelado">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Projetos */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjetos.map((projeto) => (
          <Card key={projeto.id} className="h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{projeto.nome}</CardTitle>
                <Badge variant={
                  projeto.status === 'em_andamento' ? "default" :
                  projeto.status === 'concluido' ? "success" :
                  projeto.status === 'cancelado' ? "destructive" :
                  "secondary"
                }>
                  {projeto.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">{projeto.descricao}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 mr-2" />
                  <span>Coordenador: {projeto.coordenador}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>
                    {new Date(projeto.data_inicio).toLocaleDateString()}
                    {projeto.data_fim && ` - ${new Date(projeto.data_fim).toLocaleDateString()}`}
                  </span>
                </div>

                {projeto.local && (
                  <div className="flex items-center text-sm">
                    <span>📍 {projeto.local}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span>Vagas: {projeto.vagas_ocupadas || 0}/{projeto.vagas_totais}</span>
                  <Badge variant="outline">
                    {Math.round(((projeto.vagas_ocupadas || 0) / projeto.vagas_totais) * 100)}% ocupado
                  </Badge>
                </div>

                {projeto.orcamento && (
                  <div className="flex items-center text-sm">
                    <span>💰 Orçamento: R$ {projeto.orcamento.toLocaleString('pt-BR')}</span>
                  </div>
                )}
              </div>

              {isAdmin && (
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openEditForm(projeto)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(projeto.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjetos.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Nenhum projeto encontrado.</p>
        </div>
      )}

      {/* Modal de Formulário */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedProjeto ? 'Editar Projeto' : 'Novo Projeto'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="coordenador">Coordenador *</Label>
                <Input
                  id="coordenador"
                  value={formData.coordenador}
                  onChange={(e) => setFormData({...formData, coordenador: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="status">Status *</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData({...formData, status: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planejamento">Planejamento</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="concluido">Concluído</SelectItem>
                    <SelectItem value="cancelado">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="data_inicio">Data de Início *</Label>
                <Input
                  id="data_inicio"
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({...formData, data_inicio: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="data_fim">Data de Término</Label>
                <Input
                  id="data_fim"
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({...formData, data_fim: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="vagas_totais">Vagas Totais *</Label>
                <Input
                  id="vagas_totais"
                  type="number"
                  min="1"
                  value={formData.vagas_totais}
                  onChange={(e) => setFormData({...formData, vagas_totais: parseInt(e.target.value)})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="orcamento">Orçamento (R$)</Label>
                <Input
                  id="orcamento"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.orcamento}
                  onChange={(e) => setFormData({...formData, orcamento: parseFloat(e.target.value)})}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="local">Local</Label>
                <Input
                  id="local"
                  value={formData.local}
                  onChange={(e) => setFormData({...formData, local: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {selectedProjeto ? 'Salvar Alterações' : 'Criar Projeto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
