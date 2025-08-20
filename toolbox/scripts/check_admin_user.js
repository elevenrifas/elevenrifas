// =====================================================
// 🔍 SCRIPT: Verificar Usuario Admin
// =====================================================
// Verifica si el usuario admin existe en la base de datos
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Variables de entorno no configuradas')
  console.log('Configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkAdminUser() {
  console.log('🔍 Verificando usuario admin...\n')

  try {
    // Verificar si la tabla profiles existe
    console.log('1. Verificando tabla profiles...')
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.log('❌ Error al acceder a la tabla profiles:')
      console.log(profilesError.message)
      console.log('\n💡 Posibles soluciones:')
      console.log('1. Ejecuta el script SQL para crear la tabla profiles')
      console.log('2. Verifica que las políticas RLS estén configuradas')
      return
    }

    console.log('✅ Tabla profiles accesible')

    // Buscar usuario admin
    console.log('\n2. Buscando usuario admin...')
    const { data: adminUser, error: adminError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'admin@elevenrifas.com')
      .eq('role', 'admin')
      .single()

    if (adminError) {
      if (adminError.code === 'PGRST116') {
        console.log('❌ Usuario admin no encontrado')
        console.log('\n💡 Para crear el usuario admin:')
        console.log('1. Primero crea el usuario en Supabase Auth')
        console.log('2. Luego ejecuta el script SQL para asignar rol admin')
      } else {
        console.log('❌ Error al buscar usuario admin:')
        console.log(adminError.message)
      }
      return
    }

    console.log('✅ Usuario admin encontrado:')
    console.log(`   ID: ${adminUser.id}`)
    console.log(`   Email: ${adminUser.email}`)
    console.log(`   Role: ${adminUser.role}`)
    console.log(`   Created: ${adminUser.created_at}`)

    // Verificar si el usuario existe en auth.users
    console.log('\n3. Verificando autenticación...')
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(adminUser.id)

    if (authError) {
      console.log('⚠️  No se puede verificar auth.users (permisos insuficientes)')
      console.log('   Esto es normal con anon key')
    } else {
      console.log('✅ Usuario existe en auth.users')
    }

    console.log('\n🎉 Usuario admin está configurado correctamente!')
    console.log('   Puedes hacer login con:')
    console.log('   Email: admin@elevenrifas.com')
    console.log('   Contraseña: admin123')

  } catch (error) {
    console.log('❌ Error inesperado:')
    console.log(error.message)
  }
}

checkAdminUser()
