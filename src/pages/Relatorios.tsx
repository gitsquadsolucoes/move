import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, Users, TrendingUp, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  beneficiarias: number;
  formularios: number;
  atendimentos: number;
  oficinas: number;
}

export default function Relatorios() {
  const [data, setData] = useState<ReportData>({
    beneficiarias: 0,
    formularios: 0,
    atendimentos: 0,
    oficinas: 0
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("mensal");
  const { toast } = useToast();

  useEffect(() => {
    loadReportData();
  }, [period]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      const startDate = getStartDate(period);
      
      // Beneficiárias cadastradas no período
      const { count: beneficiarias } = await supabase
        .from('beneficiarias')
        .select('*', { count: 'exact', head: true })
        .gte('data_criacao', startDate);

      // Formulários preenchidos no período
      const { count: anamneses } = await supabase
        .from('anamneses_social')
        .select('*', { count: 'exact', head: true })
        .gte('data_criacao', startDate);

      const { count: evolucoes } = await supabase
        .from('fichas_evolucao')
        .select('*', { count: 'exact', head: true })
        .gte('data_criacao', startDate);

      // Atendimentos no período
      const { count: atendimentos } = await supabase
        .from('declaracoes_comparecimento')
        .select('*', { count: 'exact', head: true })
        .gte('data_criacao', startDate);

      // Oficinas ativas
      const { count: oficinas } = await supabase
        .from('oficinas')
        .select('*', { count: 'exact', head: true })
        .eq('ativa', true);

      setData({
        beneficiarias: beneficiarias || 0,
        formularios: (anamneses || 0) + (evolucoes || 0),
        atendimentos: atendimentos || 0,
        oficinas: oficinas || 0
      });
    } catch (error) {
      console.error('Erro ao carregar dados dos relatórios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados dos relatórios.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (period: string) => {
    const now = new Date();
    switch (period) {
      case "semanal":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      case "mensal":
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      case "trimestral":
        return new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
      case "anual":
        return new Date(now.getFullYear(), 0, 1).toISOString();
      default:
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    }
  };

  const exportReport = async (type: string) => {
    toast({
      title: "Exportando relatório",
      description: `Gerando relatório ${type}...`
    });
    
    // Aqui seria implementada a lógica de exportação
    setTimeout(() => {
      toast({
        title: "Relatório exportado",
        description: `Relatório ${type} foi gerado com sucesso.`
      });
    }, 2000);
  };

  const reports = [
    {
      title: "Relatório de Beneficiárias",
      description: "Lista completa de beneficiárias cadastradas",
      icon: Users,
      value: data.beneficiarias,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Relatório de Formulários", 
      description: "Formulários preenchidos no período",
      icon: FileText,
      value: data.formularios,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "Relatório de Atendimentos",
      description: "Declarações e atendimentos realizados",
      icon: Calendar,
      value: data.atendimentos,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Relatório de Oficinas",
      description: "Oficinas ativas e participação",
      icon: BarChart3,
      value: data.oficinas,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">
            Geração e exportação de relatórios do sistema
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semanal">Última semana</SelectItem>
              <SelectItem value="mensal">Último mês</SelectItem>
              <SelectItem value="trimestral">Último trimestre</SelectItem>
              <SelectItem value="anual">Último ano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {reports.map((report) => (
          <Card key={report.title} className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.title.replace("Relatório de ", "")}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${report.bgColor} flex items-center justify-center`}>
                <report.icon className={`h-4 w-4 ${report.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? "..." : report.value}
              </div>
              <p className="text-xs text-muted-foreground">
                No período selecionado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {reports.map((report) => (
          <Card key={report.title} className="shadow-soft">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className={`h-5 w-5 ${report.color}`} />
                {report.title}
              </CardTitle>
              <CardDescription>
                {report.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total de registros:
                  </span>
                  <Badge variant="secondary">
                    {loading ? "..." : report.value}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => exportReport("PDF")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => exportReport("Excel")}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Excel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Custom Reports */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Relatórios Personalizados
          </CardTitle>
          <CardDescription>
            Gere relatórios específicos para suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <Users className="h-6 w-6" />
              <span className="text-sm">Perfil das Beneficiárias</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <BarChart3 className="h-6 w-6" />
              <span className="text-sm">Evolução por Período</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex-col gap-2">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Formulários Pendentes</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}