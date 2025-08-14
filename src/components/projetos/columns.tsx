import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusMap: Record<string, { label: string; variant: "default" | "destructive" | "secondary" | "outline" }> = {
  em_andamento: { label: "Em andamento", variant: "default" },
  concluido: { label: "Concluído", variant: "outline" },
  cancelado: { label: "Cancelado", variant: "destructive" },
  pausado: { label: "Pausado", variant: "secondary" },
};

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "nome",
    header: "Nome",
  },
  {
    accessorKey: "descricao",
    header: "Descrição",
    cell: ({ row }) => {
      const description = row.getValue("descricao") as string;
      return description ? description.substring(0, 100) + (description.length > 100 ? "..." : "") : "-";
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusInfo = statusMap[status] || { label: status, variant: "default" };
      return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
    },
  },
  {
    accessorKey: "data_inicio",
    header: "Data de Início",
    cell: ({ row }) => {
      const date = row.getValue("data_inicio");
      if (!date) return "-";
      return format(new Date(date as string), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    },
  },
  {
    accessorKey: "data_fim",
    header: "Data de Término",
    cell: ({ row }) => {
      const date = row.getValue("data_fim");
      if (!date) return "-";
      return format(new Date(date as string), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const projeto = row.original;
      
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                const meta = table.options.meta as any;
                if (meta?.onUpdate) {
                  meta.onUpdate(projeto.id, projeto);
                }
              }}
            >
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                const meta = table.options.meta as any;
                if (meta?.onDelete) {
                  meta.onDelete(projeto.id);
                }
              }}
              className="text-red-600"
            >
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
