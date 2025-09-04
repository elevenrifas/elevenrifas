"use client"

import * as React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { User, Key, Shield } from "lucide-react"
import { showCreateSuccessToast, showUpdateSuccessToast, showCreateErrorToast, showUpdateErrorToast } from "@/components/ui/toast-notifications"
import type { AdminUsuarioVerificacion } from "@/lib/database/admin_database/usuarios_verificacion"

// =====================================================
// 🎯 MODAL FORMULARIO USUARIO VERIFICACION - ELEVEN RIFAS
// =====================================================
// Modal para crear y editar usuarios de verificación
// Sigue el patrón establecido en otros modales del proyecto
// =====================================================

interface UsuarioVerificacionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>
  usuario?: AdminUsuarioVerificacion | null
  isSubmitting?: boolean
}

export function UsuarioVerificacionFormModal({
  isOpen,
  onClose,
  onSubmit,
  usuario,
  isSubmitting = false
}: UsuarioVerificacionFormModalProps) {
  const isEditing = !!usuario

  // Estados del formulario
  const [formData, setFormData] = useState({
    usuario: usuario?.usuario || '',
    pin: '', // Siempre empezar con PIN vacío
    activo: usuario?.activo ?? true
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmittingLocal, setIsSubmittingLocal] = useState(false)

  // Reiniciar formulario cuando cambie el usuario o se abra/cierre el modal
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        usuario: usuario?.usuario || '',
        pin: '', // Siempre mantener PIN vacío para edición
        activo: usuario?.activo ?? true
      })
      setErrors({})
    }
  }, [isOpen, usuario])

  // Función para validar el formulario
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Validar usuario
    if (!formData.usuario.trim()) {
      newErrors.usuario = 'El nombre de usuario es requerido'
    } else if (formData.usuario.length > 20) {
      newErrors.usuario = 'El nombre de usuario no puede exceder 20 caracteres'
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.usuario)) {
      newErrors.usuario = 'El usuario solo puede contener letras, números y guiones bajos'
    }

    // Validar PIN
    if (isEditing) {
      // Al editar, el PIN es opcional
      if (formData.pin && formData.pin !== '') {
        const pinNum = parseInt(formData.pin.toString())
        if (isNaN(pinNum) || pinNum < 1000 || pinNum > 9999) {
          newErrors.pin = 'El PIN debe ser un número de 4 dígitos (1000-9999)'
        }
      }
    } else {
      // Al crear, el PIN es requerido
      if (!formData.pin) {
        newErrors.pin = 'El PIN es requerido'
      } else {
        const pinNum = parseInt(formData.pin.toString())
        if (isNaN(pinNum) || pinNum < 1000 || pinNum > 9999) {
          newErrors.pin = 'El PIN debe ser un número de 4 dígitos (1000-9999)'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmittingLocal(true)

      const submitData: any = {
        usuario: formData.usuario.trim().toLowerCase(),
        activo: formData.activo
      }

      // Solo incluir PIN si se proporciona uno nuevo
      if (formData.pin && formData.pin !== '') {
        submitData.pin = parseInt(formData.pin.toString())
      }

      const result = await onSubmit(submitData)

      if (result.success) {
        // Mostrar toast de éxito y cerrar modal
        if (isEditing) {
          showUpdateSuccessToast('usuario')
        } else {
          showCreateSuccessToast('usuario')
        }
        onClose()
        // Reset form
        setFormData({
          usuario: '',
          pin: '',
          activo: true
        })
      } else {
        // Mostrar error del servidor
        const errorMessage = result.error || 'Error al guardar el usuario'
        if (isEditing) {
          showUpdateErrorToast('usuario', errorMessage)
        } else {
          showCreateErrorToast('usuario', errorMessage)
        }
        setErrors({ submit: errorMessage })
      }
    } catch (error) {
      const errorMessage = 'Error inesperado al guardar el usuario'
      if (isEditing) {
        showUpdateErrorToast('usuario', errorMessage)
      } else {
        showCreateErrorToast('usuario', errorMessage)
      }
      setErrors({ submit: errorMessage })
    } finally {
      setIsSubmittingLocal(false)
    }
  }

  // Función para manejar cambios en los inputs
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const isSubmittingState = isSubmitting || isSubmittingLocal

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Solo permitir cerrar si NO se está enviando
        if (!isSubmittingState) {
          onClose()
        }
      }}
    >
      <DialogContent 
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        // Prevenir cierre con ESC durante envío
        onEscapeKeyDown={(e) => {
          if (isSubmittingState) {
            e.preventDefault()
          }
        }}
        // Prevenir cierre con click fuera durante envío
        onPointerDownOutside={(e) => {
          if (isSubmittingState) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            {isSubmittingState ? (
              isEditing ? 'Actualizando Usuario...' : 'Creando Usuario...'
            ) : (
              isEditing ? 'Editar Usuario de Verificación' : 'Crear Usuario de Verificación'
            )}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nombre de Usuario
            </Label>
            <Input
              id="usuario"
              type="text"
              placeholder="Ej: admin, operador1"
              value={formData.usuario}
              onChange={(e) => handleInputChange('usuario', e.target.value)}
              disabled={isSubmittingState}
              className={errors.usuario ? 'border-red-500' : ''}
              maxLength={20}
            />
            {errors.usuario && (
              <p className="text-sm text-red-600">{errors.usuario}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Solo letras, números y guiones bajos. Máximo 20 caracteres.
            </p>
          </div>

          {/* Campo PIN */}
          <div className="space-y-2">
            <Label htmlFor="pin" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              PIN de Acceso
            </Label>
            <Input
              id="pin"
              type="text"
              placeholder={isEditing ? "Nuevo PIN (opcional)" : "1234"}
              value={formData.pin}
              onChange={(e) => handleInputChange('pin', e.target.value)}
              disabled={isSubmittingState}
              className={errors.pin ? 'border-red-500' : ''}
              maxLength={4}
              pattern="[0-9]*"
              inputMode="numeric"
            />
            {errors.pin && (
              <p className="text-sm text-red-600">{errors.pin}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {isEditing 
                ? 'Deja vacío para mantener el PIN actual. Solo se actualiza si ingresas un nuevo PIN.'
                : 'Número de 4 dígitos que el usuario usará para acceder.'
              }
            </p>
            {isEditing && (
              <div className="p-2 bg-gray-50 border border-gray-200 rounded text-xs text-muted-foreground">
                🔒 PIN actual: •••• (oculto por seguridad)
              </div>
            )}
          </div>

          {/* Campo Estado Activo */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Estado del Usuario
            </Label>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="font-medium">
                  {formData.activo ? 'Usuario Activo' : 'Usuario Inactivo'}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formData.activo 
                    ? 'El usuario puede verificar pagos'
                    : 'El usuario no puede verificar pagos'
                  }
                </div>
              </div>
              <Switch
                checked={formData.activo}
                onCheckedChange={(checked) => handleInputChange('activo', checked)}
                disabled={isSubmittingState}
              />
            </div>
          </div>

          {/* Error de envío */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Botones */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmittingState}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmittingState}
            >
              {isSubmittingState ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  {isEditing ? 'Actualizar Usuario' : 'Crear Usuario'}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
