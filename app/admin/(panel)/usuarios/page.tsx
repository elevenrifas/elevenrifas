"use client"

import { useState, useEffect } from "react"
import { UsuariosTable } from "@/app/admin/components/tables"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { adminListUsuarios } from "@/lib/database/admin_database"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function AdminUsuariosPage() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const result = await adminListUsuarios()
        setData(result.success ? result.data : [])
      } catch (error) {
        console.error("Error cargando usuarios:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    console.log("Crear nuevo usuario")
    // Aquí iría la lógica para abrir modal de creación
  }

  const handleEdit = (usuario: any) => {
    console.log("Editar usuario:", usuario)
    // Aquí iría la lógica para abrir modal de edición
  }

  const handleDelete = (usuarios: any[]) => {
    console.log("Eliminar usuarios:", usuarios)
    // Aquí iría la lógica para confirmar eliminación
  }

  const handleView = (usuario: any) => {
    console.log("Ver usuario:", usuario)
    // Aquí iría la lógica para ver detalles
  }

  const handleExport = (usuarios: any[]) => {
    console.log("Exportar usuarios:", usuarios)
    // Aquí iría la lógica para exportar
  }

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <SkeletonTable rows={8} columns={5} />
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <UsuariosTable
        data={data}
        isLoading={false} // Ya no necesitamos pasar isLoading a la tabla
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}


