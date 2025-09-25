"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { useAdminTickets } from './use-admin-tickets'
import { adminCreateTicketReservado } from '@/lib/database/admin_database/tickets'
import type { AdminTicket, CreateTicketData, UpdateTicketData } from '@/types'

// Tipos para el CRUD
export interface CrudTicketData {
  rifa_id: string
  numero_ticket: string
  precio: number
  nombre: string
  cedula: string
  telefono?: string
  correo: string
  estado?: 'reservado' | 'pagado' | 'verificado' | 'cancelado'
  email?: string
}

export interface CrudTicketFilters {
  rifa_id?: string
  estado?: string
  estado_verificacion?: string
  bloqueado_por_pago?: boolean
}

export interface CrudTicketSort {
  field: keyof AdminTicket
  direction: 'asc' | 'desc'
}

export interface CrudTicketPagination {
  page: number
  pageSize: number
  total: number
}

export interface UseCrudTicketsReturn {
  // Estado de los datos
  tickets: AdminTicket[]
  totalTickets: number
  
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
  selectedTicket: AdminTicket | null
  selectedTickets: AdminTicket[]
  
  // Filtros y paginación
  filters: CrudTicketFilters
  sort: CrudTicketSort
  pagination: CrudTicketPagination
  
  // Operaciones CRUD
  createTicket: (data: CrudTicketData) => Promise<{ success: boolean; id?: string; error?: string }>
  updateTicket: (id: string, data: Partial<CrudTicketData>) => Promise<{ success: boolean; error?: string }>
  deleteTicket: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteMultipleTickets: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  changeTicketState: (id: string, estado: 'pendiente' | 'verificado' | 'rechazado') => Promise<{ success: boolean; error?: string }>
  changeTicketVerificationState: (id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado') => Promise<{ success: boolean; error?: string }>
  toggleTicketPaymentBlock: (id: string, bloqueado: boolean, pago_id?: string) => Promise<{ success: boolean; error?: string }>
  reservarTicket: (data: { rifa_id: string; numero_ticket: string; nombre?: string; cedula?: string; telefono?: string; correo?: string }) => Promise<{ success: boolean; error?: string }>
  
  // Operaciones de UI
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (ticket: AdminTicket) => void
  closeEditModal: () => void
  openDeleteModal: (ticket: AdminTicket) => void
  closeDeleteModal: () => void
  openViewModal: (ticket: AdminTicket) => void
  closeViewModal: () => void
  openDuplicateModal: (ticket: AdminTicket) => void
  closeDuplicateModal: () => void
  
  // Selección
  selectTicket: (ticket: AdminTicket) => void
  selectMultipleTickets: (tickets: AdminTicket[]) => void
  clearSelection: () => void
  toggleTicketSelection: (ticket: AdminTicket) => void
  
  // Filtros y ordenamiento
  setFilters: (filters: Partial<CrudTicketFilters>) => void
  setSort: (sort: CrudTicketSort) => void
  setPagination: (pagination: Partial<CrudTicketPagination>) => void
  
  // Utilidades
  refreshTickets: () => Promise<void>
  getTicketById: (id: string) => AdminTicket | undefined
  getTicketsByRifa: (rifa_id: string) => AdminTicket[]
  
  // Exportación
  exportTickets: (tickets?: AdminTicket[]) => Promise<{ success: boolean; error?: string }>
}

export function useCrudTickets(options: {
  initialFilters?: CrudTicketFilters
  initialSort?: CrudTicketSort
  initialPageSize?: number
  autoRefresh?: boolean
  refreshInterval?: number
} = {}): UseCrudTicketsReturn {
  const {
    initialFilters = {},
    initialSort = { field: 'fecha_compra', direction: 'desc' },
    initialPageSize = 10,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  // Hook base para datos
  const {
    tickets,
    totalTickets,
    isLoading,
    isRefreshing,
    error,
    refreshTickets,
    createTicket: baseCreateTicket,
    updateTicket: baseUpdateTicket,
    deleteTicket: baseDeleteTicket, // Agregamos la función de eliminación del hook base
    getTicketById,
    getTicketsByRifa
  } = useAdminTickets({
    ...initialFilters,
    ordenarPor: initialSort.field,
    orden: initialSort.direction,
    limite: initialPageSize, // Agregamos el límite de página
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
  const [selectedTicket, setSelectedTicket] = useState<AdminTicket | null>(null)
  const [selectedTickets, setSelectedTickets] = useState<AdminTicket[]>([])

  // Filtros y paginación
  const [filters, setFiltersState] = useState<CrudTicketFilters>(initialFilters)
  const [sort, setSortState] = useState<CrudTicketSort>(initialSort)
  const [pagination, setPaginationState] = useState<CrudTicketPagination>({
    page: 1,
    pageSize: initialPageSize,
    total: 0
  })

  // Operaciones CRUD
  const createTicket = useCallback(async (data: CrudTicketData) => {
    try {
      setIsCreating(true)
      const result = await baseCreateTicket(data)
      
      if (result.success) {
        closeCreateModal()
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear ticket'
      return { success: false, error: errorMessage }
    } finally {
      setIsCreating(false)
    }
  }, [baseCreateTicket, refreshTickets])

  const updateTicket = useCallback(async (id: string, data: Partial<CrudTicketData>) => {
    try {
      setIsUpdating(true)
      const result = await baseUpdateTicket(id, data)
      
      if (result.success) {
        closeEditModal()
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar ticket'
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }, [baseUpdateTicket, refreshTickets])

  const deleteTicket = useCallback(async (id: string) => {
    try {
      setIsDeleting(true)
      console.log('🔄 [useCrudTickets] deleteTicket iniciando para ID:', id)
      
      // Usar la función real del hook base
      const result = await baseDeleteTicket(id)
      
      if (result.success) {
        console.log('✅ [useCrudTickets] Ticket eliminado exitosamente')
        closeDeleteModal()
        // Llamar directamente a refreshTickets como hace DataTableToolbar
        console.log('🔄 [useCrudTickets] Llamando a refreshTickets...')
        refreshTickets()
        console.log('✅ [useCrudTickets] RefreshTickets llamado')
      } else {
        console.error('❌ [useCrudTickets] Error al eliminar ticket:', result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar ticket'
      console.error('💥 [useCrudTickets] Error inesperado en deleteTicket:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [baseDeleteTicket, refreshTickets])

  const deleteMultipleTickets = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true)
      console.log('🔄 [useCrudTickets] deleteMultipleTickets iniciando para IDs:', ids)
      
      // Importar la función de eliminación múltiple optimizada
      const { adminDeleteMultipleTickets } = await import('@/lib/database/admin_database/tickets')
      
      // Usar la función optimizada que valida tickets especiales sin pago
      const result = await adminDeleteMultipleTickets(ids)
      
      if (result.success) {
        console.log('✅ [useCrudTickets] Tickets eliminados exitosamente')
        console.log('📊 [useCrudTickets] Detalles:', result.details)
        clearSelection()
        // Llamar directamente a refreshTickets como hace DataTableToolbar
        console.log('🔄 [useCrudTickets] Llamando a refreshTickets...')
        refreshTickets()
        console.log('✅ [useCrudTickets] RefreshTickets llamado')
        return { success: true, details: result.details }
      } else {
        console.error('❌ [useCrudTickets] Error al eliminar tickets:', result.error)
        return { success: false, error: result.error }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar tickets'
      console.error('💥 [useCrudTickets] Error inesperado en deleteMultipleTickets:', err)
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshTickets])

  const changeTicketState = useCallback(async (id: string, estado: 'pendiente' | 'verificado' | 'rechazado') => {
    try {
      // Función no implementada por ahora
      console.warn('Función changeTicketState no implementada')
      return { success: false, error: 'Función no implementada' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado'
      return { success: false, error: errorMessage }
    }
  }, [])

  const changeTicketVerificationState = useCallback(async (id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado') => {
    try {
      // Función no implementada por ahora
      console.warn('Función changeTicketVerificationState no implementada')
      return { success: false, error: 'Función no implementada' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado de verificación'
      return { success: false, error: errorMessage }
    }
  }, [])

  const toggleTicketPaymentBlock = useCallback(async (id: string, bloqueado: boolean, pago_id?: string) => {
    try {
      // Función no implementada por ahora
      console.warn('Función toggleTicketPaymentBlock no implementada')
      return { success: false, error: 'Función no implementada' }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar bloqueo'
      return { success: false, error: errorMessage }
    }
  }, [])

  const reservarTicket = useCallback(async (data: { rifa_id: string; numero_ticket: string; nombre?: string; cedula?: string; telefono?: string; correo?: string }) => {
    try {
      console.log('🎫 [useCrudTickets] reservarTicket iniciando:', data)
      
      const result = await adminCreateTicketReservado(data)
      
      if (result.success) {
        console.log('✅ [useCrudTickets] Ticket reservado exitosamente')
        await refreshTickets()
      } else {
        console.error('❌ [useCrudTickets] Error al reservar ticket:', result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al reservar ticket'
      console.error('💥 [useCrudTickets] Error inesperado en reservarTicket:', err)
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Operaciones de UI
  const openCreateModal = useCallback(() => setShowCreateModal(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])
  
  const openEditModal = useCallback((ticket: AdminTicket) => {
    setSelectedTicket(ticket)
    setShowEditModal(true)
  }, [])
  
  const closeEditModal = useCallback(() => {
    setShowEditModal(false)
    setSelectedTicket(null)
  }, [])
  
  const openDeleteModal = useCallback((ticket: AdminTicket) => {
    setSelectedTicket(ticket)
    setShowDeleteModal(true)
  }, [])
  
  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setSelectedTicket(null)
  }, [])
  
  const openViewModal = useCallback((ticket: AdminTicket) => {
    setSelectedTicket(ticket)
    setShowViewModal(true)
  }, [])
  
  const closeViewModal = useCallback(() => {
    setShowViewModal(false)
    setSelectedTicket(null)
  }, [])
  
  const openDuplicateModal = useCallback((ticket: AdminTicket) => {
    setSelectedTicket(ticket)
    setShowDuplicateModal(true)
  }, [])
  
  const closeDuplicateModal = useCallback(() => {
    setShowDuplicateModal(false)
    setSelectedTicket(null)
  }, [])

  // Selección
  const selectTicket = useCallback((ticket: AdminTicket) => {
    setSelectedTicket(ticket)
  }, [])

  const selectMultipleTickets = useCallback((tickets: AdminTicket[]) => {
    setSelectedTickets(tickets)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedTickets([])
    setSelectedTicket(null)
  }, [])

  const toggleTicketSelection = useCallback((ticket: AdminTicket) => {
    setSelectedTickets(prev => {
      const isSelected = prev.some(t => t.id === ticket.id)
      if (isSelected) {
        return prev.filter(t => t.id !== ticket.id)
      } else {
        return [...prev, ticket]
      }
    })
  }, [])

  // Filtros y ordenamiento
  const setFilters = useCallback((newFilters: Partial<CrudTicketFilters>) => {
    setFiltersState(prev => ({ ...prev, ...newFilters }))
    setPaginationState(prev => ({ ...prev, page: 1 })) // Reset a primera página
  }, [])

  const setSort = useCallback((newSort: CrudTicketSort) => {
    setSortState(newSort)
  }, [])

  const setPagination = useCallback((newPagination: Partial<CrudTicketPagination>) => {
    setPaginationState(prev => ({ ...prev, ...newPagination }))
  }, [])

  // Exportación
  const exportTickets = useCallback(async (ticketsToExport?: AdminTicket[]) => {
    try {
      const ticketsToProcess = ticketsToExport || selectedTickets.length > 0 ? selectedTickets : tickets
      
      // Aquí implementarías la lógica real de exportación
      console.log('Exportando tickets:', ticketsToProcess)
      
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al exportar'
      return { success: false, error: errorMessage }
    }
  }, [tickets, selectedTickets])

  // Actualizar paginación cuando cambien los datos
  React.useEffect(() => {
    setPaginationState(prev => ({
      ...prev,
      total: totalTickets
    }))
  }, [totalTickets])

  return {
    // Estado de los datos
    tickets,
    totalTickets,
    
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
    selectedTicket,
    selectedTickets,
    
    // Filtros y paginación
    filters,
    sort,
    pagination,
    
    // Operaciones CRUD
    createTicket,
    updateTicket,
    deleteTicket,
    deleteMultipleTickets,
    changeTicketState,
    changeTicketVerificationState,
    toggleTicketPaymentBlock,
    reservarTicket,
    
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
    selectTicket,
    selectMultipleTickets,
    clearSelection,
    toggleTicketSelection,
    
    // Filtros y ordenamiento
    setFilters,
    setSort,
    setPagination,
    
    // Utilidades
    refreshTickets,
    getTicketById,
    getTicketsByRifa,
    
    // Exportación
    exportTickets
  }
}

