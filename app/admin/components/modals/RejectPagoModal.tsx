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
import { XCircle, AlertTriangle, User, Key, Shield, CheckCircle, Search, CheckCircle2 } from "lucide-react"
import type { AdminPago } from "@/lib/database/admin_database/pagos"
import { adminListUsuariosVerificacion, adminVerifyUsuarioPin } from "@/lib/database/admin_database/usuarios_verificacion"
import { adminValidateReferenciaDuplicada } from "@/lib/database/admin_database/pagos"

// =====================================================
// 🎯 MODAL RECHAZO PAGO - ELEVEN RIFAS
// =====================================================
// Modal para rechazar pagos pendientes
// Sigue el mismo patrón que VerifyPagoModal con validación de usuario y PIN
// =====================================================

interface RejectPagoModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (verificadoPor: string, rechazoNote: string) => Promise<{ success: boolean; error?: string }>
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
  const [rechazoNote, setRechazoNote] = React.useState("")
  
  // Estados para validación de referencia
  const [referencia, setReferencia] = React.useState("")
  const [isValidatingReferencia, setIsValidatingReferencia] = React.useState(false)
  const [referenciaValidada, setReferenciaValidada] = React.useState(false)
  const [referenciaError, setReferenciaError] = React.useState<string | null>(null)
  const [referenciaDuplicada, setReferenciaDuplicada] = React.useState(false)

  // Cargar usuarios de verificación cuando se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      loadUsuarios()
      setUsuarioSeleccionado("")
      setPin("")
      setRechazoNote("")
      setError(null)
      setSuccess(false)
      // Resetear estados de validación de referencia
      setReferencia("")
      setReferenciaValidada(false)
      setReferenciaError(null)
      setReferenciaDuplicada(false)
    }
  }, [isOpen, pago])

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

  // Función para validar referencia duplicada
  const validateReferencia = async () => {
    if (!referencia.trim()) {
      setReferenciaError("La referencia es requerida")
      return
    }

    if (!pago) {
      setReferenciaError("No hay información del pago")
      return
    }

    // Verificar que la referencia coincida exactamente con la del pago
    if (referencia.trim() !== pago.referencia) {
      setReferenciaError("La referencia debe coincidir exactamente con la referencia del pago")
      setReferenciaDuplicada(false)
      setReferenciaValidada(false)
      return
    }

    try {
      setIsValidatingReferencia(true)
      setReferenciaError(null)
      setReferenciaDuplicada(false)

      const primerTicket = pago.tickets?.[0]
      const rifaId = primerTicket?.rifa_id

      if (!rifaId) {
        setReferenciaError("No se pudo obtener la información de la rifa")
        return
      }

      const result = await adminValidateReferenciaDuplicada(
        referencia.trim(),
        pago.tipo_pago,
        rifaId,
        pago.id
      )

      if (result.success && result.data) {
        if (result.data.esDuplicada) {
          setReferenciaDuplicada(true)
          setReferenciaValidada(false)
          setReferenciaError(`Ya existe un pago con la referencia "${referencia}" para el mismo tipo de pago y rifa`)
        } else {
          setReferenciaDuplicada(false)
          setReferenciaValidada(true)
          setReferenciaError(null)
        }
      } else {
        setReferenciaError("Error al validar la referencia")
      }
    } catch (error) {
      console.error('Error al validar referencia:', error)
      setReferenciaError("Error inesperado al validar la referencia")
    } finally {
      setIsValidatingReferencia(false)
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
    
    // Validar que la referencia esté validada primero
    if (!referenciaValidada) {
      setError("Debes validar la referencia antes de continuar")
      return
    }

    if (!rechazoNote.trim()) {
      setError("Debes ingresar una razón de rechazo")
      return
    }

    // Validar usuario y PIN
    const isValid = await validateUsuarioPin()
    if (!isValid) {
      return
    }

    try {
      setError(null)
      const result = await onConfirm(usuarioSeleccionado, rechazoNote.trim())
      
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
              {pago.comprobante_url && pago.comprobante_url.trim() !== '' && (
                <div className="col-span-2">
                  <span className="text-gray-500">Comprobante:</span>
                  <div
                    className="mt-2 h-20 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-red-500 transition-colors"
                    onClick={() => pago.comprobante_url && window.open(pago.comprobante_url, '_blank')}
                  >
                    <img
                      src={pago.comprobante_url}
                      alt="Comprobante de pago"
                      className="w-full h-full object-cover"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onError={() => {
                        console.log('Error cargando imagen:', pago.comprobante_url)
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          
          

          {/* Campos del formulario */}
          <div className="space-y-4">
            {/* Nota de Rechazo */}
            <div>
              <Label htmlFor="rechazoNote" className="text-sm font-medium flex items-center gap-2">
                Motivo del Rechazo <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="rechazoNote"
                value={rechazoNote}
                onChange={(e) => setRechazoNote(e.target.value)}
                placeholder="Describe brevemente la razón del rechazo"
                className="mt-1 w-full min-h-[72px] rounded-md border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50 p-2 text-sm"
                maxLength={500}
                disabled={isSubmitting || success}
              />
              <p className="text-xs text-muted-foreground mt-1">Máx. 500 caracteres</p>
            </div>
            {/* Validación de Referencia */}
            <div>
              <Label htmlFor="referencia" className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4" />
                Referencia del Pago <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="referencia"
                  type="text"
                  value={referencia}
                  onChange={(e) => {
                    setReferencia(e.target.value)
                    setReferenciaValidada(false)
                    setReferenciaError(null)
                    setReferenciaDuplicada(false)
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    setReferenciaError("No se permite pegar texto en este campo")
                  }}
                  placeholder="Escribe la referencia aquí"
                      disabled={isSubmitting || success || isValidatingReferencia || referenciaValidada}
                  className="flex-1 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                />
                <Button
                  type="button"
                  onClick={validateReferencia}
                  disabled={!referencia.trim() || isSubmitting || success || isValidatingReferencia || referenciaValidada}
                  variant="default"
                  size="sm"
                  className={`px-4 py-1.5 h-9 text-white shadow-sm flex items-center justify-center ${
                    referenciaValidada 
                      ? 'bg-green-600 hover:bg-green-700 border-green-600 hover:border-green-700' 
                      : 'bg-red-600 hover:bg-red-700 border-red-600 hover:border-red-700'
                  }`}
                >
                  {isValidatingReferencia ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : referenciaValidada ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Estado de validación de referencia */}
              {referenciaValidada && (
                <div className="flex items-center gap-2 mt-2 text-green-700 text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Referencia válida - No hay duplicados</span>
                </div>
              )}
              
              {referenciaDuplicada && (
                <div className="flex items-center gap-2 mt-2 text-red-700 text-sm">
                  <XCircle className="h-4 w-4" />
                  <span>Referencia duplicada - Ya existe un pago con esta referencia</span>
                </div>
              )}
              
              {referenciaError && (
                <div className="flex items-center gap-2 mt-2 text-red-700 text-sm">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{referenciaError}</span>
                </div>
              )}
            </div>

            {/* Usuario y PIN lado a lado */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <SelectTrigger className="mt-1 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50">
                    <SelectValue placeholder="Selecciona un usuario" />
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
                    No hay usuarios disponibles
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
                  className="mt-1 border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-gray-50"
                  maxLength={4}
                  pattern="[0-9]*"
                  inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  PIN de 4 dígitos
                </p>
              </div>
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
            disabled={isSubmitting || !usuarioSeleccionado || !pin || success || isValidating || !referenciaValidada}
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
