import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Activity, Calendar, User, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
  data_inicio_instituto?: string;
  programa_servico?: string;
}

interface Evolucao {
  id: string;
  data_evolucao: string;
  descricao: string;
  responsavel: string;
  assinatura_beneficiaria: boolean;
  data_criacao: string;
}

export default function FichaEvolucao() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [evolucoes, setEvolucoes] = useState<Evolucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state para nova evolução
  const [formData, setFormData] = useState({
    data_evolucao: new Date().toISOString().split('T')[0],
    descricao: '',
    responsavel: profile?.nome_completo || '',
    assinatura_beneficiaria: false
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadEvolucoes()
      ]);
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

  const loadEvolucoes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('fichas_evolucao')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_evolucao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar evoluções:', error);
        return;
      }

      setEvolucoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar evoluções:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria || !formData.descricao.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const evolucaoData = {
        beneficiaria_id: beneficiaria.id,
        ...formData
      };

      const { error } = await supabase
        .from('fichas_evolucao')
        .insert([evolucaoData]);

      if (error) {
        setError(`Erro ao salvar evolução: ${error.message}`);
        return;
      }

      setSuccess(true);
      setFormData({
        data_evolucao: new Date().toISOString().split('T')[0],
        descricao: '',
        responsavel: profile?.nome_completo || '',
        assinatura_beneficiaria: false
      });
      setShowForm(false);
      
      // Recarregar evoluções
      await loadEvolucoes();
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar evolução:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loading && evolucoes.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando ficha de evolução...</p>
        </div>
      </div>
    );
  }

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Ficha de Evolução" 
        description="Selecione uma beneficiária para acessar sua ficha de evolução"
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
          <h1 className="text-3xl font-bold text-foreground">Ficha de Evolução</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Ficha de Evolução</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Evolução
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Evolução registrada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Cabeçalho da Ficha */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Informações da Beneficiária
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
              <p className="font-semibold">{beneficiaria.nome_completo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data de Nascimento</Label>
              <p>{formatDate(beneficiaria.data_nascimento)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Data de Início no Instituto</Label>
              <p>{beneficiaria.data_inicio_instituto ? formatDate(beneficiaria.data_inicio_instituto) : 'Não informada'}</p>
            </div>
          </div>
          <div className="mt-4">
            <Label className="text-sm font-medium text-muted-foreground">Programa/Oficina/Serviço</Label>
            <p className="font-medium">{beneficiaria.programa_servico || 'Não definido'}</p>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Evolução */}
      {showForm && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle>Registrar Nova Evolução</CardTitle>
            <CardDescription>
              Adicione um novo registro de acompanhamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="data_evolucao">Data da Evolução</Label>
                  <Input
                    id="data_evolucao"
                    type="date"
                    value={formData.data_evolucao}
                    onChange={(e) => handleInputChange('data_evolucao', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="responsavel">Responsável</Label>
                  <Input
                    id="responsavel"
                    value={formData.responsavel}
                    onChange={(e) => handleInputChange('responsavel', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição da Evolução</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => handleInputChange('descricao', e.target.value)}
                  placeholder="Descreva a interação, participação, solicitação, ausência, etc..."
                  rows={6}
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_beneficiaria"
                  checked={formData.assinatura_beneficiaria}
                  onChange={(e) => handleInputChange('assinatura_beneficiaria', e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="assinatura_beneficiaria" className="text-sm">
                  A beneficiária ciente do registro
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Evolução
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Timeline de Evoluções */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Histórico de Evoluções</CardTitle>
          <CardDescription>
            Registro cronológico do acompanhamento ({evolucoes.length} registro{evolucoes.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evolucoes.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma evolução registrada ainda
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeira Evolução
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {evolucoes.map((evolucao, index) => (
                <div key={evolucao.id} className="relative">
                  {/* Linha da timeline */}
                  {index < evolucoes.length - 1 && (
                    <div className="absolute left-4 top-12 w-0.5 h-full bg-border"></div>
                  )}
                  
                  <div className="flex gap-4">
                    {/* Indicador da timeline */}
                    <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-primary-foreground" />
                    </div>
                    
                    {/* Conteúdo */}
                    <div className="flex-1 min-w-0">
                      <Card className="shadow-soft">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold">{formatDate(evolucao.data_evolucao)}</h4>
                              <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {evolucao.responsavel}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              {evolucao.assinatura_beneficiaria && (
                                <Badge variant="secondary" className="text-xs">
                                  Beneficiária ciente
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {formatDateTime(evolucao.data_criacao)}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="prose prose-sm max-w-none">
                            <p className="text-foreground whitespace-pre-wrap">{evolucao.descricao}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}