import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, FileText, Shield, CheckCircle, Loader2, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  endereco?: string;
  data_nascimento: string;
}

interface TermoConsentimento {
  id: string;
  data_consentimento: string;
  nacionalidade: string;
  estado_civil: string;
  uso_imagem_autorizado: boolean;
  tratamento_dados_autorizado: boolean;
  assinatura_voluntaria: boolean;
  assinatura_responsavel_familiar: boolean;
  data_criacao: string;
}

const estadosCivis = [
  'Solteira',
  'Casada',
  'União Estável',
  'Divorciada',
  'Viúva',
  'Separada'
];

export default function TermoConsentimento() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [existingTermo, setExistingTermo] = useState<TermoConsentimento | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    data_consentimento: new Date().toISOString().split('T')[0],
    nacionalidade: 'Brasileira',
    estado_civil: '',
    uso_imagem_autorizado: false,
    tratamento_dados_autorizado: false,
    assinatura_voluntaria: false,
    assinatura_responsavel_familiar: false
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadTermoConsentimento()
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

  const loadTermoConsentimento = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('termos_consentimento')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_criacao', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar termo:', error);
        return;
      }

      if (data) {
        setExistingTermo(data);
        setFormData({
          data_consentimento: data.data_consentimento,
          nacionalidade: data.nacionalidade || 'Brasileira',
          estado_civil: data.estado_civil || '',
          uso_imagem_autorizado: data.uso_imagem_autorizado,
          tratamento_dados_autorizado: data.tratamento_dados_autorizado,
          assinatura_voluntaria: data.assinatura_voluntaria,
          assinatura_responsavel_familiar: data.assinatura_responsavel_familiar
        });
      }
    } catch (error) {
      console.error('Erro ao carregar termo:', error);
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
      const termoData = {
        beneficiaria_id: beneficiaria.id,
        ...formData
      };

      let result;
      
      if (existingTermo) {
        result = await supabase
          .from('termos_consentimento')
          .update(termoData)
          .eq('id', existingTermo.id);
      } else {
        result = await supabase
          .from('termos_consentimento')
          .insert([termoData]);
      }

      if (result.error) {
        setError(`Erro ao salvar termo: ${result.error.message}`);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/beneficiarias/${beneficiaria.id}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao salvar termo:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isUnderAge = beneficiaria ? calculateAge(beneficiaria.data_nascimento) < 18 : false;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando termo de consentimento...</p>
        </div>
      </div>
    );
  }

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Termo de Consentimento" 
        description="Selecione uma beneficiária para preencher o termo de consentimento"
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
          <h1 className="text-3xl font-bold text-foreground">Termo de Consentimento</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Termo de Consentimento</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        {existingTermo && (
          <Badge variant="secondary">
            Assinado em: {formatDate(existingTermo.data_consentimento)}
          </Badge>
        )}
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Termo de consentimento salvo com sucesso! Redirecionando...
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
              <User className="h-5 w-5" />
              Dados da Participante
            </CardTitle>
            <CardDescription>
              Informações pessoais para o termo de consentimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Nome Completo</Label>
                <Input
                  value={beneficiaria.nome_completo}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_consentimento">Data do Consentimento</Label>
                <Input
                  id="data_consentimento"
                  type="date"
                  value={formData.data_consentimento}
                  onChange={(e) => handleInputChange('data_consentimento', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="nacionalidade">Nacionalidade</Label>
                <Input
                  id="nacionalidade"
                  value={formData.nacionalidade}
                  onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                  placeholder="Ex: Brasileira"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado_civil">Estado Civil</Label>
                <Select
                  value={formData.estado_civil}
                  onValueChange={(value) => handleInputChange('estado_civil', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadosCivis.map((estado) => (
                      <SelectItem key={estado} value={estado}>
                        {estado}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Idade</Label>
                <Input
                  value={`${calculateAge(beneficiaria.data_nascimento)} anos`}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input
                  value={formatCpf(beneficiaria.cpf)}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label>RG</Label>
                <Input
                  value={beneficiaria.rg || 'Não informado'}
                  disabled
                  className="bg-muted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Input
                value={beneficiaria.endereco || 'Não informado'}
                disabled
                className="bg-muted"
              />
            </div>
          </CardContent>
        </Card>

        {/* Autorização de Uso de Imagem */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Autorização de Uso de Imagem
            </CardTitle>
            <CardDescription>
              Consentimento para captação e uso de imagem em atividades do instituto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground leading-relaxed">
                Autorizo o uso da minha imagem e/ou dos meus dependentes menores de idade, captadas durante a participação em atividades realizadas pelo Instituto Move Marias, para fins de divulgação das ações institucionais em material impresso ou digital (sites, redes sociais, materiais gráficos, etc.), sem qualquer ônus ou remuneração.
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="uso_imagem_autorizado"
                checked={formData.uso_imagem_autorizado}
                onChange={(e) => handleInputChange('uso_imagem_autorizado', e.target.checked)}
                className="mt-1 rounded border-border"
                required
              />
              <Label htmlFor="uso_imagem_autorizado" className="text-sm leading-relaxed">
                <strong>Declaro estar ciente e AUTORIZO</strong> expressamente o uso da minha imagem conforme os termos descritos acima. Esta autorização é concedida em caráter definitivo e gratuito, abrangendo qualquer forma de utilização.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Termo LGPD */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Consentimento para Tratamento de Dados Pessoais (LGPD)
            </CardTitle>
            <CardDescription>
              Autorização para coleta, processamento e compartilhamento de dados pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-foreground leading-relaxed mb-3">
                <strong>Finalidade:</strong> Os dados pessoais coletados serão utilizados exclusivamente para:
              </p>
              <ul className="text-sm text-foreground space-y-1 list-disc list-inside ml-4">
                <li>Cadastramento e acompanhamento social individualizado</li>
                <li>Desenvolvimento de atividades e projetos sociais</li>
                <li>Elaboração de relatórios e estatísticas institucionais</li>
                <li>Comunicação sobre atividades e serviços do instituto</li>
                <li>Cumprimento de obrigações legais e regulamentares</li>
              </ul>
              <p className="text-sm text-foreground leading-relaxed mt-3">
                <strong>Direitos do Titular:</strong> Você tem direito a solicitar acesso, correção, exclusão, portabilidade e revogação do consentimento dos seus dados pessoais a qualquer momento.
              </p>
            </div>
            
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="tratamento_dados_autorizado"
                checked={formData.tratamento_dados_autorizado}
                onChange={(e) => handleInputChange('tratamento_dados_autorizado', e.target.checked)}
                className="mt-1 rounded border-border"
                required
              />
              <Label htmlFor="tratamento_dados_autorizado" className="text-sm leading-relaxed">
                <strong>Declaro ter sido informado(a) sobre a Lei Geral de Proteção de Dados</strong> e autorizo expressamente a coleta, processamento, compartilhamento e divulgação de meus dados pessoais pelo Instituto Move Marias, conforme descrito acima.
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Assinaturas */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Assinaturas e Confirmações</CardTitle>
            <CardDescription>
              Confirmação de concordância e assinatura dos termos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="assinatura_voluntaria"
                checked={formData.assinatura_voluntaria}
                onChange={(e) => handleInputChange('assinatura_voluntaria', e.target.checked)}
                className="mt-1 rounded border-border"
                required
              />
              <Label htmlFor="assinatura_voluntaria" className="text-sm leading-relaxed">
                <strong>Assinatura da Participante:</strong> Declaro que li, compreendi e concordo voluntariamente com todos os termos deste documento. Confirmo que todas as informações prestadas são verdadeiras.
              </Label>
            </div>

            {isUnderAge && (
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="assinatura_responsavel_familiar"
                  checked={formData.assinatura_responsavel_familiar}
                  onChange={(e) => handleInputChange('assinatura_responsavel_familiar', e.target.checked)}
                  className="mt-1 rounded border-border"
                  required={isUnderAge}
                />
                <Label htmlFor="assinatura_responsavel_familiar" className="text-sm leading-relaxed">
                  <strong>Assinatura do Responsável Familiar:</strong> Como responsável legal, autorizo a participação da menor de idade nas atividades do instituto e concordo com todos os termos descritos neste documento.
                </Label>
              </div>
            )}

            {isUnderAge && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Como a participante é menor de idade ({calculateAge(beneficiaria.data_nascimento)} anos), é necessária a assinatura do responsável familiar.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Resumo */}
        <Card className="shadow-soft bg-muted/50">
          <CardHeader>
            <CardTitle>Resumo das Autorizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${formData.uso_imagem_autorizado ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                <span className="text-sm">
                  Uso de Imagem: {formData.uso_imagem_autorizado ? 'Autorizado' : 'Não autorizado'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${formData.tratamento_dados_autorizado ? 'bg-success' : 'bg-muted-foreground'}`}></div>
                <span className="text-sm">
                  Tratamento de Dados: {formData.tratamento_dados_autorizado ? 'Autorizado' : 'Não autorizado'}
                </span>
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
                {existingTermo ? 'Atualizar' : 'Salvar'} Termo de Consentimento
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}