"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { useAdminRifas } from './use-admin-rifas'
import type { AdminRifa } from '@/lib/database/admin_database/rifas'

// Tipos para el CRUD - Actualizado según el schema real de la BD
export interface CrudRifaData {
  titulo: string
  descripcion?: string
  precio_ticket: number
  imagen_url?: string
  estado: 'activa' | 'cerrada'
  total_tickets: number
  tickets_disponibles?: number // Opcional ya que es un campo calculado
  categoria_id?: string | null
  numero_tickets_comprar?: number[]
  progreso_manual?: number | null
  fecha_cierre?: string | null
}

export interface CrudRifaFilters {
  estado?: string
  categoria_id?: string
}

export interface CrudRifaSort {
  field: keyof AdminRifa
  direction: 'asc' | 'desc'
}

export interface CrudRifaPagination {
  page: number
  pageSize: number
  total: number
}

export interface UseCrudRifasReturn {
  // Estado de los datos
  rifas: AdminRifa[]
  totalRifas: number
  
  // Estados de la aplicación
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Estados del CRUD
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isViewing: boolean
  
  // Estados de modales
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  showViewModal: boolean
  showDuplicateModal: boolean
  
  // Datos seleccionados
  selectedRifa: AdminRifa | null
  selectedRifas: AdminRifa[]
  
  // Filtros y paginación
  filters: CrudRifaFilters
  sort: CrudRifaSort
  pagination: CrudRifaPagination
  
  // Operaciones CRUD
  createRifa: (data: CrudRifaData) => Promise<{ success: boolean; id?: string; error?: string }>
  updateRifa: (id: string, data: Partial<CrudRifaData>) => Promise<{ success: boolean; error?: string }>
  deleteRifa: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteMultipleRifas: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  changeRifaState: (id: string, estado: 'activa' | 'cerrada') => Promise<{ success: boolean; error?: string }>
  
  // Operaciones de UI
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (rifa: AdminRifa) => void
  closeEditModal: () => void
  openDeleteModal: (rifa: AdminRifa) => void
  closeDeleteModal: () => void
  openViewModal: (rifa: AdminRifa) => void
  closeViewModal: () => void
  openDuplicateModal: (rifa: AdminRifa) => void
  closeDuplicateModal: () => void
  
  // Selección
  selectRifa: (rifa: AdminRifa) => void
  selectMultipleRifas: (rifas: AdminRifa[]) => void
  clearSelection: () => void
  toggleRifaSelection: (rifa: AdminRifa) => void
  
  // Filtros y ordenamiento
  setFilters: (filters: Partial<CrudRifaFilters>) => void
  setSort: (sort: CrudRifaSort) => void
  setPagination: (pagination: Partial<CrudRifaPagination>) => void
  
  // Utilidades
  refreshRifas: () => Promise<void>
  getRifaById: (id: string) => AdminRifa | undefined
  getRifasByEstado: (estado: string) => AdminRifa[]
  getRifasByCategoria: (categoria: string) => AdminRifa[]
  
  // Exportación
  exportRifas: (rifas?: AdminRifa[]) => Promise<{ success: boolean; error?: string }>
}

export function useCrudRifas(options: {
  initialFilters?: CrudRifaFilters
  initialSort?: CrudRifaSort
  initialPageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
} = {}): UseCrudRifasReturn {
  const {
    initialFilters = {},
    initialSort = { field: 'fecha_creacion', direction: 'desc' },
    initialPageSize = 10,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  // Hook base para datos
  const {
    rifas,
    totalRifas,
    isLoading,
    isRefreshing,
    error,
    refreshRifas,
    createRifa: baseCreateRifa,
    updateRifa: baseUpdateRifa,
    changeRifaState: baseChangeRifaState,
    getRifaById,
    getRifasByEstado,
    getRifasByCategoria
  } = useAdminRifas({
    incluirCerradas: true,
    incluirInactivas: true,
    ordenarPor: initialSort.field,
    orden: initialSort.direction,
    autoRefresh,
    refreshInterval
  })

  // Estados del CRUD
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isViewing, setIsViewing] = useState(false)

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)

  // Datos seleccionados
  const [selectedRifa, setSelectedRifa] = useState<AdminRifa | null>(null)
  const [selectedRifas, setSelectedRifas] = useState<AdminRifa[]>([])

  // Filtros y paginación
  const [filters, setFiltersState] = useState<CrudRifaFilters>(initialFilters)
  const [sort, setSortState] = useState<CrudRifaSort>(initialSort)
  const [pagination, setPaginationState] = useState<CrudRifaPagination>({
    page: 1,
    pageSize: initialPageSize,
    total: 0
  })

  // Operaciones CRUD
  const createRifa = useCallback(async (data: CrudRifaData) => {
    try {
      setIsCreating(true)
      const result = await baseCreateRifa(data)
      
      if (result.success) {
        closeCreateModal()
        await refreshRifas()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear rifa'
      return { success: false, error: errorMessage }
    } finally {
      setIsCreating(false)
    }
  }, [baseCreateRifa, refreshRifas])

  const updateRifa = useCallback(async (id: string, data: Partial<CrudRifaData>) => {
    try {
      setIsUpdating(true)
      const result = await baseUpdateRifa(id, data)
      
      if (result.success) {
        closeEditModal()
        await refreshRifas()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar rifa'
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }, [baseUpdateRifa, refreshRifas])

  const deleteRifa = useCallback(async (id: string) => {
    try {
      setIsDeleting(true)
      
      // Importar dinámicamente la función de eliminación
      const { adminDeleteRifa } = await import('@/lib/database/admin_database/rifas')
      
      // Ejecutar la eliminación real
      const result = await adminDeleteRifa(id)
      
      if (result.success) {
        closeDeleteModal()
        await refreshRifas()
        return result
      } else {
        // Mostrar error específico al usuario
        console.error('Error al eliminar rifa:', result.error)
        if (result.details) {
          console.error('Detalles del error:', result.details)
        }
        return result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar rifa'
      console.error('Error inesperado en deleteRifa:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshRifas])

  const deleteMultipleRifas = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true)
      
      // Importar dinámicamente la función de eliminación múltiple
      const { adminDeleteMultipleRifas } = await import('@/lib/database/admin_database/rifas')
      
      // Ejecutar la eliminación múltiple real
      const result = await adminDeleteMultipleRifas(ids)
      
      if (result.success) {
        clearSelection()
        await refreshRifas()
        return result
      } else {
        // Mostrar error específico al usuario
        console.error('Error al eliminar múltiples rifas:', result.error)
        if (result.results) {
          console.error('Resultados individuales:', result.results)
        }
        return result
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar rifas'
      console.error('Error inesperado en deleteMultipleRifas:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshRifas])

  const changeRifaState = useCallback(async (id: string, estado: 'activa' | 'cerrada') => {
    try {
      const result = await baseChangeRifaState(id, estado)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado'
      return { success: false, error: errorMessage }
    }
  }, [baseChangeRifaState])

  // Operaciones de UI
  const openCreateModal = useCallback(() => setShowCreateModal(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])
  
  const openEditModal = useCallback((rifa: AdminRifa) => {
    setSelectedRifa(rifa)
    setShowEditModal(true)
  }, [])
  
  const closeEditModal = useCallback(() => {
    setShowEditModal(false)
    setSelectedRifa(null)
  }, [])
  
  const openDeleteModal = useCallback((rifa: AdminRifa) => {
    setSelectedRifa(rifa)
    setShowDeleteModal(true)
  }, [])
  
  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setSelectedRifa(null)
  }, [])
  
  const openViewModal = useCallback((rifa: AdminRifa) => {
    setSelectedRifa(rifa)
    setShowViewModal(true)
  }, [])
  
  const closeViewModal = useCallback(() => {
    setShowViewModal(false)
    setSelectedRifa(null)
  }, [])
  
  const openDuplicateModal = useCallback((rifa: AdminRifa) => {
    setSelectedRifa(rifa)
    setShowDuplicateModal(true)
  }, [])
  
  const closeDuplicateModal = useCallback(() => {
    setShowDuplicateModal(false)
    setSelectedRifa(null)
  }, [])

  // Selección
  const selectRifa = useCallback((rifa: AdminRifa) => {
    setSelectedRifa(rifa)
  }, [])

  const selectMultipleRifas = useCallback((rifas: AdminRifa[]) => {
    setSelectedRifas(rifas)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedRifas([])
    setSelectedRifa(null)
  }, [])

  const toggleRifaSelection = useCallback((rifa: AdminRifa) => {
    setSelectedRifas(prev => {
      const isSelected = prev.some(r => r.id === rifa.id)
      if (isSelected) {
        return prev.filter(r => r.id !== rifa.id)
      } else {
        return [...prev, rifa]
      }
    })
  }, [])

  // Filtros y ordenamiento
  const setFilters = useCallback((newFilters: Partial<CrudRifaFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, page: 1 })) // Reset a primera página
  }, [])

  const setSort = useCallback((newSort: CrudRifaSort) => {
    setSortState(newSort)
  }, [])

  const setPagination = useCallback((newPagination: Partial<CrudRifaPagination>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  // Exportación
  const exportRifas = useCallback(async (rifasToExport?: AdminRifa[]) => {
    try {
      const rifasToProcess = rifasToExport || selectedRifas.length > 0 ? selectedRifas : rifas
      
      // Aquí implementarías la lógica real de exportación
      console.log('Exportando rifas:', rifasToProcess)
      
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al exportar'
      return { success: false, error: errorMessage }
    }
  }, [rifas, selectedRifas])

  // Actualizar paginación cuando cambien los datos
  React.useEffect(() => {
    setPaginationState(prev => ({
      ...prev,
      total: totalRifas
    }))
  }, [totalRifas])

  return {
    // Estado de los datos
    rifas,
    totalRifas,
    
    // Estados de la aplicación
    isLoading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isCreating,
    isUpdating,
    isDeleting,
    isViewing,
    
      // Estados de modales
  showCreateModal,
  showEditModal,
  showDeleteModal,
  showViewModal,
  showDuplicateModal,
    
    // Datos seleccionados
    selectedRifa,
    selectedRifas,
    
    // Filtros y paginación
    filters,
    sort,
    pagination,
    
    // Operaciones CRUD
    createRifa,
    updateRifa,
    deleteRifa,
    deleteMultipleRifas,
    changeRifaState,
    
      // Operaciones de UI
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  openDeleteModal,
  closeDeleteModal,
  openViewModal,
  closeViewModal,
  openDuplicateModal,
  closeDuplicateModal,
    
    // Selección
    selectRifa,
    selectMultipleRifas,
    clearSelection,
    toggleRifaSelection,
    
    // Filtros y ordenamiento
    setFilters,
    setSort,
    setPagination,
    
    // Utilidades
    refreshRifas,
    getRifaById,
    getRifasByEstado,
    getRifasByCategoria,
    
    // Exportación
    exportRifas
  }
}
