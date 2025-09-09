/**
 * 🚀 SCRIPT PARA CONFIGURAR CACHÉ EN VERCEL
 * 
 * Este script ayuda a configurar la solución profesional de caché
 * para el proyecto Eleven Rifas en Vercel
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuración
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function setupVercelCache() {
  console.log('🚀 Configurando solución profesional de caché para Vercel...')
  
  try {
    // Verificar configuración
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('❌ Variables de entorno de Supabase no configuradas')
    }

    // Crear cliente de Supabase
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    console.log('✅ Cliente de Supabase creado exitosamente')
    
    // Verificar conexión
    const { data: testData, error: testError } = await supabase
      .from('rifas')
      .select('id')
      .limit(1)
    
    if (testError) {
      throw new Error(`❌ Error conectando a la base de datos: ${testError.message}`)
    }
    
    console.log('✅ Conexión a base de datos verificada')
    
    // Mostrar configuración actual
    console.log('\n📋 CONFIGURACIÓN ACTUAL:')
    console.log(`- Supabase URL: ${SUPABASE_URL}`)
    console.log(`- Service Key: ${SUPABASE_SERVICE_KEY ? '✅ Configurado' : '❌ No configurado'}`)
    
    // Mostrar instrucciones para Vercel
    console.log('\n🔧 CONFIGURACIÓN EN VERCEL:')
    console.log('1. Ve a tu proyecto en Vercel Dashboard')
    console.log('2. Ve a Settings > Environment Variables')
    console.log('3. Agrega estas variables:')
    console.log('')
    console.log('   REVALIDATE_SECRET=tu-secret-super-seguro-aqui')
    console.log('   SUPABASE_WEBHOOK_SECRET=supabase-webhook-secret')
    console.log('   NEXT_PUBLIC_REVALIDATE_SECRET=tu-secret-super-seguro-aqui')
    console.log('')
    
    // Mostrar URL del webhook
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tu-dominio.vercel.app'
    console.log('🔗 CONFIGURAR WEBHOOK EN SUPABASE:')
    console.log('1. Ve a tu proyecto en Supabase Dashboard')
    console.log('2. Ve a Database > Webhooks')
    console.log('3. Crea un nuevo webhook con:')
    console.log(`   URL: ${appUrl}/api/webhooks/supabase`)
    console.log('   Events: INSERT, UPDATE, DELETE')
    console.log('   Tables: rifas, tickets, pagos')
    console.log('   HTTP Method: POST')
    console.log('')
    
    // Mostrar comandos de prueba
    console.log('🧪 COMANDOS DE PRUEBA:')
    console.log('')
    console.log('# Probar API de revalidación:')
    console.log(`curl -X POST ${appUrl}/api/revalidate \\`)
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"type": "full_revalidate", "secret": "tu-secret"}\'')
    console.log('')
    console.log('# Probar webhook:')
    console.log(`curl -X POST ${appUrl}/api/webhooks/supabase \\`)
    console.log('  -H "Content-Type: application/json" \\')
    console.log('  -d \'{"type": "INSERT", "table": "rifas", "record": {"id": "test"}}\'')
    console.log('')
    
    // Verificar rifas activas
    const { data: rifasActivas, error: rifasError } = await supabase
      .from('rifas')
      .select('id, titulo, estado, fecha_creacion')
      .eq('estado', 'activa')
      .order('fecha_creacion', { ascending: false })
    
    if (rifasError) {
      console.log('⚠️  No se pudieron obtener rifas activas:', rifasError.message)
    } else {
      console.log(`✅ Rifas activas encontradas: ${rifasActivas.length}`)
      if (rifasActivas.length > 0) {
        console.log('📋 Rifas activas:')
        rifasActivas.forEach((rifa, index) => {
          console.log(`  ${index + 1}. ${rifa.titulo} (ID: ${rifa.id})`)
        })
      }
    }
    
    console.log('\n✅ Configuración completada exitosamente')
    console.log('🚀 Tu aplicación está lista para usar caché profesional en Vercel')
    
  } catch (error) {
    console.error('❌ Error durante configuración:', error.message)
    process.exit(1)
  }
}

// Ejecutar script
if (require.main === module) {
  setupVercelCache()
}

module.exports = { setupVercelCache }
