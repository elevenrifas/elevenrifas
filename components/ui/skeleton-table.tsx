"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

// =====================================================
// 🎨 SKELETON TABLE - ELEVEN RIFAS
// =====================================================
// Skeleton genérico para tablas de datos
// Reutilizable en todas las páginas admin
// =====================================================

interface SkeletonTableProps {
  rows?: number
  columns?: number
  showHeader?: boolean
  showPagination?: boolean
  showToolbar?: boolean
}

export function SkeletonTable({ 
  rows = 5, 
  columns = 4, 
  showHeader = true,
  showPagination = true,
  showToolbar = true
}: SkeletonTableProps) {
  return (
    <Card>
      {/* Header del skeleton */}
      {showHeader && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        </CardHeader>
      )}

      <CardContent>
        {/* Toolbar del skeleton */}
        {showToolbar && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
        )}

        {/* Tabla del skeleton */}
        <div className="space-y-3">
          {/* Header de la tabla */}
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>

          {/* Filas de la tabla */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-full" />
              ))}
            </div>
          ))}
        </div>

        {/* Paginación del skeleton */}
        {showPagination && (
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Skeleton específico para páginas con header personalizado
export function SkeletonTableWithHeader({ 
  title, 
  description, 
  rows = 5, 
  columns = 4 
}: SkeletonTableProps & { 
  title: string
  description: string 
}) {
  return (
    <div className="px-4 lg:px-6">
      {/* Header personalizado */}
      <div className="flex flex-col space-y-2 mb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Tabla skeleton */}
      <SkeletonTable rows={rows} columns={columns} />
    </div>
  )
}
