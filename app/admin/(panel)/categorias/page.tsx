"use client"

import { CategoriasRifasTable } from "@/app/admin/components/tables"

// =====================================================
// 🎯 PÁGINA ADMIN CATEGORIAS - ELEVEN RIFAS
// =====================================================
// Página para gestionar categorías de rifas
// Sigue el patrón establecido para páginas admin
// =====================================================

export default function CategoriasPage() {
  const handleCreate = () => {
    console.log("Crear nueva categoría")
    // Aquí implementarías la lógica para abrir modal de creación
  }

  const handleEdit = (categoria: any) => {
    console.log("Editar categoría:", categoria)
    // Aquí implementarías la lógica para abrir modal de edición
  }

  const handleDelete = (categorias: any[]) => {
    console.log("Eliminar categorías:", categorias)
    // Aquí implementarías la lógica para confirmar eliminación
  }

  const handleView = (categoria: any) => {
    console.log("Ver categoría:", categoria)
    // Aquí implementarías la lógica para ver detalles
  }

  const handleExport = (categorias: any[]) => {
    console.log("Exportar categorías:", categorias)
    
    try {
      // Crear headers del CSV
      const headers = [
        'ID',
        'Orden',
        'Nombre',
        'Descripción',
        'Rifas Count',
        'Estado'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...categorias.map(categoria => [
          categoria.id,
          categoria.orden,
          `"${categoria.nombre}"`, // Comillas para evitar problemas con comas
          `"${categoria.descripcion}"`,
          categoria.rifas_count,
          categoria.activa ? 'Activa' : 'Inactiva'
        ].join(','))
      ]
      
      // Crear contenido CSV
      const csvContent = csvRows.join('\n')
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `categorias_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      console.log('✅ Archivo CSV descargado exitosamente')
    } catch (error) {
      console.error('Error al exportar a CSV:', error)
    }
  }

  return (
    <div className="px-4 lg:px-6">
      <CategoriasRifasTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}
