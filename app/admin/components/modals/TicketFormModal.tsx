"use client"

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Loader2, Ticket, User, CreditCard, Mail, Phone, Calendar } from 'lucide-react'
import type { AdminTicket, CreateTicketData, UpdateTicketData } from '@/types'

// Esquema de validación para tickets
const TicketFormSchema = z.object({
  rifa_id: z.string().min(1, 'Debe seleccionar una rifa'),
  numero_ticket: z.string().min(1, 'El número de ticket es requerido').max(10, 'Máximo 10 caracteres'),
  precio: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  nombre: z.string().min(1, 'El nombre es requerido').max(255, 'Máximo 255 caracteres'),
  cedula: z.string().min(1, 'La cédula es requerida').max(20, 'Máximo 20 caracteres'),
  telefono: z.string().optional(),
  correo: z.string().email('Email inválido').max(255, 'Máximo 255 caracteres'),
  estado: z.enum(['reservado', 'pagado', 'verificado', 'cancelado']).default('reservado'),
  email: z.string().email('Email inválido').max(100, 'Máximo 100 caracteres').optional(),
})

type TicketFormValues = z.infer<typeof TicketFormSchema>

interface TicketFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateTicketData | UpdateTicketData) => Promise<{ success: boolean; error?: string }>
  ticket?: AdminTicket | null
  isSubmitting?: boolean
  mode?: 'create' | 'edit'
}

export function TicketFormModal({
  isOpen,
  onClose,
  onSubmit,
  ticket,
  isSubmitting = false,
  mode = 'create'
}: TicketFormModalProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const form = useForm<TicketFormValues>({
    resolver: zodResolver(TicketFormSchema),
    defaultValues: {
      rifa_id: '',
      numero_ticket: '',
      precio: 0,
      nombre: '',
      cedula: '',
      telefono: '',
      correo: '',
      estado: 'reservado',
      email: '',
    },
  })

  // Resetear formulario cuando cambie el ticket o se abra/cierre el modal
  useEffect(() => {
    if (isOpen) {
      if (ticket && mode === 'edit') {
        form.reset({
          rifa_id: ticket.rifa_id || '',
          numero_ticket: ticket.numero_ticket,
          precio: ticket.precio,
          nombre: ticket.nombre,
          cedula: ticket.cedula,
          telefono: ticket.telefono || '',
          correo: ticket.correo,
          estado: ticket.estado,
          email: ticket.email || '',
        })
      } else {
        form.reset({
          rifa_id: '',
          numero_ticket: '',
          precio: 0,
          nombre: '',
          cedula: '',
          telefono: '',
          correo: '',
          estado: 'reservado',
          email: '',
        })
      }
    }
  }, [isOpen, ticket, mode, form])

  const handleSubmit = async (data: TicketFormValues) => {
    try {
      setIsProcessing(true)
      const result = await onSubmit(data)
      
      if (result.success) {
        onClose()
        form.reset()
      }
    } catch (error) {
      console.error('Error en handleSubmit:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isLoading = isSubmitting || isProcessing

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            {mode === 'create' ? 'Crear Nuevo Ticket' : 'Editar Ticket'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Complete la información para crear un nuevo ticket'
              : 'Modifique la información del ticket'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Información del Ticket */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Información del Ticket
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="rifa_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rifa *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ID de la rifa"
                          {...field}
                          disabled={mode === 'edit'} // No permitir cambiar rifa en edición
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numero_ticket"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Ticket *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej: 001"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="precio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Precio *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="reservado">Reservado</SelectItem>
                          <SelectItem value="pagado">Pagado</SelectItem>
                          <SelectItem value="verificado">Verificado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Información Personal */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Información Personal
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre y apellidos"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cedula"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cédula *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número de identificación"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefono"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Número de teléfono"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="correo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Principal *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="correo@ejemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Secundario</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="email@ejemplo.com"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Email alternativo para notificaciones
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {mode === 'create' ? 'Creando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    {mode === 'create' ? 'Crear Ticket' : 'Guardar Cambios'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

