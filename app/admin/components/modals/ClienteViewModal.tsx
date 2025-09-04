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
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Eye, 
  Ticket, 
  Gift,
  CreditCard,
  Clock,
  TrendingUp
} from 'lucide-react'
import type { AdminCliente } from '@/types'

interface ClienteViewModalProps {
  isOpen: boolean
  onClose: () => void
  cliente: AdminCliente | null
}

export function ClienteViewModal({
  isOpen,
  onClose,
  cliente
}: ClienteViewModalProps) {
  if (!cliente) return null

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

  const formatDateShort = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Datos del Cliente
          </DialogTitle>
          <DialogDescription>
            Historial de compras y estadísticas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Datos del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Datos del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-lg font-semibold">{cliente.nombre}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Cédula</label>
                <p className="text-lg font-mono">{cliente.cedula}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-lg flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {cliente.telefono || 'No especificado'}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-500">Correo</label>
                <p className="text-lg flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {cliente.correo}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Estadísticas del Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Estadísticas del Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Ticket className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{cliente.total_tickets}</div>
                <div className="text-sm text-blue-600">Total Tickets</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Gift className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{cliente.total_rifas}</div>
                <div className="text-sm text-purple-600">Rifas Diferentes</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-sm font-medium text-green-600">Primer Compra</div>
                <div className="text-sm text-green-600">{formatDateShort(cliente.primer_compra)}</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-sm font-medium text-orange-600">Última Compra</div>
                <div className="text-sm text-orange-600">{formatDateShort(cliente.ultima_compra)}</div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Rifas Compradas */}
          {cliente.rifas_detalle && cliente.rifas_detalle.length > 0 && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Rifas Compradas ({cliente.total_rifas})
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cliente.rifas_detalle.map((rifa) => (
                    <div key={rifa.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{rifa.titulo}</h4>
                        <Badge variant="outline" className="text-xs">
                          {rifa.estado}
                        </Badge>
                      </div>
                      {rifa.imagen_url && (
                        <div className="w-full h-24 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={rifa.imagen_url} 
                            alt={rifa.titulo}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
            </>
          )}

          {/* Historial de Tickets */}
          {cliente.tickets && cliente.tickets.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Ticket className="h-4 w-4" />
                Historial de Tickets ({cliente.total_tickets})
              </h3>
              
              <div className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {cliente.tickets.map((ticket) => (
                    <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Ticket className="h-4 w-4 text-blue-600" />
                        <span className="font-mono text-sm">#{ticket.numero_ticket}</span>
                        <span className="text-sm text-gray-600">
                          {formatDateShort(ticket.fecha_compra)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {ticket.pago_id ? (
                          <Badge variant="default" className="text-xs">
                            <CreditCard className="h-3 w-3 mr-1" />
                            Con Pago
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Sin Pago
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
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
