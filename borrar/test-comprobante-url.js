#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA - COMPROBANTE_URL
 * 
 * Este script verifica que el campo comprobante_url se esté guardando
 * correctamente en la tabla pagos después de la corrección.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testComprobanteUrl() {
  console.log('🧪 INICIANDO PRUEBA DE COMPROBANTE_URL...\n');

  try {
    // 1. Verificar estructura de la tabla pagos
    console.log('📋 1. VERIFICANDO ESTRUCTURA DE TABLA PAGOS...');
    
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'pagos')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Error obteniendo estructura:', columnsError);
      return;
    }

    const comprobanteColumn = columns.find(col => col.column_name === 'comprobante_url');
    console.log('📊 Campo comprobante_url:', comprobanteColumn ? '✅ Existe' : '❌ No existe');
    
    if (comprobanteColumn) {
      console.log('   - Tipo:', comprobanteColumn.data_type);
      console.log('   - Nullable:', comprobanteColumn.is_nullable);
    }

    // 2. Verificar últimos pagos con comprobantes
    console.log('\n📋 2. VERIFICANDO ÚLTIMOS PAGOS CON COMPROBANTES...');
    
    const { data: pagosConComprobante, error: pagosError } = await supabase
      .from('pagos')
      .select('id, tipo_pago, monto_usd, comprobante_url, fecha_pago, estado')
      .not('comprobante_url', 'is', null)
      .order('fecha_pago', { ascending: false })
      .limit(5);

    if (pagosError) {
      console.error('❌ Error obteniendo pagos:', pagosError);
      return;
    }

    console.log(`📊 Pagos con comprobantes encontrados: ${pagosConComprobante?.length || 0}`);
    
    if (pagosConComprobante && pagosConComprobante.length > 0) {
      pagosConComprobante.forEach((pago, index) => {
        console.log(`   ${index + 1}. ID: ${pago.id}`);
        console.log(`      Tipo: ${pago.tipo_pago}`);
        console.log(`      Monto: $${pago.monto_usd}`);
        console.log(`      Estado: ${pago.estado}`);
        console.log(`      Comprobante: ${pago.comprobante_url}`);
        console.log(`      Fecha: ${pago.fecha_pago}`);
        console.log('');
      });
    } else {
      console.log('⚠️ No hay pagos con comprobantes en la base de datos');
    }

    // 3. Verificar pagos recientes (últimas 24 horas)
    console.log('📋 3. VERIFICANDO PAGOS RECIENTES (ÚLTIMAS 24 HORAS)...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { data: pagosRecientes, error: recientesError } = await supabase
      .from('pagos')
      .select('id, tipo_pago, monto_usd, comprobante_url, fecha_pago, estado')
      .gte('fecha_pago', yesterday.toISOString())
      .order('fecha_pago', { ascending: false })
      .limit(10);

    if (recientesError) {
      console.error('❌ Error obteniendo pagos recientes:', recientesError);
      return;
    }

    console.log(`📊 Pagos recientes encontrados: ${pagosRecientes?.length || 0}`);
    
    if (pagosRecientes && pagosRecientes.length > 0) {
      pagosRecientes.forEach((pago, index) => {
        const tieneComprobante = pago.comprobante_url ? '✅' : '❌';
        console.log(`   ${index + 1}. ${tieneComprobante} ID: ${pago.id} | ${pago.tipo_pago} | $${pago.monto_usd} | ${pago.estado}`);
      });
    } else {
      console.log('⚠️ No hay pagos en las últimas 24 horas');
    }

    // 4. Estadísticas generales
    console.log('\n📋 4. ESTADÍSTICAS GENERALES...');
    
    const { count: totalPagos, error: countError } = await supabase
      .from('pagos')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error contando pagos:', countError);
      return;
    }

    const { count: pagosConComprobanteCount, error: countComprobanteError } = await supabase
      .from('pagos')
      .select('*', { count: 'exact', head: true })
      .not('comprobante_url', 'is', null);

    if (countComprobanteError) {
      console.error('❌ Error contando pagos con comprobantes:', countComprobanteError);
      return;
    }

    console.log(`📊 Total de pagos: ${totalPagos || 0}`);
    console.log(`📊 Pagos con comprobantes: ${pagosConComprobanteCount || 0}`);
    console.log(`📊 Pagos sin comprobantes: ${(totalPagos || 0) - (pagosConComprobanteCount || 0)}`);
    
    if (totalPagos > 0) {
      const porcentaje = ((pagosConComprobanteCount || 0) / totalPagos * 100).toFixed(1);
      console.log(`📊 Porcentaje con comprobantes: ${porcentaje}%`);
    }

    console.log('\n✅ PRUEBA COMPLETADA EXITOSAMENTE');

  } catch (error) {
    console.error('💥 Error inesperado:', error);
  }
}

// Ejecutar prueba
testComprobanteUrl()
  .then(() => {
    console.log('\n🎯 Script finalizado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script falló:', error);
    process.exit(1);
  });
