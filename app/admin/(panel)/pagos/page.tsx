"use client"

import { PagosVerificacionTable } from "@/app/admin/components/tables"
import { exportPagosToExcel } from "@/lib/utils/excel-export"

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
    console.log("Exportar pagos a Excel:", pagos)
    
    try {
      exportPagosToExcel(pagos, 'pagos')
      console.log('✅ Archivo Excel descargado exitosamente')
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
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


