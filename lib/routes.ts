// =====================================================
// 🛣️ RUTAS CENTRALIZADAS - ELEVEN RIFAS
// =====================================================
// Sistema de rutas siguiendo las mejores prácticas de Next.js
// =====================================================

import { getClientUrl } from './config/env'

// Rutas públicas
export const PUBLIC_ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact',
} as const

// Rutas de autenticación
export const AUTH_ROUTES = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
} as const

// Rutas del panel de administración
export const ADMIN_ROUTES = {
  // Rutas base del admin
  BASE: '/admin',
  LOGIN: '/admin/login',
  
  // Panel principal
  DASHBOARD: '/admin/dashboard',
  
  // Gestión de contenido
  RIFAS: '/admin/rifas',
  CATEGORIAS: '/admin/categorias',
  TICKETS: '/admin/tickets',
  
  // Gestión de usuarios y pagos
  USUARIOS: '/admin/usuarios',
  PERFILES: '/admin/perfiles',
  PAGOS: '/admin/pagos',
  
  // Utilidades
  DEBUG: '/admin/debug',
  TEST: '/admin/test',
} as const

// Rutas de usuario autenticado
export const USER_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  MY_RIFAS: '/mis-rifas',
  COMPRAR: '/comprar',
} as const

// Rutas de API
export const API_ROUTES = {
  // API pública
  PUBLIC: {
    RIFAS: '/api/rifas',
    CATEGORIAS: '/api/categorias',
  },
  
  // API protegida (requiere autenticación)
  PROTECTED: {
    USER: '/api/user',
    PROFILE: '/api/profile',
    TICKETS: '/api/tickets',
  },
  
  // API de administración (requiere rol admin)
  ADMIN: {
    USERS: '/api/admin/users',
    RIFAS: '/api/admin/rifas',
    STATS: '/api/admin/stats',
    CATEGORIAS: '/api/admin/categorias',
    TICKETS: '/api/admin/tickets',
    PAGOS: '/api/admin/pagos',
  },
} as const

// Funciones helper para construir URLs
export const buildUrl = {
  // Construir URL con parámetros de consulta
  withQuery: (basePath: string, params: Record<string, string | number>) => {
    const url = new URL(basePath, getClientUrl())
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value))
    })
    return url.pathname + url.search
  },
  
  // Construir URL con segmentos dinámicos
  withSegments: (basePath: string, segments: Record<string, string | number>) => {
    let path = basePath
    Object.entries(segments).forEach(([key, value]) => {
      path = path.replace(`[${key}]`, String(value))
    })
    return path
  },
  
  // Construir URL relativa
  relative: (from: string, to: string) => {
    const fromParts = from.split('/').filter(Boolean)
    const toParts = to.split('/').filter(Boolean)
    
    // Encontrar el prefijo común
    let commonPrefix = 0
    for (let i = 0; i < Math.min(fromParts.length, toParts.length); i++) {
      if (fromParts[i] === toParts[i]) {
        commonPrefix++
      } else {
        break
      }
    }
    
    // Construir la ruta relativa
    const upLevels = fromParts.length - commonPrefix
    const relativePath = '../'.repeat(upLevels) + toParts.slice(commonPrefix).join('/')
    
    return relativePath || './'
  },
  
  // Construir URL absoluta usando la configuración del cliente
  absolute: (path: string) => {
    return `${getClientUrl()}${path}`
  }
}

// Tipos para TypeScript
export type PublicRoute = typeof PUBLIC_ROUTES[keyof typeof PUBLIC_ROUTES]
export type AuthRoute = typeof AUTH_ROUTES[keyof typeof AUTH_ROUTES]
export type AdminRoute = typeof ADMIN_ROUTES[keyof typeof ADMIN_ROUTES]
export type UserRoute = typeof USER_ROUTES[keyof typeof USER_ROUTES]
export type ApiRoute = typeof API_ROUTES[keyof typeof API_ROUTES]

// Validadores de rutas
export const isAdminRoute = (pathname: string): boolean => {
  return pathname.startsWith('/admin') && pathname !== '/admin/login'
}

export const isPublicRoute = (pathname: string): boolean => {
  return Object.values(PUBLIC_ROUTES).includes(pathname as PublicRoute)
}

export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname as AuthRoute)
}

export const isUserRoute = (pathname: string): boolean => {
  return Object.values(USER_ROUTES).includes(pathname as UserRoute)
}

// Redirecciones comunes
export const REDIRECTS = {
  // Después del login exitoso
  AFTER_LOGIN: ADMIN_ROUTES.DASHBOARD,
  
  // Después del logout
  AFTER_LOGOUT: ADMIN_ROUTES.LOGIN,
  
  // Si no tienes permisos
  ACCESS_DENIED: ADMIN_ROUTES.LOGIN,
  
  // Si no estás autenticado
  UNAUTHENTICATED: ADMIN_ROUTES.LOGIN,
} as const
