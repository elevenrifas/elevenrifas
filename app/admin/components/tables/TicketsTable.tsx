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
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Ticket, User, CreditCard, CheckCircle, XCircle, Clock, Lock, Unlock } from "lucide-react"
import type { AdminTicket } from "@/types"
import { useCrudTickets } from "@/hooks/use-crud-tickets"

// =====================================================
// 🎯 TABLA TICKETS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar tickets
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface TicketsTableProps {
  onCreate?: () => void
  onEdit?: (ticket: AdminTicket) => void
  onDelete?: (tickets: AdminTicket[]) => void
  onView?: (ticket: AdminTicket) => void
  onExport?: (tickets: AdminTicket[]) => void
}

// Componente principal
export function TicketsTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: TicketsTableProps) {
  // Hook para obtener tickets de la base de datos
  const { 
    tickets, 
    isLoading, 
    error, 
    refreshTickets,
    selectedTickets,
    selectTicket,
    selectMultipleTickets,
    clearSelection
  } = useCrudTickets({
    initialFilters: {},
    initialSort: { field: 'fecha_compra', direction: 'desc' },
    initialPageSize: 10
  })

  // Cargar tickets al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando tickets...')
    refreshTickets()
  }, []) // Solo se ejecuta al montar el componente

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
        'Precio',
        'Estado',
        'Estado Verificación',
        'Fecha Compra',
        'Bloqueado por Pago'
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
          ticket.precio,
          ticket.estado,
          ticket.estado_verificacion || 'pendiente',
          ticket.fecha_compra || '',
          ticket.bloqueado_por_pago ? 'Sí' : 'No'
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
      accessorKey: "rifas.titulo",
      header: "Rifa",
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
      accessorKey: "precio",
      header: "Precio",
      cell: ({ row }) => {
        const precio = row.getValue("precio") as number
        return (
          <div className="text-center">
            <Badge variant="outline" className="text-xs font-mono">
              ${precio.toFixed(2)}
            </Badge>
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
        const getVariant = (estado: string) => {
          switch (estado) {
            case 'pagado': return 'default'
            case 'verificado': return 'default'
            case 'reservado': return 'secondary'
            case 'cancelado': return 'destructive'
            default: return 'secondary'
          }
        }
        const getIcon = (estado: string) => {
          switch (estado) {
            case 'pagado': return <CreditCard className="h-3 w-3" />
            case 'verificado': return <CheckCircle className="h-3 w-3" />
            case 'reservado': return <Clock className="h-3 w-3" />
            case 'cancelado': return <XCircle className="h-3 w-3" />
            default: return <Clock className="h-3 w-3" />
          }
        }
        return (
          <div className="flex items-center justify-center">
            <Badge variant={getVariant(estado)} className="text-xs">
              <div className="flex items-center gap-1">
                {getIcon(estado)}
                {estado}
              </div>
            </Badge>
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "estado_verificacion",
      header: "Verificación",
      cell: ({ row }) => {
        const estado = row.original.estado_verificacion || 'pendiente'
        const getVariant = (estado: string) => {
          switch (estado) {
            case 'verificado': return 'default'
            case 'rechazado': return 'destructive'
            case 'pendiente': return 'secondary'
            default: return 'secondary'
          }
        }
        return (
          <div className="flex items-center justify-center">
            <Badge variant={getVariant(estado)} className="text-xs">
              {estado}
            </Badge>
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "bloqueado_por_pago",
      header: "Bloqueo",
      cell: ({ row }) => {
        const bloqueado = row.original.bloqueado_por_pago || false
        return (
          <div className="flex items-center justify-center">
            <Badge variant={bloqueado ? "destructive" : "secondary"} className="text-xs">
              <div className="flex items-center gap-1">
                {bloqueado ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                {bloqueado ? 'Bloqueado' : 'Libre'}
              </div>
            </Badge>
          </div>
        )
      },
      size: 120,
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
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const ticket = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(ticket)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(ticket)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.([ticket])}
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

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: ticketsColumns,
        data: tickets as AdminTicket[],
        title: "Tickets",
        description: "Gestiona todos los tickets del sistema de rifas",
        searchKey: "nombre",
        searchPlaceholder: "Buscar tickets...",
        loading: isLoading,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: onCreate || (() => {})
      })}
    </div>
  )
}
