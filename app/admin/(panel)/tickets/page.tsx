"use client"

import { useState } from "react"
import { TicketsTable } from "@/app/admin/components/tables"
import { DeleteConfirmModal } from "@/app/admin/components/modals"
import { useCrudTickets } from "@/hooks/use-crud-tickets"
import type { AdminTicket } from "@/types"

export default function TicketsPage() {
  // Hook para operaciones CRUD de tickets - COMPARTIDO con la tabla
  const { 
    deleteTicket, 
    deleteMultipleTickets, 
    refreshTickets,
    tickets,
    isLoading,
    error
  } = useCrudTickets({
    initialFilters: {},
    initialSort: { field: 'fecha_compra', direction: 'desc' },
    initialPageSize: 1000
  })
  
  // Estado para el modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [ticketsToDelete, setTicketsToDelete] = useState<AdminTicket[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = (tickets: AdminTicket[]) => {
    console.log("Preparando eliminación de tickets:", tickets)
    setTicketsToDelete(tickets)
    setShowDeleteModal(true)
  }

  const confirmDelete = async (): Promise<{ success: boolean; error?: string; details?: any }> => {
    console.log("Eliminando tickets:", ticketsToDelete)
    
    try {
      setIsDeleting(true)
      
      if (ticketsToDelete.length === 1) {
        // Eliminar un solo ticket
        const result = await deleteTicket(ticketsToDelete[0].id)
        
        if (result.success) {
          console.log("✅ Ticket eliminado exitosamente")
          // Cerrar modal y limpiar selección
          setShowDeleteModal(false)
          setTicketsToDelete([])
          // El hook ya hace refresh automáticamente
          return { success: true }
        } else {
          console.error("❌ Error al eliminar ticket:", result.error)
          return { success: false, error: result.error }
        }
      } else {
        // Eliminar múltiples tickets
        const ids = ticketsToDelete.map(ticket => ticket.id)
        const result = await deleteMultipleTickets(ids)
        
        if (result.success) {
          console.log("✅ Tickets eliminados exitosamente")
          // Cerrar modal y limpiar selección
          setShowDeleteModal(false)
          setTicketsToDelete([])
          // El hook ya hace refresh automáticamente
          return { success: true }
        } else {
          console.error("❌ Error al eliminar tickets:", result.error)
          return { success: false, error: result.error }
        }
      }
      
    } catch (error) {
      console.error("❌ Error inesperado al eliminar tickets:", error)
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al eliminar tickets'
      return { success: false, error: errorMessage }
    } finally {
      setIsDeleting(false)
    }
  }

  const handleExport = (tickets: AdminTicket[]) => {
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
        'Fecha Compra',
        'Estado Pago'
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
          ticket.fecha_compra || '',
          ticket.pago_id ? 'Pagado' : 'Sin Pago'
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
        onDelete={handleDelete}
        onExport={handleExport}
        // Pasar el hook compartido para sincronizar el estado
        sharedHook={{
          tickets,
          isLoading,
          error,
          refreshTickets
        }}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Eliminar Tickets"
        description={`¿Estás seguro de que deseas eliminar ${ticketsToDelete.length} ticket(s)? Esta acción no se puede deshacer.`}
        entityName={ticketsToDelete.length === 1 ? `ticket #${ticketsToDelete[0]?.numero_ticket}` : `${ticketsToDelete.length} tickets`}
        isDeleting={isDeleting}
      />
    </div>
  )
}
