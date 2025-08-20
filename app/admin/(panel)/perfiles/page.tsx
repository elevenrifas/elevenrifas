"use client"

import { useState, useEffect } from "react"
import { ProfilesTable } from "@/app/admin/components/tables"
import { adminListProfiles } from "@/lib/database/admin_database/profiles"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function PerfilesPage() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const perfiles = await adminListProfiles()
        setData(perfiles || [])
      } catch (error) {
        console.error("Error cargando perfiles:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    console.log("Crear nuevo perfil")
    // Aquí iría la lógica para abrir modal de creación
  }

  const handleEdit = (profile: any) => {
    console.log("Editar perfil:", profile)
    // Aquí iría la lógica para abrir modal de edición
  }

  const handleDelete = (profiles: any[]) => {
    console.log("Eliminar perfiles:", profiles)
    // Aquí iría la lógica para confirmar eliminación
  }

  const handleView = (profile: any) => {
    console.log("Ver perfil:", profile)
    // Aquí iría la lógica para ver detalles
  }

  const handleExport = (profiles: any[]) => {
    console.log("Exportar perfiles:", profiles)
    // Aquí iría la lógica para exportar
  }

  return (
    <div className="px-4 lg:px-6">
      <ProfilesTable
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
