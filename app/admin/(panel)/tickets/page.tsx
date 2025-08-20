"use client"

import { useState, useEffect } from "react"
import { TicketsTable } from "@/app/admin/components/tables"
import { adminListTickets } from "@/lib/database/admin_database/tickets"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function TicketsPage() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const tickets = await adminListTickets()
        setData(tickets || [])
      } catch (error) {
        console.error("Error cargando tickets:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    console.log("Crear nuevo ticket")
    // Aquí iría la lógica para abrir modal de creación
  }

  const handleEdit = (ticket: any) => {
    console.log("Editar ticket:", ticket)
    // Aquí iría la lógica para abrir modal de edición
  }

  const handleDelete = (tickets: any[]) => {
    console.log("Eliminar tickets:", tickets)
    // Aquí iría la lógica para confirmar eliminación
  }

  const handleView = (ticket: any) => {
    console.log("Ver ticket:", ticket)
    // Aquí iría la lógica para ver detalles
  }

  const handleExport = (tickets: any[]) => {
    console.log("Exportar tickets:", tickets)
    // Aquí iría la lógica para exportar
  }

  return (
    <div className="px-4 lg:px-6">
      <TicketsTable
        data={data}
        isLoading={isLoading}
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}
