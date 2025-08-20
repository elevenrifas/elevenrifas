#!/usr/bin/env node

// =====================================================
// 🔐 PRUEBA DE LOGIN - ELEVEN RIFAS
// =====================================================
// Este script prueba la funcionalidad de login directamente
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

// Crear cliente de Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLogin() {
  console.log('🔐 Probando funcionalidad de login...\n')
  
  try {
    // 1. Verificar conexión
    console.log('1️⃣ Probando conexión a Supabase...')
    const { data: connectionTest, error: connectionError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      console.error('❌ Error de conexión:', connectionError.message)
      return
    }
    console.log('✅ Conexión exitosa\n')
    
    // 2. Verificar si hay usuarios admin
    console.log('2️⃣ Verificando usuarios administradores...')
    const { data: adminUsers, error: adminError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('role', 'admin')
      .limit(5)
    
    if (adminError) {
      console.error('❌ Error consultando usuarios admin:', adminError.message)
      return
    }
    
    if (!adminUsers || adminUsers.length === 0) {
      console.log('⚠️  No hay usuarios administradores en la base de datos')
      console.log('💡 Necesitas crear al menos un usuario admin primero')
      return
    }
    
    console.log(`✅ Encontrados ${adminUsers.length} usuarios admin:`)
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`)
    })
    console.log()
    
    // 3. Probar autenticación con el primer admin
    const testUser = adminUsers[0]
    console.log(`3️⃣ Probando autenticación con: ${testUser.email}`)
    
    // Nota: No podemos probar la contraseña real por seguridad
    console.log('⚠️  No se puede probar la contraseña real por seguridad')
    console.log('💡 Verifica que la contraseña sea correcta en el formulario web')
    
    // 4. Verificar estructura de la tabla profiles
    console.log('\n4️⃣ Verificando estructura de la tabla profiles...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Error consultando estructura de tabla:', tableError.message)
      return
    }
    
    if (tableInfo && tableInfo.length > 0) {
      const columns = Object.keys(tableInfo[0])
      console.log('✅ Columnas disponibles en profiles:', columns.join(', '))
    }
    
    console.log('\n🎯 Resumen de la prueba:')
    console.log('✅ Conexión a Supabase: FUNCIONANDO')
    console.log('✅ Tabla profiles: ACCESIBLE')
    console.log('✅ Usuarios admin: ENCONTRADOS')
    console.log('⚠️  Login: REQUIERE CREDENCIALES VÁLIDAS')
    
    console.log('\n💡 Para probar el login completo:')
    console.log('1. Abre http://localhost:3000/admin/login en tu navegador')
    console.log('2. Usa las credenciales de uno de los usuarios admin listados arriba')
    console.log('3. Revisa la consola del navegador para logs detallados')
    
  } catch (error) {
    console.error('💥 Error inesperado:', error.message)
  }
}

// Ejecutar la prueba
testLogin()
