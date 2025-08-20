/**
 * 🛠️ SCRIPT: Configuración Completa del Admin
 * 
 * Este script te guía para configurar todo el sistema de administración
 * Uso: node toolbox/scripts/setup_admin.js
 */

const fs = require('fs')
const path = require('path')

console.log('🚀 CONFIGURACIÓN DEL SISTEMA DE ADMINISTRACIÓN')
console.log('===============================================')
console.log('')

// Verificar si existe .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (!fs.existsSync(envPath)) {
  console.log('📝 Paso 1: Crear archivo .env.local')
  console.log('Crea un archivo .env.local en la raíz del proyecto con:')
  console.log('')
  console.log('NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key')
  console.log('SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key')
  console.log('')
  console.log('💡 Encuentra estas claves en: Supabase Dashboard > Settings > API')
  console.log('')
} else {
  console.log('✅ Archivo .env.local encontrado')
}

console.log('🗄️ Paso 2: Crear tabla profiles en Supabase')
console.log('1. Ve a Supabase Dashboard > SQL Editor')
console.log('2. Copia y pega el contenido de: toolbox/scripts/create_profiles_table.sql')
console.log('3. Ejecuta el script SQL')
console.log('')

console.log('👤 Paso 3: Crear usuario administrador')
console.log('Ejecuta uno de estos comandos:')
console.log('')
console.log('Opción A (con .env.local):')
console.log('  npm run admin:create-user')
console.log('')
console.log('Opción B (configuración manual):')
console.log('  1. Edita: toolbox/scripts/create_admin_user_simple.js')
console.log('  2. Configura las variables de Supabase')
console.log('  3. Ejecuta: npm run admin:create-user-simple')
console.log('')

console.log('🌐 Paso 4: Acceder al panel')
console.log('1. Inicia el servidor: npm run dev')
console.log('2. Ve a: http://localhost:3000/admin/login')
console.log('3. Usa las credenciales:')
console.log('   Email: admin@elevenrifas.com')
console.log('   Contraseña: admin123456')
console.log('')

console.log('📋 Resumen de archivos creados:')
console.log('✅ admin/login/page.tsx - Página de login')
console.log('✅ admin/components/login-form.tsx - Formulario de login')
console.log('✅ admin/middleware.ts - Protección de rutas')
console.log('✅ admin/components/AdminNavbar.tsx - Navbar con logout')
console.log('✅ lib/database/admin_database/ - Lógica de base de datos')
console.log('✅ toolbox/scripts/ - Scripts de configuración')
console.log('')

console.log('🎉 ¡Sistema de administración listo!')
