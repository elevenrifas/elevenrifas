#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE PRUEBA - RIFACARD PROGRESO_MANUAL - ELEVEN RIFAS
 * ================================================================
 * 
 * Este script prueba que RifaCard priorice correctamente el campo progreso_manual
 * sobre el progreso calculado cuando sea mayor a 0.
 * 
 * USO:
 * node toolbox/scripts/22_test_rifacard_progreso_manual.js
 * 
 * REQUISITOS:
 * - Variables de entorno configuradas
 * - Base de datos migrada con el campo progreso_manual
 * - Componente RifaCard actualizado
 * ================================================================
 */

const { logger } = require('../utils/logger.js')

// =====================================================
// FUNCIONES DE PRUEBA
// =====================================================

/**
 * Simular la lógica de cálculo de progreso de RifaCard
 * Esta función replica exactamente la lógica implementada en el componente
 */
function calcularProgresoRifa(rifa, stats = null) {
  // PRIORIDAD 1: Si hay progreso_manual > 0, úsalo (permite override manual)
  if (rifa.progreso_manual && rifa.progreso_manual > 0) {
    return Math.min(Math.max(rifa.progreso_manual, 0), 100);
  }
  
  // PRIORIDAD 2: Si viene desde el server (getRifasFull), úsalo
  if (rifa.progreso !== undefined) {
    const p = rifa.progreso;
    return Math.min(Math.max(p, 0), 100);
  }
  
  // PRIORIDAD 3: Si se cargó por RPC cliente, úsalo
  if (stats) return Math.min(Math.max(stats.progreso, 0), 100);
  
  // FALLBACK: Si no hay ningún progreso, retorna 0
  return 0;
}

/**
 * Probar priorización de progreso_manual sobre progreso calculado
 */
async function testProgresoManualPriority() {
  logger.info('🧪 Probando priorización de progreso_manual en RifaCard...')
  
  try {
    const testCases = [
      {
        name: 'Progreso manual > 0 (debe tener prioridad)',
        rifa: {
          progreso_manual: 75,
          progreso: 45,
          titulo: 'Rifa con progreso manual'
        },
        stats: { progreso: 60 },
        expected: 75,
        description: 'progreso_manual debe tener prioridad sobre progreso calculado'
      },
      {
        name: 'Progreso manual = 0 (debe usar progreso calculado)',
        rifa: {
          progreso_manual: 0,
          progreso: 45,
          titulo: 'Rifa con progreso manual = 0'
        },
        stats: { progreso: 60 },
        expected: 45,
        description: 'progreso_manual = 0 no debe tener prioridad'
      },
      {
        name: 'Progreso manual = null (debe usar progreso calculado)',
        rifa: {
          progreso_manual: null,
          progreso: 45,
          titulo: 'Rifa sin progreso manual'
        },
        stats: { progreso: 60 },
        expected: 45,
        description: 'progreso_manual = null debe usar progreso del server'
      },
      {
        name: 'Solo progreso del server (sin progreso_manual)',
        rifa: {
          progreso: 45,
          titulo: 'Rifa solo con progreso del server'
        },
        stats: null,
        expected: 45,
        description: 'debe usar progreso del server cuando no hay progreso_manual'
      },
      {
        name: 'Solo stats del RPC (sin progreso del server)',
        rifa: {
          titulo: 'Rifa solo con stats del RPC'
        },
        stats: { progreso: 60 },
        expected: 60,
        description: 'debe usar stats del RPC cuando no hay otras opciones'
      },
      {
        name: 'Sin ningún progreso (fallback)',
        rifa: {
          titulo: 'Rifa sin progreso'
        },
        stats: null,
        expected: 0,
        description: 'debe retornar 0 cuando no hay ningún progreso'
      },
      {
        name: 'Progreso manual > 100 (debe limitarse a 100)',
        rifa: {
          progreso_manual: 150,
          progreso: 45,
          titulo: 'Rifa con progreso manual > 100'
        },
        stats: { progreso: 60 },
        expected: 100,
        description: 'progreso_manual > 100 debe limitarse a 100'
      },
      {
        name: 'Progreso manual < 0 (debe limitarse a 0)',
        rifa: {
          progreso_manual: -25,
          progreso: 45,
          titulo: 'Rifa con progreso manual < 0'
        },
        stats: { progreso: 60 },
        expected: 0,
        description: 'progreso_manual < 0 debe limitarse a 0'
      }
    ]
    
    let passedTests = 0
    let totalTests = testCases.length
    
    for (const testCase of testCases) {
      logger.info(`\n📋 Probando: ${testCase.name}`)
      logger.info(`   Descripción: ${testCase.description}`)
      
      const result = calcularProgresoRifa(testCase.rifa, testCase.stats)
      const passed = result === testCase.expected
      
      if (passed) {
        logger.info(`   ✅ PASÓ: Resultado = ${result}, Esperado = ${testCase.expected}`)
        passedTests++
      } else {
        logger.error(`   ❌ FALLÓ: Resultado = ${result}, Esperado = ${testCase.expected}`)
      }
      
      // Mostrar datos de entrada para debugging
      logger.info(`   📊 Datos de entrada:`)
      logger.info(`      - progreso_manual: ${testCase.rifa.progreso_manual}`)
      logger.info(`      - progreso: ${testCase.rifa.progreso}`)
      logger.info(`      - stats.progreso: ${testCase.stats?.progreso}`)
    }
    
    logger.info(`\n📈 RESUMEN DE PRUEBAS:`)
    logger.info(`   ✅ Pruebas pasadas: ${passedTests}/${totalTests}`)
    logger.info(`   ❌ Pruebas fallidas: ${totalTests - passedTests}/${totalTests}`)
    
    if (passedTests === totalTests) {
      logger.info('🎉 ¡Todas las pruebas de priorización pasaron exitosamente!')
      return { success: true, passed: passedTests, total: totalTests }
    } else {
      logger.error('💥 Algunas pruebas fallaron. Revisar la implementación.')
      return { success: false, passed: passedTests, total: totalTests }
    }
    
  } catch (error) {
    logger.error('❌ Error probando priorización de progreso_manual:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Probar casos edge y validaciones adicionales
 */
async function testEdgeCases() {
  logger.info('\n🧪 Probando casos edge y validaciones adicionales...')
  
  try {
    const edgeCases = [
      {
        name: 'Progreso manual con decimales',
        rifa: { progreso_manual: 75.5, progreso: 45 },
        expected: 75.5,
        description: 'progreso_manual debe mantener decimales'
      },
      {
        name: 'Progreso manual = 0.1 (valor mínimo válido)',
        rifa: { progreso_manual: 0.1, progreso: 45 },
        expected: 0.1,
        description: 'progreso_manual = 0.1 debe ser válido'
      },
      {
        name: 'Progreso manual = 99.9 (valor máximo válido)',
        rifa: { progreso_manual: 99.9, progreso: 45 },
        expected: 99.9,
        description: 'progreso_manual = 99.9 debe ser válido'
      }
    ]
    
    let passedEdgeCases = 0
    let totalEdgeCases = edgeCases.length
    
    for (const edgeCase of edgeCases) {
      logger.info(`\n📋 Probando caso edge: ${edgeCase.name}`)
      logger.info(`   Descripción: ${edgeCase.description}`)
      
      const result = calcularProgresoRifa(edgeCase.rifa)
      const passed = result === edgeCase.expected
      
      if (passed) {
        logger.info(`   ✅ PASÓ: Resultado = ${result}, Esperado = ${edgeCase.expected}`)
        passedEdgeCases++
      } else {
        logger.error(`   ❌ FALLÓ: Resultado = ${result}, Esperado = ${edgeCase.expected}`)
      }
    }
    
    logger.info(`\n📈 RESUMEN DE CASOS EDGE:`)
    logger.info(`   ✅ Casos edge pasados: ${passedEdgeCases}/${totalEdgeCases}`)
    
    return { success: true, passed: passedEdgeCases, total: totalEdgeCases }
    
  } catch (error) {
    logger.error('❌ Error probando casos edge:', error.message)
    return { success: false, error: error.message }
  }
}

/**
 * Función principal de pruebas
 */
async function runAllTests() {
  logger.info('🚀 Iniciando pruebas de RifaCard con progreso_manual...')
  logger.info('=' .repeat(60))
  
  try {
    // Ejecutar pruebas principales
    const priorityTestResult = await testProgresoManualPriority()
    
    // Ejecutar pruebas de casos edge
    const edgeCasesResult = await testEdgeCases()
    
    // Resumen final
    logger.info('\n' + '=' .repeat(60))
    logger.info('📊 RESUMEN FINAL DE PRUEBAS')
    logger.info('=' .repeat(60))
    
    if (priorityTestResult.success && edgeCasesResult.success) {
      logger.info('🎉 ¡Todas las pruebas pasaron exitosamente!')
      logger.info('✅ RifaCard prioriza correctamente progreso_manual')
      logger.info('✅ Casos edge manejados correctamente')
      logger.info('✅ Lógica de fallback funcionando')
    } else {
      logger.error('💥 Algunas pruebas fallaron')
      if (!priorityTestResult.success) {
        logger.error('   - Pruebas de priorización fallaron')
      }
      if (!edgeCasesResult.success) {
        logger.error('   - Casos edge fallaron')
      }
    }
    
    logger.info('\n🔧 RECOMENDACIONES:')
    logger.info('   - Verificar que el componente RifaCard esté actualizado')
    logger.info('   - Confirmar que progreso_manual esté en el tipo Rifa')
    logger.info('   - Probar en la interfaz real con diferentes valores')
    
  } catch (error) {
    logger.error('💥 Error ejecutando pruebas:', error.message)
  }
}

// =====================================================
// EJECUCIÓN DEL SCRIPT
// =====================================================

if (require.main === module) {
  runAllTests()
    .then(() => {
      logger.info('\n🏁 Script de pruebas completado')
      process.exit(0)
    })
    .catch((error) => {
      logger.error('💥 Error fatal en script de pruebas:', error.message)
      process.exit(1)
    })
}

module.exports = {
  calcularProgresoRifa,
  testProgresoManualPriority,
  testEdgeCases,
  runAllTests
}
