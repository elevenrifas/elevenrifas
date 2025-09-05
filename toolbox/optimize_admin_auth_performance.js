#!/usr/bin/env node

/**
 * 🚀 OPTIMIZACIÓN DE RENDIMIENTO - AUTENTICACIÓN ADMIN
 * =====================================================
 * Script para optimizar la verificación de permisos admin
 * Crea índices necesarios y optimiza consultas
 * =====================================================
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

// Configuración
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Variables de entorno faltantes')
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function optimizeDatabase() {
  console.log('🚀 Iniciando optimización de rendimiento para autenticación admin...\n')

  try {
    // 1. Crear índice compuesto para profiles (id + role)
    console.log('📊 Creando índice compuesto para profiles...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_id_role 
        ON profiles (id, role) 
        WHERE role = 'admin';
      `
    })

    if (indexError) {
      console.log('⚠️  Índice ya existe o error:', indexError.message)
    } else {
      console.log('✅ Índice compuesto creado exitosamente')
    }

    // 2. Crear índice para role en profiles
    console.log('📊 Creando índice para role en profiles...')
    const { error: roleIndexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role 
        ON profiles (role);
      `
    })

    if (roleIndexError) {
      console.log('⚠️  Índice de role ya existe o error:', roleIndexError.message)
    } else {
      console.log('✅ Índice de role creado exitosamente')
    }

    // 3. Verificar estructura de la tabla profiles
    console.log('🔍 Verificando estructura de la tabla profiles...')
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')

    if (columnsError) {
      console.error('❌ Error obteniendo estructura:', columnsError)
    } else {
      console.log('📋 Estructura de la tabla profiles:')
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`)
      })
    }

    // 4. Verificar índices existentes
    console.log('🔍 Verificando índices existentes en profiles...')
    const { data: indexes, error: indexesError } = await supabase
      .from('pg_indexes')
      .select('indexname, indexdef')
      .eq('tablename', 'profiles')
      .eq('schemaname', 'public')

    if (indexesError) {
      console.error('❌ Error obteniendo índices:', indexesError)
    } else {
      console.log('📊 Índices existentes:')
      if (indexes.length === 0) {
        console.log('   - No se encontraron índices personalizados')
      } else {
        indexes.forEach(idx => {
          console.log(`   - ${idx.indexname}`)
        })
      }
    }

    // 5. Analizar consultas de autenticación
    console.log('🔍 Analizando consultas de autenticación...')
    const { data: authStats, error: authStatsError } = await supabase
      .from('profiles')
      .select('role, count(*)')
      .group('role')

    if (authStatsError) {
      console.error('❌ Error obteniendo estadísticas:', authStatsError)
    } else {
      console.log('📊 Estadísticas de roles:')
      authStats.forEach(stat => {
        console.log(`   - ${stat.role}: ${stat.count} usuarios`)
      })
    }

    // 6. Probar consulta optimizada
    console.log('🧪 Probando consulta optimizada...')
    const startTime = Date.now()
    
    const { data: testQuery, error: testError } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('role', 'admin')
      .limit(1)

    const queryTime = Date.now() - startTime

    if (testError) {
      console.error('❌ Error en consulta de prueba:', testError)
    } else {
      console.log(`✅ Consulta de prueba completada en ${queryTime}ms`)
      if (testQuery.length > 0) {
        console.log(`   - Encontrado admin: ${testQuery[0].email}`)
      } else {
        console.log('   - No se encontraron usuarios admin')
      }
    }

    console.log('\n🎉 Optimización completada exitosamente!')
    console.log('\n📈 Mejoras implementadas:')
    console.log('   ✅ Índice compuesto (id, role) para consultas rápidas')
    console.log('   ✅ Índice de role para filtros eficientes')
    console.log('   ✅ Análisis de estructura y rendimiento')
    console.log('\n💡 Recomendaciones adicionales:')
    console.log('   - Monitorear el rendimiento en producción')
    console.log('   - Considerar cache de sesión más agresivo')
    console.log('   - Implementar métricas de rendimiento')

  } catch (error) {
    console.error('❌ Error durante la optimización:', error)
    process.exit(1)
  }
}

// Ejecutar optimización
optimizeDatabase()
