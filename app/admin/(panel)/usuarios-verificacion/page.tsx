import { UsuariosVerificacionTable } from "@/app/admin/components/tables"

// =====================================================
// 🎯 PÁGINA USUARIOS VERIFICACION - ELEVEN RIFAS
// =====================================================
// Página del panel de administración para gestionar usuarios de verificación
// Implementación simple que usa el componente UsuariosVerificacionTable
// =====================================================

export default function UsuariosVerificacionPage() {
  return (
    <div className="px-4 lg:px-6">
      <UsuariosVerificacionTable />
    </div>
  )
}
