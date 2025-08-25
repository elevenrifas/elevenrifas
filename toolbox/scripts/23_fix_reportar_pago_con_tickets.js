#!/usr/bin/env node

/**
 * Script para corregir la función reportar_pago_con_tickets
 * Soluciona el problema del bucle infinito en la generación de números de ticket
 */

const { database } = require('../config/database');
const { logger } = require('../utils/logger');

async function fixReportarPagoConTickets() {
    try {
        logger.info('🔧 Iniciando corrección de función reportar_pago_con_tickets...');
        
        // Leer los archivos SQL corregidos
        const fs = require('fs');
        const path = require('path');
        
        const schemasDir = path.join(__dirname, '../../lib/database/Schemas');
        
        // Aplicar función auxiliar generar_numero_ticket
        const generarNumeroTicketSQL = fs.readFileSync(
            path.join(schemasDir, 'generar_numero_ticket.sql'), 
            'utf8'
        );
        
        logger.info('📝 Aplicando función auxiliar generar_numero_ticket...');
        const { error: error1 } = await database.query(generarNumeroTicketSQL);
        
        if (error1) {
            logger.error('❌ Error al aplicar generar_numero_ticket:', error1);
            return false;
        }
        
        logger.info('✅ Función auxiliar aplicada correctamente');
        
        // Aplicar función principal corregida
        const reportarPagoSQL = fs.readFileSync(
            path.join(schemasDir, 'reportar_pago_con_tickets'), 
            'utf8'
        );
        
        logger.info('📝 Aplicando función principal corregida...');
        const { error: error2 } = await database.query(reportarPagoSQL);
        
        if (error2) {
            logger.error('❌ Error al aplicar función principal:', error2);
            return false;
        }
        
        logger.info('✅ Función principal corregida correctamente');
        
        // Aplicar versión alternativa (opcional)
        const reportarPagoV2SQL = fs.readFileSync(
            path.join(schemasDir, 'reportar_pago_con_tickets_v2.sql'), 
            'utf8'
        );
        
        logger.info('📝 Aplicando versión alternativa v2...');
        const { error: error3 } = await database.query(reportarPagoV2SQL);
        
        if (error3) {
            logger.error('❌ Error al aplicar versión v2:', error3);
            // No es crítico, continuar
        } else {
            logger.info('✅ Versión alternativa v2 aplicada correctamente');
        }
        
        // Verificar que las funciones existen
        logger.info('🔍 Verificando funciones aplicadas...');
        
        const { data: funciones, error: error4 } = await database.query(`
            SELECT routine_name, routine_type 
            FROM information_schema.routines 
            WHERE routine_name IN ('reportar_pago_con_tickets', 'generar_numero_ticket')
            AND routine_schema = 'public'
        `);
        
        if (error4) {
            logger.error('❌ Error al verificar funciones:', error4);
            return false;
        }
        
        logger.info('📊 Funciones encontradas:', funciones);
        
        // Test básico de la función auxiliar
        logger.info('🧪 Probando función auxiliar...');
        try {
            const { data: testResult, error: testError } = await database.query(`
                SELECT generar_numero_ticket('00000000-0000-0000-0000-000000000000'::UUID) as numero_test
            `);
            
            if (testError) {
                logger.warn('⚠️ Función auxiliar no pudo ser probada:', testError);
            } else {
                logger.info('✅ Función auxiliar probada correctamente:', testResult);
            }
        } catch (testErr) {
            logger.warn('⚠️ Error en test de función auxiliar:', testErr.message);
        }
        
        logger.info('🎉 Corrección completada exitosamente');
        return true;
        
    } catch (error) {
        logger.error('💥 Error fatal en corrección:', error);
        return false;
    }
}

async function main() {
    try {
        const success = await fixReportarPagoConTickets();
        
        if (success) {
            logger.info('✅ Proceso completado exitosamente');
            process.exit(0);
        } else {
            logger.error('❌ Proceso falló');
            process.exit(1);
        }
        
    } catch (error) {
        logger.error('💥 Error en proceso principal:', error);
        process.exit(1);
    }
}

// Ejecutar si se llama directamente
if (require.main === module) {
    main();
}

module.exports = { fixReportarPagoConTickets };

