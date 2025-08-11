import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { DocumentDownloadButton } from '@/components/DocumentDownloadButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, Target, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface RodaVida {
  id?: string;
  beneficiaria_id: string;
  data_roda: string;
  data_avaliacao?: string;
  objetivo_principal?: string;
  saude_score?: number;
  observacoes_saude?: string;
  amor_score?: number;
  observacoes_amor?: string;
  recursos_financeiros_score?: number;
  observacoes_recursos_financeiros?: string;
  relacionamento_familiar_score?: number;
  observacoes_relacionamento_familiar?: string;
  vida_social_score?: number;
  observacoes_vida_social?: string;
  contribuicao_social_score?: number;
  observacoes_contribuicao_social?: string;
  proposito_score?: number;
  observacoes_proposito?: string;
  equilibrio_emocional_score?: number;
  observacoes_equilibrio_emocional?: string;
  lazer_score?: number;
  observacoes_lazer?: string;
  espiritualidade_score?: number;
  observacoes_espiritualidade?: string;
  planos_melhoria?: string;
  assinatura_beneficiaria?: boolean;
  assinatura_profissional?: boolean;
  responsavel_tecnico?: string;
  data_criacao?: string;
}

const areas = [
  { key: 'saude', label: 'Saúde', color: 'hsl(var(--success))' },
  { key: 'amor', label: 'Amor', color: 'hsl(15, 85%, 60%)' },
  { key: 'recursos_financeiros', label: 'Recursos Financeiros', color: 'hsl(var(--warning))' },
  { key: 'relacionamento_familiar', label: 'Relacionamento Familiar', color: 'hsl(var(--success-light))' },
  { key: 'vida_social', label: 'Vida Social', color: 'hsl(var(--primary-hover))' },
  { key: 'contribuicao_social', label: 'Contribuição Social', color: 'hsl(var(--accent))' },
  { key: 'proposito', label: 'Propósito', color: 'hsl(var(--primary-light))' },
  { key: 'equilibrio_emocional', label: 'Equilíbrio Emocional', color: 'hsl(var(--accent-strong))' },
  { key: 'lazer', label: 'Lazer', color: 'hsl(var(--warning-light))' },
  { key: 'espiritualidade', label: 'Espiritualidade', color: 'hsl(var(--primary))' }
];

export default function RodaVida() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [existingRoda, setExistingRoda] = useState<RodaVida | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [rodaVida, setRodaVida] = useState<RodaVida>({
    beneficiaria_id: beneficiariaId || '',
    data_roda: new Date().toISOString().split('T')[0],
    data_avaliacao: new Date().toISOString().split('T')[0],
    objetivo_principal: '',
    saude_score: 5,
    observacoes_saude: '',
    amor_score: 5,
    observacoes_amor: '',
    recursos_financeiros_score: 5,
    observacoes_recursos_financeiros: '',
    relacionamento_familiar_score: 5,
    observacoes_relacionamento_familiar: '',
    vida_social_score: 5,
    observacoes_vida_social: '',
    contribuicao_social_score: 5,
    observacoes_contribuicao_social: '',
    proposito_score: 5,
    observacoes_proposito: '',
    equilibrio_emocional_score: 5,
    observacoes_equilibrio_emocional: '',
    lazer_score: 5,
    observacoes_lazer: '',
    espiritualidade_score: 5,
    observacoes_espiritualidade: '',
    planos_melhoria: '',
    assinatura_beneficiaria: false,
    assinatura_profissional: false,
    responsavel_tecnico: ''
  });

  useEffect(() => {
    if (beneficiariaId) {
      loadBeneficiaria();
      loadRodaVida();
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
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar roda da vida:', error);
        return;
      }

      if (data) {
        setExistingRoda(data);
        setRodaVida(prevState => ({
          ...prevState,
          ...data
        }));
      }
    } catch (error) {
      console.error('Erro ao carregar roda da vida:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setRodaVida(prev => ({
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
      const rodaData = {
        ...rodaVida,
        beneficiaria_id: beneficiaria.id
      };

      let result;
      if (existingRoda) {
        result = await supabase
          .from('roda_vida')
          .update(rodaData)
          .eq('id', existingRoda.id);
      } else {
        result = await supabase
          .from('roda_vida')
          .insert([rodaData])
          .select()
          .single();
        
        if (result.data) {
          setExistingRoda(result.data);
        }
      }

      if (result.error) {
        setError(`Erro ao salvar roda da vida: ${result.error.message}`);
        return;
      }

      toast({
        title: "Sucesso!",
        description: existingRoda ? "Roda da Vida atualizada com sucesso!" : "Roda da Vida criada com sucesso!"
      });

    } catch (error) {
      console.error('Erro ao salvar roda da vida:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const calcularMedia = () => {
    const scores = areas.map(area => rodaVida[`${area.key}_score` as keyof RodaVida] as number || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Roda da Vida" 
        description="Selecione uma beneficiária para preencher a roda da vida"
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
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground">Roda da Vida</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        {existingRoda && (
          <DocumentDownloadButton
            documentType="roda_vida"
            beneficiariaId={beneficiaria.id}
            beneficiariaNome={beneficiaria.nome_completo}
            formId={existingRoda.id!}
          />
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Roda da Vida - {beneficiaria?.nome_completo}
            </h1>
            <p className="text-gray-600">
              Instrumento de Autoavaliação - Qualidade de Vida
            </p>
          </div>

          {/* Seção 1: Identificação */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">1. Identificação</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Beneficiária
                </label>
                <input
                  type="text"
                  value={beneficiaria?.nome_completo || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data da Avaliação
                </label>
                <input
                  type="date"
                  value={rodaVida.data_avaliacao || ''}
                  onChange={(e) => handleInputChange('data_avaliacao', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
          </div>

          {/* Seção 2: Objetivo Principal */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">2. Objetivo Principal</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Qual o principal objetivo desta autoavaliação?
              </label>
              <Textarea
                value={rodaVida.objetivo_principal || ''}
                onChange={(e) => handleInputChange('objetivo_principal', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Descreva o objetivo principal desta avaliação..."
              />
            </div>
          </div>

          {/* Seção 3: Avaliação das Áreas de Vida */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">3. Avaliação das Áreas de Vida</h2>
            <p className="text-sm text-gray-600 mb-6">
              Avalie cada área da sua vida numa escala de 1 a 10, onde 1 = muito insatisfeito e 10 = muito satisfeito
            </p>
            
            <div className="space-y-8">
              {areas.map((area) => (
                <div key={area.key} className="border-l-4 pl-4" style={{ borderColor: area.color }}>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">{area.label}</h3>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`${area.key}_score`} className="text-sm">Pontuação:</Label>
                        <Input
                          id={`${area.key}_score`}
                          type="number"
                          min="1"
                          max="10"
                          value={(rodaVida[`${area.key}_score` as keyof RodaVida] as number) || 5}
                          onChange={(e) => handleInputChange(`${area.key}_score`, parseInt(e.target.value))}
                          className="w-20 text-center"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações e Comentários sobre {area.label}
                    </label>
                    <Textarea
                      value={rodaVida[`observacoes_${area.key}` as keyof RodaVida] as string || ''}
                      onChange={(e) => handleInputChange(`observacoes_${area.key}`, e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={`Comente sobre sua avaliação em ${area.label.toLowerCase()}...`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Resumo da Avaliação</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Média Geral:</strong> {calcularMedia().toFixed(1)}
                </div>
                <div>
                  <strong>Data:</strong> {formatDate(rodaVida.data_avaliacao || rodaVida.data_roda)}
                </div>
              </div>
            </div>
          </div>

          {/* Seção 4: Planos de Melhoria */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">4. Planos de Melhoria</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quais são os seus planos para melhorar as áreas com menor pontuação?
              </label>
              <Textarea
                value={rodaVida.planos_melhoria || ''}
                onChange={(e) => handleInputChange('planos_melhoria', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Descreva seus planos e estratégias para melhorar as áreas identificadas..."
              />
            </div>
          </div>

          {/* Seção 5: Responsável Técnico */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">5. Responsável Técnico</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Profissional Responsável
              </label>
              <Input
                type="text"
                value={rodaVida.responsavel_tecnico || ''}
                onChange={(e) => handleInputChange('responsavel_tecnico', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Nome do profissional responsável"
              />
            </div>
          </div>

          {/* Seção 6: Assinaturas */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-semibold mb-4 text-primary">6. Assinaturas</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_beneficiaria"
                  checked={rodaVida.assinatura_beneficiaria || false}
                  onChange={(e) => handleInputChange('assinatura_beneficiaria', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="assinatura_beneficiaria" className="text-sm text-gray-700">
                  Confirmo que realizei esta autoavaliação de forma consciente e honesta (Assinatura da Beneficiária)
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_profissional"
                  checked={rodaVida.assinatura_profissional || false}
                  onChange={(e) => handleInputChange('assinatura_profissional', e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="assinatura_profissional" className="text-sm text-gray-700">
                  Acompanhei o processo de autoavaliação e valido os resultados (Assinatura do Profissional)
                </label>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
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
                  {existingRoda ? 'Atualizar' : 'Salvar'}
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}