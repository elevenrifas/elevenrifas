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
    
    try {
      // Crear headers del CSV
      const headers = [
        'ID',
        'Título',
        'Descripción',
        'Precio Ticket',
        'Estado',
                'Total Tickets',
        'Fecha Creación',
        'Fecha Cierre',
        'Categoría ID'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...rifas.map(rifa => [
          rifa.id,
          `"${rifa.titulo}"`, // Comillas para evitar problemas con comas
          `"${rifa.descripcion}"`,
          rifa.precio_ticket,
          rifa.estado,
                    rifa.total_tickets,
          rifa.fecha_creacion,
          rifa.fecha_cierre,
          rifa.categoria_id
        ].join(','))
      ]
      
      // Crear contenido CSV
      const csvContent = csvRows.join('\n')
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `rifas_${new Date().toISOString().split('T')[0]}.csv`)
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


