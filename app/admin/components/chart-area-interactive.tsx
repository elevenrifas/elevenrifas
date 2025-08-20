"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp } from "lucide-react"

interface ChartAreaInteractiveProps {
  data?: {
    labels: string[]
    values: number[]
  }
}

export function ChartAreaInteractive({ data }: ChartAreaInteractiveProps) {
  const defaultData = {
    labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    values: [12, 19, 3, 5, 2, 3],
    ...data
  }

  const maxValue = Math.max(...defaultData.values)
  const minValue = Math.min(...defaultData.values)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ventas Mensuales</CardTitle>
            <CardDescription>
              Ingresos generados por rifas en los últimos 6 meses
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-600">+12.5%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] w-full">
          <div className="flex h-full items-end justify-between gap-2">
            {defaultData.values.map((value, index) => {
              const height = ((value - minValue) / (maxValue - minValue)) * 100
              return (
                <div key={index} className="flex flex-col items-center gap-1">
                  <div
                    className="w-8 bg-primary rounded-t"
                    style={{ height: `${height}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {defaultData.labels[index]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Total: ${defaultData.values.reduce((a, b) => a + b, 0).toLocaleString()}
          </span>
          <span className="text-muted-foreground">
            Promedio: ${(defaultData.values.reduce((a, b) => a + b, 0) / defaultData.values.length).toFixed(0)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
