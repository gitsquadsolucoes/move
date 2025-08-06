import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Eye, FileText, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface VisaoHolistica {
  id: string;
  data_visao: string;
  historia_vida: string;
  rede_apoio: string;
  visao_tecnica_referencia: string;
  encaminhamento_projeto: string;
  assinatura_tecnica: boolean;
}

export default function VisaoHolistica() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [existingVisao, setExistingVisao] = useState<VisaoHolistica | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    data_visao: new Date().toISOString().split('T')[0],
    historia_vida: '',
    rede_apoio: '',
    visao_tecnica_referencia: '',
    encaminhamento_projeto: '',
    assinatura_tecnica: false
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadVisaoHolistica()
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

  const loadVisaoHolistica = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('visoes_holisticas')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar visão holística:', error);
        return;
      }

      if (data) {
        setExistingVisao(data);
        setFormData({
          data_visao: data.data_visao,
          historia_vida: data.historia_vida || '',
          rede_apoio: data.rede_apoio || '',
          visao_tecnica_referencia: data.visao_tecnica_referencia || '',
          encaminhamento_projeto: data.encaminhamento_projeto || '',
          assinatura_tecnica: data.assinatura_tecnica
        });
      }
    } catch (error) {
      console.error('Erro ao carregar visão holística:', error);
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
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      const visaoData = {
        beneficiaria_id: beneficiaria.id,
        ...formData
      };

      let result;
      
      if (existingVisao) {
        // Atualizar registro existente
        result = await supabase
          .from('visoes_holisticas')
          .update(visaoData)
          .eq('id', existingVisao.id);
      } else {
        // Criar novo registro
        result = await supabase
          .from('visoes_holisticas')
          .insert([visaoData]);
      }

      if (result.error) {
        setError(`Erro ao salvar visão holística: ${result.error.message}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/beneficiarias/${beneficiaria.id}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar visão holística:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
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
          <p className="text-muted-foreground">Carregando visão holística...</p>
        </div>
      </div>
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
          <h1 className="text-3xl font-bold text-foreground">Visão Holística</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Visão Holística</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        {existingVisao && (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">Última atualização: {formatDate(existingVisao.data_visao)}</span>
          </div>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Visão holística salva com sucesso! Redirecionando...
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
              <Eye className="h-5 w-5" />
              Informações Básicas
            </CardTitle>
            <CardDescription>
              Dados gerais da visão holística
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome da Beneficiária</Label>
                <Input
                  value={beneficiaria.nome_completo}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_visao">Data da Visão Holística</Label>
                <Input
                  id="data_visao"
                  type="date"
                  value={formData.data_visao}
                  onChange={(e) => handleInputChange('data_visao', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* História de Vida */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              História de Vida
            </CardTitle>
            <CardDescription>
              Contexto histórico e trajetória de vida da beneficiária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="historia_vida">
                Descreva a história de vida da beneficiária
              </Label>
              <Textarea
                id="historia_vida"
                value={formData.historia_vida}
                onChange={(e) => handleInputChange('historia_vida', e.target.value)}
                placeholder="Inclua aspectos relevantes da trajetória de vida, experiências significativas, conquistas, desafios superados, etc."
                rows={6}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Rede de Apoio */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Rede de Apoio</CardTitle>
            <CardDescription>
              Identificação e mapeamento da rede de apoio social e familiar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="rede_apoio">
                Descreva a rede de apoio da beneficiária
              </Label>
              <Textarea
                id="rede_apoio"
                value={formData.rede_apoio}
                onChange={(e) => handleInputChange('rede_apoio', e.target.value)}
                placeholder="Inclua familiares, amigos, instituições, serviços públicos, organizações religiosas, vizinhos, colegas de trabalho, etc."
                rows={6}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Visão da Técnica de Referência */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Visão da Técnica de Referência</CardTitle>
            <CardDescription>
              Análise profissional e percepções da equipe técnica
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="visao_tecnica_referencia">
                Visão holística da técnica de referência
              </Label>
              <Textarea
                id="visao_tecnica_referencia"
                value={formData.visao_tecnica_referencia}
                onChange={(e) => handleInputChange('visao_tecnica_referencia', e.target.value)}
                placeholder="Inclua análise profissional sobre potencialidades, fragilidades, recursos, necessidades, prognóstico, etc."
                rows={6}
                className="min-h-[150px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Encaminhamento para Projeto */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Encaminhamento para Projeto</CardTitle>
            <CardDescription>
              Recomendações de projetos e atividades adequadas ao perfil da beneficiária
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="encaminhamento_projeto">
                Encaminhamento recomendado
              </Label>
              <Textarea
                id="encaminhamento_projeto"
                value={formData.encaminhamento_projeto}
                onChange={(e) => handleInputChange('encaminhamento_projeto', e.target.value)}
                placeholder="Especifique projetos, oficinas, cursos ou atividades recomendadas com base na análise holística realizada."
                rows={4}
                className="min-h-[120px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Assinatura */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Confirmação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_tecnica"
                  checked={formData.assinatura_tecnica}
                  onChange={(e) => handleInputChange('assinatura_tecnica', e.target.checked)}
                  className="rounded border-border"
                  required
                />
                <Label htmlFor="assinatura_tecnica" className="text-sm">
                  Confirmo que as informações acima foram analisadas e registradas por mim, 
                  <strong> {profile?.nome_completo}</strong>, 
                  como técnica responsável pelo acompanhamento.
                </Label>
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
                {existingVisao ? 'Atualizar' : 'Salvar'} Visão Holística
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}