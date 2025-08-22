"use client"

import { TicketsTable } from "@/app/admin/components/tables"

export default function TicketsPage() {
  const handleCreate = () => {
    console.log("Crear nuevo ticket")
    // Aquí implementarías la lógica para abrir modal de creación
  }

  const handleEdit = (ticket: any) => {
    console.log("Editar ticket:", ticket)
    // Aquí implementarías la lógica para abrir modal de edición
  }

  const handleDelete = (tickets: any[]) => {
    console.log("Eliminar tickets:", tickets)
    // Aquí implementarías la lógica para confirmar eliminación
  }

  const handleView = (ticket: any) => {
    console.log("Ver ticket:", ticket)
    // Aquí implementarías la lógica para ver detalles
  }

  const handleExport = (tickets: any[]) => {
    console.log("Exportar tickets:", tickets)
    
    try {
      // Crear headers del CSV
      const headers = [
        'ID',
        'Número Ticket',
        'Cliente',
        'Cédula',
        'Teléfono',
        'Correo',
        'Rifa',
        'Precio',
        'Estado',
        'Estado Verificación',
        'Fecha Compra',
        'Bloqueado por Pago'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...tickets.map(ticket => [
          ticket.id,
          `"${ticket.numero_ticket}"`,
          `"${ticket.nombre}"`,
          `"${ticket.cedula}"`,
          `"${ticket.telefono || ''}"`,
          `"${ticket.correo}"`,
          `"${ticket.rifas?.titulo || ''}"`,
          ticket.precio,
          ticket.estado,
          ticket.estado_verificacion || 'pendiente',
          ticket.fecha_compra || '',
          ticket.bloqueado_por_pago ? 'Sí' : 'No'
        ].join(','))
      ]
      
      // Crear contenido CSV
      const csvContent = csvRows.join('\n')
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `tickets_${new Date().toISOString().split('T')[0]}.csv`)
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
      <TicketsTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}
