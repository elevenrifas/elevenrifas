/**
 * 🔧 MÓDULO DE UTILIDADES
 * 
 * Índice principal del módulo de utilidades
 */

// Importar todas las utilidades
const logger = require('./logger');
const validators = require('./validators');
const formatters = require('./formatters');
const generators = require('./generators');

module.exports = {
  // Logger principal
  logger,
  
  // Utilidades de validación
  ...validators,
  
  // Utilidades de formateo
  ...formatters,
  
  // Utilidades de generación
  ...generators,
  
  // Alias para compatibilidad
  generateSlug: generators.generateSlug,
  validateImageUrl: validators.validateImageUrl,
  formatPrice: formatters.formatPrice,
  validateRifaFields: validators.validateRifaFields,
  sanitizeInput: validators.sanitizeInput,
  generateSampleRifa: generators.generateSampleRifa,
  objectToTable: formatters.objectToTable
};
