import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar, FileText, Users, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { DocumentDownloadButton } from '@/components/DocumentDownloadButton';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface PlanoAcao {
  id?: string;
  beneficiaria_id: string;
  data_plano: string;
  objetivo_principal: string;
  areas_prioritarias: {
    autoconhecimento: boolean;
    qualificacao: boolean;
    empreendedorismo: boolean;
    apoio_social: boolean;
    outras: boolean;
  };
  outras_areas: string;
  acoes_realizadas: string;
  suporte_instituto: string;
  primeira_avaliacao_data?: string;
  primeira_avaliacao_progresso?: string;
  segunda_avaliacao_data?: string;
  segunda_avaliacao_progresso?: string;
  assinatura_beneficiaria: boolean;
  assinatura_responsavel_tecnico: boolean;
  data_criacao?: string;
}

const PlanoAcao: React.FC = () => {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const { toast } = useToast();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [plano, setPlano] = useState<PlanoAcao>({
    beneficiaria_id: beneficiariaId || '',
    data_plano: new Date().toISOString().split('T')[0],
    objetivo_principal: '',
    areas_prioritarias: {
      autoconhecimento: false,
      qualificacao: false,
      empreendedorismo: false,
      apoio_social: false,
      outras: false,
    },
    outras_areas: '',
    acoes_realizadas: '',
    suporte_instituto: '',
    primeira_avaliacao_data: '',
    primeira_avaliacao_progresso: '',
    segunda_avaliacao_data: '',
    segunda_avaliacao_progresso: '',
    assinatura_beneficiaria: false,
    assinatura_responsavel_tecnico: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (beneficiariaId) {
      loadBeneficiaria();
      loadPlanoAcao();
    } else {
      setLoading(false);
    }
  }, [beneficiariaId]);

  const loadBeneficiaria = async () => {
    try {
      const { data, error } = await supabase
        .from('beneficiarias')
        .select('id, nome_completo, cpf, data_nascimento')
        .eq('id', beneficiariaId)
        .single();

      if (error) throw error;
      setBeneficiaria(data);
    } catch (error) {
      console.error('Erro ao carregar beneficiária:', error);
      setError('Erro ao carregar dados da beneficiária');
    }
  };

  const loadPlanoAcao = async () => {
    try {
      const { data, error } = await supabase
        .from('planos_acao')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_criacao', { ascending: false })
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const planoExistente = data[0];
        setPlano({
          id: planoExistente.id,
          beneficiaria_id: planoExistente.beneficiaria_id,
          data_plano: planoExistente.data_plano || new Date().toISOString().split('T')[0],
          objetivo_principal: planoExistente.objetivo_principal || '',
          areas_prioritarias: (planoExistente.areas_prioritarias as any) || {
            autoconhecimento: false,
            qualificacao: false,
            empreendedorismo: false,
            apoio_social: false,
            outras: false,
          },
          outras_areas: planoExistente.outras_areas || '',
          acoes_realizadas: planoExistente.acoes_realizadas || '',
          suporte_instituto: planoExistente.suporte_instituto || '',
          primeira_avaliacao_data: planoExistente.primeira_avaliacao_data || '',
          primeira_avaliacao_progresso: planoExistente.primeira_avaliacao_progresso || '',
          segunda_avaliacao_data: planoExistente.segunda_avaliacao_data || '',
          segunda_avaliacao_progresso: planoExistente.segunda_avaliacao_progresso || '',
          assinatura_beneficiaria: planoExistente.assinatura_beneficiaria || false,
          assinatura_responsavel_tecnico: planoExistente.assinatura_responsavel_tecnico || false,
        });
      }
    } catch (error) {
      console.error('Erro ao carregar plano de ação:', error);
      setError('Erro ao carregar plano de ação existente');
    } finally {
      setLoading(false);
    }
  };

  const handleAreaChange = (area: keyof typeof plano.areas_prioritarias, checked: boolean) => {
    setPlano(prev => ({
      ...prev,
      areas_prioritarias: {
        ...prev.areas_prioritarias,
        [area]: checked
      }
    }));
  };

  const handleInputChange = (field: keyof PlanoAcao, value: string | boolean) => {
    setPlano(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const planoData = {
        beneficiaria_id: beneficiariaId,
        data_plano: plano.data_plano,
        objetivo_principal: plano.objetivo_principal,
        areas_prioritarias: plano.areas_prioritarias,
        outras_areas: plano.outras_areas,
        acoes_realizadas: plano.acoes_realizadas,
        suporte_instituto: plano.suporte_instituto,
        primeira_avaliacao_data: plano.primeira_avaliacao_data || null,
        primeira_avaliacao_progresso: plano.primeira_avaliacao_progresso,
        segunda_avaliacao_data: plano.segunda_avaliacao_data || null,
        segunda_avaliacao_progresso: plano.segunda_avaliacao_progresso,
        assinatura_beneficiaria: plano.assinatura_beneficiaria,
        assinatura_responsavel_tecnico: plano.assinatura_responsavel_tecnico,
        // Legacy fields for compatibility
        objetivos: plano.objetivo_principal,
        acoes: plano.acoes_realizadas,
        acompanhamento: '',
      };

      if (plano.id) {
        const { error } = await supabase
          .from('planos_acao')
          .update(planoData)
          .eq('id', plano.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Plano de ação atualizado com sucesso!",
        });
      } else {
        const { error } = await supabase
          .from('planos_acao')
          .insert([planoData]);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Plano de ação criado com sucesso!",
        });
      }

      // Reload data to get the latest
      await loadPlanoAcao();
    } catch (error) {
      console.error('Erro ao salvar plano de ação:', error);
      setError('Erro ao salvar plano de ação');
      toast({
        title: "Erro",
        description: "Erro ao salvar plano de ação",
        variant: "destructive",
      });
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
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <div className="text-lg">Carregando...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!beneficiariaId) {
    return <BeneficiariaSelection title="Plano de Ação" description="Selecione uma beneficiária para criar o plano de ação" />;
  }

  if (error && !beneficiaria) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex justify-center items-center py-8">
            <div className="text-lg text-destructive">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-primary mb-2">Construindo Passos para</h1>
        <h2 className="text-3xl font-bold text-primary mb-2">Minha Transformação</h2>
        <h3 className="text-2xl font-bold text-secondary mb-4">PLANO DE AÇÃO</h3>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Avalie os passos essenciais para alcançar seus objetivos e promover equilíbrio em sua jornada.
          Este plano de ação foi desenvolvido para apoiar sua jornada de autoconhecimento e
          desenvolvimento pessoal. Com base na avaliação das áreas da sua vida, vamos juntos
          identificar pontos de melhoria e traçar ações para promover mudanças positivas. O
          instituto estará ao seu lado em cada etapa, oferecendo suporte e recursos.
        </p>
      </div>
      
      {beneficiaria && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Dados da Beneficiária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium">Nome Completo</Label>
                <p className="text-lg">{beneficiaria.nome_completo}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">CPF</Label>
                <p className="text-lg">{formatCpf(beneficiaria.cpf)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Data de Nascimento</Label>
                <p className="text-lg">{formatDate(beneficiaria.data_nascimento)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção 1: Nome e Data */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Identificação do Plano
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="beneficiaria-nome">Nome da Beneficiária</Label>
                <Input
                  id="beneficiaria-nome"
                  value={beneficiaria?.nome_completo || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="data-plano">Data</Label>
                <Input
                  id="data-plano"
                  type="date"
                  value={plano.data_plano}
                  onChange={(e) => handleInputChange('data_plano', e.target.value)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Objetivo Principal */}
        <Card>
          <CardHeader>
            <CardTitle>1. Objetivo Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plano.objetivo_principal}
              onChange={(e) => handleInputChange('objetivo_principal', e.target.value)}
              placeholder="Descreva o objetivo principal que deseja alcançar..."
              className="min-h-[120px]"
              required
            />
          </CardContent>
        </Card>

        {/* Seção 3: Áreas Prioritárias */}
        <Card>
          <CardHeader>
            <CardTitle>2. Áreas Prioritárias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="autoconhecimento"
                  checked={plano.areas_prioritarias.autoconhecimento}
                  onCheckedChange={(checked) => handleAreaChange('autoconhecimento', checked as boolean)}
                />
                <Label htmlFor="autoconhecimento">Autoconhecimento</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="qualificacao"
                  checked={plano.areas_prioritarias.qualificacao}
                  onCheckedChange={(checked) => handleAreaChange('qualificacao', checked as boolean)}
                />
                <Label htmlFor="qualificacao">Qualificação</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="empreendedorismo"
                  checked={plano.areas_prioritarias.empreendedorismo}
                  onCheckedChange={(checked) => handleAreaChange('empreendedorismo', checked as boolean)}
                />
                <Label htmlFor="empreendedorismo">Empreendedorismo</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="apoio_social"
                  checked={plano.areas_prioritarias.apoio_social}
                  onCheckedChange={(checked) => handleAreaChange('apoio_social', checked as boolean)}
                />
                <Label htmlFor="apoio_social">Apoio Social/Assistência</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="outras"
                  checked={plano.areas_prioritarias.outras}
                  onCheckedChange={(checked) => handleAreaChange('outras', checked as boolean)}
                />
                <Label htmlFor="outras">Outras:</Label>
              </div>
            </div>
            
            {plano.areas_prioritarias.outras && (
              <div>
                <Input
                  value={plano.outras_areas}
                  onChange={(e) => handleInputChange('outras_areas', e.target.value)}
                  placeholder="Especifique outras áreas..."
                  className="mt-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Seção 4: Ações a Serem Realizadas */}
        <Card>
          <CardHeader>
            <CardTitle>3. Ações a Serem Realizadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plano.acoes_realizadas}
              onChange={(e) => handleInputChange('acoes_realizadas', e.target.value)}
              placeholder="Descreva as ações específicas que serão realizadas para atingir o objetivo..."
              className="min-h-[120px]"
              required
            />
          </CardContent>
        </Card>

        {/* Seção 5: Suporte do Instituto */}
        <Card>
          <CardHeader>
            <CardTitle>4. Suporte oferecido pelo instituto</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={plano.suporte_instituto}
              onChange={(e) => handleInputChange('suporte_instituto', e.target.value)}
              placeholder="Descreva o suporte que o instituto oferecerá para a realização do plano..."
              className="min-h-[120px]"
              required
            />
          </CardContent>
        </Card>

        {/* Seção 6: Avaliação e Reavaliação */}
        <Card>
          <CardHeader>
            <CardTitle>5. Avaliação e Reavaliação (Semestral)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold mb-3">Primeira Avaliação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primeira-data">Data da Primeira Avaliação</Label>
                  <Input
                    id="primeira-data"
                    type="date"
                    value={plano.primeira_avaliacao_data}
                    onChange={(e) => handleInputChange('primeira_avaliacao_data', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="primeira-progresso">Revisão do progresso nas áreas de:</Label>
                  <Textarea
                    id="primeira-progresso"
                    value={plano.primeira_avaliacao_progresso}
                    onChange={(e) => handleInputChange('primeira_avaliacao_progresso', e.target.value)}
                    placeholder="Descreva o progresso observado..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Segunda Avaliação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="segunda-data">Data da Segunda Avaliação</Label>
                  <Input
                    id="segunda-data"
                    type="date"
                    value={plano.segunda_avaliacao_data}
                    onChange={(e) => handleInputChange('segunda_avaliacao_data', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="segunda-progresso">Revisão do progresso nas áreas de:</Label>
                  <Textarea
                    id="segunda-progresso"
                    value={plano.segunda_avaliacao_progresso}
                    onChange={(e) => handleInputChange('segunda_avaliacao_progresso', e.target.value)}
                    placeholder="Descreva o progresso observado..."
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 7: Assinaturas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Assinaturas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assinatura-beneficiaria"
                checked={plano.assinatura_beneficiaria}
                onCheckedChange={(checked) => handleInputChange('assinatura_beneficiaria', checked as boolean)}
              />
              <Label htmlFor="assinatura-beneficiaria">Assinatura da Beneficiária</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="assinatura-responsavel"
                checked={plano.assinatura_responsavel_tecnico}
                onCheckedChange={(checked) => handleInputChange('assinatura_responsavel_tecnico', checked as boolean)}
              />
              <Label htmlFor="assinatura-responsavel">Assinatura do Responsável Técnico</Label>
            </div>
          </CardContent>
        </Card>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4">
            <div className="text-destructive">{error}</div>
          </div>
        )}

        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={saving}
          >
            {saving ? 'Salvando...' : plano.id ? 'Atualizar Plano' : 'Salvar Plano'}
          </Button>
          {plano.id && beneficiaria && (
            <DocumentDownloadButton
              documentType="plano_acao"
              beneficiariaId={beneficiaria.id}
              beneficiariaNome={beneficiaria.nome_completo}
              formId={plano.id}
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default PlanoAcao;