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

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  searchKey?: string
  searchPlaceholder?: string
  showSearch?: boolean
  showColumnToggle?: boolean
  showFacetedFilters?: boolean
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
}

export function DataTableToolbar<TData>({
  table,
  searchKey,
  searchPlaceholder = "Buscar...",
  showSearch = true,
  showColumnToggle = true,
  showFacetedFilters = false,
  globalFilter = "",
  onGlobalFilterChange,
  facetedFilters = [],
  onRefresh,
  onExport,
  exportDisabled = false,
}: DataTableToolbarProps<TData>) {
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
  }, [searchValue, searchKey])

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

  return (
    <div className="flex items-center py-4">
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

      <div className="flex items-center space-x-2">
        {/* Botón de refrescar */}
        {onRefresh && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="h-8"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Refrescar
          </Button>
        )}

        {/* Botón de exportar */}
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            disabled={exportDisabled}
            className="h-8"
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        )}

        {/* Toggle de columnas */}
        {showColumnToggle && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="ml-auto h-8">
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
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
