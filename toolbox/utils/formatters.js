/**
 * 🎨 MÓDULO DE FORMATEADORES
 * 
 * Funciones para formatear y presentar datos
 */

const logger = require('./logger');

/**
 * Formatea un precio para mostrar
 */
function formatPrice(price, currency = 'USD', locale = 'en-US') {
  if (typeof price !== 'number') return '$0.00';
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(price);
  } catch (error) {
    logger.warning('Error al formatear precio', { price, error: error.message });
    return `$${price.toFixed(2)}`;
  }
}

/**
 * Convierte un objeto a formato de tabla para mostrar en consola
 */
function objectToTable(obj, title = 'Datos') {
  if (!obj || typeof obj !== 'object') {
    return 'No hay datos para mostrar';
  }
  
  const rows = Object.entries(obj).map(([key, value]) => {
    let formattedValue;
    
    if (value === null || value === undefined) {
      formattedValue = 'N/A';
    } else if (typeof value === 'object') {
      formattedValue = JSON.stringify(value);
    } else if (typeof value === 'boolean') {
      formattedValue = value ? '✅ Sí' : '❌ No';
    } else {
      formattedValue = String(value);
    }
    
    return `  ${key.padEnd(20)} | ${formattedValue}`;
  });
  
  const separator = '  ' + '-'.repeat(20) + '-+-' + '-'.repeat(30);
  
  return [
    `\n${title}:`,
    separator,
    ...rows,
    separator
  ].join('\n');
}

/**
 * Formatea una fecha para mostrar
 */
function formatDate(date, format = 'long') {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida';
    }
    
    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('es-ES');
      case 'long':
        return dateObj.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      case 'iso':
        return dateObj.toISOString();
      default:
        return dateObj.toLocaleDateString('es-ES');
    }
  } catch (error) {
    logger.warning('Error al formatear fecha', { date, error: error.message });
    return 'Error de formato';
  }
}

/**
 * Formatea un número para mostrar
 */
function formatNumber(number, options = {}) {
  if (typeof number !== 'number') return '0';
  
  const defaults = {
    decimals: 2,
    thousandsSeparator: true,
    locale: 'es-ES'
  };
  
  const config = { ...defaults, ...options };
  
  try {
    return new Intl.NumberFormat(config.locale, {
      minimumFractionDigits: config.decimals,
      maximumFractionDigits: config.decimals,
      useGrouping: config.thousandsSeparator
    }).format(number);
  } catch (error) {
    logger.warning('Error al formatear número', { number, error: error.message });
    return number.toFixed(config.decimals);
  }
}

/**
 * Formatea un porcentaje
 */
function formatPercentage(value, total, decimals = 1) {
  if (typeof value !== 'number' || typeof total !== 'number' || total === 0) {
    return '0%';
  }
  
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(decimals)}%`;
}

/**
 * Formatea un tamaño de archivo
 */
function formatFileSize(bytes) {
  if (typeof bytes !== 'number' || bytes < 0) return '0 B';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Formatea un tiempo en segundos
 */
function formatDuration(seconds) {
  if (typeof seconds !== 'number' || seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Formatea un texto largo
 */
function formatLongText(text, maxLength = 100, suffix = '...') {
  if (!text || typeof text !== 'string') return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength - suffix.length) + suffix;
}

module.exports = {
  formatPrice,
  objectToTable,
  formatDate,
  formatNumber,
  formatPercentage,
  formatFileSize,
  formatDuration,
  formatLongText
};
