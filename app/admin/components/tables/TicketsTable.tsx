"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Plus, Ticket, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"

// Tipos
interface Ticket {
  id: string
  numero: string
  rifa_id: string
  usuario_id: string
  precio: number
  estado: 'activo' | 'usado' | 'cancelado'
  fecha_compra: string
  fecha_uso?: string
  metodo_pago: string
  usuario?: {
    nombre?: string
    correo?: string
  }
  rifa?: {
    titulo?: string
  }
}

// Columnas de la tabla
export const ticketsColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Ticket className="h-4 w-4 text-muted-foreground" />
        <div className="font-mono font-medium">{row.getValue("numero")}</div>
      </div>
    ),
  },
  {
    accessorKey: "usuario",
    header: "Usuario",
    cell: ({ row }) => {
      const usuario = row.getValue("usuario") as any
      return (
        <div className="flex flex-col">
          <div className="font-medium">{usuario?.nombre || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">{usuario?.correo || 'N/A'}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "rifa",
    header: "Rifa",
    cell: ({ row }) => {
      const rifa = row.getValue("rifa") as any
      return (
        <div className="max-w-[200px] truncate text-sm">
          {rifa?.titulo || 'N/A'}
        </div>
      )
    },
  },
  {
    accessorKey: "precio",
    header: "Precio",
    cell: ({ row }) => {
      const precio = parseFloat(row.getValue("precio"))
      return (
        <div className="font-medium">
          {formatCurrency(precio)}
        </div>
      )
    },
  },
  {
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string
      const getEstadoConfig = (estado: string) => {
        switch (estado) {
          case 'activo':
            return { variant: 'default', label: 'Activo', icon: Ticket }
          case 'usado':
            return { variant: 'secondary', label: 'Usado', icon: CheckCircle }
          case 'cancelado':
            return { variant: 'destructive', label: 'Cancelado', icon: XCircle }
          default:
            return { variant: 'secondary', label: estado, icon: Clock }
        }
      }
      
      const config = getEstadoConfig(estado)
      const Icon = config.icon
      
      return (
        <Badge variant={config.variant as any} className="flex items-center gap-1">
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      )
    },
  },
  {
    accessorKey: "metodo_pago",
    header: "Método Pago",
    cell: ({ row }) => {
      const metodo = row.getValue("metodo_pago") as string
      return (
        <Badge variant="outline" className="text-xs">
          {metodo}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fecha_compra",
    header: "Fecha Compra",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fecha_compra"))
      return fecha.toLocaleDateString('es-ES')
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const ticket = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver ticket:", ticket.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar ticket:", ticket.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {ticket.estado === 'activo' && (
              <DropdownMenuItem onClick={() => console.log("Marcar como usado:", ticket.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Marcar Usado
              </DropdownMenuItem>
            )}
            {ticket.estado === 'activo' && (
              <DropdownMenuItem onClick={() => console.log("Cancelar ticket:", ticket.id)}>
                <XCircle className="mr-2 h-4 w-4" />
                Cancelar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar ticket:", ticket.id)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

// Props del componente
interface TicketsTableProps {
  data: Ticket[]
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (ticket: Ticket) => void
  onDelete?: (tickets: Ticket[]) => void
  onView?: (ticket: Ticket) => void
  onExport?: (tickets: Ticket[]) => void
}

// Componente principal
export function TicketsTable({
  data,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: TicketsTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Ticket[]>([])

  const handleRowSelectionChange = (rows: Ticket[]) => {
    setSelectedRows(rows)
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tickets</h2>
          <p className="text-muted-foreground">
            Gestiona todos los tickets vendidos
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Ticket
            </Button>
          )}
          {onExport && selectedRows.length > 0 && (
            <Button variant="outline" onClick={() => onExport(selectedRows)}>
              Exportar ({selectedRows.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabla */}
      <DataTable
        columns={ticketsColumns}
        data={data}
        searchKey="numero"
        searchPlaceholder="Buscar tickets..."
        pageSize={10}
        showPagination={true}
        showToolbar={true}
        showSearch={true}
        showColumnToggle={true}
        showRowSelection={true}
        onRowSelectionChange={handleRowSelectionChange}
      />
    </div>
  )
}
