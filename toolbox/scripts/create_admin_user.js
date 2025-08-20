/**
 * 🛠️ SCRIPT: Crear Usuario Administrador
 * 
 * Este script crea un usuario administrador en Supabase
 * Uso: node toolbox/scripts/create_admin_user.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno no configuradas')
  console.error('Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const email = 'admin@elevenrifas.com'
  const password = 'admin123456'
  
  try {
    console.log('🔐 Creando usuario administrador...')
    
    // 1. Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true
    })
    
    if (authError) {
      console.error('❌ Error al crear usuario en auth:', authError.message)
      return
    }
    
    console.log('✅ Usuario creado en auth:', authData.user.id)
    
    // 2. Crear perfil con rol de admin
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        email: email,
        role: 'admin',
        created_at: new Date().toISOString()
      })
    
    if (profileError) {
      console.error('❌ Error al crear perfil:', profileError.message)
      return
    }
    
    console.log('✅ Perfil de administrador creado')
    console.log('')
    console.log('🎉 Usuario administrador creado exitosamente!')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login')
    
  } catch (error) {
    console.error('💥 Error inesperado:', error.message)
  }
}

createAdminUser()
