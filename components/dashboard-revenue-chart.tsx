"use client"

import * as React from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts"
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
import { DollarSign } from "lucide-react"

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
  tickets: {
    label: "Tickets Vendidos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

interface RevenueDataPoint {
  date: string
  revenue: number
  tickets: number
}

interface DashboardRevenueChartProps {
  data: RevenueDataPoint[]
  title?: string
  description?: string
}

export function DashboardRevenueChart({ 
  data, 
  title = "Ingresos y Tickets", 
  description = "Evolución de ingresos y tickets vendidos en el tiempo" 
}: DashboardRevenueChartProps) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("30d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) return []
    
    const now = new Date()
    let daysToSubtract = 30
    
    if (timeRange === "7d") daysToSubtract = 7
    else if (timeRange === "90d") daysToSubtract = 90
    
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    
    return data.filter(item => {
      const itemDate = new Date(item.date)
      return itemDate >= startDate
    })
  }, [data, timeRange])

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>{title}</CardTitle>
        </div>
        <CardDescription>{description}</CardDescription>
        <CardAction>
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
              aria-label="Select a value"
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
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[300px] w-full"
        >
          <LineChart data={filteredData}>
            <defs>
              
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
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
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
                    if (name === "revenue") {
                      return [`$${Number(value).toLocaleString()}`, "Ingresos"]
                    }
                    return [value, "Tickets"]
                  }}
                  indicator="dot"
                />
              }
            />
            <Line
              dataKey="revenue"
              type="monotone"
              stroke="var(--color-revenue)"
              strokeWidth={2}
              dot={false}
              name="Ingresos"
            />
            <Line
              dataKey="tickets"
              type="monotone"
              stroke="var(--color-tickets)"
              strokeWidth={2}
              dot={false}
              name="Tickets"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
