/**
 * 📝 CONFIGURACIÓN DE LOGGING
 * 
 * Configuración del sistema de logging y salida de consola
 */

module.exports = {
  // Niveles de logging disponibles
  levels: {
    ERROR: 0,
    WARNING: 1,
    INFO: 2,
    SUCCESS: 3,
    DEBUG: 4
  },
  
  // Nivel por defecto
  defaultLevel: 'INFO',
  
  // Configuración de colores
  colors: {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    gray: '\x1b[90m'
  },
  
  // Configuración de timestamps
  timestamp: {
    enabled: true,
    format: 'ISO', // ISO, short, long
    timezone: 'America/Caracas'
  },
  
  // Configuración de salida
  output: {
    console: true,
    file: false,
    filePath: './logs/toolbox.log',
    maxFileSize: '10MB',
    maxFiles: 5
  },
  
  // Configuración de formato
  format: {
    showLevel: true,
    showTimestamp: true,
    showColors: true,
    compact: false
  },
  
  // Configuración de filtros
  filters: {
    excludePaths: ['/node_modules/', '/.git/'],
    includeOnly: [],
    maxMessageLength: 1000
  },
  
  // Configuración de performance
  performance: {
    logSlowQueries: true,
    slowQueryThreshold: 1000, // ms
    logMemoryUsage: false,
    logCpuUsage: false
  }
};
