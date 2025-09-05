/**
 * Configuración de rendimiento para el panel de administración
 * Estas constantes controlan el comportamiento de cache y verificaciones
 */

export const ADMIN_PERFORMANCE_CONFIG = {
  // Duración del cache de sesión (en milisegundos)
  SESSION_CACHE_DURATION: 15 * 60 * 1000, // 15 minutos (aumentado para mejor rendimiento)
  
  // Intervalo mínimo entre verificaciones de sesión (en milisegundos)
  MIN_SESSION_CHECK_INTERVAL: 60 * 1000, // 60 segundos (aumentado para reducir verificaciones)
  
  // Tiempo máximo de espera para operaciones de autenticación (en milisegundos)
  AUTH_TIMEOUT: 15 * 1000, // 15 segundos
  
  // Número máximo de reintentos para operaciones fallidas
  MAX_RETRY_ATTEMPTS: 3,
  
  // Tiempo de espera entre reintentos (en milisegundos)
  RETRY_DELAY: 1000, // 1 segundo
  
  // Habilitar cache de perfiles de usuario
  ENABLE_PROFILE_CACHE: true,
  
  // Duración del cache de perfiles (en milisegundos)
  PROFILE_CACHE_DURATION: 15 * 60 * 1000, // 15 minutos
  
  // Habilitar verificación lazy (solo cuando sea necesario)
  ENABLE_LAZY_VERIFICATION: true,
  
  // Habilitar logs de rendimiento
  ENABLE_PERFORMANCE_LOGS: process.env.NODE_ENV === 'development',
  
  // Umbral de tiempo para considerar una operación lenta (en milisegundos)
  SLOW_OPERATION_THRESHOLD: 1000, // 1 segundo
} as const

/**
 * Función para obtener la configuración según el ambiente
 */
export function getAdminPerformanceConfig() {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  return {
    ...ADMIN_PERFORMANCE_CONFIG,
    // En desarrollo, usar tiempos moderados para facilitar debugging
    SESSION_CACHE_DURATION: isDevelopment ? 5 * 60 * 1000 : ADMIN_PERFORMANCE_CONFIG.SESSION_CACHE_DURATION,
    MIN_SESSION_CHECK_INTERVAL: isDevelopment ? 30 * 1000 : ADMIN_PERFORMANCE_CONFIG.MIN_SESSION_CHECK_INTERVAL,
    ENABLE_PERFORMANCE_LOGS: isDevelopment,
  }
}

/**
 * Función para validar si una operación es lenta
 */
export function isSlowOperation(duration: number): boolean {
  return duration > ADMIN_PERFORMANCE_CONFIG.SLOW_OPERATION_THRESHOLD
}

/**
 * Función para calcular el tiempo de espera entre reintentos
 */
export function calculateRetryDelay(attempt: number): number {
  return Math.min(
    ADMIN_PERFORMANCE_CONFIG.RETRY_DELAY * Math.pow(2, attempt),
    10000 // Máximo 10 segundos
  )
}
