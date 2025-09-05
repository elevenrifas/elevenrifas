"use client"

import { useEffect, useState } from 'react'
import { useAdminAuthState } from '@/lib/context/AdminAuthContextSimpleStorage'
import { Loader2 } from 'lucide-react'

// =====================================================
// 🚪 LOGIN GUARD SÚPER SIMPLE - ELEVEN RIFAS
// =====================================================
// Componente que protege la página de login usando storage
// Si ya estás autenticado, te redirige INSTANTÁNEAMENTE
// =====================================================

interface LoginGuardProps {
  children: React.ReactNode
}

// Función robusta para redirección
const redirectToRifas = () => {
  try {
    const currentUrl = window.location.href
    const baseUrl = currentUrl.split('/admin/')[0]
    const targetUrl = `${baseUrl}/admin/rifas`
    console.log('🚪 LoginGuardSimple: Redirigiendo a:', targetUrl)
    window.location.href = targetUrl
  } catch (error) {
    console.error('🚪 LoginGuardSimple: Error en redirección:', error)
    window.location.href = '/admin/rifas'
  }
}

export function LoginGuardSimple({ children }: LoginGuardProps) {
  const { user, isAdmin, isLoading } = useAdminAuthState()
  const [authStatus, setAuthStatus] = useState<'checking' | 'redirecting' | 'show-form'>('checking')

  useEffect(() => {
    // Si está cargando, esperar
    if (isLoading) {
      setAuthStatus('checking')
      return
    }

    // Si hay usuario y es admin, redirigir
    if (user && isAdmin) {
      console.log('🚪 LoginGuardSimple: Usuario admin detectado, redirigiendo...')
      setAuthStatus('redirecting')
      redirectToRifas()
      return
    }

    // Si no hay usuario o no es admin, mostrar formulario
    console.log('🚪 LoginGuardSimple: Mostrando formulario de login')
    setAuthStatus('show-form')
  }, [user, isAdmin, isLoading])

  // Mostrar loading mientras se verifica
  if (authStatus === 'checking' || isLoading) {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si debe redirigir, mostrar mensaje
  if (authStatus === 'redirecting') {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirigiendo...</p>
          <p className="text-sm text-muted-foreground">Si no redirige automáticamente, haz clic en el enlace:</p>
          <a 
            href="/admin/rifas"
            className="text-primary hover:underline font-medium"
          >
            Ir al Panel de Rifas
          </a>
        </div>
      </div>
    )
  }

  // Mostrar formulario de login
  return <>{children}</>
}
