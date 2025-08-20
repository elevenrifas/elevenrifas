/**
 * 📦 ÍNDICE DE TOOLBOX
 * 
 * Archivo principal que exporta todas las funciones de la caja de herramientas
 * Permite importar fácilmente: const toolbox = require('./toolbox');
 */

// Importar todos los módulos
const mainToolbox = require('./toolbox');
const config = require('./config');
const utils = require('./utils');

// Exportar todo en un solo objeto
module.exports = {
  // Funciones principales de la toolbox
  ...mainToolbox,
  
  // Configuración
  config,
  
  // Utilidades
  utils,
  
  // Acceso directo a funciones específicas
  executeQuery: mainToolbox.executeQuery,
  checkDatabaseStatus: mainToolbox.checkDatabaseStatus,
  checkTableStructure: mainToolbox.checkTableStructure,
  addMissingColumns: mainToolbox.addMissingColumns,
  createIndexes: mainToolbox.createIndexes,
  insertSampleData: mainToolbox.insertSampleData,
  
  // Utilidades específicas
  generateSlug: utils.generateSlug,
  validateImageUrl: utils.validateImageUrl,
  formatPrice: utils.formatPrice,
  validateRifaFields: utils.validateRifaFields,
  sanitizeInput: utils.sanitizeInput,
  generateSampleRifa: utils.generateSampleRifa,
  objectToTable: utils.objectToTable
};

// También exportar por separado para compatibilidad
module.exports.toolbox = mainToolbox;
module.exports.config = config;
module.exports.utils = utils;
