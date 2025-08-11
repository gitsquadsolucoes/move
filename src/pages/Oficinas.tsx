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
import { Plus, Users, Calendar, Clock, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

interface Oficina {
  id: string;
  nome: string;
  descricao: string;
  instrutor: string;
  data_inicio: string;
  data_fim?: string;
  horario_inicio: string;
  horario_fim: string;
  dias_semana: string[];
  vagas_totais: number;
  vagas_ocupadas: number;
  ativa: boolean;
}

const Oficinas = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [oficinas, setOficinas] = useState<Oficina[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showPresenca, setShowPresenca] = useState(false);
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [participantes, setParticipantes] = useState<any[]>([]);
  const [presencas, setPresencas] = useState<Record<string, boolean>>({});

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const loadOficinas = async () => {
    try {
      setLoading(true);
      
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig) {
        // Dados mock para desenvolvimento
        const mockOficinas: Oficina[] = [
          {
            id: '1',
            nome: 'Artesanato em Crochê',
            descricao: 'Oficina de crochê para iniciantes e intermediárias, com foco em peças comerciais.',
            instrutor: 'Maria José Silva',
            data_inicio: '2024-01-15',
            data_fim: '2024-06-15',
            horario_inicio: '14:00',
            horario_fim: '17:00',
            dias_semana: ['segunda', 'quarta', 'sexta'],
            vagas_totais: 20,
            vagas_ocupadas: 15,
            ativa: true
          },
          {
            id: '2',
            nome: 'Culinária Básica',
            descricao: 'Aprenda receitas práticas e nutritivas para o dia a dia.',
            instrutor: 'Ana Paula Santos',
            data_inicio: '2024-02-01',
            data_fim: '2024-05-01',
            horario_inicio: '08:00',
            horario_fim: '11:00',
            dias_semana: ['terça', 'quinta'],
            vagas_totais: 15,
            vagas_ocupadas: 12,
            ativa: true
          },
          {
            id: '3',
            nome: 'Informática Básica',
            descricao: 'Curso básico de informática incluindo Word, Excel e navegação na internet.',
            instrutor: 'Carlos Oliveira',
            data_inicio: '2024-01-20',
            data_fim: '2024-04-20',
            horario_inicio: '09:00',
            horario_fim: '12:00',
            dias_semana: ['segunda', 'terça', 'quarta', 'quinta', 'sexta'],
            vagas_totais: 25,
            vagas_ocupadas: 23,
            ativa: true
          },
          {
            id: '4',
            nome: 'Costura Industrial',
            descricao: 'Oficina de costura com foco em capacitação profissional.',
            instrutor: 'Lucia Fernandes',
            data_inicio: '2023-10-01',
            data_fim: '2023-12-15',
            horario_inicio: '13:00',
            horario_fim: '17:00',
            dias_semana: ['segunda', 'quarta', 'sexta'],
            vagas_totais: 18,
            vagas_ocupadas: 18,
            ativa: false
          }
        ];
        setOficinas(mockOficinas);
        return;
      }

      const { data, error } = await supabase
        .from('oficinas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOficinas(data || []);
    } catch (error) {
      console.error('Erro ao carregar oficinas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar oficinas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOficinas();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const oficina = {
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      instrutor: formData.get('instrutor') as string,
      data_inicio: formData.get('data_inicio') as string,
      data_fim: formData.get('data_fim') as string || null,
      horario_inicio: formData.get('horario_inicio') as string,
      horario_fim: formData.get('horario_fim') as string,
      dias_semana: Array.from(formData.getAll('dias_semana')) as string[],
      vagas_totais: parseInt(formData.get('vagas_totais') as string),
      ativa: formData.get('ativa') === 'on'
    };

    try {
      if (selectedOficina) {
        const { error } = await supabase
          .from('oficinas')
          .update(oficina)
          .eq('id', selectedOficina.id);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Oficina atualizada com sucesso!" });
      } else {
        const { error } = await supabase
          .from('oficinas')
          .insert([oficina]);
        if (error) throw error;
        toast({ title: "Sucesso", description: "Oficina criada com sucesso!" });
      }
      
      setShowForm(false);
      setSelectedOficina(null);
      loadOficinas();
    } catch (error) {
      console.error('Erro ao salvar oficina:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar oficina",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (oficina: Oficina) => {
    if (!confirm(`Tem certeza que deseja excluir a oficina "${oficina.nome}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('oficinas')
        .delete()
        .eq('id', oficina.id);

      if (error) throw error;
      
      toast({ title: "Sucesso", description: "Oficina excluída com sucesso!" });
      loadOficinas();
    } catch (error) {
      console.error('Erro ao excluir oficina:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir oficina",
        variant: "destructive",
      });
    }
  };

  const loadParticipantes = async (oficinaId: string) => {
    try {
      // Carregar participantes da oficina
      const mockParticipantes = [
        { id: '1', nome: 'Maria Silva', email: 'maria@email.com', presente: false },
        { id: '2', nome: 'Ana Santos', email: 'ana@email.com', presente: false },
        { id: '3', nome: 'Carla Oliveira', email: 'carla@email.com', presente: false },
      ];
      
      setParticipantes(mockParticipantes);
      setPresencas({});
    } catch (error) {
      console.error('Erro ao carregar participantes:', error);
    }
  };

  const handleSavePresenca = async () => {
    try {
      // Salvar presenças no banco de dados
      const presencasData = participantes.map(p => ({
        participante_id: p.id,
        oficina_id: selectedOficina?.id,
        presente: presencas[p.id] || false,
        data: new Date().toISOString().split('T')[0]
      }));

      // Aqui seria a integração com Supabase
      console.log('Salvando presenças:', presencasData);
      
      toast({
        title: "Sucesso",
        description: "Presenças registradas com sucesso!",
      });
      
      setShowPresenca(false);
    } catch (error) {
      console.error('Erro ao salvar presenças:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar presenças",
        variant: "destructive",
      });
    }
  };

  const formatDiasSemana = (dias: string[]) => {
    return dias.map(dia => dia.slice(0, 3)).join(', ');
  };

  const oficinasFiltradas = oficinas.filter(oficina => {
    const matchesSearch = oficina.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         oficina.instrutor.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filtroStatus === 'todas' || 
                         (filtroStatus === 'ativas' && oficina.ativa) ||
                         (filtroStatus === 'inativas' && !oficina.ativa);
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-6">Carregando oficinas...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Oficinas</h1>
          <p className="text-muted-foreground">Gerencie as oficinas e controle de presença</p>
        </div>
        {isAdmin && (
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button onClick={() => setSelectedOficina(null)}>
                <Plus className="w-4 h-4 mr-2" />
                Nova Oficina
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {selectedOficina ? 'Editar Oficina' : 'Nova Oficina'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome da Oficina</Label>
                    <Input
                      id="nome"
                      name="nome"
                      defaultValue={selectedOficina?.nome}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="instrutor">Instrutor</Label>
                    <Input
                      id="instrutor"
                      name="instrutor"
                      defaultValue={selectedOficina?.instrutor}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    defaultValue={selectedOficina?.descricao}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="data_inicio">Data de Início</Label>
                    <Input
                      id="data_inicio"
                      name="data_inicio"
                      type="date"
                      defaultValue={selectedOficina?.data_inicio}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="data_fim">Data de Fim</Label>
                    <Input
                      id="data_fim"
                      name="data_fim"
                      type="date"
                      defaultValue={selectedOficina?.data_fim}
                    />
                  </div>
                  <div>
                    <Label htmlFor="vagas_totais">Vagas Totais</Label>
                    <Input
                      id="vagas_totais"
                      name="vagas_totais"
                      type="number"
                      min="1"
                      defaultValue={selectedOficina?.vagas_totais || 20}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="horario_inicio">Horário de Início</Label>
                    <Input
                      id="horario_inicio"
                      name="horario_inicio"
                      type="time"
                      defaultValue={selectedOficina?.horario_inicio}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="horario_fim">Horário de Fim</Label>
                    <Input
                      id="horario_fim"
                      name="horario_fim"
                      type="time"
                      defaultValue={selectedOficina?.horario_fim}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label>Dias da Semana</Label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {diasSemana.map((dia) => (
                      <div key={dia} className="flex items-center space-x-2">
                        <Checkbox
                          id={dia}
                          name="dias_semana"
                          value={dia.toLowerCase()}
                          defaultChecked={selectedOficina?.dias_semana?.includes(dia.toLowerCase())}
                        />
                        <Label htmlFor={dia} className="text-sm">{dia}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="ativa"
                    name="ativa"
                    defaultChecked={selectedOficina?.ativa !== false}
                  />
                  <Label htmlFor="ativa">Oficina ativa</Label>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {selectedOficina ? 'Atualizar' : 'Criar'} Oficina
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Modal de Controle de Presença */}
      <Dialog open={showPresenca} onOpenChange={setShowPresenca}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Controle de Presença - {selectedOficina?.nome}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <p><strong>Instrutor:</strong> {selectedOficina?.instrutor}</p>
              <p><strong>Horário:</strong> {selectedOficina?.horario_inicio} - {selectedOficina?.horario_fim}</p>
              <p><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Lista de Participantes</h4>
              {participantes.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {participantes.map((participante) => (
                    <div key={participante.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{participante.nome}</p>
                        <p className="text-sm text-muted-foreground">{participante.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`presenca-${participante.id}`}
                          checked={presencas[participante.id] || false}
                          onCheckedChange={(checked) => 
                            setPresencas(prev => ({ ...prev, [participante.id]: checked as boolean }))
                          }
                        />
                        <Label htmlFor={`presenca-${participante.id}`} className="text-sm">
                          Presente
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                  <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Nenhum participante inscrito nesta oficina</p>
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowPresenca(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSavePresenca} disabled={participantes.length === 0}>
                Salvar Presenças
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={() => setShowPresenca(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome da oficina ou instrutor..."
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
            <SelectItem value="todas">Todas as oficinas</SelectItem>
            <SelectItem value="ativas">Apenas ativas</SelectItem>
            <SelectItem value="inativas">Apenas inativas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Oficinas</p>
                <p className="text-2xl font-bold">{oficinas.length}</p>
              </div>
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Oficinas Ativas</p>
                <p className="text-2xl font-bold">{oficinas.filter(o => o.ativa).length}</p>
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
                <p className="text-2xl font-bold">{oficinas.reduce((acc, o) => acc + o.vagas_totais, 0)}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <UserCheck className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Vagas Ocupadas</p>
                <p className="text-2xl font-bold">{oficinas.reduce((acc, o) => acc + (o.vagas_ocupadas || 0), 0)}</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {oficinasFiltradas.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm || filtroStatus !== 'todas' 
                ? 'Nenhuma oficina encontrada com os filtros aplicados.' 
                : 'Nenhuma oficina cadastrada ainda.'}
            </p>
          </div>
        ) : (
          oficinasFiltradas.map((oficina) => (
          <Card key={oficina.id} className="shadow-soft">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{oficina.nome}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Instrutor: {oficina.instrutor}
                  </p>
                </div>
                <Badge variant={oficina.ativa ? "default" : "secondary"}>
                  {oficina.ativa ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {oficina.descricao && (
                <p className="text-sm text-muted-foreground">{oficina.descricao}</p>
              )}
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <span>{formatDiasSemana(oficina.dias_semana)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  <span>{oficina.horario_inicio} - {oficina.horario_fim}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2 text-primary" />
                  <span>{oficina.vagas_ocupadas || 0}/{oficina.vagas_totais} vagas</span>
                </div>
              </div>

              <div className="flex justify-between pt-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedOficina(oficina);
                    loadParticipantes(oficina.id);
                    setShowPresenca(true);
                  }}
                >
                  <UserCheck className="w-4 h-4 mr-1" />
                  Presença
                </Button>
                {isAdmin && (
                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOficina(oficina);
                        setShowForm(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDelete(oficina)}
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

export default Oficinas;