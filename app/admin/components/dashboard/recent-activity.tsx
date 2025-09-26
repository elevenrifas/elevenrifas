"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Ticket,
  Gift,
  Users,
  DollarSign
} from 'lucide-react'
import { getVenezuelaDateClient } from '@/lib/utils/venezuela-date-client'

// =====================================================
// 📊 ACTIVIDAD RECIENTE - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar actividad reciente del sistema
// Sigue el patrón de componentes del módulo admin
// =====================================================

interface ActivityItem {
  id: string
  type: 'rifa_created' | 'ticket_sold' | 'payment_verified' | 'payment_rejected' | 'rifa_updated'
  title: string
  description: string
  timestamp: Date
  status: 'success' | 'warning' | 'error' | 'info'
}

interface RecentActivityProps {
  activities?: ActivityItem[]
}

// Datos de ejemplo para demostración
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'ticket_sold',
    title: 'Nuevo ticket vendido',
    description: 'Ticket #1234 vendido para la rifa "Auto 0km"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutos atrás
    status: 'success'
  },
  {
    id: '2',
    type: 'payment_verified',
    title: 'Pago verificado',
    description: 'Pago de $50 USD verificado por María González',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutos atrás
    status: 'success'
  },
  {
    id: '3',
    type: 'rifa_created',
    title: 'Nueva rifa creada',
    description: 'Rifa "Moto Honda" creada y activada',
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutos atrás
    status: 'info'
  },
  {
    id: '4',
    type: 'payment_rejected',
    title: 'Pago rechazado',
    description: 'Pago de $25 USD rechazado - comprobante inválido',
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutos atrás
    status: 'error'
  },
  {
    id: '5',
    type: 'rifa_updated',
    title: 'Rifa actualizada',
    description: 'Rifa "Casa en la playa" pausada temporalmente',
    timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hora atrás
    status: 'warning'
  }
]

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'rifa_created':
      return <Gift className="h-4 w-4" />
    case 'ticket_sold':
      return <Ticket className="h-4 w-4" />
    case 'payment_verified':
      return <CheckCircle className="h-4 w-4" />
    case 'payment_rejected':
      return <XCircle className="h-4 w-4" />
    case 'rifa_updated':
      return <Activity className="h-4 w-4" />
    default:
      return <Activity className="h-4 w-4" />
  }
}

const getStatusColor = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-600 bg-green-50'
    case 'warning':
      return 'text-yellow-600 bg-yellow-50'
    case 'error':
      return 'text-red-600 bg-red-50'
    case 'info':
      return 'text-blue-600 bg-blue-50'
    default:
      return 'text-gray-600 bg-gray-50'
  }
}

const getStatusBadge = (status: ActivityItem['status']) => {
  switch (status) {
    case 'success':
      return <Badge variant="default" className="bg-green-100 text-green-800">Completado</Badge>
    case 'warning':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Advertencia</Badge>
    case 'error':
      return <Badge variant="destructive">Error</Badge>
    case 'info':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800">Información</Badge>
    default:
      return <Badge variant="outline">Desconocido</Badge>
  }
}

export function RecentActivity({ activities = mockActivities }: RecentActivityProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <CardDescription>
          Últimas actividades del sistema de rifas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
              <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{activity.title}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(activity.status)}
                    <span className="text-xs text-muted-foreground">
                      {getVenezuelaDateClient(activity.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {activity.description}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {getVenezuelaDateClient(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}





