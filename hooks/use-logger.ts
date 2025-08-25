// =====================================================
// 🎯 HOOK DE LOGGING - ELEVEN RIFAS
// =====================================================
// Hook personalizado para usar el sistema de logging
// en componentes React de manera consistente
// =====================================================

import { useCallback, useRef, useEffect } from 'react'
import { log, loggerConfig } from '@/lib/utils/logger'

export interface UseLoggerOptions {
  context?: string
  componentName?: string
  enableDebug?: boolean
  logUserActions?: boolean
  logPerformance?: boolean
}

export function useLogger(options: UseLoggerOptions = {}) {
  const {
    context = 'COMPONENT',
    componentName = 'Unknown',
    enableDebug = false,
    logUserActions = true,
    logPerformance = false
  } = options

  const startTimeRef = useRef<number>(0)
  const renderCountRef = useRef<number>(0)

  // Log del montaje del componente
  useEffect(() => {
    log.info(context, `Componente ${componentName} montado`)
    
    if (enableDebug) {
      log.debug(context, `Debug habilitado para ${componentName}`)
    }

    return () => {
      log.info(context, `Componente ${componentName} desmontado`)
    }
  }, [context, componentName, enableDebug])

  // Log de re-renders (solo en debug)
  useEffect(() => {
    renderCountRef.current++
    if (enableDebug && renderCountRef.current > 1) {
      log.debug(context, `Componente ${componentName} re-renderizado (${renderCountRef.current} veces)`)
    }
  })

  // Medir performance de operaciones
  const measureOperation = useCallback((operationName: string, operation: () => any) => {
    if (!logPerformance) return operation()

    startTimeRef.current = performance.now()
    const result = operation()
    const duration = performance.now() - startTimeRef.current

    log.performance(context, `Operación ${operationName} completada en ${duration.toFixed(2)}ms`)
    return result
  }, [context, logPerformance])

  // Log de acciones del usuario
  const logUserAction = useCallback((action: string, data?: any) => {
    if (!logUserActions) return

    log.info(context, `Usuario realizó acción: ${action}`, data)
  }, [context, logUserActions])

  // Log de errores con contexto del componente
  const logError = useCallback((message: string, error?: Error, data?: any) => {
    log.error(context, `${componentName}: ${message}`, error, data)
  }, [context, componentName])

  // Log de advertencias
  const logWarning = useCallback((message: string, data?: any) => {
    log.warn(context, `${componentName}: ${message}`, data)
  }, [context, componentName])

  // Log de información
  const logInfo = useCallback((message: string, data?: any) => {
    log.info(context, `${componentName}: ${message}`, data)
  }, [context, componentName])

  // Log de debug
  const logDebug = useCallback((message: string, data?: any) => {
    if (enableDebug) {
      log.debug(context, `${componentName}: ${message}`, data)
    }
  }, [context, componentName, enableDebug])

  // Log de operaciones de base de datos
  const logDatabase = useCallback((operation: string, data?: any) => {
    log.database(`${componentName}: ${operation}`, data)
  }, [componentName])

  // Log de operaciones de autenticación
  const logAuth = useCallback((action: string, data?: any) => {
    log.auth(`${componentName}: ${action}`, data)
  }, [componentName])

  // Log de operaciones de UI
  const logUI = useCallback((action: string, data?: any) => {
    log.ui(`${componentName}: ${action}`, data)
  }, [componentName])

  // Log de operaciones de negocio
  const logBusiness = useCallback((action: string, data?: any) => {
    log.business(`${componentName}: ${action}`, data)
  }, [componentName])

  // Log de operaciones de seguridad
  const logSecurity = useCallback((action: string, data?: any) => {
    log.security(`${componentName}: ${action}`, data)
  }, [componentName])

  // Log de operaciones de API
  const logAPI = useCallback((endpoint: string, method: string, data?: any) => {
    log.api(`${componentName}: ${method} ${endpoint}`, data)
  }, [componentName])

  // Método para cambiar configuración del logger
  const setLogLevel = useCallback((level: string) => {
    loggerConfig.setLogLevel(level)
    logInfo(`Nivel de logging cambiado a: ${level}`)
  }, [logInfo])

  // Método para obtener configuración
  const getLoggerConfig = useCallback(() => {
    return loggerConfig.getConfig()
  }, [])

  // Método para limpiar logs
  const cleanupLogs = useCallback(() => {
    log.cleanup()
    logInfo('Logs limpiados')
  }, [logInfo])

  // Método para exportar logs
  const exportLogs = useCallback(() => {
    log.exportLogs()
    logInfo('Logs exportados')
  }, [logInfo])

  return {
    // Métodos de logging
    logError,
    logWarning,
    logInfo,
    logDebug,
    logUserAction,
    logDatabase,
    logAuth,
    logUI,
    logBusiness,
    logSecurity,
    logAPI,
    
    // Utilidades
    measureOperation,
    setLogLevel,
    getLoggerConfig,
    cleanupLogs,
    exportLogs,
    
    // Estado
    isDebugEnabled: enableDebug,
    renderCount: renderCountRef.current
  }
}

// Hook especializado para componentes de tabla
export function useTableLogger(tableName: string, options: UseLoggerOptions = {}) {
  const logger = useLogger({
    context: 'TABLE',
    componentName: tableName,
    ...options
  })

  // Métodos específicos para tablas
  const logTableAction = useCallback((action: string, data?: any) => {
    logger.logInfo(`Acción de tabla: ${action}`, data)
  }, [logger])

  const logTableError = useCallback((action: string, error?: Error, data?: any) => {
    logger.logError(`Error en tabla: ${action}`, error, data)
  }, [logger])

  const logTablePerformance = useCallback((operation: string, duration: number) => {
    logger.logInfo(`Performance de tabla: ${operation} completado en ${duration.toFixed(2)}ms`)
  }, [logger])

  return {
    ...logger,
    logTableAction,
    logTableError,
    logTablePerformance
  }
}

// Hook especializado para componentes de formulario
export function useFormLogger(formName: string, options: UseLoggerOptions = {}) {
  const logger = useLogger({
    context: 'FORM',
    componentName: formName,
    ...options
  })

  // Métodos específicos para formularios
  const logFormAction = useCallback((action: string, data?: any) => {
    logger.logInfo(`Acción de formulario: ${action}`, data)
  }, [logger])

  const logFormValidation = useCallback((field: string, isValid: boolean, message?: string) => {
    logger.logDebug(`Validación de campo ${field}: ${isValid ? 'válido' : 'inválido'}`, { message })
  }, [logger])

  const logFormSubmission = useCallback((success: boolean, data?: any, errors?: any) => {
    if (success) {
      logger.logInfo('Formulario enviado exitosamente', data)
    } else {
      logger.logError('Error al enviar formulario', undefined, { data, errors })
    }
  }, [logger])

  return {
    ...logger,
    logFormAction,
    logFormValidation,
    logFormSubmission
  }
}

// Hook especializado para componentes de autenticación
export function useAuthLogger(options: UseLoggerOptions = {}) {
  const logger = useLogger({
    context: 'AUTH',
    componentName: 'Authentication',
    ...options
  })

  // Métodos específicos para autenticación
  const logLoginAttempt = useCallback((email: string, success: boolean, error?: string) => {
    if (success) {
      logger.logAuth('Login exitoso', { email })
    } else {
      logger.logError('Login fallido', undefined, { email, error })
    }
  }, [logger])

  const logLogout = useCallback((userId?: string) => {
    logger.logAuth('Logout realizado', { userId })
  }, [logger])

  const logPermissionCheck = useCallback((resource: string, action: string, granted: boolean) => {
    logger.logSecurity(`Verificación de permiso: ${action} en ${resource}`, { granted })
  }, [logger])

  return {
    ...logger,
    logLoginAttempt,
    logLogout,
    logPermissionCheck
  }
}
