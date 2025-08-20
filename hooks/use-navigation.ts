// =====================================================
// 🧭 HOOK DE NAVEGACIÓN - ELEVEN RIFAS
// =====================================================
// Hook personalizado para manejar navegación usando rutas centralizadas
// =====================================================

import { useRouter, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { 
  ADMIN_ROUTES, 
  USER_ROUTES, 
  PUBLIC_ROUTES, 
  REDIRECTS,
  type AdminRoute,
  type UserRoute,
  type PublicRoute
} from '@/lib/routes'

export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  // Navegación a rutas admin
  const navigateToAdmin = useCallback((route: AdminRoute) => {
    router.push(route)
  }, [router])

  // Navegación a rutas de usuario
  const navigateToUser = useCallback((route: UserRoute) => {
    router.push(route)
  }, [router])

  // Navegación a rutas públicas
  const navigateToPublic = useCallback((route: PublicRoute) => {
    router.push(route)
  }, [router])

  // Navegación con reemplazo (útil para login/logout)
  const navigateReplace = useCallback((route: string) => {
    router.replace(route)
  }, [router])

  // Navegación con refresh
  const navigateRefresh = useCallback((route: string) => {
    router.push(route)
    router.refresh()
  }, [router])

  // Navegación hacia atrás
  const navigateBack = useCallback(() => {
    router.back()
  }, [router])

  // Navegación hacia adelante
  const navigateForward = useCallback(() => {
    router.forward()
  }, [router])

  // Navegación después del login
  const navigateAfterLogin = useCallback(() => {
    router.replace(REDIRECTS.AFTER_LOGIN)
  }, [router])

  // Navegación después del logout
  const navigateAfterLogout = useCallback(() => {
    router.replace(REDIRECTS.AFTER_LOGOUT)
  }, [router])

  // Navegación a acceso denegado
  const navigateToAccessDenied = useCallback(() => {
    router.replace(REDIRECTS.ACCESS_DENIED)
  }, [router])

  // Verificar si estamos en una ruta específica
  const isCurrentRoute = useCallback((route: string) => {
    return pathname === route
  }, [pathname])

  // Verificar si estamos en una ruta admin
  const isAdminRoute = useCallback((route?: string) => {
    const targetRoute = route || pathname
    return targetRoute.startsWith('/admin') && targetRoute !== '/admin/login'
  }, [pathname])

  // Verificar si estamos en una ruta de usuario
  const isUserRoute = useCallback((route?: string) => {
    const targetRoute = route || pathname
    return targetRoute.startsWith('/dashboard') || targetRoute.startsWith('/profile')
  }, [pathname])

  return {
    // Estado actual
    pathname,
    
    // Navegación básica
    push: router.push,
    replace: router.replace,
    back: router.back,
    forward: router.forward,
    refresh: router.refresh,
    
    // Navegación tipada
    navigateToAdmin,
    navigateToUser,
    navigateToPublic,
    
    // Navegación especializada
    navigateReplace,
    navigateRefresh,
    navigateBack,
    navigateForward,
    navigateAfterLogin,
    navigateAfterLogout,
    navigateToAccessDenied,
    
    // Verificadores de ruta
    isCurrentRoute,
    isAdminRoute,
    isUserRoute,
    
    // Rutas constantes
    routes: {
      admin: ADMIN_ROUTES,
      user: USER_ROUTES,
      public: PUBLIC_ROUTES,
      redirects: REDIRECTS,
    }
  }
}
