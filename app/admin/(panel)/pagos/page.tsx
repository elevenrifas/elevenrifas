"use client"

import { PagosVerificacionTable } from "@/app/admin/components/tables"

// =====================================================
// 🎯 PÁGINA ADMIN PAGOS - ELEVEN RIFAS
// =====================================================
// Página para gestionar pagos del sistema
// Sigue el patrón establecido para páginas admin
// =====================================================

export default function AdminPagosPage() {
  const handleCreate = () => {
    console.log("Crear nuevo pago")
    // Aquí implementarías la lógica para abrir modal de creación
  }

  const handleEdit = (pago: any) => {
    console.log("Editar pago:", pago)
    // Aquí implementarías la lógica para abrir modal de edición
  }

  const handleDelete = (pagos: any[]) => {
    console.log("Eliminar pagos:", pagos)
    // Aquí implementarías la lógica para confirmar eliminación
  }

  const handleView = (pago: any) => {
    console.log("Ver pago:", pago)
    // Aquí implementarías la lógica para ver detalles
  }

  const handleExport = (pagos: any[]) => {
    console.log("Exportar pagos:", pagos)
    
    try {
      // Crear headers del CSV
      const headers = [
        'ID',
        'Ticket ID',
        'Tipo Pago',
        'Estado',
        'Monto Bs',
        'Monto USD',
        'Tasa Cambio',
        'Referencia',
        'Fecha Pago',
        'Fecha Verificación',
        'Cliente',
        'Notas'
      ]
      
      // Convertir datos a filas CSV
      const csvRows = [
        headers.join(','), // Primera fila: headers
        ...pagos.map(pago => [
          pago.id,
          pago.ticket_id || '',
          pago.tipo_pago,
          pago.estado,
          pago.monto_bs,
          pago.monto_usd,
          pago.tasa_cambio,
          `"${pago.referencia || ''}"`,
          pago.fecha_pago,
          pago.fecha_verificacion || '',
          `"${pago.tickets?.nombre || ''}"`,
          `"${pago.notas || ''}"`
        ].join(','))
      ]
      
      // Crear contenido CSV
      const csvContent = csvRows.join('\n')
      
      // Crear blob y descargar
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      
      link.setAttribute('href', url)
      link.setAttribute('download', `pagos_${new Date().toISOString().split('T')[0]}.csv`)
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
      <PagosVerificacionTable
        onCreate={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onExport={handleExport}
      />
    </div>
  )
}


