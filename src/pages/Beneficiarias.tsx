import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Filter, MoreHorizontal, Edit, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

interface Beneficiaria {
  id: string;
  nome_completo: string;
  cpf: string;
  idade: number | null;
  programa_servico: string | null;
  data_inicio_instituto: string | null;
  contato1: string;
  data_criacao: string;
}

export default function Beneficiarias() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("Todas");
  const [showFilters, setShowFilters] = useState(false);
  const [programaFilter, setProgramaFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [beneficiarias, setBeneficiarias] = useState<Beneficiaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    ativas: 0,
    aguardando: 0,
    inativas: 0
  });

  useEffect(() => {
    loadBeneficiarias();
  }, []);

  const loadBeneficiarias = async () => {
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
        const mockBeneficiarias: Beneficiaria[] = [
          {
            id: '15b2ce99-7a8c-4111-ab5b-7556e4f545ba',
            nome_completo: 'Maria Silva Santos',
            cpf: '123.456.789-00',
            idade: 35,
            programa_servico: 'Assistência Social',
            data_inicio_instituto: '2024-01-15',
            contato1: '(11) 98765-4321',
            data_criacao: new Date().toISOString()
          },
          {
            id: '25c3de89-8b9d-5222-bc6c-8667f5f646cb',
            nome_completo: 'Ana Paula Oliveira',
            cpf: '987.654.321-00',
            idade: 28,
            programa_servico: 'Educação Profissional',
            data_inicio_instituto: '2024-02-10',
            contato1: '(11) 97654-3210',
            data_criacao: new Date().toISOString()
          },
          {
            id: '36d4ef90-9c0e-6333-cd7d-9778g6g757dc',
            nome_completo: 'Carla Fernandes Lima',
            cpf: '456.789.123-00',
            idade: 42,
            programa_servico: 'Capacitação Técnica',
            data_inicio_instituto: '2024-01-20',
            contato1: '(11) 96543-2109',
            data_criacao: new Date().toISOString()
          }
        ];
        
        setBeneficiarias(mockBeneficiarias);
        const total = mockBeneficiarias.length;
        const ativas = mockBeneficiarias.filter(b => getBeneficiariaStatus(b) === "Ativa").length;
        const aguardando = mockBeneficiarias.filter(b => getBeneficiariaStatus(b) === "Aguardando").length;
        const inativas = mockBeneficiarias.filter(b => getBeneficiariaStatus(b) === "Inativa").length;
        
        setStats({
          total,
          ativas,
          aguardando,
          inativas
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('beneficiarias')
        .select('*')
        .order('data_criacao', { ascending: false });

      if (error) {
        console.error('Erro ao carregar beneficiárias:', error);
        return;
      }

      setBeneficiarias(data || []);
      
      // Calculate stats with dynamic status
      const total = data?.length || 0;
      const ativas = data?.filter(b => getBeneficiariaStatus(b) === "Ativa").length || 0;
      const aguardando = data?.filter(b => getBeneficiariaStatus(b) === "Aguardando").length || 0;
      const inativas = data?.filter(b => getBeneficiariaStatus(b) === "Inativa").length || 0;
      
      setStats({
        total,
        ativas,
        aguardando,
        inativas
      });
    } catch (error) {
      console.error('Erro ao carregar beneficiárias:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBeneficiarias = beneficiarias.filter(beneficiaria => {
    const matchesSearch = beneficiaria.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficiaria.cpf.includes(searchTerm);
    
    const beneficiariaStatus = getBeneficiariaStatus(beneficiaria);
    const matchesStatus = selectedStatus === "Todas" || selectedStatus === beneficiariaStatus;
    
    const matchesPrograma = programaFilter === "Todos" || 
                           beneficiaria.programa_servico === programaFilter ||
                           !beneficiaria.programa_servico;
    
    return matchesSearch && matchesStatus && matchesPrograma;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBeneficiarias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBeneficiarias = filteredBeneficiarias.slice(startIndex, endIndex);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, programaFilter]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Ativa": return "default";
      case "Aguardando": return "secondary";
      case "Inativa": return "outline";
      default: return "default";
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const getBeneficiariaStatus = (beneficiaria: Beneficiaria) => {
    // Verifica se data_criacao existe e é válida
    if (!beneficiaria.data_criacao) return "Aguardando";
    
    try {
      // Simula status baseado no tempo desde o cadastro
      const dataCriacao = new Date(beneficiaria.data_criacao);
      if (isNaN(dataCriacao.getTime())) return "Aguardando";
      
      const daysSinceCreation = Math.floor((new Date().getTime() - dataCriacao.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceCreation < 7) return "Aguardando";
      if (daysSinceCreation > 365) return "Inativa";
      return "Ativa";
    } catch (error) {
      console.warn('Erro ao calcular status da beneficiária:', error);
      return "Aguardando";
    }
  };

  const formatCpf = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const generatePaedi = (beneficiaria: Beneficiaria) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Beneficiárias</h1>
          <p className="text-muted-foreground">
            Gerencie o cadastro das beneficiárias do instituto
          </p>
        </div>
        <Button className="w-fit" size="lg" onClick={() => navigate('/beneficiarias/nova')}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Beneficiária
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-primary">{loading ? "..." : stats.total}</div>
            <p className="text-sm text-muted-foreground">Total de Beneficiárias</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">{loading ? "..." : stats.ativas}</div>
            <p className="text-sm text-muted-foreground">Ativas</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">{loading ? "..." : stats.aguardando}</div>
            <p className="text-sm text-muted-foreground">Aguardando</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-muted-foreground">{loading ? "..." : stats.inativas}</div>
            <p className="text-sm text-muted-foreground">Inativas</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Lista de Beneficiárias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou PAEDI..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Todas">Todas</option>
                      <option value="Ativa">Ativa</option>
                      <option value="Aguardando">Aguardando</option>
                      <option value="Inativa">Inativa</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Programa/Serviço</label>
                    <select
                      value={programaFilter}
                      onChange={(e) => setProgramaFilter(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="Todos">Todos</option>
                      <option value="Assistência Social">Assistência Social</option>
                      <option value="Educação Profissional">Educação Profissional</option>
                      <option value="Capacitação Técnica">Capacitação Técnica</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSelectedStatus("Todas");
                        setProgramaFilter("Todos");
                        setSearchTerm("");
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Beneficiária</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>PAEDI</TableHead>
                  <TableHead>Programa</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Início</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">Carregando beneficiárias...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredBeneficiarias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <p className="text-muted-foreground">
                        {searchTerm ? 'Nenhuma beneficiária encontrada para sua busca.' : 'Nenhuma beneficiária cadastrada ainda.'}
                      </p>
                      {!searchTerm && (
                        <Button className="mt-4" onClick={() => navigate('/beneficiarias/nova')}>
                          <Plus className="h-4 w-4 mr-2" />
                          Cadastrar primeira beneficiária
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedBeneficiarias.map((beneficiaria) => (
                    <TableRow key={beneficiaria.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(beneficiaria.nome_completo)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-foreground">{beneficiaria.nome_completo}</div>
                            <div className="text-sm text-muted-foreground">{beneficiaria.contato1}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatCpf(beneficiaria.cpf)}</TableCell>
                      <TableCell className="font-mono text-sm font-medium text-primary">
                        {generatePaedi(beneficiaria)}
                      </TableCell>
                      <TableCell>{beneficiaria.programa_servico || 'Não definido'}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(getBeneficiariaStatus(beneficiaria))}>
                          {getBeneficiariaStatus(beneficiaria)}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(beneficiaria.data_inicio_instituto)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver PAEDI
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/beneficiarias/${beneficiaria.id}/editar`)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/beneficiarias/${beneficiaria.id}/declaracoes-recibos`)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Gerar Documento
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {filteredBeneficiarias.length > itemsPerPage && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredBeneficiarias.length)} de {filteredBeneficiarias.length} beneficiárias
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}