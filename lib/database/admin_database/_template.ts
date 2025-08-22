// =====================================================
// 🎯 PLANTILLA PARA FUNCIONES ADMIN - ELEVEN RIFAS
// =====================================================
// Este archivo muestra el PATRÓN SEGURO para crear funciones admin
// Copiar esta estructura para cualquier nueva funcionalidad admin
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyPagination, 
  applyOrdering 
} from '@/lib/database'

// Tipo genérico para entidades admin
type AdminEntity = any // Usar 'any' para el template, reemplazar con el tipo específico en implementación

// =====================================================
// 📋 PATRÓN SEGURO PARA FUNCIONES ADMIN
// =====================================================

// 1. FUNCIÓN DE LISTADO (PATRÓN PRINCIPAL)
export async function adminListEntities(options: {
  estado?: string
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
} = {}): Promise<{ success: boolean; entities?: AdminEntity[]; error?: string; total?: number }> {
  
  // Usar safeAdminQuery para manejo seguro de errores
  return safeAdminQuery(
    async () => {
      // Construir query usando helpers
      let query = createAdminQuery('entities')
        .select('*')
      
      // Aplicar filtros
      if (options.estado) {
        query = query.eq('estado', options.estado)
      }
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(
        query, 
        options.ordenarPor || 'created_at', 
        options.orden || 'desc'
      )
      
      // Aplicar paginación usando helper
      query = applyPagination(query, options.limite, options.offset)
      
      // Ejecutar query
      return query
    },
    'Error al listar entidades'
  )
}

// 2. FUNCIÓN DE OBTENCIÓN INDIVIDUAL
export async function adminGetEntity(id: string): Promise<{ success: boolean; entity?: AdminEntity; error?: string }> {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('entities')
        .select('*')
        .eq('id', id)
        .single()
    },
    'Error al obtener entidad'
  )
}

// 3. FUNCIÓN DE CREACIÓN
export async function adminCreateEntity(data: Partial<AdminEntity>): Promise<{ success: boolean; id?: string; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data: entity, error } = await createAdminQuery('entities')
        .insert(data)
        .select('id')
        .single()
      
      if (error) throw error
      
      return { data: entity, error: null }
    },
    'Error al crear entidad'
  )
}

// 4. FUNCIÓN DE ACTUALIZACIÓN
export async function adminUpdateEntity(id: string, data: Partial<AdminEntity>): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('entities')
        .update(data)
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al actualizar entidad'
  )
}

// 5. FUNCIÓN DE ELIMINACIÓN
export async function adminDeleteEntity(id: string): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('entities')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al eliminar entidad'
  )
}

// =====================================================
// 🚨 REGLAS OBLIGATORIAS:
// =====================================================
// ✅ SIEMPRE usar safeAdminQuery para manejo de errores
// ✅ SIEMPRE usar createAdminQuery para crear queries
// ✅ SIEMPRE usar helpers para paginación y ordenamiento
// ✅ SIEMPRE manejar errores de manera consistente
// ✅ SIEMPRE usar tipos TypeScript apropiados
// ✅ NUNCA usar createServerClient en funciones admin
// ✅ NUNCA usar await en funciones que no sean async
// =====================================================

// =====================================================
// 🔧 EJEMPLO DE USO EN HOOKS:
// =====================================================
/*
import { adminListEntities } from '@/lib/database/admin_database/entities'

export function useAdminEntities() {
  const [entities, setEntities] = useState([])
  const [loading, setLoading] = useState(false)
  
  const loadEntities = useCallback(async () => {
    setLoading(true)
    const result = await adminListEntities()
    
    if (result.success) {
      setEntities(result.entities || [])
    } else {
      console.error('Error:', result.error)
    }
    
    setLoading(false)
  }, [])
  
  return { entities, loading, loadEntities }
}
*/
