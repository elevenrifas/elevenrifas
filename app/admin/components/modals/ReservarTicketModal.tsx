"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Gift, Ticket } from "lucide-react"
import { adminCreateTicketReservado } from "@/lib/database/admin_database/tickets"
import { adminListRifas } from "@/lib/database/admin_database/rifas"
import { adminSupabase } from "@/lib/database"
import type { AdminRifa } from "@/types"

interface ReservarTicketModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface RifasData {
  rifas: AdminRifa[]
  isLoading: boolean
  error: string | null
}

export function ReservarTicketModal({
  isOpen,
  onClose,
  onSuccess
}: ReservarTicketModalProps) {
  const [rifasData, setRifasData] = useState<RifasData>({
    rifas: [],
    isLoading: true,
    error: null
  })
  const [formData, setFormData] = useState({
    rifa_id: '',
    numero_ticket: '',
    nombre: 'TICKET RESERVADO',
    cedula: '000000000',
    telefono: '000000000',
    correo: 'N/A',
    es_ticket_especial: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [isNumberValid, setIsNumberValid] = useState(true)

  // Cargar rifas al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadRifas()
    }
  }, [isOpen])

  const loadRifas = async () => {
    try {
      setRifasData(prev => ({ ...prev, isLoading: true, error: null }))
      
      const result = await adminListRifas({
        limite: 1000, // Cargar todas las rifas
        ordenarPor: 'fecha_creacion',
        orden: 'desc'
      })

      if (result.success && result.data) {
        setRifasData({
          rifas: result.data,
          isLoading: false,
          error: null
        })
      } else {
        setRifasData({
          rifas: [],
          isLoading: false,
          error: result.error || 'Error al cargar rifas'
        })
      }
    } catch (err) {
      setRifasData({
        rifas: [],
        isLoading: false,
        error: err instanceof Error ? err.message : 'Error inesperado'
      })
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
    
    // Si cambia la rifa y ya hay un número, validar
    if (field === 'rifa_id' && formData.numero_ticket.length === 4) {
      validateTicketNumber(formData.numero_ticket, value)
    }
  }

  const handleNumeroTicketChange = (value: string) => {
    setFormData(prev => ({ ...prev, numero_ticket: value }))
    setError(null)
    setIsNumberValid(true) // Reset validation state
    
    // Validar unicidad cuando se complete el número
    if (value.length === 4 && formData.rifa_id) {
      validateTicketNumber(value, formData.rifa_id)
    } else if (value.length < 4) {
      // Si no está completo, considerar como válido temporalmente
      setIsNumberValid(true)
    }
  }

  const validateTicketNumber = async (numero: string, rifaId: string) => {
    try {
      setIsValidating(true)
      setError(null)
      
      // Verificar si el número ya existe en la rifa
      const { data: existingTicket, error: checkError } = await adminSupabase
        .from('tickets')
        .select('id')
        .eq('rifa_id', rifaId)
        .eq('numero_ticket', numero)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingTicket) {
        setError(`El número ${numero} ya existe en esta rifa`)
        setIsNumberValid(false)
      } else {
        setIsNumberValid(true)
      }
    } catch (err) {
      console.error('Error validando número:', err)
      setError('Error al validar el número de ticket')
      setIsNumberValid(false)
    } finally {
      setIsValidating(false)
    }
  }

  const generateRandomNumber = async () => {
    const randomNum = Math.floor(Math.random() * 9000) + 1000 // 1000-9999
    const numeroFormateado = randomNum.toString().padStart(4, '0')
    setFormData(prev => ({ ...prev, numero_ticket: numeroFormateado }))
    
    // Validar si hay rifa seleccionada
    if (formData.rifa_id) {
      await validateTicketNumber(numeroFormateado, formData.rifa_id)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.rifa_id) {
      setError('Debe seleccionar una rifa')
      return
    }

    if (!formData.numero_ticket || formData.numero_ticket.length !== 4) {
      setError('El número de ticket debe tener 4 dígitos')
      return
    }

    if (!isNumberValid) {
      setError('El número de ticket no está disponible')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await adminCreateTicketReservado({
        rifa_id: formData.rifa_id,
        numero_ticket: formData.numero_ticket.padStart(4, '0'),
        nombre: formData.nombre,
        cedula: formData.cedula,
        telefono: formData.telefono || undefined,
        correo: formData.correo,
        es_ticket_especial: formData.es_ticket_especial
      })

      if (result.success) {
        onSuccess()
        onClose()
        // Reset form
        setFormData({
          rifa_id: '',
          numero_ticket: '',
          nombre: 'TICKET RESERVADO',
          cedula: '000000000',
          telefono: '000000000',
          correo: 'N/A',
          es_ticket_especial: true
        })
      } else {
        setError(result.error || 'Error al crear ticket reservado')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
      setError(null)
      setIsNumberValid(true)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-blue-600" />
            Reservar Ticket
          </DialogTitle>
          <DialogDescription>
            Reserva un ticket internamente para asignarlo como premio. El ticket se creará con datos por defecto y estado 'reservado'.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rifa_id">Rifa *</Label>
            <Select
              value={formData.rifa_id}
              onValueChange={(value) => handleInputChange('rifa_id', value)}
              disabled={rifasData.isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  rifasData.isLoading 
                    ? "Cargando rifas..." 
                    : "Selecciona una rifa"
                } />
              </SelectTrigger>
              <SelectContent>
                {rifasData.rifas.map((rifa) => (
                  <SelectItem key={rifa.id} value={rifa.id}>
                    {rifa.titulo} - {rifa.estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {rifasData.error && (
              <p className="text-sm text-red-600">{rifasData.error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="numero_ticket">Número de Ticket (4 dígitos) *</Label>
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <InputOTP
                  maxLength={4}
                  value={formData.numero_ticket}
                  onChange={handleNumeroTicketChange}
                  disabled={isSubmitting}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                  </InputOTPGroup>
                </InputOTP>
                {isValidating && (
                  <div className="absolute -right-8 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateRandomNumber}
                disabled={isSubmitting || isValidating}
              >
                {isValidating ? 'Validando...' : 'Generar Aleatorio'}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.rifa_id || !formData.numero_ticket || !isNumberValid || isValidating}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Reservando...
                </>
              ) : (
                <>
                  <Ticket className="mr-2 h-4 w-4" />
                  Reservar Ticket
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
