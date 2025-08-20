// =====================================================
// 🔍 SCRIPT: Verificar Usuario Existente
// =====================================================
// Verifica si el usuario existe en auth.users
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

async function checkUser() {
  console.log('🔍 Verificando usuario: alexander.ceron16@gmail.com\n')

  try {
    // Buscar usuario por email
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.log('❌ Error al listar usuarios:')
      console.log(error.message)
      return
    }

    const user = users.users.find(u => u.email === 'alexander.ceron16@gmail.com')
    
    if (user) {
      console.log('✅ Usuario encontrado en auth.users:')
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Confirmed: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
      
      return user.id
    } else {
      console.log('❌ Usuario no encontrado en auth.users')
      console.log('\n💡 Para crear el usuario:')
      console.log('1. Ve a Supabase Dashboard → Authentication → Users')
      console.log('2. Click "Add User"')
      console.log('3. Email: alexander.ceron16@gmail.com')
      console.log('4. Password: 1234')
      console.log('5. Confirm email: ✅')
      return null
    }

  } catch (error) {
    console.log('❌ Error inesperado:')
    console.log(error.message)
    return null
  }
}

checkUser()
