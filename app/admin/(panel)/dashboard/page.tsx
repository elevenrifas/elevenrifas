"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  RefreshCw
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { adminListRifas, type AdminRifa } from '@/lib/database/admin_database/rifas'
import { useAdminAuthState } from '@/lib/context/AdminAuthContextSimpleStorage'
import { useLogger } from '@/hooks/use-logger'
import { adminGetDashboardStats } from '@/lib/database/admin_database/dashboard'
import { getAllChartData } from '@/lib/database/admin_database/dashboard-charts'
import { formatCurrency } from '@/lib/formatters'
import { getVenezuelaDateClient } from '@/lib/utils/venezuela-date-client'
import { MetricsCards, DetailedStats, AnalysisCharts, RecentActivity, RevenueChart, RevenueMetrics, RevenueByRifa } from '@/app/admin/components/dashboard'
import { obtenerEstadisticasPagos } from '@/lib/database/pagos'

// =====================================================
// 📊 DASHBOARD ADMIN - ELEVEN RIFAS
// =====================================================
// Dashboard principal del panel de administración
// Sigue los patrones establecidos del módulo admin
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

interface ChartData {
  revenue: Array<{ date: string; revenue: number; tickets: number }>
  tickets: Array<{ rifa: string; vendidos: number; disponibles: number; total: number }>
  status: Array<{ name: string; value: number; color: string }>
}

export default function AdminDashboardPage() {
  // Sistema de logging siguiendo el patrón establecido
  const logger = useLogger({
    context: 'DASHBOARD',
    componentName: 'AdminDashboard',
    enableDebug: true,
    logUserActions: true,
    logPerformance: true
  })

  // Estados siguiendo el patrón de otras páginas admin
  const [stats, setStats] = useState<DashboardStats>({
    totalRifas: 0,
    rifasActivas: 0,
    rifasPausadas: 0,
    rifasFinalizadas: 0,
    totalTickets: 0,
    ticketsReservados: 0,
    ticketsPagados: 0,
    ticketsVerificados: 0,
    ticketsCancelados: 0,
    totalClientes: 0,
    ingresosEstimados: 0,
    ingresosVerificados: 0,
    sistemaActivo: false
  })

  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [ingresosBsPagoMovil, setIngresosBsPagoMovil] = useState<number>(0)
  const [ingresosUsdOtros, setIngresosUsdOtros] = useState<number>(0)
  const [pagosPendientes, setPagosPendientes] = useState<number>(0)
  const [pagosVerificados, setPagosVerificados] = useState<number>(0)
  const [pagosRechazados, setPagosRechazados] = useState<number>(0)
  const [rifas, setRifas] = useState<AdminRifa[]>([])
  const [rifaId, setRifaId] = useState<string | 'general'>('general')

  // Efecto para recargar datos cuando cambie la rifa
  useEffect(() => {
    if (rifaId) {
      loadDashboardData()
    }
  }, [rifaId])

  const { user, profile, isLoading: authLoading, isAdmin } = useAdminAuthState()

  // Función para cargar datos del dashboard siguiendo el patrón establecido
  const loadDashboardData = async () => {
    if (isRefreshing) {
      logger.logDebug('Ya hay una carga en progreso, saltando...')
      return
    }

    try {
      setIsRefreshing(true)
      setIsLoading(true)
      setError(null)
      
      logger.logInfo('Iniciando carga de datos del dashboard')
      
      // Cargar estadísticas y gráficas en paralelo siguiendo el patrón
      const [statsResult, chartsResult, rifasResult] = await Promise.all([
        adminGetDashboardStats(),
        getAllChartData(),
        adminListRifas({ incluirCerradas: true })
      ])
      
      if (!statsResult.success) {
        logger.logError('Error al cargar estadísticas del dashboard', undefined, { 
          error: statsResult.error 
        })
        throw new Error(statsResult.error || 'Error desconocido al cargar dashboard')
      }
      
      if (!statsResult.data) {
        throw new Error('No se obtuvieron datos del dashboard')
      }
      
      logger.logInfo('Estadísticas del dashboard cargadas exitosamente', { 
        stats: statsResult.data 
      })
      
      setStats(statsResult.data)
      if (rifasResult.success && rifasResult.data) {
        setRifas(rifasResult.data)
      }
      
      // Cargar datos de gráficas si están disponibles
      if (chartsResult?.success && chartsResult?.data) {
        logger.logInfo('Datos de gráficas cargados exitosamente')
        setChartData(chartsResult.data)
      } else {
        logger.logWarning('No se pudieron cargar los datos de gráficas', { 
          error: chartsResult?.error 
        })
        setChartData({ revenue: [], tickets: [], status: [] })
      }

      // Calcular ingresos por tipo de pago (pago móvil en Bs y otros en USD)
      try {
        const estadisticas = await obtenerEstadisticasPagos(rifaId === 'general' ? undefined : rifaId)
        const porTipo = (estadisticas as any)?.porTipo || {}
        const porEstado = (estadisticas as any)?.porEstado || {}
        const bsPagoMovil = porTipo['pago_movil']?.total_bs || 0
        const usdOtros = Object.entries(porTipo)
          .filter(([tipo]) => tipo !== 'pago_movil')
          .reduce((sum, [, v]: any) => sum + (v?.total_usd || 0), 0)
        setIngresosBsPagoMovil(bsPagoMovil)
        setIngresosUsdOtros(usdOtros)

        // Estados de pagos
        setPagosPendientes(porEstado?.pendiente?.cantidad || 0)
        setPagosVerificados(porEstado?.verificado?.cantidad || 0)
        setPagosRechazados(porEstado?.rechazado?.cantidad || 0)
      } catch (e) {
        logger.logWarning('No se pudieron calcular ingresos por tipo de pago', { error: (e as Error)?.message })
        setIngresosBsPagoMovil(0)
        setIngresosUsdOtros(0)
        setPagosPendientes(0)
        setPagosVerificados(0)
        setPagosRechazados(0)
      }
      
      setLastUpdated(new Date())
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      logger.logError('Error crítico al cargar dashboard', error instanceof Error ? error : undefined, { 
        error: errorMessage
      })
      setError(errorMessage)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
      logger.logInfo('Carga del dashboard completada')
    }
  }

  // Cargar datos cuando el componente se monta siguiendo el patrón
  useEffect(() => {
    if (!authLoading && isAdmin && !isRefreshing) {
      logger.logDebug('Usuario autenticado y es admin, cargando dashboard')
      loadDashboardData()
    } else if (authLoading) {
      logger.logDebug('Verificando autenticación...')
    } else if (!isAdmin) {
      logger.logWarning('Usuario no es admin, acceso denegado')
    }
  }, [authLoading, isAdmin])

  const handleRefresh = () => {
    logger.logUserAction('Usuario refrescó dashboard manualmente')
    loadDashboardData()
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si no es admin
  if (!isAdmin) {
    logger.logSecurity('Intento de acceso no autorizado al dashboard', {
      user: user?.email,
      userId: user?.id
    })
    
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <div className="space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>

          {/* Estado de Pago Skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas Principales Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gráfico Skeleton */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <Skeleton className="h-6 w-48 mb-2" />
                  <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[250px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Error al cargar datos
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  // Calcular porcentajes y tendencias
  const ticketsVendidos = stats.ticketsPagados + stats.ticketsVerificados
  const porcentajeVendidos = stats.totalTickets > 0 ? Math.round((ticketsVendidos / stats.totalTickets) * 100) : 0
  const porcentajeVerificados = stats.ingresosEstimados > 0 ? Math.round((stats.ingresosVerificados / stats.ingresosEstimados) * 100) : 0

  return (
    <div className="px-4 lg:px-6">
      <div className="space-y-6">
        {/* Header del Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Resumen general del sistema de rifas
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  • Actualizado {getVenezuelaDateClient(lastUpdated).toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <div className="max-w-md">
              <Select value={rifaId} onValueChange={(v) => setRifaId(v as any)}>
                <SelectTrigger 
                  aria-label="Seleccionar rifa"
                  className="h-8 !border-2 !border-gray-500 hover:!border-gray-700 focus:!border-gray-700 transition-all duration-200"
                >
                  <SelectValue placeholder="General" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  {rifas.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.titulo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={handleRefresh} 
              disabled={isRefreshing} 
              variant="outline"
              size="sm"
              className="h-8 !border-2 !border-gray-500 hover:!border-gray-700 hover:scale-105 transition-all duration-200"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refrescando...' : 'Actualizar'}
            </Button>
          </div>
        </div>

        {/* Estado del Sistema - eliminado */}

        {/* Estado de Pago (arriba) */}
        <DetailedStats 
          stats={stats} 
          pagosPendientes={pagosPendientes} 
          pagosVerificados={pagosVerificados} 
          pagosRechazados={pagosRechazados} 
          rifaId={rifaId === 'general' ? undefined : rifaId}
        />

        {/* Métricas Principales (cards) antes del gráfico */}
        <MetricsCards 
          stats={stats} 
          ingresosBsPagoMovil={ingresosBsPagoMovil} 
          ingresosUsdOtros={ingresosUsdOtros} 
        />

        {/* Gráfico principal debajo de las métricas */}
        <RevenueChart 
          chartType="tickets"
          title="Análisis por Período" 
          description="Evolución de tickets e ingresos por fecha" 
          rifaId={rifaId === 'general' ? undefined : rifaId}
        />

      </div>
    </div>
  )
}
