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
  IdCard
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
      return <CreditCard className="h-5 w-5" />
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
  const date = new Date(dateString)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
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

            {/* Información de la Rifa */}
            <div className="mt-6">
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
          <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gray-100 rounded-lg">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Información del Pago</h3>
            </div>
            
            {/* Información del Cliente - Arriba */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
                Información del Cliente
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna Izquierda */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.tickets?.[0]?.nombre || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Nombre</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.tickets?.[0]?.telefono || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Teléfono</p>
                    </div>
                  </div>
                </div>
                
                {/* Columna Derecha */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Hash className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{pago.tickets?.[0]?.cedula || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Cédula</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 break-words break-all">{pago.tickets?.[0]?.correo || 'N/A'}</p>
                      <p className="text-xs text-gray-500">Correo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles del Pago - Sección separada */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide border-b border-gray-200 pb-2 mb-4">
                Detalles del Pago
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Columna Izquierda */}
                <div className="space-y-4">
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
                </div>
                
                {/* Columna Derecha */}
                <div className="space-y-4">
                  {pago.nombre_titular && (
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pago.nombre_titular}</p>
                        <p className="text-xs text-gray-500">Nombre del Titular</p>
                      </div>
                    </div>
                  )}
                  
                  {pago.cedula_pago && (
                    <div className="flex items-center gap-3">
                      <IdCard className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pago.cedula_pago}</p>
                        <p className="text-xs text-gray-500">Cédula de Pago</p>
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
          </div>

          {/* Comprobante */}
          {pago.comprobante_url && pago.comprobante_url.trim() !== '' && (
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Comprobante de Pago</h3>
              </div>
              <div
                className="h-40 bg-gray-100 rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:border-blue-500 transition-colors"
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
              <p className="text-xs text-gray-500 mt-2 text-center">
                Haz clic en la imagen para ver en tamaño completo
              </p>
            </div>
          )}

          {/* Sección de Tickets - Estilo mejorado como en RifaTicketsModal */}
          {pago.tickets && pago.tickets.length > 0 && (
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Ticket className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Tickets del Pago</h3>
                <Badge variant="outline" className="ml-auto">
                  {pago.tickets.length} ticket(s)
                </Badge>
              </div>
              
              
              {/* Grilla de tickets estilo RifaTicketsModal */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="mb-3">
                  <span className="text-sm text-gray-600">
                    Mostrando {pago.tickets.length} ticket(s) del pago
                  </span>
                </div>
                
                {/* Contenedor con scroll */}
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {pago.tickets.map((ticket) => {
                    // Detectar ticket especial por el campo dedicado o por nombre/cédula como fallback
                    const isEspecialCampo = ticket.es_ticket_especial === true
                    const isEspecialNombre = ticket.nombre === 'TICKET RESERVADO' && ticket.cedula === '000000000'
                    const isEspecial = isEspecialCampo || isEspecialNombre
                    const estadoPago = pago.estado
                    
                    // Debug: verificar datos del ticket
                    console.log('🎫 [PagoDetallesModal] Ticket completo:', ticket)
                    console.log('🎫 [PagoDetallesModal] Ticket específico:', {
                      numero: ticket.numero_ticket,
                      es_ticket_especial: ticket.es_ticket_especial,
                      tipo_es_ticket_especial: typeof ticket.es_ticket_especial,
                      nombre: ticket.nombre,
                      cedula: ticket.cedula,
                      isEspecial: isEspecial,
                      isEspecialCampo: isEspecialCampo,
                      isEspecialNombre: isEspecialNombre,
                      estadoPago: estadoPago
                    })
                    
                    // Determinar el estado visual del ticket
                    // PRIORIDAD: Especial siempre tiene prioridad sobre otros estados
                    let ticketState = 'disponible'
                    if (isEspecial) {
                      ticketState = 'especial'
                      console.log('🎫 [PagoDetallesModal] Ticket especial detectado:', ticket.numero_ticket, 'Estado asignado: especial')
                    } else if (estadoPago === 'verificado') {
                      ticketState = 'verificado'
                      console.log('🎫 [PagoDetallesModal] Ticket verificado:', ticket.numero_ticket, 'Estado asignado: verificado')
                    } else if (estadoPago === 'pendiente') {
                      ticketState = 'reservado'
                      console.log('🎫 [PagoDetallesModal] Ticket pendiente:', ticket.numero_ticket, 'Estado asignado: reservado')
                    }
                    
                    console.log('🎫 [PagoDetallesModal] Estado final del ticket:', {
                      numero: ticket.numero_ticket,
                      ticketState: ticketState,
                      es_ticket_especial: ticket.es_ticket_especial,
                      isEspecial: isEspecial
                    })
                    
                    // Colores según el estado (igual que RifaTicketsModal)
                    const getTicketColor = (state: string) => {
                      console.log('🎨 [PagoDetallesModal] Aplicando color para estado:', state, 'ticket:', ticket.numero_ticket)
                      switch (state) {
                        case 'disponible':
                          return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                        case 'reservado':
                          return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
                        case 'verificado':
                          return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
                        case 'especial':
                          return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
                        default:
                          return 'bg-gray-50 text-gray-600 border-gray-200'
                      }
                    }
                    
                    return (
                      <div
                        key={ticket.id}
                        className={`border-2 rounded text-xs font-mono text-center p-2 transition-colors cursor-pointer ${getTicketColor(ticketState)}`}
                        title={`Ticket #${ticket.numero_ticket} - ${ticketState}${isEspecial ? ' (ESPECIAL)' : ''}`}
                      >
                        {ticket.numero_ticket}
                      </div>
                    )
                  })}
                  </div>
                </div>
                
                {/* Leyenda de estados */}
                <div className="mt-4 flex flex-wrap gap-4 text-xs justify-center">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 bg-yellow-50 border-yellow-200"></div>
                    <span>Reservado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 bg-green-50 border-green-200"></div>
                    <span>Verificado</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded border-2 bg-purple-50 border-purple-200"></div>
                    <span>Especial</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Información de la Rifa eliminada por solicitud */}

          {/* Motivo del Rechazo (sección separada) */}
          {String(pago.estado).toLowerCase() === 'rechazado' && pago.rechazo_note && (
            <div className="bg-gray-50 rounded-lg border border-red-300 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-800">Motivo del rechazo</h3>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm text-red-800 whitespace-pre-wrap">{pago.rechazo_note}</p>
              </div>
            </div>
          )}

          {/* Notas */}
          {pago.notas && (
            <div className="bg-gray-50 rounded-lg border border-gray-300 p-6">
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
