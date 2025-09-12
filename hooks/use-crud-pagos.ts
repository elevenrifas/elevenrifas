"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { 
  adminListPagos, 
  adminGetPago,
  adminVerifyPago,
  adminRejectPago,
  adminUpdatePago,
  adminDeletePago
} from '@/lib/database/admin_database/pagos'
import type { AdminPago, AdminPagoEstado } from '@/lib/database/admin_database/pagos'

// =====================================================
// 🎯 HOOK CRUD PAGOS - ELEVEN RIFAS
// =====================================================
// Hook personalizado para gestión completa de pagos
// Sigue el mismo patrón que use-crud-rifas
// =====================================================

export interface CrudPagoFilters {
  estado?: AdminPagoEstado
  tipo_pago?: string
  rifa_id?: string
  search?: string
}

export interface CrudPagoSort {
  field: 'fecha_pago' | 'monto_usd' | 'estado' | 'tipo_pago'
  direction: 'asc' | 'desc'
}

export interface UseCrudPagosReturn {
  // Estado de los datos
  pagos: AdminPago[]
  totalPagos: number
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Estados del CRUD
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isVerifying: boolean
  isRejecting: boolean
  
  // Estados de modales
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  showViewModal: boolean
  showVerifyModal: boolean
  showRejectModal: boolean
  
  // Datos seleccionados
  selectedPago: AdminPago | null
  selectedPagos: AdminPago[]
  
  // Operaciones CRUD
  createPago: (data: any) => Promise<{ success: boolean; error?: string }>
  updatePago: (id: string, data: any) => Promise<{ success: boolean; error?: string }>
  deletePago: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteMultiplePagos: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  verifyPago: (id: string, verificadoPor: string, options?: { especialesCantidad?: number; modo?: 'agregar' | 'reemplazar'; selectedIds?: string[] }) => Promise<{ success: boolean; error?: string }>
  rejectPago: (id: string, verificadoPor: string) => Promise<{ success: boolean; error?: string }>
  
  // Operaciones de UI
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (pago: AdminPago) => void
  closeEditModal: () => void
  openDeleteModal: (pago: AdminPago) => void
  closeDeleteModal: () => void
  openViewModal: (pago: AdminPago) => void
  closeViewModal: () => void
  openVerifyModal: (pago: AdminPago) => void
  closeVerifyModal: () => void
  openRejectModal: (pago: AdminPago) => void
  closeRejectModal: () => void
  
  // Selección
  selectPago: (pago: AdminPago) => void
  selectMultiplePagos: (pagos: AdminPago[]) => void
  clearSelection: () => void
  togglePagoSelection: (pago: AdminPago) => void
  
  // Filtros y ordenamiento
  filters: CrudPagoFilters
  sort: CrudPagoSort
  setFilters: (filters: Partial<CrudPagoFilters>) => void
  setSort: (sort: CrudPagoSort) => void
  clearFilters: () => void
  
  // Utilidades
  refreshPagos: () => Promise<void>
  exportPagos: (pagos?: AdminPago[]) => void
}

export function useCrudPagos(options: {
  initialFilters?: CrudPagoFilters
  initialSort?: CrudPagoSort
  initialPageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
} = {}): UseCrudPagosReturn {
  const {
    initialFilters = {},
    initialSort = { field: 'fecha_pago', direction: 'desc' },
    initialPageSize = 10,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  // Estados base
  const [pagos, setPagos] = useState<AdminPago[]>([])
  const [totalPagos, setTotalPagos] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Estados del CRUD
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  // Datos seleccionados
  const [selectedPago, setSelectedPago] = useState<AdminPago | null>(null)
  const [selectedPagos, setSelectedPagos] = useState<AdminPago[]>([])

  // Filtros y paginación
  const [filters, setFiltersState] = useState<CrudPagoFilters>(initialFilters)
  const [sort, setSortState] = useState<CrudPagoSort>(initialSort)

  // Función para cargar pagos
  const loadPagos = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔄 Cargando pagos con filtros:', filters)
      const result = await adminListPagos({
        estado: filters.estado,
        rifa_id: filters.rifa_id,
        ordenarPor: sort.field,
        orden: sort.direction
      })
      
      if (result.success) {
        let pagosData = result.data || []
        
        // Aplicar filtro de búsqueda si existe
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase().trim()
          pagosData = pagosData.filter(pago => {
            const primerTicket = pago.tickets?.[0]
            const clienteNombre = primerTicket?.nombre?.toLowerCase() || ''
            const clienteCedula = primerTicket?.cedula?.toLowerCase() || ''
            const referencia = (pago.referencia || '').toLowerCase()
            const rifaTitulo = primerTicket?.rifas?.titulo?.toLowerCase() || ''
            
            return (
              clienteNombre.includes(searchTerm) ||
              clienteCedula.includes(searchTerm) ||
              referencia.includes(searchTerm) ||
              rifaTitulo.includes(searchTerm)
            )
          })
        }
        
        setPagos(pagosData)
        setTotalPagos(pagosData.length)
        console.log(`✅ Pagos cargados: ${pagosData.length}`)
      } else {
        setError(result.error || 'Error desconocido al cargar pagos')
        console.error('❌ Error al cargar pagos:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar pagos'
      setError(errorMessage)
      console.error('❌ Error inesperado al cargar pagos:', err)
    } finally {
      setIsLoading(false)
    }
  }, [filters.estado, filters.rifa_id, filters.search, sort.field, sort.direction])

  // Función para refrescar pagos
  const refreshPagos = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await loadPagos()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadPagos])

  // Operaciones CRUD
  const createPago = useCallback(async (data: any) => {
    try {
      setIsCreating(true)
      setError(null)
      
      // TODO: Implementar creación de pago
      console.log('📝 Creando pago:', data)
      
      // Simular operación exitosa por ahora
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      await refreshPagos()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear pago'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsCreating(false)
    }
  }, [refreshPagos])

  const updatePago = useCallback(async (id: string, data: any) => {
    try {
      setIsUpdating(true)
      setError(null)
      
      console.log('✏️ Actualizando pago:', id, data)
      const result = await adminUpdatePago(id, data)
      
      if (result.success) {
        await refreshPagos()
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al actualizar pago' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar pago'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }, [refreshPagos])

  const deletePago = useCallback(async (id: string) => {
    try {
      setIsDeleting(true)
      setError(null)
      
      console.log('🗑️ Eliminando pago:', id)
      const result = await adminDeletePago(id)
      
      if (result.success) {
        await refreshPagos()
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al eliminar pago' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar pago'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshPagos])

  const deleteMultiplePagos = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true)
      setError(null)
      
      console.log('🗑️ Eliminando múltiples pagos:', ids)
      
      // Eliminar pagos uno por uno
      const results = await Promise.all(
        ids.map(id => adminDeletePago(id))
      )
      
      const failed = results.filter(r => !r.success)
      if (failed.length > 0) {
        const errorMessage = `${failed.length} de ${ids.length} pagos no pudieron ser eliminados`
        setError(errorMessage)
        return { success: false, error: errorMessage }
      }
      
      await refreshPagos()
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar pagos'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshPagos])

  const verifyPago = useCallback(async (id: string, verificadoPor: string, options?: { especialesCantidad?: number; modo?: 'agregar' | 'reemplazar'; selectedIds?: string[] }) => {
    try {
      setIsVerifying(true)
      setError(null)
      
      console.log('✅ Verificando pago:', id, verificadoPor, options)
      const result = await adminVerifyPago(id, verificadoPor, options)
      
      if (result.success) {
        await refreshPagos()
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al verificar pago' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al verificar pago'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsVerifying(false)
    }
  }, [refreshPagos])

  const rejectPago = useCallback(async (id: string, verificadoPor: string, rechazoNote?: string) => {
    try {
      setIsRejecting(true)
      setError(null)
      
      console.log('❌ Rechazando pago:', id, verificadoPor, rechazoNote)
      const result = await adminRejectPago(id, verificadoPor, rechazoNote)
      
      if (result.success) {
        await refreshPagos()
        return { success: true }
      } else {
        return { success: false, error: result.error || 'Error al rechazar pago' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al rechazar pago'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    } finally {
      setIsRejecting(false)
    }
  }, [refreshPagos])

  // Operaciones de UI
  const openCreateModal = useCallback(() => setShowCreateModal(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])
  
  const openEditModal = useCallback((pago: AdminPago) => {
    setSelectedPago(pago)
    setShowEditModal(true)
  }, [])
  const closeEditModal = useCallback(() => setShowEditModal(false), [])
  
  const openDeleteModal = useCallback((pago: AdminPago) => {
    setSelectedPago(pago)
    setShowDeleteModal(true)
  }, [])
  const closeDeleteModal = useCallback(() => setShowDeleteModal(false), [])
  
  const openViewModal = useCallback((pago: AdminPago) => {
    setSelectedPago(pago)
    setShowViewModal(true)
  }, [])
  const closeViewModal = useCallback(() => setShowViewModal(false), [])
  
  const openVerifyModal = useCallback((pago: AdminPago) => {
    setSelectedPago(pago)
    setShowVerifyModal(true)
  }, [])
  const closeVerifyModal = useCallback(() => setShowVerifyModal(false), [])
  
  const openRejectModal = useCallback((pago: AdminPago) => {
    console.log('🚫 openRejectModal ejecutado para pago:', pago.id)
    setSelectedPago(pago)
    setShowRejectModal(true)
  }, [])
  const closeRejectModal = useCallback(() => setShowRejectModal(false), [])

  // Selección
  const selectPago = useCallback((pago: AdminPago) => {
    setSelectedPago(pago)
  }, [])

  const selectMultiplePagos = useCallback((pagos: AdminPago[]) => {
    setSelectedPagos(pagos)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedPago(null)
    setSelectedPagos([])
  }, [])

  const togglePagoSelection = useCallback((pago: AdminPago) => {
    setSelectedPagos(prev => {
      const exists = prev.find(p => p.id === pago.id)
      if (exists) {
        return prev.filter(p => p.id !== pago.id)
      } else {
        return [...prev, pago]
      }
    })
  }, [])

  // Funciones de filtros
  const setFilters = useCallback((newFilters: Partial<CrudPagoFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
  }, [])

  const setSort = useCallback((newSort: CrudPagoSort) => {
    setSortState(newSort)
  }, [])

  const clearFilters = useCallback(() => {
    setFiltersState({})
  }, [])

  // Utilidades
  const exportPagos = useCallback((pagosToExport?: AdminPago[]) => {
    const dataToExport = pagosToExport || pagos
    console.log('📊 Exportando pagos:', dataToExport.length)
    // TODO: Implementar exportación
  }, [pagos])

  // Cargar pagos al montar
  React.useEffect(() => {
    loadPagos()
  }, [loadPagos])

  return {
    // Estado de los datos
    pagos,
    totalPagos,
    isLoading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isCreating,
    isUpdating,
    isDeleting,
    isVerifying,
    isRejecting,
    
    // Estados de modales
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    showVerifyModal,
    showRejectModal,
    
    // Datos seleccionados
    selectedPago,
    selectedPagos,
    
    // Operaciones CRUD
    createPago,
    updatePago,
    deletePago,
    deleteMultiplePagos,
    verifyPago,
    rejectPago,
    
    // Operaciones de UI
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
    openVerifyModal,
    closeVerifyModal,
    openRejectModal,
    closeRejectModal,
    
    // Selección
    selectPago,
    selectMultiplePagos,
    clearSelection,
    togglePagoSelection,
    
    // Filtros y ordenamiento
    filters,
    sort,
    setFilters,
    setSort,
    clearFilters,
    
    // Utilidades
    refreshPagos,
    exportPagos
  }
}
