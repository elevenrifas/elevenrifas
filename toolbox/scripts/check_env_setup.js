#!/usr/bin/env node

// =====================================================
// 🔍 VERIFICADOR DE CONFIGURACIÓN DE ENTORNO
// =====================================================
// Este script verifica que las variables de entorno estén configuradas correctamente
// =====================================================

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificando configuración de entorno...\n')

const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY'
]

let hasErrors = false

// Verificar variables requeridas
console.log('📋 Variables requeridas:')
requiredVars.forEach(varName => {
  const value = process.env[varName]
  if (value && value !== 'tu-proyecto.supabase.co' && value !== 'tu_anon_key_aqui') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`❌ ${varName}: NO CONFIGURADA`)
    hasErrors = true
  }
})

console.log('\n📋 Variables opcionales:')
optionalVars.forEach(varName => {
  const value = process.env[varName]
  if (value && value !== 'tu_service_role_key_aqui') {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`)
  } else {
    console.log(`⚠️  ${varName}: NO CONFIGURADA (opcional)`)
  }
})

console.log('\n' + '='.repeat(60))

if (hasErrors) {
  console.log('\n❌ ERROR: Faltan variables de entorno requeridas')
  console.log('\n📝 Para configurar las variables:')
  console.log('1. Copia el archivo env.example a .env.local')
  console.log('2. Reemplaza los valores con tus credenciales reales de Supabase')
  console.log('3. Reinicia el servidor de desarrollo')
  console.log('\n🔗 Obtén tus credenciales en: https://supabase.com/dashboard')
  process.exit(1)
} else {
  console.log('\n✅ Configuración de entorno correcta')
  console.log('\n🚀 Puedes iniciar el servidor con: npm run dev')
}
