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
import { MoreHorizontal, Edit, Trash2, Tag } from "lucide-react"
import * as LucideIcons from "lucide-react"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"
import { useCrudCategorias } from "@/hooks/use-crud-categorias"
import { DeleteConfirmModal } from "../modals/DeleteConfirmModal"
import { CategoriaFormModal } from "../modals/CategoriaFormModal"

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
  onExport?: (categorias: Categoria[]) => void
}

// Componente principal
export function CategoriasRifasTable({
  onCreate,
  onEdit,
  onDelete,
  onExport,
}: CategoriasRifasTableProps) {
  // Hook CRUD para categorías
  const {
    categorias,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    showCreateModal,
    showEditModal,
    showDeleteModal,
    selectedCategoria,
    selectedCategorias,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    deleteMultipleCategorias,
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    selectMultipleCategorias,
    loadCategorias,
    refreshCategorias
  } = useCrudCategorias()

  // Forzar carga inicial de categorías
  React.useEffect(() => {
    console.log('🔄 [TABLA] Forzando carga inicial de categorías...')
    loadCategorias()
  }, []) // Solo ejecutar una vez al montar

  // Debug: mostrar estado de los datos
  React.useEffect(() => {
    console.log('📊 Estado de categorías:', { categorias, isLoading, error })
    console.log('📊 Categorías array:', categorias)
    console.log('📊 Tipo de categorías:', typeof categorias)
    console.log('📊 Es array?', Array.isArray(categorias))
    if (Array.isArray(categorias)) {
      console.log('📊 Longitud del array:', categorias.length)
      console.log('📊 Primer elemento:', categorias[0])
    }
  }, [categorias, isLoading, error])

  // Función para manejar la exportación
  const handleExport = () => {
    try {
      // Si hay elementos seleccionados, exportar solo esos
      // Si no hay selección, exportar todos
      const dataToExport = selectedCategorias.length > 0 ? selectedCategorias : (categorias as Categoria[])
      
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
        'Nombre',
        'Icono'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...data.map(categoria => [
          categoria.id,
          `"${categoria.nombre}"`, // Comillas para evitar problemas con comas
          categoria.icono
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
    refreshCategorias()
  }


  // Columnas de la tabla
  const categoriasColumns: ColumnDef<Categoria>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => {
        const categoria = row.original
        const iconName = categoria.icono || 'tag'
        
        // Convertir el nombre del icono a PascalCase
        const pascalCaseName = iconName
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join('')
        
        const IconComponent = (LucideIcons as any)[pascalCaseName] || Tag
        
        return (
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-gray-100">
              <IconComponent className="h-4 w-4 text-gray-600" />
            </div>
            <div className="font-medium">{categoria.nombre}</div>
          </div>
        )
      },
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
              <DropdownMenuItem onClick={() => openEditModal(categoria)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => openDeleteModal(categoria)}
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

  // =====================================================
  // 🔧 FUNCIONES DE MANEJO CRUD
  // =====================================================

  const handleCreate = async (data: any) => {
    try {
      const result = await createCategoria(data)
      return result
    } catch (error) {
      console.error('Error en handleCreate:', error)
      return { success: false, error: 'Error inesperado al crear' }
    }
  }

  const handleEdit = async (data: any) => {
    if (selectedCategoria) {
      try {
        const result = await updateCategoria(selectedCategoria.id, data)
        return result
      } catch (error) {
        console.error('Error en handleEdit:', error)
        return { success: false, error: 'Error inesperado al editar' }
      }
    }
    return { success: false, error: 'No hay categoría seleccionada' }
  }

  const handleDelete = async () => {
    if (selectedCategoria) {
      const result = await deleteCategoria(selectedCategoria.id)
      return result
    }
    return { success: false, error: 'No hay categoría seleccionada' }
  }

  const handleDeleteMultiple = async () => {
    if (selectedCategorias.length > 0) {
      const ids = selectedCategorias.map(cat => cat.id)
      const result = await deleteMultipleCategorias(ids)
      return result
    }
    return { success: false, error: 'No hay categorías seleccionadas' }
  }

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: categoriasColumns,
        data: categorias as Categoria[],
        searchKey: "nombre",
        searchPlaceholder: "Buscar categorías...",
        loading: isLoading,
        error: error,
        onRowSelectionChange: selectMultipleCategorias,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: openCreateModal
      })}

      {/* Modal de Crear/Editar Categoría */}
      <CategoriaFormModal
        isOpen={showCreateModal || showEditModal}
        onClose={showCreateModal ? closeCreateModal : closeEditModal}
        onSubmit={showCreateModal ? handleCreate : handleEdit}
        categoria={showEditModal ? selectedCategoria : null}
        isLoading={isCreating || isUpdating}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={selectedCategorias.length > 1 ? handleDeleteMultiple : handleDelete}
        title={selectedCategorias.length > 1 ? "Eliminar Múltiples Categorías" : "Eliminar Categoría"}
        description={
          selectedCategorias.length > 1 
            ? `¿Estás seguro de que quieres eliminar ${selectedCategorias.length} categorías seleccionadas? Esta acción no se puede deshacer.`
            : `¿Estás seguro de que quieres eliminar la categoría "${selectedCategoria?.nombre}"? Esta acción no se puede deshacer.`
        }
        entityName="categoría"
        isDeleting={isDeleting}
      />
    </div>
  )
}
