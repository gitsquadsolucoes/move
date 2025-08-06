import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  Calendar, 
  Activity,
  BarChart3,
  Download,
  Filter,
  UserCheck,
  ClipboardList,
  Heart,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import StatCard from '@/components/ui/stat-card';

interface AnalyticsData {
  totalBeneficiarias: number;
  beneficiariasAtivas: number;
  formulariosPendentes: number;
  evolucoesMes: number;
  idades: { faixa: string; count: number }[];
  projetos: { nome: string; matriculas: number }[];
  evolucaoMensal: { mes: string; evolucoes: number; beneficiarias: number }[];
  rodaVidaMedia: { area: string; score: number }[];
  statusFormularios: { tipo: string; preenchidos: number; pendentes: number }[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--accent-strong))'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('3m'); // 1m, 3m, 6m, 1y
  const [selectedView, setSelectedView] = useState('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [period]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load all data in parallel
      const [
        beneficiariasData,
        evolucaoData,
        matriculasData,
        rodaVidaData,
        anamneseData,
        visaoData,
        termoData,
        planoData
      ] = await Promise.all([
        supabase.from('beneficiarias').select('*'),
        supabase.from('fichas_evolucao').select('*'),
        supabase.from('matriculas_projetos').select('*'),
        supabase.from('roda_vida').select('*'),
        supabase.from('anamneses_social').select('*'),
        supabase.from('visoes_holisticas').select('*'),
        supabase.from('termos_consentimento').select('*'),
        supabase.from('planos_acao').select('*')
      ]);

      if (beneficiariasData.error) throw beneficiariasData.error;

      const beneficiarias = beneficiariasData.data || [];
      const evolucoes = evolucaoData.data || [];
      const matriculas = matriculasData.data || [];
      const rodaVida = rodaVidaData.data || [];

      // Calculate age distribution
      const idades = calculateAgeDistribution(beneficiarias);
      
      // Calculate project participation
      const projetos = calculateProjectParticipation(matriculas);
      
      // Calculate monthly evolution
      const evolucaoMensal = calculateMonthlyEvolution(evolucoes, beneficiarias);
      
      // Calculate average Roda da Vida scores
      const rodaVidaMedia = calculateAverageRodaVida(rodaVida);
      
      // Calculate form completion status
      const statusFormularios = calculateFormStatus(
        beneficiarias,
        anamneseData.data || [],
        visaoData.data || [],
        termoData.data || [],
        planoData.data || []
      );

      setData({
        totalBeneficiarias: beneficiarias.length,
        beneficiariasAtivas: beneficiarias.filter(b => 
          new Date(b.data_criacao) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        ).length,
        formulariosPendentes: calculatePendingForms(beneficiarias, [
          anamneseData.data || [],
          visaoData.data || [],
          termoData.data || [],
          planoData.data || []
        ]),
        evolucoesMes: evolucoes.filter(e => 
          new Date(e.data_criacao) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).length,
        idades,
        projetos,
        evolucaoMensal,
        rodaVidaMedia,
        statusFormularios
      });
    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
      setError('Erro ao carregar dados de analytics');
    } finally {
      setLoading(false);
    }
  };

  const calculateAgeDistribution = (beneficiarias: any[]) => {
    const distribution = {
      '18-25': 0,
      '26-35': 0,
      '36-45': 0,
      '46-55': 0,
      '55+': 0
    };

    beneficiarias.forEach(b => {
      const age = calculateAge(b.data_nascimento);
      if (age <= 25) distribution['18-25']++;
      else if (age <= 35) distribution['26-35']++;
      else if (age <= 45) distribution['36-45']++;
      else if (age <= 55) distribution['46-55']++;
      else distribution['55+']++;
    });

    return Object.entries(distribution).map(([faixa, count]) => ({ faixa, count }));
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

  const calculateProjectParticipation = (matriculas: any[]) => {
    const projectCounts: { [key: string]: number } = {};
    
    matriculas.forEach(m => {
      projectCounts[m.nome_projeto] = (projectCounts[m.nome_projeto] || 0) + 1;
    });

    return Object.entries(projectCounts)
      .map(([nome, matriculas]) => ({ nome, matriculas }))
      .sort((a, b) => b.matriculas - a.matriculas)
      .slice(0, 10);
  };

  const calculateMonthlyEvolution = (evolucoes: any[], beneficiarias: any[]) => {
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      
      const evolucoesMes = evolucoes.filter(e => {
        const evDate = new Date(e.data_criacao);
        return evDate.getMonth() === month.getMonth() && evDate.getFullYear() === month.getFullYear();
      }).length;

      const beneficiariasNovas = beneficiarias.filter(b => {
        const bDate = new Date(b.data_criacao);
        return bDate.getMonth() === month.getMonth() && bDate.getFullYear() === month.getFullYear();
      }).length;

      months.push({
        mes: monthName,
        evolucoes: evolucoesMes,
        beneficiarias: beneficiariasNovas
      });
    }
    
    return months;
  };

  const calculateAverageRodaVida = (rodaVida: any[]) => {
    if (rodaVida.length === 0) return [];

    const areas = [
      'espiritualidade_score',
      'saude_score', 
      'lazer_score',
      'equilibrio_emocional_score',
      'vida_social_score',
      'relacionamento_familiar_score',
      'recursos_financeiros_score',
      'amor_score',
      'contribuicao_social_score',
      'proposito_score'
    ];

    const labels = [
      'Espiritualidade',
      'Saúde',
      'Lazer', 
      'Equilíbrio Emocional',
      'Vida Social',
      'Relacionamento Familiar',
      'Recursos Financeiros',
      'Amor',
      'Contribuição Social',
      'Propósito'
    ];

    return areas.map((area, index) => {
      const scores = rodaVida.map(r => r[area] || 0).filter(s => s > 0);
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      
      return {
        area: labels[index],
        score: Math.round(average * 10) / 10
      };
    });
  };

  const calculateFormStatus = (beneficiarias: any[], ...forms: any[][]) => {
    const formTypes = ['Anamnese Social', 'Visão Holística', 'Termo Consentimento', 'Plano de Ação'];
    
    return formTypes.map((tipo, index) => {
      const formsData = forms[index] || [];
      const preenchidos = formsData.length;
      const pendentes = beneficiarias.length - preenchidos;
      
      return { tipo, preenchidos, pendentes };
    });
  };

  const calculatePendingForms = (beneficiarias: any[], forms: any[][]) => {
    const totalForms = beneficiarias.length * forms.length;
    const completedForms = forms.reduce((sum, formData) => sum + formData.length, 0);
    return totalForms - completedForms;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando analytics...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">Analytics e Relatórios</h1>
        <div className="text-center py-8">
          <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{error || 'Erro ao carregar dados'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics e Relatórios</h1>
          <p className="text-muted-foreground">Insights e estatísticas do sistema</p>
        </div>
        <div className="flex gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">1 Mês</SelectItem>
              <SelectItem value="3m">3 Meses</SelectItem>
              <SelectItem value="6m">6 Meses</SelectItem>
              <SelectItem value="1y">1 Ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total de Beneficiárias"
          value={data.totalBeneficiarias}
          description="Cadastradas no sistema"
          icon={<Users className="h-4 w-4" />}
          variant="primary"
        />
        <StatCard
          title="Beneficiárias Ativas"
          value={data.beneficiariasAtivas}
          description="Últimos 3 meses"
          icon={<UserCheck className="h-4 w-4" />}
          variant="success"
        />
        <StatCard
          title="Formulários Pendentes"
          value={data.formulariosPendentes}
          description="Aguardando preenchimento"
          icon={<ClipboardList className="h-4 w-4" />}
          variant="warning"
        />
        <StatCard
          title="Evoluções este Mês"
          value={data.evolucoesMes}
          description="Registros de acompanhamento"
          icon={<Activity className="h-4 w-4" />}
          variant="default"
        />
      </div>

      {/* Main Analytics */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="demographics">Demografia</TabsTrigger>
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="wellbeing">Bem-estar</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Evolution */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Evolução Mensal</CardTitle>
                <CardDescription>Novas beneficiárias e evoluções registradas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.evolucaoMensal}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="beneficiarias" 
                      stroke="hsl(var(--primary))" 
                      name="Novas Beneficiárias"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="evolucoes" 
                      stroke="hsl(var(--success))" 
                      name="Evoluções"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Form Completion Status */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Status dos Formulários</CardTitle>
                <CardDescription>Preenchidos vs. Pendentes por tipo</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.statusFormularios}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="tipo" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="preenchidos" fill="hsl(var(--success))" name="Preenchidos" />
                    <Bar dataKey="pendentes" fill="hsl(var(--warning))" name="Pendentes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Age Distribution */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Distribuição por Faixa Etária</CardTitle>
                <CardDescription>Perfil etário das beneficiárias</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.idades}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ faixa, percent }) => `${faixa}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {data.idades.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Regional Distribution placeholder */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Distribuição Regional</CardTitle>
                <CardDescription>Beneficiárias por região/bairro</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Dados regionais em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Participação em Projetos</CardTitle>
              <CardDescription>Projetos mais procurados e suas matrículas</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.projetos} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="nome" type="category" width={150} />
                  <Tooltip />
                  <Bar dataKey="matriculas" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wellbeing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Roda da Vida Average */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Roda da Vida - Média Geral</CardTitle>
                <CardDescription>Scores médios por área de vida</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={data.rodaVidaMedia}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="area" />
                    <PolarRadiusAxis angle={90} domain={[0, 10]} />
                    <Radar
                      name="Score Médio"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.3}
                    />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Wellness Trends placeholder */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle>Tendências de Bem-estar</CardTitle>
                <CardDescription>Evolução dos scores ao longo do tempo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Análise temporal em desenvolvimento</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}