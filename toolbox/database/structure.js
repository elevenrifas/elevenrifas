/**
 * 🏗️ MÓDULO DE ESTRUCTURA DE BASE DE DATOS
 * 
 * Maneja la estructura, campos, índices y modificaciones de tablas
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
 * Verifica la estructura actual de la tabla rifas
 */
async function checkTableStructure() {
  if (!supabase) {
    logger.error('Cliente de Supabase no inicializado');
    return false;
  }
  
  logger.info('Verificando estructura actual de la tabla...');
  
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select('*')
      .limit(1);
    
    if (error) {
      logger.error('Error al verificar estructura', { error: error.message });
      return false;
    }
    
    if (data && data.length > 0) {
      const rifa = data[0];
      logger.success('Estructura actual verificada');
      
      // Mostrar todos los campos disponibles
      Object.keys(rifa).forEach(key => {
        const value = rifa[key];
        const type = typeof value;
        logger.info(`Campo: ${key}`, { value, type });
      });
      
      return true;
    } else {
      logger.warning('No se encontraron rifas para verificar estructura');
      return false;
    }
  } catch (error) {
    logger.error('Error al verificar estructura', { error: error.message });
    return false;
  }
}

/**
 * Agrega campos faltantes a la tabla rifas
 */
async function addMissingColumns() {
  logger.info('Agregando campos faltantes a la tabla rifas...');
  
  const columns = [
    'tipo_rifa VARCHAR(100) DEFAULT \'vehiculo\'',
    'fecha_culminacion TIMESTAMP',
    'categoria VARCHAR(100) DEFAULT \'automovil\'',
    'marca VARCHAR(100)',
    'modelo VARCHAR(100)',
    'ano INTEGER',
    'color VARCHAR(100)',
    'valor_estimado_usd DECIMAL(12,2)',
    'destacada BOOLEAN DEFAULT false',
    'orden INTEGER DEFAULT 0',
    'slug VARCHAR(255)'
  ];
  
  let successCount = 0;
  
  for (const column of columns) {
    try {
      const query = `ALTER TABLE rifas ADD COLUMN IF NOT EXISTS ${column}`;
      logger.info('Agregando campo', { column });
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: query });
      
      if (error) {
        logger.warning('No se pudo agregar campo', { column, error: error.message });
      } else {
        logger.success('Campo agregado', { column });
        successCount++;
      }
    } catch (error) {
      logger.error('Error con campo', { column, error: error.message });
    }
  }
  
  logger.info('Resultado de agregar campos', { 
    success: successCount, 
    total: columns.length 
  });
  
  return successCount > 0;
}

/**
 * Crea índices para mejor rendimiento
 */
async function createIndexes() {
  logger.info('Creando índices para mejor rendimiento...');
  
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_rifas_estado_destacada ON rifas(estado, destacada)',
    'CREATE INDEX IF NOT EXISTS idx_rifas_tipo ON rifas(tipo_rifa)',
    'CREATE INDEX IF NOT EXISTS idx_rifas_orden ON rifas(orden, fecha_creacion)',
    'CREATE INDEX IF NOT EXISTS idx_rifas_slug ON rifas(slug)'
  ];
  
  let successCount = 0;
  
  for (const index of indexes) {
    try {
      logger.info('Creando índice', { index });
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: index });
      
      if (error) {
        logger.warning('No se pudo crear índice', { index, error: error.message });
      } else {
        logger.success('Índice creado', { index });
        successCount++;
      }
    } catch (error) {
      logger.error('Error creando índice', { index, error: error.message });
    }
  }
  
  logger.info('Resultado de crear índices', { 
    success: successCount, 
    total: indexes.length 
  });
  
  return successCount > 0;
}

/**
 * Verifica la integridad de la base de datos
 */
async function checkDatabaseIntegrity() {
  logger.info('Verificando integridad de la base de datos...');
  
  try {
    // Verificar que las tablas principales existan
    const tables = ['rifas', 'usuarios', 'pagos', 'tickets'];
    const tableStatus = {};
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          tableStatus[table] = { exists: false, error: error.message };
        } else {
          tableStatus[table] = { exists: true, recordCount: data?.length || 0 };
        }
      } catch (error) {
        tableStatus[table] = { exists: false, error: error.message };
      }
    }
    
    logger.info('Estado de las tablas', { tableStatus });
    return tableStatus;
    
  } catch (error) {
    logger.error('Error al verificar integridad', { error: error.message });
    return false;
  }
}

/**
 * Optimiza la base de datos
 */
async function optimizeDatabase() {
  logger.info('Optimizando base de datos...');
  
  try {
    // Crear índices
    await createIndexes();
    
    // Verificar estructura
    await checkTableStructure();
    
    // Verificar integridad
    await checkDatabaseIntegrity();
    
    logger.success('Base de datos optimizada');
    return true;
    
  } catch (error) {
    logger.error('Error al optimizar base de datos', { error: error.message });
    return false;
  }
}

module.exports = {
  checkTableStructure,
  addMissingColumns,
  createIndexes,
  checkDatabaseIntegrity,
  optimizeDatabase,
  setSupabaseClient
};
