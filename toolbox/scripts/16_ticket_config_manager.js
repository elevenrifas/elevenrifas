#!/usr/bin/env node

/**
 * 🎫 GESTOR DE CONFIGURACIÓN DE TICKETS
 * 
 * Script del toolbox para gestionar automáticamente los números de tickets
 * Permite cambiar los números disponibles sin tocar el código
 */

const config = require('../config');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Crear cliente de Supabase
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

/**
 * Ejecuta el script SQL para crear la tabla de configuración
 */
async function setupTicketConfig() {
  logger.info('🎫 Configurando sistema de tickets...');
  
  try {
    // Leer el archivo SQL
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../../database/scripts/15_create_ticket_config.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Dividir en queries individuales
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));
    
    logger.info(`📝 Ejecutando ${queries.length} queries...`);
    
    // Ejecutar cada query
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (query.trim()) {
        logger.info(`Query ${i + 1}/${queries.length}: ${query.substring(0, 50)}...`);
        
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: query + ';' 
        });
        
        if (error) {
          logger.warn(`Query ${i + 1} tuvo un warning: ${error.message}`);
        }
      }
    }
    
    logger.success('✅ Configuración de tickets creada exitosamente');
    return true;
    
  } catch (error) {
    logger.error('❌ Error al configurar tickets', { error: error.message });
    return false;
  }
}

/**
 * Obtiene los números de tickets actuales
 */
async function getCurrentTicketNumbers() {
  try {
    const { data, error } = await supabase
      .from('configuracion_tickets')
      .select('valor')
      .eq('nombre', 'numeros_tickets_disponibles')
      .eq('activo', true)
      .single();
    
    if (error) throw error;
    
    return data.valor;
  } catch (error) {
    logger.error('❌ Error al obtener números de tickets', { error: error.message });
    return [1, 2, 3, 4, 5, 10, 15, 20, 25]; // Valores por defecto
  }
}

/**
 * Actualiza los números de tickets disponibles
 */
async function updateTicketNumbers(newNumbers) {
  logger.info(`🔄 Actualizando números de tickets a: [${newNumbers.join(', ')}]`);
  
  try {
    const { data, error } = await supabase
      .from('configuracion_tickets')
      .update({ 
        valor: newNumbers,
        fecha_actualizacion: new Date().toISOString()
      })
      .eq('nombre', 'numeros_tickets_disponibles');
    
    if (error) throw error;
    
    logger.success('✅ Números de tickets actualizados exitosamente');
    return true;
    
  } catch (error) {
    logger.error('❌ Error al actualizar números de tickets', { error: error.message });
    return false;
  }
}

/**
 * Muestra el estado actual de la configuración
 */
async function showTicketConfig() {
  logger.info('📊 Estado actual de la configuración de tickets:');
  
  try {
    const { data, error } = await supabase
      .from('configuracion_tickets')
      .select('*')
      .eq('nombre', 'numeros_tickets_disponibles');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      const config = data[0];
      logger.info(`   📝 Nombre: ${config.nombre}`);
      logger.info(`   🔢 Números: [${config.valor.join(', ')}]`);
      logger.info(`   📅 Última actualización: ${config.fecha_actualizacion}`);
      logger.info(`   ✅ Activo: ${config.activo}`);
    } else {
      logger.warn('⚠️ No se encontró configuración de tickets');
    }
    
  } catch (error) {
    logger.error('❌ Error al mostrar configuración', { error: error.message });
  }
}

/**
 * Función principal
 */
async function main() {
  logger.info('🎫 GESTOR DE CONFIGURACIÓN DE TICKETS');
  logger.info('=====================================');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--setup')) {
    await setupTicketConfig();
  } else if (args.includes('--show')) {
    await showTicketConfig();
  } else if (args.includes('--update')) {
    const numbersIndex = args.indexOf('--update') + 1;
    if (numbersIndex < args.length) {
      const numbersStr = args[numbersIndex];
      try {
        const numbers = JSON.parse(numbersStr);
        if (Array.isArray(numbers) && numbers.every(n => Number.isInteger(n) && n > 0)) {
          await updateTicketNumbers(numbers);
        } else {
          logger.error('❌ Los números deben ser un array de enteros positivos');
        }
      } catch (error) {
        logger.error('❌ Formato inválido. Usa: --update "[1,2,3,4,5]"');
      }
    } else {
      logger.error('❌ Debes especificar los números después de --update');
    }
  } else if (args.includes('--help')) {
    logger.info('📖 Comandos disponibles:');
    logger.info('   --setup     : Crear tabla de configuración');
    logger.info('   --show      : Mostrar configuración actual');
    logger.info('   --update    : Actualizar números de tickets');
    logger.info('   --help      : Mostrar esta ayuda');
    logger.info('');
    logger.info('📝 Ejemplos:');
    logger.info('   node 16_ticket_config_manager.js --setup');
    logger.info('   node 16_ticket_config_manager.js --show');
    logger.info('   node 16_ticket_config_manager.js --update "[1,2,3,5,8,13,21]"');
  } else {
    logger.info('💡 Usa --help para ver los comandos disponibles');
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch((error) => {
    logger.error('Error fatal', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  setupTicketConfig,
  getCurrentTicketNumbers,
  updateTicketNumbers,
  showTicketConfig
};
