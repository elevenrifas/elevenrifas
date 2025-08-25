// =====================================================
// 🚨 MODO DE EMERGENCIA - ELEVEN RIFAS
// =====================================================
// Configuración temporal para desactivar verificación de permisos
// USAR SOLO EN CASOS DE EMERGENCIA
// =====================================================

export const EMERGENCY_CONFIG = {
  // 🚨 ACTIVAR MODO DE EMERGENCIA
  // Cambiar a false para volver a la verificación normal
  ENABLE_EMERGENCY_MODE: true,
  
  // Usuario admin temporal
  EMERGENCY_ADMIN: {
    id: 'emergency-admin-user',
    email: 'admin@emergency.com',
    fullName: 'Admin de Emergencia',
    role: 'admin'
  },
  
  // Mensaje de advertencia
  WARNING_MESSAGE: '🚨 MODO DE EMERGENCIA ACTIVADO - Verificación de permisos desactivada',
  
  // Duración del modo emergencia (en milisegundos)
  // 24 horas por defecto
  EMERGENCY_DURATION: 24 * 60 * 60 * 1000,
  
  // Timestamp de activación
  ACTIVATED_AT: Date.now()
} as const

// Función para verificar si el modo emergencia está activo
export function isEmergencyModeActive(): boolean {
  if (!EMERGENCY_CONFIG.ENABLE_EMERGENCY_MODE) return false
  
  // Verificar si ha expirado
  const timeElapsed = Date.now() - EMERGENCY_CONFIG.ACTIVATED_AT
  if (timeElapsed > EMERGENCY_CONFIG.EMERGENCY_DURATION) {
    console.warn('⚠️ Modo emergencia expirado, volviendo a verificación normal')
    return false
  }
  
  return true
}

// Función para obtener información del modo emergencia
export function getEmergencyInfo() {
  return {
    isActive: isEmergencyModeActive(),
    timeRemaining: Math.max(0, EMERGENCY_CONFIG.EMERGENCY_DURATION - (Date.now() - EMERGENCY_CONFIG.ACTIVATED_AT)),
    activatedAt: new Date(EMERGENCY_CONFIG.ACTIVATED_AT).toLocaleString(),
    expiresAt: new Date(EMERGENCY_CONFIG.ACTIVATED_AT + EMERGENCY_CONFIG.EMERGENCY_DURATION).toLocaleString()
  }
}

// Función para desactivar modo emergencia manualmente
export function disableEmergencyMode(): void {
  console.log('🔒 Desactivando modo de emergencia...')
  // Esta función se puede usar para desactivar manualmente
  // En una implementación real, podrías actualizar una variable de entorno
}
