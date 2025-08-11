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
import { api } from "@/lib/api";
import { mockBeneficiarias } from "@/lib/postgresqlConfig";

interface Beneficiaria {
  id: number;
  nome: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  created_at: string;
  updated_at: string;
}

export default function PostgreSQLBeneficiarias() {
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
    fetchBeneficiarias();
  }, []);

  const fetchBeneficiarias = async () => {
    try {
      setLoading(true);
      const response = await api.getBeneficiarias();
      
      if (response.success && response.data) {
        setBeneficiarias(response.data);
        setStats({
          total: response.data.length,
          ativas: response.data.length,
          aguardando: 0,
          inativas: 0
        });
      } else {
        // Usar dados mock se a API falhar
        console.warn('API não disponível, usando dados mock');
        setBeneficiarias(mockBeneficiarias);
        setStats({
          total: mockBeneficiarias.length,
          ativas: mockBeneficiarias.length,
          aguardando: 0,
          inativas: 0
        });
      }
    } catch (error) {
      console.error('Erro ao buscar beneficiárias:', error);
      // Usar dados mock em caso de erro
      setBeneficiarias(mockBeneficiarias);
      setStats({
        total: mockBeneficiarias.length,
        ativas: mockBeneficiarias.length,
        aguardando: 0,
        inativas: 0
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar beneficiárias
  const filteredBeneficiarias = beneficiarias.filter((beneficiaria) => {
    const matchesSearch = beneficiaria.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beneficiaria.cpf.includes(searchTerm);
    
    return matchesSearch;
  });

  // Paginação
  const totalPages = Math.ceil(filteredBeneficiarias.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBeneficiarias = filteredBeneficiarias.slice(startIndex, endIndex);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando beneficiárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Beneficiárias</h1>
          <p className="text-muted-foreground">
            Gerencie as beneficiárias do programa Move Marias
          </p>
        </div>
        <Button onClick={() => navigate("/beneficiarias/nova")} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Beneficiária
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Beneficiárias cadastradas
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ativas}</div>
            <p className="text-xs text-muted-foreground">
              Em atendimento
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aguardando</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.aguardando}</div>
            <p className="text-xs text-muted-foreground">
              Lista de espera
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.inativas}</div>
            <p className="text-xs text-muted-foreground">
              Não participando
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>

        {/* Table */}
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Beneficiária</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Data Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentBeneficiarias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchTerm ? 'Nenhuma beneficiária encontrada' : 'Nenhuma beneficiária cadastrada'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                currentBeneficiarias.map((beneficiaria) => (
                  <TableRow key={beneficiaria.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {getInitials(beneficiaria.nome)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{beneficiaria.nome}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {beneficiaria.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{beneficiaria.cpf}</TableCell>
                    <TableCell>{beneficiaria.telefone || '-'}</TableCell>
                    <TableCell>{formatDate(beneficiaria.created_at)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Ativa
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}/editar`)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => navigate(`/beneficiarias/${beneficiaria.id}/paedi`)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Formulários
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredBeneficiarias.length)} de{" "}
                {filteredBeneficiarias.length} resultados
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
