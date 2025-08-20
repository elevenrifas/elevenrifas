/**
 * 🛠️ SCRIPT: Crear Usuario Administrador (Versión Simple)
 * 
 * Este script crea un usuario administrador en Supabase
 * Uso: node toolbox/scripts/create_admin_user_simple.js
 * 
 * IMPORTANTE: Configura las variables de entorno directamente en este archivo
 */

const { createClient } = require('@supabase/supabase-js')

// CONFIGURA AQUÍ TUS VARIABLES DE SUPABASE
const supabaseUrl = 'TU_SUPABASE_URL_AQUI' // Ejemplo: https://your-project.supabase.co
const supabaseServiceKey = 'TU_SERVICE_ROLE_KEY_AQUI' // Encuéntralo en Supabase Dashboard > Settings > API

if (supabaseUrl === 'TU_SUPABASE_URL_AQUI' || supabaseServiceKey === 'TU_SERVICE_ROLE_KEY_AQUI') {
  console.error('❌ Error: Configura las variables de Supabase en el script')
  console.error('1. Ve a Supabase Dashboard > Settings > API')
  console.error('2. Copia Project URL y Service Role Key')
  console.error('3. Reemplaza los valores en este archivo')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function createAdminUser() {
  const email = 'admin@elevenrifas.com'
  const password = 'admin123456'
  
  try {
    console.log('🔐 Creando usuario administrador...')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
    console.log('')
    
    // 1. Crear usuario en auth
    console.log('Paso 1: Creando usuario en autenticación...')
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
    console.log('Paso 2: Creando perfil de administrador...')
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
      console.log('💡 Intenta crear la tabla profiles manualmente en Supabase')
      return
    }
    
    console.log('✅ Perfil de administrador creado')
    console.log('')
    console.log('🎉 Usuario administrador creado exitosamente!')
    console.log('📧 Email:', email)
    console.log('🔑 Contraseña:', password)
    console.log('')
    console.log('⚠️  IMPORTANTE: Cambia la contraseña después del primer login')
    console.log('🌐 Accede a: http://localhost:3001/admin/login')
    
  } catch (error) {
    console.error('💥 Error inesperado:', error.message)
  }
}

createAdminUser()
