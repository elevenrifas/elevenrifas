#!/usr/bin/env node

/**
 * Script simple para probar la función reportar_pago_con_tickets
 */

const { database } = require('../config/database');

async function testReportarPago() {
    try {
        console.log('🧪 Probando función reportar_pago_con_tickets...');
        
        // Verificar si la función existe
        const { data: funciones, error: checkError } = await database.query(`
            SELECT routine_name, routine_type 
            FROM information_schema.routines 
            WHERE routine_name = 'reportar_pago_con_tickets'
            AND routine_schema = 'public'
        `);
        
        if (checkError) {
            console.error('❌ Error al verificar función:', checkError);
            return;
        }
        
        if (!funciones || funciones.length === 0) {
            console.log('⚠️ La función reportar_pago_con_tickets no existe');
            console.log('🔧 Aplicando función corregida...');
            
            // Leer y aplicar la función corregida
            const fs = require('fs');
            const path = require('path');
            
            const schemaPath = path.join(__dirname, '../../lib/database/Schemas/reportar_pago_con_tickets');
            const sqlContent = fs.readFileSync(schemaPath, 'utf8');
            
            const { error: applyError } = await database.query(sqlContent);
            
            if (applyError) {
                console.error('❌ Error al aplicar función:', applyError);
                return;
            }
            
            console.log('✅ Función aplicada correctamente');
        } else {
            console.log('✅ La función ya existe:', funciones);
        }
        
        // Test básico con parámetros de prueba
        console.log('🧪 Ejecutando test básico...');
        
        const testParams = {
            p_tipo_pago: 'pago_movil',
            p_monto_bs: 100.00,
            p_monto_usd: 1.00,
            p_tasa_cambio: 100.00,
            p_referencia: 'TEST-001',
            p_telefono_pago: '04120000000',
            p_banco_pago: 'Banco de Venezuela',
            p_cedula_pago: 'V12345678',
            p_fecha_visita: '2024-01-15',
            p_estado: 'pendiente',
            p_cantidad_tickets: 1,
            p_rifa_id: '00000000-0000-0000-0000-000000000000',
            p_nombre: 'Usuario Test',
            p_cedula: 'V12345678',
            p_telefono: '04120000000',
            p_correo: 'test@example.com'
        };
        
        console.log('📊 Parámetros de prueba:', testParams);
        
        // Intentar ejecutar la función
        const { data: result, error: execError } = await database.query(`
            SELECT reportar_pago_con_tickets(
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
            ) as resultado
        `, [
            testParams.p_tipo_pago,
            testParams.p_monto_bs,
            testParams.p_monto_usd,
            testParams.p_tasa_cambio,
            testParams.p_referencia,
            testParams.p_telefono_pago,
            testParams.p_banco_pago,
            testParams.p_cedula_pago,
            testParams.p_fecha_visita,
            testParams.p_estado,
            testParams.p_cantidad_tickets,
            testParams.p_rifa_id,
            testParams.p_nombre,
            testParams.p_cedula,
            testParams.p_telefono,
            testParams.p_correo
        ]);
        
        if (execError) {
            console.error('❌ Error al ejecutar función:', execError);
            
            // Mostrar detalles del error
            if (execError.message.includes('bucle infinito') || execError.message.includes('timeout')) {
                console.log('🔍 El problema parece ser un bucle infinito en la generación de tickets');
                console.log('💡 Solución: La función ha sido corregida con límites de intentos');
            }
        } else {
            console.log('✅ Función ejecutada correctamente');
            console.log('📊 Resultado:', result);
        }
        
    } catch (error) {
        console.error('💥 Error fatal:', error);
    }
}

async function main() {
    try {
        await testReportarPago();
        console.log('🎉 Test completado');
    } catch (error) {
        console.error('💥 Error en main:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { testReportarPago };

