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
import { MoreHorizontal, Edit, Trash2, Copy, Play, Square, CheckCircle, Tag, DollarSign, Calendar, Ticket, Eye } from "lucide-react"
import * as LucideIcons from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { useCrudRifas } from "@/hooks/use-crud-rifas"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"
import { exportRifasToExcel } from "@/lib/utils/excel-export"
import { RifaFormModal } from "../modals/RifaFormModal"
import { RifaTicketsModal } from "../modals/RifaTicketsModal"
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal"
import { DuplicateRifaModal } from "../modals/DuplicateRifaModal"

// =====================================================
// 🎯 TABLA RIFAS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar rifas
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Función simple para obtener iconos de Lucide React
const getCategoryIcon = (iconName: string) => {
  // Convertir el nombre del icono a PascalCase (ej: "dollar-sign" -> "DollarSign")
  const pascalCaseName = iconName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join('');
  
  // Buscar el icono en la librería completa de Lucide
  const IconComponent = (LucideIcons as any)[pascalCaseName];
  
  // Si no se encuentra, devolver Tag como fallback
  return IconComponent || Tag;
};

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

  // Estado para el modal de tickets
  const [showTicketsModal, setShowTicketsModal] = React.useState(false)
  const [selectedRifaForTickets, setSelectedRifaForTickets] = React.useState<AdminRifa | null>(null)

  // Función para abrir el modal de tickets
  const handleViewTickets = (rifa: AdminRifa) => {
    setSelectedRifaForTickets(rifa)
    setShowTicketsModal(true)
  }

  // Función para cerrar el modal de tickets
  const handleCloseTicketsModal = () => {
    setShowTicketsModal(false)
    setSelectedRifaForTickets(null)
  }

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      console.log('🚀 [handleExport] Iniciando exportación...')
      console.log('🚀 [handleExport] selectedRifas:', selectedRifas.length)
      console.log('🚀 [handleExport] rifas totales:', rifas.length)
      console.log('🚀 [handleExport] onExport callback:', !!onExport)
      
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedRifas.length > 0 ? selectedRifas : rifas
      console.log('🚀 [handleExport] dataToExport:', dataToExport.length, 'elementos')
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        console.log('🔄 [handleExport] Usando callback personalizado')
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} rifas (callback personalizado)`)
      } else {
        // Exportación automática a Excel usando la función específica
        console.log('📊 [handleExport] Usando exportación automática a Excel')
        console.log('📊 [handleExport] Primer elemento:', dataToExport[0])
        exportRifasToExcel(dataToExport, 'rifas')
        console.log(`📊 Exportando ${dataToExport.length} rifas a Excel`)
      }
    } catch (error) {
      console.error('❌ [handleExport] Error al exportar:', error)
    }
  }


  // Función de fallback para exportar a CSV (mantener por compatibilidad)
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
  const handleEditRifa = (rifa: AdminRifa) => {
    openEditModal(rifa)
  }

  const handleDuplicateRifa = async (rifa: AdminRifa) => {
    try {
      // Crear una copia exacta de la rifa
      const rifaDuplicada: any = {
        titulo: `${rifa.titulo} (Copia)`,
        descripcion: rifa.descripcion || '',
        precio_ticket: rifa.precio_ticket,
        imagen_url: rifa.imagen_url || '',
                estado: 'cerrada', // Siempre cerrada por defecto
        total_tickets: rifa.total_tickets || 100,
        categoria_id: rifa.categoria_id || null,
        numero_tickets_comprar: rifa.numero_tickets_comprar || [1, 2, 3, 5, 10, 15, 20, 25, 50],
        progreso_manual: rifa.progreso_manual || null,
        fecha_cierre: new Date().toISOString(), // Fecha actual ya que está cerrada
      }
      
      const result = await createRifa(rifaDuplicada)
      if (result.success) {
        // Refrescar la lista después de duplicar
        await refreshRifas()
        // Cerrar el modal de duplicación
        closeDuplicateModal()
      }
      return result
    } catch (error) {
      console.error('Error en handleDuplicateRifa:', error)
      return { success: false, error: 'Error inesperado al duplicar' }
    }
  }

  const handleDeleteRifa = (rifa: AdminRifa) => {
    openDeleteModal(rifa)
  }

  // Función para manejar la creación
  const handleCreate = async (data: any) => {
    try {
      const nuevaRifa = {
        titulo: data.titulo,
        descripcion: data.descripcion,
        precio_ticket: data.precio_ticket,
        imagen_url: data.imagen_url,
        estado: data.estado,
        total_tickets: data.total_tickets,
        categoria_id: data.categoria_id,
        numero_tickets_comprar: data.numero_tickets_comprar || [1, 2, 3, 5, 10, 15, 20, 25, 50],
        progreso_manual: data.progreso_manual,
        fecha_cierre: data.fecha_cierre,
      }
      const result = await createRifa(nuevaRifa)
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
        console.log('🔍 Datos a enviar en handleEdit:', data)
        const datosActualizados = {
          titulo: data.titulo,
          descripcion: data.descripcion,
          precio_ticket: data.precio_ticket,
          imagen_url: data.imagen_url,
          estado: data.estado,
          total_tickets: data.total_tickets,
          categoria_id: data.categoria_id,
          numero_tickets_comprar: data.numero_tickets_comprar || [1, 2, 3, 5, 10, 15, 20, 25, 50],
          progreso_manual: data.progreso_manual,
          tasa: data.tasa,
          fecha_cierre: data.fecha_cierre,
        }
        const result = await updateRifa(selectedRifa.id, datosActualizados)
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
      // El resultado se maneja en el modal, no necesitamos hacer nada aquí
      return result
    }
    return { success: false, error: 'No hay rifa seleccionada' }
  }

  // Función para manejar la eliminación múltiple
  const handleDeleteMultiple = async () => {
    if (selectedRifas.length > 0) {
      const ids = selectedRifas.map(rifa => rifa.id)
      const result = await deleteMultipleRifas(ids)
      // El resultado se maneja en el modal, no necesitamos hacer nada aquí
      return result
    }
    return { success: false, error: 'No hay rifas seleccionadas' }
  }

  // Definir las columnas dentro del componente para tener acceso a las funciones
  const rifasColumns: ColumnDef<AdminRifa>[] = [
    {
      accessorKey: "titulo",
      header: "Título",
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const searchTerm = value.toLowerCase().trim()
        if (!searchTerm) return true
        
        const rifa = row.original
        
        // Buscar en múltiples campos
        return (
          // Título
          rifa.titulo?.toLowerCase().includes(searchTerm) ||
          // Descripción
          rifa.descripcion?.toLowerCase().includes(searchTerm) ||
          // Categoría
          rifa.categorias_rifas?.nombre?.toLowerCase().includes(searchTerm) ||
          // Marca
          rifa.marca?.toLowerCase().includes(searchTerm) ||
          // Modelo
          rifa.modelo?.toLowerCase().includes(searchTerm) ||
          // Estado
          rifa.estado?.toLowerCase().includes(searchTerm) ||
          // Tipo de rifa
          rifa.tipo_rifa?.toLowerCase().includes(searchTerm) ||
          // Color
          rifa.color?.toLowerCase().includes(searchTerm) ||
          // Año
          rifa.ano?.toString().includes(searchTerm) ||
          // Precio
          rifa.precio_ticket?.toString().includes(searchTerm)
        )
      },
      cell: ({ row }) => {
        const rifa = row.original
        
        // Usar el campo progreso que viene del servidor (igual que el frontend)
        const progreso = rifa.progreso || 0
        
        // Información adicional para mostrar
        const totalTickets = rifa.total_tickets || 0
        const ticketsVendidos = rifa.vendidos || 0
        const ticketsDisponibles = rifa.disponibles || totalTickets
        
        return (
          <div className="space-y-3">
            {/* Título de la rifa */}
            <div className="font-medium text-base">{row.getValue("titulo")}</div>
            
            {/* Barra de progreso mejorada - igual que el frontend hero */}
            <div className="space-y-2">
              {/* Información de tickets */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Progreso de la rifa</span>
                <span className="font-semibold text-amber-500">{progreso}%</span>
              </div>
              
              {/* Barra de progreso visual con gradiente y efectos */}
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full relative transition-all duration-300 ease-in-out" 
                  style={{ width: `${progreso}%` }}
                >
                  {/* Efecto de brillo animado - igual que el frontend */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-progress-shine" 
                    style={{width: '100%'}}
                  />
                </div>
              </div>
              
              {/* Información detallada de tickets */}
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Tickets vendidos: {ticketsVendidos}/{totalTickets}</span>
                <span className="font-medium text-green-600">{ticketsDisponibles} disponibles</span>
              </div>
            </div>
          </div>
        )
      },
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
            ${precio.toFixed(2)}
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
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string
        
        const getEstadoColor = (estado: string) => {
          switch (estado) {
            case 'activa':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'cerrada':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'finalizada':
              return 'bg-gray-100 text-gray-800 border-gray-200'
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200'
          }
        }
        
        const getEstadoIcon = (estado: string) => {
          switch (estado) {
            case 'activa':
              return <div className="w-2 h-2 bg-green-500 rounded-full" />
            case 'cerrada':
              return <div className="w-2 h-2 bg-red-500 rounded-full" />
            case 'finalizada':
              return <div className="w-2 h-2 bg-gray-500 rounded-full" />
            default:
              return <div className="w-2 h-2 bg-gray-500 rounded-full" />
          }
        }
        
        return (
          <Badge variant="outline" className={`flex items-center justify-center gap-2 px-3 py-1 w-24 ${getEstadoColor(estado)}`}>
            {getEstadoIcon(estado)}
            <span className="font-medium capitalize">{estado}</span>
          </Badge>
        )
      },
    },
    {
      accessorKey: "categoria_id",
      header: "Categoría",
      cell: ({ row }) => {
        const rifa = row.original
        const categoria = rifa.categorias_rifas
        
        if (!categoria) {
          return (
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sin categoría</span>
            </div>
          )
        }

        const IconComponent = getCategoryIcon(categoria.icono)
        
        return (
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <IconComponent className="h-4 w-4" />
            </div>
            <span className="text-sm font-medium">{categoria.nombre}</span>
          </div>
        )
      },
    },

    {
      accessorKey: "fecha_cierre",
      header: "Fecha Cierre",
      cell: ({ row }) => {
        const fecha = row.getValue("fecha_cierre") as string
        if (!fecha) {
          return (
            <div className="text-sm text-muted-foreground">
              Sin fecha de cierre
            </div>
          )
        }
        return (
          <div className="text-sm text-muted-foreground">
            {new Date(fecha).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}
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
          <div className="text-sm text-muted-foreground">
            {fecha.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: '2-digit'
            })}
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
              <DropdownMenuItem onClick={() => handleViewTickets(rifa)}>
                <Ticket className="mr-2 h-4 w-4" />
                Ver Tickets
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
        onConfirm={() => selectedRifa ? handleDuplicateRifa(selectedRifa) : Promise.resolve({ success: false, error: 'No hay rifa seleccionada' })}
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

      {/* Modal de Tickets de la Rifa */}
      <RifaTicketsModal
        isOpen={showTicketsModal}
        onClose={handleCloseTicketsModal}
        rifa={selectedRifaForTickets}
      />
    </div>
  )
}
