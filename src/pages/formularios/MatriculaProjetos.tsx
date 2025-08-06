import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, GraduationCap, Plus, Calendar, User, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento: string;
  endereco?: string;
  contato1: string;
  contato2?: string;
}

interface MatriculaProjeto {
  id: string;
  nome_projeto: string;
  data_inicio_projeto: string;
  data_termino_projeto?: string;
  carga_horaria?: string;
  escolaridade?: string;
  profissao?: string;
  renda_familiar?: number;
  observacoes_matricula?: string;
  assinatura_participante: boolean;
  assinatura_coordenador: boolean;
  data_criacao: string;
}

const escolaridadeOptions = [
  'Ensino Fundamental Incompleto',
  'Ensino Fundamental Completo',
  'Ensino Médio Incompleto', 
  'Ensino Médio Completo',
  'Ensino Superior Incompleto',
  'Ensino Superior Completo',
  'Pós-graduação',
  'Não Alfabetizada',
  'Alfabetizada'
];

const projetosDisponiveis = [
  'Curso de Artesanato',
  'Oficina de Costura',
  'Curso de Culinária',
  'Informática Básica',
  'Empreendedorismo Feminino',
  'Alfabetização de Adultos',
  'Curso de Cabeleireiro',
  'Oficina de Crochê',
  'Curso de Manicure',
  'Jardinagem e Cultivo',
  'Outro'
];

export default function MatriculaProjetos() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [matriculas, setMatriculas] = useState<MatriculaProjeto[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    nome_projeto: '',
    data_inicio_projeto: '',
    data_termino_projeto: '',
    carga_horaria: '',
    escolaridade: '',
    profissao: '',
    renda_familiar: '',
    observacoes_matricula: '',
    assinatura_participante: false,
    assinatura_coordenador: false
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadMatriculas()
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

  const loadMatriculas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matriculas_projetos')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar matrículas:', error);
        return;
      }

      setMatriculas(data || []);
    } catch (error) {
      console.error('Erro ao carregar matrículas:', error);
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

  const resetForm = () => {
    setFormData({
      nome_projeto: '',
      data_inicio_projeto: '',
      data_termino_projeto: '',
      carga_horaria: '',
      escolaridade: '',
      profissao: '',
      renda_familiar: '',
      observacoes_matricula: '',
      assinatura_participante: false,
      assinatura_coordenador: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      const matriculaData = {
        beneficiaria_id: beneficiaria.id,
        ...formData,
        renda_familiar: formData.renda_familiar ? parseFloat(formData.renda_familiar) : null
      };

      const { error } = await supabase
        .from('matriculas_projetos')
        .insert([matriculaData]);

      if (error) {
        setError(`Erro ao salvar matrícula: ${error.message}`);
        return;
      }

      setSuccess(true);
      resetForm();
      setShowForm(false);
      
      // Recarregar matrículas
      await loadMatriculas();
      
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar matrícula:', error);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading && matriculas.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando matrículas...</p>
        </div>
      </div>
    );
  }

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Matrícula de Projetos" 
        description="Selecione uma beneficiária para registrar matrícula em projetos"
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
          <h1 className="text-3xl font-bold text-foreground">Matrícula de Projetos</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Matrícula de Projetos Sociais</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Matrícula
        </Button>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Matrícula registrada com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Dados da Participante */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Dados da Participante
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
              <p className="font-semibold">{beneficiaria.nome_completo}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">CPF</Label>
              <p className="font-mono">{formatCpf(beneficiaria.cpf)}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">RG</Label>
              <p className="font-mono">{beneficiaria.rg || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Idade</Label>
              <p>{calculateAge(beneficiaria.data_nascimento)} anos</p>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 mt-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Endereço</Label>
              <p>{beneficiaria.endereco || '-'}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Telefone</Label>
              <p className="font-mono">{beneficiaria.contato1}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de Nova Matrícula */}
      {showForm && (
        <Card className="shadow-soft border-primary/20">
          <CardHeader>
            <CardTitle>Nova Matrícula</CardTitle>
            <CardDescription>
              Registrar matrícula em projeto social
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Dados do Projeto */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dados do Projeto</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="nome_projeto">Nome do Projeto</Label>
                    <Select
                      value={formData.nome_projeto}
                      onValueChange={(value) => handleInputChange('nome_projeto', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o projeto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projetosDisponiveis.map((projeto) => (
                          <SelectItem key={projeto} value={projeto}>
                            {projeto}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carga_horaria">Carga Horária</Label>
                    <Input
                      id="carga_horaria"
                      value={formData.carga_horaria}
                      onChange={(e) => handleInputChange('carga_horaria', e.target.value)}
                      placeholder="Ex: 40 horas, 3 meses"
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="data_inicio_projeto">Data de Início</Label>
                    <Input
                      id="data_inicio_projeto"
                      type="date"
                      value={formData.data_inicio_projeto}
                      onChange={(e) => handleInputChange('data_inicio_projeto', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_termino_projeto">Data de Término (Prevista)</Label>
                    <Input
                      id="data_termino_projeto"
                      type="date"
                      value={formData.data_termino_projeto}
                      onChange={(e) => handleInputChange('data_termino_projeto', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informações Adicionais</h3>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="escolaridade">Escolaridade</Label>
                    <Select
                      value={formData.escolaridade}
                      onValueChange={(value) => handleInputChange('escolaridade', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a escolaridade" />
                      </SelectTrigger>
                      <SelectContent>
                        {escolaridadeOptions.map((escolaridade) => (
                          <SelectItem key={escolaridade} value={escolaridade}>
                            {escolaridade}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      value={formData.profissao}
                      onChange={(e) => handleInputChange('profissao', e.target.value)}
                      placeholder="Profissão atual"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="renda_familiar">Renda Familiar (R$)</Label>
                  <Input
                    id="renda_familiar"
                    type="number"
                    step="0.01"
                    value={formData.renda_familiar}
                    onChange={(e) => handleInputChange('renda_familiar', e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observacoes_matricula">Observações</Label>
                  <Textarea
                    id="observacoes_matricula"
                    value={formData.observacoes_matricula}
                    onChange={(e) => handleInputChange('observacoes_matricula', e.target.value)}
                    placeholder="Observações adicionais sobre a matrícula"
                    rows={3}
                  />
                </div>
              </div>

              {/* Assinaturas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Confirmações</h3>
                
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="assinatura_participante"
                      checked={formData.assinatura_participante}
                      onChange={(e) => handleInputChange('assinatura_participante', e.target.checked)}
                      className="mt-1 rounded border-border"
                      required
                    />
                    <Label htmlFor="assinatura_participante" className="text-sm">
                      <strong>Assinatura da Participante:</strong> Declaro que concordo em participar do projeto e que todas as informações prestadas são verdadeiras.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="assinatura_coordenador"
                      checked={formData.assinatura_coordenador}
                      onChange={(e) => handleInputChange('assinatura_coordenador', e.target.checked)}
                      className="mt-1 rounded border-border"
                      required
                    />
                    <Label htmlFor="assinatura_coordenador" className="text-sm">
                      <strong>Assinatura do Coordenador:</strong> {profile?.nome_completo} - Confirmo a matrícula da participante no projeto.
                    </Label>
                  </div>
                </div>
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
                      Confirmar Matrícula
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

      {/* Lista de Matrículas */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Histórico de Matrículas</CardTitle>
          <CardDescription>
            Projetos nos quais a beneficiária está ou esteve matriculada ({matriculas.length} registro{matriculas.length !== 1 ? 's' : ''})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {matriculas.length === 0 ? (
            <div className="text-center py-8">
              <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma matrícula registrada ainda
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Primeira Matrícula
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {matriculas.map((matricula) => (
                <Card key={matricula.id} className="shadow-soft">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg">{matricula.nome_projeto}</h4>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(matricula.data_inicio_projeto)} 
                          {matricula.data_termino_projeto && ` - ${formatDate(matricula.data_termino_projeto)}`}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {matricula.assinatura_participante && (
                          <Badge variant="secondary" className="text-xs">
                            Participante confirmada
                          </Badge>
                        )}
                        {matricula.assinatura_coordenador && (
                          <Badge variant="secondary" className="text-xs">
                            Coordenador confirmado
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 text-sm">
                      {matricula.carga_horaria && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Carga Horária</Label>
                          <p>{matricula.carga_horaria}</p>
                        </div>
                      )}
                      {matricula.escolaridade && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Escolaridade</Label>
                          <p>{matricula.escolaridade}</p>
                        </div>
                      )}
                      {matricula.profissao && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Profissão</Label>
                          <p>{matricula.profissao}</p>
                        </div>
                      )}
                      {matricula.renda_familiar && (
                        <div>
                          <Label className="text-xs font-medium text-muted-foreground">Renda Familiar</Label>
                          <p>{formatCurrency(matricula.renda_familiar)}</p>
                        </div>
                      )}
                    </div>

                    {matricula.observacoes_matricula && (
                      <div className="mt-3 p-3 bg-muted/50 rounded-lg">
                        <Label className="text-xs font-medium text-muted-foreground">Observações</Label>
                        <p className="text-sm mt-1">{matricula.observacoes_matricula}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}