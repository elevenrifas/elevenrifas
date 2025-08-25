"use client"

import * as React from 'react'
import { useState, useCallback } from 'react'
import { useAdminUsuariosVerificacion } from './use-admin-usuarios-verificacion'
import type { AdminUsuarioVerificacion } from '@/lib/database/admin_database/usuarios_verificacion'

// =====================================================
// 🎯 HOOK CRUD USUARIOS VERIFICACION - ELEVEN RIFAS
// =====================================================
// Hook personalizado para gestión completa de usuarios de verificación
// Sigue el mismo patrón que use-crud-rifas y use-crud-pagos
// =====================================================

// Tipos para el CRUD
export interface CrudUsuarioVerificacionData {
  usuario: string
  pin: number
  activo?: boolean
}

export interface CrudUsuarioVerificacionFilters {
  activo?: boolean
  ultimoAcceso?: 'con_acceso' | 'sin_acceso' | 'todos'
}

export interface CrudUsuarioVerificacionSort {
  field: 'fecha_creacion' | 'usuario' | 'ultimo_acceso'
  direction: 'asc' | 'desc'
}

export interface UseCrudUsuariosVerificacionReturn {
  // Estado de los datos
  usuarios: AdminUsuarioVerificacion[]
  totalUsuarios: number
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
  
  // Estados del CRUD
  isCreating: boolean
  isUpdating: boolean
  isDeleting: boolean
  isVerifying: boolean
  
  // Estados de modales
  showCreateModal: boolean
  showEditModal: boolean
  showDeleteModal: boolean
  showViewModal: boolean
  showVerifyModal: boolean
  
  // Datos seleccionados
  selectedUsuario: AdminUsuarioVerificacion | null
  selectedUsuarios: AdminUsuarioVerificacion[]
  
  // Operaciones CRUD
  createUsuario: (data: CrudUsuarioVerificacionData) => Promise<{ success: boolean; error?: string }>
  updateUsuario: (id: string, data: Partial<CrudUsuarioVerificacionData>) => Promise<{ success: boolean; error?: string }>
  deleteUsuario: (id: string) => Promise<{ success: boolean; error?: string }>
  deleteMultipleUsuarios: (ids: string[]) => Promise<{ success: boolean; error?: string }>
  verifyUsuarioPin: (usuario: string, pin: number) => Promise<{ success: boolean; data?: AdminUsuarioVerificacion; error?: string }>
  toggleUsuarioEstado: (id: string) => Promise<{ success: boolean; error?: string }>
  
  // Operaciones de UI
  openCreateModal: () => void
  closeCreateModal: () => void
  openEditModal: (usuario: AdminUsuarioVerificacion) => void
  closeEditModal: () => void
  openDeleteModal: (usuario: AdminUsuarioVerificacion) => void
  closeDeleteModal: () => void
  openViewModal: (usuario: AdminUsuarioVerificacion) => void
  closeViewModal: () => void
  openVerifyModal: () => void
  closeVerifyModal: () => void
  
  // Selección
  selectUsuario: (usuario: AdminUsuarioVerificacion) => void
  selectMultipleUsuarios: (usuarios: AdminUsuarioVerificacion[]) => void
  clearSelection: () => void
  toggleUsuarioSelection: (usuario: AdminUsuarioVerificacion) => void
  
  // Utilidades
  refreshUsuarios: () => Promise<void>
  exportUsuarios: (usuarios?: AdminUsuarioVerificacion[]) => void
  getUsuariosActivos: () => AdminUsuarioVerificacion[]
  getUsuariosInactivos: () => AdminUsuarioVerificacion[]
  isUsuarioSelected: (usuario: AdminUsuarioVerificacion) => boolean
}

export function useCrudUsuariosVerificacion(options: {
  initialFilters?: CrudUsuarioVerificacionFilters
  initialSort?: CrudUsuarioVerificacionSort
  autoRefresh?: boolean
  refreshInterval?: number
} = {}): UseCrudUsuariosVerificacionReturn {
  const {
    initialFilters = {},
    initialSort = { field: 'fecha_creacion', direction: 'desc' },
    autoRefresh = false,
    refreshInterval = 30000
  } = options

  // Hook base para datos
  const {
    usuarios,
    totalUsuarios,
    isLoading,
    isRefreshing,
    error,
    refreshUsuarios,
    createUsuario: baseCreateUsuario,
    updateUsuario: baseUpdateUsuario,
    deleteUsuario: baseDeleteUsuario,
    verifyUsuarioPin: baseVerifyUsuarioPin,
    getUsuarioById,
    getUsuariosActivos,
    getUsuariosInactivos
  } = useAdminUsuariosVerificacion({
    incluirInactivos: true,
    ordenarPor: initialSort.field,
    orden: initialSort.direction,
    autoRefresh,
    refreshInterval
  })

  // Estados del CRUD
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)

  // Estados de modales
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showVerifyModal, setShowVerifyModal] = useState(false)

  // Datos seleccionados
  const [selectedUsuario, setSelectedUsuario] = useState<AdminUsuarioVerificacion | null>(null)
  const [selectedUsuarios, setSelectedUsuarios] = useState<AdminUsuarioVerificacion[]>([])

  // Operaciones CRUD
  const createUsuario = useCallback(async (data: CrudUsuarioVerificacionData) => {
    try {
      setIsCreating(true)
      const result = await baseCreateUsuario(data)
      
      if (result.success) {
        closeCreateModal()
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al crear usuario'
      return { success: false, error: errorMessage }
    } finally {
      setIsCreating(false)
    }
  }, [baseCreateUsuario, refreshUsuarios])

  const updateUsuario = useCallback(async (id: string, data: Partial<CrudUsuarioVerificacionData>) => {
    try {
      setIsUpdating(true)
      const result = await baseUpdateUsuario(id, data)
      
      if (result.success) {
        closeEditModal()
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al actualizar usuario'
      return { success: false, error: errorMessage }
    } finally {
      setIsUpdating(false)
    }
  }, [baseUpdateUsuario, refreshUsuarios])

  const deleteUsuario = useCallback(async (id: string) => {
    try {
      setIsDeleting(true)
      const result = await baseDeleteUsuario(id)
      
      if (result.success) {
        closeDeleteModal()
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar usuario'
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [baseDeleteUsuario, refreshUsuarios])

  const deleteMultipleUsuarios = useCallback(async (ids: string[]) => {
    try {
      setIsDeleting(true)
      
      // Importar dinámicamente la función de eliminación múltiple
      const { adminDeleteMultipleUsuariosVerificacion } = await import('@/lib/database/admin_database/usuarios_verificacion')
      
      const result = await adminDeleteMultipleUsuariosVerificacion(ids)
      
      if (result.success) {
        clearSelection()
        await refreshUsuarios()
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar usuarios'
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }, [refreshUsuarios])

  const verifyUsuarioPin = useCallback(async (usuario: string, pin: number) => {
    try {
      setIsVerifying(true)
      const result = await baseVerifyUsuarioPin(usuario, pin)
      
      if (result.success) {
        closeVerifyModal()
        // Actualizar último acceso si la verificación fue exitosa
        if (result.data?.id) {
          const { adminUpdateUltimoAcceso } = await import('@/lib/database/admin_database/usuarios_verificacion')
          await adminUpdateUltimoAcceso(result.data.id)
          await refreshUsuarios()
        }
      }
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al verificar usuario'
      return { success: false, error: errorMessage }
    } finally {
      setIsVerifying(false)
    }
  }, [baseVerifyUsuarioPin, refreshUsuarios])

  const toggleUsuarioEstado = useCallback(async (id: string) => {
    try {
      const usuario = getUsuarioById(id)
      if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' }
      }

      const result = await baseUpdateUsuario(id, { activo: !usuario.activo })
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cambiar estado'
      return { success: false, error: errorMessage }
    }
  }, [baseUpdateUsuario, getUsuarioById])

  // Operaciones de UI
  const openCreateModal = useCallback(() => setShowCreateModal(true), [])
  const closeCreateModal = useCallback(() => setShowCreateModal(false), [])
  
  const openEditModal = useCallback((usuario: AdminUsuarioVerificacion) => {
    setSelectedUsuario(usuario)
    setShowEditModal(true)
  }, [])
  const closeEditModal = useCallback(() => {
    setShowEditModal(false)
    setSelectedUsuario(null)
  }, [])
  
  const openDeleteModal = useCallback((usuario: AdminUsuarioVerificacion) => {
    setSelectedUsuario(usuario)
    setShowDeleteModal(true)
  }, [])
  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setSelectedUsuario(null)
  }, [])
  
  const openViewModal = useCallback((usuario: AdminUsuarioVerificacion) => {
    setSelectedUsuario(usuario)
    setShowViewModal(true)
  }, [])
  const closeViewModal = useCallback(() => {
    setShowViewModal(false)
    setSelectedUsuario(null)
  }, [])
  
  const openVerifyModal = useCallback(() => setShowVerifyModal(true), [])
  const closeVerifyModal = useCallback(() => setShowVerifyModal(false), [])

  // Selección
  const selectUsuario = useCallback((usuario: AdminUsuarioVerificacion) => {
    setSelectedUsuario(usuario)
  }, [])

  const selectMultipleUsuarios = useCallback((usuarios: AdminUsuarioVerificacion[]) => {
    setSelectedUsuarios(usuarios)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedUsuario(null)
    setSelectedUsuarios([])
  }, [])

  const toggleUsuarioSelection = useCallback((usuario: AdminUsuarioVerificacion) => {
    setSelectedUsuarios(prev => {
      const exists = prev.find(u => u.id === usuario.id)
      if (exists) {
        return prev.filter(u => u.id !== usuario.id)
      } else {
        return [...prev, usuario]
      }
    })
  }, [])

  const isUsuarioSelected = useCallback((usuario: AdminUsuarioVerificacion) => {
    return selectedUsuarios.some(u => u.id === usuario.id)
  }, [selectedUsuarios])

  // Utilidades
  const exportUsuarios = useCallback((usuariosToExport?: AdminUsuarioVerificacion[]) => {
    const dataToExport = usuariosToExport || usuarios
    console.log('📊 Exportando usuarios de verificación:', dataToExport.length)
    
    // Crear CSV
    const headers = ['ID', 'Usuario', 'PIN', 'Activo', 'Fecha Creación', 'Último Acceso']
    const csvRows = [
      headers.join(','),
      ...dataToExport.map(usuario => [
        usuario.id,
        `"${usuario.usuario}"`,
        usuario.pin,
        usuario.activo ? 'Sí' : 'No',
        new Date(usuario.fecha_creacion).toLocaleDateString('es-ES'),
        usuario.ultimo_acceso ? new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES') : 'Nunca'
      ].join(','))
    ]
    
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', `usuarios_verificacion_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [usuarios])

  return {
    // Estado de los datos
    usuarios,
    totalUsuarios,
    isLoading,
    isRefreshing,
    error,
    
    // Estados del CRUD
    isCreating,
    isUpdating,
    isDeleting,
    isVerifying,
    
    // Estados de modales
    showCreateModal,
    showEditModal,
    showDeleteModal,
    showViewModal,
    showVerifyModal,
    
    // Datos seleccionados
    selectedUsuario,
    selectedUsuarios,
    
    // Operaciones CRUD
    createUsuario,
    updateUsuario,
    deleteUsuario,
    deleteMultipleUsuarios,
    verifyUsuarioPin,
    toggleUsuarioEstado,
    
    // Operaciones de UI
    openCreateModal,
    closeCreateModal,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    openViewModal,
    closeViewModal,
    openVerifyModal,
    closeVerifyModal,
    
    // Selección
    selectUsuario,
    selectMultipleUsuarios,
    clearSelection,
    toggleUsuarioSelection,
    
    // Utilidades
    refreshUsuarios,
    exportUsuarios,
    getUsuariosActivos,
    getUsuariosInactivos,
    isUsuarioSelected
  }
}
