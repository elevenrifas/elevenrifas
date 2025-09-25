"use client"

import { UsuariosVerificacionTable } from "@/app/admin/components/tables"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { useCrudUsuariosVerificacion } from "@/hooks/use-crud-usuarios-verificacion"

// =====================================================
// 🎯 PÁGINA USUARIOS VERIFICACION - ELEVEN RIFAS
// =====================================================
// Página del panel de administración para gestionar usuarios de verificación
// Implementación simple que usa el componente UsuariosVerificacionTable
// =====================================================

export default function UsuariosVerificacionPage() {
  // Hook para obtener estado de loading
  const { isLoading } = useCrudUsuariosVerificacion({
    initialFilters: {},
    initialSort: { field: 'fecha_creacion', direction: 'desc' }
  })

  // Mostrar skeleton mientras carga
  if (isLoading) {
    return (
      <div className="px-4 lg:px-6">
        <SkeletonTable rows={6} columns={4} />
      </div>
    )
  }

  return (
    <div className="px-4 lg:px-6">
      <UsuariosVerificacionTable />
    </div>
  )
}
