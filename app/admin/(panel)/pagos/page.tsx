"use client"

import { useState, useEffect } from "react"
import { PagosTable } from "@/app/admin/components/tables"
import { adminListPagos } from "@/lib/database/admin_database"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function AdminPagosPage() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const result = await adminListPagos()
        setData(result.success ? result.data : [])
      } catch (error) {
        console.error("Error cargando pagos:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    console.log("Crear nuevo pago")
    // Aquí iría la lógica para abrir modal de creación
  }

  const handleEdit = (pago: any) => {
    console.log("Editar pago:", pago)
    // Aquí iría la lógica para abrir modal de edición
  }

  const handleDelete = (pagos: any[]) => {
    console.log("Eliminar pagos:", pagos)
    // Aquí iría la lógica para confirmar eliminación
  }

  const handleView = (pago: any) => {
    console.log("Ver pago:", pago)
    // Aquí iría la lógica para ver detalles
  }

  const handleExport = (pagos: any[]) => {
    console.log("Exportar pagos:", pagos)
    // Aquí iría la lógica para exportar
  }

  return (
    <div className="px-4 lg:px-6">
      <PagosTable
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


