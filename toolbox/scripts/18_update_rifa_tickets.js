#!/usr/bin/env node

/**
 * 🎫 ACTUALIZAR OPCIONES DE TICKETS DE UNA RIFA
 * 
 * Script simple para cambiar las opciones de tickets de una rifa específica
 */

const config = require('../config');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Crear cliente de Supabase
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

/**
 * Actualiza las opciones de tickets de una rifa
 */
async function updateRifaTickets(rifaId, newTicketOptions) {
  logger.info(`🔄 Actualizando opciones de tickets para rifa ${rifaId}...`);
  logger.info(`📝 Nuevas opciones: [${newTicketOptions.join(', ')}]`);
  
  try {
    const { data, error } = await supabase
      .from('rifas')
      .update({ 
        numero_tickets_comprar: newTicketOptions
      })
      .eq('id', rifaId);
    
    if (error) throw error;
    
    logger.success('✅ Opciones de tickets actualizadas exitosamente');
    return true;
    
  } catch (error) {
    logger.error('❌ Error al actualizar opciones de tickets', { error: error.message });
    return false;
  }
}

/**
 * Muestra las opciones actuales de una rifa
 */
async function showRifaTickets(rifaId) {
  logger.info(`📊 Opciones de tickets para rifa ${rifaId}:`);
  
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select('titulo, numero_tickets_comprar, estado')
      .eq('id', rifaId)
      .single();
    
    if (error) throw error;
    
    if (data) {
      logger.info(`   📝 Título: ${data.titulo}`);
      logger.info(`   🔢 Opciones: [${data.numero_tickets_comprar.join(', ')}]`);
      logger.info(`   ✅ Estado: ${data.estado}`);
    } else {
      logger.warn('⚠️ No se encontró la rifa');
    }
    
  } catch (error) {
    logger.error('❌ Error al mostrar rifa', { error: error.message });
  }
}

/**
 * Lista todas las rifas con sus opciones de tickets
 */
async function listAllRifas() {
  logger.info('📋 Todas las rifas y sus opciones de tickets:');
  
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select('id, titulo, numero_tickets_comprar, estado')
      .order('titulo');
    
    if (error) throw error;
    
    if (data && data.length > 0) {
      data.forEach((rifa, index) => {
        logger.info(`${index + 1}. ${rifa.titulo}`);
        logger.info(`   ID: ${rifa.id}`);
        logger.info(`   Opciones: [${rifa.numero_tickets_comprar.join(', ')}]`);
        logger.info(`   Estado: ${rifa.estado}`);
        logger.info('');
      });
    } else {
      logger.warn('⚠️ No se encontraron rifas');
    }
    
  } catch (error) {
    logger.error('❌ Error al listar rifas', { error: error.message });
  }
}

/**
 * Función principal
 */
async function main() {
  logger.info('🎫 ACTUALIZAR OPCIONES DE TICKETS DE RIFA');
  logger.info('==========================================');
  
  const args = process.argv.slice(2);
  
  if (args.includes('--list')) {
    await listAllRifas();
  } else if (args.includes('--show')) {
    const rifaIdIndex = args.indexOf('--show') + 1;
    if (rifaIdIndex < args.length) {
      const rifaId = args[rifaIdIndex];
      await showRifaTickets(rifaId);
    } else {
      logger.error('❌ Debes especificar el ID de la rifa después de --show');
    }
  } else if (args.includes('--update')) {
    const updateIndex = args.indexOf('--update');
    if (updateIndex + 2 < args.length) {
      const rifaId = args[updateIndex + 1];
      const optionsStr = args[updateIndex + 2];
      try {
        const options = JSON.parse(optionsStr);
        if (Array.isArray(options) && options.every(n => Number.isInteger(n) && n > 0)) {
          await updateRifaTickets(rifaId, options);
        } else {
          logger.error('❌ Las opciones deben ser un array de enteros positivos');
        }
      } catch (error) {
        logger.error('❌ Formato inválido. Usa: --update "RIFA_ID" "[1,2,3,4,5]"');
      }
    } else {
      logger.error('❌ Debes especificar rifaId y opciones después de --update');
    }
  } else if (args.includes('--help')) {
    logger.info('📖 Comandos disponibles:');
    logger.info('   --list                    : Listar todas las rifas');
    logger.info('   --show RIFA_ID            : Mostrar opciones de una rifa');
    logger.info('   --update RIFA_ID "[1,2,3]" : Actualizar opciones de una rifa');
    logger.info('   --help                    : Mostrar esta ayuda');
    logger.info('');
    logger.info('📝 Ejemplos:');
    logger.info('   node 18_update_rifa_tickets.js --list');
    logger.info('   node 18_update_rifa_tickets.js --show "rifa-123"');
    logger.info('   node 18_update_rifa_tickets.js --update "rifa-123" "[1,2,3,5,8]"');
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
  updateRifaTickets,
  showRifaTickets,
  listAllRifas
};
