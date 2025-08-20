/**
 * ⚙️ MÓDULO DE CONFIGURACIÓN
 * 
 * Índice principal del módulo de configuración
 */

// Importar configuraciones específicas
const supabase = require('./supabase');
const database = require('./database');
const app = require('./app');
const logging = require('./logging');

// Configuración principal
const config = {
  supabase,
  database,
  app,
  logging
};

module.exports = config;
