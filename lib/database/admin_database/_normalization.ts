// =====================================================
// 🎯 ESTÁNDARES DE NORMALIZACIÓN - FUNCIONES ADMIN
// =====================================================
// Este archivo define los estándares que TODAS las funciones admin
// deben seguir para mantener consistencia en todo el proyecto
// =====================================================

// =====================================================
// 📋 FORMATO DE RESPUESTA ESTÁNDAR
// =====================================================

// ✅ FORMATO CORRECTO para funciones de listado:
export interface AdminListResponse<T> {
  success: boolean
  data: T[]           // ← SIEMPRE usar 'data', NUNCA 'tickets', 'rifas', etc.
  total: number
  error?: string
}

// ✅ FORMATO CORRECTO para funciones individuales:
export interface AdminSingleResponse<T> {
  success: boolean
  data: T             // ← SIEMPRE usar 'data', NUNCA 'ticket', 'rifa', etc.
  error?: string
}

// ✅ FORMATO CORRECTO para operaciones de escritura:
export interface AdminWriteResponse {
  success: boolean
  id?: string         // Solo para operaciones de creación
  error?: string
}

// =====================================================
// 🚨 REGLAS OBLIGATORIAS DE NORMALIZACIÓN
// =====================================================

// 1. **NOMBRES DE PROPIEDADES:**
//    ✅ SIEMPRE usar 'data' para los datos principales
//    ❌ NUNCA usar nombres específicos como 'tickets', 'rifas', 'users'

// 2. **ESTRUCTURA DE RESPUESTA:**
//    ✅ SIEMPRE incluir: success, data, error (cuando aplique)
//    ✅ SIEMPRE usar safeAdminQuery para manejo seguro de errores

// 3. **IMPORTS:**
//    ✅ SIEMPRE usar: createAdminQuery, safeAdminQuery, applyPagination, applyOrdering
//    ❌ NUNCA usar: supabase directo o createServerClient en funciones admin

// 4. **MANEJO DE ERRORES:**
//    ✅ SIEMPRE usar safeAdminQuery
//    ✅ SIEMPRE incluir mensajes de error descriptivos
//    ✅ SIEMPRE manejar casos de éxito y error

// =====================================================
// 🔧 EJEMPLOS DE IMPLEMENTACIÓN CORRECTA
// =====================================================

/*
// ✅ EJEMPLO CORRECTO - Listado:
export async function adminListEntities(): Promise<AdminListResponse<Entity>> {
  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('entities').select('*')
      query = applyOrdering(query, 'created_at', 'desc')
      query = applyPagination(query, 100)
      return query
    },
    'Error al listar entidades'
  )
}

// ✅ EJEMPLO CORRECTO - Individual:
export async function adminGetEntity(id: string): Promise<AdminSingleResponse<Entity>> {
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

// ✅ EJEMPLO CORRECTO - Creación:
export async function adminCreateEntity(data: CreateEntityData): Promise<AdminWriteResponse> {
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
*/

// =====================================================
// 🧪 VALIDACIÓN DE NORMALIZACIÓN
// =====================================================

// Función helper para validar que una respuesta sigue el estándar
export function validateAdminResponse<T>(
  response: any, 
  expectedType: 'list' | 'single' | 'write'
): response is AdminListResponse<T> | AdminSingleResponse<T> | AdminWriteResponse {
  
  if (!response || typeof response !== 'object') return false
  if (typeof response.success !== 'boolean') return false
  
  switch (expectedType) {
    case 'list':
      return Array.isArray(response.data) && typeof response.total === 'number'
    case 'single':
      return response.data !== undefined && response.data !== null
    case 'write':
      return response.success || response.error !== undefined
    default:
      return false
  }
}

// =====================================================
// 📚 ARCHIVOS QUE SIGUEN ESTE ESTÁNDAR
// =====================================================

// ✅ COMPLETAMENTE NORMALIZADOS:
// - lib/database/admin_database/tickets.ts
// - lib/database/admin_database/rifas.ts
// - lib/database/admin_database/pagos.ts
// - lib/database/admin_database/usuarios.ts (usa profiles)
// - lib/database/admin_database/categorias.ts
// - lib/database/admin_database/profiles.ts
// - lib/database/admin_database/auth.ts

// =====================================================
// 🎯 BENEFICIOS DE LA NORMALIZACIÓN
// =====================================================

// 1. **CONSISTENCIA**: Todas las funciones admin devuelven el mismo formato
// 2. **PREDICTIBILIDAD**: Los hooks saben exactamente qué esperar
// 3. **MANTENIBILIDAD**: Cambios en un lugar se reflejan en todos
// 4. **REUTILIZACIÓN**: Los helpers funcionan con cualquier función admin
// 5. **DEBUGGING**: Logs y errores siguen el mismo patrón
// 6. **ESCALABILIDAD**: Fácil agregar nuevas funcionalidades admin

// =====================================================
// 🚨 RECORDATORIO FINAL
// =====================================================

// **SIEMPRE SEGUIR ESTOS ESTÁNDARES** al crear nuevas funciones admin
// **NUNCA ROMPER LA NORMALIZACIÓN** existente
// **SIEMPRE USAR LOS HELPERS** proporcionados
// **SIEMPRE VALIDAR** que la respuesta sigue el formato correcto

// **¡La consistencia es la clave del éxito!** 🚀
