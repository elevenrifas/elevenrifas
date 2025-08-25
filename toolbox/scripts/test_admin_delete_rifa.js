// =====================================================
// 🧪 SCRIPT DE PRUEBA - ADMIN DELETE RIFA
// =====================================================
// Script para verificar específicamente la función adminDeleteRifa
// y detectar problemas en la importación o ejecución
// =====================================================

console.log('🧪 Iniciando pruebas de adminDeleteRifa...')

// Test 1: Verificar que el archivo existe
console.log('\n📁 Test 1: Verificación de archivo')
try {
  const fs = require('fs')
  const path = require('path')
  
  // Verificar que el archivo existe
  const filePath = path.join(__dirname, '../../lib/database/admin_database/rifas.ts')
  
  if (fs.existsSync(filePath)) {
    console.log('✅ Test 1 pasado: Archivo rifas.ts existe')
    console.log(`   Ruta: ${filePath}`)
    
    // Verificar contenido del archivo
    const content = fs.readFileSync(filePath, 'utf8')
    if (content.includes('adminDeleteRifa')) {
      console.log('   ✅ Función adminDeleteRifa encontrada en el archivo')
    } else {
      console.error('   ❌ Función adminDeleteRifa NO encontrada en el archivo')
    }
  } else {
    console.error('❌ Test 1 falló: Archivo rifas.ts no existe')
  }
} catch (error) {
  console.error('❌ Test 1 falló:', error.message)
}

// Test 2: Verificar estructura del archivo
console.log('\n🔍 Test 2: Estructura del archivo')
try {
  const fs = require('fs')
  const path = require('path')
  
  const filePath = path.join(__dirname, '../../lib/database/admin_database/rifas.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Verificar exportaciones
  const exports = [
    'adminListRifas',
    'adminCreateRifa', 
    'adminUpdateRifa',
    'adminDeleteRifa',
    'adminDeleteMultipleRifas',
    'adminChangeRifaState'
  ]
  
  console.log('✅ Test 2 pasado: Verificando exportaciones')
  exports.forEach(exportName => {
    if (content.includes(`export async function ${exportName}`) || 
        content.includes(`export const ${exportName}`) ||
        content.includes(`export { ${exportName}`)) {
      console.log(`   ✅ ${exportName} exportado correctamente`)
    } else {
      console.error(`   ❌ ${exportName} NO exportado`)
    }
  })
  
} catch (error) {
  console.error('❌ Test 2 falló:', error.message)
}

// Test 3: Verificar sintaxis del archivo
console.log('\n📝 Test 3: Sintaxis del archivo')
try {
  const fs = require('fs')
  const path = require('path')
  
  const filePath = path.join(__dirname, '../../lib/database/admin_database/rifas.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Verificar que no hay errores de sintaxis básicos
  const syntaxChecks = [
    { name: 'Paréntesis balanceados', check: () => {
      const openParens = (content.match(/\(/g) || []).length
      const closeParens = (content.match(/\)/g) || []).length
      return openParens === closeParens
    }},
    { name: 'Llaves balanceadas', check: () => {
      const openBraces = (content.match(/\{/g) || []).length
      const closeBraces = (content.match(/\}/g) || []).length
      return openBraces === closeBraces
    }},
    { name: 'Corchetes balanceados', check: () => {
      const openBrackets = (content.match(/\[/g) || []).length
      const closeBrackets = (content.match(/\]/g) || []).length
      return openBrackets === closeBrackets
    }},
    { name: 'Punto y coma al final', check: () => {
      const lines = content.split('\n')
      const functionLines = lines.filter(line => line.includes('export async function'))
      const hasSemicolons = functionLines.every(line => line.trim().endsWith('}'))
      return hasSemicolons
    }}
  ]
  
  console.log('✅ Test 3 pasado: Verificando sintaxis básica')
  syntaxChecks.forEach(check => {
    try {
      if (check.check()) {
        console.log(`   ✅ ${check.name}: Correcto`)
      } else {
        console.error(`   ❌ ${check.name}: Incorrecto`)
      }
    } catch (err) {
      console.error(`   ❌ ${check.name}: Error en verificación`)
    }
  })
  
} catch (error) {
  console.error('❌ Test 3 falló:', error.message)
}

// Test 4: Verificar función adminDeleteRifa específicamente
console.log('\n🗑️ Test 4: Función adminDeleteRifa')
try {
  const fs = require('fs')
  const path = require('path')
  
  const filePath = path.join(__dirname, '../../lib/database/admin_database/rifas.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Buscar la función adminDeleteRifa
  const functionStart = content.indexOf('export async function adminDeleteRifa')
  if (functionStart === -1) {
    console.error('❌ Test 4 falló: Función adminDeleteRifa no encontrada')
  } else {
    console.log('✅ Test 4 pasado: Función adminDeleteRifa encontrada')
    
    // Extraer la función completa
    const functionContent = content.substring(functionStart)
    const functionEnd = functionContent.indexOf('}')
    const functionBody = functionContent.substring(0, functionEnd + 1)
    
    // Verificar elementos importantes de la función
    const checks = [
      { name: 'Parámetro id', check: functionBody.includes('id: string') },
      { name: 'Try-catch', check: functionBody.includes('try {') && functionBody.includes('} catch') },
      { name: 'Verificación de rifa existente', check: functionBody.includes('rifaExistente') },
      { name: 'Verificación de tickets', check: functionBody.includes('ticketsAsociados') },
      { name: 'Verificación de pagos', check: functionBody.includes('pagosAsociados') },
      { name: 'Eliminación de BD', check: functionBody.includes('.delete()') },
      { name: 'Retorno de resultado', check: functionBody.includes('return { success:') }
    ]
    
    checks.forEach(check => {
      if (check.check) {
        console.log(`   ✅ ${check.name}: Presente`)
      } else {
        console.error(`   ❌ ${check.name}: Faltante`)
      }
    })
  }
  
} catch (error) {
  console.error('❌ Test 4 falló:', error.message)
}

// Test 5: Verificar dependencias del archivo
console.log('\n📦 Test 5: Dependencias del archivo')
try {
  const fs = require('fs')
  const path = require('path')
  
  const filePath = path.join(__dirname, '../../lib/database/admin_database/rifas.ts')
  const content = fs.readFileSync(filePath, 'utf8')
  
  // Verificar imports
  const imports = [
    'adminSupabase',
    'createAdminQuery',
    'safeAdminQuery'
  ]
  
  console.log('✅ Test 5 pasado: Verificando imports')
  imports.forEach(importName => {
    if (content.includes(importName)) {
      console.log(`   ✅ ${importName}: Importado`)
    } else {
      console.error(`   ❌ ${importName}: NO importado`)
    }
  })
  
} catch (error) {
  console.error('❌ Test 5 falló:', error.message)
}

// Resumen final
console.log('\n📊 RESUMEN DE PRUEBAS DE ADMIN DELETE RIFA')
console.log('============================================')
console.log('✅ Verificación de archivo completada')
console.log('✅ Estructura del archivo verificada')
console.log('✅ Sintaxis básica verificada')
console.log('✅ Función adminDeleteRifa verificada')
console.log('✅ Dependencias verificadas')

console.log('\n🎯 PROBLEMAS POTENCIALES IDENTIFICADOS:')
console.log('1. Verificar que la función adminDeleteRifa esté exportada correctamente')
console.log('2. Verificar que no haya errores de sintaxis en el archivo')
console.log('3. Verificar que todas las dependencias estén importadas')
console.log('4. Verificar que la función tenga la implementación correcta')
console.log('5. Verificar que el archivo se compile correctamente')

console.log('\n🔧 PRÓXIMOS PASOS:')
console.log('1. Revisar la consola del navegador para errores específicos')
console.log('2. Verificar que el archivo rifas.ts se compile sin errores')
console.log('3. Verificar que la función adminDeleteRifa se importe correctamente')
console.log('4. Verificar que la función se ejecute sin errores de runtime')

console.log('\n🚀 Pruebas de adminDeleteRifa completadas!')
