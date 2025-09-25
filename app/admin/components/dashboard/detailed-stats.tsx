"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle,
  Clock,
  XCircle,
  Ticket,
  Activity,
  BarChart3,
  Settings,
  Plus,
  Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'

// =====================================================
// 📊 ESTADÍSTICAS DETALLADAS - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar estadísticas detalladas y acciones rápidas
// Sigue el patrón de componentes del módulo admin
// =====================================================

interface DashboardStats {
  totalRifas: number
  rifasActivas: number
  rifasPausadas: number
  rifasFinalizadas: number
  totalTickets: number
  ticketsReservados: number
  ticketsPagados: number
  ticketsVerificados: number
  ticketsCancelados: number
  totalClientes: number
  ingresosEstimados: number
  ingresosVerificados: number
  sistemaActivo: boolean
}

interface DetailedStatsProps {
  stats: DashboardStats
  pagosPendientes?: number
  pagosVerificados?: number
  pagosRechazados?: number
  rifaId?: string
}

export function DetailedStats({ stats, pagosPendientes = 0, pagosVerificados = 0, pagosRechazados = 0, rifaId }: DetailedStatsProps) {
  return (
    <div className="grid gap-4">
      {/* Estado de Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Estado de Pago
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-3">
            <div className="flex items-center justify-between rounded-md border-l-4 border-green-200 bg-green-50 p-3">
            <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500/80" />
                <span className="text-sm text-muted-foreground">Verificados</span>
              </div>
              <span className="font-semibold text-green-700">{pagosVerificados}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border-l-4 border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500/80" />
                <span className="text-sm text-muted-foreground">Pendientes</span>
              </div>
              <span className="font-semibold text-amber-700">{pagosPendientes}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border-l-4 border-rose-200 bg-rose-50 p-3">
            <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500/80" />
                <span className="text-sm text-muted-foreground">Rechazados</span>
              </div>
              <span className="font-semibold text-rose-700">{pagosRechazados}</span>
            </div>
            
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

