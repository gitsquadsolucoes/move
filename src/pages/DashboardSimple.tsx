import { Users, FileText, Calendar, TrendingUp, Heart, ClipboardCheck } from "lucide-react";
import StatCard from "@/components/ui/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function DashboardSimple() {
  const [stats] = useState({
    totalBeneficiarias: 3,
    formularios: 15,
    atendimentosMes: 8,
    engajamento: "85%"
  });

  const mockActivities = [
    {
      id: 1,
      type: "Cadastro",
      description: "Maria Silva Santos foi cadastrada no sistema",
      time: "2 horas atrás",
      icon: Users,
      status: "completed"
    },
    {
      id: 2,
      type: "Formulário",
      description: "Anamnese Social - Ana Paula Oliveira",
      time: "4 horas atrás",
      icon: FileText,
      status: "completed"
    },
    {
      id: 3,
      type: "Atendimento",
      description: "Declaração de comparecimento - Joana Ferreira Lima",
      time: "1 dia atrás",
      icon: Calendar,
      status: "completed"
    }
  ];

  const mockTasks = [
    {
      id: 1,
      title: "Revisão mensal - Dados das beneficiárias",
      due: "Esta semana",
      priority: "Alta"
    },
    {
      id: 2,
      title: "Atualização de dados - 3 beneficiárias",
      due: "Em 2 dias",
      priority: "Média"
    },
    {
      id: 3,
      title: "Relatório mensal de atividades",
      due: "Na próxima semana",
      priority: "Baixa"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Bem-vindo ao sistema Move Marias - 100% PostgreSQL!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Beneficiárias"
          value={stats.totalBeneficiarias.toString()}
          icon={Users}
          description="Total de beneficiárias cadastradas"
        />
        <StatCard
          title="Formulários"
          value={stats.formularios.toString()}
          icon={FileText}
          description="Preenchidos este mês"
        />
        <StatCard
          title="Atendimentos"
          value={stats.atendimentosMes.toString()}
          icon={Calendar}
          description="Realizados este mês"
        />
        <StatCard
          title="Engajamento"
          value={stats.engajamento}
          icon={TrendingUp}
          description="Taxa de participação"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-purple-600" />
                Atividades Recentes
              </CardTitle>
              <CardDescription>
                Últimas ações realizadas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50">
                    <div className="p-2 rounded-full bg-purple-100">
                      <activity.icon className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {activity.type}
                        </Badge>
                        <span className="text-xs text-gray-500">{activity.time}</span>
                      </div>
                      <p className="text-sm text-gray-700">{activity.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/atividades">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas as atividades
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Tasks */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-blue-600" />
                Próximas Tarefas
              </CardTitle>
              <CardDescription>
                Pendências e lembretes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTasks.map((task) => (
                  <div key={task.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-900">
                        {task.title}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{task.due}</span>
                        <Badge 
                          variant={task.priority === 'Alta' ? 'destructive' : task.priority === 'Média' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Link to="/tarefas">
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas as tarefas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesse rapidamente as principais funcionalidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/cadastro-beneficiaria">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <Users className="h-6 w-6" />
                <span>Cadastrar Beneficiária</span>
              </Button>
            </Link>
            <Link to="/beneficiarias">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <FileText className="h-6 w-6" />
                <span>Ver Beneficiárias</span>
              </Button>
            </Link>
            <Link to="/relatorios">
              <Button className="w-full h-20 flex flex-col gap-2" variant="outline">
                <TrendingUp className="h-6 w-6" />
                <span>Relatórios</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
