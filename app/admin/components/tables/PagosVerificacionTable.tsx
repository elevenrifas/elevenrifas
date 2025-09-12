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
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign,
  CreditCard,
  Smartphone,
  Globe,
  AlertTriangle,
  User,
  Ticket,
  Calendar
} from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import { useCrudPagos } from "@/hooks/use-crud-pagos"
import { useRifasOptions } from "@/hooks/use-rifas-options"
import type { AdminPago } from "@/lib/database/admin_database/pagos"
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal"
import { VerifyPagoModal } from "../modals/VerifyPagoModal"
import { RejectPagoModal } from "../modals/RejectPagoModal"
import { PagoDetallesModal } from "../modals/PagoDetallesModal"

// =====================================================
// 🎯 TABLA VERIFICACIÓN PAGOS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para verificación de pagos
// Muestra información completa de pagos, tickets y rifas
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Función para obtener icono del tipo de pago
const getTipoPagoIcon = (tipo: string) => {
  switch (tipo) {
    case 'pago_movil':
      return <Smartphone className="h-4 w-4" />
    case 'binance':
      return <Globe className="h-4 w-4" />
    case 'zelle':
      return <DollarSign className="h-4 w-4" />
    case 'zinli':
      return <CreditCard className="h-4 w-4" />
    case 'paypal':
      return <Globe className="h-4 w-4" />
    case 'efectivo':
      return <DollarSign className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}


// Props del componente
interface PagosVerificacionTableProps {
  onCreate?: () => void
  onEdit?: (pago: AdminPago) => void
  onDelete?: (pagos: AdminPago[]) => void
  onView?: (pago: AdminPago) => void
  onExport?: (pagos: AdminPago[]) => void
  onVerify?: (pago: AdminPago) => void
  onReject?: (pago: AdminPago) => void
}

// Componente principal
export function PagosVerificacionTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  onVerify,
  onReject,
}: PagosVerificacionTableProps) {
  // Hook para obtener rifas para filtros
  const { rifas } = useRifasOptions()

  // Debug: mostrar qué rifas se están cargando
  React.useEffect(() => {
    console.log('🔍 [PagosVerificacionTable] Rifas cargadas:', rifas)
    console.log('🔍 [PagosVerificacionTable] Cantidad de rifas:', rifas.length)
    if (rifas.length > 0) {
      console.log('🔍 [PagosVerificacionTable] Primera rifa:', rifas[0])
      console.log('🔍 [PagosVerificacionTable] Última rifa:', rifas[rifas.length - 1])
    }
  }, [rifas])

  // Preparar filtros facetados para la tabla
  const facetedFilters = React.useMemo(() => {
    const rifasOptions = rifas.map(rifa => ({
      label: rifa.label,
      value: rifa.value,
      icon: undefined
    }))

    console.log('🔍 [PagosVerificacionTable] Opciones de rifa para filtro:', rifasOptions)
    console.log('🔍 [PagosVerificacionTable] Cantidad de opciones:', rifasOptions.length)

    const estadosOptions = [
      { label: "Pendiente", value: "pendiente", icon: undefined },
      { label: "Verificado", value: "verificado", icon: undefined },
      { label: "Rechazado", value: "rechazado", icon: undefined }
    ]

    return [
      {
        column: "rifa_titulo",
        title: "Rifa",
        options: rifasOptions
      },
      {
        column: "estado", 
        title: "Estado",
        options: estadosOptions
      }
    ]
  }, [rifas])

  // Hook CRUD personalizado para gestionar pagos
  const {
    // Estado de los datos
    pagos,
    totalPagos,
    isLoading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isUpdating,
    isDeleting,
    isVerifying,
    isRejecting,
    
    // Estados de modales
    showEditModal,
    showDeleteModal,
    showViewModal,
    showVerifyModal,
    showRejectModal,
    
    // Datos seleccionados
    selectedPago,
    selectedPagos,
    
    // Operaciones CRUD
    updatePago,
    deletePago,
    deleteMultiplePagos,
    verifyPago,
    rejectPago,
    
    // Operaciones de UI
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
    openVerifyModal,
    closeVerifyModal,
    openRejectModal,
    closeRejectModal,
    
    // Selección
    selectPago,
    selectMultiplePagos,
    clearSelection,
    togglePagoSelection,
    
    // Utilidades
    refreshPagos,
    exportPagos
  } = useCrudPagos({
    initialFilters: {},
    initialSort: { field: 'fecha_pago', direction: 'desc' },
    initialPageSize: 10
  })

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedPagos.length > 0 ? selectedPagos : pagos
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} pagos (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(dataToExport, 'pagos_verificacion')
        console.log(`📊 Exportando ${dataToExport.length} pagos a CSV`)
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
        'Cliente',
        'Rifa',
        'Tipo Pago',
        'Monto Bs',
        'Monto USD',
        'Referencia',
        'Estado',
        'Fecha Pago',
        'Tickets',
        'Verificado Por',
        'Fecha Verificación'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(pago => {
          const primerTicket = pago.tickets?.[0]
          const cliente = primerTicket?.nombre || 'N/A'
          const rifa = primerTicket?.rifas?.titulo || 'N/A'
          const ticketsCount = pago.tickets?.length || 0
          
          return [
            pago.id,
            `"${cliente}"`,
            `"${rifa}"`,
            pago.tipo_pago,
            pago.monto_bs,
            pago.monto_usd,
            `"${pago.referencia || ''}"`,
            pago.estado,
            pago.fecha_pago,
            ticketsCount,
            `"${pago.verificado_por || ''}"`,
            pago.fecha_verificacion || ''
          ].join(',')
        })
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
    refreshPagos()
  }

  // Funciones wrapper para las acciones de las columnas
  const handleEditPago = (pago: AdminPago) => {
    openEditModal(pago)
  }

  const handleViewPago = (pago: AdminPago) => {
    openViewModal(pago)
  }

  const handleVerifyPago = (pago: AdminPago) => {
    openVerifyModal(pago)
  }

  const handleRejectPago = (pago: AdminPago) => {
    console.log('🚫 handleRejectPago ejecutado para pago:', pago.id, pago.estado)
    openRejectModal(pago)
  }

  const handleMarcarComoPendiente = async (pago: AdminPago) => {
    try {
      const result = await updatePago(pago.id, { 
        estado: 'pendiente',
        fecha_verificacion: null,
        verificado_por: null
      })
      if (result.success) {
        await refreshPagos()
      }
      return result
    } catch (error) {
      console.error('Error en handleMarcarComoPendiente:', error)
      return { success: false, error: 'Error inesperado al marcar como pendiente' }
    }
  }

  const handleDeletePago = (pago: AdminPago) => {
    openDeleteModal(pago)
  }



  // Función para manejar la edición
  const handleEdit = async (data: any) => {
    if (selectedPago) {
      try {
        const result = await updatePago(selectedPago.id, data)
        if (result.success) {
          // Cerrar el modal de edición
          closeEditModal()
          // Refrescar la lista
          await refreshPagos()
        }
        return result
      } catch (error) {
        console.error('Error en handleEdit:', error)
        return { success: false, error: 'Error inesperado al editar' }
      }
    }
    return { success: false, error: 'No hay pago seleccionado' }
  }

  // Función para manejar la eliminación
  const handleDelete = async () => {
    if (selectedPago) {
      const result = await deletePago(selectedPago.id)
      // El resultado se maneja en el modal, no necesitamos hacer nada aquí
      return result
    }
    return { success: false, error: 'No hay pago seleccionado' }
  }

  // Función para manejar la eliminación múltiple
  const handleDeleteMultiple = async () => {
    if (selectedPagos.length > 0) {
      const ids = selectedPagos.map(pago => pago.id)
      const result = await deleteMultiplePagos(ids)
      // El resultado se maneja en el modal, no necesitamos hacer nada aquí
      return result
    }
    return { success: false, error: 'No hay pagos seleccionados' }
  }

  // Definir las columnas dentro del componente para tener acceso a las funciones
  const pagosColumns: ColumnDef<AdminPago>[] = [
    {
      accessorKey: "rifa_titulo",
      header: "Rifa",
      cell: ({ row }) => {
        const pago = row.original
        
        // Para pagos rechazados, usar rifa_id del pago
        if (pago.estado === 'rechazado') {
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                Rifa ID: {(pago as any).rifa_id || 'No especificada'}
              </div>
              <div className="text-xs text-muted-foreground">
                Información de rifa no disponible
              </div>
            </div>
          )
        }
        
        // Para otros estados, usar información del primer ticket
        const primerTicket = pago.tickets?.[0]
        const rifa = primerTicket?.rifas
        
        if (!rifa) {
          return (
            <div className="text-sm text-muted-foreground">
              Rifa no encontrada
            </div>
          )
        }

        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">{rifa.titulo}</div>
            <div className="text-xs text-muted-foreground">
              ${rifa.precio_ticket} por ticket
            </div>
          </div>
        )
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const pago = row.original
        const primerTicket = pago.tickets?.[0]
        const rifaId = primerTicket?.rifa_id
        if (!rifaId || !value || value.length === 0) return true
        return value.includes(rifaId)
      },
      size: 200,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = (row.original.estado || '').toLowerCase()

        const getEstadoColorClasses = (value: string) => {
          switch (value) {
            case 'verificado':
              return 'bg-green-100 text-green-800 border-green-200'
            case 'rechazado':
              return 'bg-red-100 text-red-800 border-red-200'
            case 'pendiente':
              return 'bg-amber-100 text-amber-800 border-amber-200'
            default:
              return 'bg-gray-100 text-gray-800 border-gray-200'
          }
        }

        const getDotColorClasses = (value: string) => {
          switch (value) {
            case 'verificado':
              return 'bg-green-500'
            case 'rechazado':
              return 'bg-red-500'
            case 'pendiente':
              return 'bg-amber-500'
            default:
              return 'bg-gray-500'
          }
        }

        const colorClasses = getEstadoColorClasses(estado)
        const dotClasses = getDotColorClasses(estado)

        return (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className={`flex items-center gap-2 px-3 py-1 w-28 ${colorClasses}`}>
              <div className={`w-2 h-2 rounded-full ${dotClasses}`} />
              <span className="font-medium capitalize">{estado || 'N/A'}</span>
            </Badge>
          </div>
        )
      },
      enableColumnFilter: true,
      filterFn: (row, id, value) => {
        const pago = row.original
        return value.includes(pago.estado)
      },
      size: 140,
    },
    {
      accessorKey: "cliente",
      header: "Cliente",
      cell: ({ row }) => {
        const pago = row.original
        
        // Para pagos rechazados, usar información del pagador
        if (pago.estado === 'rechazado') {
          return (
            <div className="space-y-1">
              <div className="font-medium text-sm">
                {pago.cedula_pago || 'Cliente no especificado'}
              </div>
            </div>
          )
        }
        
        // Para otros estados, usar información del primer ticket
        const primerTicket = pago.tickets?.[0]
        
        if (!primerTicket) {
          return (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sin tickets</span>
            </div>
          )
        }

                 return (
           <div className="space-y-1">
             <div className="font-medium text-sm">{primerTicket.nombre}</div>
             <div className="text-xs text-muted-foreground">
               {primerTicket.cedula}
             </div>
           </div>
         )
      },
    },
    {
      accessorKey: "tickets_info",
      header: "Tickets",
      cell: ({ row }) => {
        const pago = row.original
        const tickets = pago.tickets || []
        
        if (tickets.length === 0) {
          return (
            <div className="text-sm text-muted-foreground">
              Sin tickets
            </div>
          )
        }

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-sm">{tickets.length} ticket(s)</span>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "monto_total",
      header: "Monto Total",
      cell: ({ row }) => {
        const pago = row.original
        const tickets = pago.tickets || []
        const precioPorTicket = tickets[0]?.rifas?.precio_ticket || 0
        const totalTickets = tickets.length
        const totalCalculado = precioPorTicket * totalTickets
        
        return (
          <div className="space-y-1">
            <div className="font-medium text-green-600">
              ${pago.monto_usd.toFixed(2)} USD
            </div>
            <div className="text-xs text-muted-foreground">
              Bs. {pago.monto_bs.toFixed(2)} • {totalTickets} × ${precioPorTicket}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: "tipo_pago",
      header: "Tipo Pago",
      cell: ({ row }) => {
        const tipo = row.getValue("tipo_pago") as string
        const icon = getTipoPagoIcon(tipo)
        
        return (
          <div className="flex items-center gap-2">
            <div className="text-blue-600">
              {icon}
            </div>
            <span className="text-sm font-medium capitalize">
              {tipo.replace('_', ' ')}
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: "referencia",
      header: "Referencia",
      // Permite buscar por cédula, cliente, referencia y rifa usando el buscador
      filterFn: (row, _id, value) => {
        try {
          const searchTerm = String(value || '').toLowerCase().trim()
          if (!searchTerm) return true

          const pago = row.original as AdminPago
          const primerTicket = pago.tickets?.[0]
          const clienteNombre = primerTicket?.nombre?.toLowerCase() || ''
          const clienteCedula = primerTicket?.cedula?.toLowerCase() || ''
          const referencia = (pago.referencia || '').toLowerCase()
          const rifaTitulo = primerTicket?.rifas?.titulo?.toLowerCase() || ''

          return (
            clienteNombre.includes(searchTerm) ||
            clienteCedula.includes(searchTerm) ||
            referencia.includes(searchTerm) ||
            rifaTitulo.includes(searchTerm)
          )
        } catch {
          return true
        }
      },
      cell: ({ row }) => {
        const referencia = row.getValue("referencia") as string
        const telefono = row.original.telefono_pago
        const banco = row.original.banco_pago
        
        if (!referencia && !telefono && !banco) {
          return (
            <div className="text-sm text-muted-foreground">
              Sin referencia
            </div>
          )
        }

        return (
          <div className="space-y-1">
            {referencia && (
              <div className="font-medium text-sm">{referencia}</div>
            )}
                         {telefono && (
               <div className="text-xs text-muted-foreground">
                 <Smartphone className="inline h-3 w-3 mr-1" />
                 {telefono}
               </div>
             )}
             {banco && (
               <div className="text-xs text-muted-foreground">
                 <CreditCard className="inline h-3 w-3 mr-1" />
                 {banco}
               </div>
             )}
          </div>
        )
      },
    },
    {
      accessorKey: "fecha_pago",
      header: "Fecha Pago",
      cell: ({ row }) => {
        const fecha = new Date(row.getValue("fecha_pago"))
        const fechaVerificacion = row.original.fecha_verificacion
        const verificadoPor = row.original.verificado_por
        
        return (
          <div className="space-y-1">
            <div className="text-sm font-medium">
              {fecha.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
              })}
            </div>
            {fechaVerificacion && verificadoPor && (
              <div className="text-xs text-muted-foreground">
                ✅ {verificadoPor} • {new Date(fechaVerificacion).toLocaleDateString('es-ES')}
              </div>
            )}
          </div>
        )
      },
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const pago = row.original
        const isPendiente = pago.estado === 'pendiente'
        
        // Debug: mostrar información del estado
        console.log('🔍 Debug pago:', {
          id: pago.id,
          estado: pago.estado,
          isPendiente: isPendiente,
          tickets: pago.tickets?.length || 0
        })

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewPago(pago)}>
                <Eye className="mr-2 h-4 w-4" />
                Detalles
              </DropdownMenuItem>
              
              {isPendiente && (
                <>
                  <DropdownMenuItem onClick={() => handleVerifyPago(pago)}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verificar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleRejectPago(pago)}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Rechazar
                  </DropdownMenuItem>
                </>
              )}
              
              {!isPendiente && pago.estado !== 'rechazado' && (
                <DropdownMenuItem onClick={() => handleMarcarComoPendiente(pago)}>
                  <Clock className="mr-2 h-4 w-4" />
                  Pendiente
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Estado de carga
  if (isLoading && !pagos.length) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
            <p className="text-muted-foreground">Cargando pagos...</p>
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
        columns: pagosColumns,
        data: pagos,
        title: "Verificación de Pagos",
        description: "Gestiona y verifica todos los pagos del sistema",
        // Usar filtros facetados integrados
        showFacetedFilters: true,
        facetedFilters: facetedFilters,
        searchPlaceholder: "Buscar por cédula, cliente, referencia o rifa...",
        enableGlobalFilter: true,
        globalFilterFn: (row: any, _columnId: string, filterValue: any) => {
          try {
            const value = String(filterValue || '').toLowerCase().trim()
            if (!value) return true
            const pago = row.original as AdminPago
            const primerTicket = pago.tickets?.[0]
            const clienteNombre = primerTicket?.nombre?.toLowerCase() || ''
            const clienteCedula = primerTicket?.cedula?.toLowerCase() || ''
            const referencia = (pago.referencia || '').toLowerCase()
            const rifaTitulo = primerTicket?.rifas?.titulo?.toLowerCase() || ''
            return (
              clienteNombre.includes(value) ||
              clienteCedula.includes(value) ||
              referencia.includes(value) ||
              rifaTitulo.includes(value)
            )
          } catch {
            return true
          }
        },
        loading: isLoading || isRefreshing,
        error: error,
        onRowSelectionChange: selectMultiplePagos,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: undefined
      })}

      {/* Modales del CRUD */}
      
      {/* Modal de Verificación */}
      <VerifyPagoModal
        isOpen={showVerifyModal}
        onClose={closeVerifyModal}
        onConfirm={(verificadoPor, options) => verifyPago(selectedPago?.id || '', verificadoPor, options)}
        pago={selectedPago}
        isSubmitting={isVerifying}
      />

      {/* Modal de Rechazo */}
      <RejectPagoModal
        isOpen={showRejectModal}
        onClose={closeRejectModal}
        onConfirm={(verificadoPor, rechazoNote) => rejectPago(selectedPago?.id || '', verificadoPor, rechazoNote)}
        pago={selectedPago}
        isSubmitting={isRejecting}
      />

      {/* Modal de Detalles del Pago */}
      <PagoDetallesModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        pago={selectedPago}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={selectedPagos.length > 1 ? handleDeleteMultiple : handleDelete}
        title={selectedPagos.length > 1 ? "Eliminar Múltiples Pagos" : "Eliminar Pago"}
        description={
          selectedPagos.length > 1 
            ? `¿Estás seguro de que quieres eliminar ${selectedPagos.length} pagos seleccionados? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar el pago "${selectedPago?.referencia || 'sin referencia'}"? Esta acción no se puede deshacer.`
        }
        entityName="pago"
        isDeleting={isDeleting}
      />
    </div>
  )
}
