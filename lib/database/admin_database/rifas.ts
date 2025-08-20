// =====================================================
// 🛠️ ADMIN DB - RIFAS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// Mantiene separadas las operaciones admin del frontend público
// =====================================================

import { supabase } from '@/lib/database'
import type { Database } from '@/types/supabase'

type RifasRow = Database['public']['Tables']['rifas']['Row']
type RifasInsert = Database['public']['Tables']['rifas']['Insert']
type RifasUpdate = Database['public']['Tables']['rifas']['Update']

export type AdminRifa = RifasRow

export async function adminListRifas(params?: { 
  incluirCerradas?: boolean
  incluirInactivas?: boolean
  limit?: number
  offset?: number
  ordenarPor?: 'fecha_creacion' | 'titulo' | 'estado' | 'precio_ticket'
  orden?: 'asc' | 'desc'
}) {
  const { 
    incluirCerradas = true, 
    incluirInactivas = true,
    limit = 1000,
    offset = 0,
    ordenarPor = 'fecha_creacion',
    orden = 'desc'
  } = params || {}

  try {
    let query = supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          color
        )
      `)
      .order(ordenarPor, { ascending: orden === 'asc' })
      .range(offset, offset + limit - 1)

    // Filtros de estado
    if (!incluirCerradas) {
      query = query.neq('estado', 'cerrada')
    }
    
    if (!incluirInactivas) {
      query = query.eq('activa', true)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error en adminListRifas:', error)
      return { success: false as const, error: error.message }
    }

    // Transformar y validar datos
    const rifasTransformadas = (data || []).map((rifa) => ({
      ...rifa,
      // Valores por defecto para campos opcionales
      total_tickets: rifa.total_tickets || 0,
      tickets_disponibles: rifa.tickets_disponibles || 0,
      precio_ticket: rifa.precio_ticket || 0,
      estado: rifa.estado || 'activa',
      categoria: rifa.categoria || 'general',
      tipo_rifa: rifa.tipo_rifa || 'vehiculo',
      destacada: rifa.destacada || false,
      orden: rifa.orden || 0,
      activa: rifa.activa ?? true,
      fecha_creacion: rifa.fecha_creacion || new Date().toISOString(),
      // Campos de vehículo
      marca: rifa.marca || null,
      modelo: rifa.modelo || null,
      ano: rifa.ano || null,
      color: rifa.color || null,
      valor_estimado_usd: rifa.valor_estimado_usd || null
    }))

    return { 
      success: true as const, 
      data: rifasTransformadas as AdminRifa[],
      total: rifasTransformadas.length
    }

  } catch (error) {
    console.error('Error inesperado en adminListRifas:', error)
    return { 
      success: false as const, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function adminCreateRifa(datos: RifasInsert) {
  const { data, error } = await supabase.from('rifas').insert(datos).select().single()
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function adminUpdateRifa(id: string, datos: RifasUpdate) {
  const { error } = await supabase.from('rifas').update(datos).eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function adminChangeRifaState(id: string, estado: 'activa' | 'cerrada' | 'finalizada') {
  const { error } = await supabase
    .from('rifas')
    .update({ estado, fecha_cierre: estado !== 'activa' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function adminRifasStats() {
  const { data, error } = await supabase.from('rifas').select('estado')
  if (error) return { success: false as const, error: error.message }
  const total = data.length
  const activas = data.filter(r => r.estado === 'activa').length
  const cerradas = data.filter(r => r.estado === 'cerrada').length
  const finalizadas = data.filter(r => r.estado === 'finalizada').length
  return { success: true as const, data: { total, activas, cerradas, finalizadas } }
}


