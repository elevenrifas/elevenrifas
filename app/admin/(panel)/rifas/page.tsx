"use client"

import { RifasTable } from "@/app/admin/components/tables"
// import * as XLSX from 'xlsx' // Temporalmente deshabilitado para el build
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function AdminRifasPage() {
  // Los callbacks están manejados directamente por la tabla RifasTable
  // que usa el hook useCrudRifas para toda la funcionalidad CRUD
  const handleCreate = () => {
    // La tabla maneja la creación automáticamente
    console.log("Crear nueva rifa - manejado por la tabla")
  }

  const handleEdit = (rifa: any) => {
    // La tabla maneja la edición automáticamente
    console.log("Editar rifa - manejado por la tabla:", rifa)
  }

  const handleDelete = (rifas: any[]) => {
    // La tabla maneja la eliminación automáticamente
    console.log("Eliminar rifas - manejado por la tabla:", rifas)
  }

  const handleView = (rifa: any) => {
    // La tabla maneja la visualización automáticamente
    console.log("Ver rifa - manejado por la tabla:", rifa)
  }

  return (
    <div className="px-4 lg:px-6">
      <RifasTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        // No pasar onExport para que la tabla use su lógica interna
      />
    </div>
  )
}


