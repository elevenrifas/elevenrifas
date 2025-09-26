"use client"

import { IconTrendingUp, IconTrendingDown } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Gift, Ticket, DollarSign, Users } from "lucide-react"

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

interface DashboardStatsCardsProps {
  stats: DashboardStats
}

export function DashboardStatsCards({ stats }: DashboardStatsCardsProps) {
  // Calcular porcentajes de tendencia
  const ticketsVendidos = stats.ticketsPagados + stats.ticketsVerificados
  const porcentajeVendidos = stats.totalTickets > 0 ? Math.round((ticketsVendidos / stats.totalTickets) * 100) : 0
  const porcentajeVerificados = stats.ingresosEstimados > 0 ? Math.round((stats.ingresosVerificados / stats.ingresosEstimados) * 100) : 0

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Rifas</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalRifas}
          </CardTitle>
          <CardAction>
            <Badge variant={stats.sistemaActivo ? "default" : "outline"}>
              {stats.sistemaActivo ? (
                <>
                  <IconTrendingUp />
                  Activo
                </>
              ) : (
                <>
                  <IconTrendingDown />
                  Inactivo
                </>
              )}
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.rifasActivas} activas, {stats.rifasPausadas} pausadas
          </div>
          <div className="text-muted-foreground">
            {stats.rifasFinalizadas} finalizadas
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tickets</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalTickets}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {porcentajeVendidos}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {ticketsVendidos} vendidos <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            {stats.ticketsReservados} reservados
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Ingresos</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${stats.ingresosEstimados.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              {porcentajeVerificados}%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            ${stats.ingresosVerificados.toLocaleString()} verificados <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Ingresos totales estimados
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Clientes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalClientes}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Únicos
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Clientes registrados <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Base de datos de clientes
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}





