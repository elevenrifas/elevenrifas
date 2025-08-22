// =====================================================
// 🛠️ ADMIN DB - PAGOS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering 
} from '@/lib/database'
import type { Database } from '@/types/supabase'

type PagoRow = Database['public']['Tables']['pagos']['Row']
type PagoInsert = Database['public']['Tables']['pagos']['Insert']
type PagoUpdate = Database['public']['Tables']['pagos']['Update']

export type AdminPago = PagoRow
export type AdminPagoEstado = 'pendiente' | 'verificado' | 'rechazado'

export async function adminListPagos(params?: { 
  estado?: AdminPagoEstado
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}) {
  const { 
    estado,
    ordenarPor = 'fecha_pago',
    orden = 'desc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('pagos').select('*')
      
      // Aplicar filtros
      if (estado) {
        query = query.eq('estado', estado)
      }
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación
      if (limite) {
        query = query.limit(limite)
      }
      
      if (offset) {
        query = query.range(offset, offset + limite - 1)
      }

      const result = await query
      
      return { 
        data: result.data || [],
        error: null,
        total: result.data?.length || 0
      }
    },
    'Error al listar pagos'
  )
}

export async function adminGetPago(id: string) {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('pagos')
        .select('*')
        .eq('id', id)
        .single()
    },
    'Error al obtener pago'
  )
}

export async function adminCreatePago(datos: PagoInsert) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('pagos')
        .insert(datos)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al crear pago'
  )
}

export async function adminUpdatePago(id: string, datos: PagoUpdate) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .update(datos)
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al actualizar pago'
  )
}

export async function adminDeletePago(id: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al eliminar pago'
  )
}

export async function adminVerifyPago(id: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .update({ estado: 'verificado' })
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al verificar pago'
  )
}

export async function adminRejectPago(id: string, motivo?: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .update({ 
          estado: 'rechazado', 
          notas: motivo || null 
        })
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al rechazar pago'
  )
}


