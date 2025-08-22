"use client"

import * as React from 'react'
import { adminListPagos } from '@/lib/database/admin_database'
import type { AdminPago } from '@/lib/database/admin_database/pagos'

// =====================================================
// 🎯 HOOK ADMIN PAGOS - ELEVEN RIFAS
// =====================================================
// Hook personalizado para gestionar pagos en el panel admin
// Sigue el mismo patrón que use-admin-rifas y use-admin-categorias
// =====================================================

export function useAdminPagos() {
  const [pagos, setPagos] = React.useState<AdminPago[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const loadPagos = React.useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔄 Cargando pagos...')
      const result = await adminListPagos()
      
      if (result.success) {
        setPagos(result.data || [])
        console.log(`✅ Pagos cargados: ${result.data?.length || 0}`)
      } else {
        setError(result.error || 'Error desconocido al cargar pagos')
        console.error('❌ Error al cargar pagos:', result.error)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado'
      setError(errorMessage)
      console.error('❌ Error inesperado al cargar pagos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Cargar pagos al montar el componente
  React.useEffect(() => {
    loadPagos()
  }, [loadPagos])

  return {
    pagos,
    loading,
    error,
    loadPagos
  }
}

