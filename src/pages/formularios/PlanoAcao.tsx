import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Target, Plus, Trash2, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface PlanoAcao {
  id: string;
  objetivos: string;
  acoes: string;
  prazos: string;
  responsaveis: string;
  resultados_esperados: string;
  acompanhamento: string;
  data_criacao: string;
}

interface AcaoItem {
  id?: string;
  objetivo: string;
  acao: string;
  prazo: string;
  responsavel: string;
  resultado_esperado: string;
  status: 'a_fazer' | 'em_andamento' | 'concluido';
}

export default function PlanoAcao() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [existingPlano, setExistingPlano] = useState<PlanoAcao | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [acoes, setAcoes] = useState<AcaoItem[]>([
    {
      objetivo: '',
      acao: '',
      prazo: '',
      responsavel: '',
      resultado_esperado: '',
      status: 'a_fazer'
    }
  ]);
  
  const [acompanhamento, setAcompanhamento] = useState('');

  const statusOptions = [
    { value: 'a_fazer', label: 'A Fazer', icon: Clock, color: 'text-muted-foreground' },
    { value: 'em_andamento', label: 'Em Andamento', icon: AlertCircle, color: 'text-warning' },
    { value: 'concluido', label: 'Concluído', icon: CheckCircle, color: 'text-success' }
  ];

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadPlanoAcao()
      ]);
    } else {
      setLoading(false);
    }
  }, [beneficiariaId]);

  const loadBeneficiaria = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiarias')
        .select('*')
        .eq('id', beneficiariaId)
        .single();

      if (error) {
        setError('Beneficiária não encontrada');
        return;
      }

      setBeneficiaria(data);
    } catch (error) {
      console.error('Erro ao carregar beneficiária:', error);
      setError('Erro ao carregar dados da beneficiária');
    }
  };

  const loadPlanoAcao = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('planos_acao')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar plano de ação:', error);
        return;
      }

      if (data) {
        setExistingPlano(data);
        setAcompanhamento(data.acompanhamento || '');
        
        // Parse existing actions if they exist
        try {
          if (data.objetivos || data.acoes) {
            // Convert old format to new format
            setAcoes([{
              objetivo: data.objetivos || '',
              acao: data.acoes || '',
              prazo: data.prazos || '',
              responsavel: data.responsaveis || '',
              resultado_esperado: data.resultados_esperados || '',
              status: 'a_fazer' as const
            }]);
          }
        } catch (e) {
          console.error('Erro ao parsear ações:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar plano de ação:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcaoChange = (index: number, field: keyof AcaoItem, value: string) => {
    setAcoes(prev => prev.map((acao, i) => 
      i === index ? { ...acao, [field]: value } : acao
    ));
  };

  const addAcao = () => {
    setAcoes(prev => [...prev, {
      objetivo: '',
      acao: '',
      prazo: '',
      responsavel: '',
      resultado_esperado: '',
      status: 'a_fazer'
    }]);
  };

  const removeAcao = (index: number) => {
    if (acoes.length > 1) {
      setAcoes(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      // For now, we'll store the first action's data in the original format
      // In a production system, you might want to create a separate actions table
      const primeiraAcao = acoes[0];
      
      const planoData = {
        beneficiaria_id: beneficiaria.id,
        objetivos: primeiraAcao?.objetivo || '',
        acoes: primeiraAcao?.acao || '',
        prazos: primeiraAcao?.prazo || '',
        responsaveis: primeiraAcao?.responsavel || '',
        resultados_esperados: primeiraAcao?.resultado_esperado || '',
        acompanhamento: acompanhamento
      };

      let result;
      
      if (existingPlano) {
        // Update existing plan
        result = await supabase
          .from('planos_acao')
          .update(planoData)
          .eq('id', existingPlano.id);
      } else {
        // Create new plan
        result = await supabase
          .from('planos_acao')
          .insert([planoData]);
      }

      if (result.error) {
        setError(`Erro ao salvar plano de ação: ${result.error.message}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/beneficiarias/${beneficiaria.id}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.icon : Clock;
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption ? statusOption.color : 'text-muted-foreground';
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando plano de ação...</p>
        </div>
      </div>
    );
  }

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Plano de Ação" 
        description="Selecione uma beneficiária para criar o plano de ação"
      />
    );
  }

  if (error || !beneficiaria) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/beneficiarias')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Plano de Ação</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Plano de Ação Personalizado</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        {existingPlano && (
          <Badge variant="secondary">
            Última atualização: {formatDate(existingPlano.data_criacao)}
          </Badge>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Plano de ação salvo com sucesso! Redirecionando...
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informações Básicas */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Informações da Beneficiária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                <p className="font-semibold">{beneficiaria.nome_completo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
                <p>{formatDate(beneficiaria.data_nascimento)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Objetivos e Ações */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Objetivos e Ações</CardTitle>
            <CardDescription>
              Defina objetivos claros e as ações necessárias para alcançá-los
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {acoes.map((acao, index) => (
              <Card key={index} className="p-4 border-dashed border-2">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Ação {index + 1}</h4>
                  <div className="flex items-center gap-2">
                    {acoes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAcao(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Objetivo</Label>
                    <Textarea
                      value={acao.objetivo}
                      onChange={(e) => handleAcaoChange(index, 'objetivo', e.target.value)}
                      placeholder="Descreva o objetivo a ser alcançado"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ação</Label>
                    <Textarea
                      value={acao.acao}
                      onChange={(e) => handleAcaoChange(index, 'acao', e.target.value)}
                      placeholder="Descreva as ações específicas a serem realizadas"
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Prazo</Label>
                      <Input
                        type="date"
                        value={acao.prazo}
                        onChange={(e) => handleAcaoChange(index, 'prazo', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável</Label>
                      <Input
                        value={acao.responsavel}
                        onChange={(e) => handleAcaoChange(index, 'responsavel', e.target.value)}
                        placeholder="Nome do responsável"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Resultado Esperado</Label>
                      <Textarea
                        value={acao.resultado_esperado}
                        onChange={(e) => handleAcaoChange(index, 'resultado_esperado', e.target.value)}
                        placeholder="Descreva o resultado esperado"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={acao.status}
                        onValueChange={(value) => handleAcaoChange(index, 'status', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                <div className="flex items-center gap-2">
                                  <Icon className={`h-4 w-4 ${option.color}`} />
                                  {option.label}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mt-4 flex justify-end">
                  <Badge variant="outline" className={getStatusColor(acao.status)}>
                    {React.createElement(getStatusIcon(acao.status), { className: "h-3 w-3 mr-1" })}
                    {statusOptions.find(opt => opt.value === acao.status)?.label}
                  </Badge>
                </div>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addAcao}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Nova Ação
            </Button>
          </CardContent>
        </Card>

        {/* Acompanhamento */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Acompanhamento</CardTitle>
            <CardDescription>
              Notas gerais sobre o acompanhamento do plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="acompanhamento">Observações de Acompanhamento</Label>
              <Textarea
                id="acompanhamento"
                value={acompanhamento}
                onChange={(e) => setAcompanhamento(e.target.value)}
                placeholder="Registre observações sobre o progresso, dificuldades encontradas, ajustes necessários, etc."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="shadow-soft bg-muted/50">
          <CardHeader>
            <CardTitle>Resumo do Plano</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{acoes.length}</p>
                <p className="text-sm text-muted-foreground">Ações Planejadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-success">
                  {acoes.filter(acao => acao.status === 'concluido').length}
                </p>
                <p className="text-sm text-muted-foreground">Concluídas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-warning">
                  {acoes.filter(acao => acao.status === 'em_andamento').length}
                </p>
                <p className="text-sm text-muted-foreground">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {existingPlano ? 'Atualizar' : 'Salvar'} Plano de Ação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}