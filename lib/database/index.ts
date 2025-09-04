// =====================================================
// 🗄️ CENTRO DE BASE DE DATOS - ELEVEN RIFAS
// =====================================================
// Este archivo centraliza todas las operaciones de base de datos
// Organizado por funcionalidad y componentes
// =====================================================

// Cliente de Supabase centralizado (lado del cliente)
export { supabase } from './supabase'

// NOTA: Para Server Components con cookies completas, importar directamente:
// import { createServerClient } from '@/lib/database/supabase-server'

// =====================================================
// 🚀 SISTEMA UNIFICADO DE EXTRACCIÓN DE DATOS
// =====================================================
// PATRÓN SEGURO: Siempre usar el cliente del navegador para operaciones admin
// desde hooks y componentes del lado del cliente
// =====================================================

// Cliente seguro para operaciones admin (lado del cliente)
export const adminSupabase = (() => {
  const { supabase } = require('./supabase')
  return supabase
})()

// Función helper para crear queries admin de manera consistente
export function createAdminQuery<T = any>(table: string) {
  return adminSupabase.from(table) as any
}

// Función helper para manejo seguro de errores en queries admin
export async function safeAdminQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  errorMessage: string = 'Error en consulta admin'
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const result = await queryFn()
    console.log('🔍 [safeAdminQuery] Resultado de query:', result)
    
    if (result.error) {
      console.error(`❌ [safeAdminQuery] ${errorMessage}:`, result.error)
      return { 
        success: false, 
        error: result.error?.message || result.error?.toString() || errorMessage 
      }
    }
    
    return { success: true, data: result.data as T }
  } catch (error) {
    console.error(`❌ [safeAdminQuery] Error inesperado:`, error)
    console.error(`❌ [safeAdminQuery] Tipo de error:`, typeof error)
    console.error(`❌ [safeAdminQuery] Error details:`, JSON.stringify(error, null, 2))
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 
             typeof error === 'string' ? error : 
             'Error desconocido en la consulta' 
    }
  }
}

// Función helper para paginación consistente
export function applyPagination(
  query: any, 
  limit?: number, 
  offset?: number
) {
  if (limit) {
    query = query.limit(limit)
  }
  
  if (offset && limit) {
    query = query.range(offset, offset + limit - 1)
  }
  
  return query
}

// Función helper para ordenamiento consistente
export function applyOrdering(
  query: any, 
  orderBy: string = 'created_at', 
  order: 'asc' | 'desc' = 'desc'
) {
  return query.order(orderBy, { ascending: order === 'asc' })
}

// =====================================================
// 📋 REGLAS DE USO SEGURO:
// =====================================================
// 1. Para hooks y componentes del lado del cliente: usar adminSupabase
// 2. Para Server Components: usar createServerClient
// 3. Para operaciones admin: usar safeAdminQuery + helpers
// 4. Siempre manejar errores con safeAdminQuery
// =====================================================

// Configuración de base de datos
export { 
  DB_CONFIG, 
  validarConfiguracionDB,
  obtenerConfiguracionPorAmbiente,
  esAmbienteDesarrollo,
  esAmbienteProduccion,
  esAmbienteTest
} from './config'

// Operaciones de Rifas
export * from './rifas'

// Operaciones de Pagos (módulo activo)
export * from './pagos'

// (Categorías, Usuarios, Estadísticas y Utils) eliminados por no uso
