"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Tag } from "lucide-react"
import { IconPicker } from "@/app/admin/components/ui/icon-picker"
import { showCreateSuccessToast, showUpdateSuccessToast, showCreateErrorToast, showUpdateErrorToast } from "@/components/ui/toast-notifications"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"

// =====================================================
// 🎯 MODAL FORMULARIO CATEGORIA - ELEVEN RIFAS
// =====================================================
// Modal para crear y editar categorías
// Sigue el patrón establecido para modales admin
// =====================================================

interface CategoriaFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: Partial<AdminCategoria>) => Promise<{ success: boolean; error?: string }>
  categoria?: AdminCategoria | null
  isLoading?: boolean
}

export function CategoriaFormModal({
  isOpen,
  onClose,
  onSubmit,
  categoria,
  isLoading = false
}: CategoriaFormModalProps) {
  // Estados del formulario
  const [formData, setFormData] = useState<Partial<AdminCategoria>>({
    nombre: '',
    icono: 'tag',
    descripcion: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // =====================================================
  // 🔧 FUNCIONES DEL FORMULARIO
  // =====================================================

  // Inicializar formulario cuando cambia la categoría
  useEffect(() => {
    if (categoria) {
      setFormData({
        nombre: categoria.nombre || '',
        icono: categoria.icono || 'tag',
        descripcion: categoria.descripcion || ''
      })
    } else {
      setFormData({
        nombre: '',
        icono: 'tag',
        descripcion: ''
      })
    }
    setErrors({})
  }, [categoria])

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.nombre?.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    } else if (formData.nombre.length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres'
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres'
    }

    if (formData.icono && formData.icono.length > 100) {
      newErrors.icono = 'El nombre del icono no puede exceder 100 caracteres'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Manejar cambios en los campos
  const handleInputChange = (field: keyof AdminCategoria, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Limpiar error del campo cuando se modifica
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsSubmitting(true)
    
    try {
      // Preparar datos para envío - solo campos requeridos
      const submitData = {
        nombre: formData.nombre?.trim(),
        icono: formData.icono || 'tag',
        descripcion: formData.descripcion?.trim() || null
      }
      
      const result = await onSubmit(submitData)
      
      if (result.success) {
        // Mostrar toast de éxito y cerrar modal
        if (isEditing) {
          showUpdateSuccessToast('categoría')
        } else {
          showCreateSuccessToast('categoría')
        }
        onClose()
      } else {
        // Mostrar error general si existe
        if (result.error) {
          if (isEditing) {
            showUpdateErrorToast('categoría', result.error)
          } else {
            showCreateErrorToast('categoría', result.error)
          }
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al guardar'
      if (isEditing) {
        showUpdateErrorToast('categoría', errorMessage)
      } else {
        showCreateErrorToast('categoría', errorMessage)
      }
      setErrors({ general: errorMessage })
    } finally {
      setIsSubmitting(false)
    }
  }

  // =====================================================
  // 🎨 RENDERIZADO
  // =====================================================

  const isEditing = !!categoria
  const title = isEditing ? 'Editar Categoría' : 'Nueva Categoría'
  const description = isEditing 
    ? 'Modifica los datos de la categoría seleccionada'
    : 'Crea una nueva categoría para organizar las rifas'
  const submitText = isEditing ? 'Guardar Cambios' : 'Crear Categoría'

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Solo permitir cerrar si NO se está enviando
        if (!isSubmitting) {
          onClose()
        }
      }}
    >
      <DialogContent 
        className="max-w-md"
        // Prevenir cierre con ESC durante envío
        onEscapeKeyDown={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
        // Prevenir cierre con click fuera durante envío
        onPointerDownOutside={(e) => {
          if (isSubmitting) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {isSubmitting ? (
              isEditing ? 'Actualizando Categoría...' : 'Creando Categoría...'
            ) : (
              title
            )}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error general */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nombre"
              value={formData.nombre || ''}
              onChange={(e) => handleInputChange('nombre', e.target.value)}
              placeholder="Ej: Vehículos, Tecnología, Hogar..."
              className={errors.nombre ? 'border-red-300' : ''}
            />
            {errors.nombre && (
              <p className="text-sm text-red-600">{errors.nombre}</p>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="descripcion">
              Descripción
            </Label>
            <textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Describe brevemente la categoría..."
              className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          {/* Icono */}
          <IconPicker
            value={formData.icono || 'tag'}
            onValueChange={(value) => handleInputChange('icono', value)}
            disabled={isSubmitting}
          />



          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                submitText
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
