// =====================================================
// 🛠️ ADMIN DB - RIFAS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// Mantiene separadas las operaciones admin del frontend público
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyPagination, 
  applyOrdering 
} from '@/lib/database'
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

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('rifas')
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono,
            color
          )
        `)
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limit, offset)

      // Filtros de estado
      if (!incluirCerradas) {
        query = query.neq('estado', 'cerrada')
      }
      
      // Nota: 'activa' ya no existe en el nuevo schema
      // El estado se maneja a través del campo 'estado'

      const result = await query

      // Transformar y validar datos según el nuevo schema
      const rifasTransformadas = (result.data || []).map((rifa: any) => ({
        ...rifa,
        // Valores por defecto para campos opcionales según el nuevo schema
        titulo: rifa.titulo || '',
        descripcion: rifa.descripcion || '',
        precio_ticket: rifa.precio_ticket || 0,
        imagen_url: rifa.imagen_url || '',
        estado: rifa.estado || 'activa',
        fecha_creacion: rifa.fecha_creacion || new Date().toISOString(),
        fecha_cierre: rifa.fecha_cierre || null,
        total_tickets: rifa.total_tickets || 0,
        tickets_disponibles: rifa.tickets_disponibles || 0,

        condiciones: rifa.condiciones || '',
        categoria_id: rifa.categoria_id || null,
        numero_tickets_comprar: rifa.numero_tickets_comprar || [1, 2, 3, 5, 10]
      }))

      return { 
        data: rifasTransformadas as AdminRifa[],
        error: null,
        total: rifasTransformadas.length
      }
    },
    'Error al listar rifas'
  )
}

export async function adminCreateRifa(datos: RifasInsert) {
  const { data, error } = await adminSupabase.from('rifas').insert(datos).select().single()
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data }
}

export async function adminUpdateRifa(id: string, datos: RifasUpdate) {
  const { error } = await adminSupabase.from('rifas').update(datos).eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function adminChangeRifaState(id: string, estado: 'activa' | 'cerrada' | 'finalizada') {
  const { error } = await adminSupabase
    .from('rifas')
    .update({ estado, fecha_cierre: estado !== 'activa' ? new Date().toISOString() : null })
    .eq('id', id)
  if (error) return { success: false as const, error: error.message }
  return { success: true as const }
}

export async function adminRifasStats() {
  const { data, error } = await adminSupabase.from('rifas').select('estado')
  if (error) return { success: false as const, error: error.message }
  const total = data.length
  const activas = data.filter((r: any) => r.estado === 'activa').length
  const cerradas = data.filter((r: any) => r.estado === 'cerrada').length
  const finalizadas = data.filter((r: any) => r.estado === 'finalizada').length
  return { success: true as const, data: { total, activas, cerradas, finalizadas } }
}


