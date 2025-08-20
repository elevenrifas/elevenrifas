// =====================================================
// 🛠️ ADMIN DB - PAGOS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// =====================================================

import { supabase } from '@/lib/database'

export type AdminPagoEstado = 'pendiente' | 'verificado' | 'rechazado'

export async function adminListPagos(params?: { estado?: AdminPagoEstado }) {
  const query = supabase.from('pagos').select('*').order('fecha_pago', { ascending: false })
  if (params?.estado) query.eq('estado', params.estado)
  const { data, error } = await query
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: data || [] }
}

export async function adminVerifyPago(id: string) {
  const { error } = await supabase.from('pagos').update({ estado: 'verificado' }).eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function adminRejectPago(id: string, motivo?: string) {
  const { error } = await supabase.from('pagos').update({ estado: 'rechazado', notas: motivo || null }).eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}


