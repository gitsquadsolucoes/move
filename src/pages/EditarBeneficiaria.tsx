import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Edit, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export default function EditarBeneficiaria() {
  const navigate = useNavigate();
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    rg: '',
    orgao_emissor_rg: '',
    data_emissao_rg: '',
    data_nascimento: '',
    endereco: '',
    bairro: '',
    nis: '',
    contato1: '',
    contato2: '',
    referencia: '',
    data_inicio_instituto: '',
    programa_servico: ''
  });

  useEffect(() => {
    if (beneficiariaId) {
      loadBeneficiaria();
    }
  }, [beneficiariaId]);

  const loadBeneficiaria = async () => {
    try {
      setLoading(true);
      
      // Se estamos em modo desenvolvimento com dados dummy, use dados mock
      const isDevelopmentMode = import.meta.env.VITE_SUPABASE_URL?.includes('dummy');
      
      if (isDevelopmentMode) {
        // Dados mock para demonstração
        const mockData = {
          id: beneficiariaId,
          nome_completo: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          rg: '12345678',
          orgao_emissor_rg: 'SSP-CE',
          data_emissao_rg: '2020-01-15',
          data_nascimento: '1990-05-20',
          endereco: 'Rua das Flores, 123, Apt 45',
          bairro: 'Centro',
          nis: '12345678901',
          contato1: '(85) 99999-9999',
          contato2: '(85) 88888-8888',
          referencia: 'João Silva - (85) 77777-7777',
          data_inicio_instituto: '2024-01-15',
          programa_servico: 'marias_empreendedoras'
        };
        
        setFormData({
          nome_completo: mockData.nome_completo || '',
          cpf: mockData.cpf || '',
          rg: mockData.rg || '',
          orgao_emissor_rg: mockData.orgao_emissor_rg || '',
          data_emissao_rg: mockData.data_emissao_rg || '',
          data_nascimento: mockData.data_nascimento || '',
          endereco: mockData.endereco || '',
          bairro: mockData.bairro || '',
          nis: mockData.nis || '',
          contato1: mockData.contato1 || '',
          contato2: mockData.contato2 || '',
          referencia: mockData.referencia || '',
          data_inicio_instituto: mockData.data_inicio_instituto || '',
          programa_servico: mockData.programa_servico || ''
        });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('beneficiarias')
        .select('*')
        .eq('id', beneficiariaId)
        .single();

      if (error) {
        setError('Beneficiária não encontrada');
        return;
      }

      // Preencher o formulário com os dados existentes
      setFormData({
        nome_completo: data.nome_completo || '',
        cpf: data.cpf || '',
        rg: data.rg || '',
        orgao_emissor_rg: data.orgao_emissor_rg || '',
        data_emissao_rg: data.data_emissao_rg || '',
        data_nascimento: data.data_nascimento || '',
        endereco: data.endereco || '',
        bairro: data.bairro || '',
        nis: data.nis || '',
        contato1: data.contato1 || '',
        contato2: data.contato2 || '',
        referencia: data.referencia || '',
        data_inicio_instituto: data.data_inicio_instituto || '',
        programa_servico: data.programa_servico || ''
      });
    } catch (error) {
      console.error('Erro ao carregar beneficiária:', error);
      setError('Erro ao carregar dados da beneficiária');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCpf = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    return numericValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiariaId) return;

    setSaving(true);
    setError(null);

    try {
      // Se estamos em modo desenvolvimento com dados dummy, simule sucesso
      const isDevelopmentMode = import.meta.env.VITE_SUPABASE_URL?.includes('dummy');
      
      if (isDevelopmentMode) {
        // Simular delay de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSuccess(true);
        setTimeout(() => {
          navigate(`/beneficiarias/${beneficiariaId}`);
        }, 2000);
        return;
      }

      // Remove formatação do CPF antes de salvar
      const cleanData = {
        ...formData,
        cpf: formData.cpf.replace(/\D/g, ''),
      };

      // Remove campos vazios
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key as keyof typeof cleanData] === '') {
          delete cleanData[key as keyof typeof cleanData];
        }
      });

      const { error } = await supabase
        .from('beneficiarias')
        .update(cleanData)
        .eq('id', beneficiariaId);

      if (error) {
        if (error.code === '23505') {
          setError('Este CPF já está cadastrado para outra beneficiária');
        } else {
          setError(`Erro ao atualizar beneficiária: ${error.message}`);
        }
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/beneficiarias/${beneficiariaId}`);
      }, 2000);

    } catch (error) {
      console.error('Erro ao atualizar beneficiária:', error);
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
          <p className="text-muted-foreground">Carregando dados da beneficiária...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.nome_completo) {
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
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Beneficiária</h1>
          </div>
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
          onClick={() => navigate(`/beneficiarias/${beneficiariaId}`)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Beneficiária</h1>
          <p className="text-muted-foreground">
            Atualize os dados da beneficiária no sistema
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Beneficiária atualizada com sucesso! Redirecionando...
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
        {/* Dados Pessoais */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Dados Pessoais
            </CardTitle>
            <CardDescription>
              Informações básicas da beneficiária
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => handleInputChange('nome_completo', e.target.value)}
                  placeholder="Nome completo da beneficiária"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleInputChange('rg', e.target.value)}
                  placeholder="Número do RG"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgao_emissor_rg">Órgão Emissor</Label>
                <Input
                  id="orgao_emissor_rg"
                  value={formData.orgao_emissor_rg}
                  onChange={(e) => handleInputChange('orgao_emissor_rg', e.target.value)}
                  placeholder="Ex: SSP-SP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="data_emissao_rg">Data de Emissão</Label>
                <Input
                  id="data_emissao_rg"
                  type="date"
                  value={formData.data_emissao_rg}
                  onChange={(e) => handleInputChange('data_emissao_rg', e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento *</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => handleInputChange('data_nascimento', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nis">NIS</Label>
                <Input
                  id="nis"
                  value={formData.nis}
                  onChange={(e) => handleInputChange('nis', e.target.value)}
                  placeholder="Número de Identificação Social"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereço */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Endereço</CardTitle>
            <CardDescription>
              Informações de endereço e localização
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="endereco">Endereço Completo</Label>
              <Textarea
                id="endereco"
                value={formData.endereco}
                onChange={(e) => handleInputChange('endereco', e.target.value)}
                placeholder="Rua, número, complemento..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bairro">Bairro</Label>
              <Input
                id="bairro"
                value={formData.bairro}
                onChange={(e) => handleInputChange('bairro', e.target.value)}
                placeholder="Nome do bairro"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Contato</CardTitle>
            <CardDescription>
              Telefones e informações de contato
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="contato1">Telefone Principal *</Label>
                <Input
                  id="contato1"
                  value={formData.contato1}
                  onChange={(e) => handleInputChange('contato1', e.target.value)}
                  placeholder="(85) 99999-9999"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato2">Telefone Secundário</Label>
                <Input
                  id="contato2"
                  value={formData.contato2}
                  onChange={(e) => handleInputChange('contato2', e.target.value)}
                  placeholder="(85) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referencia">Referência de Contato</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) => handleInputChange('referencia', e.target.value)}
                placeholder="Nome e telefone de referência"
              />
            </div>
          </CardContent>
        </Card>

        {/* Informações do Instituto */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Informações do Instituto</CardTitle>
            <CardDescription>
              Dados sobre o atendimento no Instituto Move Marias
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="data_inicio_instituto">Data de Início no Instituto</Label>
                <Input
                  id="data_inicio_instituto"
                  type="date"
                  value={formData.data_inicio_instituto}
                  onChange={(e) => handleInputChange('data_inicio_instituto', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="programa_servico">Programa/Oficina/Serviço</Label>
                <Select
                  value={formData.programa_servico}
                  onValueChange={(value) => handleInputChange('programa_servico', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marias_empreendedoras">Marias Empreendedoras</SelectItem>
                    <SelectItem value="oficina_costura">Oficina de Costura</SelectItem>
                    <SelectItem value="capacitacao_digital">Capacitação Digital</SelectItem>
                    <SelectItem value="apoio_psicossocial">Apoio Psicossocial</SelectItem>
                    <SelectItem value="desenvolvimento_pessoal">Desenvolvimento Pessoal</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/beneficiarias/${beneficiariaId}`)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Salvar Alterações
          </Button>
        </div>
      </form>
    </div>
  );
}
