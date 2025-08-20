"use client"

import { RifasTable } from "@/app/admin/components/tables"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function AdminRifasPage() {
  const handleCreate = () => {
    console.log("Crear nueva rifa")
    // Aquí implementarías la lógica para abrir modal de creación
  }

  const handleEdit = (rifa: any) => {
    console.log("Editar rifa:", rifa)
    // Aquí implementarías la lógica para abrir modal de edición
  }

  const handleDelete = (rifas: any[]) => {
    console.log("Eliminar rifas:", rifas)
    // Aquí implementarías la lógica para confirmar eliminación
  }

  const handleView = (rifa: any) => {
    console.log("Ver rifa:", rifa)
    // Aquí implementarías la lógica para ver detalles
  }

  const handleExport = (rifas: any[]) => {
    console.log("Exportar rifas:", rifas)
    // Aquí implementarías la lógica real de exportación
    // Por ejemplo, generar CSV, PDF, etc.
  }

  return (
    <div className="px-4 lg:px-6">
      <RifasTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}


