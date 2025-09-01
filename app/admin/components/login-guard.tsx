"use client"

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/database/supabase'
import { Loader2 } from 'lucide-react'

// =====================================================
// 🚪 LOGIN GUARD - ELEVEN RIFAS
// =====================================================
// Componente que protege la página de login
// Si ya estás autenticado, te redirige INSTANTÁNEAMENTE a /admin/rifas
// Versión ultra-optimizada y robusta para producción
// =====================================================

interface LoginGuardProps {
  children: React.ReactNode
}

// Función robusta para redirección que funciona en todos los entornos
const redirectToRifas = () => {
  try {
    // Detectar URL base automáticamente
    const currentUrl = window.location.href
    const baseUrl = currentUrl.split('/admin/')[0] // Obtener base URL
    
    // Construir URL completa
    const targetUrl = `${baseUrl}/admin/rifas`
    console.log('🚪 LoginGuard: Redirigiendo a:', targetUrl)
    
    window.location.href = targetUrl
    
  } catch (error) {
    console.error('🚪 LoginGuard: Error en redirección, usando fallback:', error)
    // FALLBACK: Redirección simple
    window.location.href = '/admin/rifas'
  }
}

export function LoginGuard({ children }: LoginGuardProps) {
  const [authStatus, setAuthStatus] = useState<'checking' | 'redirecting' | 'show-form'>('checking')

  useEffect(() => {
    // Flag para evitar múltiples verificaciones
    let isChecking = false

    const checkAuth = async () => {
      // Evitar verificaciones simultáneas
      if (isChecking) return
      isChecking = true

      try {
        console.log('🚪 LoginGuard: Iniciando verificación única...')
        
        // Verificar sesión actual
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('🚪 LoginGuard: Error verificando sesión:', error)
          setAuthStatus('show-form')
          return
        }

        if (!session?.user) {
          console.log('🚪 LoginGuard: No hay sesión activa')
          setAuthStatus('show-form')
          return
        }

        console.log('🚪 LoginGuard: Usuario encontrado:', session.user.email)
        
        // Verificar si es admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .eq('role', 'admin')
          .single()

        if (profileError) {
          console.log('🚪 LoginGuard: Error verificando perfil:', profileError.message)
          setAuthStatus('show-form')
          return
        }

        if (profile && (profile as any).role === 'admin') {
          console.log('🚪 LoginGuard: Usuario confirmado como admin, redirigiendo INSTANTÁNEAMENTE...')
          setAuthStatus('redirecting')
          
          // REDIRECCIÓN ROBUSTA - Funciona en todos los entornos
          redirectToRifas()
          
          return
        } else {
          console.log('🚪 LoginGuard: Usuario no es admin')
          setAuthStatus('show-form')
        }
        
      } catch (error) {
        console.error('🚪 LoginGuard: Error inesperado:', error)
        setAuthStatus('show-form')
      } finally {
        isChecking = false
      }
    }

    // Solo verificar una vez
    checkAuth()
  }, []) // Array vacío = solo se ejecuta una vez

  // Mostrar loading mientras se verifica la autenticación
  if (authStatus === 'checking') {
    return (
      <div className="flex min-h-full w-full items-center justify-center bg-gradient-to-br from-background via-background to-muted/20">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si debe redirigir, mostrar mensaje breve
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

  // Si no está autenticado o no es admin, mostrar el formulario de login
  return <>{children}</>
}
