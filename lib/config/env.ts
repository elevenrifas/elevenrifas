// =====================================================
// ⚙️ CONFIGURACIÓN DE ENTORNO - ELEVEN RIFAS
// =====================================================
// Configuración centralizada de variables de entorno y servidor
// =====================================================

export const ENV_CONFIG = {
  // Configuración del servidor
  SERVER: {
    PORT: process.env.PORT || 3000,
    HOST: process.env.HOST || 'localhost',
    NODE_ENV: process.env.NODE_ENV || 'development',
  },
  
  // Configuración de Supabase
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
  
  // Configuración de la aplicación
  APP: {
    NAME: 'ElevenRifas',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sistema de rifas en línea',
  },
  
  // URLs de la aplicación
  URLS: {
    BASE: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    ADMIN: '/admin',
    API: '/api',
  },
} as const

// Función para obtener la URL base del servidor
export function getServerUrl(): string {
  const { HOST, PORT } = ENV_CONFIG.SERVER
  return `http://${HOST}:${PORT}`
}

// Función para obtener la URL base del cliente
export function getClientUrl(): string {
  if (typeof window !== 'undefined') {
    // En el cliente, usar la URL actual
    return window.location.origin
  }
  
  // En el servidor, usar la configuración
  return ENV_CONFIG.URLS.BASE
}

// Función para construir URLs completas
export function buildFullUrl(path: string): string {
  const baseUrl = getClientUrl()
  return `${baseUrl}${path}`
}

// Función para verificar si estamos en desarrollo
export function isDevelopment(): boolean {
  return ENV_CONFIG.SERVER.NODE_ENV === 'development'
}

// Función para verificar si estamos en producción
export function isProduction(): boolean {
  return ENV_CONFIG.SERVER.NODE_ENV === 'production'
}

// Función para verificar si estamos en test
export function isTest(): boolean {
  return ENV_CONFIG.SERVER.NODE_ENV === 'test'
}

// Validar configuración requerida
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!ENV_CONFIG.SUPABASE.URL) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }
  
  if (!ENV_CONFIG.SUPABASE.ANON_KEY) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
