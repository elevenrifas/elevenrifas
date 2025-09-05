#!/usr/bin/env node

/**
 * 🧪 PRUEBA DE RENDIMIENTO - AUTENTICACIÓN ADMIN
 * ==============================================
 * Script para medir y comparar el rendimiento
 * del sistema de autenticación optimizado
 * ==============================================
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthPerformance() {
  console.log('🧪 Iniciando prueba de rendimiento de autenticación...\n')

  const tests = [
    {
      name: 'Consulta básica de sesión',
      test: async () => {
        const start = performance.now()
        const { data, error } = await supabase.auth.getSession()
        const duration = performance.now() - start
        return { duration, success: !error, error }
      }
    },
    {
      name: 'Consulta de perfil admin (sin optimización)',
      test: async () => {
        const start = performance.now()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .eq('role', 'admin')
          .limit(1)
        const duration = performance.now() - start
        return { duration, success: !error, error, count: data?.length || 0 }
      }
    },
    {
      name: 'Consulta de perfil por ID (optimizada)',
      test: async () => {
        // Simular un ID de usuario
        const testUserId = '00000000-0000-0000-0000-000000000000'
        const start = performance.now()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .eq('id', testUserId)
          .eq('role', 'admin')
          .single()
        const duration = performance.now() - start
        return { duration, success: !error, error }
      }
    },
    {
      name: 'Consulta con filtros múltiples',
      test: async () => {
        const start = performance.now()
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, role, created_at')
          .eq('role', 'admin')
          .not('email', 'is', null)
          .limit(10)
        const duration = performance.now() - start
        return { duration, success: !error, error, count: data?.length || 0 }
      }
    }
  ]

  const results = []

  for (const test of tests) {
    console.log(`🔄 Ejecutando: ${test.name}...`)
    
    try {
      const result = await test.test()
      results.push({
        name: test.name,
        ...result
      })
      
      const status = result.success ? '✅' : '❌'
      const time = result.duration.toFixed(2)
      const count = result.count ? ` (${result.count} registros)` : ''
      
      console.log(`   ${status} Completado en ${time}ms${count}`)
      
      if (result.error) {
        console.log(`   ⚠️  Error: ${result.error.message || result.error}`)
      }
      
    } catch (error) {
      console.log(`   ❌ Error inesperado: ${error.message}`)
      results.push({
        name: test.name,
        duration: 0,
        success: false,
        error: error.message
      })
    }
    
    console.log('')
  }

  // Análisis de resultados
  console.log('📊 Análisis de rendimiento:')
  console.log('=' .repeat(50))
  
  const successfulTests = results.filter(r => r.success)
  const failedTests = results.filter(r => !r.success)
  
  if (successfulTests.length > 0) {
    const avgDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0) / successfulTests.length
    const minDuration = Math.min(...successfulTests.map(r => r.duration))
    const maxDuration = Math.max(...successfulTests.map(r => r.duration))
    
    console.log(`✅ Pruebas exitosas: ${successfulTests.length}/${results.length}`)
    console.log(`⏱️  Tiempo promedio: ${avgDuration.toFixed(2)}ms`)
    console.log(`⚡ Tiempo mínimo: ${minDuration.toFixed(2)}ms`)
    console.log(`🐌 Tiempo máximo: ${maxDuration.toFixed(2)}ms`)
  }
  
  if (failedTests.length > 0) {
    console.log(`❌ Pruebas fallidas: ${failedTests.length}`)
    failedTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`)
    })
  }

  // Recomendaciones
  console.log('\n💡 Recomendaciones:')
  
  const slowTests = successfulTests.filter(r => r.duration > 1000)
  if (slowTests.length > 0) {
    console.log('⚠️  Consultas lentas detectadas (>1000ms):')
    slowTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.duration.toFixed(2)}ms`)
    })
    console.log('   💡 Considerar crear índices adicionales')
  }
  
  const fastTests = successfulTests.filter(r => r.duration < 100)
  if (fastTests.length > 0) {
    console.log('✅ Consultas rápidas detectadas (<100ms):')
    fastTests.forEach(test => {
      console.log(`   - ${test.name}: ${test.duration.toFixed(2)}ms`)
    })
  }

  console.log('\n🎯 Próximos pasos:')
  console.log('   1. Ejecutar: node toolbox/optimize_admin_auth_performance.js')
  console.log('   2. Implementar el sistema optimizado')
  console.log('   3. Monitorear rendimiento en producción')

  return results
}

// Ejecutar pruebas
testAuthPerformance()
  .then(() => {
    console.log('\n🎉 Pruebas de rendimiento completadas!')
  })
  .catch(error => {
    console.error('❌ Error durante las pruebas:', error)
    process.exit(1)
  })
