"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAdminAuthState } from "@/lib/context/AdminAuthContextSimple"

// =====================================================
// 🛡️ PROTECTED ROUTE - ELEVEN RIFAS
// =====================================================
// Componente que protege todas las rutas admin
// Usa el nuevo sistema de autenticación optimizado
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRoute = React.memo(({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAdminAuthState()
  const pathname = usePathname()
  
  // Solo mostrar logs en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🔒 ProtectedRoute - Estado:', { isLoading, isAdmin, pathname })
  }
  
  // Si estamos en la página de login, no necesitamos protección
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
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
    // Usar window.location para evitar problemas de navegación
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login'
    }
    return null
  }

  // Si hay usuario pero no es admin, mostrar acceso denegado
  if (!isAdmin) {
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
  return <>{children}</>
})

ProtectedRoute.displayName = 'ProtectedRoute'
