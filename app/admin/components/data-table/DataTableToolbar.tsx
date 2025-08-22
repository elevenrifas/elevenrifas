"use client"

import * as React from "react"
import { Table } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuCheckboxItem, 
  DropdownMenuContent, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { 
  Search, 
  Settings2, 
  Filter, 
  X,
  Download,
  RefreshCw
} from "lucide-react"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"

// =====================================================
// 🎯 DATA TABLE TOOLBAR - ELEVEN RIFAS
// =====================================================
// Toolbar unificado y estandarizado para todas las tablas
// Incluye búsqueda, filtros, columnas y acciones
// =====================================================

export interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  showSearch?: boolean
  showColumnToggle?: boolean
  showFacetedFilters?: boolean
  showRefresh?: boolean
  showExport?: boolean
  globalFilter?: string
  onGlobalFilterChange?: (value: string) => void
  facetedFilters?: {
    column: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  }[]
  onRefresh?: () => void
  onExport?: () => void
  exportDisabled?: boolean
  loading?: boolean
  className?: string
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  showColumnToggle = true,
  showFacetedFilters = false,
  showRefresh = true,
  showExport = true,
  globalFilter = "",
  onGlobalFilterChange,
  facetedFilters = [],
  onRefresh,
  onExport,
  exportDisabled = false,
  loading = false,
  className = ""
}: DataTableToolbarProps<TData>) {
  // Estados para animaciones de botones
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)
  const [isColumnToggleOpen, setIsColumnToggleOpen] = React.useState(false)
  const [searchValue, setSearchValue] = React.useState("")
  const isFiltered = table.getState().columnFilters.length > 0

  // Aplicar filtro de búsqueda específico
  React.useEffect(() => {
    if (searchKey) {
      const column = table.getColumn(searchKey)
      if (column) {
        column.setFilterValue(searchValue)
      }
    }
  }, [searchValue, searchKey, table])

  // Aplicar filtro global
  React.useEffect(() => {
    if (onGlobalFilterChange) {
      onGlobalFilterChange(searchValue)
    }
  }, [searchValue, onGlobalFilterChange])

  const handleClearFilters = () => {
    table.resetColumnFilters()
    setSearchValue("")
    if (onGlobalFilterChange) {
      onGlobalFilterChange("")
    }
  }

  // Función para manejar refresh con animación
  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        // Mantener la animación por un tiempo mínimo para que se vea
        setTimeout(() => setIsRefreshing(false), 500)
      }
    }
  }

  // Función para manejar export con animación
  const handleExport = async () => {
    if (onExport) {
      setIsExporting(true)
      try {
        await onExport()
      } finally {
        // Mantener la animación por un tiempo mínimo para que se vea
        setTimeout(() => setIsExporting(false), 800)
      }
    }
  }

  return (
    <div className={`flex items-center py-4 ${className}`}>
      {/* Lado izquierdo: Búsqueda y filtros */}
      <div className="flex flex-1 items-center space-x-2">
        {/* Búsqueda */}
        {showSearch && (
          <div className="flex items-center space-x-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              className="h-8 w-[150px] lg:w-[250px]"
            />
          </div>
        )}

        {/* Filtros Facetados */}
        {showFacetedFilters && facetedFilters.map((filter) => {
          const column = table.getColumn(filter.column)
          if (!column) return null
          
          return (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          )
        })}

        {/* Botón de limpiar filtros */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={handleClearFilters}
            className="h-8 px-2 lg:px-3"
          >
            Limpiar
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Lado derecho: Acciones y configuraciones */}
      <div className="flex items-center space-x-2">
        {/* Botón de refrescar */}
        {showRefresh && onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || isRefreshing}
            className="h-8"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refrescando...' : 'Refrescar'}
          </Button>
        )}

        {/* Botón de exportar */}
        {showExport && onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={exportDisabled || loading || isExporting}
            className="h-8"
          >
            <Download className={`mr-2 h-4 w-4 ${isExporting ? 'animate-spin' : ''}`} />
            {isExporting ? 'Exportando...' : 'Exportar'}
          </Button>
        )}

        {/* Toggle de columnas */}
        {showColumnToggle && (
          <DropdownMenu onOpenChange={setIsColumnToggleOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8">
                <Settings2 className={`mr-2 h-4 w-4 ${isColumnToggleOpen ? 'animate-pulse' : ''}`} />
                {isColumnToggleOpen ? 'Columnas...' : 'Columnas'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" && 
                    column.getCanHide() && 
                    column.id
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id || 'unknown'}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id || 'Columna'}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  )
}
