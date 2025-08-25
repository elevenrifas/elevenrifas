"use client"

import { useState, useCallback } from 'react'
import { 
  adminListCategorias, 
  adminGetCategoria, 
  adminCreateCategoria, 
  adminUpdateCategoria, 
  adminDeleteCategoria,
  type AdminCategoria 
} from '@/lib/database/admin_database/categorias'

// =====================================================
// 🎯 HOOK ADMIN CATEGORIAS - ELEVEN RIFAS
// =====================================================
// Hook para gestionar categorías en el panel de administración
// Sigue el patrón establecido para hooks admin
// =====================================================

export function useAdminCategorias() {
  // Estados principales
  const [categorias, setCategorias] = useState<AdminCategoria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estados para operaciones CRUD
  const [creating, setCreating] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // =====================================================
  // 📋 FUNCIONES PRINCIPALES
  // =====================================================

  // 1. CARGAR CATEGORIAS
  const loadCategorias = useCallback(async (params?: {
    ordenarPor?: string
    orden?: 'asc' | 'desc'
    limite?: number
    offset?: number
  }) => {
    try {
      console.log('🔄 [HOOK] Iniciando carga de categorías...')
      console.log('🔄 [HOOK] Parámetros recibidos:', params)
      
      setLoading(true)
      setError(null)
      
      console.log('🔄 [HOOK] Llamando a adminListCategorias...')
      const result = await adminListCategorias(params)
      console.log('🔄 [HOOK] Resultado de adminListCategorias:', result)
      
      if (result.success) {
        console.log('🔄 [HOOK] Éxito, estableciendo categorías:', result.data)
        setCategorias(result.data || [])
      } else {
        console.log('🔄 [HOOK] Error en resultado:', result.error)
        setError(result.error || 'Error al cargar categorías')
        setCategorias([])
      }
    } catch (err) {
      console.error('🔄 [HOOK] Error inesperado:', err)
      setError('Error inesperado al cargar categorías')
      setCategorias([])
    } finally {
      setLoading(false)
      console.log('🔄 [HOOK] Carga completada, loading: false')
    }
  }, [])

  // 2. OBTENER CATEGORIA INDIVIDUAL
  const getCategoria = useCallback(async (id: string) => {
    try {
      setError(null)
      
      const result = await adminGetCategoria(id)
      
      if (result.success) {
        return result.data
      } else {
        setError(result.error || 'Error al obtener categoría')
        return null
      }
    } catch (err) {
      setError('Error inesperado al obtener categoría')
      return null
    }
  }, [])

  // 3. CREAR CATEGORIA
  const createCategoria = useCallback(async (categoriaData: any) => {
    try {
      setCreating(true)
      setError(null)
      
      const result = await adminCreateCategoria(categoriaData)
      
      if (result.success) {
        // Recargar la lista después de crear
        await loadCategorias()
        return { success: true, id: result.data?.id }
      } else {
        setError(result.error || 'Error al crear categoría')
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError('Error inesperado al crear categoría')
      return { success: false, error: 'Error inesperado' }
    } finally {
      setCreating(false)
    }
  }, [loadCategorias])

  // 4. ACTUALIZAR CATEGORIA
  const updateCategoria = useCallback(async (id: string, categoriaData: any) => {
    try {
      setUpdating(true)
      setError(null)
      
      const result = await adminUpdateCategoria(id, categoriaData)
      
      if (result.success) {
        // Recargar la lista después de actualizar
        await loadCategorias()
        return { success: true }
      } else {
        setError(result.error || 'Error al actualizar categoría')
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError('Error inesperado al actualizar categoría')
      return { success: false, error: 'Error inesperado' }
    } finally {
      setUpdating(false)
    }
  }, [loadCategorias])

  // 5. ELIMINAR CATEGORIA
  const deleteCategoria = useCallback(async (id: string) => {
    try {
      setDeleting(true)
      setError(null)
      
      const result = await adminDeleteCategoria(id)
      
      if (result.success) {
        // Recargar la lista después de eliminar
        await loadCategorias()
        return { success: true }
      } else {
        setError(result.error || 'Error al eliminar categoría')
        return { success: false, error: result.error }
      }
    } catch (err) {
      setError('Error inesperado al eliminar categoría')
      return { success: false, error: 'Error inesperado' }
    } finally {
      setDeleting(false)
    }
  }, [loadCategorias])

  // 6. ELIMINAR MÚLTIPLES CATEGORIAS
  const deleteMultipleCategorias = useCallback(async (ids: string[]) => {
    try {
      setDeleting(true)
      setError(null)
      
      let successCount = 0
      let errorCount = 0
      
      for (const id of ids) {
        const result = await adminDeleteCategoria(id)
        if (result.success) {
          successCount++
        } else {
          errorCount++
        }
      }
      
      // Recargar la lista después de eliminar
      await loadCategorias()
      
      if (errorCount === 0) {
        return { success: true, deleted: successCount }
      } else {
        setError(`${successCount} eliminadas, ${errorCount} con errores`)
        return { success: false, deleted: successCount, errors: errorCount }
      }
    } catch (err) {
      setError('Error inesperado al eliminar categorías')
      return { success: false, error: 'Error inesperado' }
    } finally {
      setDeleting(false)
    }
  }, [loadCategorias])

  // =====================================================
  // 🔧 FUNCIONES UTILITARIAS
  // =====================================================

  // Limpiar errores
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Obtener categoría por ID desde el estado local
  const getCategoriaById = useCallback((id: string) => {
    return categorias.find(cat => cat.id === id)
  }, [categorias])

  // Filtrar categorías activas (no aplicable con esquema actual)
  const getCategoriasActivas = useCallback(() => {
    return categorias // Todas las categorías están activas por defecto
  }, [categorias])

  // =====================================================
  // 📊 ESTADOS COMPUTADOS
  // =====================================================

  const totalCategorias = categorias.length
  const categoriasActivas = categorias.length // Todas están activas
  const categoriasInactivas = 0 // No hay categorías inactivas

  return {
    // Estados
    categorias,
    loading,
    error,
    creating,
    updating,
    deleting,
    
      // Funciones principales
  loadCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  deleteMultipleCategorias,
  refreshCategorias: loadCategorias,
    
    // Funciones utilitarias
    clearError,
    getCategoriaById,
    getCategoriasActivas,
    
    // Estados computados
    totalCategorias,
    categoriasActivas,
    categoriasInactivas,
    
    // Helpers de estado
    hasData: categorias.length > 0,
    isEmpty: categorias.length === 0,
    isBusy: loading || creating || updating || deleting
  }
}
