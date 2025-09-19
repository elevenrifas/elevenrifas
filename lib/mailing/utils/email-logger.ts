// =====================================================
// 📧 LOGGER DE EMAIL - ELEVEN RIFAS
// =====================================================
// Sistema de logging para el servicio de email
// =====================================================

import { EmailLogEntry, LoggingConfig } from '../types'

/**
 * Configuración por defecto del logger
 */
const DEFAULT_LOGGING_CONFIG: LoggingConfig = {
  level: 'info',
  enableConsole: true,
  enableFile: false,
  enableDatabase: false,
  maxLogEntries: 1000
}

export class EmailLogger {
  private config: LoggingConfig
  private logs: EmailLogEntry[] = []

  constructor(config: Partial<LoggingConfig> = {}) {
    this.config = { ...DEFAULT_LOGGING_CONFIG, ...config }
  }

  /**
   * Actualiza la configuración del logger
   */
  updateConfig(config: Partial<LoggingConfig>): void {
    this.config = { ...this.config, ...config }
  }

  /**
   * Registra un mensaje de log
   */
  private log(level: EmailLogEntry['level'], message: string, data?: any, messageId?: string, email?: string): void {
    const logEntry: EmailLogEntry = {
      id: this.generateLogId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      messageId,
      email
    }

    // Agregar a la lista de logs
    this.logs.push(logEntry)

    // Mantener solo los últimos N logs
    if (this.logs.length > this.config.maxLogEntries) {
      this.logs = this.logs.slice(-this.config.maxLogEntries)
    }

    // Mostrar en consola si está habilitado
    if (this.config.enableConsole) {
      this.logToConsole(logEntry)
    }

    // Guardar en archivo si está habilitado
    if (this.config.enableFile) {
      this.logToFile(logEntry)
    }

    // Guardar en base de datos si está habilitado
    if (this.config.enableDatabase) {
      this.logToDatabase(logEntry)
    }
  }

  /**
   * Log de nivel debug
   */
  debug(message: string, data?: any, messageId?: string, email?: string): void {
    if (this.shouldLog('debug')) {
      this.log('debug', message, data, messageId, email)
    }
  }

  /**
   * Log de nivel info
   */
  info(message: string, data?: any, messageId?: string, email?: string): void {
    if (this.shouldLog('info')) {
      this.log('info', message, data, messageId, email)
    }
  }

  /**
   * Log de nivel warn
   */
  warn(message: string, data?: any, messageId?: string, email?: string): void {
    if (this.shouldLog('warn')) {
      this.log('warn', message, data, messageId, email)
    }
  }

  /**
   * Log de nivel error
   */
  error(message: string, data?: any, messageId?: string, email?: string): void {
    if (this.shouldLog('error')) {
      this.log('error', message, data, messageId, email)
    }
  }

  /**
   * Verifica si debe registrar el log según el nivel
   */
  private shouldLog(level: EmailLogEntry['level']): boolean {
    const levels = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const logLevelIndex = levels.indexOf(level)
    
    return logLevelIndex >= currentLevelIndex
  }

  /**
   * Muestra el log en consola
   */
  private logToConsole(logEntry: EmailLogEntry): void {
    const timestamp = new Date(logEntry.timestamp).toLocaleString('es-ES')
    const prefix = `[${timestamp}] [${logEntry.level.toUpperCase()}]`
    
    switch (logEntry.level) {
      case 'debug':
        console.debug(`${prefix} ${logEntry.message}`, logEntry.data)
        break
      case 'info':
        console.info(`${prefix} ${logEntry.message}`, logEntry.data)
        break
      case 'warn':
        console.warn(`${prefix} ${logEntry.message}`, logEntry.data)
        break
      case 'error':
        console.error(`${prefix} ${logEntry.message}`, logEntry.data)
        break
    }
  }

  /**
   * Guarda el log en archivo
   */
  private logToFile(logEntry: EmailLogEntry): void {
    // TODO: Implementar escritura a archivo
    // Por ahora solo se muestra en consola
    console.log('File logging not implemented yet')
  }

  /**
   * Guarda el log en base de datos
   */
  private logToDatabase(logEntry: EmailLogEntry): void {
    // TODO: Implementar guardado en base de datos
    // Por ahora solo se muestra en consola
    console.log('Database logging not implemented yet')
  }

  /**
   * Genera un ID único para el log
   */
  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtiene todos los logs
   */
  getLogs(): EmailLogEntry[] {
    return [...this.logs]
  }

  /**
   * Obtiene logs por nivel
   */
  getLogsByLevel(level: EmailLogEntry['level']): EmailLogEntry[] {
    return this.logs.filter(log => log.level === level)
  }

  /**
   * Obtiene logs por email
   */
  getLogsByEmail(email: string): EmailLogEntry[] {
    return this.logs.filter(log => log.email === email)
  }

  /**
   * Obtiene logs por messageId
   */
  getLogsByMessageId(messageId: string): EmailLogEntry[] {
    return this.logs.filter(log => log.messageId === messageId)
  }

  /**
   * Obtiene logs en un rango de fechas
   */
  getLogsByDateRange(startDate: Date, endDate: Date): EmailLogEntry[] {
    return this.logs.filter(log => {
      const logDate = new Date(log.timestamp)
      return logDate >= startDate && logDate <= endDate
    })
  }

  /**
   * Obtiene estadísticas de logs
   */
  getLogStats(): {
    total: number
    byLevel: Record<EmailLogEntry['level'], number>
    byEmail: Record<string, number>
    recentErrors: number
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        debug: 0,
        info: 0,
        warn: 0,
        error: 0
      },
      byEmail: {} as Record<string, number>,
      recentErrors: 0
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)

    for (const log of this.logs) {
      // Contar por nivel
      stats.byLevel[log.level]++

      // Contar por email
      if (log.email) {
        stats.byEmail[log.email] = (stats.byEmail[log.email] || 0) + 1
      }

      // Contar errores recientes
      if (log.level === 'error' && new Date(log.timestamp) > oneHourAgo) {
        stats.recentErrors++
      }
    }

    return stats
  }

  /**
   * Limpia logs antiguos
   */
  clearOldLogs(maxAge: number = 24 * 60 * 60 * 1000): void { // 24 horas por defecto
    const cutoffDate = new Date(Date.now() - maxAge)
    this.logs = this.logs.filter(log => new Date(log.timestamp) > cutoffDate)
  }

  /**
   * Limpia todos los logs
   */
  clearAllLogs(): void {
    this.logs = []
  }

  /**
   * Exporta logs a JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  /**
   * Importa logs desde JSON
   */
  importLogs(jsonData: string): void {
    try {
      const importedLogs = JSON.parse(jsonData) as EmailLogEntry[]
      this.logs = [...this.logs, ...importedLogs]
    } catch (error) {
      this.error('Error importing logs', { error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }
}

// Instancia singleton del logger
export const emailLogger = new EmailLogger()


