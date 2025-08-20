"use client"

import { useState, useEffect } from "react"
import { CategoriasRifasTable } from "@/app/admin/components/tables"
import { adminListCategorias } from "@/lib/database/admin_database/categorias"
// El layout del grupo `(panel)` ya incluye Sidebar y Header

export default function CategoriasPage() {
  const [data, setData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const categorias = await adminListCategorias()
        setData(categorias || [])
      } catch (error) {
        console.error("Error cargando categorías:", error)
        setData([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleCreate = () => {
    console.log("Crear nueva categoría")
    // Aquí iría la lógica para abrir modal de creación
  }

  const handleEdit = (categoria: any) => {
    console.log("Editar categoría:", categoria)
    // Aquí iría la lógica para abrir modal de edición
  }

  const handleDelete = (categorias: any[]) => {
    console.log("Eliminar categorías:", categorias)
    // Aquí iría la lógica para confirmar eliminación
  }

  const handleView = (categoria: any) => {
    console.log("Ver categoría:", categoria)
    // Aquí iría la lógica para ver detalles
  }

  const handleExport = (categorias: any[]) => {
    console.log("Exportar categorías:", categorias)
    // Aquí iría la lógica para exportar
  }

  return (
    <div className="px-4 lg:px-6">
      <CategoriasRifasTable
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
