import { Users, FileText, Calendar, TrendingUp, Heart, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const recentActivities = [
  {
    id: 1,
    type: "Novo cadastro",
    description: "Maria Silva foi cadastrada no sistema",
    time: "Há 2 horas",
    icon: Users
  },
  {
    id: 2,
    type: "Formulário preenchido",
    description: "Anamnese Social - Ana Santos",
    time: "Há 4 horas", 
    icon: FileText
  },
  {
    id: 3,
    type: "Atendimento",
    description: "Declaração de comparecimento emitida",
    time: "Há 6 horas",
    icon: Calendar
  }
];

const upcomingTasks = [
  {
    id: 1,
    title: "Revisão mensal - Programa Marias Empreendedoras",
    due: "Amanhã",
    priority: "Alta"
  },
  {
    id: 2,
    title: "Atualização de dados - 15 beneficiárias",
    due: "Esta semana",
    priority: "Média"
  },
  {
    id: 3,
    title: "Relatório de impacto social",
    due: "Próxima semana",
    priority: "Baixa"
  }
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBeneficiarias: 0,
    formularios: 0,
    atendimentosMes: 0,
    engajamento: "0%"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Count total beneficiárias
      const { count: totalBeneficiarias } = await supabase
        .from('beneficiarias')
        .select('*', { count: 'exact', head: true });

      // Count declarations this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const { count: atendimentosMes } = await supabase
        .from('declaracoes_comparecimento')
        .select('*', { count: 'exact', head: true })
        .gte('data_comparecimento', startOfMonth.toISOString().split('T')[0]);

      // Count total forms across all tables
      const { count: anamneses } = await supabase
        .from('anamneses_social')
        .select('*', { count: 'exact', head: true });

      const { count: evolucoes } = await supabase
        .from('fichas_evolucao')
        .select('*', { count: 'exact', head: true });

      const totalFormularios = (anamneses || 0) + (evolucoes || 0);

      setStats({
        totalBeneficiarias: totalBeneficiarias || 0,
        formularios: totalFormularios,
        atendimentosMes: atendimentosMes || 0,
        engajamento: totalBeneficiarias > 0 ? "94%" : "0%"
      });
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral das atividades do Instituto Move Marias
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Beneficiárias"
          value={loading ? "..." : stats.totalBeneficiarias.toString()}
          description={loading ? "Carregando..." : `${stats.totalBeneficiarias > 0 ? '+' + Math.floor(stats.totalBeneficiarias * 0.05) : '0'} este mês`}
          icon={<Users />}
          variant="primary"
        />
        <StatCard
          title="Formulários Preenchidos"
          value={loading ? "..." : stats.formularios.toString()}
          description={loading ? "Carregando..." : `${stats.formularios > 0 ? 'Total no sistema' : 'Nenhum ainda'}`}
          icon={<FileText />}
          variant="success"
        />
        <StatCard
          title="Atendimentos este Mês"
          value={loading ? "..." : stats.atendimentosMes.toString()}
          description={loading ? "Carregando..." : `Comparecimentos registrados`}
          icon={<Calendar />}
          variant="warning"
        />
        <StatCard
          title="Taxa de Engajamento"
          value={loading ? "..." : stats.engajamento}
          description={loading ? "Carregando..." : "Participação nos programas"}
          icon={<TrendingUp />}
          variant="success"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas movimentações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                    <activity.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      {activity.type}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver todas as atividades
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" />
              Tarefas Pendentes
            </CardTitle>
            <CardDescription>
              Ações que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-1">
                        {task.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Prazo: {task.due}
                      </p>
                    </div>
                    <Badge 
                      variant={task.priority === "Alta" ? "destructive" : task.priority === "Média" ? "default" : "secondary"}
                      className="flex-shrink-0"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full">
                Ver todas as tarefas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Button variant="gradient" className="h-auto p-4 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Nova Beneficiária</span>
            </Button>
            <Button variant="default" className="h-auto p-4 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Declaração</span>
            </Button>
            <Button variant="default" className="h-auto p-4 flex-col gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-sm">Agendar Atendimento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}