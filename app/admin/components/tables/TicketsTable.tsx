"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createCRUDTable } from "../data-table"
import { Receipt, Ticket, User, Gift } from "lucide-react"
import type { AdminTicket } from "@/types"
import { useCrudTickets } from "@/hooks/use-crud-tickets"
import { PagoDetallesModal } from "../modals/PagoDetallesModal"
import { ReservarTicketModal } from "../modals/ReservarTicketModal"
import { useRifasOptions } from "@/hooks/use-rifas-options"

// =====================================================
// 🎯 TABLA TICKETS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar tickets
// Solo con opciones de eliminar y ver detalles del pago
// =====================================================

// Props del componente
interface TicketsTableProps {
  onDelete?: (tickets: AdminTicket[]) => void
  onExport?: (tickets: AdminTicket[]) => void
  sharedHook?: {
    tickets: AdminTicket[]
    isLoading: boolean
    error: string | null
    refreshTickets: () => Promise<void>
  }
}

// Componente principal
export function TicketsTable({
  onDelete,
  onExport,
  sharedHook
}: TicketsTableProps) {
  // Hook para obtener tickets de la base de datos (solo si no hay hook compartido)
  const { 
    tickets: localTickets, 
    isLoading: localIsLoading, 
    error: localError, 
    refreshTickets: localRefreshTickets,
    selectedTickets,
    selectTicket,
    selectMultipleTickets,
    clearSelection,
    isRefreshing: localIsRefreshing,
    reservarTicket
  } = useCrudTickets(
    sharedHook ? {} : {
      initialFilters: {},
      initialSort: { field: 'fecha_compra', direction: 'desc' },
      initialPageSize: 1000
    }
  )

  // Usar el hook compartido si está disponible, sino usar el local
  const tickets = sharedHook?.tickets || localTickets
  const isLoading = sharedHook?.isLoading ?? localIsLoading
  const error = sharedHook?.error ?? localError
  const refreshTickets = sharedHook?.refreshTickets || localRefreshTickets
  const isRefreshing = sharedHook ? false : localIsRefreshing // Solo el local puede estar refrescando

  // Estado para el modal de detalles del pago
  const [showPagoModal, setShowPagoModal] = React.useState(false)
  const [selectedPago, setSelectedPago] = React.useState<any>(null)

  // Estado para el modal de reservar ticket
  const [showReservarModal, setShowReservarModal] = React.useState(false)

  // Opciones de rifa para filtros
  const { rifas } = useRifasOptions()

  // Construir opciones de filtro de rifa desde los tickets cargados (fallback a rifas globales)
  const rifaFilterOptions = React.useMemo(() => {
    console.log('🔍 [TicketsTable] Rifas disponibles:', rifas)
    console.log('🔍 [TicketsTable] Cantidad de rifas:', rifas.length)
    
    // Mostrar SIEMPRE todas las rifas activas
    const options = rifas.map(r => ({ label: r.label, value: r.value }))
    // Ordenar alfabéticamente para UX
    options.sort((a, b) => a.label.localeCompare(b.label))
    
    console.log('🔍 [TicketsTable] Opciones de filtro de rifa:', options)
    return options
  }, [rifas])

  // Opciones de filtro de estado (estados reales del ticket según lógica de negocio)
  const estadoFilterOptions = React.useMemo(() => [
    { label: "Reservado", value: "reservado" },
    { label: "Pagado", value: "pagado" }
  ], [])

  // Opciones de filtro para tickets especiales
  const especialFilterOptions = React.useMemo(() => [
    { label: "Especiales", value: "true" },
    { label: "Normales", value: "false" }
  ], [])

  // Cargar tickets al montar el componente (solo si no hay hook compartido)
  React.useEffect(() => {
    if (!sharedHook) {
      console.log('🔄 Cargando tickets (hook local)...')
      localRefreshTickets()
    } else {
      console.log('🔄 Usando hook compartido, no se carga localmente')
    }
  }, [sharedHook, localRefreshTickets]) // Solo se ejecuta al montar el componente o cambiar el hook

  // Debug: mostrar estado de los datos
  React.useEffect(() => {
    console.log('📊 Estado de tickets:', { tickets, isLoading, error })
    console.log('📊 Tickets array:', tickets)
    console.log('📊 Tipo de tickets:', typeof tickets)
    console.log('📊 Es array?', Array.isArray(tickets))
    if (Array.isArray(tickets)) {
      console.log('📊 Longitud del array:', tickets.length)
      console.log('📊 Primer elemento:', tickets[0])
    }
  }, [tickets, isLoading, error])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: AdminTicket[]) => {
    selectMultipleTickets(rows)
  }, [selectMultipleTickets])

  // Función para manejar el refresh manual
  const handleRefresh = () => {
    console.log('🔄 Refresh manual solicitado por usuario')
    refreshTickets()
  }

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedTickets.length > 0 ? selectedTickets : tickets
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} tickets (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(dataToExport, 'tickets')
        console.log(`📊 Exportando ${dataToExport.length} tickets a CSV`)
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
        'Número Ticket',
        'Cliente',
        'Cédula',
        'Teléfono',
        'Correo',
        'Rifa',
        'Fecha Compra',
        'Estado Pago'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(ticket => [
          ticket.id,
          `"${ticket.numero_ticket}"`,
          `"${ticket.nombre}"`,
          `"${ticket.cedula}"`,
          `"${ticket.telefono || ''}"`,
          `"${ticket.correo}"`,
          `"${ticket.rifas?.titulo || ''}"`,
          ticket.fecha_compra || '',
          ticket.pago_id ? 'Pagado' : 'Sin Pago'
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

  // Función para mostrar detalles del pago
  const handleShowPagoDetails = (ticket: AdminTicket) => {
    console.log('🔍 Mostrando detalles del pago para ticket:', ticket)
    
    if (ticket.pagos) {
      // En tickets, la relación pagos no incluye los tickets asociados.
      // Construimos un objeto compatible con PagoDetallesModal agregando el ticket actual.
      const pagoConTickets = {
        ...ticket.pagos,
        tickets: [
          {
            id: ticket.id,
            numero_ticket: ticket.numero_ticket,
            nombre: ticket.nombre,
            cedula: ticket.cedula,
            telefono: ticket.telefono || '',
            correo: ticket.correo,
            fecha_compra: ticket.fecha_compra,
            rifa_id: ticket.rifa_id,
            es_ticket_especial: ticket.es_ticket_especial, // ✅ AGREGAR CAMPO ESPECIAL
            rifas: ticket.rifas ? {
              id: ticket.rifas.id,
              titulo: ticket.rifas.titulo,
            } : undefined,
          }
        ]
      }
      setSelectedPago(pagoConTickets)
      setShowPagoModal(true)
    } else {
      console.warn('⚠️ Este ticket no tiene información de pago asociada')
      // Aquí podrías mostrar una notificación al usuario
    }
  }

  // Función para cerrar el modal de pago
  const handleClosePagoModal = () => {
    setShowPagoModal(false)
    setSelectedPago(null)
  }

  // Función para abrir el modal de reservar ticket
  const handleOpenReservarModal = () => {
    setShowReservarModal(true)
  }

  // Función para cerrar el modal de reservar ticket
  const handleCloseReservarModal = () => {
    setShowReservarModal(false)
  }

  // Función para manejar el éxito de reservar ticket
  const handleReservarSuccess = () => {
    console.log('✅ Ticket reservado exitosamente, refrescando tabla...')
    refreshTickets()
  }

  // Columnas de la tabla
  const ticketsColumns: ColumnDef<AdminTicket>[] = [
    {
      accessorKey: "numero_ticket",
      header: "Ticket",
      cell: ({ row }) => {
        const numero = row.getValue("numero_ticket") as string
        return (
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-600" />
            <span className="font-mono font-medium">#{numero}</span>
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "nombre",
      header: "Cliente",
      cell: ({ row }) => {
        const nombre = row.getValue("nombre") as string
        const cedula = row.original.cedula
        
        return (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{nombre}</span>
            </div>
            <div className="text-sm text-muted-foreground font-mono">
              {cedula}
            </div>
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "telefono",
      header: "Teléfono",
      cell: ({ row }) => {
        const telefono = row.getValue("telefono") as string
        return (
          <div className="text-sm text-muted-foreground">
            {telefono || 'N/A'}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => {
        const correo = row.getValue("correo") as string
        return (
          <div className="text-sm text-muted-foreground max-w-[200px] truncate">
            {correo}
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "rifa_titulo",
      header: "Rifa",
      accessorFn: (row) => row.rifas?.titulo || 'No especificada',
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true
        const selected = Array.isArray(filterValue) ? filterValue : [String(filterValue)]
        const rifaId = (row.original as AdminTicket).rifa_id
        return selected.includes(rifaId)
      },
      cell: ({ row }) => {
        const titulo = row.original.rifas?.titulo || 'No especificada'
        return (
          <div className="max-w-[200px] truncate text-sm text-muted-foreground">
            {titulo}
          </div>
        )
      },
      size: 180,
    },
    {
      accessorKey: "fecha_compra",
      header: "Fecha",
      cell: ({ row }) => {
        const fecha = row.original.fecha_compra
        return (
          <div className="text-center text-sm text-muted-foreground">
            {fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "estado",
      header: "Estado",
      cell: ({ row }) => {
        const estado = row.getValue("estado") as string
        
        const getEstadoBadge = (estado: string) => {
          const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
            'reservado': 'outline',
            'pagado': 'default'
          }
          
          const colors: Record<string, string> = {
            'reservado': 'bg-amber-100 text-amber-800 border-amber-200',
            'pagado': 'bg-green-100 text-green-800 border-green-200'
          }

          return (
            <Badge variant={variants[estado] || 'outline'} className={colors[estado]}>
              {estado.charAt(0).toUpperCase() + estado.slice(1)}
            </Badge>
          )
        }
        
        return (
          <div className="text-center">
            {getEstadoBadge(estado)}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "es_ticket_especial",
      header: "Tipo",
      accessorFn: (row) => row.es_ticket_especial === true ? 'true' : 'false',
      filterFn: (row, _columnId, filterValue) => {
        if (!filterValue || (Array.isArray(filterValue) && filterValue.length === 0)) return true
        const selected = Array.isArray(filterValue) ? filterValue : [String(filterValue)]
        const isEspecial = row.original.es_ticket_especial === true
        const value = isEspecial ? 'true' : 'false'
        return selected.includes(value)
      },
      cell: ({ row }) => {
        const isEspecial = row.original.es_ticket_especial === true
        
        return (
          <div className="text-center">
            {isEspecial ? (
              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                Especial
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                Normal
              </Badge>
            )}
          </div>
        )
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const ticket = row.original
        const tienePago = ticket.pago_id && ticket.pagos
        const esEspecialSinPago = ticket.es_ticket_especial && !ticket.pago_id

        return (
          <div className="flex items-center justify-center gap-2 min-w-[200px]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => tienePago && handleShowPagoDetails(ticket)}
              disabled={!tienePago}
              className="h-8 flex-shrink-0"
            >
              <Receipt className="mr-2 h-4 w-4" />
              Detalles
            </Button>
            
            {/* Botón de eliminación solo para tickets especiales sin pago */}
            {esEspecialSinPago && (
              <button
                onClick={() => onDelete && onDelete([ticket])}
                className="inline-flex items-center justify-center gap-2 h-8 px-3 py-1.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                title="Eliminar ticket especial sin pago"
              >
                <Gift className="h-4 w-4" />
                Eliminar
              </button>
            )}
          </div>
        )
      },
    },
  ]

  // Debug: verificar configuración de filtros
  React.useEffect(() => {
    console.log('🔍 [TicketsTable] Configuración de filtros:')
    console.log('🔍 [TicketsTable] - showFacetedFilters: true')
    console.log('🔍 [TicketsTable] - rifaFilterOptions:', rifaFilterOptions)
    console.log('🔍 [TicketsTable] - estadoFilterOptions:', estadoFilterOptions)
    console.log('🔍 [TicketsTable] - especialFilterOptions:', especialFilterOptions)
  }, [rifaFilterOptions, estadoFilterOptions, especialFilterOptions])

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: ticketsColumns,
        data: tickets as AdminTicket[],
        title: "Tickets",
        description: "Gestiona todos los tickets del sistema de rifas",
        // Búsqueda global en múltiples campos: ticket, nombre, cédula, rifa y teléfono
        enableGlobalFilter: true,
        searchPlaceholder: "Buscar por ticket, nombre, cédula, rifa o teléfono...",
        globalFilterFn: (row: any, _columnId: string, filterValue: any) => {
          try {
            const value = String(filterValue || '').toLowerCase().trim()
            if (!value) return true
            const t = row.original as AdminTicket
            const numero = (t.numero_ticket || '').toString().toLowerCase()
            const nombre = (t.nombre || '').toLowerCase()
            const cedula = (t.cedula || '').toLowerCase()
            const telefono = (t.telefono || '').toLowerCase()
            const rifaTitulo = (t.rifas?.titulo || '').toLowerCase()
            return (
              numero.includes(value) ||
              nombre.includes(value) ||
              cedula.includes(value) ||
              telefono.includes(value) ||
              rifaTitulo.includes(value)
            )
          } catch {
            return true
          }
        },
        showFacetedFilters: true,
        facetedFilters: [
          {
            column: "rifa_titulo",
            title: "Rifa",
            options: rifaFilterOptions,
            multiple: false,
          },
          {
            column: "estado",
            title: "Estado",
            options: estadoFilterOptions,
            multiple: false,
          },
          {
            column: "es_ticket_especial",
            title: "Tipo",
            options: especialFilterOptions,
            multiple: false,
          },
        ],
        loading: isLoading || isRefreshing,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: handleOpenReservarModal
      })}

      {/* Modal de detalles del pago */}
      <PagoDetallesModal
        isOpen={showPagoModal}
        onClose={handleClosePagoModal}
        pago={selectedPago}
      />

      {/* Modal de reservar ticket */}
      <ReservarTicketModal
        isOpen={showReservarModal}
        onClose={handleCloseReservarModal}
        onSuccess={handleReservarSuccess}
      />
    </div>
  )
}
