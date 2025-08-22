"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "../data-table/DataTable"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Plus, User, Mail, Phone, Calendar } from "lucide-react"

// Tipos
interface Usuario {
  id: string
  nombre?: string
  correo?: string
  telefono?: string
  creado_el?: string
  ultimo_acceso?: string
  activo?: boolean
  rifas_compradas?: number
  tickets_activos?: number
}

// Columnas de la tabla
export const usuariosColumns: ColumnDef<Usuario>[] = [
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div className="font-medium">{row.getValue("nombre") || 'Sin nombre'}</div>
      </div>
    ),
  },
  {
    accessorKey: "correo",
    header: "Correo",
    cell: ({ row }) => {
      const correo = row.getValue("correo") as string
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{correo || 'N/A'}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "telefono",
    header: "Teléfono",
    cell: ({ row }) => {
      const telefono = row.getValue("telefono") as string
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{telefono || 'N/A'}</div>
        </div>
      )
    },
  },
  {
    accessorKey: "rifas_compradas",
    header: "Rifas",
    cell: ({ row }) => {
      const count = row.getValue("rifas_compradas") as number || 0
      return (
        <Badge variant="outline" className="text-xs">
          {count} rifa{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  {
    accessorKey: "tickets_activos",
    header: "Tickets",
    cell: ({ row }) => {
      const count = row.getValue("tickets_activos") as number || 0
      return (
        <Badge variant="secondary" className="text-xs">
          {count} ticket{count !== 1 ? 's' : ''}
        </Badge>
      )
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => {
      const activo = row.getValue("activo") as boolean
      return (
        <Badge variant={activo ? "default" : "secondary"}>
          {activo ? "Activo" : "Inactivo"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "creado_el",
    header: "Fecha Registro",
    cell: ({ row }) => {
      const fecha = row.getValue("creado_el") as string
      if (!fecha) return <span className="text-muted-foreground">N/A</span>
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <div className="text-sm">{new Date(fecha).toLocaleDateString('es-ES')}</div>
        </div>
      )
    },
  },
  {
    id: "actions",
    header: "Acciones",
    cell: ({ row }) => {
      const usuario = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver usuario:", usuario.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar usuario:", usuario.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Ver rifas:", usuario.id)}>
              <User className="mr-2 h-4 w-4" />
              Ver Rifas
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar usuario:", usuario.id)}
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
interface UsuariosTableProps {
  data: Usuario[]
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (usuario: Usuario) => void
  onDelete?: (usuarios: Usuario[]) => void
  onView?: (usuario: Usuario) => void
  onExport?: (usuarios: Usuario[]) => void
}

// Componente principal
export function UsuariosTable({
  data,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: UsuariosTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Usuario[]>([])

  const handleRowSelectionChange = (rows: Usuario[]) => {
    setSelectedRows(rows)
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuarios</h2>
          <p className="text-muted-foreground">
            Gestiona todos los usuarios registrados
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
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
        columns={usuariosColumns}
        data={data}
        searchKey="nombre"
        searchPlaceholder="Buscar usuarios..."
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
