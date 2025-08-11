import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, UserPlus, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { useBeneficiariaValidation } from '@/hooks/useFormValidation';
import { DocumentValidator } from '@/lib/validators';
import { logger } from '@/lib/logger';

export default function CadastroBeneficiaria() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Hook de validação
  const { errors, validateForm, validateField, clearFieldError } = useBeneficiariaValidation();

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
    data_inicio_instituto: new Date().toISOString().split('T')[0],
    programa_servico: ''
  });

  const handleInputChange = (field: string, value: string) => {
    // Aplicar formatação automática para documentos
    let formattedValue = value;
    if (field === 'cpf') {
      formattedValue = DocumentValidator.formatCPF(value);
    } else if (field === 'contato1' || field === 'contato2') {
      formattedValue = DocumentValidator.formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      clearFieldError(field);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário
    if (!validateForm(formData)) {
      setError('Por favor, corrija os erros antes de continuar');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      logger.info('Iniciando cadastro de beneficiária', {
        page: '/cadastro-beneficiaria',
        action: 'form_submit'
      });

      const { error: insertError } = await supabase
        .from('beneficiarias')
        .insert([{
          ...formData,
          cpf: formData.cpf.replace(/\D/g, ''), // Salvar apenas números
          created_by: profile?.id,
          updated_by: profile?.id
        }]);

      if (insertError) {
        throw insertError;
      }

      setSuccess(true);
      logger.info('Beneficiária cadastrada com sucesso', {
        page: '/cadastro-beneficiaria',
        action: 'beneficiaria_created'
      });
      
      setTimeout(() => {
        navigate('/beneficiarias');
      }, 2000);

    } catch (error: any) {
      logger.error('Erro ao cadastrar beneficiária', error, {
        page: '/cadastro-beneficiaria',
        action: 'form_submit_error'
      });
      setError(error.message || 'Erro ao cadastrar beneficiária');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/beneficiarias')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Nova Beneficiária</h1>
          <p className="text-muted-foreground">
            Cadastro completo de nova beneficiária no sistema
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Beneficiária cadastrada com sucesso! Redirecionando...
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
              <UserPlus className="h-5 w-5" />
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
                  className={errors.nome_completo ? 'border-red-500' : ''}
                />
                {errors.nome_completo && (
                  <p className="text-sm text-red-500">{errors.nome_completo}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  required
                  className={errors.cpf ? 'border-red-500' : ''}
                />
                {errors.cpf && (
                  <p className="text-sm text-red-500">{errors.cpf}</p>
                )}
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
                  className={errors.rg ? 'border-red-500' : ''}
                />
                {errors.rg && (
                  <p className="text-sm text-red-500">{errors.rg}</p>
                )}
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
                  className={errors.data_nascimento ? 'border-red-500' : ''}
                />
                {errors.data_nascimento && (
                  <p className="text-sm text-red-500">{errors.data_nascimento}</p>
                )}
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
                className={errors.endereco ? 'border-red-500' : ''}
              />
              {errors.endereco && (
                <p className="text-sm text-red-500">{errors.endereco}</p>
              )}
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
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  required
                  className={errors.contato1 ? 'border-red-500' : ''}
                />
                {errors.contato1 && (
                  <p className="text-sm text-red-500">{errors.contato1}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="contato2">Telefone Secundário</Label>
                <Input
                  id="contato2"
                  value={formData.contato2}
                  onChange={(e) => handleInputChange('contato2', e.target.value)}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Instituto */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Informações do Instituto</CardTitle>
            <CardDescription>
              Dados relacionados ao acompanhamento no instituto
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="referencia">Como chegou ao Instituto</Label>
                <Select
                  value={formData.referencia}
                  onValueChange={(value) => handleInputChange('referencia', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="indicacao">Indicação</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="redes_sociais">Redes Sociais</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="programa_servico">Programa/Serviço</Label>
                <Select
                  value={formData.programa_servico}
                  onValueChange={(value) => handleInputChange('programa_servico', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o programa..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oficinas_educativas">Oficinas Educativas</SelectItem>
                    <SelectItem value="acompanhamento_psicossocial">Acompanhamento Psicossocial</SelectItem>
                    <SelectItem value="capacitacao_profissional">Capacitação Profissional</SelectItem>
                    <SelectItem value="apoio_juridico">Apoio Jurídico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_inicio_instituto">Data de Início no Instituto</Label>
              <Input
                id="data_inicio_instituto"
                type="date"
                value={formData.data_inicio_instituto}
                onChange={(e) => handleInputChange('data_inicio_instituto', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-end pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/beneficiarias')}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cadastrando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Cadastrar Beneficiária
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
