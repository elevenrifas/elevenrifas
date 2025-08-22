"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTableEnhanced, createCRUDTable } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Copy, Play, Square, CheckCircle, Tag, DollarSign, Calendar } from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { useCrudRifas } from "@/hooks/use-crud-rifas"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"
import { RifaFormModal } from "../modals/RifaFormModal"
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal"
import { RifaViewModal } from "../modals/RifaViewModal"
import { DuplicateRifaModal } from "../modals/DuplicateRifaModal"

// =====================================================
// 🎯 TABLA RIFAS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar rifas
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

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
  // Hook CRUD personalizado para gestionar rifas
  const {
    // Estado de los datos
    rifas,
    totalRifas,
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
    showDuplicateModal,
    
    // Datos seleccionados
    selectedRifa,
    selectedRifas,
    
    // Operaciones CRUD
    createRifa,
    updateRifa,
    deleteRifa,
    deleteMultipleRifas,
    changeRifaState,
    
    // Operaciones de UI
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
    openDuplicateModal,
    closeDuplicateModal,
    
    // Selección
    selectRifa,
    selectMultipleRifas,
    clearSelection,
    toggleRifaSelection,
    
    // Utilidades
    refreshRifas,
    exportRifas
  } = useCrudRifas({
    initialFilters: {},
    initialSort: { field: 'fecha_creacion', direction: 'desc' },
    initialPageSize: 10
  })

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedRifas.length > 0 ? selectedRifas : rifas
      
      // Validar que los datos tengan la estructura correcta según el nuevo schema
      const datosValidados = dataToExport.map(rifa => ({
        id: rifa.id || '',
        titulo: rifa.titulo || '',
        descripcion: rifa.descripcion || '',
        precio_ticket: rifa.precio_ticket || 0,
        imagen_url: rifa.imagen_url || '',
        estado: rifa.estado || 'activa',
        fecha_creacion: rifa.fecha_creacion || '',
        fecha_cierre: rifa.fecha_cierre || '',
        total_tickets: rifa.total_tickets || 0,
        tickets_disponibles: rifa.tickets_disponibles || 0,
        condiciones: rifa.condiciones || '',
        categoria_id: rifa.categoria_id || '',
        numero_tickets_comprar: rifa.numero_tickets_comprar || [1, 2, 3, 5, 10]
      }))
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(datosValidados)
        console.log(`🔄 Exportando ${datosValidados.length} rifas (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(datosValidados, 'rifas')
        console.log(`📊 Exportando ${datosValidados.length} rifas a CSV`)
      }
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  // Función para exportar a CSV
  const exportToCSV = (data: any[], filename: string) => {
    try {
      // Crear headers del CSV
      const headers = [
        'ID',
        'Título',
        'Descripción',
        'Precio Ticket',
        'Estado',
        'Total Tickets',
        'Tickets Disponibles',
        'Fecha Creación',
        'Fecha Cierre',
        'Categoría ID'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(rifa => [
          rifa.id,
          `"${rifa.titulo}"`, // Comillas para evitar problemas con comas
          `"${rifa.descripcion}"`,
          rifa.precio_ticket,
          rifa.estado,
          rifa.total_tickets,
          rifa.tickets_disponibles,
          rifa.fecha_creacion,
          rifa.fecha_cierre,
          rifa.categoria_id
        ].join(','))
      ]
      
      // Crear contenido CSV
      const csvContent = csvRows.join('\n')
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Archivo CSV descargado exitosamente')
    } catch (error) {
      console.error('Error al exportar a CSV:', error)
    }
  }

  // Función para manejar el refresh
  const handleRefresh = () => {
    refreshRifas()
  }

  // Funciones wrapper para las acciones de las columnas
  const handleViewRifa = (rifa: AdminRifa) => {
    openViewModal(rifa)
  }

  const handleEditRifa = (rifa: AdminRifa) => {
    openEditModal(rifa)
  }

  const handleDuplicateRifa = (rifa: AdminRifa) => {
    openDuplicateModal(rifa)
  }

  const handleDeleteRifa = (rifa: AdminRifa) => {
    openDeleteModal(rifa)
  }

  // Función para manejar la creación
  const handleCreate = async (data: any) => {
    try {
      const result = await createRifa(data)
      if (result.success) {
        // Refrescar la lista después de crear
        await refreshRifas()
      }
      return result
    } catch (error) {
      console.error('Error en handleCreate:', error)
      return { success: false, error: 'Error inesperado al crear' }
    }
  }

  // Función para manejar la edición
  const handleEdit = async (data: any) => {
    if (selectedRifa) {
      try {
        const result = await updateRifa(selectedRifa.id, data)
        if (result.success) {
          // Cerrar el modal de edición
          closeEditModal()
          // Refrescar la lista
          await refreshRifas()
        }
        return result
      } catch (error) {
        console.error('Error en handleEdit:', error)
        return { success: false, error: 'Error inesperado al editar' }
      }
    }
    return { success: false, error: 'No hay rifa seleccionada' }
  }

  // Función para manejar la eliminación
  const handleDelete = async () => {
    if (selectedRifa) {
      const result = await deleteRifa(selectedRifa.id)
      if (!result.success) {
        console.error('Error al eliminar:', result.error)
      }
    }
  }

  // Función para manejar la eliminación múltiple
  const handleDeleteMultiple = async () => {
    if (selectedRifas.length > 0) {
      const ids = selectedRifas.map(rifa => rifa.id)
      const result = await deleteMultipleRifas(ids)
      if (!result.success) {
        console.error('Error al eliminar múltiples:', result.error)
      }
    }
  }

  // Definir las columnas dentro del componente para tener acceso a las funciones
  const rifasColumns: ColumnDef<AdminRifa>[] = [
    {
      accessorKey: "titulo",
      header: "Título",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("titulo")}</div>
      ),
    },
    {
      accessorKey: "descripcion",
      header: "Descripción",
      cell: ({ row }) => {
        const descripcion = row.getValue("descripcion") as string
        return (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
            {descripcion || 'Sin descripción'}
          </div>
        )
      },
    },
    {
      accessorKey: "precio_ticket",
      header: "Precio Ticket",
      cell: ({ row }) => {
        const precio = parseFloat(row.getValue("precio_ticket"))
        return (
          <div className="font-medium text-green-600">
            {formatCurrency(precio)}
          </div>
        )
      },
    },
    {
      accessorKey: "total_tickets",
      header: "Total Tickets",
      cell: ({ row }) => {
        try {
          const total = row.getValue("total_tickets") as number || 0
          return (
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs font-mono">
                {total}
              </Badge>
            </div>
          )
        } catch (error) {
          console.warn('Error al renderizar total_tickets:', error)
          return (
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs font-mono">
                0
              </Badge>
            </div>
          )
        }
      },
    },
    {
      accessorKey: "tickets_disponibles",
      header: "Tickets Disponibles",
      cell: ({ row }) => {
        try {
          const disponibles = row.getValue("tickets_disponibles") as number || 0
          return (
            <div className="flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-mono">
                {disponibles}
              </Badge>
            </div>
          )
        } catch (error) {
          console.warn('Error al renderizar tickets_disponibles:', error)
          return (
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs font-mono">
                0
              </Badge>
            </div>
          )
        }
      },
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string
        const getEstadoVariant = (estado: string) => {
          switch (estado) {
            case 'activa':
              return 'default'
            case 'cerrada':
              return 'secondary'
            case 'finalizada':
              return 'destructive'
            default:
              return 'outline'
          }
        }
        
        const getEstadoIcon = (estado: string) => {
          switch (estado) {
            case 'activa':
              return <Play className="h-3 w-3" />
            case 'cerrada':
              return <Square className="h-3 w-3" />
            case 'finalizada':
              return <CheckCircle className="h-3 w-3" />
            default:
              return <Tag className="h-3 w-3" />
          }
        }
        
        return (
          <Badge variant={getEstadoVariant(estado)} className="flex items-center gap-1">
            {getEstadoIcon(estado)}
            {estado.charAt(0).toUpperCase() + estado.slice(1)}
          </Badge>
        )
      },
    },
    {
      accessorKey: "categoria_id",
      header: "Categoría",
      cell: ({ row }) => {
        const categoriaId = row.getValue("categoria_id") as string
        return (
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{categoriaId ? `ID: ${categoriaId.slice(0, 8)}...` : 'Sin categoría'}</span>
          </div>
        )
      },
    },

    {
      accessorKey: "fecha_cierre",
      header: "Fecha Cierre",
      cell: ({ row }) => {
        const fecha = row.getValue("fecha_cierre") as string
        return (
          <div className="text-sm text-muted-foreground">
            {fecha ? new Date(fecha).toLocaleDateString('es-ES') : 'Sin fecha de cierre'}
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
            <span className="text-sm">
              {fecha.toLocaleDateString('es-ES', {
                year: 'numeric',
                day: 'numeric'
              })}
            </span>
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
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
              <DropdownMenuItem onClick={() => handleViewRifa(rifa)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEditRifa(rifa)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicateRifa(rifa)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleDeleteRifa(rifa)}
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

  // Estado de carga
  if (isLoading && !rifas.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Cargando rifas...</p>
          </div>
        </div>
      </div>
    )
  }

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
        columns: rifasColumns,
        data: rifas,
        title: "Rifas",
        description: "Gestiona todas las rifas del sistema",
        searchKey: "titulo",
        searchPlaceholder: "Buscar rifas...",
        loading: isLoading || isRefreshing,
        error: error,
        onRowSelectionChange: selectMultipleRifas,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: openCreateModal
      })}

      {/* Modales del CRUD */}
      
      {/* Modal de Crear/Editar Rifa */}
      <RifaFormModal
        isOpen={showCreateModal || showEditModal}
        onClose={showCreateModal ? closeCreateModal : closeEditModal}
        onSubmit={showCreateModal ? handleCreate : handleEdit}
        rifa={showEditModal ? selectedRifa : null}
        isSubmitting={isCreating || isUpdating}
      />

      {/* Modal de Duplicación */}
      <DuplicateRifaModal
        isOpen={showDuplicateModal}
        onClose={closeDuplicateModal}
        onSubmit={handleCreate}
        rifa={selectedRifa}
        isSubmitting={isCreating}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={selectedRifas.length > 1 ? handleDeleteMultiple : handleDelete}
        title={selectedRifas.length > 1 ? "Eliminar Múltiples Rifas" : "Eliminar Rifa"}
        description={
          selectedRifas.length > 1 
            ? `¿Estás seguro de que quieres eliminar ${selectedRifas.length} rifas seleccionadas? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar la rifa "${selectedRifa?.titulo}"? Esta acción no se puede deshacer.`
        }
        entityName="rifa"
        isDeleting={isDeleting}
      />

      {/* Modal de Vista de Detalles */}
      <RifaViewModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        rifa={selectedRifa}
        onEdit={() => selectedRifa && openEditModal(selectedRifa)}
        onDelete={() => selectedRifa && openDeleteModal(selectedRifa)}
      />
    </div>
  )
}
