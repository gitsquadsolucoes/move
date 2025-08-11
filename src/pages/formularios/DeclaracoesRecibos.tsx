import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { BeneficiariaSelection } from '@/components/BeneficiariaSelection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, FileText, Receipt, Download, Calendar, User, Loader2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/usePostgreSQLAuth';
import { DocumentDownloadButton } from '@/components/DocumentDownloadButton';

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

interface DeclaracaoComparecimento {
  id: string;
  data_comparecimento: string;
  hora_entrada?: string;
  hora_saida?: string;
  profissional_responsavel: string;
  data_criacao: string;
}

interface ReciboBeneficio {
  id: string;
  tipo_beneficio: string;
  data_recebimento: string;
  data_criacao: string;
}

const tiposBeneficios = [
  'Cesta Básica',
  'Kit de Higiene',
  'Kit Escolar',
  'Cestas de Natal',
  'Medicamentos',
  'Fraldas',
  'Roupas',
  'Calçados',
  'Material de Limpeza',
  'Outro'
];

export default function DeclaracoesRecibos() {
  const { beneficiariaId } = useParams<{ beneficiariaId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [beneficiaria, setBeneficiaria] = useState<Beneficiaria | null>(null);
  const [declaracoes, setDeclaracoes] = useState<DeclaracaoComparecimento[]>([]);
  const [recibos, setRecibos] = useState<ReciboBeneficio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form states
  const [declaracaoForm, setDeclaracaoForm] = useState({
    data_comparecimento: new Date().toISOString().split('T')[0],
    hora_entrada: '',
    hora_saida: '',
    profissional_responsavel: profile?.nome_completo || ''
  });

  const [reciboForm, setReciboForm] = useState({
    tipo_beneficio: '',
    data_recebimento: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (beneficiariaId) {
      Promise.all([
        loadBeneficiaria(),
        loadDeclaracoes(),
        loadRecibos()
      ]);
    } else {
      // Se não há beneficiariaId, é um acesso direto aos formulários
      setLoading(false);
    }
  }, [beneficiariaId]);

  const loadBeneficiaria = async () => {
    try {
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig) {
        // Dados mock para desenvolvimento
        const mockBeneficiaria = {
          id: beneficiariaId,
          nome_completo: 'Maria Silva Santos',
          cpf: '123.456.789-00',
          data_nascimento: '1985-05-15',
          telefone: '(11) 98765-4321',
          endereco: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          cep: '01234-567',
          rg: '12.345.678-9',
          created_at: new Date().toISOString()
        };
        setBeneficiaria(mockBeneficiaria);
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

      setBeneficiaria(data);
    } catch (error) {
      console.error('Erro ao carregar beneficiária:', error);
      setError('Erro ao carregar dados da beneficiária');
    }
  };

  const loadDeclaracoes = async () => {
    try {
      // Verifica se está usando configuração dummy tentando acessar o supabase
      let isDummyConfig = false;
      try {
        await supabase.auth.getSession();
      } catch (error) {
        isDummyConfig = true;
      }
      
      if (isDummyConfig) {
        // Dados mock para desenvolvimento
        const mockDeclaracoes: DeclaracaoComparecimento[] = [
          {
            id: '1',
            data_comparecimento: '2024-01-15',
            hora_entrada: '09:00',
            hora_saida: '12:00',
            profissional_responsavel: 'Ana Costa',
            data_criacao: new Date().toISOString()
          },
          {
            id: '2',
            data_comparecimento: '2024-01-10',
            hora_entrada: '14:00',
            hora_saida: '17:00',
            profissional_responsavel: 'Carlos Oliveira',
            data_criacao: new Date().toISOString()
          }
        ];
        setDeclaracoes(mockDeclaracoes);
        return;
      }

      const { data, error } = await supabase
        .from('declaracoes_comparecimento')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_comparecimento', { ascending: false });

      if (error) {
        console.error('Erro ao carregar declarações:', error);
        return;
      }

      setDeclaracoes(data || []);
    } catch (error) {
      console.error('Erro ao carregar declarações:', error);
    }
  };

  const loadRecibos = async () => {
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
        const mockRecibos: ReciboBeneficio[] = [
          {
            id: '1',
            tipo_beneficio: 'Auxílio Alimentação',
            data_recebimento: '2024-01-20',
            data_criacao: new Date().toISOString()
          },
          {
            id: '2',
            tipo_beneficio: 'Auxílio Transporte',
            data_recebimento: '2024-01-15',
            data_criacao: new Date().toISOString()
          }
        ];
        setRecibos(mockRecibos);
        return;
      }

      const { data, error } = await supabase
        .from('recibos_beneficio')
        .select('*')
        .eq('beneficiaria_id', beneficiariaId)
        .order('data_recebimento', { ascending: false });

      if (error) {
        console.error('Erro ao carregar recibos:', error);
        return;
      }

      setRecibos(data || []);
    } catch (error) {
      console.error('Erro ao carregar recibos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeclaracaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      const declaracaoData = {
        beneficiaria_id: beneficiaria.id,
        ...declaracaoForm
      };

      const { error } = await supabase
        .from('declaracoes_comparecimento')
        .insert([declaracaoData]);

      if (error) {
        setError(`Erro ao salvar declaração: ${error.message}`);
        return;
      }

      setSuccess(true);
      setDeclaracaoForm({
        data_comparecimento: new Date().toISOString().split('T')[0],
        hora_entrada: '',
        hora_saida: '',
        profissional_responsavel: profile?.nome_completo || ''
      });
      
      await loadDeclaracoes();
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar declaração:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReciboSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!beneficiaria) return;

    setSaving(true);
    setError(null);

    try {
      const reciboData = {
        beneficiaria_id: beneficiaria.id,
        ...reciboForm
      };

      const { error } = await supabase
        .from('recibos_beneficio')
        .insert([reciboData]);

      if (error) {
        setError(`Erro ao salvar recibo: ${error.message}`);
        return;
      }

      setSuccess(true);
      setReciboForm({
        tipo_beneficio: '',
        data_recebimento: new Date().toISOString().split('T')[0]
      });
      
      await loadRecibos();
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar recibo:', error);
      setError('Erro interno. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const generatePAEDI = (beneficiaria: Beneficiaria) => {
    // Simple PAEDI generation based on creation date and ID
    const year = new Date().getFullYear();
    const sequence = beneficiaria.id.slice(-3).toUpperCase();
    return `MM-${year}-${sequence}`;
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '-';
    return timeString;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando documentos...</p>
        </div>
      </div>
    );
  }

  // Se não há beneficiariaId, mostra interface de seleção
  if (!beneficiariaId) {
    return (
      <BeneficiariaSelection 
        title="Declarações e Recibos" 
        description="Selecione uma beneficiária para gerar declarações e recibos"
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
          <h1 className="text-3xl font-bold text-foreground">Declarações e Recibos</h1>
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
          <h1 className="text-3xl font-bold text-foreground">Declarações e Recibos</h1>
          <p className="text-muted-foreground">
            {beneficiaria.nome_completo} • CPF: {formatCpf(beneficiaria.cpf)} • PAEDI: {generatePAEDI(beneficiaria)}
          </p>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <Alert className="border-success">
          <AlertDescription className="text-success">
            Documento registrado com sucesso!
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="declaracoes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="declaracoes">Declarações de Comparecimento</TabsTrigger>
          <TabsTrigger value="recibos">Recibos de Benefícios</TabsTrigger>
        </TabsList>

        <TabsContent value="declaracoes" className="space-y-6">
          {/* Formulário de Nova Declaração */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nova Declaração de Comparecimento
              </CardTitle>
              <CardDescription>
                Registrar comparecimento em atividade ou atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDeclaracaoSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="data_comparecimento">Data do Comparecimento</Label>
                    <Input
                      id="data_comparecimento"
                      type="date"
                      value={declaracaoForm.data_comparecimento}
                      onChange={(e) => setDeclaracaoForm(prev => ({ ...prev, data_comparecimento: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_entrada">Horário de Entrada</Label>
                    <Input
                      id="hora_entrada"
                      type="time"
                      value={declaracaoForm.hora_entrada}
                      onChange={(e) => setDeclaracaoForm(prev => ({ ...prev, hora_entrada: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hora_saida">Horário de Saída</Label>
                    <Input
                      id="hora_saida"
                      type="time"
                      value={declaracaoForm.hora_saida}
                      onChange={(e) => setDeclaracaoForm(prev => ({ ...prev, hora_saida: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profissional_responsavel">Profissional Responsável</Label>
                  <Input
                    id="profissional_responsavel"
                    value={declaracaoForm.profissional_responsavel}
                    onChange={(e) => setDeclaracaoForm(prev => ({ ...prev, profissional_responsavel: e.target.value }))}
                    required
                  />
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Declaração
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Declarações */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Histórico de Declarações</CardTitle>
              <CardDescription>
                Declarações de comparecimento emitidas ({declaracoes.length} registro{declaracoes.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {declaracoes.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhuma declaração emitida ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {declaracoes.map((declaracao) => (
                    <Card key={declaracao.id} className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{formatDate(declaracao.data_comparecimento)}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="h-3 w-3" />
                              {declaracao.profissional_responsavel}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {formatTime(declaracao.hora_entrada)} - {formatTime(declaracao.hora_saida)}
                            </Badge>
                            <DocumentDownloadButton
                              documentType="declaracao_comparecimento"
                              beneficiariaId={beneficiaria.id}
                              beneficiariaNome={beneficiaria.nome_completo}
                              formId={declaracao.id}
                              size="sm"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recibos" className="space-y-6">
          {/* Formulário de Novo Recibo */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Novo Recibo de Benefício
              </CardTitle>
              <CardDescription>
                Registrar entrega de benefício ou auxílio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReciboSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tipo_beneficio">Tipo de Benefício</Label>
                    <select
                      id="tipo_beneficio"
                      value={reciboForm.tipo_beneficio}
                      onChange={(e) => setReciboForm(prev => ({ ...prev, tipo_beneficio: e.target.value }))}
                      required
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="">Selecione o benefício</option>
                      {tiposBeneficios.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="data_recebimento">Data do Recebimento</Label>
                    <Input
                      id="data_recebimento"
                      type="date"
                      value={reciboForm.data_recebimento}
                      onChange={(e) => setReciboForm(prev => ({ ...prev, data_recebimento: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Registrar Recibo
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Lista de Recibos */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Histórico de Recibos</CardTitle>
              <CardDescription>
                Recibos de benefícios emitidos ({recibos.length} registro{recibos.length !== 1 ? 's' : ''})
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recibos.length === 0 ? (
                <div className="text-center py-8">
                  <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum recibo emitido ainda
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recibos.map((recibo) => (
                    <Card key={recibo.id} className="shadow-soft">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-semibold">{recibo.tipo_beneficio}</h4>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <Calendar className="h-3 w-3" />
                              Recebido em {formatDate(recibo.data_recebimento)}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Gerar PDF
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}