// =====================================================
// 🛠️ ADMIN DB - USUARIOS VERIFICACION
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// Gestión de usuarios para verificación con PIN
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering,
  applyPagination
} from '@/lib/database'

// =====================================================
// 🎯 TIPOS PARA USUARIO VERIFICACION
// =====================================================

export interface UsuarioVerificacion {
  id: string
  usuario: string
  pin: number
  activo: boolean
  fecha_creacion: string
  ultimo_acceso?: string | null
}

export interface UsuarioVerificacionInsert {
  usuario: string
  pin: number
  activo?: boolean
}

export interface UsuarioVerificacionUpdate {
  usuario?: string
  pin?: number
  activo?: boolean
  ultimo_acceso?: string | null
}

export type AdminUsuarioVerificacion = UsuarioVerificacion

// =====================================================
// 🔍 CONSULTAS PRINCIPALES
// =====================================================

/**
 * Listar todos los usuarios de verificación
 */
export async function adminListUsuariosVerificacion(params?: {
  incluirInactivos?: boolean
  ordenarPor?: 'fecha_creacion' | 'usuario' | 'ultimo_acceso'
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}) {
  const { 
    incluirInactivos = true,
    ordenarPor = 'fecha_creacion',
    orden = 'desc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('usuario_verificacion')
        .select('*')
      
      // Filtrar por activos si es necesario
      if (!incluirInactivos) {
        query = query.eq('activo', true)
      }
      
      // Aplicar ordenamiento
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación
      query = applyPagination(query, limite, offset)

      const result = await query

      return { 
        data: result.data as AdminUsuarioVerificacion[],
        error: null,
        total: result.data?.length || 0
      }
    },
    'Error al listar usuarios de verificación'
  )
}

/**
 * Obtener usuario por ID
 */
export async function adminGetUsuarioVerificacion(id: string) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('usuario_verificacion')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data: data as AdminUsuarioVerificacion, error: null }
    },
    'Error al obtener usuario de verificación'
  )
}

/**
 * Verificar usuario y PIN (para login)
 */
export async function adminVerifyUsuarioPin(usuario: string, pin: number) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('usuario_verificacion')
        .select('*')
        .eq('usuario', usuario)
        .eq('pin', pin)
        .eq('activo', true)
        .single()

      if (error) {
        // Si no encuentra el usuario/pin, retorna null en lugar de error
        if (error.code === 'PGRST116') {
          return { data: null, error: null }
        }
        throw error
      }

      return { data: data as AdminUsuarioVerificacion, error: null }
    },
    'Error al verificar usuario y PIN'
  )
}

// =====================================================
// 🔧 OPERACIONES CRUD
// =====================================================

/**
 * Crear nuevo usuario de verificación
 */
export async function adminCreateUsuarioVerificacion(datos: UsuarioVerificacionInsert) {
  // Validaciones
  if (!datos.usuario || datos.usuario.trim().length === 0) {
    return { success: false as const, error: 'El nombre de usuario es requerido' }
  }

  if (!datos.pin || datos.pin < 1000 || datos.pin > 9999) {
    return { success: false as const, error: 'El PIN debe ser un número de 4 dígitos (1000-9999)' }
  }

  if (datos.usuario.length > 20) {
    return { success: false as const, error: 'El nombre de usuario no puede exceder 20 caracteres' }
  }

  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('usuario_verificacion')
        .insert({
          usuario: datos.usuario.trim().toLowerCase(),
          pin: datos.pin,
          activo: datos.activo !== undefined ? datos.activo : true
        })
        .select()
        .single()

      if (error) {
        // Manejo específico de errores de unicidad
        if (error.code === '23505' && error.message.includes('usuario_verificacion_usuario_key')) {
          throw new Error('Ya existe un usuario con ese nombre')
        }
        throw error
      }

      return { data: data as AdminUsuarioVerificacion, error: null }
    },
    'Error al crear usuario de verificación'
  )
}

/**
 * Actualizar usuario de verificación
 */
export async function adminUpdateUsuarioVerificacion(id: string, datos: UsuarioVerificacionUpdate) {
  // Validaciones opcionales
  if (datos.usuario !== undefined) {
    if (!datos.usuario || datos.usuario.trim().length === 0) {
      return { success: false as const, error: 'El nombre de usuario no puede estar vacío' }
    }
    if (datos.usuario.length > 20) {
      return { success: false as const, error: 'El nombre de usuario no puede exceder 20 caracteres' }
    }
  }

  if (datos.pin !== undefined) {
    if (datos.pin < 1000 || datos.pin > 9999) {
      return { success: false as const, error: 'El PIN debe ser un número de 4 dígitos (1000-9999)' }
    }
  }

  return safeAdminQuery(
    async () => {
      const updateData: any = {}
      
      if (datos.usuario !== undefined) {
        updateData.usuario = datos.usuario.trim().toLowerCase()
      }
      if (datos.pin !== undefined) {
        updateData.pin = datos.pin
      }
      if (datos.activo !== undefined) {
        updateData.activo = datos.activo
      }
      if (datos.ultimo_acceso !== undefined) {
        updateData.ultimo_acceso = datos.ultimo_acceso
      }

      const { data, error } = await createAdminQuery('usuario_verificacion')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        // Manejo específico de errores de unicidad
        if (error.code === '23505' && error.message.includes('usuario_verificacion_usuario_key')) {
          throw new Error('Ya existe un usuario con ese nombre')
        }
        throw error
      }

      return { data: data as AdminUsuarioVerificacion, error: null }
    },
    'Error al actualizar usuario de verificación'
  )
}

/**
 * Actualizar último acceso
 */
export async function adminUpdateUltimoAcceso(id: string) {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('usuario_verificacion')
        .update({ ultimo_acceso: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: data as AdminUsuarioVerificacion, error: null }
    },
    'Error al actualizar último acceso'
  )
}

/**
 * Eliminar usuario de verificación
 */
export async function adminDeleteUsuarioVerificacion(id: string): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Verificar que el usuario existe
      const { data: usuarioExistente, error: errorVerify } = await createAdminQuery('usuario_verificacion')
        .select('id, usuario')
        .eq('id', id)
        .single()

      if (errorVerify || !usuarioExistente) {
        throw new Error('Usuario de verificación no encontrado')
      }

      // Eliminar el usuario
      const { error: errorDelete } = await createAdminQuery('usuario_verificacion')
        .delete()
        .eq('id', id)

      if (errorDelete) throw errorDelete

      return { data: null, error: null }
    },
    'Error al eliminar usuario de verificación'
  )
}

/**
 * Eliminar múltiples usuarios de verificación
 */
export async function adminDeleteMultipleUsuariosVerificacion(ids: string[]): Promise<{ 
  success: boolean; 
  results: Array<{ id: string; success: boolean; error?: string }>;
  summary: { total: number; success: number; failed: number };
  error?: string 
}> {
  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { 
        success: false, 
        results: [], 
        summary: { total: 0, success: 0, failed: 0 },
        error: 'Lista de IDs inválida o vacía' 
      }
    }

    const results = []
    let successCount = 0
    let failedCount = 0

    // Procesar cada usuario individualmente
    for (const id of ids) {
      const result = await adminDeleteUsuarioVerificacion(id)
      results.push({ id, success: result.success, error: result.error })
      
      if (result.success) {
        successCount++
      } else {
        failedCount++
      }
    }

    const summary = { total: ids.length, success: successCount, failed: failedCount }
    const overallSuccess = failedCount === 0

    return {
      success: overallSuccess,
      results,
      summary,
      error: overallSuccess ? undefined : `${failedCount} de ${ids.length} usuarios no pudieron ser eliminados`
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error inesperado al eliminar múltiples usuarios'
    return { 
      success: false, 
      results: [],
      summary: { total: ids.length, success: 0, failed: ids.length },
      error: errorMessage
    }
  }
}

// =====================================================
// 📊 ESTADÍSTICAS Y UTILIDADES
// =====================================================

/**
 * Obtener estadísticas de usuarios de verificación
 */
export async function adminUsuariosVerificacionStats() {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('usuario_verificacion')
        .select('activo, ultimo_acceso')

      if (error) throw error

      const total = data.length
      const activos = data.filter((u: any) => u.activo === true).length
      const inactivos = data.filter((u: any) => u.activo === false).length
      const conAcceso = data.filter((u: any) => u.ultimo_acceso !== null).length
      const sinAcceso = data.filter((u: any) => u.ultimo_acceso === null).length

      return { 
        data: { total, activos, inactivos, conAcceso, sinAcceso }, 
        error: null 
      }
    },
    'Error al obtener estadísticas de usuarios de verificación'
  )
}
