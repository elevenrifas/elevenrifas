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
import { MoreHorizontal, User, Mail, Phone, CreditCard, Calendar, Eye, Ticket, Gift } from "lucide-react"
import type { AdminCliente } from "@/types"
import { useAdminClientes } from "@/hooks/use-admin-clientes"

// =====================================================
// 👥 TABLA CLIENTES - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar clientes únicos
// Extraídos y agrupados desde la tabla tickets
// =====================================================

// Props del componente
interface ClientesTableProps {
  onView?: (cliente: AdminCliente) => void
  onExport?: (clientes: AdminCliente[]) => void
  sharedHook?: {
    clientes: AdminCliente[]
    isLoading: boolean
    error: string | null
    refreshClientes: () => Promise<void>
  }
}

// Componente principal
export function ClientesTable({
  onView,
  onExport,
  sharedHook
}: ClientesTableProps) {
  // Hook para obtener clientes de la base de datos (solo si no hay hook compartido)
  const { 
    clientes: localClientes, 
    isLoading: localIsLoading, 
    error: localError, 
    refreshClientes: localRefreshClientes,
    isRefreshing: localIsRefreshing
  } = useAdminClientes(
    sharedHook ? {} : {
      initialFilters: {},
      initialSort: { field: 'nombre', direction: 'asc' },
      initialPageSize: 1000
    }
  )

  // Usar el hook compartido si está disponible, sino usar el local
  const clientes = sharedHook?.clientes || localClientes
  const isLoading = sharedHook?.isLoading ?? localIsLoading
  const error = sharedHook?.error ?? localError
  const refreshClientes = sharedHook?.refreshClientes || localRefreshClientes
  const isRefreshing = sharedHook ? false : localIsRefreshing

  // Cargar clientes al montar el componente (solo si no hay hook compartido)
  React.useEffect(() => {
    if (!sharedHook) {
      console.log('🔄 Cargando clientes (hook local)...')
      localRefreshClientes()
    } else {
      console.log('🔄 Usando hook compartido, no se carga localmente')
    }
  }, [sharedHook, localRefreshClientes])

  // Debug: mostrar estado de los datos
  React.useEffect(() => {
    console.log('📊 Estado de clientes:', { clientes, isLoading, error })
    console.log('📊 Clientes array:', clientes)
    console.log('📊 Tipo de clientes:', typeof clientes)
    console.log('📊 Es array?', Array.isArray(clientes))
    if (Array.isArray(clientes)) {
      console.log('📊 Longitud del array:', clientes.length)
      console.log('📊 Primer elemento:', clientes[0])
    }
  }, [clientes, isLoading, error])

  // Función para manejar el refresh manual
  const handleRefresh = () => {
    console.log('🔄 Refresh manual solicitado por usuario')
    refreshClientes()
  }

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Exportar todos los clientes
      const dataToExport = clientes
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} clientes (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(dataToExport, 'clientes')
        console.log(`📊 Exportando ${dataToExport.length} clientes a CSV`)
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
        'Cédula',
        'Nombre',
        'Correo',
        'Teléfono',
        'Total Tickets',
        'Total Rifas',
        'Primer Compra',
        'Última Compra'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(cliente => [
          `"${cliente.cedula}"`,
          `"${cliente.nombre}"`,
          `"${cliente.correo}"`,
          `"${cliente.telefono || ''}"`,
          cliente.total_tickets,
          cliente.total_rifas,
          cliente.primer_compra ? new Date(cliente.primer_compra).toLocaleDateString() : '',
          cliente.ultima_compra ? new Date(cliente.ultima_compra).toLocaleDateString() : ''
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

  // Función para mostrar detalles del cliente
  const handleViewCliente = (cliente: AdminCliente) => {
    console.log('🔍 Mostrando detalles del cliente:', cliente)
    
    if (onView) {
      onView(cliente)
    } else {
      console.warn('⚠️ No hay función onView configurada')
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Columnas de la tabla
  const clientesColumns: ColumnDef<AdminCliente>[] = [
    {
      accessorKey: "cedula",
      header: "Cédula",
      cell: ({ row }) => {
        const cedula = row.getValue("cedula") as string
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="font-mono font-medium">{cedula}</span>
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => {
        const nombre = row.getValue("nombre") as string
        return (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{nombre}</span>
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "correo",
      header: "Correo",
      cell: ({ row }) => {
        const correo = row.getValue("correo") as string
        return (
          <div className="flex items-center gap-2 text-sm text-muted-foreground max-w-[200px] truncate">
            <Mail className="h-4 w-4" />
            {correo}
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
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" />
            {telefono || 'N/A'}
          </div>
        )
      },
      size: 150,
    },
    {
      accessorKey: "total_tickets",
      header: "Tickets",
      cell: ({ row }) => {
        const totalTickets = row.getValue("total_tickets") as number
        return (
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-green-600" />
            <Badge variant="secondary" className="text-xs">
              {totalTickets}
            </Badge>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "total_rifas",
      header: "Rifas",
      cell: ({ row }) => {
        const totalRifas = row.getValue("total_rifas") as number
        return (
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-purple-600" />
            <Badge variant="outline" className="text-xs">
              {totalRifas}
            </Badge>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "primer_compra",
      header: "Primer Compra",
      cell: ({ row }) => {
        const primerCompra = row.original.primer_compra
        return (
          <div className="text-center text-sm text-muted-foreground">
            {formatDate(primerCompra)}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "ultima_compra",
      header: "Última Compra",
      cell: ({ row }) => {
        const ultimaCompra = row.original.ultima_compra
        return (
          <div className="text-center text-sm text-muted-foreground">
            {formatDate(ultimaCompra)}
          </div>
        )
      },
      size: 120,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const cliente = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleViewCliente(cliente)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver Detalles
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
        columns: clientesColumns,
        data: clientes as AdminCliente[],
        searchKey: "nombre",
        searchPlaceholder: "Buscar por nombre, cédula, correo o teléfono...",
        loading: isLoading || isRefreshing,
        error: error,
        onRefresh: handleRefresh,
        onExport: handleExport
        // Removemos title, description, onCreate y onRowSelectionChange para no mostrar botones innecesarios
      })}
    </div>
  )
}
