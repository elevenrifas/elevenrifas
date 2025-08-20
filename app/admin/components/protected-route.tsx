"use client"

import { useAdminAuth } from "@/hooks/use-admin-auth"
import { usePathname } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { loading, isAdmin, user } = useAdminAuth()
  const pathname = usePathname()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  
  // Si estamos en la página de login, no necesitamos protección
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  // Verificar si hay un usuario autenticado
  useEffect(() => {
    if (user && !loading) {
      setIsAuthenticated(true)
    }
  }, [user, loading])

  if (loading) {
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
  if (!user && !isAuthenticated) {
    return (
      <div className="flex min-h-full items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            No Autenticado
          </h1>
          <p className="text-muted-foreground">
            Por favor, inicia sesión para continuar.
          </p>
        </div>
      </div>
    )
  }

  // Si hay usuario pero no es admin, mostrar acceso denegado
  if (user && !isAdmin) {
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
}
