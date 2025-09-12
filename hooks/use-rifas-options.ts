"use client"

import { useState, useEffect } from 'react'
import { obtenerTodasLasRifas } from '@/lib/database/rifas'
import type { Rifa } from '@/types'

// =====================================================
// 🎯 HOOK RIFAS OPTIONS - ELEVEN RIFAS
// =====================================================
// Hook para obtener todas las rifas (activas e inactivas) para filtros y dropdowns
// Optimizado para uso en componentes de filtros administrativos
// =====================================================

export interface RifaOption {
  value: string
  label: string
  estado: string
  total_tickets: number
}

export interface UseRifasOptionsReturn {
  rifas: RifaOption[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useRifasOptions(): UseRifasOptionsReturn {
  const [rifas, setRifas] = useState<RifaOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchRifas = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 [useRifasOptions] Iniciando carga de todas las rifas...')
      const rifasData = await obtenerTodasLasRifas()
      console.log('🔍 [useRifasOptions] Rifas obtenidas de BD:', rifasData)
      console.log('🔍 [useRifasOptions] Cantidad de rifas:', rifasData.length)
      
      const rifasOptions: RifaOption[] = rifasData.map(rifa => ({
        value: rifa.id,
        label: rifa.titulo,
        estado: rifa.estado,
        total_tickets: rifa.total_tickets
      }))
      
      console.log('🔍 [useRifasOptions] Opciones transformadas:', rifasOptions)
      setRifas(rifasOptions)
    } catch (err) {
      console.error('Error obteniendo rifas para filtros:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar rifas')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchRifas()
  }, [])

  return {
    rifas,
    isLoading,
    error,
    refresh: fetchRifas
  }
}
