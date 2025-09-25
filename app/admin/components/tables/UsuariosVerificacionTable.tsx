"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createCRUDTable } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  User, 
  Shield, 
  ShieldOff, 
  CheckCircle, 
  Key,
  Calendar,
  UserX
} from "lucide-react"
import { useCrudUsuariosVerificacion } from "@/hooks/use-crud-usuarios-verificacion"
import type { AdminUsuarioVerificacion } from "@/lib/database/admin_database/usuarios_verificacion"
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal"
import { UsuarioVerificacionFormModal } from "../modals/UsuarioVerificacionFormModal"

// =====================================================
// 🎯 TABLA USUARIOS VERIFICACION - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar usuarios de verificación
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface UsuariosVerificacionTableProps {
  onCreate?: () => void
  onEdit?: (usuario: AdminUsuarioVerificacion) => void
  onDelete?: (usuarios: AdminUsuarioVerificacion[]) => void
  onView?: (usuario: AdminUsuarioVerificacion) => void
  onExport?: (usuarios: AdminUsuarioVerificacion[]) => void
}

// Componente principal
export function UsuariosVerificacionTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: UsuariosVerificacionTableProps) {
  // Hook CRUD personalizado para gestionar usuarios de verificación
  const {
    // Estado de los datos
    usuarios,
    totalUsuarios,
    isLoading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isCreating,
    isUpdating,
    isDeleting,
    
    // Estados de modales
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    
    // Datos seleccionados
    selectedUsuario,
    selectedUsuarios,
    
    // Operaciones CRUD
    createUsuario,
    updateUsuario,
    deleteUsuario,
    deleteMultipleUsuarios,
    toggleUsuarioEstado,
    
    // Operaciones de UI
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
    
    // Selección
    selectUsuario,
    selectMultipleUsuarios,
    clearSelection,
    toggleUsuarioSelection,
    
    // Utilidades
    refreshUsuarios,
    exportUsuarios,
    getUsuariosActivos
  } = useCrudUsuariosVerificacion({
    initialSort: { field: 'fecha_creacion', direction: 'desc' }
  })

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      const dataToExport = selectedUsuarios.length > 0 ? selectedUsuarios : usuarios
      
      if (onExport) {
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} usuarios (callback personalizado)`)
      } else {
        exportUsuarios(dataToExport)
        console.log(`📊 Exportando ${dataToExport.length} usuarios a CSV`)
      }
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  // Función para manejar el refresh
  const handleRefresh = () => {
    refreshUsuarios()
  }

  // Funciones wrapper para las acciones de las columnas
  const handleEditUsuario = (usuario: AdminUsuarioVerificacion) => {
    openEditModal(usuario)
  }



  const handleDeleteUsuario = (usuario: AdminUsuarioVerificacion) => {
    openDeleteModal(usuario)
  }

  const handleToggleEstado = async (usuario: AdminUsuarioVerificacion) => {
    try {
      await toggleUsuarioEstado(usuario.id)
    } catch (error) {
      console.error('Error al cambiar estado:', error)
    }
  }

  // Función para manejar la creación
  const handleCreate = async (data: any) => {
    try {
      const result = await createUsuario(data)
      if (result.success) {
        await refreshUsuarios()
      }
      return result
    } catch (error) {
      console.error('Error en handleCreate:', error)
      return { success: false, error: 'Error inesperado al crear' }
    }
  }

  // Función para manejar la edición
  const handleEdit = async (data: any) => {
    if (selectedUsuario) {
      try {
        // Si no se proporciona un nuevo PIN, no incluirlo en la actualización
        const datosActualizados: any = { ...data }
        if (!data.pin || data.pin === '') {
          delete datosActualizados.pin
        }
        
        const result = await updateUsuario(selectedUsuario.id, datosActualizados)
        if (result.success) {
          closeEditModal()
          await refreshUsuarios()
        }
        return result
      } catch (error) {
        console.error('Error en handleEdit:', error)
        return { success: false, error: 'Error inesperado al editar' }
      }
    }
    return { success: false, error: 'No hay usuario seleccionado' }
  }

  // Función para manejar la eliminación
  const handleDelete = async () => {
    if (selectedUsuario) {
      const result = await deleteUsuario(selectedUsuario.id)
      return result
    }
    return { success: false, error: 'No hay usuario seleccionado' }
  }

  // Función para manejar la eliminación múltiple
  const handleDeleteMultiple = async () => {
    if (selectedUsuarios.length > 0) {
      const ids = selectedUsuarios.map(usuario => usuario.id)
      const result = await deleteMultipleUsuarios(ids)
      return result
    }
    return { success: false, error: 'No hay usuarios seleccionados' }
  }

  // Definir las columnas dentro del componente para tener acceso a las funciones
  const usuariosColumns: ColumnDef<AdminUsuarioVerificacion>[] = [
    {
      accessorKey: "usuario",
      header: "Usuario",
      cell: ({ row }) => {
        const usuario = row.original
        const esActivo = usuario.activo
        
        return (
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${esActivo ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <User className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium">{usuario.usuario}</div>
              <div className="text-xs text-muted-foreground">
                ID: {usuario.id.substring(0, 8)}...
              </div>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "pin",
      header: "PIN",
      cell: ({ row }) => {
        const pin = row.getValue("pin") as number
        
        return (
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-blue-600" />
            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
              {"••••"}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "activo",
      header: "Estado",
      cell: ({ row }) => {
        const activo = row.getValue("activo") as boolean
        
        return (
          <Badge 
            variant={activo ? "default" : "secondary"} 
            className="flex items-center gap-1"
          >
            {activo ? (
              <>
                <CheckCircle className="h-3 w-3" />
                Activo
              </>
            ) : (
              <>
                <UserX className="h-3 w-3" />
                Inactivo
              </>
            )}
          </Badge>
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
            <div className="text-sm">
              {fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              })}
            </div>
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

              <DropdownMenuItem onClick={() => handleEditUsuario(usuario)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleToggleEstado(usuario)}>
                {usuario.activo ? (
                  <>
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteUsuario(usuario)}
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

  // El loading se maneja en la página principal con skeleton

  // Mostrar error si existe
  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            Error: {error}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: usuariosColumns,
        data: usuarios,
        title: "Usuarios de Verificación",
        description: "Gestiona todos los usuarios con acceso de verificación por PIN",
        searchKey: "usuario",
        searchPlaceholder: "Buscar usuarios...",
        loading: isLoading || isRefreshing,
        error: error,
        onRowSelectionChange: selectMultipleUsuarios,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: openCreateModal
      })}

      {/* Modales del CRUD */}
      
      {/* Modal de Crear/Editar Usuario */}
      <UsuarioVerificacionFormModal
        isOpen={showCreateModal || showEditModal}
        onClose={showCreateModal ? closeCreateModal : closeEditModal}
        onSubmit={showCreateModal ? handleCreate : handleEdit}
        usuario={showEditModal ? selectedUsuario : null}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={selectedUsuarios.length > 1 ? handleDeleteMultiple : handleDelete}
        title={selectedUsuarios.length > 1 ? "Eliminar Múltiples Usuarios" : "Eliminar Usuario"}
        description={
          selectedUsuarios.length > 1 
            ? `¿Estás seguro de que quieres eliminar ${selectedUsuarios.length} usuarios seleccionados? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar el usuario "${selectedUsuario?.usuario}"? Esta acción no se puede deshacer.`
        }
        entityName="usuario de verificación"
        isDeleting={isDeleting}
      />
    </div>
  )
}
