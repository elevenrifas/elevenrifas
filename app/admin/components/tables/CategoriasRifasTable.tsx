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
import { MoreHorizontal, Edit, Trash2, Eye, Tag } from "lucide-react"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"
import { useAdminCategorias } from "@/hooks/use-admin-categorias"

// =====================================================
// 🎯 TABLA CATEGORIAS RIFAS - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar categorías de rifas
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Tipos
interface Categoria extends AdminCategoria {
  rifas_count?: number
}

// Props del componente
interface CategoriasRifasTableProps {
  onCreate?: () => void
  onEdit?: (categoria: Categoria) => void
  onDelete?: (categorias: Categoria[]) => void
  onView?: (categoria: Categoria) => void
  onExport?: (categorias: Categoria[]) => void
}

// Componente principal
export function CategoriasRifasTable({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: CategoriasRifasTableProps) {
  // Hook para obtener categorías de la base de datos
  const { categorias, loading, error, loadCategorias } = useAdminCategorias()
  const [selectedRows, setSelectedRows] = React.useState<Categoria[]>([])

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando categorías...')
    loadCategorias()
  }, []) // Solo se ejecuta al montar el componente

  // Debug: mostrar estado de los datos
  React.useEffect(() => {
    console.log('📊 Estado de categorías:', { categorias, loading, error })
    console.log('📊 Categorías array:', categorias)
    console.log('📊 Tipo de categorías:', typeof categorias)
    console.log('📊 Es array?', Array.isArray(categorias))
    if (Array.isArray(categorias)) {
      console.log('📊 Longitud del array:', categorias.length)
      console.log('📊 Primer elemento:', categorias[0])
    }
  }, [categorias, loading, error])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: Categoria[]) => {
    setSelectedRows(rows)
  }, [])

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedRows.length > 0 ? selectedRows : (categorias as Categoria[])
      
      if (onExport) {
        // Si hay callback personalizado, usarlo
        onExport(dataToExport)
        console.log(`🔄 Exportando ${dataToExport.length} categorías (callback personalizado)`)
      } else {
        // Exportación automática a CSV si no hay callback
        exportToCSV(dataToExport, 'categorias')
        console.log(`📊 Exportando ${dataToExport.length} categorías a CSV`)
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
        'Orden',
        'Nombre',
        'Descripción',
        'Rifas Count',
        'Estado'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(categoria => [
          categoria.id,
          categoria.orden,
          `"${categoria.nombre}"`, // Comillas para evitar problemas con comas
          `"${categoria.descripcion}"`,
          categoria.rifas_count,
          categoria.activa ? 'Activa' : 'Inactiva'
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
    loadCategorias()
  }

  // Columnas de la tabla
  const categoriasColumns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "orden",
      header: "Orden",
      cell: ({ row }) => {
        const orden = row.getValue("orden") as number || 0
        return (
          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs font-mono">
              {orden}
            </Badge>
          </div>
        )
      },
      size: 80,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-muted-foreground" />
          <div className="font-medium">{row.getValue("nombre")}</div>
        </div>
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
      accessorKey: "rifas_count",
      header: "Rifas",
      cell: ({ row }) => {
        const count = row.getValue("rifas_count") as number || 0
        return (
          <div className="text-center">
            <Badge variant="secondary" className="text-xs">
              {count}
            </Badge>
          </div>
        )
      },
      size: 80,
    },
    {
      accessorKey: "activa",
      header: "Estado",
      cell: ({ row }) => {
        const activa = row.getValue("activa") as boolean
        return (
          <div className="flex items-center justify-center">
            <Badge variant={activa ? "default" : "secondary"}>
              {activa ? "Activa" : "Inactiva"}
            </Badge>
          </div>
        )
      },
      size: 100,
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const categoria = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(categoria)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(categoria)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.([categoria])}
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
        columns: categoriasColumns,
        data: categorias as Categoria[],
        title: "Categorías",
        description: "Gestiona las categorías para organizar las rifas",
        searchKey: "nombre",
        searchPlaceholder: "Buscar categorías...",
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
