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
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAdminTickets(options: UseAdminTicketsOptions = {}) {
  const {
    rifa_id,
    ordenarPor = 'fecha_compra',
    orden = 'desc',
    limite,
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
        ordenarPor,
        orden,
        limite
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
  }, [rifa_id, ordenarPor, orden, limite])

  // Función para refrescar tickets
  const refreshTickets = useCallback(async () => {
    try {
      console.log('🔄 [useAdminTickets] refreshTickets iniciando...')
      setIsRefreshing(true)
      await loadTickets()
      console.log('✅ [useAdminTickets] refreshTickets completado')
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
      console.log('🔄 [useAdminTickets] deleteTicket iniciando para ID:', id)
      const result = await adminDeleteTicket(id)
      
      if (result.success) {
        console.log('✅ [useAdminTickets] Ticket eliminado exitosamente')
        // NO hacer refresh automático aquí, se hará manualmente en el hook CRUD
        console.log('✅ [useAdminTickets] Refresh será manejado por hook CRUD')
      } else {
        console.error('❌ [useAdminTickets] Error al eliminar ticket:', result.error)
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar ticket'
      console.error('💥 [useAdminTickets] Error inesperado en deleteTicket:', err)
      return { success: false, error: errorMessage }
    }
  }, []) // Removemos refreshTickets de las dependencias

  // Función para obtener ticket por ID
  const getTicketById = useCallback((id: string) => {
    return tickets.find(ticket => ticket.id === id)
  }, [tickets])

  // Función para obtener tickets por rifa
  const getTicketsByRifa = useCallback((rifa_id: string) => {
    return tickets.filter(ticket => ticket.rifa_id === rifa_id)
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
    
    // Utilidades
    refreshTickets,
    getTicketById,
    getTicketsByRifa
  }
}
