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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  DollarSign, 
  Tag, 
  Car, 
  Star, 
  Settings, 
  Eye, 
  Edit, 
  Trash2,
  Play,
  Square,
  CheckCircle,
  Clock,
  Users,
  Ticket,
  Award
} from "lucide-react"
import { formatCurrency } from "@/lib/formatters"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"

interface RifaViewModalProps {
  isOpen: boolean
  onClose: () => void
  rifa: AdminRifa | null
  onEdit?: (rifa: AdminRifa) => void
  onDelete?: (rifa: AdminRifa) => void
}

export function RifaViewModal({
  isOpen,
  onClose,
  rifa,
  onEdit,
  onDelete
}: RifaViewModalProps) {
  if (!rifa) return null

  const getEstadoConfig = (estado: string) => {
    switch (estado) {
      case 'activa':
        return { variant: 'default', label: 'Activa', icon: Play, color: 'text-green-600' }
      case 'cerrada':
        return { variant: 'secondary', label: 'Cerrada', icon: Square, color: 'text-orange-600' }
      case 'pausada':
        return { variant: 'secondary', label: 'Pausada', icon: Square, color: 'text-yellow-600' }
      case 'finalizada':
        return { variant: 'outline', label: 'Finalizada', icon: CheckCircle, color: 'text-blue-600' }
      default:
        return { variant: 'secondary', label: estado, icon: Square, color: 'text-gray-600' }
    }
  }

  const estadoConfig = getEstadoConfig(rifa.estado)
  const Icon = estadoConfig.icon

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No especificada"
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressPercentage = () => {
    if (!rifa.total_tickets || rifa.total_tickets === 0) return 0
    const vendidos = rifa.total_tickets - rifa.tickets_disponibles
    return Math.round((vendidos / rifa.total_tickets) * 100)
  }

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Solo permitir cerrar si NO se está procesando
        onClose()
      }}
    >
      <DialogContent 
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        // Prevenir cierre con ESC
        onEscapeKeyDown={(e) => {
          // Permitir cierre con ESC para modales de solo lectura
        }}
        // Prevenir cierre con click fuera
        onPointerDownOutside={(e) => {
          // Permitir cierre con click fuera para modales de solo lectura
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Detalles de la Rifa
          </DialogTitle>
          <DialogDescription>
            Información completa de la rifa seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con información principal */}
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold">{rifa.titulo}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={estadoConfig.variant as any} className="flex items-center gap-1">
                    <Icon className="h-3 w-3" />
                    {estadoConfig.label}
                  </Badge>
                  {rifa.destacada && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      Destacada
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                {onEdit && (
                  <Button variant="outline" size="sm" onClick={() => onEdit(rifa)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                )}
                {onDelete && (
                  <Button variant="outline" size="sm" onClick={() => onDelete(rifa)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                )}
              </div>
            </div>

            {rifa.descripcion && (
              <p className="text-muted-foreground">{rifa.descripcion}</p>
            )}
          </div>

          <Separator />

          {/* Información de Tickets */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Ticket className="h-4 w-4" />
              Información de Tickets
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <DollarSign className="h-4 w-4" />
                  Precio por Ticket
                </div>
                <div className="text-2xl font-bold">{formatCurrency(rifa.precio_ticket)}</div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="h-4 w-4" />
                  Total Tickets
                </div>
                <div className="text-2xl font-bold">{rifa.total_tickets.toLocaleString()}</div>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Ticket className="h-4 w-4" />
                  Disponibles
                </div>
                <div className="text-2xl font-bold">{rifa.tickets_disponibles.toLocaleString()}</div>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tickets vendidos</span>
                <span>{getProgressPercentage()}%</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Información del Vehículo */}
          {(rifa.marca || rifa.modelo || rifa.ano || rifa.color || rifa.valor_estimado_usd) && (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Car className="h-4 w-4" />
                  Información del Vehículo
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rifa.marca && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Marca</div>
                      <div className="font-medium">{rifa.marca}</div>
                    </div>
                  )}

                  {rifa.modelo && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Modelo</div>
                      <div className="font-medium">{rifa.modelo}</div>
                    </div>
                  )}

                  {rifa.ano && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Año</div>
                      <div className="font-medium">{rifa.ano}</div>
                    </div>
                  )}

                  {rifa.color && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Color</div>
                      <div className="font-medium">{rifa.color}</div>
                    </div>
                  )}

                  {rifa.valor_estimado_usd && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Valor Estimado (USD)</div>
                      <div className="font-medium">{formatCurrency(rifa.valor_estimado_usd)}</div>
                    </div>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Información de Categorización */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tag className="h-4 w-4" />
              Categorización
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Categoría</div>
                <div className="font-medium capitalize">{rifa.categoria}</div>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Tipo de Rifa</div>
                <div className="font-medium capitalize">{rifa.tipo_rifa}</div>
              </div>

              {rifa.orden !== undefined && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Orden</div>
                  <div className="font-medium">{rifa.orden}</div>
                </div>
              )}

              {rifa.slug && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Slug</div>
                  <div className="font-medium font-mono text-sm">{rifa.slug}</div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Fechas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Fechas
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground">Fecha de Creación</div>
                <div className="font-medium">{formatDate(rifa.fecha_creacion)}</div>
              </div>

              {rifa.fecha_cierre && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Fecha de Cierre</div>
                  <div className="font-medium">{formatDate(rifa.fecha_cierre)}</div>
                </div>
              )}

              {rifa.fecha_culminacion && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground">Fecha de Culminación</div>
                  <div className="font-medium">{formatDate(rifa.fecha_culminacion)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Condiciones */}
          {rifa.condiciones && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Award className="h-4 w-4" />
                  Condiciones
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="text-sm whitespace-pre-wrap">{rifa.condiciones}</div>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

