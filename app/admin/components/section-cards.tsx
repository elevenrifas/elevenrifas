"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, FileText, Users, CreditCard } from "lucide-react"

interface SectionCardsProps {
  stats?: {
    totalRifas: number
    totalUsuarios: number
    totalPagos: number
    totalIngresos: number
  }
}

export function SectionCards({ stats }: SectionCardsProps) {
  const defaultStats = {
    totalRifas: 0,
    totalUsuarios: 0,
    totalPagos: 0,
    totalIngresos: 0,
    ...stats
  }

  const cards = [
    {
      title: "Total Rifas",
      description: "Rifas activas en el sistema",
      value: defaultStats.totalRifas,
      icon: FileText,
      color: "text-blue-600",
    },
    {
      title: "Total Usuarios",
      description: "Usuarios registrados",
      value: defaultStats.totalUsuarios,
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Total Pagos",
      description: "Pagos procesados",
      value: defaultStats.totalPagos,
      icon: CreditCard,
      color: "text-orange-600",
    },
    {
      title: "Ingresos Totales",
      description: "Ingresos generados",
      value: `$${defaultStats.totalIngresos.toLocaleString()}`,
      icon: DollarSign,
      color: "text-purple-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
