/**
 * 📝 MÓDULO DE GESTIÓN DE DATOS
 * 
 * Maneja la inserción, actualización y verificación de datos
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
 * Verifica el estado general de la base de datos
 */
async function checkDatabaseStatus() {
  if (!supabase) {
    logger.error('Cliente de Supabase no inicializado');
    return false;
  }
  
  logger.info('Verificando estado de la base de datos...');
  
  try {
    const { data: rifas, error } = await supabase
      .from('rifas')
      .select('*')
      .limit(5);
    
    if (error) {
      logger.error('Error al verificar estado', { error: error.message });
      return false;
    }
    
    if (rifas && rifas.length > 0) {
      logger.success(`${rifas.length} rifas encontradas`);
      rifas.forEach(rifa => {
        logger.info(`Rifa: ${rifa.titulo}`, { precio: rifa.precio_ticket, estado: rifa.estado });
      });
      return true;
    } else {
      logger.warning('No se encontraron rifas');
      return false;
    }
  } catch (error) {
    logger.error('Error al verificar estado', { error: error.message });
    return false;
  }
}

/**
 * Inserta rifas de ejemplo
 */
async function insertSampleData() {
  logger.info('Insertando rifas de ejemplo...');
  
  const sampleRifas = [
    {
      titulo: 'Toyota 4Runner TRD Pro 2024',
      descripcion: 'Rifa de un Toyota 4Runner TRD Pro completamente equipado, color Lime Rush. Incluye todos los accesorios TRD, suspensión elevada, ruedas de 17 pulgadas, y sistema de audio premium. SUV robusto y confiable para cualquier terreno.',
      precio_ticket: 25.00,
      imagen_url: '/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg',
      estado: 'activa',
      total_tickets: 1000,
      tickets_disponibles: 1000,
      premio_principal: 'Toyota 4Runner TRD Pro 2024',
      condiciones: 'Ganador debe ser mayor de 18 años. Impuestos y trámites no incluidos. Entrega en Caracas, Venezuela.',
      activa: true,
      tipo_rifa: 'vehiculo',
      categoria: 'suv',
      marca: 'Toyota',
      modelo: '4Runner TRD Pro',
      ano: 2024,
      color: 'Lime Rush',
      valor_estimado_usd: 45000.00,
      destacada: true,
      orden: 1,
      slug: 'toyota-4runner-trd-pro-2024'
    },
    {
      titulo: 'Toyota Camry 2014',
      descripcion: 'Elegancia y confort en un sedán confiable. Perfecto para el día a día, con excelente economía de combustible y bajo mantenimiento. Interior espacioso y tecnología avanzada para su época.',
      precio_ticket: 5.00,
      imagen_url: '/images/camry.jpeg',
      estado: 'activa',
      total_tickets: 500,
      tickets_disponibles: 500,
      premio_principal: 'Toyota Camry 2014',
      condiciones: 'Ganador debe ser mayor de 18 años. Impuestos y trámites no incluidos. Entrega en Caracas, Venezuela.',
      activa: true,
      tipo_rifa: 'vehiculo',
      categoria: 'sedan',
      marca: 'Toyota',
      modelo: 'Camry',
      ano: 2014,
      color: 'Plateado Metálico',
      valor_estimado_usd: 8000.00,
      destacada: false,
      orden: 2,
      slug: 'toyota-camry-2014'
    }
  ];
  
  let successCount = 0;
  
  for (const rifa of sampleRifas) {
    try {
      const { error } = await supabase
        .from('rifas')
        .upsert(rifa, { onConflict: 'slug' });
      
      if (error) {
        logger.error('Error al insertar rifa', { titulo: rifa.titulo, error: error.message });
      } else {
        logger.success('Rifa insertada/actualizada', { titulo: rifa.titulo });
        successCount++;
      }
    } catch (error) {
      logger.error('Error inesperado con rifa', { titulo: rifa.titulo, error: error.message });
    }
  }
  
  logger.info('Resultado de inserción de datos', { 
    success: successCount, 
    total: sampleRifas.length 
  });
  
  return successCount > 0;
}

/**
 * Limpia datos de prueba
 */
async function cleanupTestData() {
  logger.info('Limpiando datos de prueba...');
  
  try {
    const { error } = await supabase
      .from('rifas')
      .delete()
      .like('titulo', '%Prueba%');
    
    if (error) {
      logger.error('Error al limpiar datos de prueba', { error: error.message });
      return false;
    }
    
    logger.success('Datos de prueba limpiados');
    return true;
    
  } catch (error) {
    logger.error('Error inesperado al limpiar datos', { error: error.message });
    return false;
  }
}

/**
 * Genera reporte de datos
 */
async function generateDataReport() {
  logger.info('Generando reporte de datos...');
  
  try {
    const report = {
      timestamp: new Date().toISOString(),
      tables: {}
    };
    
    // Reporte de rifas
    const { data: rifas, error: rifasError } = await supabase
      .from('rifas')
      .select('*');
    
    if (rifasError) {
      report.tables.rifas = { error: rifasError.message };
    } else {
      report.tables.rifas = {
        total: rifas.length,
        activas: rifas.filter(r => r.estado === 'activa').length,
        destacadas: rifas.filter(r => r.destacada).length,
        porCategoria: {}
      };
      
      // Agrupar por categoría
      rifas.forEach(rifa => {
        const categoria = rifa.categoria || 'sin_categoria';
        if (!report.tables.rifas.porCategoria[categoria]) {
          report.tables.rifas.porCategoria[categoria] = 0;
        }
        report.tables.rifas.porCategoria[categoria]++;
      });
    }
    
    logger.info('Reporte de datos generado', { report });
    return report;
    
  } catch (error) {
    logger.error('Error al generar reporte', { error: error.message });
    return false;
  }
}

/**
 * Respalda datos importantes
 */
async function backupImportantData() {
  logger.info('Respaldando datos importantes...');
  
  try {
    const backup = {
      timestamp: new Date().toISOString(),
      rifas: [],
      configuracion: {}
    };
    
    // Respaldar rifas activas
    const { data: rifas, error } = await supabase
      .from('rifas')
      .select('*')
      .eq('estado', 'activa');
    
    if (error) {
      logger.error('Error al respaldar rifas', { error: error.message });
    } else {
      backup.rifas = rifas;
      logger.success(`${rifas.length} rifas respaldadas`);
    }
    
    // Respaldar configuración
    backup.configuracion = config;
    
    logger.success('Respaldo completado');
    return backup;
    
  } catch (error) {
    logger.error('Error al crear respaldo', { error: error.message });
    return false;
  }
}

module.exports = {
  checkDatabaseStatus,
  insertSampleData,
  cleanupTestData,
  generateDataReport,
  backupImportantData,
  setSupabaseClient
};
