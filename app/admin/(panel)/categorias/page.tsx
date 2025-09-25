"use client"

import { CategoriasRifasTable } from "@/app/admin/components/tables/CategoriasRifasTable"
import { SkeletonTableWithHeader } from "@/components/ui/skeleton-table"
import { useCrudCategorias } from "@/hooks/use-crud-categorias"

// =====================================================
// 🎯 PÁGINA CATEGORÍAS - ELEVEN RIFAS
// =====================================================
// Página principal para gestionar categorías de rifas
// El refresh automático se maneja en el hook CRUD
// =====================================================

export default function CategoriasPage() {
  // Hook para obtener estado de loading
  const { isLoading } = useCrudCategorias({
    initialFilters: {},
    initialSort: { field: 'nombre', direction: 'asc' },
    initialPageSize: 50
  })
  const handleCreate = () => {
    console.log("Crear nueva categoría")
    // La tabla maneja la creación internamente
  }

  const handleEdit = (categoria: any) => {
    console.log("Editar categoría:", categoria)
    // La tabla maneja la edición internamente
  }

  const handleDelete = (categorias: any[]) => {
    console.log("Eliminar categorías:", categorias)
    // La tabla maneja la eliminación internamente
  }

  const handleExport = (categorias: any[]) => {
    console.log("Exportar categorías:", categorias)
    // La tabla maneja la exportación internamente
  }

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <SkeletonTableWithHeader 
        title="Categorías"
        description="Gestiona las categorías de rifas del sistema. Las categorías ayudan a organizar y clasificar las rifas."
        rows={6} 
        columns={4} 
      />
    )
  }

  return (
    <div className="px-4 lg:px-6">
      {/* Header de la página */}
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categorías</h1>
        <p className="text-muted-foreground">
          Gestiona las categorías de rifas del sistema. 
          Las categorías ayudan a organizar y clasificar las rifas.
        </p>
      </div>

      {/* Tabla de categorías */}
      <CategoriasRifasTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onExport={handleExport}
      />
    </div>
  )
}
