#!/usr/bin/env node

/**
 * 🔍 SCRIPT DE VERIFICACIÓN RÁPIDA - FUNCIONES RPC
 * ====================================================
 * 
 * Este script verifica que las funciones RPC estén funcionando
 * después de haberlas creado en la base de datos
 * 
 * USO:
 * node toolbox/scripts/32_verify_rpc_functions.js
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
// VERIFICACIÓN DE FUNCIONES RPC
// =====================================================

async function verifyRPCFunctions() {
  console.log('🔍 Verificando funciones RPC...')
  
  try {
    // 1. Verificar get_rifas_full
    console.log('\n📋 Probando get_rifas_full...')
    const { data: rifas, error: rifasError } = await supabase.rpc('get_rifas_full')
    
    if (rifasError) {
      console.error('❌ Error en get_rifas_full:', rifasError.message)
    } else {
      console.log('✅ get_rifas_full funcionando correctamente')
      console.log(`   - Rifas encontradas: ${rifas?.length || 0}`)
      if (rifas && rifas.length > 0) {
        console.log(`   - Primera rifa: ${rifas[0].titulo} (ID: ${rifas[0].rifa_id})`)
      }
    }
    
    // 2. Verificar get_rifa_full (si hay rifas)
    if (rifas && rifas.length > 0) {
      console.log('\n📋 Probando get_rifa_full...')
      const rifaId = rifas[0].rifa_id
      
      const { data: rifa, error: rifaError } = await supabase.rpc('get_rifa_full', { 
        p_rifa_id: rifaId 
      })
      
      if (rifaError) {
        console.error('❌ Error en get_rifa_full:', rifaError.message)
      } else {
        console.log('✅ get_rifa_full funcionando correctamente')
        console.log(`   - Rifa obtenida: ${rifa?.[0]?.titulo || 'N/A'}`)
        console.log(`   - Progreso: ${rifa?.[0]?.progreso || 0}%`)
        console.log(`   - Vendidos: ${rifa?.[0]?.vendidos || 0}`)
        console.log(`   - Disponibles: ${rifa?.[0]?.disponibles || 0}`)
      }
    }
    
    // 3. Verificar desde information_schema
    console.log('\n📋 Verificando desde information_schema...')
    const { data: functions, error: schemaError } = await supabase
      .from('information_schema.routines')
      .select('routine_name, routine_type')
      .in('routine_name', ['get_rifa_full', 'get_rifas_full'])
    
    if (schemaError) {
      console.log('⚠️ No se pudo verificar desde information_schema')
    } else {
      console.log('✅ Funciones encontradas en information_schema:')
      functions.forEach(fn => {
        console.log(`   - ${fn.routine_name} (${fn.routine_type})`)
      })
    }
    
  } catch (error) {
    console.error('💥 Error durante la verificación:', error.message)
  }
}

// =====================================================
// FUNCIÓN PRINCIPAL
// =====================================================

async function main() {
  try {
    console.log('🚀 Iniciando verificación de funciones RPC...')
    console.log('')
    
    await verifyRPCFunctions()
    
    console.log('')
    console.log('🎉 Verificación completada!')
    console.log('')
    console.log('💡 Si las funciones están funcionando:')
    console.log('   1. Recarga tu aplicación Next.js')
    console.log('   2. Las funciones RPC deberían funcionar automáticamente')
    console.log('   3. El error "Error obteniendo rifa: {}" debería desaparecer')
    
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
  verifyRPCFunctions
}
