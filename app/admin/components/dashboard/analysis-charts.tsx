"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, PieChart, TrendingUp } from 'lucide-react'

// =====================================================
// 📊 GRÁFICAS DE ANÁLISIS - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar gráficas y análisis de datos
// Sigue el patrón de componentes del módulo admin
// =====================================================

interface ChartData {
  revenue: Array<{ date: string; revenue: number; tickets: number }>
  tickets: Array<{ rifa: string; vendidos: number; disponibles: number; total: number }>
  status: Array<{ name: string; value: number; color: string }>
}

interface AnalysisChartsProps {
  chartData: ChartData | null
}

export function AnalysisCharts({ chartData }: AnalysisChartsProps) {
  if (!chartData) {
    return null
  }

  return (
    <div className="grid gap-6">
      {/* Gráfica de Ingresos */}
      {chartData.revenue.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Evolución de Ingresos
            </CardTitle>
            <CardDescription>
              Tendencia de ingresos y tickets vendidos en el tiempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Gráfica de ingresos</p>
                <p className="text-sm">Datos: {chartData.revenue.length} puntos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Rifas */}
      {chartData.tickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Top Rifas por Ventas
            </CardTitle>
            <CardDescription>
              Rifas con mayor número de tickets vendidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.tickets.slice(0, 5).map((rifa, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{rifa.rifa}</p>
                      <p className="text-sm text-muted-foreground">
                        {rifa.vendidos} vendidos de {rifa.total}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round((rifa.vendidos / rifa.total) * 100)}%</p>
                    <p className="text-sm text-muted-foreground">
                      {rifa.disponibles} disponibles
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de Rifas - Gráfica de Pie */}
      {chartData.status.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución de Rifas
            </CardTitle>
            <CardDescription>
              Distribución de rifas por estado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {chartData.status.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-4 w-4 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="font-medium">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-medium">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumen de Actividad */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Resumen de Actividad
          </CardTitle>
          <CardDescription>
            Resumen general de la actividad del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Ingresos Totales</h4>
              <p className="text-2xl font-bold">
                {chartData.revenue.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()} USD
              </p>
              <p className="text-sm text-muted-foreground">
                {chartData.revenue.length} días de datos
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Tickets Totales</h4>
              <p className="text-2xl font-bold">
                {chartData.revenue.reduce((sum, item) => sum + item.tickets, 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Tickets vendidos en el período
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}








