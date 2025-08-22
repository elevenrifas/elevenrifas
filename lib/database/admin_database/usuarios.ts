// =====================================================
// 🛠️ ADMIN DB - USUARIOS (PROFILES)
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering,
  applyPagination
} from '@/lib/database'
import type { Database } from '@/types/supabase'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export interface AdminUsuario {
  id: string
  nombre?: string | null
  correo?: string | null
  telefono?: string | null
  creado_el?: string | null
}

export async function adminListUsuarios(params?: {
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}) {
  const {
    ordenarPor = 'created_at',
    orden = 'desc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('profiles')
        .select('id, full_name as nombre, email as correo, phone as telefono, created_at as creado_el')
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limite, offset)

      const result = await query
      
      return { 
        data: (result.data || []) as AdminUsuario[],
        error: null,
        total: result.data?.length || 0
      }
    },
    'Error al listar usuarios'
  )
}

export async function adminGetUsuario(id: string) {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('profiles')
        .select('id, full_name as nombre, email as correo, phone as telefono, created_at as creado_el')
        .eq('id', id)
        .single()
    },
    'Error al obtener usuario'
  )
}

export async function adminCreateUsuario(datos: ProfileInsert) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('profiles')
        .insert(datos)
        .select('id, full_name as nombre, email as correo, phone as telefono, created_at as creado_el')
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al crear usuario'
  )
}

export async function adminUpdateUsuario(id: string, datos: ProfileUpdate) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('profiles')
        .update(datos)
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al actualizar usuario'
  )
}

export async function adminDeleteUsuario(id: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('profiles')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al eliminar usuario'
  )
}


