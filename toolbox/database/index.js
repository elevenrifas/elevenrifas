/**
 * 🗄️ MÓDULO DE BASE DE DATOS
 * 
 * Índice principal del módulo de base de datos
 */

const config = require('../config');

// Importar funciones específicas
const queries = require('./queries');
const structure = require('./structure');
const data = require('./data');

// Cliente de Supabase (se inicializará desde el módulo principal)
let supabase;

// Función para inicializar el cliente
function initializeClient(client) {
  supabase = client;
  
  // Establecer el cliente en todos los submódulos
  queries.setSupabaseClient(client);
  structure.setSupabaseClient(client);
  data.setSupabaseClient(client);
}

module.exports = {
  // Cliente de Supabase
  get client() { return supabase; },
  
  // Función de inicialización
  initializeClient,
  
  // Funciones de queries
  ...queries,
  
  // Funciones de estructura
  ...structure,
  
  // Funciones de datos
  ...data,
  
  // Funciones principales (alias para compatibilidad)
  executeQuery: queries.executeQuery,
  checkDatabaseStatus: data.checkDatabaseStatus,
  checkTableStructure: structure.checkTableStructure,
  addMissingColumns: structure.addMissingColumns,
  createIndexes: structure.createIndexes,
  insertSampleData: data.insertSampleData
};
