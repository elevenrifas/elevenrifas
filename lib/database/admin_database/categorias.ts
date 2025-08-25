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

// Definir tipos basados en el esquema actual (4 campos)
export interface AdminCategoria {
  id: string
  nombre: string
  icono: string
  descripcion?: string
}

export type CategoriaInsert = Omit<AdminCategoria, 'id'>
export type CategoriaUpdate = Partial<CategoriaInsert>

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
    ordenarPor = 'nombre', // Cambiado de 'orden' a 'nombre' que sí existe
    orden = 'asc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      console.log('🔍 [DEBUG] Iniciando consulta de categorías...')
      console.log('🔍 [DEBUG] Parámetros:', { ordenarPor, orden, limite, offset })
      
      let query = createAdminQuery('categorias_rifas').select('*')
      console.log('🔍 [DEBUG] Query base creada')
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      console.log('🔍 [DEBUG] Ordenamiento aplicado')
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limite, offset)
      console.log('🔍 [DEBUG] Paginación aplicada')

      console.log('🔍 [DEBUG] Ejecutando query...')
      const result = await query
      console.log('🔍 [DEBUG] Resultado obtenido:', result)
      
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
