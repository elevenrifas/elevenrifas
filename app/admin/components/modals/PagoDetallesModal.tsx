"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { 
  X, 
  CheckCircle, 
  Clock, 
  XCircle, 
  DollarSign,
  CreditCard,
  Smartphone,
  Globe,
  AlertTriangle,
  User,
  Ticket,
  Calendar,
  Phone,
  Mail,
  Building,
  FileText,
  Hash,
  CreditCard as CreditCardIcon
} from "lucide-react"
import type { AdminPago } from "@/lib/database/admin_database/pagos"

// =====================================================
// 🎯 MODAL DETALLES PAGO - ELEVEN RIFAS
// =====================================================
// Modal muy bien estilizado para mostrar todos los detalles
// de un pago, incluyendo tickets y rifa asociada
// =====================================================

interface PagoDetallesModalProps {
  isOpen: boolean
  onClose: () => void
  pago: AdminPago | null
}

// Función para obtener icono del tipo de pago
const getTipoPagoIcon = (tipo: string) => {
  switch (tipo) {
    case 'pago_movil':
      return <Smartphone className="h-5 w-5" />
    case 'binance':
      return <Globe className="h-5 w-5" />
    case 'zelle':
      return <DollarSign className="h-5 w-5" />
    case 'zinli':
      return <CreditCardIcon className="h-5 w-5" />
    case 'paypal':
      return <Globe className="h-5 w-5" />
    case 'efectivo':
      return <DollarSign className="h-5 w-5" />
    default:
      return <AlertTriangle className="h-5 w-5" />
  }
}

// Función para obtener variante del badge de estado
const getEstadoVariant = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return 'secondary'
    case 'verificado':
      return 'default'
    case 'rechazado':
      return 'destructive'
    default:
      return 'outline'
  }
}

// Función para obtener icono del estado
const getEstadoIcon = (estado: string) => {
  switch (estado) {
    case 'pendiente':
      return <Clock className="h-4 w-4" />
    case 'verificado':
      return <CheckCircle className="h-4 w-4" />
    case 'rechazado':
      return <XCircle className="h-4 w-4" />
    default:
      return <AlertTriangle className="h-4 w-4" />
  }
}

// Función para formatear fecha
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'No disponible'
  return new Date(dateString).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Función para formatear moneda
const formatCurrency = (amount: number, currency: 'USD' | 'BS' = 'USD') => {
  if (currency === 'USD') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
  return new Intl.NumberFormat('es-BO', {
    style: 'currency',
    currency: 'BOB'
  }).format(amount)
}

export function PagoDetallesModal({
  isOpen,
  onClose,
  pago
}: PagoDetallesModalProps) {
  if (!pago) return null

  // Obtener información de la rifa desde el primer ticket si existe
  const rifa = pago.tickets?.[0]?.rifas

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                 <DialogHeader className="pb-4">
           <DialogTitle className="text-2xl font-bold text-gray-900">
             Detalles del Pago
           </DialogTitle>
           <p className="text-sm text-gray-600">
             Información completa del pago
           </p>
         </DialogHeader>

        <div className="space-y-6">
          {/* Header del Pago */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getTipoPagoIcon(pago.tipo_pago)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 capitalize">
                    {pago.tipo_pago.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-gray-600">Tipo de Pago</p>
                </div>
              </div>
              <Badge variant={getEstadoVariant(pago.estado)} className="px-3 py-1 text-sm">
                {getEstadoIcon(pago.estado)}
                <span className="ml-2 capitalize">{pago.estado}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {formatCurrency(pago.monto_usd)}
                </div>
                <p className="text-sm text-gray-600">Monto USD</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(pago.monto_bs, 'BS')}
                </div>
                <p className="text-sm text-gray-600">Monto Bs</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {pago.tasa_cambio}
                </div>
                <p className="text-sm text-gray-600">Tasa de Cambio</p>
              </div>
            </div>

            {/* Resumen Cliente y Rifa */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/70 rounded-lg border border-blue-200">
                  <User className="h-5 w-5 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pago.tickets?.[0]?.nombre || 'Cliente no disponible'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {pago.tickets?.[0]?.cedula || 'Cédula no disponible'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {pago.tickets?.[0]?.telefono || 'Teléfono no disponible'}
                  </p>
                </div>
              </div>
              {/* Rifa */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/70 rounded-lg border border-blue-200">
                  <Ticket className="h-5 w-5 text-purple-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {pago.tickets?.[0]?.rifas?.titulo || 'Rifa no disponible'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {pago.tickets?.[0]?.rifas?.precio_ticket ? `Precio ticket: ${formatCurrency(pago.tickets?.[0]?.rifas?.precio_ticket)}` : ' '} 
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Información del Pago - Reorganizada en 2 columnas */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Información del Pago</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna Izquierda */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                  Detalles de Pago
                </h4>
                
                {pago.referencia && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.referencia}</p>
                      <p className="text-xs text-gray-500">Referencia</p>
                    </div>
                  </div>
                )}
                
                {pago.telefono_pago && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.telefono_pago}</p>
                      <p className="text-xs text-gray-500">Teléfono de Pago</p>
                    </div>
                  </div>
                )}
                
                {pago.banco_pago && (
                  <div className="flex items-center gap-3">
                    <Building className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.banco_pago}</p>
                      <p className="text-xs text-gray-500">Banco</p>
                    </div>
                  </div>
                )}
                
                {pago.cedula_pago && (
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.cedula_pago}</p>
                      <p className="text-xs text-gray-500">Cédula de Pago</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Columna Derecha */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2">
                  Fechas y Verificación
                </h4>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatDate(pago.fecha_pago)}
                    </p>
                    <p className="text-xs text-gray-500">Fecha de Pago</p>
                  </div>
                </div>
                
                {pago.fecha_verificacion && (
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(pago.fecha_verificacion)}
                      </p>
                      <p className="text-xs text-gray-500">Fecha de Verificación</p>
                    </div>
                  </div>
                )}
                
                {pago.fecha_visita && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(pago.fecha_visita).toLocaleDateString('es-ES')}
                      </p>
                      <p className="text-xs text-gray-500">Fecha de Visita</p>
                    </div>
                  </div>
                )}
                
                {pago.verificado_por && (
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.verificado_por}</p>
                      <p className="text-xs text-gray-500">Verificado Por</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sección de Tickets - Nueva sección */}
          {pago.tickets && pago.tickets.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tickets Asociados</h3>
                <Badge variant="outline" className="ml-auto">
                  {pago.tickets.length} ticket(s)
                </Badge>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {pago.tickets.map((ticket, index) => (
                    <div key={ticket.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-500">Ticket #{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ticket.numero_ticket}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Información del Cliente eliminada - consolidada en el encabezado */}
              </div>
            </div>
          )}

          {/* Información de la Rifa eliminada por solicitud */}

          {/* Notas */}
          {pago.notas && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <FileText className="h-5 w-5 text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notas</h3>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-sm text-gray-700">{pago.notas}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
