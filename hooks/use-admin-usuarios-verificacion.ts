"use client"

import { useState, useEffect, useCallback } from 'react'
import { 
  adminListUsuariosVerificacion, 
  adminCreateUsuarioVerificacion, 
  adminUpdateUsuarioVerificacion, 
  adminDeleteUsuarioVerificacion,
  adminVerifyUsuarioPin,
  adminUpdateUltimoAcceso
} from '@/lib/database/admin_database/usuarios_verificacion'
import type { AdminUsuarioVerificacion } from '@/lib/database/admin_database/usuarios_verificacion'

// =====================================================
// 🎯 HOOK ADMIN USUARIOS VERIFICACION - ELEVEN RIFAS
// =====================================================
// Hook personalizado para gestionar usuarios de verificación en el panel admin
// Sigue el mismo patrón que use-admin-rifas y use-admin-pagos
// =====================================================

interface UseAdminUsuariosVerificacionOptions {
  incluirInactivos?: boolean
  ordenarPor?: 'fecha_creacion' | 'usuario' | 'ultimo_acceso'
  orden?: 'asc' | 'desc'
  limite?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseAdminUsuariosVerificacionReturn {
  // Estado de los datos
  usuarios: AdminUsuarioVerificacion[]
  totalUsuarios: number
  
  // Estados de la aplicación
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Operaciones CRUD
  refreshUsuarios: () => Promise<void>
  createUsuario: (datos: any) => Promise<{ success: boolean; id?: string; error?: string }>
  updateUsuario: (id: string, datos: any) => Promise<{ success: boolean; error?: string }>
  deleteUsuario: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Operaciones específicas
  verifyUsuarioPin: (usuario: string, pin: number) => Promise<{ success: boolean; data?: AdminUsuarioVerificacion; error?: string }>
  updateUltimoAcceso: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Utilidades
  getUsuarioById: (id: string) => AdminUsuarioVerificacion | undefined
  getUsuariosActivos: () => AdminUsuarioVerificacion[]
  getUsuariosInactivos: () => AdminUsuarioVerificacion[]
}

export function useAdminUsuariosVerificacion(options: UseAdminUsuariosVerificacionOptions = {}): UseAdminUsuariosVerificacionReturn {
  const {
    incluirInactivos = true,
    ordenarPor = 'fecha_creacion',
    orden = 'desc',
    limite = 1000,
    autoRefresh = false,
    refreshInterval = 30000 // 30 segundos
  } = options

  // Estados principales
  const [usuarios, setUsuarios] = useState<AdminUsuarioVerificacion[]>([])
  const [totalUsuarios, setTotalUsuarios] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para cargar usuarios
  const loadUsuarios = useCallback(async () => {
    try {
      setError(null)
      const result = await adminListUsuariosVerificacion({
        incluirInactivos,
        ordenarPor,
        orden,
        limite
      })

      if (result.success) {
        setUsuarios(result.data || [])
        setTotalUsuarios(result.data?.length || 0)
        console.log(`✅ Usuarios de verificación cargados: ${result.data?.length || 0}`)
      } else {
        setError(result.error || 'Error al cargar los usuarios de verificación')
        setUsuarios([])
        setTotalUsuarios(0)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar usuarios'
      setError(errorMessage)
      setUsuarios([])
      setTotalUsuarios(0)
    } finally {
      setIsLoading(false)
    }
  }, [incluirInactivos, ordenarPor, orden, limite])

  // Función para refrescar usuarios
  const refreshUsuarios = useCallback(async () => {
    if (isRefreshing) return // Evitar múltiples refrescos simultáneos
    
    try {
      setIsRefreshing(true)
      setError(null)
      
      const result = await adminListUsuariosVerificacion({
        incluirInactivos,
        ordenarPor,
        orden,
        limite
      })

      if (result.success) {
        setUsuarios(result.data || [])
        setTotalUsuarios(result.data?.length || 0)
      } else {
        setError(result.error || 'Error al refrescar los usuarios de verificación')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al refrescar usuarios'
      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }, [incluirInactivos, ordenarPor, orden, limite])

  // Función para crear usuario
  const createUsuario = useCallback(async (datos: any) => {
    try {
      setError(null)
      
      // Validar datos requeridos
      if (!datos.usuario || !datos.pin) {
        return { success: false, error: 'Usuario y PIN son requeridos' }
      }

      // Validar formato del PIN
      if (datos.pin < 1000 || datos.pin > 9999) {
        return { success: false, error: 'El PIN debe ser un número de 4 dígitos (1000-9999)' }
      }

      // Validar longitud del usuario
      if (datos.usuario.length > 20) {
        return { success: false, error: 'El nombre de usuario no puede exceder 20 caracteres' }
      }

      const result = await adminCreateUsuarioVerificacion(datos)
      
      if (result.success) {
        // Recargar usuarios después de crear
        await loadUsuarios()
        return { success: true, id: result.data?.id }
      } else {
        return { success: false, error: result.error || 'Error al crear el usuario' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [loadUsuarios])

  // Función para actualizar usuario
  const updateUsuario = useCallback(async (id: string, datos: any) => {
    try {
      setError(null)
      const result = await adminUpdateUsuarioVerificacion(id, datos)
      
      if (result.success) {
        // Refrescar la lista después de actualizar
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [refreshUsuarios])

  // Función para eliminar usuario
  const deleteUsuario = useCallback(async (id: string) => {
    try {
      setError(null)
      const result = await adminDeleteUsuarioVerificacion(id)
      
      if (result.success) {
        // Refrescar la lista después de eliminar
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [refreshUsuarios])

  // Función para verificar usuario y PIN
  const verifyUsuarioPin = useCallback(async (usuario: string, pin: number) => {
    try {
      setError(null)
      const result = await adminVerifyUsuarioPin(usuario, pin)
      
      if (result.success && result.data) {
        return { success: true, data: result.data }
      } else {
        return { success: false, error: 'Usuario o PIN incorrectos' }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al verificar usuario'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Función para actualizar último acceso
  const updateUltimoAcceso = useCallback(async (id: string) => {
    try {
      setError(null)
      const result = await adminUpdateUltimoAcceso(id)
      
      if (result.success) {
        // Actualizar el usuario en el estado local sin recargar toda la lista
        setUsuarios(prev => prev.map(u => 
          u.id === id 
            ? { ...u, ultimo_acceso: new Date().toISOString() }
            : u
        ))
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar último acceso'
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }, [])

  // Funciones de utilidad
  const getUsuarioById = useCallback((id: string) => {
    return usuarios.find(usuario => usuario.id === id)
  }, [usuarios])

  const getUsuariosActivos = useCallback(() => {
    return usuarios.filter(usuario => usuario.activo === true)
  }, [usuarios])

  const getUsuariosInactivos = useCallback(() => {
    return usuarios.filter(usuario => usuario.activo === false)
  }, [usuarios])

  // Cargar usuarios al montar el componente
  useEffect(() => {
    loadUsuarios()
  }, [loadUsuarios])

  // Auto-refresh si está habilitado
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshUsuarios()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, refreshUsuarios])

  return {
    // Estado de los datos
    usuarios,
    totalUsuarios,
    
    // Estados de la aplicación
    isLoading,
    isRefreshing,
    error,
    
    // Operaciones CRUD
    refreshUsuarios,
    createUsuario,
    updateUsuario,
    deleteUsuario,
    
    // Operaciones específicas
    verifyUsuarioPin,
    updateUltimoAcceso,
    
    // Utilidades
    getUsuarioById,
    getUsuariosActivos,
    getUsuariosInactivos
  }
}
