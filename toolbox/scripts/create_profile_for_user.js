// =====================================================
// 🔧 SCRIPT: Crear Perfil para Usuario
// =====================================================
// Crea el perfil en la tabla profiles para el usuario existente
// =====================================================

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.log('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createProfile() {
  console.log('🔧 Creando perfil para: alexander.ceron16@gmail.com\n')

  const userId = 'e5079bd9-b1fe-4f94-aa62-75a8e0c4b501'
  const userEmail = 'alexander.ceron16@gmail.com'

  try {
    // Verificar si el perfil ya existe
    console.log('1. Verificando si el perfil ya existe...')
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.log('❌ Error al verificar perfil:')
      console.log(checkError.message)
      return
    }

    if (existingProfile) {
      console.log('✅ Perfil ya existe:')
      console.log(`   ID: ${existingProfile.id}`)
      console.log(`   Email: ${existingProfile.email}`)
      console.log(`   Role: ${existingProfile.role}`)
      
      // Actualizar rol a admin si no lo está
      if (existingProfile.role !== 'admin') {
        console.log('\n2. Actualizando rol a admin...')
        const { error: updateError } = await supabaseAdmin
          .from('profiles')
          .update({ role: 'admin' })
          .eq('id', userId)
        
        if (updateError) {
          console.log('❌ Error al actualizar rol:')
          console.log(updateError.message)
        } else {
          console.log('✅ Rol actualizado a admin')
        }
      } else {
        console.log('✅ Usuario ya tiene rol de admin')
      }
    } else {
      console.log('❌ Perfil no encontrado, creando...')
      
      // Crear nuevo perfil
      const { data: newProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: userId,
          email: userEmail,
          role: 'admin',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (createError) {
        console.log('❌ Error al crear perfil:')
        console.log(createError.message)
        return
      }

      console.log('✅ Perfil creado exitosamente:')
      console.log(`   ID: ${newProfile.id}`)
      console.log(`   Email: ${newProfile.email}`)
      console.log(`   Role: ${newProfile.role}`)
    }

    // Verificación final
    console.log('\n3. Verificación final...')
    const { data: finalCheck, error: finalError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .eq('role', 'admin')
      .single()

    if (finalError) {
      console.log('❌ Error en verificación final:')
      console.log(finalError.message)
    } else {
      console.log('🎉 ¡Usuario admin configurado correctamente!')
      console.log('\n📋 Credenciales de acceso:')
      console.log('   Email: alexander.ceron16@gmail.com')
      console.log('   Contraseña: 1234')
      console.log('\n🌐 URL del admin panel:')
      console.log('   http://localhost:3000/admin/login')
    }

  } catch (error) {
    console.log('❌ Error inesperado:')
    console.log(error.message)
  }
}

createProfile()
