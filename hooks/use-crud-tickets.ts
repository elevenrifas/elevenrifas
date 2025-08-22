"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { useAdminTickets } from './use-admin-tickets'
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
  changeTicketState: (id: string, estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado') => Promise<{ success: boolean; error?: string }>
  changeTicketVerificationState: (id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado') => Promise<{ success: boolean; error?: string }>
  toggleTicketPaymentBlock: (id: string, bloqueado: boolean, pago_id?: string) => Promise<{ success: boolean; error?: string }>
  
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
  getTicketsByEstado: (estado: string) => AdminTicket[]
  getTicketsByRifa: (rifa_id: string) => AdminTicket[]
  getTicketsByEstadoVerificacion: (estado_verificacion: string) => AdminTicket[]
  getTicketsBloqueadosPorPago: () => AdminTicket[]
  
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
    changeTicketState: baseChangeTicketState,
    changeTicketVerificationState: baseChangeTicketVerificationState,
    toggleTicketPaymentBlock: baseToggleTicketPaymentBlock,
    getTicketById,
    getTicketsByEstado,
    getTicketsByRifa,
    getTicketsByEstadoVerificacion,
    getTicketsBloqueadosPorPago
  } = useAdminTickets({
    ...initialFilters,
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
      // Aquí implementarías la lógica real de eliminación
      // Por ahora simulamos la eliminación
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      closeDeleteModal()
      await refreshTickets()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar ticket'
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshTickets])

  const deleteMultipleTickets = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true)
      // Aquí implementarías la lógica real de eliminación múltiple
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      clearSelection()
      await refreshTickets()
      
      return { success: true }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar tickets'
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshTickets])

  const changeTicketState = useCallback(async (id: string, estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado') => {
    try {
      const result = await baseChangeTicketState(id, estado)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado'
      return { success: false, error: errorMessage }
    }
  }, [baseChangeTicketState])

  const changeTicketVerificationState = useCallback(async (id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado') => {
    try {
      const result = await baseChangeTicketVerificationState(id, estado_verificacion)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado de verificación'
      return { success: false, error: errorMessage }
    }
  }, [baseChangeTicketVerificationState])

  const toggleTicketPaymentBlock = useCallback(async (id: string, bloqueado: boolean, pago_id?: string) => {
    try {
      const result = await baseToggleTicketPaymentBlock(id, bloqueado, pago_id)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar bloqueo'
      return { success: false, error: errorMessage }
    }
  }, [baseToggleTicketPaymentBlock])

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
    getTicketsByEstado,
    getTicketsByRifa,
    getTicketsByEstadoVerificacion,
    getTicketsBloqueadosPorPago,
    
    // Exportación
    exportTickets
  }
}

