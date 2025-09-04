"use client"

import { toast } from "sonner"

// =====================================================
// 🎯 COMPONENTE TOAST NOTIFICATIONS - ELEVEN RIFAS
// =====================================================
// Componente reutilizable para notificaciones toast
// Maneja género correcto y colores apropiados
// =====================================================

// Mapeo de entidades con su género
const entityGenderMap: Record<string, 'masculino' | 'femenino'> = {
  'categoría': 'femenino',
  'categorias': 'femenino',
  'rifa': 'femenino',
  'rifas': 'femenino',
  'pago': 'masculino',
  'pagos': 'masculino',
  'ticket': 'masculino',
  'tickets': 'masculino',
  'usuario': 'masculino',
  'usuarios': 'masculino',
  'cliente': 'masculino',
  'clientes': 'masculino',
  'elemento': 'masculino',
  'elementos': 'masculino'
}

// Función para obtener el género de una entidad
const getEntityGender = (entityName: string): 'masculino' | 'femenino' => {
  const normalizedEntity = entityName.toLowerCase().trim()
  return entityGenderMap[normalizedEntity] || 'masculino'
}

// Función para capitalizar la primera letra
const capitalizeFirstLetter = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Función para obtener el verbo correcto según el género
const getCorrectVerb = (entityName: string, action: 'eliminado' | 'creado' | 'actualizado'): string => {
  const gender = getEntityGender(entityName)
  
  switch (action) {
    case 'eliminado':
      return gender === 'femenino' ? 'eliminada' : 'eliminado'
    case 'creado':
      return gender === 'femenino' ? 'creada' : 'creado'
    case 'actualizado':
      return gender === 'femenino' ? 'actualizada' : 'actualizado'
    default:
      return action
  }
}

// =====================================================
// 🎨 FUNCIONES DE TOAST CON COLORES
// =====================================================

export const showSuccessToast = (message: string, options?: { duration?: number }) => {
  toast.success(message, {
    duration: options?.duration || 4000,
    style: {
      background: '#10b981', // green-500
      color: '#ffffff',
      border: '1px solid #059669', // green-600
    },
    className: 'toast-success'
  })
}

export const showErrorToast = (message: string, options?: { duration?: number }) => {
  toast.error(message, {
    duration: options?.duration || 5000,
    style: {
      background: '#ef4444', // red-500
      color: '#ffffff',
      border: '1px solid #dc2626', // red-600
    },
    className: 'toast-error'
  })
}

export const showWarningToast = (message: string, options?: { duration?: number }) => {
  toast.warning(message, {
    duration: options?.duration || 4000,
    style: {
      background: '#f59e0b', // amber-500
      color: '#ffffff',
      border: '1px solid #d97706', // amber-600
    },
    className: 'toast-warning'
  })
}

export const showInfoToast = (message: string, options?: { duration?: number }) => {
  toast.info(message, {
    duration: options?.duration || 4000,
    style: {
      background: '#3b82f6', // blue-500
      color: '#ffffff',
      border: '1px solid #2563eb', // blue-600
    },
    className: 'toast-info'
  })
}

// =====================================================
// 🎯 FUNCIONES ESPECÍFICAS PARA ACCIONES CRUD
// =====================================================

export const showDeleteSuccessToast = (entityName: string, options?: { duration?: number }) => {
  const capitalizedEntity = capitalizeFirstLetter(entityName)
  const correctVerb = getCorrectVerb(entityName, 'eliminado')
  const message = `${capitalizedEntity} ${correctVerb} exitosamente`
  
  showSuccessToast(message, options)
}

export const showCreateSuccessToast = (entityName: string, options?: { duration?: number }) => {
  const capitalizedEntity = capitalizeFirstLetter(entityName)
  const correctVerb = getCorrectVerb(entityName, 'creado')
  const message = `${capitalizedEntity} ${correctVerb} exitosamente`
  
  showSuccessToast(message, options)
}

export const showUpdateSuccessToast = (entityName: string, options?: { duration?: number }) => {
  const capitalizedEntity = capitalizeFirstLetter(entityName)
  const correctVerb = getCorrectVerb(entityName, 'actualizado')
  const message = `${capitalizedEntity} ${correctVerb} exitosamente`
  
  showSuccessToast(message, options)
}

export const showDeleteErrorToast = (entityName: string, customMessage?: string, options?: { duration?: number }) => {
  const message = customMessage || `Error al eliminar ${entityName}`
  showErrorToast(message, options)
}

export const showCreateErrorToast = (entityName: string, customMessage?: string, options?: { duration?: number }) => {
  const message = customMessage || `Error al crear ${entityName}`
  showErrorToast(message, options)
}

export const showUpdateErrorToast = (entityName: string, customMessage?: string, options?: { duration?: number }) => {
  const message = customMessage || `Error al actualizar ${entityName}`
  showErrorToast(message, options)
}

// =====================================================
// 🎨 HOOK PARA USAR EN COMPONENTES
// =====================================================

export const useToastNotifications = () => {
  return {
    // Funciones básicas
    success: showSuccessToast,
    error: showErrorToast,
    warning: showWarningToast,
    info: showInfoToast,
    
    // Funciones específicas CRUD
    deleteSuccess: showDeleteSuccessToast,
    createSuccess: showCreateSuccessToast,
    updateSuccess: showUpdateSuccessToast,
    deleteError: showDeleteErrorToast,
    createError: showCreateErrorToast,
    updateError: showUpdateErrorToast,
    
    // Utilidades
    getEntityGender,
    getCorrectVerb,
    capitalizeFirstLetter
  }
}
