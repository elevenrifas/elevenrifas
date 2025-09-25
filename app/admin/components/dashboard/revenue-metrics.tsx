"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Calculator,
  PieChart
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { getRevenueStats, RevenueStats } from '@/lib/database/admin_database/revenue-analysis'
import { useState, useEffect } from 'react'

// =====================================================
// 📊 MÉTRICAS DE GANANCIAS - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar métricas de ganancias por moneda
// Sigue el patrón de componentes del módulo admin
// =====================================================

interface RevenueMetricsProps {
  stats?: RevenueStats
  onRefresh?: () => void
  isLoading?: boolean
}

export function RevenueMetrics({ stats, onRefresh, isLoading = false }: RevenueMetricsProps) {
  const [localStats, setLocalStats] = useState<RevenueStats | null>(stats || null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Cargar estadísticas si no se proporcionan
  useEffect(() => {
    if (!stats && !isLoading) {
      loadStats()
    }
  }, [])

  const loadStats = async () => {
    try {
      setIsRefreshing(true)
      const result = await getRevenueStats()
      
      if (result.success && result.data) {
        setLocalStats(result.data)
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    } else {
      loadStats()
    }
  }

  const currentStats = stats || localStats

  if (!currentStats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
              <div className="h-4 w-4 bg-muted animate-pulse rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-4 bg-muted animate-pulse rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ganancias por Moneda</h3>
          <p className="text-sm text-muted-foreground">
            Análisis detallado de ingresos en bolívares y dólares
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          disabled={isLoading || isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || isRefreshing) ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Bolívares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bolívares</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(currentStats.totalBolivares, 'VES')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                <TrendingUp className="mr-1 h-3 w-3" />
                {currentStats.porcentajeBolivares.toFixed(1)}%
              </Badge>
              del total de ganancias
            </div>
          </CardContent>
        </Card>

        {/* Total Dólares */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dólares</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(currentStats.totalDolares, 'USD')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                <TrendingUp className="mr-1 h-3 w-3" />
                {currentStats.porcentajeDolares.toFixed(1)}%
              </Badge>
              del total de ganancias
            </div>
          </CardContent>
        </Card>

        {/* Ganancia Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ganancia Total</CardTitle>
            <Calculator className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(currentStats.gananciaTotal, 'USD')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="default" className="mr-2">
                <PieChart className="mr-1 h-3 w-3" />
                Total
              </Badge>
              en USD equivalente
            </div>
          </CardContent>
        </Card>

        {/* Conversión BS a USD */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BS Convertidos</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(currentStats.totalBolivaresConvertido, 'USD')}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Badge variant="outline" className="mr-2">
                <ArrowUpRight className="mr-1 h-3 w-3" />
                Convertido
              </Badge>
              bolívares a dólares
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis detallado */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Distribución por moneda */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución por Moneda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                  <span className="text-sm font-medium">Bolívares</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{currentStats.porcentajeBolivares.toFixed(1)}%</span>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(currentStats.totalBolivares, 'VES')}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium">Dólares</span>
                </div>
                <div className="text-right">
                  <span className="font-medium">{currentStats.porcentajeDolares.toFixed(1)}%</span>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(currentStats.totalDolares, 'USD')}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de conversiones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Resumen de Conversiones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bolívares originales</span>
                <span className="font-medium">{formatCurrency(currentStats.totalBolivares, 'VES')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Bolívares convertidos</span>
                <span className="font-medium">{formatCurrency(currentStats.totalBolivaresConvertido, 'USD')}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Dólares directos</span>
                <span className="font-medium">{formatCurrency(currentStats.totalDolares, 'USD')}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold">Total en USD</span>
                  <span className="font-bold text-lg">{formatCurrency(currentStats.gananciaTotal, 'USD')}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


