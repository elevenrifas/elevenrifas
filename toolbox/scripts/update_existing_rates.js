#!/usr/bin/env node

/**
 * Script para actualizar tasas de cambio existentes
 * Actualiza pagos y rifas que tienen la tasa hardcodeada de 145
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExistingRates() {
  console.log('🔄 Iniciando actualización de tasas existentes...\n');

  try {
    // PASO 1: Verificar rifas con tasa 145
    console.log('📊 PASO 1: Verificando rifas con tasa 145...');
    const { data: rifasConTasa145, error: errorRifas } = await supabase
      .from('rifas')
      .select('id, titulo, tasa')
      .eq('tasa', 145);

    if (errorRifas) {
      console.error('❌ Error consultando rifas:', errorRifas);
      return;
    }

    console.log(`📋 Encontradas ${rifasConTasa145?.length || 0} rifas con tasa 145`);
    if (rifasConTasa145 && rifasConTasa145.length > 0) {
      console.log('Rifas encontradas:');
      rifasConTasa145.forEach(rifa => {
        console.log(`  - ${rifa.titulo} (ID: ${rifa.id}) - Tasa: ${rifa.tasa}`);
      });
    }

    // PASO 2: Actualizar rifas con tasa 145 a 12.3
    if (rifasConTasa145 && rifasConTasa145.length > 0) {
      console.log('\n🔄 PASO 2: Actualizando rifas con tasa 145...');
      const { error: errorUpdateRifas } = await supabase
        .from('rifas')
        .update({ tasa: 12.3 })
        .eq('tasa', 145);

      if (errorUpdateRifas) {
        console.error('❌ Error actualizando rifas:', errorUpdateRifas);
        return;
      }

      console.log(`✅ Actualizadas ${rifasConTasa145.length} rifas`);
    }

    // PASO 3: Verificar pagos con tasa 145
    console.log('\n📊 PASO 3: Verificando pagos con tasa 145...');
    const { data: pagosConTasa145, error: errorPagos } = await supabase
      .from('pagos')
      .select('id, tipo_pago, monto_usd, monto_bs, tasa_cambio, rifa_id, rifas(titulo, tasa)')
      .eq('tasa_cambio', 145);

    if (errorPagos) {
      console.error('❌ Error consultando pagos:', errorPagos);
      return;
    }

    console.log(`📋 Encontrados ${pagosConTasa145?.length || 0} pagos con tasa 145`);
    if (pagosConTasa145 && pagosConTasa145.length > 0) {
      console.log('Pagos encontrados:');
      pagosConTasa145.forEach(pago => {
        console.log(`  - Pago ${pago.id} - ${pago.tipo_pago} - $${pago.monto_usd} - Tasa: ${pago.tasa_cambio}`);
        if (pago.rifas) {
          console.log(`    Rifa: ${pago.rifas.titulo} - Tasa rifa: ${pago.rifas.tasa}`);
        }
      });
    }

    // PASO 4: Actualizar pagos con tasa 145
    if (pagosConTasa145 && pagosConTasa145.length > 0) {
      console.log('\n🔄 PASO 4: Actualizando pagos con tasa 145...');
      
      // Para cada pago, usar la tasa de su rifa o 12.3 como fallback
      for (const pago of pagosConTasa145) {
        const nuevaTasa = pago.rifas?.tasa || 12.3;
        const nuevoMontoBs = pago.monto_usd * nuevaTasa;
        
        console.log(`  Actualizando pago ${pago.id}:`);
        console.log(`    Tasa anterior: ${pago.tasa_cambio} -> Nueva tasa: ${nuevaTasa}`);
        console.log(`    Monto Bs anterior: ${pago.monto_bs} -> Nuevo monto Bs: ${nuevoMontoBs.toFixed(2)}`);
        
        const { error: errorUpdatePago } = await supabase
          .from('pagos')
          .update({ 
            tasa_cambio: nuevaTasa,
            monto_bs: nuevoMontoBs
          })
          .eq('id', pago.id);

        if (errorUpdatePago) {
          console.error(`❌ Error actualizando pago ${pago.id}:`, errorUpdatePago);
        } else {
          console.log(`    ✅ Pago ${pago.id} actualizado correctamente`);
        }
      }
    }

    // PASO 5: Verificación final
    console.log('\n📊 PASO 5: Verificación final...');
    
    const { data: rifasFinal, error: errorRifasFinal } = await supabase
      .from('rifas')
      .select('id, titulo, tasa')
      .eq('tasa', 145);

    const { data: pagosFinal, error: errorPagosFinal } = await supabase
      .from('pagos')
      .select('id, tasa_cambio')
      .eq('tasa_cambio', 145);

    console.log(`📋 Rifas con tasa 145 después de actualización: ${rifasFinal?.length || 0}`);
    console.log(`📋 Pagos con tasa 145 después de actualización: ${pagosFinal?.length || 0}`);

    if ((rifasFinal?.length || 0) === 0 && (pagosFinal?.length || 0) === 0) {
      console.log('\n🎉 ¡Actualización completada exitosamente!');
      console.log('✅ Todas las tasas de 145 han sido actualizadas');
    } else {
      console.log('\n⚠️  Algunas tasas de 145 aún persisten');
    }

  } catch (error) {
    console.error('💥 Error general:', error);
  }
}

// Ejecutar el script
updateExistingRates();
