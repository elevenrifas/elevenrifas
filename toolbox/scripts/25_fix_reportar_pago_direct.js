#!/usr/bin/env node

/**
 * Script directo para corregir reportar_pago_con_tickets usando Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = 'https://jlugofbpazvaoksvwcvy.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdWdvZmJwYXp2YW9rc3Z3Y3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDk2NTYsImV4cCI6MjA3MTAyNTY1Nn0.pJ_tGa0wdvuEmZjx5bOKxcXX7errZnoPUW7BdOj0WTA';

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixReportarPagoConTickets() {
    try {
        console.log('🔧 Iniciando corrección de función reportar_pago_con_tickets...');
        
        // Leer la función corregida
        const schemaPath = path.join(__dirname, '../../lib/database/Schemas/reportar_pago_con_tickets');
        const sqlContent = fs.readFileSync(schemaPath, 'utf8');
        
        console.log('📝 Aplicando función corregida...');
        console.log('📊 Contenido SQL:', sqlContent.substring(0, 200) + '...');
        
        // Aplicar la función usando RPC
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
        
        if (error) {
            console.log('⚠️ RPC exec_sql no disponible, intentando método alternativo...');
            
            // Método alternativo: usar query directo
            const { error: queryError } = await supabase
                .from('information_schema.routines')
                .select('routine_name')
                .eq('routine_name', 'reportar_pago_con_tickets');
            
            if (queryError) {
                console.log('⚠️ Query directo no disponible, usando método manual...');
                
                // Método manual: mostrar instrucciones
                console.log('\n📋 INSTRUCCIONES MANUALES:');
                console.log('1. Ve a tu panel de Supabase');
                console.log('2. Abre el SQL Editor');
                console.log('3. Copia y pega este SQL:');
                console.log('\n' + sqlContent);
                console.log('\n4. Ejecuta el SQL');
                console.log('5. Verifica que la función se haya creado');
                
                return false;
            }
        } else {
            console.log('✅ Función aplicada correctamente via RPC');
        }
        
        // Verificar que la función existe
        console.log('🔍 Verificando función...');
        
        try {
            const { data: testResult, error: testError } = await supabase.rpc('reportar_pago_con_tickets', {
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
            });
            
            if (testError) {
                console.log('⚠️ Error en test:', testError.message);
                
                if (testError.message.includes('function') && testError.message.includes('does not exist')) {
                    console.log('🔍 La función no existe aún. Aplica el SQL manualmente.');
                } else if (testError.message.includes('bucle infinito') || testError.message.includes('timeout')) {
                    console.log('🔍 El problema del bucle infinito persiste. La función necesita ser corregida.');
                }
            } else {
                console.log('✅ Función funciona correctamente!');
                console.log('📊 Resultado del test:', testResult);
            }
            
        } catch (testErr) {
            console.log('⚠️ Error en test:', testErr.message);
        }
        
        return true;
        
    } catch (error) {
        console.error('💥 Error fatal:', error);
        return false;
    }
}

async function main() {
    try {
        const success = await fixReportarPagoConTickets();
        
        if (success) {
            console.log('🎉 Proceso completado');
        } else {
            console.log('⚠️ Proceso requiere intervención manual');
        }
        
    } catch (error) {
        console.error('💥 Error en main:', error);
    }
}

if (require.main === module) {
    main();
}

module.exports = { fixReportarPagoConTickets };

