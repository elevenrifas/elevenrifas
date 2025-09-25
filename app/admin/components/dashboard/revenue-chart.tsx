"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { DollarSign, TrendingUp, TrendingDown, Ticket, BarChart3 } from "lucide-react"
import { getRevenueByCurrency, getRevenueStats, RevenueDataPoint, RevenueStats } from '@/lib/database/admin_database/revenue-analysis'
import { getTicketsSoldByDate, TicketsByDateDataPoint } from '@/lib/database/admin_database/dashboard-charts'
import { formatCurrency } from '@/lib/formatters'

// =====================================================
// 📊 GRÁFICO DE GANANCIAS POR MONEDA - DASHBOARD ADMIN
// =====================================================
// Componente para mostrar ganancias divididas por bolívares y dólares
// Sigue el patrón de componentes del módulo admin
// =====================================================

const chartConfig = {
  bolivares: {
    label: "Bolívares",
    color: "#0891b2", // cyan-600
  },
  dolares: {
    label: "Dólares", 
    color: "#16a34a", // green-600
  },
  tickets: {
    label: "Tickets",
    color: "#ef4444",
  },
} satisfies ChartConfig

interface RevenueChartProps {
  data?: RevenueDataPoint[]
  stats?: RevenueStats
  title?: string
  description?: string
  mode?: 'revenue' | 'tickets'
  chartType?: 'tickets' | 'bolivares' | 'dolares'
  rifaId?: string
}

export function RevenueChart({ 
  data = [], 
  stats,
  title = "Análisis por Período", 
  description = "Evolución de tickets e ingresos por fecha",
  mode = 'revenue',
  chartType = 'tickets',
  rifaId
}: RevenueChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")
  const [selectedChartType, setSelectedChartType] = React.useState<'tickets' | 'bolivares' | 'dolares'>(chartType)
  const [chartData, setChartData] = React.useState<RevenueDataPoint[]>([])
  const [ticketsData, setTicketsData] = React.useState<TicketsByDateDataPoint[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  // Cargar datos del gráfico
  React.useEffect(() => {
    const loadChartData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let days = 30
        if (timeRange === "7d") days = 7
        else if (timeRange === "90d") days = 90
        
        if (selectedChartType === 'tickets') {
          const result = await getTicketsSoldByDate(days, rifaId)
          if (result.success && result.data) {
            // map to RevenueDataPoint shape for reuse of chart
            const mapped: RevenueDataPoint[] = result.data.map(d => ({ date: d.date, revenue: 0, tickets: d.tickets, bolivares: 0, dolares: 0 }))
            setChartData(mapped)
            setTicketsData(result.data)
          } else {
            setError(result.error || 'Error al cargar datos de tickets')
          }
        } else {
        const result = await getRevenueByCurrency(days, rifaId)
        if (result.success && result.data) {
          setChartData(result.data)
        } else {
            setError(result.error || 'Error al cargar datos de ingresos')
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setIsLoading(false)
      }
    }

    loadChartData()
  }, [timeRange, selectedChartType])

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!chartData || chartData.length === 0) return []
    return chartData
  }, [chartData])

  // Calcular totales para mostrar en el header
  const totalBolivares = filteredData.reduce((sum, item: any) => sum + (item.bolivares || 0), 0)
  const totalDolares = filteredData.reduce((sum, item: any) => sum + (item.dolares || 0), 0)
  const totalTickets = filteredData.reduce((sum, item: any) => sum + (item.tickets || 0), 0)
  const totalGanancia = totalBolivares + totalDolares

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {selectedChartType === 'tickets' ? <Ticket className="h-5 w-5 text-red-500" /> : 
           selectedChartType === 'bolivares' ? <BarChart3 className="h-5 w-5 text-cyan-600" /> :
           <DollarSign className="h-5 w-5 text-green-600" />}
          {title}
        </CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            {selectedChartType === 'tickets' ? 'Evolución diaria de tickets vendidos' :
             selectedChartType === 'bolivares' ? 'Evolución diaria de ingresos en bolívares' :
             'Evolución diaria de ingresos en dólares'}
          </span>
          <span className="@[540px]/card:hidden">
            {selectedChartType === 'tickets' ? 'Tickets vendidos' :
             selectedChartType === 'bolivares' ? 'Ingresos Bs' :
             'Ingresos USD'}
          </span>
        </CardDescription>
        
        {/* Mostrar estadísticas según el tipo de gráfico */}
        <div className="grid grid-cols-1 gap-4 mt-4">
          {selectedChartType === 'tickets' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <span className="text-sm font-medium">Tickets Vendidos</span>
              </div>
              <p className="text-2xl font-bold text-red-600">
                {totalTickets.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Total en el período seleccionado
              </p>
            </div>
          )}
          {selectedChartType === 'bolivares' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-cyan-600"></div>
                <span className="text-sm font-medium">Ingresos en Bolívares</span>
              </div>
              <p className="text-2xl font-bold text-cyan-700">
                {formatCurrency(totalBolivares, 'VES')}
              </p>
              <p className="text-xs text-muted-foreground">
                Total en el período seleccionado
              </p>
            </div>
          )}
          {selectedChartType === 'dolares' && (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-600"></div>
                <span className="text-sm font-medium">Ingresos en Dólares</span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(totalDolares, 'USD')}
              </p>
              <p className="text-xs text-muted-foreground">
                Total en el período seleccionado
              </p>
            </div>
          )}
          </div>

        <CardAction>
          {/* Selector de tipo de gráfico */}
          <ToggleGroup
            type="single"
            value={selectedChartType}
            onValueChange={(value) => setSelectedChartType(value as 'tickets' | 'bolivares' | 'dolares')}
            variant="outline"
            className="flex-wrap"
          >
            <ToggleGroupItem value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </ToggleGroupItem>
              <ToggleGroupItem value="bolivares" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-cyan-600" />
                Bolívares
              </ToggleGroupItem>
              <ToggleGroupItem value="dolares" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                Dólares
              </ToggleGroupItem>
          </ToggleGroup>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm text-muted-foreground">Cargando datos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
            </div>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[250px] w-full"
          >
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="fillBolivares" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#0891b2"
                    stopOpacity={1.0}
                  />
                  <stop
                    offset="95%"
                    stopColor="#0891b2"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillDolares" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="#16a34a"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="#16a34a"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                <linearGradient id="fillTickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.toLocaleDateString("es-ES", {
                    month: "short",
                    day: "numeric",
                  })
                }}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => {
                      return new Date(value).toLocaleDateString("es-ES", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    }}
                    formatter={(value, name) => {
                      if (name === "bolivares") {
                        return [`${Number(value).toLocaleString()} Bs`, "Bolívares"]
                      }
                      if (name === "dolares") {
                        return [`$${Number(value).toLocaleString()}`, "Dólares"]
                      }
                      if (name === "tickets") {
                        return [`${Number(value).toLocaleString()}`, "Tickets"]
                      }
                      return [value, name]
                    }}
                    indicator="dot"
                  />
                }
              />
              {selectedChartType === 'tickets' ? (
              <Area
                  dataKey="tickets"
                type="natural"
                  fill="url(#fillTickets)"
                  stroke="#ef4444"
              />
              ) : selectedChartType === 'bolivares' ? (
                <Area
                  dataKey="bolivares"
                  type="natural"
                  fill="url(#fillBolivares)"
                  stroke="#0891b2"
                />
              ) : (
                <Area
                  dataKey="dolares"
                  type="natural"
                  fill="url(#fillDolares)"
                  stroke="#16a34a"
                />
              )}
            </AreaChart>
          </ChartContainer>
        )}
        
        {/* Selector de período debajo del gráfico */}
        <div className="mt-6 pt-4 border-t">
          <div className="flex flex-col gap-3">
            <h4 className="text-sm font-medium text-muted-foreground">Período de análisis</h4>
            <div className="flex gap-2">
              <ToggleGroup
                type="single"
                value={timeRange}
                onValueChange={setTimeRange}
                variant="outline"
                className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
              >
                <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
                <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
                <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
              </ToggleGroup>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger
                  className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                  size="sm"
                  aria-label="Seleccionar período"
                >
                  <SelectValue placeholder="Últimos 30 días" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="90d" className="rounded-lg">
                    Últimos 3 meses
                  </SelectItem>
                  <SelectItem value="30d" className="rounded-lg">
                    Últimos 30 días
                  </SelectItem>
                  <SelectItem value="7d" className="rounded-lg">
                    Últimos 7 días
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

