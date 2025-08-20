"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table"

import {
  Table as TableUI,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { DataTablePagination } from "./DataTablePagination"
import { DataTableToolbar } from "./DataTableToolbar"
import { DataTableColumnHeader } from "./DataTableColumnHeader"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  searchKey?: string
  searchPlaceholder?: string
  pageSize?: number
  pageSizeOptions?: number[]
  showPagination?: boolean
  showToolbar?: boolean
  showSearch?: boolean
  showColumnToggle?: boolean
  showRowSelection?: boolean
  showFacetedFilters?: boolean
  onRowSelectionChange?: (selectedRows: TData[]) => void
  className?: string
  enableSorting?: boolean
  enableColumnFilters?: boolean
  enableRowSelection?: boolean
  enableGlobalFilter?: boolean
  onRowClick?: (row: Row<TData>) => void
  emptyState?: React.ReactNode
  loading?: boolean
  error?: string | null
  facetedFilters?: {
    column: string
    title: string
    options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[]
  }[]
  onRefresh?: () => void
  onExport?: () => void
  exportDisabled?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Buscar...",
  pageSize = 10,
  pageSizeOptions = [10, 20, 30, 40, 50],
  showPagination = true,
  showToolbar = true,
  showSearch = true,
  showColumnToggle = true,
  showRowSelection = false,
  showFacetedFilters = false,
  onRowSelectionChange,
  className,
  enableSorting = true,
  enableColumnFilters = true,
  enableRowSelection = false,
  enableGlobalFilter = true,
  onRowClick,
  emptyState,
  loading = false,
  error = null,
  facetedFilters = [],
  onRefresh,
  onExport,
  exportDisabled = false,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState("")

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection: enableRowSelection || showRowSelection,
    enableSorting,
    enableColumnFilters,
    enableGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    initialState: {
      pagination: {
        pageSize,
      },
    },
  })

  // Notificar cambios en la selección de filas
  React.useEffect(() => {
    if (onRowSelectionChange) {
      const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original)
      onRowSelectionChange(selectedRows)
    }
  }, [rowSelection, onRowSelectionChange])

  // Estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  // Estado de error
  if (error) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <p className="text-sm text-destructive mb-2">Error al cargar los datos</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      {showToolbar && (
        <DataTableToolbar
          table={table}
          searchKey={searchKey}
          searchPlaceholder={searchPlaceholder}
          showSearch={showSearch}
          showColumnToggle={showColumnToggle}
          showFacetedFilters={showFacetedFilters}
          facetedFilters={facetedFilters}
          globalFilter={globalFilter}
          onGlobalFilterChange={setGlobalFilter}
          onRefresh={onRefresh}
          onExport={onExport}
          exportDisabled={exportDisabled}
        />
      )}
      
      <div className="overflow-hidden rounded-md border">
        <TableUI>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center space-x-2">
                          <span>{header.column.columnDef.header as string || header.column.id}</span>
                          {enableSorting && header.column.getCanSort() && (
                            <button
                              onClick={() => header.column.toggleSorting()}
                              className="ml-2 hover:bg-muted p-1 rounded"
                            >
                              {header.column.getIsSorted() === "desc" ? "↓" : 
                               header.column.getIsSorted() === "asc" ? "↑" : "↕"}
                            </button>
                          )}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                  onClick={() => onRowClick?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {emptyState || "No hay resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableUI>
      </div>

      {showPagination && (
        <DataTablePagination
          table={table}
        />
      )}
    </div>
  )
}
