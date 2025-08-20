// =====================================================
// ⚙️ CONFIGURACIÓN DE BASE DE DATOS - ELEVEN RIFAS
// =====================================================
// Configuración centralizada para todas las operaciones de BD
// =====================================================

export const DB_CONFIG = {
  // Configuración de Supabase
  SUPABASE: {
    URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Configuración de consultas
  QUERIES: {
    // Límites por defecto
    LIMIT_DEFAULT: 50,
    LIMIT_MAX: 1000,
    
    // Timeouts
    TIMEOUT_DEFAULT: 30000, // 30 segundos
    TIMEOUT_SHORT: 10000,   // 10 segundos
    TIMEOUT_LONG: 60000,    // 1 minuto
    
    // Reintentos
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,      // 1 segundo
  },

  // Configuración de paginación
  PAGINATION: {
    PAGE_SIZE_DEFAULT: 20,
    PAGE_SIZE_MAX: 100,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // Configuración de cache
  CACHE: {
    // Tiempo de vida del cache (en segundos)
    TTL_RIFAS: 300,        // 5 minutos
    TTL_CATEGORIAS: 600,   // 10 minutos
    TTL_USUARIOS: 1800,    // 30 minutos
    TTL_ESTADISTICAS: 3600, // 1 hora
    
    // Tamaño máximo del cache
    MAX_SIZE: 1000,
    
    // Limpiar cache cada X segundos
    CLEANUP_INTERVAL: 300, // 5 minutos
  },

  // Configuración de logging
  LOGGING: {
    // Niveles de log
    LEVEL: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
    
    // Formato de logs
    FORMAT: 'structured',
    
    // Incluir datos sensibles en logs (solo desarrollo)
    INCLUDE_SENSITIVE_DATA: process.env.NODE_ENV === 'development',
    
    // Logs de performance
    LOG_PERFORMANCE: true,
    PERFORMANCE_THRESHOLD: 1000, // ms
  },

  // Configuración de validaciones
  VALIDATION: {
    // Longitudes máximas
    MAX_LENGTH: {
      TITULO: 200,
      DESCRIPCION: 1000,
      NOMBRE: 100,
      EMAIL: 255,
      TELEFONO: 20,
      CEDULA: 20,
      REFERENCIA: 100,
      NOTAS: 2000,
    },
    
    // Valores mínimos
    MIN_VALUES: {
      PRECIO_TICKET: 0.01,
      CANTIDAD_TICKETS: 1,
      MONTO_PAGO: 0.01,
    },
    
    // Valores máximos
    MAX_VALUES: {
      CANTIDAD_TICKETS: 100,
      MONTO_PAGO: 10000,
      TASA_CAMBIO: 1000,
    },
  },

  // Configuración de seguridad
  SECURITY: {
    // Rate limiting
    RATE_LIMIT: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 60000, // 1 minuto
    },
    
    // Validación de UUIDs
    VALIDATE_UUIDS: true,
    
    // Sanitización de inputs
    SANITIZE_INPUTS: true,
    
    // Validación de permisos
    VALIDATE_PERMISSIONS: true,
  },

  // Configuración de transacciones
  TRANSACTIONS: {
    // Timeout de transacciones
    TIMEOUT: 30000, // 30 segundos
    
    // Rollback automático en error
    AUTO_ROLLBACK: true,
    
    // Logging de transacciones
    LOG_TRANSACTIONS: true,
    
    // Retry en transacciones fallidas
    RETRY_FAILED: true,
    MAX_RETRIES: 2,
  },

  // Configuración de estadísticas
  STATISTICS: {
    // Intervalo de recolección de métricas
    COLLECTION_INTERVAL: 60000, // 1 minuto
    
    // Retención de métricas
    RETENTION_DAYS: 30,
    
    // Métricas habilitadas
    ENABLED_METRICS: [
      'query_performance',
      'connection_pool',
      'error_rates',
      'response_times',
      'throughput',
    ],
  },

  // Configuración de mantenimiento
  MAINTENANCE: {
    // Limpieza automática
    AUTO_CLEANUP: true,
    
    // Intervalo de limpieza
    CLEANUP_INTERVAL: 3600000, // 1 hora
    
    // Limpiar registros antiguos
    CLEANUP_OLD_RECORDS: true,
    OLD_RECORDS_DAYS: 90,
    
    // Optimización de índices
    OPTIMIZE_INDEXES: true,
    INDEX_OPTIMIZATION_INTERVAL: 86400000, // 24 horas
  },
}

// =====================================================
// VALIDACIÓN DE CONFIGURACIÓN
// =====================================================

export function validarConfiguracionDB(): { valida: boolean; errores: string[] } {
  const errores: string[] = []
  
  // Validar variables de entorno requeridas
  if (!DB_CONFIG.SUPABASE.URL) {
    errores.push('NEXT_PUBLIC_SUPABASE_URL no está configurada')
  }
  
  if (!DB_CONFIG.SUPABASE.ANON_KEY) {
    errores.push('NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada')
  }
  
  // Validar configuración de consultas
  if (DB_CONFIG.QUERIES.LIMIT_DEFAULT > DB_CONFIG.QUERIES.LIMIT_MAX) {
    errores.push('LIMIT_DEFAULT no puede ser mayor que LIMIT_MAX')
  }
  
  if (DB_CONFIG.QUERIES.TIMEOUT_DEFAULT > DB_CONFIG.QUERIES.TIMEOUT_LONG) {
    errores.push('TIMEOUT_DEFAULT no puede ser mayor que TIMEOUT_LONG')
  }
  
  // Validar configuración de paginación
  if (DB_CONFIG.PAGINATION.PAGE_SIZE_DEFAULT > DB_CONFIG.PAGINATION.PAGE_SIZE_MAX) {
    errores.push('PAGE_SIZE_DEFAULT no puede ser mayor que PAGE_SIZE_MAX')
  }
  
  // Validar configuración de cache
  if (DB_CONFIG.CACHE.TTL_RIFAS <= 0) {
    errores.push('TTL_RIFAS debe ser mayor que 0')
  }
  
  // Validar configuración de validaciones
  if (DB_CONFIG.VALIDATION.MIN_VALUES.PRECIO_TICKET <= 0) {
    errores.push('MIN_VALUES.PRECIO_TICKET debe ser mayor que 0')
  }
  
  if (DB_CONFIG.VALIDATION.MAX_VALUES.CANTIDAD_TICKETS <= 0) {
    errores.push('MAX_VALUES.CANTIDAD_TICKETS debe ser mayor que 0')
  }
  
  return {
    valida: errores.length === 0,
    errores
  }
}

// =====================================================
// CONFIGURACIÓN POR AMBIENTE
// =====================================================

export const ENV_CONFIG = {
  development: {
    LOGGING_LEVEL: 'debug',
    INCLUDE_SENSITIVE_DATA: true,
    LOG_PERFORMANCE: true,
    AUTO_CLEANUP: false,
    CACHE_TTL_MULTIPLIER: 0.1, // Cache más corto en desarrollo
  },
  
  production: {
    LOGGING_LEVEL: 'error',
    INCLUDE_SENSITIVE_DATA: false,
    LOG_PERFORMANCE: false,
    AUTO_CLEANUP: true,
    CACHE_TTL_MULTIPLIER: 1.0, // Cache normal en producción
  },
  
  test: {
    LOGGING_LEVEL: 'warn',
    INCLUDE_SENSITIVE_DATA: false,
    LOG_PERFORMANCE: false,
    AUTO_CLEANUP: false,
    CACHE_TTL_MULTIPLIER: 0.01, // Cache muy corto en tests
  }
}

// =====================================================
// FUNCIONES DE CONFIGURACIÓN
// =====================================================

export function obtenerConfiguracionPorAmbiente() {
  const ambiente = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[ambiente as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
}

export function obtenerTTLCache(baseTTL: number): number {
  const configAmbiente = obtenerConfiguracionPorAmbiente()
  return Math.floor(baseTTL * configAmbiente.CACHE_TTL_MULTIPLIER)
}

export function esAmbienteDesarrollo(): boolean {
  return process.env.NODE_ENV === 'development'
}

export function esAmbienteProduccion(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function esAmbienteTest(): boolean {
  return process.env.NODE_ENV === 'test'
}


