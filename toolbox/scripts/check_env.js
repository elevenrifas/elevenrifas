// =====================================================
// 🔍 SCRIPT: Verificar Variables de Entorno
// =====================================================
// Verifica que las variables de entorno estén configuradas
// =====================================================

require('dotenv').config({ path: '.env.local' })

console.log('🔍 Verificando variables de entorno...\n')

const variables = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'SUPABASE_SERVICE_ROLE_KEY': process.env.SUPABASE_SERVICE_ROLE_KEY
}

let todasConfiguradas = true

Object.entries(variables).forEach(([key, value]) => {
  const status = value ? '✅' : '❌'
  const displayValue = value ? `${value.substring(0, 20)}...` : 'NO CONFIGURADA'
  
  console.log(`${status} ${key}: ${displayValue}`)
  
  if (!value) {
    todasConfiguradas = false
  }
})

console.log('\n' + '='.repeat(50))

if (todasConfiguradas) {
  console.log('✅ Todas las variables están configuradas')
  console.log('🚀 El sistema debería funcionar correctamente')
} else {
  console.log('❌ Faltan variables de entorno')
  console.log('\n📋 Para configurar:')
  console.log('1. Ve a tu proyecto de Supabase Dashboard')
  console.log('2. Settings → API')
  console.log('3. Copia las credenciales a .env.local')
  console.log('\n📝 Ejemplo de .env.local:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
  console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
}

console.log('\n' + '='.repeat(50))
