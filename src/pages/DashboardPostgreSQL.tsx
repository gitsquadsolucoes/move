import { Users, FileText, Calendar, TrendingUp, Heart, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalBeneficiarias: 0,
    formularios: 0,
    atendimentosMes: 0,
    engajamento: "0%"
  });
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [upcomingTasks, setUpcomingTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados das beneficiárias via API PostgreSQL
      const response = await api.getBeneficiarias();
      console.log('Dashboard - resposta da API:', response);
      
      // A API retorna { beneficiarias: [...], pagination: {...} }
      let beneficiarias = [];
      if ((response as any).beneficiarias) {
        beneficiarias = (response as any).beneficiarias;
      } else if (response.data && Array.isArray(response.data)) {
        beneficiarias = response.data;
      } else if (response.success && response.data) {
        beneficiarias = response.data;
      }
      
      console.log('Dashboard - beneficiárias processadas:', beneficiarias);
      const totalBeneficiarias = beneficiarias.length;

      // Simular dados até implementarmos as outras tabelas
      const formularios = 15; // Placeholder
      const atendimentosMes = 8; // Placeholder
      const engajamento = "85%"; // Placeholder

      setStats({
        totalBeneficiarias,
        formularios,
        atendimentosMes,
        engajamento
      });

      // Atividades recentes simuladas
      setRecentActivities([
        {
          id: 1,
          type: "Nova beneficiária",
          description: "Maria Silva Santos foi cadastrada no sistema",
          time: "2 horas atrás",
          icon: Users,
          color: "text-blue-600"
        },
        {
          id: 2,
          type: "Formulário preenchido",
          description: "Anamnese Social - Ana Paula Oliveira",
          time: "4 horas atrás",
          icon: FileText,
          color: "text-green-600"
        },
        {
          id: 3,
          type: "Atendimento agendado",
          description: "Consulta com Joana Ferreira Lima",
          time: "1 dia atrás",
          icon: Calendar,
          color: "text-orange-600"
        }
      ]);

      // Tarefas próximas simuladas
      setUpcomingTasks([
        {
          id: 1,
          title: "Revisar formulários pendentes",
          dueDate: "Hoje",
          priority: "Alta",
          type: "review"
        },
        {
          id: 2,
          title: "Agendar atendimentos da semana",
          dueDate: "Amanhã",
          priority: "Média",
          type: "schedule"
        },
        {
          id: 3,
          title: "Relatório mensal de atividades",
          dueDate: "15/08/2025",
          priority: "Baixa",
          type: "report"
        }
      ]);

    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
      // Manter valores padrão em caso de erro
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta": return "bg-red-100 text-red-800";
      case "Média": return "bg-yellow-100 text-yellow-800";
      case "Baixa": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do sistema Assist Move Marias
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Beneficiárias"
          value={stats.totalBeneficiarias.toString()}
          description="Pessoas cadastradas"
          icon={Users}
          trend={{ value: 12, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Formulários"
          value={stats.formularios.toString()}
          description="Preenchidos este mês"
          icon={FileText}
          trend={{ value: 8, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Atendimentos"
          value={stats.atendimentosMes.toString()}
          description="Realizados este mês"
          icon={Calendar}
          trend={{ value: 15, label: "vs. mês anterior" }}
        />
        <StatCard
          title="Engajamento"
          value={stats.engajamento}
          description="Taxa de participação"
          icon={TrendingUp}
          trend={{ value: 5, label: "vs. mês anterior" }}
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações realizadas no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`p-2 rounded-full bg-gray-100 ${activity.color}`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/atividades">Ver todas as atividades</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-blue-600" />
              Próximas Tarefas
            </CardTitle>
            <CardDescription>
              Ações que precisam de atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="text-xs text-muted-foreground">
                      Vencimento: {task.dueDate}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/tarefas">Ver todas as tarefas</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso direto às funcionalidades mais utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button className="h-16" asChild>
              <Link to="/beneficiarias/novo" className="flex flex-col gap-2">
                <Users className="w-6 h-6" />
                Nova Beneficiária
              </Link>
            </Button>
            <Button variant="outline" className="h-16" asChild>
              <Link to="/beneficiarias" className="flex flex-col gap-2">
                <FileText className="w-6 h-6" />
                Ver Beneficiárias
              </Link>
            </Button>
            <Button variant="outline" className="h-16" asChild>
              <Link to="/relatorios" className="flex flex-col gap-2">
                <TrendingUp className="w-6 h-6" />
                Relatórios
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
