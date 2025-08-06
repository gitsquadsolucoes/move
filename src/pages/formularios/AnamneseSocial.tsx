import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Plus, Trash2, Users, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface MembroFamiliar {
  id?: string;
  nome: string;
  data_nascimento: string;
  idade: number;
  trabalha: boolean;
  renda: number;
}

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  idade?: number;
  endereco?: string;
  bairro?: string;
  nis?: string;
  contato1: string;
  contato2?: string;
  rg?: string;
  orgao_emissor_rg?: string;
  data_emissao_rg?: string;
}

export default function AnamneseSocial() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    data_anamnese: new Date().toISOString().split('T')[0],
    observacoes_importantes: '',
    uso_alcool: false,
    uso_drogas_ilicitas: false,
    uso_cigarros: false,
    uso_outros: '',
    transtorno_mental_desenvolvimento: false,
    desafios_transtorno: '',
    deficiencia: false,
    desafios_deficiencia: '',
    idosos_dependentes: false,
    desafios_idosos: '',
    doenca_cronica_degenerativa: false,
    desafios_doenca: '',
    vulnerabilidades: [] as string[],
    assinatura_beneficiaria: false,
    assinatura_tecnica: false
  });

  const [membrosFamilia, setMembrosFamilia] = useState<MembroFamiliar[]>([
    {
      nome: '',
      data_nascimento: '',
      idade: 0,
      trabalha: false,
      renda: 0
    }
  ]);

  const vulnerabilidadesOptions = [
    'NIS',
    'Desemprego',
    'Instabilidade Empregatícia',
    'Pessoas com Dependência',
    'Criança e Adolescente',
    'Idosos',
    'Pessoa com Deficiência'
  ];

  useEffect(() => {
    if (beneficiariaId) {
      loadBeneficiaria();
    }
  }, [beneficiariaId]);

  const loadBeneficiaria = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVulnerabilidadeChange = (vulnerabilidade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      vulnerabilidades: checked 
        ? [...prev.vulnerabilidades, vulnerabilidade]
        : prev.vulnerabilidades.filter(v => v !== vulnerabilidade)
    }));
  };

  const addMembroFamilia = () => {
    setMembrosFamilia(prev => [...prev, {
      nome: '',
      data_nascimento: '',
      idade: 0,
      trabalha: false,
      renda: 0
    }]);
  };

  const removeMembroFamilia = (index: number) => {
    setMembrosFamilia(prev => prev.filter((_, i) => i !== index));
  };

  const updateMembroFamilia = (index: number, field: string, value: any) => {
    setMembrosFamilia(prev => prev.map((membro, i) => {
      if (i === index) {
        const updated = { ...membro, [field]: value };
        if (field === 'data_nascimento') {
          updated.idade = calculateAge(value);
        }
        return updated;
      }
      return membro;
    }));
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const calculateTotalRenda = () => {
    return membrosFamilia.reduce((total, membro) => total + (membro.renda || 0), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      // Save anamnese
      const anamneseData = {
        beneficiaria_id: beneficiaria.id,
        ...formData
      };

      const { data: anamnese, error: anamneseError } = await supabase
        .from('anamneses_social')
        .insert([anamneseData])
        .select()
        .single();

      if (anamneseError) {
        setError(`Erro ao salvar anamnese: ${anamneseError.message}`);
        return;
      }

      // Save membros da família
      const membrosData = membrosFamilia
        .filter(membro => membro.nome.trim() !== '')
        .map(membro => ({
          anamnese_id: anamnese.id,
          ...membro
        }));

      if (membrosData.length > 0) {
        const { error: membrosError } = await supabase
          .from('membros_familia')
          .insert(membrosData);

        if (membrosError) {
          console.error('Erro ao salvar membros da família:', membrosError);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/beneficiarias/${beneficiaria.id}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar anamnese:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
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
          <h1 className="text-3xl font-bold text-foreground">Anamnese Social</h1>
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">Anamnese Social</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Anamnese social salva com sucesso! Redirecionando...
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
        {/* Seção 1: Identificação */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              1. Identificação
            </CardTitle>
            <CardDescription>
              Dados básicos da beneficiária
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_anamnese">Data da Anamnese</Label>
                <Input
                  id="data_anamnese"
                  type="date"
                  value={formData.data_anamnese}
                  onChange={(e) => handleInputChange('data_anamnese', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Nome da Beneficiária</Label>
                <Input
                  value={beneficiaria.nome_completo}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Idade</Label>
                <Input
                  value={beneficiaria.idade ? `${beneficiaria.idade} anos` : 'Não informada'}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={formatCpf(beneficiaria.cpf)}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>NIS</Label>
                <Input
                  value={beneficiaria.nis || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Endereço</Label>
                <Textarea
                  value={beneficiaria.endereco || 'Não informado'}
                  disabled
                  className="bg-muted"
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>Bairro</Label>
                <Input
                  value={beneficiaria.bairro || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Telefone Principal</Label>
                <Input
                  value={beneficiaria.contato1}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone Secundário</Label>
                <Input
                  value={beneficiaria.contato2 || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>RG</Label>
                <Input
                  value={beneficiaria.rg || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Órgão Emissor</Label>
                <Input
                  value={beneficiaria.orgao_emissor_rg || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Emissão</Label>
                <Input
                  value={formatDate(beneficiaria.data_emissao_rg)}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção 2: Situação Socioeconômica Familiar */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              2. Situação Socioeconômica Familiar
            </CardTitle>
            <CardDescription>
              Informações sobre a composição e renda familiar
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Membros da Família */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-medium">Membros da Família</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMembroFamilia}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Membro
                </Button>
              </div>

              <div className="space-y-4">
                {membrosFamilia.map((membro, index) => (
                  <Card key={index} className="p-4 border-dashed">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-medium">Membro {index + 1}</h5>
                      {membrosFamilia.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMembroFamilia(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input
                          value={membro.nome}
                          onChange={(e) => updateMembroFamilia(index, 'nome', e.target.value)}
                          placeholder="Nome do membro"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Nascimento</Label>
                        <Input
                          type="date"
                          value={membro.data_nascimento}
                          onChange={(e) => updateMembroFamilia(index, 'data_nascimento', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Idade</Label>
                        <Input
                          value={membro.idade}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div className="space-y-2 flex flex-col">
                        <Label>Trabalha?</Label>
                        <div className="flex items-center space-x-2 mt-2">
                          <Checkbox
                            id={`trabalha-${index}`}
                            checked={membro.trabalha}
                            onCheckedChange={(checked) => updateMembroFamilia(index, 'trabalha', checked)}
                          />
                          <label htmlFor={`trabalha-${index}`} className="text-sm">Sim</label>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Renda (R$)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={membro.renda}
                          onChange={(e) => updateMembroFamilia(index, 'renda', parseFloat(e.target.value) || 0)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="text-right">
                <p className="text-lg font-semibold">
                  Renda Total Familiar: R$ {calculateTotalRenda().toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <Separator />

            {/* Observações Importantes */}
            <div className="space-y-2">
              <Label htmlFor="observacoes_importantes">Observações Importantes sobre a Família</Label>
              <Textarea
                id="observacoes_importantes"
                value={formData.observacoes_importantes}
                onChange={(e) => handleInputChange('observacoes_importantes', e.target.value)}
                placeholder="Descreva aspectos relevantes sobre a estrutura e dinâmica familiar..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Continue with the rest of the form... */}
        {/* I'll continue in the next part due to length limits */}
        
        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Anamnese
          </Button>
        </div>
      </form>
    </div>
  );
}