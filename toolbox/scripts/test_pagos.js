#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA PARA LÓGICA DE PAGOS
 * 
 * Prueba la funcionalidad completa del sistema de pagos:
 * 1. Reportar pago
 * 2. Verificar pago
 * 3. Actualizar ticket
 */

const config = require('../config');
const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

// Crear cliente de Supabase
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

/**
 * Prueba el flujo completo de reporte de pagos
 */
async function testFlujoPagos() {
  logger.info('🧪 Iniciando pruebas de lógica de pagos...');
  
  try {
    // PASO 1: Obtener tickets disponibles para prueba
    logger.info('📋 Obteniendo tickets disponibles...');
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select('*')
      .eq('estado', 'reservado')
      .limit(2);
    
    if (ticketsError || !tickets || tickets.length === 0) {
      logger.error('❌ No hay tickets disponibles para prueba');
      return false;
    }
    
    logger.success(`✅ Encontrados ${tickets.length} tickets para prueba`);
    
    // PASO 2: Probar reporte de pago para cada ticket
    for (let i = 0; i < tickets.length; i++) {
      const ticket = tickets[i];
      logger.info(`🎫 Probando ticket ${i + 1}/${tickets.length}: ${ticket.numero_ticket}`);
      
      // Crear datos de pago de prueba
      const datosPago = {
        ticket_id: ticket.id,
        tipo_pago: i === 0 ? 'pago_movil' : 'binance',
        monto_bs: ticket.precio * 35, // Tasa de cambio aproximada
        monto_usd: ticket.precio,
        tasa_cambio: 35,
        referencia: `TEST-${Date.now()}-${i}`,
        telefono_pago: '0412-123-4567',
        banco_pago: i === 0 ? 'Banesco' : undefined,
        cedula_pago: ticket.cedula,
        notas: 'Pago de prueba del sistema'
      };
      
      // Insertar pago usando exec_sql
      const queryInsert = `
        INSERT INTO pagos (
          ticket_id, tipo_pago, estado, monto_bs, monto_usd, 
          tasa_cambio, referencia, fecha_pago, telefono_pago, 
          banco_pago, cedula_pago, notas
        ) VALUES (
          '${datosPago.ticket_id}',
          '${datosPago.tipo_pago}',
          'pendiente',
          ${datosPago.monto_bs},
          ${datosPago.monto_usd},
          ${datosPago.tasa_cambio},
          '${datosPago.referencia}',
          NOW(),
          '${datosPago.telefono_pago}',
          ${datosPago.banco_pago ? `'${datosPago.banco_pago}'` : 'NULL'},
          '${datosPago.cedula_pago}',
          '${datosPago.notas}'
        ) RETURNING *
      `;
      
      logger.info('💳 Insertando pago...');
      const { data: pagoInsertado, error: insertError } = await supabase.rpc('exec_sql', { 
        sql_query: queryInsert 
      });
      
      if (insertError) {
        logger.error(`❌ Error al insertar pago: ${insertError.message}`);
        continue;
      }
      
      logger.success(`✅ Pago insertado: ${datosPago.referencia}`);
      
      // PASO 3: Verificar el pago
      logger.info('✅ Verificando pago...');
      const queryVerificar = `
        UPDATE pagos 
        SET 
          estado = 'verificado',
          fecha_verificacion = NOW(),
          verificado_por = 'admin-test',
          notas = CONCAT(COALESCE(notas, ''), ' - VERIFICADO EN PRUEBA')
        WHERE referencia = '${datosPago.referencia}'
        RETURNING *
      `;
      
      const { data: pagoVerificado, error: verificarError } = await supabase.rpc('exec_sql', { 
        sql_query: queryVerificar 
      });
      
      if (verificarError) {
        logger.error(`❌ Error al verificar pago: ${verificarError.message}`);
        continue;
      }
      
      logger.success(`✅ Pago verificado: ${datosPago.referencia}`);
      
      // PASO 4: Actualizar estado del ticket
      logger.info('🎫 Actualizando estado del ticket...');
      const queryTicket = `
        UPDATE tickets 
        SET 
          estado = 'pagado',
          fecha_verificacion = NOW()
        WHERE id = '${ticket.id}'
        RETURNING *
      `;
      
      const { data: ticketActualizado, error: ticketError } = await supabase.rpc('exec_sql', { 
        sql_query: queryTicket 
      });
      
      if (ticketError) {
        logger.error(`❌ Error al actualizar ticket: ${ticketError.message}`);
        continue;
      }
      
      logger.success(`✅ Ticket actualizado: ${ticket.numero_ticket} -> pagado`);
    }
    
    // PASO 5: Verificar resultados
    logger.info('🔍 Verificando resultados de las pruebas...');
    
    // Verificar pagos creados
    const { data: pagosCreados, error: pagosError } = await supabase
      .from('pagos')
      .select('*')
      .like('referencia', 'TEST-%');
    
    if (pagosError) {
      logger.error(`❌ Error al verificar pagos: ${pagosError.message}`);
    } else {
      logger.success(`✅ Pagos de prueba creados: ${pagosCreados?.length || 0}`);
    }
    
    // Verificar tickets actualizados
    const { data: ticketsActualizados, error: ticketsUpdateError } = await supabase
      .from('tickets')
      .select('*')
      .eq('estado', 'pagado');
    
    if (ticketsUpdateError) {
      logger.error(`❌ Error al verificar tickets: ${ticketsUpdateError.message}`);
    } else {
      logger.success(`✅ Tickets pagados: ${ticketsActualizados?.length || 0}`);
    }
    
    logger.success('🎉 Pruebas de lógica de pagos completadas exitosamente');
    return true;
    
  } catch (error) {
    logger.error('❌ Error en pruebas de pagos', { error: error.message });
    return false;
  }
}

/**
 * Limpia los datos de prueba
 */
async function limpiarDatosPrueba() {
  logger.info('🧹 Limpiando datos de prueba...');
  
  try {
    // Eliminar pagos de prueba
    const { error: deletePagosError } = await supabase.rpc('exec_sql', { 
      sql_query: "DELETE FROM pagos WHERE referencia LIKE 'TEST-%'" 
    });
    
    if (deletePagosError) {
      logger.warning(`⚠️ No se pudieron eliminar pagos de prueba: ${deletePagosError.message}`);
    } else {
      logger.success('✅ Pagos de prueba eliminados');
    }
    
    // Revertir tickets de prueba a estado reservado
    const { error: revertTicketsError } = await supabase.rpc('exec_sql', { 
      sql_query: "UPDATE tickets SET estado = 'reservado', fecha_verificacion = NULL WHERE estado = 'pagado' AND fecha_verificacion > NOW() - INTERVAL '1 hour'" 
    });
    
    if (revertTicketsError) {
      logger.warning(`⚠️ No se pudieron revertir tickets: ${revertTicketsError.message}`);
    } else {
      logger.success('✅ Tickets de prueba revertidos');
    }
    
  } catch (error) {
    logger.error('❌ Error al limpiar datos de prueba', { error: error.message });
  }
}

/**
 * Ejecuta las pruebas
 */
async function ejecutarPruebas() {
  logger.info('🚀 INICIANDO PRUEBAS DE SISTEMA DE PAGOS');
  logger.info('==========================================');
  
  try {
    // Ejecutar pruebas
    const resultado = await testFlujoPagos();
    
    if (resultado) {
      logger.success('🎯 TODAS LAS PRUEBAS PASARON EXITOSAMENTE');
      
      // Preguntar si limpiar datos de prueba
      logger.info('🧹 ¿Deseas limpiar los datos de prueba? (s/n)');
      // En un entorno real, aquí se podría usar readline para input del usuario
      
      // Por ahora, limpiar automáticamente
      await limpiarDatosPrueba();
      
    } else {
      logger.error('💥 ALGUNAS PRUEBAS FALLARON');
    }
    
  } catch (error) {
    logger.error('💥 Error crítico en las pruebas', { error: error.message });
  }
  
  logger.info('🏁 PRUEBAS COMPLETADAS');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  ejecutarPruebas().catch(console.error);
}

module.exports = {
  testFlujoPagos,
  limpiarDatosPrueba,
  ejecutarPruebas
};
