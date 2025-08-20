"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableSimple } from "../data-table/DataTableSimple"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Play, Square, CheckCircle, Tag, DollarSign, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { useAdminRifas } from "@/hooks/use-admin-rifas"

// Tipos
import type { AdminRifa } from "@/lib/database/admin_database/rifas"

// Columnas de la tabla
export const rifasColumns: ColumnDef<AdminRifa>[] = [
  {
    accessorKey: "titulo",
    header: "Título",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("titulo")}</div>
    ),
  },
  {
    accessorKey: "precio_ticket",
    header: "Precio Ticket",
    cell: ({ row }) => {
      const precio = parseFloat(row.getValue("precio_ticket"))
      return (
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{formatCurrency(precio)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "total_tickets",
    header: "Total Tickets",
    cell: ({ row }) => {
      const total = row.getValue("total_tickets") as number
      return (
        <div className="text-center font-medium">
          {total.toLocaleString()}
        </div>
      )
    },
  },
  {
    accessorKey: "tickets_disponibles",
    header: "Tickets Disponibles",
    cell: ({ row }) => {
      const disponibles = row.getValue("tickets_disponibles") as number
      const total = row.getValue("total_tickets") as number
      const porcentaje = total > 0 ? (disponibles / total) * 100 : 0
      
      return (
        <div className="text-center">
          <div className="font-medium">{disponibles}</div>
          <div className="text-xs text-muted-foreground">de {total}</div>
          <div className="w-full bg-secondary rounded-full h-1 mt-1">
            <div 
              className="bg-primary h-1 rounded-full transition-all duration-300"
              style={{ width: `${porcentaje}%` }}
            />
          </div>
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
          case 'activa':
            return { variant: 'default', label: 'Activa', icon: Play }
          case 'cerrada':
            return { variant: 'secondary', label: 'Cerrada', icon: Square }
          case 'finalizada':
            return { variant: 'outline', label: 'Finalizada', icon: CheckCircle }
          default:
            return { variant: 'secondary', label: estado, icon: Square }
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
    accessorKey: "categoria",
    header: "Categoría",
    cell: ({ row }) => {
      const categoria = row.getValue("categoria") as string
      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <Badge variant="outline" className="text-xs">
            {categoria || 'Sin categoría'}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: "fecha_creacion",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fecha_creacion"))
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{fecha.toLocaleDateString('es-ES')}</span>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => {
      const rifa = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver rifa:", rifa.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar rifa:", rifa.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Duplicar rifa:", rifa.id)}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
            {rifa.estado === 'activa' && (
              <DropdownMenuItem onClick={() => console.log("Cerrar rifa:", rifa.id)}>
                <Square className="mr-2 h-4 w-4" />
                Cerrar
              </DropdownMenuItem>
            )}
            {rifa.estado === 'cerrada' && (
              <DropdownMenuItem onClick={() => console.log("Activar rifa:", rifa.id)}>
                <Play className="mr-2 h-4 w-4" />
                Activar
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar rifa:", rifa.id)}
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
interface RifasTableProps {
  onCreate?: () => void
  onEdit?: (rifa: AdminRifa) => void
  onDelete?: (rifas: AdminRifa[]) => void
  onView?: (rifa: AdminRifa) => void
  onExport?: (rifas: AdminRifa[]) => void
}

// Componente principal
export function RifasTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: RifasTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<AdminRifa[]>([])

  // Hook personalizado para gestionar rifas
  const {
    rifas,
    totalRifas,
    isLoading,
    isRefreshing,
    error,
    refreshRifas,
    createRifa,
    updateRifa,
    changeRifaState
  } = useAdminRifas({
    incluirCerradas: true,
    incluirInactivas: true,
    ordenarPor: 'fecha_creacion',
    orden: 'desc'
  })

  // Función para manejar la exportación
  const handleExport = () => {
    if (onExport && selectedRows.length > 0) {
      onExport(selectedRows)
    }
  }

  // Función para manejar el refresco
  const handleRefresh = () => {
    refreshRifas()
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rifas</h2>
          <p className="text-muted-foreground">
            Gestiona todas las rifas del sistema ({totalRifas} total)
          </p>
          {error && (
            <p className="text-sm text-red-600 mt-1">
              Error: {error}
            </p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              Crear Rifa
            </Button>
          )}
          {onExport && selectedRows.length > 0 && (
            <Button variant="outline" onClick={handleExport}>
              Exportar ({selectedRows.length})
            </Button>
          )}
        </div>
      </div>

      {/* Tabla mejorada */}
      <DataTableSimple
        columns={rifasColumns}
        data={rifas}
        searchKey="titulo"
        searchPlaceholder="Buscar rifas..."
        pageSize={10}
        showPagination={true}
        showSearch={true}
        loading={isLoading || isRefreshing}
        onRefresh={handleRefresh}
        onExport={handleExport}
        exportDisabled={selectedRows.length === 0}
        emptyState={
          <div className="text-center py-8">
            <div className="text-muted-foreground mb-2">No se encontraron rifas</div>
            <Button onClick={onCreate} variant="outline" size="sm">
              Crear primera rifa
            </Button>
          </div>
        }
      />
    </div>
  )
}
