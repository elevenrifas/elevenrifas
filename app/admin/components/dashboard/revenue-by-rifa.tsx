"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Gift,
  TrendingUp,
  DollarSign,
  Calculator,
  Eye,
  BarChart3
} from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { getRevenueByRifa } from '@/lib/database/admin_database/revenue-analysis'
import { useState, useEffect } from 'react'

// =====================================================
// 📊 GANANCIAS POR RIFA - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar ganancias desglosadas por rifa
// Sigue el patrón de componentes del módulo admin
// =====================================================

interface RifaRevenue {
  rifaId: string
  titulo: string
  bolivares: number
  dolares: number
  total_bs: number
  total_usd: number
  tickets: number
  gananciaTotal: number
}

interface RevenueByRifaProps {
  limit?: number
}

export function RevenueByRifa({ limit = 5 }: RevenueByRifaProps) {
  const [rifaData, setRifaData] = useState<RifaRevenue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRifaData()
  }, [])

  const loadRifaData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const result = await getRevenueByRifa()
      
      if (result.success && result.data) {
        setRifaData(result.data.slice(0, limit))
      } else {
        setError(result.error || 'Error al cargar datos')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ganancias por Rifa
          </CardTitle>
          <CardDescription>
            Cargando datos de ganancias por rifa...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded"></div>
                  <div className="space-y-1">
                    <div className="h-4 bg-muted animate-pulse rounded w-32"></div>
                    <div className="h-3 bg-muted animate-pulse rounded w-24"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-muted animate-pulse rounded w-16 mb-1"></div>
                  <div className="h-3 bg-muted animate-pulse rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ganancias por Rifa
          </CardTitle>
          <CardDescription>
            Error al cargar datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={loadRifaData} variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (rifaData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Ganancias por Rifa
          </CardTitle>
          <CardDescription>
            No hay datos de ganancias disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No hay rifas con ganancias registradas</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Ganancias por Rifa
        </CardTitle>
        <CardDescription>
          Top {limit} rifas con mayores ganancias
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {rifaData.map((rifa, index) => (
            <div key={rifa.rifaId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <h4 className="font-medium">{rifa.titulo}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{rifa.tickets} tickets</span>
                    <span>•</span>
                    <span>{formatCurrency(rifa.total_bs, 'VES')} + {formatCurrency(rifa.total_usd, 'USD')}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">
                  {formatCurrency(rifa.gananciaTotal, 'USD')}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  <span>Total</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen total */}
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(
                  rifaData.reduce((sum, rifa) => sum + rifa.total_bs, 0), 
                  'VES'
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Bolívares</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(
                  rifaData.reduce((sum, rifa) => sum + rifa.total_usd, 0), 
                  'USD'
                )}
              </div>
              <div className="text-xs text-muted-foreground">Total Dólares</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}








