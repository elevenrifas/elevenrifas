/**
 * 📝 MÓDULO DE LOGGING
 * 
 * Sistema de logging centralizado con colores y niveles
 */

const config = require('../config');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

// Niveles de logging
const levels = {
  ERROR: 0,
  WARNING: 1,
  INFO: 2,
  SUCCESS: 3,
  DEBUG: 4
};

// Configuración del logger
const loggerConfig = {
  level: levels.INFO,
  timestamp: true,
  colors: true
};

/**
 * Función base de logging
 */
function log(level, message, data = null, color = 'reset') {
  const timestamp = loggerConfig.timestamp ? `[${new Date().toISOString()}] ` : '';
  const prefix = `${timestamp}[${level.toUpperCase()}] `;
  
  if (loggerConfig.colors) {
    console.log(`${colors[color]}${prefix}${message}${colors.reset}`);
  } else {
    console.log(`${prefix}${message}`);
  }
  
  if (data && typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  }
}

/**
 * Log de error
 */
function error(message, data = null) {
  if (levels.ERROR <= loggerConfig.level) {
    log('ERROR', message, data, 'red');
  }
}

/**
 * Log de warning
 */
function warning(message, data = null) {
  if (levels.WARNING <= loggerConfig.level) {
    log('WARNING', message, data, 'yellow');
  }
}

/**
 * Log de información
 */
function info(message, data = null) {
  if (levels.INFO <= loggerConfig.level) {
    log('INFO', message, data, 'cyan');
  }
}

/**
 * Log de éxito
 */
function success(message, data = null) {
  if (levels.SUCCESS <= loggerConfig.level) {
    log('SUCCESS', message, data, 'green');
  }
}

/**
 * Log de debug
 */
function debug(message, data = null) {
  if (levels.DEBUG <= loggerConfig.level) {
    log('DEBUG', message, data, 'gray');
  }
}

/**
 * Configura el nivel de logging
 */
function setLevel(level) {
  if (typeof level === 'string' && levels[level.toUpperCase()] !== undefined) {
    loggerConfig.level = levels[level.toUpperCase()];
    info(`Nivel de logging configurado a: ${level.toUpperCase()}`);
  } else if (typeof level === 'number' && level >= 0 && level <= 4) {
    loggerConfig.level = level;
    info(`Nivel de logging configurado a: ${level}`);
  } else {
    warning('Nivel de logging inválido, usando INFO por defecto');
    loggerConfig.level = levels.INFO;
  }
}

/**
 * Habilita/deshabilita colores
 */
function setColors(enabled) {
  loggerConfig.colors = Boolean(enabled);
  info(`Colores de logging ${enabled ? 'habilitados' : 'deshabilitados'}`);
}

/**
 * Habilita/deshabilita timestamps
 */
function setTimestamp(enabled) {
  loggerConfig.timestamp = Boolean(enabled);
  info(`Timestamps ${enabled ? 'habilitados' : 'deshabilitados'}`);
}

/**
 * Log de tabla
 */
function table(data, title = 'Datos') {
  if (Array.isArray(data)) {
    console.table(data);
  } else if (typeof data === 'object') {
    console.log(`\n${title}:`);
    console.table(data);
  }
}

/**
 * Log de progreso
 */
function progress(current, total, description = '') {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 5)) + '░'.repeat(20 - Math.floor(percentage / 5));
  
  const message = `${description} [${bar}] ${percentage}% (${current}/${total})`;
  log('PROGRESS', message, null, 'blue');
}

module.exports = {
  error,
  warning,
  info,
  success,
  debug,
  table,
  progress,
  setLevel,
  setColors,
  setTimestamp,
  levels
};
