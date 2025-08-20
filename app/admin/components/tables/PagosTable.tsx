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
import { MoreHorizontal, Edit, Trash2, Eye, Plus, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"

// Tipos
interface Pago {
  id: string
  usuario_id: string
  rifa_id: string
  monto: number
  moneda: string
  metodo_pago: string
  estado: 'pendiente' | 'aprobado' | 'rechazado'
  referencia?: string
  fecha_creacion: string
  fecha_actualizacion?: string
  notas?: string
  usuario?: {
    nombre?: string
    correo?: string
  }
  rifa?: {
    titulo?: string
  }
}

// Columnas de la tabla
export const pagosColumns: ColumnDef<Pago>[] = [
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
    accessorKey: "monto",
    header: "Monto",
    cell: ({ row }) => {
      const monto = parseFloat(row.getValue("monto"))
      const moneda = row.getValue("moneda") as string
      return (
        <div className="font-medium">
          {formatCurrency(monto, moneda)}
        </div>
      )
    },
  },
  {
    accessorKey: "metodo_pago",
    header: "Método",
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
    accessorKey: "estado",
    header: "Estado",
    cell: ({ row }) => {
      const estado = row.getValue("estado") as string
      const getEstadoConfig = (estado: string) => {
        switch (estado) {
          case 'pendiente':
            return { variant: 'secondary', label: 'Pendiente', icon: Clock }
          case 'aprobado':
            return { variant: 'default', label: 'Aprobado', icon: CheckCircle }
          case 'rechazado':
            return { variant: 'destructive', label: 'Rechazado', icon: XCircle }
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
    accessorKey: "fecha_creacion",
    header: "Fecha",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fecha_creacion"))
      return fecha.toLocaleDateString('es-ES')
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const pago = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver pago:", pago.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar pago:", pago.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            {pago.estado === 'pendiente' && (
              <DropdownMenuItem onClick={() => console.log("Aprobar pago:", pago.id)}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Aprobar
              </DropdownMenuItem>
            )}
            {pago.estado === 'pendiente' && (
              <DropdownMenuItem onClick={() => console.log("Rechazar pago:", pago.id)}>
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar pago:", pago.id)}
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
interface PagosTableProps {
  data: Pago[]
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (pago: Pago) => void
  onDelete?: (pagos: Pago[]) => void
  onView?: (pago: Pago) => void
  onExport?: (pagos: Pago[]) => void
}

// Componente principal
export function PagosTable({
  data,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: PagosTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Pago[]>([])

  const handleRowSelectionChange = (rows: Pago[]) => {
    setSelectedRows(rows)
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pagos</h2>
          <p className="text-muted-foreground">
            Gestiona todos los pagos del sistema
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Pago
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
        columns={pagosColumns}
        data={data}
        searchKey="usuario.nombre"
        searchPlaceholder="Buscar pagos..."
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
