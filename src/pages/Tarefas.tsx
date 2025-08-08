import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, AlertCircle, Clock, Plus, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  title: string;
  description: string;
  due: string;
  priority: "Alta" | "Média" | "Baixa";
  status: "pending" | "completed" | "overdue";
  type: string;
}

export default function Tarefas() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("todas");
  const navigate = useNavigate();

  const handleCompleteTarefa = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, status: 'completed' as const }
          : task
      )
    );
  };

  const handleRescheduleTarefa = (taskId: string) => {
    const newDueDate = prompt('Nova data (DD/MM/AAAA):');
    if (newDueDate) {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, due: newDueDate, status: 'pending' as const }
            : task
        )
      );
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // Get pending forms count for dynamic tasks
      const { count: pendingBeneficiarias } = await supabase
        .from('beneficiarias')
        .select('*', { count: 'exact', head: true });

      const { count: pendingAnamneses } = await supabase
        .from('anamneses_social')
        .select('*', { count: 'exact', head: true });

      const { count: totalBeneficiarias } = await supabase
        .from('beneficiarias')
        .select('*', { count: 'exact', head: true });

      // Calculate missing anamneses
      const missingAnamneses = (totalBeneficiarias || 0) - (pendingAnamneses || 0);

      const allTasks: Task[] = [
        {
          id: "1",
          title: "Revisão mensal - Dados das beneficiárias",
          description: "Verificar e atualizar dados das beneficiárias cadastradas",
          due: "Esta semana",
          priority: "Alta",
          status: "pending",
          type: "sistema"
        },
        {
          id: "2", 
          title: `Anamneses pendentes - ${missingAnamneses} beneficiárias`,
          description: "Completar anamneses sociais para beneficiárias sem formulário",
          due: "Esta semana",
          priority: missingAnamneses > 5 ? "Alta" : "Média",
          status: missingAnamneses > 0 ? "pending" : "completed",
          type: "formulario"
        },
        {
          id: "3",
          title: "Relatório de impacto social",
          description: "Gerar relatório mensal de impacto das atividades",
          due: "Próxima semana",
          priority: "Média",
          status: "pending",
          type: "relatorio"
        },
        {
          id: "4",
          title: "Backup dos dados do sistema",
          description: "Realizar backup completo dos dados das beneficiárias",
          due: "Esta semana",
          priority: "Alta",
          status: "pending",
          type: "sistema"
        },
        {
          id: "5",
          title: "Atualização de contatos",
          description: "Verificar e atualizar informações de contato desatualizadas",
          due: "Próximo mês",
          priority: "Baixa",
          status: "pending",
          type: "beneficiarias"
        },
        {
          id: "6",
          title: "Planejamento de oficinas",
          description: "Organizar cronograma de oficinas para o próximo período",
          due: "Próxima semana",
          priority: "Média",
          status: "pending",
          type: "oficinas"
        }
      ];

      // Apply filter
      const filteredTasks = filter === "todas" 
        ? allTasks 
        : filter === "pendentes"
        ? allTasks.filter(task => task.status === "pending")
        : filter === "concluidas"
        ? allTasks.filter(task => task.status === "completed")
        : allTasks.filter(task => task.type === filter);

      setTasks(filteredTasks);
      
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Alta":
        return "destructive";
      case "Média":
        return "default";
      case "Baixa":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Concluída";
      case "overdue":
        return "Atrasada";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-foreground mb-2">Todas as Tarefas</h1>
          <p className="text-muted-foreground">
            Gerenciamento completo de tarefas do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar tarefas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as tarefas</SelectItem>
              <SelectItem value="pendentes">Pendentes</SelectItem>
              <SelectItem value="concluidas">Concluídas</SelectItem>
              <SelectItem value="sistema">Sistema</SelectItem>
              <SelectItem value="formulario">Formulários</SelectItem>
              <SelectItem value="relatorio">Relatórios</SelectItem>
              <SelectItem value="beneficiarias">Beneficiárias</SelectItem>
              <SelectItem value="oficinas">Oficinas</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="default">
            <Plus className="h-4 w-4 mr-2" />
            Nova Tarefa
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "pending").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Concluídas</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.status === "completed").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-sm font-medium">Alta Prioridade</p>
                <p className="text-2xl font-bold">{tasks.filter(t => t.priority === "Alta").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded-full" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-primary" />
            Lista de Tarefas
          </CardTitle>
          <CardDescription>
            {filter === "todas" ? "Todas as tarefas" : `Tarefas: ${filter}`} do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-lg border animate-pulse">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                    <div className="h-6 w-16 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {filter === "todas" 
                  ? "Nenhuma tarefa encontrada" 
                  : `Nenhuma tarefa ${filter} encontrada`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div key={task.id} className="p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(task.status)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-foreground">
                            {task.title}
                          </p>
                          <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                            {task.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Prazo: {task.due}</span>
                          <span>Status: {getStatusText(task.status)}</span>
                          <span>Categoria: {task.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== "completed" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleCompleteTarefa(task.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRescheduleTarefa(task.id)}
                          >
                            <Clock className="w-4 h-4 mr-1" />
                            Reprogramar
                          </Button>
                        </>
                      )}
                      {task.status === "completed" && (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Concluída
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}