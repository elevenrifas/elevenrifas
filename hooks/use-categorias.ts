"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/database/supabase'

export interface Categoria {
  id: string
  nombre: string
  icono: string
  descripcion?: string
}

export function useCategorias() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('categorias_rifas')
          .select('id, nombre, icono, descripcion')
          .order('nombre', { ascending: true })

        if (fetchError) {
          throw fetchError
        }

        setCategorias(data || [])
      } catch (err) {
        console.error('Error al obtener categorías:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchCategorias()
  }, [])

  return {
    categorias,
    loading,
    error
  }
}
