"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2 } from "lucide-react"

interface DataTableProps {
  data?: Array<{
    id: string
    title: string
    status: string
    date: string
    amount: number
  }>
}

export function DataTable({ data }: DataTableProps) {
  const defaultData = data || [
    {
      id: "1",
      title: "Rifa Toyota 4Runner",
      status: "Activa",
      date: "2024-01-15",
      amount: 25000,
    },
    {
      id: "2",
      title: "Rifa Camry",
      status: "Completada",
      date: "2024-01-10",
      amount: 20000,
    },
    {
      id: "3",
      title: "Rifa Corolla",
      status: "Pendiente",
      date: "2024-01-20",
      amount: 18000,
    },
  ]

  const getStatusBadge = (status: string) => {
    if (!status) return <Badge variant="outline">Sin estado</Badge>
    switch (status.toLowerCase()) {
      case "activa":
        return <Badge variant="default">Activa</Badge>
      case "completada":
        return <Badge variant="secondary">Completada</Badge>
      case "pendiente":
        return <Badge variant="outline">Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rifas Recientes</CardTitle>
        <CardDescription>
          Lista de las rifas más recientes en el sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rifa</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {defaultData.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>{item.date}</TableCell>
                <TableCell className="text-right">
                  ${(item.amount || 0).toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
