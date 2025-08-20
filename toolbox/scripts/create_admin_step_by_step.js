// =====================================================
// 🔧 SCRIPT: Crear Usuario Admin Paso a Paso
// =====================================================
// Este script te guía para crear el usuario admin correctamente
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('🔧 SCRIPT: Crear Usuario Admin Paso a Paso')
console.log('='.repeat(50))

// Verificar variables de entorno
console.log('\n1. Verificando variables de entorno...')
if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL no configurada')
  process.exit(1)
}
if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY no configurada')
  process.exit(1)
}
if (!serviceRoleKey || serviceRoleKey === 'tu_service_role_key_aqui') {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY no configurada o es placeholder')
  console.log('\n💡 Para configurar:')
  console.log('1. Ve a Supabase Dashboard → Settings → API')
  console.log('2. Copia "service_role secret"')
  console.log('3. Reemplaza en .env.local:')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=tu_key_real_aqui')
  process.exit(1)
}

console.log('✅ Variables de entorno configuradas')

// Crear cliente con service role
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  console.log('\n2. Creando usuario admin en auth.users...')
  
  try {
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email: 'admin@elevenrifas.com',
      password: 'admin123',
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })

    if (error) {
      console.log('❌ Error al crear usuario en auth.users:')
      console.log(error.message)
      
      if (error.message.includes('already registered')) {
        console.log('\n💡 El usuario ya existe en auth.users')
        console.log('   Continuando con la verificación...')
      } else {
        return
      }
    } else {
      console.log('✅ Usuario creado en auth.users:')
      console.log(`   ID: ${user.user.id}`)
      console.log(`   Email: ${user.user.email}`)
    }

    console.log('\n3. Verificando tabla profiles...')
    
    // Verificar si la tabla profiles existe
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .limit(1)

    if (profilesError) {
      console.log('❌ Error al acceder a profiles:')
      console.log(profilesError.message)
      console.log('\n💡 Ejecuta primero el script SQL para crear la tabla profiles')
      return
    }

    console.log('✅ Tabla profiles accesible')

    // Buscar o crear el perfil admin
    console.log('\n4. Configurando perfil admin...')
    
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 'admin@elevenrifas.com')
      .single()

    if (existingProfile) {
      console.log('✅ Perfil admin ya existe')
      console.log(`   ID: ${existingProfile.id}`)
      console.log(`   Role: ${existingProfile.role}`)
      
      // Actualizar rol a admin si no lo está
      if (existingProfile.role !== 'admin') {
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', existingProfile.id)
        
        if (updateError) {
          console.log('❌ Error al actualizar rol:')
          console.log(updateError.message)
        } else {
          console.log('✅ Rol actualizado a admin')
        }
      }
    } else {
      console.log('❌ Perfil admin no encontrado')
      console.log('\n💡 Ejecuta el script SQL para crear el perfil admin')
      console.log('   O crea manualmente en Supabase Dashboard')
    }

    console.log('\n5. Verificación final...')
    
    // Verificar que todo esté correcto
    const { data: finalCheck } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('email', 'admin@elevenrifas.com')
      .eq('role', 'admin')
      .single()

    if (finalCheck) {
      console.log('🎉 ¡Usuario admin configurado correctamente!')
      console.log('\n📋 Credenciales de acceso:')
      console.log('   Email: admin@elevenrifas.com')
      console.log('   Contraseña: admin123')
      console.log('\n🌐 URL del admin panel:')
      console.log('   http://localhost:3000/admin/login')
    } else {
      console.log('❌ Verificación final falló')
      console.log('   El usuario admin no está completamente configurado')
    }

  } catch (error) {
    console.log('❌ Error inesperado:')
    console.log(error.message)
  }
}

createAdminUser()
