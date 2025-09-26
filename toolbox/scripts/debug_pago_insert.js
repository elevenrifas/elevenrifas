/**
 * 🔍 SCRIPT DEBUG - INSERCIÓN DE PAGOS
 * 
 * Script para diagnosticar por qué falla la inserción de pagos
 * en la función reportarPagoConTickets
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  console.log('Necesitas: NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugPagoInsert() {
  console.log('🔍 ===== DEBUG INSERCIÓN DE PAGOS =====\n');

  // PASO 1: Verificar estructura de la tabla pagos
  console.log('📋 PASO 1: Verificando estructura de tabla pagos...');
  try {
    const { data: estructura, error: estructuraError } = await supabase
      .from('pagos')
      .select('*')
      .limit(1);
    
    if (estructuraError) {
      console.error('❌ Error al acceder tabla pagos:', estructuraError);
      return;
    }
    
    console.log('✅ Tabla pagos accesible');
    if (estructura && estructura.length > 0) {
      console.log('📊 Columnas disponibles:', Object.keys(estructura[0]));
    }
  } catch (error) {
    console.error('💥 Error verificando estructura:', error);
    return;
  }

  // PASO 2: Probar inserción simple
  console.log('\n📝 PASO 2: Probando inserción simple...');
  const datosSimples = {
    tipo_pago: 'pago_movil',
    monto_bs: 100.00,
    monto_usd: 1.00,
    tasa_cambio: 100.00,
    referencia: `TEST-${Date.now()}`,
    estado: 'pendiente'
  };

  console.log('📝 Datos a insertar:', datosSimples);

  try {
    const { data: pagoSimple, error: errorSimple } = await supabase
      .from('pagos')
      .insert(datosSimples)
      .select()
      .single();

    if (errorSimple) {
      console.error('❌ Error en inserción simple:', errorSimple);
      console.log('🔍 Detalles del error:', {
        message: errorSimple.message,
        details: errorSimple.details,
        hint: errorSimple.hint,
        code: errorSimple.code
      });
    } else {
      console.log('✅ Inserción simple exitosa:', pagoSimple.id);
      
      // Limpiar el registro de prueba
      await supabase.from('pagos').delete().eq('id', pagoSimple.id);
      console.log('🧹 Registro de prueba eliminado');
    }
  } catch (error) {
    console.error('💥 Excepción en inserción simple:', error);
  }

  // PASO 3: Probar inserción con todos los campos
  console.log('\n📝 PASO 3: Probando inserción con todos los campos...');
  const datosCompletos = {
    tipo_pago: 'zinli',
    monto_bs: 6525.00,
    monto_usd: 45.00,
    tasa_cambio: 12.3,
    referencia: `FULL-TEST-${Date.now()}`,
    telefono_pago: '0145685655',
    banco_pago: null,
    cedula_pago: '27342473',
    fecha_visita: null,
    estado: 'pendiente',
    rifa_id: '51825a91-e2d5-429e-863e-df290d181c86' // UUID de rifa existente
  };

  console.log('📝 Datos completos a insertar:', datosCompletos);

  try {
    const { data: pagoCompleto, error: errorCompleto } = await supabase
      .from('pagos')
      .insert(datosCompletos)
      .select()
      .single();

    if (errorCompleto) {
      console.error('❌ Error en inserción completa:', errorCompleto);
      console.log('🔍 Detalles del error:', {
        message: errorCompleto.message,
        details: errorCompleto.details,
        hint: errorCompleto.hint,
        code: errorCompleto.code
      });
      
      // Si es error de FK, verificar que existe la rifa
      if (errorCompleto.code === '23503') {
        console.log('\n🔍 Verificando si existe la rifa...');
        const { data: rifa, error: rifaError } = await supabase
          .from('rifas')
          .select('id, titulo')
          .eq('id', datosCompletos.rifa_id)
          .single();
        
        if (rifaError) {
          console.log('❌ La rifa no existe:', rifaError);
        } else {
          console.log('✅ La rifa existe:', rifa.titulo);
        }
      }
    } else {
      console.log('✅ Inserción completa exitosa:', pagoCompleto.id);
      
      // Limpiar el registro de prueba
      await supabase.from('pagos').delete().eq('id', pagoCompleto.id);
      console.log('🧹 Registro de prueba eliminado');
    }
  } catch (error) {
    console.error('💥 Excepción en inserción completa:', error);
  }

  // PASO 4: Probar la función RPC
  console.log('\n🔧 PASO 4: Probando función RPC...');
  const datosRPC = {
    p_tipo_pago: 'zinli',
    p_monto_bs: 45.00,
    p_monto_usd: 6525.00,
    p_tasa_cambio: 12.3,
    p_referencia: `RPC-TEST-${Date.now()}`,
    p_telefono_pago: '0145685655',
    p_banco_pago: null,
    p_cedula_pago: '27342473',
    p_fecha_visita: null,
    p_estado: 'pendiente',
    p_cantidad_tickets: 1,
    p_rifa_id: '51825a91-e2d5-429e-863e-df290d181c86',
    p_nombre: 'Test Usuario',
    p_cedula: '27342473',
    p_telefono: '0145685655',
    p_correo: 'test@test.com'
  };

  console.log('📝 Datos RPC a enviar:', datosRPC);

  try {
    const { data: resultadoRPC, error: errorRPC } = await supabase
      .rpc('reportar_pago_con_tickets', datosRPC);

    if (errorRPC) {
      console.error('❌ Error en RPC:', errorRPC);
      console.log('🔍 Detalles del error RPC:', {
        message: errorRPC.message,
        details: errorRPC.details,
        hint: errorRPC.hint,
        code: errorRPC.code
      });
    } else {
      console.log('✅ RPC exitoso:', resultadoRPC);
      
      // Limpiar registros de prueba si se crearon
      if (resultadoRPC && resultadoRPC.pago_id) {
        await supabase.from('tickets').delete().eq('pago_id', resultadoRPC.pago_id);
        await supabase.from('pagos').delete().eq('id', resultadoRPC.pago_id);
        console.log('🧹 Registros RPC de prueba eliminados');
      }
    }
  } catch (error) {
    console.error('💥 Excepción en RPC:', error);
  }

  console.log('\n🎯 ===== FIN DEBUG =====');
}

// Ejecutar debug
debugPagoInsert()
  .then(() => {
    console.log('\n✅ Debug completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error en debug:', error);
    process.exit(1);
  });
