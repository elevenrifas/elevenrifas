"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Ticket, 
  Gift, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'

// =====================================================
// 📊 MÉTRICAS PRINCIPALES - DASHBOARD ADMIN
// =====================================================
// Componente reutilizable para mostrar métricas clave
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

interface MetricsCardsProps {
  stats: DashboardStats
  ingresosBsPagoMovil?: number
  ingresosUsdOtros?: number
}

export function MetricsCards({ stats, ingresosBsPagoMovil = 0, ingresosUsdOtros = 0 }: MetricsCardsProps) {
  // Calcular porcentajes y tendencias
  const ticketsVendidos = stats.ticketsPagados + stats.ticketsVerificados
  const porcentajeVendidos = stats.totalTickets > 0 ? Math.round((ticketsVendidos / stats.totalTickets) * 100) : 0
  const porcentajeReservados = stats.totalTickets > 0 ? Math.round((stats.ticketsReservados / stats.totalTickets) * 100) : 0
  const porcentajeVerificados = stats.ingresosEstimados > 0 ? Math.round((stats.ingresosVerificados / stats.ingresosEstimados) * 100) : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Tickets Vendidos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tickets Vendidos</CardTitle>
          <Ticket className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">{ticketsVendidos}</div>
          <div className="mt-1 text-xs text-muted-foreground">Del total de {stats.totalTickets} tickets</div>
        </CardContent>
      </Card>

      {/* Tickets Reservados (card independiente, debajo del anterior en el flujo) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tickets Reservados</CardTitle>
          <Ticket className="h-4 w-4 text-amber-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-700">{stats.ticketsReservados}</div>
          <div className="mt-1 text-xs text-muted-foreground">Del total de {stats.totalTickets} tickets</div>
        </CardContent>
      </Card>

      {/* Ingresos en Bolívares */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Bolívares</CardTitle>
          <BarChart3 className="h-4 w-4 text-cyan-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-cyan-700">{formatCurrency(ingresosBsPagoMovil)}</div>
          <div className="mt-1 text-xs text-muted-foreground">Acumulado en bolívares</div>
        </CardContent>
      </Card>

      {/* Ingresos en Dólares */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ingresos Dólares</CardTitle>
          <DollarSign className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-700">${ingresosUsdOtros.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <div className="mt-1 text-xs text-muted-foreground">Acumulado en dólares</div>
        </CardContent>
      </Card>

      {/* Total Clientes - eliminado */}
    </div>
  )
}

