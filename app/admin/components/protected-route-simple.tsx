"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAdminAuthState } from "@/lib/context/AdminAuthContextSimpleStorage"

// =====================================================
// ⚡ PROTECTED ROUTE SÚPER SIMPLE - SOLO STORAGE
// =====================================================
// Verificación instantánea desde storage local
// Sin procesos complejos, máxima velocidad
// =====================================================

interface ProtectedRouteProps {
  children: React.ReactNode
}

export const ProtectedRouteSimple = React.memo(({ children }: ProtectedRouteProps) => {
  const { user, isAdmin, isLoading } = useAdminAuthState()
  const pathname = usePathname()
  
  // Si estamos en la página de login, no necesitamos protección
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Mostrar loading solo si realmente está cargando
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

ProtectedRouteSimple.displayName = 'ProtectedRouteSimple'
