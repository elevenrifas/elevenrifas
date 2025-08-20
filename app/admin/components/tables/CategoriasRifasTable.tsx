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
import { MoreHorizontal, Edit, Trash2, Eye, Plus, Tag } from "lucide-react"

// Tipos
interface Categoria {
  id: string
  nombre: string
  descripcion?: string
  color?: string
  icono?: string
  activa: boolean
  fecha_creacion: string
  rifas_count?: number
}

// Columnas de la tabla
export const categoriasColumns: ColumnDef<Categoria>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Tag className="h-4 w-4 text-muted-foreground" />
        <div className="font-medium">{row.getValue("nombre")}</div>
      </div>
    ),
  },
  {
    accessorKey: "descripcion",
    header: "Descripción",
    cell: ({ row }) => {
      const descripcion = row.getValue("descripcion") as string
      return (
        <div className="max-w-[200px] truncate text-sm text-muted-foreground">
          {descripcion || "Sin descripción"}
        </div>
      )
    },
  },
  {
    accessorKey: "rifas_count",
    header: "Rifas",
    cell: ({ row }) => {
      const count = row.getValue("rifas_count") as number || 0
      return (
        <Badge variant="secondary" className="text-xs">
          {count} rifa{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  {
    accessorKey: "activa",
    header: "Estado",
    cell: ({ row }) => {
      const activa = row.getValue("activa") as boolean
      return (
        <Badge variant={activa ? "default" : "secondary"}>
          {activa ? "Activa" : "Inactiva"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "fecha_creacion",
    header: "Fecha Creación",
    cell: ({ row }) => {
      const fecha = new Date(row.getValue("fecha_creacion"))
      return fecha.toLocaleDateString('es-ES')
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const categoria = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver categoría:", categoria.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar categoría:", categoria.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar categoría:", categoria.id)}
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
interface CategoriasRifasTableProps {
  data: Categoria[]
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (categoria: Categoria) => void
  onDelete?: (categorias: Categoria[]) => void
  onView?: (categoria: Categoria) => void
  onExport?: (categorias: Categoria[]) => void
}

// Componente principal
export function CategoriasRifasTable({
  data,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: CategoriasRifasTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Categoria[]>([])

  const handleRowSelectionChange = (rows: Categoria[]) => {
    setSelectedRows(rows)
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categorías</h2>
          <p className="text-muted-foreground">
            Gestiona las categorías para organizar las rifas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
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
        columns={categoriasColumns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar categorías..."
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
