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
import { MoreHorizontal, Edit, Trash2, Eye, DollarSign, CheckCircle, Clock, XCircle, CreditCard, Smartphone, Globe, AlertTriangle } from "lucide-react"
import type { AdminPago } from "@/lib/database/admin_database/pagos"
import { useAdminPagos } from "@/hooks/use-admin-pagos"

// =====================================================
// 🎯 TABLA PAGOS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar pagos
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface PagosTableProps {
  onCreate?: () => void
  onEdit?: (pago: AdminPago) => void
  onDelete?: (pagos: AdminPago[]) => void
  onView?: (pago: AdminPago) => void
  onExport?: (pagos: AdminPago[]) => void
}

// Componente principal
export function PagosTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: PagosTableProps) {
  // Hook para obtener pagos de la base de datos
  const { pagos, loading, error, loadPagos } = useAdminPagos()
  const [selectedRows, setSelectedRows] = React.useState<AdminPago[]>([])

  // Definir las columnas de la tabla
  const pagosColumns: ColumnDef<AdminPago>[] = [
    {
      accessorKey: "tickets.nombre",
      header: "Cliente",
      cell: ({ row }) => {
        const ticket = row.original.tickets
        return (
          <div className="text-sm font-medium">
            {ticket?.nombre || 'N/A'}
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "tickets.rifas.titulo",
      header: "Rifa",
      cell: ({ row }) => {
        const rifa = row.original.tickets?.rifas
        return (
          <div className="text-sm text-muted-foreground">
            {rifa?.titulo || 'N/A'}
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "monto_bs",
      header: "Monto Bs",
      cell: ({ row }) => {
        const monto = row.original.monto_bs
        return (
          <div className="text-sm font-medium text-center">
            {monto ? `Bs. ${monto.toFixed(2)}` : 'N/A'}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "monto_usd",
      header: "Monto USD",
      cell: ({ row }) => {
        const monto = row.original.monto_usd
        return (
          <div className="text-sm font-medium text-center">
            {monto ? `$${monto.toFixed(2)}` : 'N/A'}
          </div>
        )
      },
      size: 120,
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
      size: 140,
    },
    {
      accessorKey: "tipo_pago",
      header: "Tipo Pago",
      cell: ({ row }) => {
        const tipo = row.original.tipo_pago
        const getTipoConfig = (tipo: string) => {
          switch (tipo) {
            case 'efectivo':
              return { label: 'Efectivo', icon: DollarSign, color: 'text-green-600' }
            case 'tarjeta':
              return { label: 'Tarjeta', icon: CreditCard, color: 'text-blue-600' }
            case 'transferencia':
              return { label: 'Transferencia', icon: Smartphone, color: 'text-purple-600' }
            case 'otro':
              return { label: 'Otro', icon: Globe, color: 'text-gray-600' }
            default:
              return { label: tipo, icon: AlertTriangle, color: 'text-gray-600' }
          }
        }
        
        const config = getTipoConfig(tipo)
        const IconComponent = config.icon
        
        return (
          <div className="flex items-center justify-center gap-2">
            <IconComponent className={`h-4 w-4 ${config.color}`} />
            <span className="text-sm">{config.label}</span>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "fecha_pago",
      header: "Fecha Pago",
      cell: ({ row }) => {
        const fecha = row.original.fecha_pago
        return (
          <div className="text-center text-sm text-muted-foreground">
            {fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "fecha_verificacion",
      header: "Verificación",
      cell: ({ row }) => {
        const fecha = row.original.fecha_verificacion
        return (
          <div className="text-center text-sm text-muted-foreground">
            {fecha ? new Date(fecha).toLocaleDateString() : 'N/A'}
          </div>
        )
      },
      size: 120,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const pago = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(pago)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(pago)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {pago.estado === 'pendiente' && (
                <DropdownMenuItem onClick={() => console.log("Aprobar pago:", pago.id)}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprobar
                </DropdownMenuItem>
              )}
              {pago.estado === 'pendiente' && (
                <DropdownMenuItem onClick={() => console.log("Rechazar pago:", pago.id)}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete?.([pago])}
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

  // Cargar pagos al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando pagos...')
    loadPagos()
  }, []) // Solo se ejecuta al montar el componente

  // Debug: mostrar estado de los datos
  React.useEffect(() => {
    console.log('📊 Estado de pagos:', { pagos, loading, error })
    console.log('📊 Pagos array:', pagos)
    console.log('📊 Tipo de pagos:', typeof pagos)
    console.log('📊 Es array?', Array.isArray(pagos))
    if (Array.isArray(pagos)) {
      console.log('📊 Longitud del array:', pagos.length)
      console.log('📊 Primer elemento:', pagos[0])
    }
  }, [pagos, loading, error])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: AdminPago[]) => {
    setSelectedRows(rows)
  }, [])

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedRows.length > 0 ? selectedRows : pagos
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} pagos (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(dataToExport, 'pagos')
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
        'Ticket ID',
        'Tipo Pago',
        'Estado',
        'Monto Bs',
        'Monto USD',
        'Tasa Cambio',
        'Referencia',
        'Fecha Pago',
        'Fecha Verificación',
        'Cliente',
        'Notas'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(pago => [
          pago.id,
          pago.ticket_id || '',
          pago.tipo_pago,
          pago.estado,
          pago.monto_bs,
          pago.monto_usd,
          pago.tasa_cambio,
          `"${pago.referencia || ''}"`,
          pago.fecha_pago,
          pago.fecha_verificacion || '',
          `"${pago.tickets?.nombre || ''}"`,
          `"${pago.notas || ''}"`
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
    loadPagos()
  }

  // Función para obtener el ícono del tipo de pago
  const getTipoPagoIcon = (tipo: string) => {
    switch (tipo) {
      case 'pago_movil': return <Smartphone className="h-4 w-4" />
      case 'binance': return <Globe className="h-4 w-4" />
      case 'zelle': return <CreditCard className="h-4 w-4" />
      case 'zinli': return <CreditCard className="h-4 w-4" />
      case 'paypal': return <CreditCard className="h-4 w-4" />
      case 'efectivo': return <DollarSign className="h-4 w-4" />
      default: return <DollarSign className="h-4 w-4" />
    }
  }

  // Función para obtener el color del estado
  const getEstadoVariant = (estado: string) => {
    switch (estado) {
      case 'verificado': return 'default'
      case 'pendiente': return 'secondary'
      case 'rechazado': return 'destructive'
      default: return 'secondary'
    }
  }

  // Función para obtener el ícono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'verificado': return <CheckCircle className="h-3 w-3" />
      case 'pendiente': return <Clock className="h-3 w-3" />
      case 'rechazado': return <XCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: pagosColumns,
        data: pagos as AdminPago[],
        title: "Pagos",
        description: "Gestiona todos los pagos del sistema de rifas",
        searchKey: "tickets.nombre",
        searchPlaceholder: "Buscar pagos por cliente...",
        loading: loading,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: onCreate || (() => {})
      })}
    </div>
  )
}
