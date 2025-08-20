#!/usr/bin/env node

/**
 * 🛠️ TOOLBOX - CAJA DE HERRAMIENTAS PARA BASE DE DATOS
 * 
 * Sistema completo de control remoto y ejecución SQL para Eleven Rifas
 * Permite ejecutar queries, modificar estructura, insertar datos y más
 * 
 * Estructura modular:
 * - database/     - Funciones de base de datos
 * - utils/        - Utilidades y helpers
 * - config/       - Configuración centralizada
 */

// Importar módulos
const database = require('./database');
const logger = require('./utils/logger');
const config = require('./config');

// Crear cliente de Supabase
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Inicializar el cliente en el módulo de base de datos
database.initializeClient(supabase);

// ============================================================================
// 🚀 FUNCIÓN PRINCIPAL
// ============================================================================

/**
 * Función principal que ejecuta todas las operaciones
 */
async function main() {
  logger.info('🛠️  TOOLBOX - CAJA DE HERRAMIENTAS PARA BASE DE DATOS');
  logger.info(`📅 Fecha: ${new Date().toLocaleString('es-ES')}`);
  logger.info(`🔗 Supabase: ${config.supabase.url}`);
  logger.info(`🎯 Proyecto: ${config.app.name} v${config.app.version}`);
  
  try {
    // 1. Verificar estado actual
    await database.checkDatabaseStatus();
    
    // 2. Verificar estructura
    await database.checkTableStructure();
    
    // 3. Intentar agregar campos
    await database.addMissingColumns();
    
    // 4. Crear índices
    await database.createIndexes();
    
    // 5. Insertar datos
    await database.insertSampleData();
    
    // 6. Verificación final
    await database.checkDatabaseStatus();
    
    logger.success('🎉 ¡TOOLBOX ACTIVADO Y FUNCIONANDO!');
    logger.info('📋 Comandos disponibles:');
    logger.info('   • node toolbox/toolbox.js --query "TU_QUERY_AQUI"');
    logger.info('   • node toolbox/toolbox.js --validate-query "TU_QUERY_AQUI"');
    logger.info('   • node toolbox/toolbox.js --test-connection');
    logger.info('   • node toolbox/toolbox.js --check');
    logger.info('   • node toolbox/toolbox.js --setup');
    
  } catch (error) {
    logger.error('❌ Error fatal', { error: error.message });
  }
}

// ============================================================================
// 📋 MANEJO DE ARGUMENTOS DE LÍNEA DE COMANDOS
// ============================================================================

if (process.argv.includes('--query')) {
  const queryIndex = process.argv.indexOf('--query');
  const query = process.argv[queryIndex + 1];
  
  if (query) {
    logger.info('🎯 Ejecutando query desde línea de comandos...');
    database.executeQuery(query, 'Query ejecutada desde línea de comandos')
      .then(result => {
        if (result.success) {
          logger.success('✅ Query ejecutada exitosamente');
          if (result.affectedRows !== undefined) {
            logger.info(`📊 Filas afectadas: ${result.affectedRows}`);
          }
          if (result.data) {
            logger.info('📋 Resultados:', result.data);
          }
        } else {
          logger.error('❌ Query falló:', result.error);
          if (result.details) {
            logger.error('🔍 Detalles:', result.details);
          }
        }
        process.exit(result.success ? 0 : 1);
      })
      .catch(error => {
        logger.error('❌ Error fatal al ejecutar query:', error.message);
        process.exit(1);
      });
  } else {
    logger.error('❌ Debes especificar una query después de --query');
    logger.info('📝 Ejemplo: node toolbox.js --query "SELECT * FROM rifas LIMIT 5"');
    process.exit(1);
  }
} else if (process.argv.includes('--check')) {
  logger.info('🔍 Verificando estado de la base de datos...');
  database.checkDatabaseStatus();
} else if (process.argv.includes('--setup')) {
  logger.info('🚀 Ejecutando setup completo de la base de datos...');
  database.addMissingColumns()
    .then(() => database.createIndexes())
    .then(() => database.insertSampleData())
    .then(() => logger.success('✅ Setup completado exitosamente'))
    .catch(error => {
      logger.error('❌ Error durante el setup:', error.message);
      process.exit(1);
    });
} else if (process.argv.includes('--test-connection')) {
  logger.info('🔍 Probando conexión a la base de datos...');
  database.testConnection()
    .then(result => {
      if (result.success) {
        logger.success('✅ Conexión exitosa:', result.message);
      } else {
        logger.error('❌ Error de conexión:', result.error);
      }
      process.exit(result.success ? 0 : 1);
    });
} else if (process.argv.includes('--validate-query')) {
  const queryIndex = process.argv.indexOf('--validate-query');
  const query = process.argv[queryIndex + 1];
  
  if (query) {
    const validation = database.validateQuery(query);
    if (validation.isValid) {
      logger.success('✅ Query válida:', validation.command);
      logger.info('📝 Query:', validation.query);
    } else {
      logger.error('❌ Query inválida:', validation.error);
    }
    process.exit(validation.isValid ? 0 : 1);
  } else {
    logger.error('❌ Debes especificar una query después de --validate-query');
    process.exit(1);
  }
} else if (process.argv.includes('--optimize')) {
  database.optimizeDatabase();
} else if (process.argv.includes('--report')) {
  database.generateDataReport();
} else if (process.argv.includes('--backup')) {
  database.backupImportantData();
} else if (require.main === module) {
  main().catch((error) => {
    logger.error('Error no manejado', { error: error.message });
    process.exit(1);
  });
}

// ============================================================================
// 📤 EXPORTACIÓN DE FUNCIONES
// ============================================================================

module.exports = {
  // Funciones principales
  main,
  
  // Módulos completos
  database,
  logger,
  config,
  
  // Funciones específicas (alias para compatibilidad)
  executeQuery: database.executeQuery,
  checkDatabaseStatus: database.checkDatabaseStatus,
  checkTableStructure: database.checkTableStructure,
  addMissingColumns: database.addMissingColumns,
  createIndexes: database.createIndexes,
  insertSampleData: database.insertSampleData,
  
  // Funciones de validación y utilidades
  validateQuery: database.validateQuery,
  testConnection: database.testConnection,
  executeQueryWithResults: database.executeQueryWithResults,
  executeMultipleQueries: database.executeMultipleQueries
};
