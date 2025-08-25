// =====================================================
// 🎯 CONFIGURACIÓN DE LOGGING - ELEVEN RIFAS
// =====================================================
// Configuración centralizada para el sistema de logging
// Variables de entorno y configuraciones por defecto
// =====================================================

export interface LoggingConfig {
  // Nivel de logging
  level: 'error' | 'warn' | 'info' | 'debug'
  
  // Configuración de visualización
  showTimestamp: boolean
  showLevel: boolean
  showContext: boolean
  
  // Configuración de datos
  maxLogLength: number
  enableFileLogging: boolean
  logFilePath: string
  
  // Configuración de servicios externos
  enableSentry: boolean
  enableLogRocket: boolean
  enableCustomAPI: boolean
  
  // Configuración de notificaciones
  enableErrorNotifications: boolean
  enablePerformanceMonitoring: boolean
  
  // Configuración de desarrollo
  enableConsoleInDevelopment: boolean
  enableDebugMode: boolean
}

// Configuración por defecto
const defaultConfig: LoggingConfig = {
  level: 'info',
  showTimestamp: true,
  showLevel: true,
  showContext: true,
  maxLogLength: 1000,
  enableFileLogging: false,
  logFilePath: './logs/eleven-rifas.log',
  enableSentry: false,
  enableLogRocket: false,
  enableCustomAPI: false,
  enableErrorNotifications: true,
  enablePerformanceMonitoring: false,
  enableConsoleInDevelopment: true,
  enableDebugMode: false
}

// Obtener configuración desde variables de entorno
export function getLoggingConfig(): LoggingConfig {
  const env = process.env.NODE_ENV || 'development'
  
  // Configuración base según entorno
  const baseConfig = { ...defaultConfig }
  
  // Configuración específica por entorno
  if (env === 'production') {
    baseConfig.level = 'error'
    baseConfig.enableConsoleInDevelopment = false
    baseConfig.enableDebugMode = false
    baseConfig.enableErrorNotifications = true
    baseConfig.enablePerformanceMonitoring = true
  } else if (env === 'development') {
    baseConfig.level = 'info'
    baseConfig.enableConsoleInDevelopment = true
    baseConfig.enableDebugMode = true
    baseConfig.enableErrorNotifications = false
    baseConfig.enablePerformanceMonitoring = false
  } else if (env === 'test') {
    baseConfig.level = 'warn'
    baseConfig.enableConsoleInDevelopment = false
    baseConfig.enableDebugMode = false
    baseConfig.enableErrorNotifications = false
    baseConfig.enablePerformanceMonitoring = false
  }
  
  // Sobrescribir con variables de entorno
  if (process.env.LOG_LEVEL) {
    const envLevel = process.env.LOG_LEVEL.toLowerCase()
    if (['error', 'warn', 'info', 'debug'].includes(envLevel)) {
      baseConfig.level = envLevel as any
    }
  }
  
  if (process.env.NEXT_PUBLIC_LOG_LEVEL) {
    const envLevel = process.env.NEXT_PUBLIC_LOG_LEVEL.toLowerCase()
    if (['error', 'warn', 'info', 'debug'].includes(envLevel)) {
      baseConfig.level = envLevel as any
    }
  }
  
  if (process.env.LOG_ENABLE_FILE_LOGGING) {
    baseConfig.enableFileLogging = process.env.LOG_ENABLE_FILE_LOGGING === 'true'
  }
  
  if (process.env.LOG_FILE_PATH) {
    baseConfig.logFilePath = process.env.LOG_FILE_PATH
  }
  
  if (process.env.LOG_MAX_LENGTH) {
    const maxLength = parseInt(process.env.LOG_MAX_LENGTH)
    if (!isNaN(maxLength)) {
      baseConfig.maxLogLength = maxLength
    }
  }
  
  if (process.env.LOG_ENABLE_SENTRY) {
    baseConfig.enableSentry = process.env.LOG_ENABLE_SENTRY === 'true'
  }
  
  if (process.env.LOG_ENABLE_LOGROCKET) {
    baseConfig.enableLogRocket = process.env.LOG_ENABLE_LOGROCKET === 'true'
  }
  
  if (process.env.LOG_ENABLE_CUSTOM_API) {
    baseConfig.enableCustomAPI = process.env.LOG_ENABLE_CUSTOM_API === 'true'
  }
  
  if (process.env.LOG_ENABLE_ERROR_NOTIFICATIONS) {
    baseConfig.enableErrorNotifications = process.env.LOG_ENABLE_ERROR_NOTIFICATIONS === 'true'
  }
  
  if (process.env.LOG_ENABLE_PERFORMANCE_MONITORING) {
    baseConfig.enablePerformanceMonitoring = process.env.LOG_ENABLE_PERFORMANCE_MONITORING === 'true'
  }
  
  if (process.env.LOG_ENABLE_DEBUG_MODE) {
    baseConfig.enableDebugMode = process.env.LOG_ENABLE_DEBUG_MODE === 'true'
  }
  
  return baseConfig
}

// Configuración para el cliente (Next.js)
export function getClientLoggingConfig(): Partial<LoggingConfig> {
  // Solo exportar configuraciones seguras para el cliente
  const config = getLoggingConfig()
  
  return {
    level: config.level,
    showTimestamp: config.showTimestamp,
    showLevel: config.showLevel,
    showContext: config.showContext,
    maxLogLength: config.maxLogLength,
    enableDebugMode: config.enableDebugMode
  }
}

// Configuración para el servidor (Next.js)
export function getServerLoggingConfig(): LoggingConfig {
  return getLoggingConfig()
}

// Variables de entorno recomendadas para .env.local
export const recommendedEnvVars = `
# =====================================================
# 🎯 CONFIGURACIÓN DE LOGGING - ELEVEN RIFAS
# =====================================================

# Nivel de logging (error, warn, info, debug)
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=info

# Configuración de archivos
LOG_ENABLE_FILE_LOGGING=false
LOG_FILE_PATH=./logs/eleven-rifas.log
LOG_MAX_LENGTH=1000

# Servicios externos
LOG_ENABLE_SENTRY=false
LOG_ENABLE_LOGROCKET=false
LOG_ENABLE_CUSTOM_API=false

# Notificaciones y monitoreo
LOG_ENABLE_ERROR_NOTIFICATIONS=true
LOG_ENABLE_PERFORMANCE_MONITORING=false

# Modo debug
LOG_ENABLE_DEBUG_MODE=false

# =====================================================
# 🚨 CONFIGURACIONES DE PRODUCCIÓN
# =====================================================
# En producción, usar:
# LOG_LEVEL=error
# LOG_ENABLE_ERROR_NOTIFICATIONS=true
# LOG_ENABLE_PERFORMANCE_MONITORING=true
# LOG_ENABLE_DEBUG_MODE=false

# =====================================================
# 🔧 CONFIGURACIONES DE DESARROLLO
# =====================================================
# En desarrollo, usar:
# LOG_LEVEL=info
# LOG_ENABLE_DEBUG_MODE=true
# LOG_ENABLE_ERROR_NOTIFICATIONS=false
`

// Configuración para diferentes entornos
export const environmentConfigs = {
  development: {
    level: 'info',
    enableDebugMode: true,
    enableConsoleInDevelopment: true,
    enableErrorNotifications: false
  },
  
  staging: {
    level: 'warn',
    enableDebugMode: false,
    enableConsoleInDevelopment: false,
    enableErrorNotifications: true
  },
  
  production: {
    level: 'error',
    enableDebugMode: false,
    enableConsoleInDevelopment: false,
    enableErrorNotifications: true,
    enablePerformanceMonitoring: true
  },
  
  test: {
    level: 'warn',
    enableDebugMode: false,
    enableConsoleInDevelopment: false,
    enableErrorNotifications: false
  }
}

// Función para validar configuración
export function validateLoggingConfig(config: LoggingConfig): string[] {
  const errors: string[] = []
  
  if (!['error', 'warn', 'info', 'debug'].includes(config.level)) {
    errors.push(`Nivel de logging inválido: ${config.level}`)
  }
  
  if (config.maxLogLength < 100 || config.maxLogLength > 10000) {
    errors.push(`Longitud máxima de log inválida: ${config.maxLogLength}`)
  }
  
  if (config.enableFileLogging && !config.logFilePath) {
    errors.push('Ruta de archivo de log requerida cuando file logging está habilitado')
  }
  
  return errors
}

// Función para obtener configuración optimizada
export function getOptimizedLoggingConfig(): LoggingConfig {
  const config = getLoggingConfig()
  const errors = validateLoggingConfig(config)
  
  if (errors.length > 0) {
    console.warn('⚠️ Errores en configuración de logging:', errors)
    console.warn('⚠️ Usando configuración por defecto')
    return defaultConfig
  }
  
  return config
}
