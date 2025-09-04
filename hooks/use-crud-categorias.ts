"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { useAdminCategorias } from './use-admin-categorias'
import type { AdminCategoria } from '@/lib/database/admin_database/categorias'

// Tipos para el CRUD
export interface CrudCategoriaData {
  nombre: string
  descripcion?: string
  icono: string
}

export interface CrudCategoriaFilters {
  // No hay filtros específicos para el esquema actual
}

export interface CrudCategoriaSort {
  field: 'id' | 'nombre' | 'icono' | 'descripcion'
  direction: 'asc' | 'desc'
}

export interface CrudCategoriaPagination {
  page: number
  pageSize: number
  total: number
}

export interface UseCrudCategoriasReturn {
  // Estado de los datos
  categorias: AdminCategoria[]
  totalCategorias: number
  
  // Estados de la aplicación
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Estados del CRUD
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  
  // Estados de modales
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  
  // Datos seleccionados
  selectedCategoria: AdminCategoria | null
  selectedCategorias: AdminCategoria[]
  
  // Filtros y paginación
  filters: CrudCategoriaFilters
  sort: CrudCategoriaSort
  pagination: CrudCategoriaPagination
  
  // Operaciones CRUD
  createCategoria: (data: CrudCategoriaData) => Promise<{ success: boolean; id?: string; error?: string }>
  updateCategoria: (id: string, data: Partial<CrudCategoriaData>) => Promise<{ success: boolean; error?: string }>
  deleteCategoria: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteMultipleCategorias: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  
  // Operaciones de UI
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (categoria: AdminCategoria) => void
  closeEditModal: () => void
  openDeleteModal: (categoria: AdminCategoria) => void
  closeDeleteModal: () => void
  
  // Selección
  selectCategoria: (categoria: AdminCategoria) => void
  selectMultipleCategorias: (categorias: AdminCategoria[]) => void
  clearSelection: () => void
  toggleCategoriaSelection: (categoria: AdminCategoria) => void
  
  // Utilidades
  refreshCategorias: () => Promise<void>
  exportCategorias: (categorias: AdminCategoria[]) => void
}

export function useCrudCategorias(options: {
  initialFilters?: CrudCategoriaFilters
  initialSort?: CrudCategoriaSort
  initialPageSize?: number
} = {}): UseCrudCategoriasReturn {
  const {
    initialFilters = {},
    initialSort = { field: 'nombre', direction: 'asc' },
    initialPageSize = 10
  } = options

  // Hook de base de datos
  const {
    categorias,
    loading,
    error,
    creating,
    updating,
    deleting,
    loadCategorias,
    createCategoria: adminCreateCategoria,
    updateCategoria: adminUpdateCategoria,
    deleteCategoria: adminDeleteCategoria,
    deleteMultipleCategorias: adminDeleteMultipleCategorias,
    clearError
  } = useAdminCategorias()

  // Estados locales
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCategoria, setSelectedCategoria] = useState<AdminCategoria | null>(null)
  const [selectedCategorias, setSelectedCategorias] = useState<AdminCategoria[]>([])
  const [filters, setFilters] = useState<CrudCategoriaFilters>(initialFilters)
  const [sort, setSort] = useState<CrudCategoriaSort>(initialSort)
  const [pagination, setPagination] = useState<CrudCategoriaPagination>({
    page: 1,
    pageSize: initialPageSize,
    total: 0
  })

  // =====================================================
  // 🔧 FUNCIONES CRUD
  // =====================================================

  const createCategoria = useCallback(async (data: CrudCategoriaData) => {
    try {
      const result = await adminCreateCategoria(data)
      if (result.success) {
        closeCreateModal()
        await refreshCategorias()
        return { success: true, id: result.id }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al crear categoría' }
    }
  }, [adminCreateCategoria])

  const updateCategoria = useCallback(async (id: string, data: Partial<CrudCategoriaData>) => {
    try {
      const result = await adminUpdateCategoria(id, data)
      if (result.success) {
        closeEditModal()
        await refreshCategorias()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al actualizar categoría' }
    }
  }, [adminUpdateCategoria])

  const deleteCategoria = useCallback(async (id: string) => {
    try {
      const result = await adminDeleteCategoria(id)
      if (result.success) {
        closeDeleteModal()
        await refreshCategorias()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al eliminar categoría' }
    }
  }, [adminDeleteCategoria])

  const deleteMultipleCategorias = useCallback(async (ids: string[]) => {
    try {
      const result = await adminDeleteMultipleCategorias(ids)
      if (result.success) {
        clearSelection()
        await refreshCategorias()
        return { success: true }
      } else {
        return { success: false, error: result.error }
      }
    } catch (error) {
      return { success: false, error: 'Error inesperado al eliminar categorías' }
    }
  }, [adminDeleteMultipleCategorias])

  // =====================================================
  // 🔧 FUNCIONES DE UI
  // =====================================================

  const openCreateModal = useCallback(() => {
    setShowCreateModal(true)
    setSelectedCategoria(null)
  }, [])

  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false)
    setSelectedCategoria(null)
  }, [])

  const openEditModal = useCallback((categoria: AdminCategoria) => {
    setSelectedCategoria(categoria)
    setShowEditModal(true)
  }, [])

  const closeEditModal = useCallback(() => {
    setShowEditModal(false)
    setSelectedCategoria(null)
  }, [])

  const openDeleteModal = useCallback((categoria: AdminCategoria) => {
    setSelectedCategoria(categoria)
    setShowDeleteModal(true)
  }, [])

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setSelectedCategoria(null)
  }, [])


  // =====================================================
  // 🔧 FUNCIONES DE SELECCIÓN
  // =====================================================

  const selectCategoria = useCallback((categoria: AdminCategoria) => {
    setSelectedCategoria(categoria)
  }, [])

  const selectMultipleCategorias = useCallback((categorias: AdminCategoria[]) => {
    setSelectedCategorias(categorias)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedCategorias([])
    setSelectedCategoria(null)
  }, [])

  const toggleCategoriaSelection = useCallback((categoria: AdminCategoria) => {
    setSelectedCategorias(prev => {
      const isSelected = prev.some(cat => cat.id === categoria.id)
      if (isSelected) {
        return prev.filter(cat => cat.id !== categoria.id)
      } else {
        return [...prev, categoria]
      }
    })
  }, [])

  // =====================================================
  // 🔧 FUNCIONES UTILITARIAS
  // =====================================================

  const refreshCategorias = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await loadCategorias({
        ordenarPor: sort.field,
        orden: sort.direction,
        limite: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize
      })
    } finally {
      setIsRefreshing(false)
    }
  }, [loadCategorias, sort, pagination])

  const exportCategorias = useCallback((categorias: AdminCategoria[]) => {
    // Implementar lógica de exportación
    console.log('Exportando categorías:', categorias)
  }, [])

  // Cargar categorías al montar el componente
  React.useEffect(() => {
    loadCategorias({
      ordenarPor: sort.field,
      orden: sort.direction,
      limite: pagination.pageSize,
      offset: 0
    })
  }, [loadCategorias, sort.field, sort.direction, pagination.pageSize])

  // Actualizar paginación cuando cambian los datos
  React.useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: categorias.length
    }))
  }, [categorias.length])

  return {
    // Estado de los datos
    categorias,
    totalCategorias: categorias.length,
    
    // Estados de la aplicación
    isLoading: loading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isCreating: creating,
    isUpdating: updating,
    isDeleting: deleting,
    
    // Estados de modales
    showCreateModal,
    showEditModal,
    showDeleteModal,
    
    // Datos seleccionados
    selectedCategoria,
    selectedCategorias,
    
    // Filtros y paginación
    filters,
    sort,
    pagination,
    
    // Operaciones CRUD
    createCategoria,
    updateCategoria,
    deleteCategoria,
    deleteMultipleCategorias,
    
    // Operaciones de UI
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    
    // Selección
    selectCategoria,
    selectMultipleCategorias,
    clearSelection,
    toggleCategoriaSelection,
    
    // Utilidades
    loadCategorias,
    refreshCategorias,
    exportCategorias
  }
}
