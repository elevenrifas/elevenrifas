const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno faltantes')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.log('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkCategorias() {
  console.log('🔍 Verificando tabla de categorías...')
  
  try {
    // 1. Verificar si hay datos en la tabla
    console.log('\n📊 Verificando datos en la tabla...')
    const { data: categorias, error: dataError } = await supabase
      .from('categorias_rifas')
      .select('*')
      .limit(10)
    
    if (dataError) {
      if (dataError.code === 'PGRST116') {
        console.log('❌ La tabla "categorias_rifas" no existe')
        console.log('💡 Necesitas crear la tabla primero')
        return
      }
      console.error('❌ Error al consultar datos:', dataError)
      return
    }
    
    console.log(`📈 Total de categorías encontradas: ${categorias.length}`)
    
    if (categorias.length > 0) {
      console.log('\n📋 Categorías existentes:')
      categorias.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.nombre} (ID: ${cat.id})`)
        console.log(`     - Descripción: ${cat.descripcion || 'Sin descripción'}`)
        console.log(`     - Color: ${cat.color}`)
        console.log(`     - Icono: ${cat.icono}`)
        console.log(`     - Activa: ${cat.activa}`)
        console.log(`     - Orden: ${cat.orden}`)
        console.log(`     - Fecha: ${cat.fecha_creacion}`)
        console.log('')
      })
    } else {
      console.log('⚠️ No hay categorías en la tabla')
      
      // 2. Insertar datos de ejemplo si la tabla está vacía
      console.log('\n➕ Insertando datos de ejemplo...')
      const exampleData = [
        {
          nombre: 'Vehículos',
          icono: 'car',
          descripcion: 'Rifas de vehículos y automóviles',
          color: '#3B82F6',
          activa: true,
          orden: 1
        },
        {
          nombre: 'Tecnología',
          icono: 'smartphone',
          descripcion: 'Rifas de dispositivos tecnológicos',
          color: '#10B981',
          activa: true,
          orden: 2
        },
        {
          nombre: 'Hogar',
          icono: 'home',
          descripcion: 'Rifas de artículos para el hogar',
          color: '#F59E0B',
          activa: false,
          orden: 3
        }
      ]
      
      const { data: insertedData, error: insertError } = await supabase
        .from('categorias_rifas')
        .insert(exampleData)
        .select()
      
      if (insertError) {
        console.error('❌ Error al insertar datos de ejemplo:', insertError)
        return
      }
      
      console.log(`✅ Se insertaron ${insertedData.length} categorías de ejemplo`)
      console.log('\n📋 Categorías insertadas:')
      insertedData.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.nombre} (ID: ${cat.id})`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
  }
}

// Ejecutar la verificación
checkCategorias()
  .then(() => {
    console.log('\n✅ Verificación completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en la verificación:', error)
    process.exit(1)
  })
