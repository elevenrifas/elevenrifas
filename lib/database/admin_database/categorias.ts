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
    ordenarPor = 'nombre', // Usar 'nombre' que sí existe en el esquema
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
export async function adminCreateCategoria(categoriaData: CategoriaInsert): Promise<{ success: boolean; data?: AdminCategoria; id?: string; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('categorias_rifas')
        .insert(categoriaData)
        .select()
        .single()
      
      if (error) throw error
      return { success: true, data, id: data?.id }
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
  try {
    const { data, error } = await createAdminQuery('categorias_rifas')
      .delete()
      .eq('id', id)
      .select()
    
    if (error) {
      // Detectar error de restricción de clave foránea
      const isForeignKeyError = error.code === '23503' || 
          error.message?.includes('foreign key constraint') || 
          error.message?.includes('violates foreign key constraint') ||
          error.details?.includes('foreign key constraint') ||
          error.hint?.includes('foreign key constraint')
      
      if (isForeignKeyError) {
        return { 
          success: false, 
          error: 'No se puede eliminar esta categoría porque está siendo utilizada por una o más rifas. Primero elimine o cambie la categoría de las rifas asociadas.' 
        }
      }
      
      // Para otros errores, retornar error genérico
      return {
        success: false,
        error: 'Error inesperado al eliminar categoría'
      }
    }
    
    return { success: true, data: data }
  } catch (err) {
    return { 
      success: false, 
      error: 'Error inesperado al eliminar categoría' 
    }
  }
}

// 6. ELIMINAR MÚLTIPLES CATEGORIAS
export async function adminDeleteMultipleCategorias(ids: string[]): Promise<{ success: boolean; error?: string }> {
  try {
    const results = []
    for (const id of ids) {
      const { data, error } = await createAdminQuery('categorias_rifas')
        .delete()
        .eq('id', id)
        .select()
      
      if (error) {
        // Detectar error de restricción de clave foránea
        const isForeignKeyError = error.code === '23503' || 
            error.message?.includes('foreign key constraint') || 
            error.message?.includes('violates foreign key constraint') ||
            error.details?.includes('foreign key constraint') ||
            error.hint?.includes('foreign key constraint')
        
        if (isForeignKeyError) {
          return { 
            success: false, 
            error: 'No se pueden eliminar algunas categorías porque están siendo utilizadas por una o más rifas. Primero elimine o cambie la categoría de las rifas asociadas.' 
          }
        }
        
        // Para otros errores, retornar error genérico
        return {
          success: false,
          error: 'Error inesperado al eliminar categorías'
        }
      }
      
      results.push(data)
    }
    
    return { success: true, data: results }
  } catch (err) {
    return { 
      success: false, 
      error: 'Error inesperado al eliminar categorías' 
    }
  }
}
