"use client"

import { CategoriasRifasTable } from "@/app/admin/components/tables/CategoriasRifasTable"
import { CategoriaFormModal } from "@/app/admin/components/modals/CategoriaFormModal"
import { CategoriaViewModal } from "@/app/admin/components/modals/CategoriaViewModal"
import { DeleteConfirmModal } from "@/app/admin/components/modals/DeleteConfirmModal"
import { useCrudCategorias } from "@/hooks/use-crud-categorias"
import { useState } from "react"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"

// =====================================================
// 🎯 PÁGINA CATEGORÍAS - ELEVEN RIFAS
// =====================================================
// Página principal para gestionar categorías de rifas
// Implementa funcionalidad completa de CRUD
// =====================================================

export default function CategoriasPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<AdminCategoria | null>(null)

  const {
    categorias,
    isLoading,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    deleteMultipleCategorias,
    refreshCategorias
  } = useCrudCategorias()

  // =====================================================
  // 🔧 FUNCIONES DE MANEJO
  // =====================================================

  const handleCreate = async (data: any) => {
    try {
      const result = await createCategoria(data)
      if (result.success) {
        setShowCreateModal(false)
        await refreshCategorias()
      }
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
        if (result.success) {
          setShowEditModal(false)
          setSelectedCategoria(null)
          await refreshCategorias()
        }
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
      if (result.success) {
        setShowDeleteModal(false)
        setSelectedCategoria(null)
        await refreshCategorias()
      }
      return result
    }
    return { success: false, error: 'No hay categoría seleccionada' }
  }

  const handleDeleteMultiple = async (categorias: AdminCategoria[]) => {
    try {
      const ids = categorias.map(cat => cat.id)
      const result = await deleteMultipleCategorias(ids)
      if (result.success) {
        await refreshCategorias()
      }
      return result
    } catch (error) {
      console.error('Error en handleDeleteMultiple:', error)
      return { success: false, error: 'Error inesperado al eliminar' }
    }
  }

  // =====================================================
  // 🎨 RENDERIZADO
  // =====================================================

  return (
    <div className="px-4 lg:px-6">
      {/* Tabla de categorías */}
      <CategoriasRifasTable
        onCreate={() => setShowCreateModal(true)}
        onEdit={(categoria) => {
          setSelectedCategoria(categoria)
          setShowEditModal(true)
        }}
        onView={(categoria) => {
          setSelectedCategoria(categoria)
          setShowViewModal(true)
        }}
        onDelete={handleDeleteMultiple}
      />

      {/* Modal de Crear Categoría */}
      <CategoriaFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      {/* Modal de Editar Categoría */}
      <CategoriaFormModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedCategoria(null)
        }}
        onSubmit={handleEdit}
        categoria={selectedCategoria}
        isLoading={isUpdating}
      />

      {/* Modal de Ver Categoría */}
      <CategoriaViewModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false)
          setSelectedCategoria(null)
        }}
        categoria={selectedCategoria}
        onEdit={(categoria) => {
          setSelectedCategoria(categoria)
          setShowViewModal(false)
          setShowEditModal(true)
        }}
        onDelete={(categoria) => {
          setSelectedCategoria(categoria)
          setShowViewModal(false)
          setShowDeleteModal(true)
        }}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedCategoria(null)
        }}
        onConfirm={handleDelete}
        title="Eliminar Categoría"
        description={`¿Estás seguro de que quieres eliminar la categoría "${selectedCategoria?.nombre}"? Esta acción no se puede deshacer.`}
        entityName="categoría"
        isDeleting={isDeleting}
      />
    </div>
  )
}
