"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  adminListTickets, 
  adminCreateTicket, 
  adminUpdateTicket, 
  adminDeleteTicket,
  adminChangeTicketState,
  adminChangeTicketVerificationState,
  adminToggleTicketPaymentBlock
} from '@/lib/database/admin_database/tickets'
import type { AdminTicket, CreateTicketData, UpdateTicketData } from '@/types'

interface UseAdminTicketsOptions {
  rifa_id?: string
  estado?: string
  estado_verificacion?: string
  bloqueado_por_pago?: boolean
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAdminTickets(options: UseAdminTicketsOptions = {}) {
  const {
    rifa_id,
    estado,
    estado_verificacion,
    bloqueado_por_pago,
    ordenarPor = 'fecha_compra',
    orden = 'desc',
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [totalTickets, setTotalTickets] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar tickets
  const loadTickets = useCallback(async () => {
    try {
      console.log('🔍 [useAdminTickets] loadTickets iniciando...')
      setIsLoading(true)
      setError(null)
      
      const result = await adminListTickets({
        rifa_id,
        estado,
        estado_verificacion,
        bloqueado_por_pago,
        ordenarPor,
        orden
      })
      
      console.log('🔍 [useAdminTickets] Resultado de adminListTickets:', result)
      
      if (result.success && result.data) {
        console.log('✅ [useAdminTickets] Tickets cargados exitosamente:', result.data.length)
        setTickets(result.data)
        setTotalTickets(result.total || 0)
      } else {
        console.log('❌ [useAdminTickets] Error en resultado:', result.error)
        setError(result.error || 'Error al cargar tickets')
        setTickets([])
        setTotalTickets(0)
      }
    } catch (err) {
      console.error('❌ [useAdminTickets] Error inesperado:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar tickets'
      setError(errorMessage)
      setTickets([])
      setTotalTickets(0)
    } finally {
      console.log('🔍 [useAdminTickets] loadTickets finalizado, isLoading = false')
      setIsLoading(false)
    }
  }, [rifa_id, estado, estado_verificacion, bloqueado_por_pago, ordenarPor, orden])

  // Función para refrescar tickets
  const refreshTickets = useCallback(async () => {
    try {
      setIsRefreshing(true)
      await loadTickets()
    } finally {
      setIsRefreshing(false)
    }
  }, [loadTickets])

  // Función para crear ticket
  const createTicket = useCallback(async (data: CreateTicketData) => {
    try {
      const result = await adminCreateTicket(data)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para actualizar ticket
  const updateTicket = useCallback(async (id: string, data: UpdateTicketData) => {
    try {
      const result = await adminUpdateTicket(id, data)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para eliminar ticket
  const deleteTicket = useCallback(async (id: string) => {
    try {
      const result = await adminDeleteTicket(id)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para cambiar estado del ticket
  const changeTicketState = useCallback(async (id: string, estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado') => {
    try {
      const result = await adminChangeTicketState(id, estado)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado del ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para cambiar estado de verificación
  const changeTicketVerificationState = useCallback(async (id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado') => {
    try {
      const result = await adminChangeTicketVerificationState(id, estado_verificacion)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado de verificación del ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para bloquear/desbloquear ticket por pago
  const toggleTicketPaymentBlock = useCallback(async (id: string, bloqueado: boolean, pago_id?: string) => {
    try {
      const result = await adminToggleTicketPaymentBlock(id, bloqueado, pago_id)
      
      if (result.success) {
        await refreshTickets()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar bloqueo del ticket'
      return { success: false, error: errorMessage }
    }
  }, [refreshTickets])

  // Función para obtener ticket por ID
  const getTicketById = useCallback((id: string) => {
    return tickets.find(ticket => ticket.id === id)
  }, [tickets])

  // Función para obtener tickets por estado
  const getTicketsByEstado = useCallback((estado: string) => {
    return tickets.filter(ticket => ticket.estado === estado)
  }, [tickets])

  // Función para obtener tickets por rifa
  const getTicketsByRifa = useCallback((rifa_id: string) => {
    return tickets.filter(ticket => ticket.rifa_id === rifa_id)
  }, [tickets])

  // Función para obtener tickets por estado de verificación
  const getTicketsByEstadoVerificacion = useCallback((estado_verificacion: string) => {
    return tickets.filter(ticket => ticket.estado_verificacion === estado_verificacion)
  }, [tickets])

  // Función para obtener tickets bloqueados por pago
  const getTicketsBloqueadosPorPago = useCallback(() => {
    return tickets.filter(ticket => ticket.bloqueado_por_pago === true)
  }, [tickets])

  // Cargar tickets al montar el componente
  useEffect(() => {
    console.log('🔍 [useAdminTickets] useEffect ejecutándose, llamando a loadTickets...')
    loadTickets()
  }, []) // ← Sin dependencias para evitar el loop infinito

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshTickets()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshTickets])

  return {
    // Estado
    tickets,
    totalTickets,
    isLoading,
    isRefreshing,
    error,
    
    // Operaciones CRUD
    createTicket,
    updateTicket,
    deleteTicket,
    changeTicketState,
    changeTicketVerificationState,
    toggleTicketPaymentBlock,
    
    // Utilidades
    refreshTickets,
    getTicketById,
    getTicketsByEstado,
    getTicketsByRifa,
    getTicketsByEstadoVerificacion,
    getTicketsBloqueadosPorPago
  }
}
