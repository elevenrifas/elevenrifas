"use client"

import { useState } from 'react'
import { ClientesTable } from '@/app/admin/components/tables/ClientesTable'
import { ClienteViewModal } from '@/app/admin/components/modals/ClienteViewModal'
import { exportClientesToExcel } from '@/lib/utils/excel-export'
import type { AdminCliente } from '@/types'

// =====================================================
// 👥 PÁGINA CLIENTES - ELEVEN RIFAS
// =====================================================
// Página principal para gestionar clientes únicos
// Extraídos y agrupados desde la tabla tickets
// =====================================================

export default function AdminClientesPage() {
  // Estado para el modal de vista del cliente
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedCliente, setSelectedCliente] = useState<AdminCliente | null>(null)

  // Función para mostrar detalles del cliente
  const handleViewCliente = (cliente: AdminCliente) => {
    setSelectedCliente(cliente)
    setShowViewModal(true)
  }

  // Función para cerrar el modal
  const handleCloseViewModal = () => {
    setShowViewModal(false)
    setSelectedCliente(null)
  }

  // Función para exportar clientes
  const handleExportClientes = (clientes: AdminCliente[]) => {
    try {
      console.log('📊 Exportando clientes a Excel:', clientes.length)
      exportClientesToExcel(clientes, 'clientes_eleven_rifas')
    } catch (error) {
      console.error('Error al exportar clientes:', error)
    }
  }

  return (
    <div className="px-4 lg:px-6">
      {/* Header de la página */}
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
        <p className="text-muted-foreground">
          Gestiona todos los clientes únicos del sistema de rifas. 
          Los clientes se extraen automáticamente desde los tickets comprados.
        </p>
      </div>

      {/* Tabla de clientes */}
      <ClientesTable
        onView={handleViewCliente}
        onExport={handleExportClientes}
      />

      {/* Modal de vista del cliente */}
      <ClienteViewModal
        isOpen={showViewModal}
        onClose={handleCloseViewModal}
        cliente={selectedCliente}
      />
    </div>
  )
}
