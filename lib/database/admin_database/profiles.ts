// =====================================================
// 🛠️ ADMIN DB - PROFILES
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

type Profile = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type AdminProfile = Profile

export async function adminListProfiles(params?: {
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
      let query = createAdminQuery('profiles').select('*')
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limite, offset)

      const result = await query
      
      return { 
        data: result.data || [],
        error: null,
        total: result.data?.length || 0
      }
    },
    'Error al listar perfiles'
  )
}

export async function adminGetProfile(id: string) {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('profiles')
        .select('*')
        .eq('id', id)
        .single()
    },
    'Error al obtener perfil'
  )
}

export async function adminCreateProfile(profileData: ProfileInsert) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('profiles')
        .insert(profileData)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al crear perfil'
  )
}

export async function adminUpdateProfile(id: string, profileData: ProfileUpdate) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al actualizar perfil'
  )
}

export async function adminDeleteProfile(id: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('profiles')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al eliminar perfil'
  )
}
