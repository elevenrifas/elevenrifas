/**
 * 🔍 MÓDULO DE QUERIES SQL
 * 
 * Maneja la ejecución de queries SQL personalizadas usando la función exec_sql
 */

const config = require('../config');
const logger = require('../utils/logger');

// Cliente de Supabase (se importará desde el módulo principal)
let supabase;

// Función para establecer el cliente de Supabase
function setSupabaseClient(client) {
  supabase = client;
}

/**
 * Ejecuta una query SQL personalizada usando exec_sql
 */
async function executeQuery(query, description = '') {
  if (!supabase) {
    logger.error('Cliente de Supabase no inicializado');
    return { success: false, error: 'Cliente de Supabase no inicializado' };
  }
  
  if (!query || typeof query !== 'string') {
    return { success: false, error: 'Query debe ser una cadena de texto válida' };
  }
  
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return { success: false, error: 'Query no puede estar vacía' };
  }
  
  logger.info('Ejecutando query personalizada...', { query: trimmedQuery, description });
  
  try {
    // Usar la función exec_sql para ejecutar cualquier query SQL
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: trimmedQuery 
    });
    
    if (error) {
      logger.error('Error al ejecutar query', { error: error.message, query: trimmedQuery });
      return { 
        success: false, 
        error: error.message, 
        query: trimmedQuery,
        details: error
      };
    }
    
    // Verificar si la función exec_sql existe
    if (!data) {
      logger.error('Función exec_sql no disponible o no retornó datos');
      return { 
        success: false, 
        error: 'Función exec_sql no disponible. Ejecuta primero el script 09_create_sql_function.sql',
        query: trimmedQuery
      };
    }
    
    // Verificar si la query fue exitosa
    if (data.success === false) {
      logger.error('Query falló', { error: data.error, query: trimmedQuery });
      return { 
        success: false, 
        error: data.error || 'Query falló sin mensaje de error específico',
        query: trimmedQuery,
        details: data
      };
    }
    
    logger.success('Query ejecutada exitosamente', { 
      query: trimmedQuery, 
      affectedRows: data.affected_rows,
      message: data.message 
    });
    
    return { 
      success: true, 
      data: data,
      affectedRows: data.affected_rows,
      message: data.message,
      query: trimmedQuery
    };
    
  } catch (error) {
    logger.error('Error inesperado al ejecutar query', { 
      error: error.message, 
      query: trimmedQuery,
      stack: error.stack 
    });
    
    return { 
      success: false, 
      error: error.message,
      query: trimmedQuery,
      details: error
    };
  }
}

/**
 * Ejecuta múltiples queries en secuencia
 */
async function executeMultipleQueries(queries, description = '') {
  if (!Array.isArray(queries) || queries.length === 0) {
    return { 
      success: false, 
      error: 'Debes proporcionar un array de queries válido' 
    };
  }
  
  logger.info('Ejecutando múltiples queries', { count: queries.length, description });
  
  const results = [];
  let successCount = 0;
  let failedCount = 0;
  
  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    const queryDescription = `Query ${i + 1} de ${queries.length}`;
    
    try {
      logger.info(`Ejecutando ${queryDescription}...`);
      const result = await executeQuery(query, queryDescription);
      
      results.push({ 
        query, 
        success: result.success, 
        error: result.error,
        index: i + 1,
        total: queries.length
      });
      
      if (result.success) {
        successCount++;
        logger.success(`${queryDescription} completada exitosamente`);
      } else {
        failedCount++;
        logger.error(`${queryDescription} falló: ${result.error}`);
      }
      
    } catch (error) {
      failedCount++;
      results.push({ 
        query, 
        success: false, 
        error: error.message,
        index: i + 1,
        total: queries.length
      });
      logger.error(`${queryDescription} falló con error inesperado: ${error.message}`);
    }
  }
  
  const summary = {
    total: queries.length,
    success: successCount,
    failed: failedCount,
    successRate: Math.round((successCount / queries.length) * 100)
  };
  
  logger.info('Resumen de múltiples queries', summary);
  
  return {
    success: failedCount === 0,
    results,
    summary
  };
}

/**
 * Valida la sintaxis de una query SQL
 */
function validateQuery(query) {
  if (!query || typeof query !== 'string') {
    return { isValid: false, error: 'Query debe ser una cadena de texto' };
  }
  
  const trimmedQuery = query.trim();
  if (trimmedQuery.length === 0) {
    return { isValid: false, error: 'Query no puede estar vacía' };
  }
  
  // Validaciones básicas
  const validCommands = ['select', 'insert', 'update', 'delete', 'alter', 'create', 'drop', 'truncate', 'grant', 'revoke'];
  const command = trimmedQuery.toLowerCase().split(' ')[0];
  
  if (!validCommands.includes(command)) {
    return { isValid: false, error: `Comando SQL no válido: ${command}` };
  }
  
  // Validaciones específicas por comando
  if (command === 'select' && !trimmedQuery.toLowerCase().includes('from')) {
    return { isValid: false, error: 'Query SELECT debe incluir FROM' };
  }
  
  if (command === 'insert' && !trimmedQuery.toLowerCase().includes('into')) {
    return { isValid: false, error: 'Query INSERT debe incluir INTO' };
  }
  
  if (command === 'update' && !trimmedQuery.toLowerCase().includes('set')) {
    return { isValid: false, error: 'Query UPDATE debe incluir SET' };
  }
  
  if (command === 'delete' && !trimmedQuery.toLowerCase().includes('from')) {
    return { isValid: false, error: 'Query DELETE debe incluir FROM' };
  }
  
  return { isValid: true, command, query: trimmedQuery };
}

/**
 * Ejecuta una query de prueba para verificar conectividad
 */
async function testConnection() {
  if (!supabase) {
    return { success: false, error: 'Cliente de Supabase no inicializado' };
  }
  
  try {
    const result = await executeQuery('SELECT 1 as test_connection');
    return { 
      success: result.success, 
      message: 'Conexión a base de datos verificada',
      details: result
    };
  } catch (error) {
    return { 
      success: false, 
      error: 'Error al verificar conexión',
      details: error.message 
    };
  }
}

/**
 * Ejecuta una query y retorna los resultados en formato legible
 */
async function executeQueryWithResults(query, description = '') {
  const result = await executeQuery(query, description);
  
  if (!result.success) {
    return result;
  }
  
  // Formatear resultados para mejor legibilidad
  let formattedData = result.data;
  
  if (result.data && result.data.data) {
    formattedData = result.data.data;
  }
  
  return {
    ...result,
    formattedData,
    rowCount: Array.isArray(formattedData) ? formattedData.length : 0,
    hasData: Array.isArray(formattedData) && formattedData.length > 0
  };
}

module.exports = {
  executeQuery,
  executeMultipleQueries,
  validateQuery,
  testConnection,
  executeQueryWithResults,
  setSupabaseClient
};
