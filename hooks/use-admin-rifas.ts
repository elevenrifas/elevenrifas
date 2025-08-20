"use client"

import { useState, useEffect, useCallback } from 'react'
import { adminListRifas, adminCreateRifa, adminUpdateRifa, adminChangeRifaState } from '@/lib/database/admin_database/rifas'
import type { AdminRifa } from '@/lib/database/admin_database/rifas'

interface UseAdminRifasOptions {
  incluirCerradas?: boolean
  incluirInactivas?: boolean
  limit?: number
  ordenarPor?: 'fecha_creacion' | 'titulo' | 'estado' | 'precio_ticket'
  orden?: 'asc' | 'desc'
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAdminRifasReturn {
  // Estado de los datos
  rifas: AdminRifa[]
  totalRifas: number
  
  // Estados de la aplicación
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Operaciones
  refreshRifas: () => Promise<void>
  createRifa: (datos: any) => Promise<{ success: boolean; id?: string; error?: string }>
  updateRifa: (id: string, datos: any) => Promise<{ success: boolean; error?: string }>
  changeRifaState: (id: string, estado: 'activa' | 'cerrada' | 'finalizada') => Promise<{ success: boolean; error?: string }>
  
  // Utilidades
  getRifaById: (id: string) => AdminRifa | undefined
  getRifasByEstado: (estado: string) => AdminRifa[]
  getRifasByCategoria: (categoria: string) => AdminRifa[]
}

export function useAdminRifas(options: UseAdminRifasOptions = {}): UseAdminRifasReturn {
  const {
    incluirCerradas = true,
    incluirInactivas = true,
    limit = 1000,
    ordenarPor = 'fecha_creacion',
    orden = 'desc',
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options

  // Estados principales
  const [rifas, setRifas] = useState<AdminRifa[]>([])
  const [totalRifas, setTotalRifas] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar rifas
  const loadRifas = useCallback(async () => {
    try {
      setError(null)
      const result = await adminListRifas({
        incluirCerradas,
        incluirInactivas,
        limit,
        ordenarPor,
        orden
      })

      if (result.success) {
        setRifas(result.data)
        setTotalRifas(result.total || result.data.length)
      } else {
        setError(result.error || 'Error al cargar las rifas')
        setRifas([])
        setTotalRifas(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar rifas'
      setError(errorMessage)
      setRifas([])
      setTotalRifas(0)
    } finally {
      setIsLoading(false)
    }
  }, [incluirCerradas, incluirInactivas, limit, ordenarPor, orden])

  // Función para refrescar rifas
  const refreshRifas = useCallback(async () => {
    if (isRefreshing) return // Evitar múltiples refrescos simultáneos
    
    try {
      setIsRefreshing(true)
      setError(null)
      
      const result = await adminListRifas({
        incluirCerradas,
        incluirInactivas,
        limit,
        ordenarPor,
        orden
      })

      if (result.success) {
        setRifas(result.data)
        setTotalRifas(result.total || result.data.length)
      } else {
        setError(result.error || 'Error al refrescar las rifas')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al refrescar rifas'
      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }, [incluirCerradas, incluirInactivas, limit, ordenarPor, orden, isRefreshing])

  // Función para crear rifa
  const createRifa = useCallback(async (datos: any) => {
    try {
      setError(null)
      const result = await adminCreateRifa(datos)
      
      if (result.success) {
        // Refrescar la lista después de crear
        await refreshRifas()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear rifa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [refreshRifas])

  // Función para actualizar rifa
  const updateRifa = useCallback(async (id: string, datos: any) => {
    try {
      setError(null)
      const result = await adminUpdateRifa(id, datos)
      
      if (result.success) {
        // Refrescar la lista después de actualizar
        await refreshRifas()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar rifa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [refreshRifas])

  // Función para cambiar estado de rifa
  const changeRifaState = useCallback(async (id: string, estado: 'activa' | 'cerrada' | 'finalizada') => {
    try {
      setError(null)
      const result = await adminChangeRifaState(id, estado)
      
      if (result.success) {
        // Refrescar la lista después de cambiar estado
        await refreshRifas()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado de rifa'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [refreshRifas])

  // Funciones de utilidad
  const getRifaById = useCallback((id: string) => {
    return rifas.find(rifa => rifa.id === id)
  }, [rifas])

  const getRifasByEstado = useCallback((estado: string) => {
    return rifas.filter(rifa => rifa.estado === estado)
  }, [rifas])

  const getRifasByCategoria = useCallback((categoria: string) => {
    return rifas.filter(rifa => rifa.categoria === categoria)
  }, [rifas])

  // Cargar rifas al montar el componente
  useEffect(() => {
    loadRifas()
  }, [loadRifas])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshRifas()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshRifas])

  return {
    // Estado de los datos
    rifas,
    totalRifas,
    
    // Estados de la aplicación
    isLoading,
    isRefreshing,
    error,
    
    // Operaciones
    refreshRifas,
    createRifa,
    updateRifa,
    changeRifaState,
    
    // Utilidades
    getRifaById,
    getRifasByEstado,
    getRifasByCategoria
  }
}
