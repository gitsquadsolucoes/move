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
import { supabase } from '@/integrations/supabase/client';
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
  const [selectedOficina, setSelectedOficina] = useState<Oficina | null>(null);

  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

  const loadOficinas = async () => {
    try {
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

  const formatDiasSemana = (dias: string[]) => {
    return dias.map(dia => dia.slice(0, 3)).join(', ');
  };

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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {oficinas.map((oficina) => (
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
                <Button variant="outline" size="sm">
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
                    <Button variant="outline" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Oficinas;