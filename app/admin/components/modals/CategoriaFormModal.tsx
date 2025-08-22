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
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Loader2, Tag, Palette, Image } from "lucide-react"
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
    descripcion: '',
    color: '#3B82F6',
    icono: 'tag',
    activa: true,
    orden: 0
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
        descripcion: categoria.descripcion || '',
        color: categoria.color || '#3B82F6',
        icono: categoria.icono || 'tag',
        activa: categoria.activa ?? true,
        orden: categoria.orden || 0
      })
    } else {
      setFormData({
        nombre: '',
        descripcion: '',
        color: '#3B82F6',
        icono: 'tag',
        activa: true,
        orden: 0
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

    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres'
    }

    if (!formData.color) {
      newErrors.color = 'El color es obligatorio'
    } else if (formData.color.length !== 7 || !formData.color.startsWith('#')) {
      newErrors.color = 'El color debe ser un código hexadecimal válido (ej: #3B82F6)'
    }

    if (formData.icono && formData.icono.length > 100) {
      newErrors.icono = 'El nombre del icono no puede exceder 100 caracteres'
    }

    if (formData.orden !== undefined && (formData.orden < 0 || formData.orden > 9999)) {
      newErrors.orden = 'El orden debe estar entre 0 y 9999'
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
      const result = await onSubmit(formData)
      
      if (result.success) {
        onClose()
      } else {
        // Mostrar error general si existe
        if (result.error) {
          setErrors({ general: result.error })
        }
      }
    } catch (error) {
      setErrors({ general: 'Error inesperado al guardar' })
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            {title}
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
            <Textarea
              id="descripcion"
              value={formData.descripcion || ''}
              onChange={(e) => handleInputChange('descripcion', e.target.value)}
              placeholder="Descripción opcional de la categoría..."
              rows={3}
              maxLength={500}
              className={errors.descripcion ? 'border-red-300' : ''}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Opcional</span>
              <span>{(formData.descripcion?.length || 0)}/500</span>
            </div>
            {errors.descripcion && (
              <p className="text-sm text-red-600">{errors.descripcion}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-3">
              <Input
                id="color"
                type="color"
                value={formData.color || '#3B82F6'}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                value={formData.color || '#3B82F6'}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
            {errors.color && (
              <p className="text-sm text-red-600">{errors.color}</p>
            )}
          </div>

          {/* Icono */}
          <div className="space-y-2">
            <Label htmlFor="icono" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Icono
            </Label>
            <Input
              id="icono"
              value={formData.icono || 'tag'}
              onChange={(e) => handleInputChange('icono', e.target.value)}
              placeholder="tag, car, home, gift..."
            />
            <p className="text-xs text-muted-foreground">
              Nombre del icono de Lucide React (opcional)
            </p>
          </div>

          {/* Orden */}
          <div className="space-y-2">
            <Label htmlFor="orden">
              Orden de Visualización
            </Label>
            <Input
              id="orden"
              type="number"
              min="0"
              max="9999"
              value={formData.orden || 0}
              onChange={(e) => handleInputChange('orden', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-24"
            />
            <p className="text-xs text-muted-foreground">
              Número para ordenar las categorías (0 = primero)
            </p>
            {errors.orden && (
              <p className="text-sm text-red-600">{errors.orden}</p>
            )}
          </div>

          {/* Estado activo */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="activa">Categoría activa</Label>
              <p className="text-sm text-muted-foreground">
                Las categorías inactivas no se mostrarán en el frontend
              </p>
            </div>
            <Switch
              id="activa"
              checked={formData.activa ?? true}
              onCheckedChange={(checked) => handleInputChange('activa', checked)}
            />
          </div>

          {/* Vista previa */}
          <div className="p-4 bg-muted rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Vista previa</Label>
            <div className="flex items-center gap-2">
              <Badge 
                style={{ backgroundColor: formData.color || '#3B82F6' }}
                className="text-white border-0"
              >
                {formData.nombre || 'Nombre de la categoría'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formData.activa ? 'Activa' : 'Inactiva'}
              </span>
            </div>
          </div>

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
