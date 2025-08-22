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

// Simular la función safeAdminQuery
function safeAdminQuery(queryFn, errorMessage) {
  return queryFn()
}

// Simular la función createAdminQuery
function createAdminQuery(table) {
  return supabase.from(table)
}

// Simular la función adminListCategorias
async function adminListCategorias(params = {}) {
  try {
    console.log('🔍 Parámetros recibidos:', params)
    
    let query = createAdminQuery('categorias_rifas').select('*')
    
    // Aplicar ordenamiento
    if (params.ordenarPor) {
      query = query.order(params.ordenarPor, { ascending: params.orden === 'asc' })
    } else {
      query = query.order('orden', { ascending: true })
    }
    
    // Aplicar límite y offset
    if (params.limite) {
      query = query.limit(params.limite)
    }
    if (params.offset) {
      query = query.range(params.offset, params.offset + (params.limite || 10) - 1)
    }
    
    console.log('📊 Ejecutando consulta...')
    const result = await query
    
    if (result.error) {
      console.error('❌ Error en la consulta:', result.error)
      return {
        success: false,
        data: [],
        total: 0,
        error: result.error.message
      }
    }
    
    console.log('✅ Consulta exitosa')
    console.log(`📈 Datos obtenidos: ${result.data?.length || 0} categorías`)
    
    return {
      success: true,
      data: result.data || [],
      total: result.data?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Error inesperado:', error)
    return {
      success: false,
      data: [],
      total: 0,
      error: error.message
    }
  }
}

async function testAdminCategorias() {
  console.log('🧪 Probando función adminListCategorias...')
  
  try {
    // 1. Probar sin parámetros
    console.log('\n📋 Test 1: Sin parámetros')
    const result1 = await adminListCategorias()
    console.log('Resultado:', result1)
    
    // 2. Probar con ordenamiento
    console.log('\n📋 Test 2: Con ordenamiento por nombre')
    const result2 = await adminListCategorias({
      ordenarPor: 'nombre',
      orden: 'asc'
    })
    console.log('Resultado:', result2)
    
    // 3. Probar con límite
    console.log('\n📋 Test 3: Con límite de 3')
    const result3 = await adminListCategorias({
      limite: 3
    })
    console.log('Resultado:', result3)
    
    // 4. Mostrar datos obtenidos
    if (result1.success && result1.data) {
      console.log('\n📊 Datos obtenidos:')
      result1.data.forEach((cat, index) => {
        console.log(`  ${index + 1}. ${cat.nombre} (ID: ${cat.id})`)
        console.log(`     - Orden: ${cat.orden}`)
        console.log(`     - Activa: ${cat.activa}`)
        console.log('')
      })
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error)
  }
}

// Ejecutar la prueba
testAdminCategorias()
  .then(() => {
    console.log('\n✅ Prueba completada')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error en la prueba:', error)
    process.exit(1)
  })
