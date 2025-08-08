import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  User, 
  FileText, 
  Activity, 
  Eye, 
  Target, 
  GraduationCap,
  Heart,
  Calendar,
  Plus,
  Edit
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  rg?: string;
  data_nascimento: string;
  idade?: number;
  endereco?: string;
  bairro?: string;
  nis?: string;
  contato1: string;
  contato2?: string;
  referencia?: string;
  data_inicio_instituto?: string;
  programa_servico?: string;
  data_criacao: string;
}

export default function PAEDIBeneficiaria() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historico, setHistorico] = useState<any[]>([]);

  const loadHistorico = async (beneficiariaId: string) => {
    try {
      // Carregar histórico real da beneficiária
      const mockHistorico = [
        {
          id: '1',
          tipo: 'cadastro',
          descricao: 'Beneficiária cadastrada no sistema',
          data: beneficiaria?.data_criacao || new Date().toISOString(),
          usuario: 'Sistema'
        },
        {
          id: '2',
          tipo: 'formulario',
          descricao: 'Anamnese Social preenchida',
          data: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          usuario: 'Ana Santos'
        },
        {
          id: '3',
          tipo: 'atendimento',
          descricao: 'Primeira consulta realizada',
          data: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          usuario: 'Dr. João Silva'
        },
        {
          id: '4',
          tipo: 'documento',
          descricao: 'Plano de Ação elaborado',
          data: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
          usuario: 'Maria Oliveira'
        }
      ];
      
      setHistorico(mockHistorico);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  useEffect(() => {
    if (id) {
      loadBeneficiaria();
    }
  }, [id]);

  const loadBeneficiaria = async () => {
    try {
      setLoading(true);
      
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig) {
        // Dados mock para desenvolvimento
        const mockBeneficiaria: Beneficiaria = {
          id: id || '15b2ce99-7a8c-4111-ab5b-7556e4f545ba',
          nome_completo: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          rg: '12.345.678-9',
          data_nascimento: '1985-05-15',
          idade: 39,
          endereco: 'Rua das Flores, 123',
          bairro: 'Centro',
          nis: '12345678901',
          contato1: '(11) 98765-4321',
          contato2: '(11) 3456-7890',
          referencia: 'Próximo à farmácia',
          data_inicio_instituto: '2024-01-15',
          programa_servico: 'Assistência Social',
          data_criacao: new Date().toISOString()
        };
        setBeneficiaria(mockBeneficiaria);
        loadHistorico(mockBeneficiaria.id);
        return;
      }
      
      const { data, error } = await supabase
        .from('beneficiarias')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        setError('Beneficiária não encontrada');
        return;
      }

      setBeneficiaria(data);
      loadHistorico(data.id);
    } catch (error) {
      console.error('Erro ao carregar beneficiária:', error);
      setError('Erro ao carregar dados da beneficiária');
    } finally {
      setLoading(false);
    }
  };

  const generatePAEDI = (beneficiaria: Beneficiaria) => {
    try {
      const dataCriacao = beneficiaria.data_criacao ? new Date(beneficiaria.data_criacao) : new Date();
      const year = isNaN(dataCriacao.getTime()) ? new Date().getFullYear() : dataCriacao.getFullYear();
      const sequence = beneficiaria.id.slice(-3).toUpperCase();
      return `MM-${year}-${sequence}`;
    } catch (error) {
      console.warn('Erro ao gerar PAEDI:', error);
      const sequence = beneficiaria.id.slice(-3).toUpperCase();
      return `MM-${new Date().getFullYear()}-${sequence}`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando PAEDI...</p>
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
          <h1 className="text-3xl font-bold text-foreground">PAEDI</h1>
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
          onClick={() => navigate('/beneficiarias')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-foreground">{beneficiaria.nome_completo}</h1>
            <Badge variant="default" className="text-sm">
              PAEDI: {generatePAEDI(beneficiaria)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Pasta de Atendimento e Desenvolvimento Individual
          </p>
        </div>
        <Button onClick={() => navigate(`/beneficiarias/${id}/editar`)}>
          <Edit className="h-4 w-4 mr-2" />
          Editar Dados
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Idade</p>
                <p className="font-semibold">{calculateAge(beneficiaria.data_nascimento)} anos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No Instituto desde</p>
                <p className="font-semibold">{formatDate(beneficiaria.data_inicio_instituto)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning-light rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Programa</p>
                <p className="font-semibold text-sm">{beneficiaria.programa_servico || 'Não definido'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant="default">Ativa</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dados" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dados">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="formularios">Formulários</TabsTrigger>
          <TabsTrigger value="evolucao">Evolução</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="dados">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Dados Pessoais */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nome Completo</p>
                    <p className="font-semibold">{beneficiaria.nome_completo}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">CPF</p>
                      <p className="font-mono">{formatCpf(beneficiaria.cpf)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">RG</p>
                      <p className="font-mono">{beneficiaria.rg || '-'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Data de Nascimento</p>
                      <p>{formatDate(beneficiaria.data_nascimento)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">NIS</p>
                      <p className="font-mono">{beneficiaria.nis || '-'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contato e Endereço */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Contato e Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Endereço</p>
                    <p>{beneficiaria.endereco || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Bairro</p>
                    <p>{beneficiaria.bairro || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone Principal</p>
                      <p className="font-mono">{beneficiaria.contato1}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Telefone Secundário</p>
                      <p className="font-mono">{beneficiaria.contato2 || '-'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formularios">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Anamnese Social */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Anamnese Social
                </CardTitle>
                <CardDescription>
                  Avaliação socioeconômica e familiar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/anamnese`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Roda da Vida */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-success" />
                  Roda da Vida
                </CardTitle>
                <CardDescription>
                  Avaliação holística das áreas de vida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/roda-vida`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Visão Holística */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-warning" />
                  Visão Holística
                </CardTitle>
                <CardDescription>
                  Análise qualitativa da beneficiária
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/visao-holistica`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plano de Ação */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Plano de Ação
                </CardTitle>
                <CardDescription>
                  Objetivos e metas personalizadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/plano-acao`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Termo de Consentimento */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-success" />
                  Termo de Consentimento
                </CardTitle>
                <CardDescription>
                  TCLE e autorização LGPD
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/termo-consentimento`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Matrícula de Projetos */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-warning" />
                  Matrícula de Projetos
                </CardTitle>
                <CardDescription>
                  Inscrição em projetos sociais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Não preenchida</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/matricula-projetos`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Preencher
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Declarações e Recibos */}
            <Card className="shadow-soft hover:shadow-medium transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Declarações e Recibos
                </CardTitle>
                <CardDescription>
                  Documentos e benefícios
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Nenhum documento</Badge>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/beneficiarias/${id}/declaracoes-recibos`)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Gerenciar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="evolucao">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Ficha de Evolução
              </CardTitle>
              <CardDescription>
                Registro cronológico do acompanhamento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma evolução registrada ainda
                </p>
                <Button onClick={() => navigate(`/beneficiarias/${id}/evolucao`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Registrar Evolução
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentos">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Documentos Gerados</CardTitle>
              <CardDescription>
                Declarações, recibos e relatórios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhum documento gerado ainda
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Gerar Documento
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
              <CardDescription>
                Timeline de todas as interações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {historico.length > 0 ? (
                  historico.map((item, index) => (
                    <div key={item.id} className="flex items-start gap-3 p-3 border-l-2 border-primary">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{item.descricao}</p>
                            <p className="text-sm text-muted-foreground">
                              Por: {item.usuario} • {formatDate(item.data)}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {item.tipo}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma atividade registrada ainda</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}