import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
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
  id?: string;
  data_visao: string;
  objetivo_principal: string;
  areas_prioritarias: {
    autoconhecimento: boolean;
    qualificacao: boolean;
    empreendedorismo: boolean;
    apoio_social: boolean;
    outras: boolean;
    outras_descricao: string;
  };
  acoes: string;
  suporte_instituto: string;
  primeira_avaliacao_data?: string;
  primeira_avaliacao_progresso?: string;
  segunda_avaliacao_data?: string;
  segunda_avaliacao_progresso?: string;
  assinatura_beneficiaria: boolean;
  assinatura_responsavel_tecnico: boolean;
  // Legacy fields for backward compatibility
  historia_vida?: string;
  rede_apoio?: string;
  visao_tecnica_referencia?: string;
  encaminhamento_projeto?: string;
  assinatura_tecnica?: boolean;
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
  const [formData, setFormData] = useState<VisaoHolistica>({
    data_visao: new Date().toISOString().split('T')[0],
    objetivo_principal: "",
    areas_prioritarias: {
      autoconhecimento: false,
      qualificacao: false,
      empreendedorismo: false,
      apoio_social: false,
      outras: false,
      outras_descricao: "",
    },
    acoes: "",
    suporte_instituto: "",
    primeira_avaliacao_data: "",
    primeira_avaliacao_progresso: "",
    segunda_avaliacao_data: "",
    segunda_avaliacao_progresso: "",
    assinatura_beneficiaria: false,
    assinatura_responsavel_tecnico: false,
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
    if (!beneficiariaId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("visoes_holisticas")
        .select("*")
        .eq("beneficiaria_id", beneficiariaId)
        .order("data_criacao", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar visão holística:", error);
        setError("Erro ao carregar dados da visão holística");
        return;
      }

      if (data) {
        setExistingVisao(data as any);
        // Handle both new format and legacy format
        const areas = (data.areas_prioritarias as any) || {
          autoconhecimento: false,
          qualificacao: false,
          empreendedorismo: false,
          apoio_social: false,
          outras: false,
          outras_descricao: "",
        };
        
        setFormData({
          data_visao: data.data_visao || "",
          objetivo_principal: data.objetivo_principal || "",
          areas_prioritarias: areas,
          acoes: data.acoes || "",
          suporte_instituto: data.suporte_instituto || "",
          primeira_avaliacao_data: data.primeira_avaliacao_data || "",
          primeira_avaliacao_progresso: data.primeira_avaliacao_progresso || "",
          segunda_avaliacao_data: data.segunda_avaliacao_data || "",
          segunda_avaliacao_progresso: data.segunda_avaliacao_progresso || "",
          assinatura_beneficiaria: Boolean(data.assinatura_beneficiaria),
          assinatura_responsavel_tecnico: Boolean(data.assinatura_responsavel_tecnico),
        });
      }
    } catch (error) {
      console.error("Erro ao carregar visão holística:", error);
      setError("Erro ao carregar dados da visão holística");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.startsWith('areas_prioritarias.')) {
      const subField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        areas_prioritarias: {
          ...prev.areas_prioritarias,
          [subField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
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

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Visão Holística" 
        description="Selecione uma beneficiária para preencher a visão holística"
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
            <span className="text-sm">Última atualização: {formatDate(existingVisao.data_visao || '')}</span>
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

      <div className="bg-background p-8 rounded-lg shadow-sm max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">
            Construindo Passos para Minha Transformação
          </h1>
          <h2 className="text-xl font-semibold text-primary mb-2">VISÃO HOLÍSTICA</h2>
          <p className="text-muted-foreground mb-2">
            Avalie os passos essenciais para alcançar seus objetivos e promover equilíbrio em sua jornada.
          </p>
          <p className="text-sm text-muted-foreground">
            Esta visão holística foi desenvolvida para apoiar sua jornada de autoconhecimento e desenvolvimento pessoal. 
            Com base na avaliação das áreas da sua vida, vamos juntos identificar pontos de melhoria e traçar ações 
            para promover mudanças positivas. O instituto estará ao seu lado em cada etapa, oferecendo suporte e recursos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-muted/50 rounded-lg">
          <div>
            <span className="font-medium">Nome da Beneficiária:</span> {beneficiaria?.nome_completo}
          </div>
          <div>
            <span className="font-medium">Data:</span>
            <Input
              type="date"
              value={formData.data_visao}
              onChange={(e) => handleInputChange("data_visao", e.target.value)}
              className="ml-2 w-auto inline-block"
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Objetivo Principal */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">1. Objetivo Principal:</Label>
            <Textarea
              placeholder="Descreva o objetivo principal da beneficiária..."
              value={formData.objetivo_principal}
              onChange={(e) => handleInputChange("objetivo_principal", e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          {/* 2. Áreas Prioritárias */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">2. Áreas Prioritárias:</Label>
            <div className="space-y-2 pl-4">
              {[
                { key: "autoconhecimento", label: "Autoconhecimento" },
                { key: "qualificacao", label: "Qualificação" },
                { key: "empreendedorismo", label: "Empreendedorismo" },
                { key: "apoio_social", label: "Apoio Social/Assistência" },
              ].map((area) => (
                <div key={area.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={area.key}
                    checked={Boolean(formData.areas_prioritarias[area.key as keyof typeof formData.areas_prioritarias])}
                    onChange={(e) => handleInputChange(`areas_prioritarias.${area.key}`, e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor={area.key}>{area.label}</Label>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="outras"
                  checked={formData.areas_prioritarias.outras}
                  onChange={(e) => handleInputChange("areas_prioritarias.outras", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="outras">Outras:</Label>
                <Input
                  placeholder="Especifique outras áreas..."
                  value={formData.areas_prioritarias.outras_descricao}
                  onChange={(e) => handleInputChange("areas_prioritarias.outras_descricao", e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          {/* 3. Ações a Serem Realizadas */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">3. Ações a Serem Realizadas:</Label>
            <Textarea
              placeholder="Descreva as ações que serão realizadas..."
              value={formData.acoes}
              onChange={(e) => handleInputChange("acoes", e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* 4. Suporte oferecido pelo instituto */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">4. Suporte oferecido pelo instituto:</Label>
            <Textarea
              placeholder="Descreva o suporte que o instituto oferecerá..."
              value={formData.suporte_instituto}
              onChange={(e) => handleInputChange("suporte_instituto", e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {/* 5. Avaliação e Reavaliação (Semestral) */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">5. Avaliação e Reavaliação (Semestral)</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="primeira_avaliacao_data" className="font-medium">Primeira Avaliação:</Label>
                <Input
                  id="primeira_avaliacao_data"
                  type="date"
                  value={formData.primeira_avaliacao_data}
                  onChange={(e) => handleInputChange("primeira_avaliacao_data", e.target.value)}
                  className="w-auto"
                />
              </div>
              <div>
                <Label className="block mb-1">Revisão do progresso nas áreas de:</Label>
                <Textarea
                  placeholder="Descreva o progresso observado na primeira avaliação..."
                  value={formData.primeira_avaliacao_progresso}
                  onChange={(e) => handleInputChange("primeira_avaliacao_progresso", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Label htmlFor="segunda_avaliacao_data" className="font-medium">Segunda Avaliação:</Label>
                <Input
                  id="segunda_avaliacao_data"
                  type="date"
                  value={formData.segunda_avaliacao_data}
                  onChange={(e) => handleInputChange("segunda_avaliacao_data", e.target.value)}
                  className="w-auto"
                />
              </div>
              <div>
                <Label className="block mb-1">Revisão do progresso nas áreas de:</Label>
                <Textarea
                  placeholder="Descreva o progresso observado na segunda avaliação..."
                  value={formData.segunda_avaliacao_progresso}
                  onChange={(e) => handleInputChange("segunda_avaliacao_progresso", e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Assinaturas */}
          <div className="space-y-3 border-t pt-6">
            <Label className="text-lg font-semibold">Assinaturas:</Label>
            <div className="space-y-2 pl-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_beneficiaria"
                  checked={formData.assinatura_beneficiaria}
                  onChange={(e) => handleInputChange("assinatura_beneficiaria", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="assinatura_beneficiaria">Beneficiária</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="assinatura_responsavel_tecnico"
                  checked={formData.assinatura_responsavel_tecnico}
                  onChange={(e) => handleInputChange("assinatura_responsavel_tecnico", e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="assinatura_responsavel_tecnico">Responsável Técnico</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-6">
            <div className="space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
              >
                Voltar
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/beneficiarias")}>
                Cancelar
              </Button>
            </div>
            <Button type="submit" disabled={saving}>
              {saving ? "Salvando..." : existingVisao ? "Atualizar Visão Holística" : "Salvar Visão Holística"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}