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
import { MoreHorizontal, Edit, Trash2, Eye, Plus, User, Shield, Crown } from "lucide-react"

// Tipos
interface Profile {
  id: string
  email: string
  role: 'admin' | 'user' | 'moderator'
  nombre?: string
  telefono?: string
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string
  permisos?: string[]
}

// Columnas de la tabla
export const profilesColumns: ColumnDef<Profile>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <User className="h-4 w-4 text-muted-foreground" />
        <div className="font-medium">{row.getValue("email")}</div>
      </div>
    ),
  },
  {
    accessorKey: "nombre",
    header: "Nombre",
    cell: ({ row }) => {
      const nombre = row.getValue("nombre") as string
      return (
        <div className="text-sm">
          {nombre || 'Sin nombre'}
        </div>
      )
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.getValue("role") as string
      const getRoleConfig = (role: string) => {
        switch (role) {
          case 'admin':
            return { variant: 'destructive', label: 'Administrador', icon: Crown }
          case 'moderator':
            return { variant: 'default', label: 'Moderador', icon: Shield }
          case 'user':
            return { variant: 'secondary', label: 'Usuario', icon: User }
          default:
            return { variant: 'secondary', label: role, icon: User }
        }
      }
      
      const config = getRoleConfig(role)
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
    accessorKey: "ultimo_acceso",
    header: "Último Acceso",
    cell: ({ row }) => {
      const fecha = row.getValue("ultimo_acceso") as string
      if (!fecha) return <span className="text-muted-foreground">Nunca</span>
      return new Date(fecha).toLocaleDateString('es-ES')
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
      const profile = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => console.log("Ver perfil:", profile.id)}>
              <Eye className="mr-2 h-4 w-4" />
              Ver
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Editar perfil:", profile.id)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log("Cambiar rol:", profile.id)}>
              <Shield className="mr-2 h-4 w-4" />
              Cambiar Rol
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => console.log("Eliminar perfil:", profile.id)}
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
interface ProfilesTableProps {
  data: Profile[]
  isLoading?: boolean
  onCreate?: () => void
  onEdit?: (profile: Profile) => void
  onDelete?: (profiles: Profile[]) => void
  onView?: (profile: Profile) => void
  onExport?: (profiles: Profile[]) => void
}

// Componente principal
export function ProfilesTable({
  data,
  isLoading = false,
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: ProfilesTableProps) {
  const [selectedRows, setSelectedRows] = React.useState<Profile[]>([])

  const handleRowSelectionChange = (rows: Profile[]) => {
    setSelectedRows(rows)
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Perfiles</h2>
          <p className="text-muted-foreground">
            Gestiona los perfiles y roles de usuarios
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onCreate && (
            <Button onClick={onCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Perfil
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
        columns={profilesColumns}
        data={data}
        searchKey="email"
        searchPlaceholder="Buscar perfiles..."
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
