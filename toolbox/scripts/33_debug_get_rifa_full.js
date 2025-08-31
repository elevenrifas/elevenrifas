#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE DEBUG DETALLADO - getRifaFull
 * ====================================================
 * 
 * Este script nos permite probar la función getRifaFull paso a paso
 * para identificar exactamente dónde está la falla
 * 
 * USO:
 * node toolbox/scripts/33_debug_get_rifa_full.js
 * ====================================================
 */

const { createClient } = require('@supabase/supabase-js')

// =====================================================
// CONFIGURACIÓN DE SUPABASE
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes:')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌')
  console.error('')
  console.error('💡 Configura las variables de entorno antes de ejecutar este script')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// FUNCIÓN DE DEBUG PASO A PASO
// =====================================================

async function debugGetRifaFull(rifa_id) {
  console.log('🚀 ===== INICIANDO DEBUG getRifaFull =====')
  console.log('📋 Parámetros recibidos:')
  console.log('   - rifa_id:', rifa_id)
  console.log('   - tipo de rifa_id:', typeof rifa_id)
  console.log('   - rifa_id es undefined:', rifa_id === undefined)
  console.log('   - rifa_id es null:', rifa_id === null)
  console.log('   - rifa_id es string vacío:', rifa_id === '')
  
  if (!rifa_id || rifa_id === 'undefined' || rifa_id === 'null') {
    console.error('❌ rifa_id inválido - abortando función')
    return null
  }

  try {
    console.log('🔄 ===== INTENTANDO RPC get_rifa_full =====')
    console.log('📝 Llamando a supabase.rpc("get_rifa_full", { p_rifa_id:', rifa_id, ' })')
    
    // Intentar usar la función SQL RPC
    const { data, error } = await supabase.rpc('get_rifa_full', { p_rifa_id: rifa_id })
    
    console.log('📊 Respuesta RPC:')
    console.log('   - data:', data)
    console.log('   - error:', error)
    console.log('   - data es array:', Array.isArray(data))
    console.log('   - data.length:', data?.length)
    console.log('   - data[0]:', data?.[0])
    
    if (!error && data?.[0]) {
      console.log('✅ RPC get_rifa_full exitoso')
      console.log('📋 Datos retornados por RPC:')
      console.log('   - rifa_id:', data[0].rifa_id)
      console.log('   - titulo:', data[0].titulo)
      console.log('   - progreso:', data[0].progreso)
      console.log('   - vendidos:', data[0].vendidos)
      console.log('   - disponibles:', data[0].disponibles)
      return data[0]
    }
    
    if (error) {
      console.log('⚠️ RPC get_rifa_full falló con error:')
      console.log('   - message:', error.message)
      console.log('   - details:', error.details)
      console.log('   - hint:', error.hint)
      console.log('   - code:', error.code)
    }
  } catch (error) {
    console.log('⚠️ RPC get_rifa_full falló con excepción:')
    console.log('   - error:', error)
    console.log('   - tipo:', typeof error)
    console.log('   - stack:', error?.stack)
  }

  // Fallback: calcular directamente desde las tablas
  try {
    console.log('🔄 ===== USANDO FALLBACK =====')
    console.log('📝 rifa_id para fallback:', rifa_id)
    
    // 1. Obtener datos de la rifa
    console.log('📋 Paso 1: Obteniendo datos de la rifa...')
    console.log('📝 Query: .from("rifas").select("*").eq("id",', rifa_id, ').single()')
    
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select('*')
      .eq('id', rifa_id)
      .single()

    console.log('📊 Respuesta query rifa:')
    console.log('   - data (rifa):', rifa)
    console.log('   - error (rifaError):', rifaError)
    console.log('   - rifa es null:', rifa === null)
    console.log('   - rifa es undefined:', rifa === undefined)

    if (rifaError) {
      console.error('❌ Error obteniendo rifa:')
      console.error('   - message:', rifaError.message)
      console.error('   - details:', rifaError.details)
      console.error('   - hint:', rifaError.hint)
      console.error('   - code:', rifaError.code)
      return null
    }
    
    if (!rifa) {
      console.error('❌ No se encontró rifa con ID:', rifa_id)
      return null
    }
    
    console.log('✅ Rifa obtenida correctamente:')
    console.log('   - id:', rifa.id)
    console.log('   - titulo:', rifa.titulo)
    console.log('   - total_tickets:', rifa.total_tickets)

    // 2. Contar tickets vendidos
    console.log('📋 Paso 2: Contando tickets vendidos...')
    console.log('📝 Query: .from("tickets").select("*", { count: "exact", head: true }).eq("rifa_id",', rifa_id, ').eq("estado", "pagado")')
    
    const { count: vendidos, error: vendidosError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifa_id)
      .eq('estado', 'pagado')

    console.log('📊 Respuesta query tickets vendidos:')
    console.log('   - count (vendidos):', vendidos)
    console.log('   - error (vendidosError):', vendidosError)

    if (vendidosError) {
      console.error('❌ Error contando tickets vendidos:')
      console.error('   - message:', vendidosError.message)
      console.error('   - details:', vendidosError.details)
      console.error('   - hint:', vendidosError.hint)
      console.error('   - code:', vendidosError.code)
    } else {
      console.log('✅ Tickets vendidos contados correctamente:', vendidos || 0)
    }

    // 3. Contar reservas activas
    console.log('📋 Paso 3: Contando reservas activas...')
    console.log('📝 Query: .from("tickets").select("*", { count: "exact", head: true }).eq("rifa_id",', rifa_id, ').eq("estado", "reservado").gt("reservado_hasta",', new Date().toISOString(), ')')
    
    const { count: reservasActivas, error: reservasError } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifa_id)
      .eq('estado', 'reservado')
      .gt('reservado_hasta', new Date().toISOString())

    console.log('📊 Respuesta query reservas activas:')
    console.log('   - count (reservasActivas):', reservasActivas)
    console.log('   - error (reservasError):', reservasError)

    if (reservasError) {
      console.error('❌ Error contando reservas activas:')
      console.error('   - message:', reservasError.message)
      console.error('   - details:', reservasError.details)
      console.error('   - hint:', reservasError.hint)
      console.error('   - code:', reservasError.code)
    } else {
      console.log('✅ Reservas activas contadas correctamente:', reservasActivas || 0)
    }

    // 4. Calcular estadísticas
    console.log('📋 Paso 4: Calculando estadísticas...')
    console.log('📊 Valores para cálculo:')
    console.log('   - totalTickets (rifa.total_tickets):', rifa.total_tickets)
    console.log('   - ticketsVendidos (vendidos):', vendidos)
    console.log('   - reservas (reservasActivas):', reservasActivas)
    
    const totalTickets = rifa.total_tickets || 0
    const ticketsVendidos = vendidos || 0
    const reservas = reservasActivas || 0
    const disponibles = Math.max(0, totalTickets - ticketsVendidos - reservas)
    const progreso = totalTickets > 0 ? Math.round((ticketsVendidos / totalTickets) * 100) : 0
    
    console.log('📊 Estadísticas calculadas:')
    console.log('   - totalTickets:', totalTickets)
    console.log('   - ticketsVendidos:', ticketsVendidos)
    console.log('   - reservas:', reservas)
    console.log('   - disponibles:', disponibles)
    console.log('   - progreso:', progreso, '%')
    
    const resultado = {
      ...rifa,
      vendidos: ticketsVendidos,
      reservas_activas: reservas,
      disponibles,
      progreso
    }
    
    console.log('✅ ===== FALLBACK COMPLETADO EXITOSAMENTE =====')
    console.log('📋 Resultado final:', resultado)
    
    return resultado

  } catch (error) {
    console.error('💥 ===== ERROR FATAL EN FALLBACK =====')
    console.error('📋 Error completo:', error)
    console.error('📋 Tipo de error:', typeof error)
    console.error('📋 Mensaje:', error?.message)
    console.error('📋 Stack:', error?.stack)
    console.error('💥 ===== FIN ERROR FATAL =====')
    return null
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function main() {
  try {
    console.log('🚀 Iniciando debug de getRifaFull...')
    console.log('')
    
    // Primero, obtener una rifa para probar
    console.log('📋 Obteniendo lista de rifas para pruebas...')
    const { data: rifas, error: rifasError } = await supabase
      .from('rifas')
      .select('id, titulo')
      .eq('estado', 'activa')
      .limit(1)
    
    if (rifasError) {
      console.error('❌ Error obteniendo rifas:', rifasError.message)
      return
    }
    
    if (!rifas || rifas.length === 0) {
      console.error('❌ No hay rifas activas para probar')
      return
    }
    
    const rifaTest = rifas[0]
    console.log('✅ Rifa para pruebas encontrada:')
    console.log('   - ID:', rifaTest.id)
    console.log('   - Título:', rifaTest.titulo)
    console.log('')
    
    // Probar con la rifa real
    console.log('🧪 ===== PROBANDO CON RIFA REAL =====')
    const resultado = await debugGetRifaFull(rifaTest.id)
    
    if (resultado) {
      console.log('')
      console.log('🎉 ===== PRUEBA EXITOSA =====')
      console.log('📋 Resultado final:', resultado)
    } else {
      console.log('')
      console.log('❌ ===== PRUEBA FALLÓ =====')
    }
    
  } catch (error) {
    console.error('💥 Error fatal:', error.message)
    process.exit(1)
  }
}

// =====================================================
// EJECUCIÓN
// =====================================================

if (require.main === module) {
  main().catch(error => {
    console.error('💥 Error fatal:', error)
    process.exit(1)
  })
}

module.exports = {
  debugGetRifaFull
}
