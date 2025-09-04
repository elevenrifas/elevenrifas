"use client"

import * as React from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { XCircle, AlertTriangle, User, Key, Shield, CheckCircle } from "lucide-react"
import type { AdminPago } from "@/lib/database/admin_database/pagos"
import { adminListUsuariosVerificacion, adminVerifyUsuarioPin } from "@/lib/database/admin_database/usuarios_verificacion"

// =====================================================
// 🎯 MODAL RECHAZO PAGO - ELEVEN RIFAS
// =====================================================
// Modal para rechazar pagos pendientes
// Sigue el mismo patrón que VerifyPagoModal con validación de usuario y PIN
// =====================================================

interface RejectPagoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (verificadoPor: string) => Promise<{ success: boolean; error?: string }>
  pago: AdminPago | null
  isSubmitting?: boolean
}

export function RejectPagoModal({
  isOpen,
  onClose,
  onConfirm,
  pago,
  isSubmitting = false
}: RejectPagoModalProps) {
  const [usuarioSeleccionado, setUsuarioSeleccionado] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [usuarios, setUsuarios] = React.useState<Array<{id: string, usuario: string, activo: boolean}>>([])
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState(false)
  const [isValidating, setIsValidating] = React.useState(false)

  // Cargar usuarios de verificación cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      loadUsuarios()
      setUsuarioSeleccionado("")
      setPin("")
      setError(null)
      setSuccess(false)
    }
  }, [isOpen])

  // Función para cargar usuarios de verificación
  const loadUsuarios = async () => {
    try {
      const result = await adminListUsuariosVerificacion({ incluirInactivos: false })
      if (result.success && result.data) {
        setUsuarios(result.data)
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error)
    }
  }

  // Función para validar usuario y PIN
  const validateUsuarioPin = async () => {
    if (!usuarioSeleccionado || !pin) {
      setError("Selecciona un usuario e ingresa el PIN")
      return false
    }

    if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      setError("El PIN debe ser de 4 dígitos numéricos")
      return false
    }

    try {
      setIsValidating(true)
      setError(null)
      
      const result = await adminVerifyUsuarioPin(usuarioSeleccionado, parseInt(pin))
      
      if (result.success && result.data) {
        return true
      } else {
        setError("Usuario o PIN incorrecto. Verifica tus credenciales.")
        return false
      }
    } catch (error) {
      setError("Error al validar credenciales")
      return false
    } finally {
      setIsValidating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validar usuario y PIN primero
    const isValid = await validateUsuarioPin()
    if (!isValid) {
      return
    }

    try {
      setError(null)
      const result = await onConfirm(usuarioSeleccionado)
      
      if (result.success) {
        // Mostrar mensaje de éxito
        setSuccess(true)
        setError(null)
        console.log('❌ Pago rechazado exitosamente')
        // Cerrar modal después de un breve delay para que se vea el mensaje
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setError(result.error || "Error al rechazar el pago")
        setSuccess(false)
      }
    } catch (err) {
      setError("Error inesperado al rechazar el pago")
    }
  }

  const handleClose = () => {
    if (!isSubmitting && !isValidating) {
      onClose()
    }
  }

  if (!pago) return null

  const tickets = pago.tickets || []
  const primerTicket = tickets[0]
  const rifa = primerTicket?.rifas

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            Rechazar Pago
          </DialogTitle>
          <DialogDescription>
            Rechaza el pago y elimina permanentemente todos los tickets asociados.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Información del pago */}
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm text-gray-700">Detalles del Pago</h4>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium">{primerTicket?.nombre || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Rifa:</span>
                <p className="font-medium">{rifa?.titulo || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Monto USD:</span>
                <p className="font-medium text-green-600">${pago.monto_usd.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-gray-500">Tickets:</span>
                <p className="font-medium">{tickets.length} ticket(s)</p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium capitalize">{pago.tipo_pago.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-gray-500">Referencia:</span>
                <p className="font-medium">{pago.referencia || 'Sin referencia'}</p>
              </div>
            </div>
          </div>

          {/* Campos del formulario */}
          <div className="space-y-4">
            {/* Selección de Usuario */}
            <div>
              <Label htmlFor="usuario" className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Usuario Verificador <span className="text-red-500">*</span>
              </Label>
              <Select
                value={usuarioSeleccionado}
                onValueChange={setUsuarioSeleccionado}
                disabled={isSubmitting || success}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecciona un usuario para rechazar" />
                </SelectTrigger>
                <SelectContent>
                  {usuarios.map((usuario) => (
                    <SelectItem key={usuario.id} value={usuario.usuario}>
                      <div className="flex items-center gap-2">
                        <Shield className={`h-4 w-4 ${usuario.activo ? 'text-green-600' : 'text-gray-400'}`} />
                        <span>{usuario.usuario}</span>
                        {!usuario.activo && (
                          <span className="text-xs text-gray-500">(Inactivo)</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {usuarios.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  No hay usuarios de verificación disponibles
                </p>
              )}
            </div>

            {/* Campo PIN */}
            <div>
              <Label htmlFor="pin" className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                PIN de Verificación <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pin"
                type="text"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="1234"
                disabled={isSubmitting || success}
                className="mt-1"
                maxLength={4}
                pattern="[0-9]*"
                inputMode="numeric"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ingresa el PIN de 4 dígitos del usuario seleccionado
              </p>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <Alert variant="destructive" className="border-destructive/20 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-destructive">
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-700">
                  Pago rechazado exitosamente
                </p>
              </div>
            </div>
          )}

          {/* Información de confirmación */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  Acción irreversible
                </p>
                <p className="text-xs text-amber-700">
                  Se eliminarán {tickets.length} ticket(s) permanentemente.
                </p>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting || success}
          >
            {success ? 'Cerrar' : 'Cancelar'}
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !usuarioSeleccionado || !pin || success || isValidating}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Rechazando...
              </>
            ) : isValidating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Validando...
              </>
            ) : (
              <>
                <XCircle className="mr-2 h-4 w-4" />
                Rechazar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
