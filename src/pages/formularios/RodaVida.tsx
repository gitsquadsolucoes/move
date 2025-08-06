import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Target, BarChart3, Loader2, CheckCircle, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface RodaVida {
  id: string;
  data_roda: string;
  espiritualidade_score: number;
  saude_score: number;
  lazer_score: number;
  equilibrio_emocional_score: number;
  vida_social_score: number;
  relacionamento_familiar_score: number;
  recursos_financeiros_score: number;
  amor_score: number;
  contribuicao_social_score: number;
  proposito_score: number;
  data_criacao: string;
}

const areas = [
  { key: 'espiritualidade_score', label: 'Espiritualidade', color: 'hsl(var(--primary))' },
  { key: 'saude_score', label: 'Saúde', color: 'hsl(var(--success))' },
  { key: 'lazer_score', label: 'Lazer', color: 'hsl(var(--warning))' },
  { key: 'equilibrio_emocional_score', label: 'Equilíbrio Emocional', color: 'hsl(var(--accent-strong))' },
  { key: 'vida_social_score', label: 'Vida Social', color: 'hsl(var(--primary-hover))' },
  { key: 'relacionamento_familiar_score', label: 'Relacionamento Familiar', color: 'hsl(var(--success-light))' },
  { key: 'recursos_financeiros_score', label: 'Recursos Financeiros', color: 'hsl(var(--warning-light))' },
  { key: 'amor_score', label: 'Amor', color: 'hsl(15, 85%, 60%)' },
  { key: 'contribuicao_social_score', label: 'Contribuição Social', color: 'hsl(var(--accent))' },
  { key: 'proposito_score', label: 'Propósito', color: 'hsl(var(--primary-light))' }
];

export default function RodaVida() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [existingRoda, setExistingRoda] = useState<RodaVida | null>(null);
  const [historico, setHistorico] = useState<RodaVida[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    data_roda: new Date().toISOString().split('T')[0],
    espiritualidade_score: 5,
    saude_score: 5,
    lazer_score: 5,
    equilibrio_emocional_score: 5,
    vida_social_score: 5,
    relacionamento_familiar_score: 5,
    recursos_financeiros_score: 5,
    amor_score: 5,
    contribuicao_social_score: 5,
    proposito_score: 5
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadRodaVida(),
        loadHistorico()
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

  const loadRodaVida = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('roda_vida')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_roda', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar roda da vida:', error);
        return;
      }

      if (data) {
        setExistingRoda(data);
        setFormData({
          data_roda: data.data_roda,
          espiritualidade_score: data.espiritualidade_score || 5,
          saude_score: data.saude_score || 5,
          lazer_score: data.lazer_score || 5,
          equilibrio_emocional_score: data.equilibrio_emocional_score || 5,
          vida_social_score: data.vida_social_score || 5,
          relacionamento_familiar_score: data.relacionamento_familiar_score || 5,
          recursos_financeiros_score: data.recursos_financeiros_score || 5,
          amor_score: data.amor_score || 5,
          contribuicao_social_score: data.contribuicao_social_score || 5,
          proposito_score: data.proposito_score || 5
        });
      }
    } catch (error) {
      console.error('Erro ao carregar roda da vida:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHistorico = async () => {
    try {
      const { data, error } = await supabase
        .from('roda_vida')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_roda', { ascending: false });

      if (error) {
        console.error('Erro ao carregar histórico:', error);
        return;
      }

      setHistorico(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const handleScoreChange = (area: string, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [area]: value[0]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      const rodaData = {
        beneficiaria_id: beneficiaria.id,
        ...formData
      };

      // Sempre criar novo registro para manter histórico
      const { error } = await supabase
        .from('roda_vida')
        .insert([rodaData]);

      if (error) {
        setError(`Erro ao salvar roda da vida: ${error.message}`);
        return;
      }

      setSuccess(true);
      
      // Recarregar dados
      await Promise.all([loadRodaVida(), loadHistorico()]);
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar roda da vida:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const calculateMedia = () => {
    const scores = areas.map(area => formData[area.key as keyof typeof formData] as number);
    return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return 'text-destructive';
    if (score <= 6) return 'text-warning';
    return 'text-success';
  };

  const getScoreLabel = (score: number) => {
    if (score <= 3) return 'Baixo';
    if (score <= 6) return 'Médio';
    return 'Alto';
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
          <p className="text-muted-foreground">Carregando roda da vida...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Roda da Vida</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Roda da Vida Individual</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {historico.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">{historico.length} avaliação{historico.length !== 1 ? 'ões' : ''} no histórico</span>
            </div>
          )}
          <Badge variant="outline" className="text-lg px-3 py-1">
            Média: {calculateMedia()}
          </Badge>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Roda da vida salva com sucesso!
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
        {/* Data da Avaliação */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Avaliação das Áreas de Vida
            </CardTitle>
            <CardDescription>
              Avalie cada área de vida de 1 (muito insatisfeita) a 10 (muito satisfeita)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label htmlFor="data_roda">Data da Avaliação</Label>
              <Input
                id="data_roda"
                type="date"
                value={formData.data_roda}
                onChange={(e) => setFormData(prev => ({ ...prev, data_roda: e.target.value }))}
                required
                className="w-fit"
              />
            </div>
          </CardContent>
        </Card>

        {/* Áreas de Vida */}
        <div className="grid gap-4 lg:grid-cols-2">
          {areas.map((area) => {
            const score = formData[area.key as keyof typeof formData] as number;
            return (
              <Card key={area.key} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{area.label}</h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`${getScoreColor(score)} border-current`}
                        >
                          {score}/10
                        </Badge>
                        <span className={`text-sm font-medium ${getScoreColor(score)}`}>
                          {getScoreLabel(score)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Slider
                        value={[score]}
                        onValueChange={(value) => handleScoreChange(area.key, value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>1 - Muito Insatisfeita</span>
                        <span>10 - Muito Satisfeita</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Resumo Visual */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumo da Avaliação
            </CardTitle>
            <CardDescription>
              Visão geral dos scores em todas as áreas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              {areas.map((area) => {
                const score = formData[area.key as keyof typeof formData] as number;
                return (
                  <div key={area.key} className="text-center">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="hsl(var(--border))"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke={area.color}
                          strokeWidth="2"
                          strokeDasharray={`${score * 10}, 100`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-bold">{score}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {area.label}
                    </p>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">{calculateMedia()}</p>
                  <p className="text-sm text-muted-foreground">Média Geral</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico */}
        {historico.length > 0 && (
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Histórico de Avaliações</CardTitle>
              <CardDescription>
                Evolução ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {historico.slice(0, 5).map((roda, index) => {
                  const media = areas.reduce((sum, area) => 
                    sum + (roda[area.key as keyof RodaVida] as number || 0), 0
                  ) / areas.length;
                  
                  return (
                    <div key={roda.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="font-medium">{formatDate(roda.data_roda)}</p>
                        <p className="text-sm text-muted-foreground">
                          {index === 0 ? 'Mais recente' : `${index + 1}ª avaliação`}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-base">
                        {media.toFixed(1)}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
          >
            Voltar
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
                Salvar Avaliação
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}