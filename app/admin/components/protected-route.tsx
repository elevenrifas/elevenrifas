"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAdmin, user } = useAdminAuth()
  const pathname = usePathname()
  
  // Debug logs
  console.log('🔒 ProtectedRoute - Estado actual:', {
    loading,
    isAdmin,
    user: user ? { id: user.id, email: user.email } : null,
    pathname
  })
  
  // Si estamos en la página de login, no necesitamos protección
  if (pathname === '/admin/login') {
    console.log('🔓 Ruta de login, permitiendo acceso')
    return <>{children}</>
  }

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    console.log('⏳ Mostrando loading...')
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario autenticado, redirigir al login
  if (!user) {
    console.log('❌ No hay usuario, redirigiendo a login...')
    // Usar window.location para evitar problemas de navegación
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  // Si hay usuario pero no es admin, mostrar acceso denegado
  if (!isAdmin) {
    console.log('🚫 Usuario no es admin, mostrando acceso denegado')
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  // Si todo está bien, renderizar el contenido
  console.log('✅ Usuario autenticado y es admin, permitiendo acceso')
  return <>{children}</>
}
