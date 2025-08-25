"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  adminListClientes, 
  adminGetCliente,
  adminGetClienteStats,
  adminSearchClientes
} from '@/lib/database/admin_database/clientes'
import type { AdminCliente } from '@/types'

interface UseAdminClientesOptions {
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useAdminClientes(options: UseAdminClientesOptions = {}) {
  const {
    ordenarPor = 'nombre',
    orden = 'asc',
    limite,
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  const [clientes, setClientes] = useState<AdminCliente[]>([])
  const [totalClientes, setTotalClientes] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar clientes
  const loadClientes = useCallback(async () => {
    try {
      console.log('🔍 [useAdminClientes] loadClientes iniciando...')
      setIsLoading(true)
      setError(null)
      
      const result = await adminListClientes({
        ordenarPor,
        orden,
        limite
      })
      
      console.log('🔍 [useAdminClientes] Resultado de adminListClientes:', result)
      
      if (result.success && result.data) {
        console.log('✅ [useAdminClientes] Clientes cargados exitosamente:', result.data.length)
        setClientes(result.data)
        setTotalClientes(result.total || 0)
      } else {
        console.log('❌ [useAdminClientes] Error en resultado:', result.error)
        setError(result.error || 'Error al cargar clientes')
        setClientes([])
        setTotalClientes(0)
      }
    } catch (err) {
      console.error('❌ [useAdminClientes] Error inesperado:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar clientes'
      setError(errorMessage)
      setClientes([])
      setTotalClientes(0)
    } finally {
      console.log('🔍 [useAdminClientes] loadClientes finalizado, isLoading = false')
      setIsLoading(false)
    }
  }, [ordenarPor, orden, limite])

  // Función para refrescar clientes
  const refreshClientes = useCallback(async () => {
    try {
      console.log('🔄 [useAdminClientes] refreshClientes iniciando...')
      setIsRefreshing(true)
      await loadClientes()
      console.log('✅ [useAdminClientes] refreshClientes completado')
    } finally {
      setIsRefreshing(false)
    }
  }, [loadClientes])

  // Función para buscar clientes
  const searchClientes = useCallback(async (searchTerm: string) => {
    try {
      console.log('🔍 [useAdminClientes] Buscando clientes:', searchTerm)
      setIsLoading(true)
      setError(null)
      
      const result = await adminSearchClientes(searchTerm)
      
      if (result.success && result.data) {
        console.log('✅ [useAdminClientes] Búsqueda exitosa:', result.data.length)
        setClientes(result.data)
        setTotalClientes(result.data.length)
      } else {
        console.log('❌ [useAdminClientes] Error en búsqueda:', result.error)
        setError(result.error || 'Error en la búsqueda')
        setClientes([])
        setTotalClientes(0)
      }
    } catch (err) {
      console.error('❌ [useAdminClientes] Error inesperado en búsqueda:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado en la búsqueda'
      setError(errorMessage)
      setClientes([])
      setTotalClientes(0)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Función para obtener cliente por cédula
  const getClienteByCedula = useCallback(async (cedula: string) => {
    try {
      const result = await adminGetCliente(cedula)
      
      if (result.success && result.data) {
        return result.data
      } else {
        console.error('❌ [useAdminClientes] Error al obtener cliente:', result.error)
        return null
      }
    } catch (err) {
      console.error('❌ [useAdminClientes] Error inesperado al obtener cliente:', err)
      return null
    }
  }, [])

  // Función para obtener estadísticas
  const getClienteStats = useCallback(async () => {
    try {
      const result = await adminGetClienteStats()
      
      if (result.success && result.data) {
        return result.data
      } else {
        console.error('❌ [useAdminClientes] Error al obtener estadísticas:', result.error)
        return null
      }
    } catch (err) {
      console.error('❌ [useAdminClientes] Error inesperado al obtener estadísticas:', err)
      return null
    }
  }, [])

  // Función para obtener cliente por ID
  const getClienteById = useCallback((id: string) => {
    return clientes.find(cliente => cliente.id === id)
  }, [clientes])

  // Cargar clientes al montar el componente
  useEffect(() => {
    console.log('🔍 [useAdminClientes] useEffect ejecutándose, llamando a loadClientes...')
    loadClientes()
  }, []) // ← Sin dependencias para evitar el loop infinito

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshClientes()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshClientes])

  return {
    // Estado
    clientes,
    totalClientes,
    isLoading,
    isRefreshing,
    error,
    
    // Operaciones
    refreshClientes,
    searchClientes,
    getClienteByCedula,
    getClienteStats,
    getClienteById
  }
}
