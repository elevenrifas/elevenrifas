"use client"

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  Ticket, 
  User, 
  CreditCard, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Trash2,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Lock,
  Unlock
} from 'lucide-react'
import type { AdminTicket } from '@/types'

interface TicketViewModalProps {
  isOpen: boolean
  onClose: () => void
  ticket: AdminTicket | null
  onEdit?: () => void
  onDelete?: () => void
}

export function TicketViewModal({
  isOpen,
  onClose,
  ticket,
  onEdit,
  onDelete
}: TicketViewModalProps) {
  if (!ticket) return null

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No especificada'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'pendiente': 'outline',
      'verificado': 'default',
      'rechazado': 'destructive'
    }
    
    const colors: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'verificado': 'bg-green-100 text-green-800 border-green-200',
      'rechazado': 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <Badge variant={variants[estado] || 'default'} className={colors[estado]}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    )
  }

  const getVerificacionBadge = (estado: string | null) => {
    if (!estado) return <Badge variant="outline">No especificado</Badge>
    
    const colors: Record<string, string> = {
      'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'verificado': 'bg-green-100 text-green-800 border-green-200',
      'rechazado': 'bg-red-100 text-red-800 border-red-200'
    }

    return (
      <Badge className={colors[estado]}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    )
  }

  const getBloqueoIcon = (bloqueado: boolean | null) => {
    if (bloqueado === null) return <Clock className="h-4 w-4 text-gray-400" />
    return bloqueado ? (
      <Lock className="h-4 w-4 text-red-500" />
    ) : (
      <Unlock className="h-4 w-4 text-green-500" />
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Ticket #{ticket.numero_ticket}
          </DialogTitle>
          <DialogDescription>
            Información detallada del ticket
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Ticket */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Información del Ticket
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Número de Ticket</label>
                <p className="text-lg font-semibold">{ticket.numero_ticket}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Precio</label>
                <p className="text-lg font-semibold text-green-600">
                  ${ticket.precio.toFixed(2)}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Estado del Pago</label>
                <div>{getEstadoBadge(ticket.pagos?.estado || 'pendiente')}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Rifa</label>
                <p className="text-sm">
                  {ticket.rifa?.titulo || 'No especificada'}
                </p>
              </div>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-lg font-semibold">{ticket.nombre}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Cédula</label>
                <p className="text-lg font-mono">{ticket.cedula}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-lg">
                  {ticket.telefono || 'No especificado'}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Correo Principal</label>
                <p className="text-lg">{ticket.correo}</p>
              </div>
              
              {ticket.email && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Email Secundario</label>
                  <p className="text-lg">{ticket.email}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de Verificación y Bloqueo */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Verificación y Estado
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Estado de Verificación</label>
                <div>{getVerificacionBadge(ticket.estado_verificacion)}</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Bloqueado por Pago</label>
                <div className="flex items-center gap-2">
                  {getBloqueoIcon(ticket.bloqueado_por_pago)}
                  <span className={ticket.bloqueado_por_pago ? 'text-red-600' : 'text-green-600'}>
                    {ticket.bloqueado_por_pago ? 'Bloqueado' : 'Desbloqueado'}
                  </span>
                </div>
              </div>
              
              {ticket.fecha_verificacion && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Fecha de Verificación</label>
                  <p className="text-sm">{formatDate(ticket.fecha_verificacion)}</p>
                </div>
              )}
              
              {ticket.fecha_bloqueo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Fecha de Bloqueo</label>
                  <p className="text-sm">{formatDate(ticket.fecha_bloqueo)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información de Fechas */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Fechas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Fecha de Compra</label>
                <p className="text-sm">{formatDate(ticket.fecha_compra)}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">ID del Ticket</label>
                <p className="text-xs font-mono text-gray-500 break-all">{ticket.id}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          {onEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={onEdit}
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Button>
          )}
          
          {onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={onDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Eliminar
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}






