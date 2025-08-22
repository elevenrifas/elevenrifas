// =====================================================
// 🛠️ ADMIN DB - CATEGORIAS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// Sigue el patrón establecido del template
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering,
  applyPagination
} from '@/lib/database'
import type { Database } from '@/types/supabase'

type CategoriaRifa = Database['public']['Tables']['categorias_rifas']['Row']
type CategoriaInsert = Database['public']['Tables']['categorias_rifas']['Insert']
type CategoriaUpdate = Database['public']['Tables']['categorias_rifas']['Update']

export type AdminCategoria = CategoriaRifa

// =====================================================
// 📋 FUNCIONES ADMIN CATEGORIAS
// =====================================================

// 1. LISTAR CATEGORIAS
export async function adminListCategorias(params?: {
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}): Promise<{ success: boolean; data?: AdminCategoria[]; error?: string; total?: number }> {
  const {
    ordenarPor = 'orden',
    orden = 'asc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('categorias_rifas').select('*')
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limite, offset)

      const result = await query
      
      return { 
        success: true,
        data: result.data || [],
        total: result.data?.length || 0
      }
    },
    'Error al listar categorías'
  )
}

// 2. OBTENER CATEGORIA INDIVIDUAL
export async function adminGetCategoria(id: string): Promise<{ success: boolean; data?: AdminCategoria; error?: string }> {
  return safeAdminQuery(
    async () => {
      const result = await createAdminQuery('categorias_rifas')
        .select('*')
        .eq('id', id)
        .single()
      
      return { success: true, data: result.data }
    },
    'Error al obtener categoría'
  )
}

// 3. CREAR CATEGORIA
export async function adminCreateCategoria(categoriaData: CategoriaInsert): Promise<{ success: boolean; data?: AdminCategoria; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('categorias_rifas')
        .insert(categoriaData)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    },
    'Error al crear categoría'
  )
}

// 4. ACTUALIZAR CATEGORIA
export async function adminUpdateCategoria(id: string, categoriaData: CategoriaUpdate): Promise<{ success: boolean; data?: AdminCategoria; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('categorias_rifas')
        .update(categoriaData)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data }
    },
    'Error al actualizar categoría'
  )
}

// 5. ELIMINAR CATEGORIA
export async function adminDeleteCategoria(id: string): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('categorias_rifas')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { success: true }
    },
    'Error al eliminar categoría'
  )
}
