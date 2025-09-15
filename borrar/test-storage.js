#!/usr/bin/env node

// =====================================================
// 🧪 SCRIPT DE PRUEBA - SUPABASE STORAGE
// =====================================================
// Script para diagnosticar problemas con Supabase Storage
// =====================================================

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

async function testStorage() {
  console.log('🔍 [TEST-STORAGE] Iniciando diagnóstico de Supabase Storage...')
  
  // Verificar variables de entorno
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  
  console.log('📋 [TEST-STORAGE] Variables de entorno:')
  console.log('  - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Configurada' : '❌ Faltante')
  console.log('  - SUPABASE_SERVICE_ROLE_KEY:', serviceKey ? '✅ Configurada' : '❌ Faltante')
  
  if (!supabaseUrl || !serviceKey) {
    console.error('❌ [TEST-STORAGE] Variables de entorno faltantes')
    return
  }
  
  try {
    // Crear cliente
    const supabase = createClient(supabaseUrl, serviceKey)
    console.log('✅ [TEST-STORAGE] Cliente Supabase creado')
    
    // Listar buckets
    console.log('🔍 [TEST-STORAGE] Listando buckets disponibles...')
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ [TEST-STORAGE] Error listando buckets:', bucketsError.message)
      return
    }
    
    console.log('📦 [TEST-STORAGE] Buckets encontrados:')
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (${bucket.public ? 'Público' : 'Privado'})`)
    })
    
    // Verificar bucket específico
    const targetBucket = 'imagenes-rifas'
    const bucketExists = buckets.some(b => b.name === targetBucket)
    
    console.log(`\n🎯 [TEST-STORAGE] Verificando bucket '${targetBucket}':`)
    console.log(`  - Existe: ${bucketExists ? '✅ Sí' : '❌ No'}`)
    
    if (bucketExists) {
      // Intentar listar archivos del bucket
      console.log(`🔍 [TEST-STORAGE] Listando archivos en '${targetBucket}'...`)
      const { data: files, error: filesError } = await supabase.storage
        .from(targetBucket)
        .list('', { limit: 10 })
      
      if (filesError) {
        console.error(`❌ [TEST-STORAGE] Error listando archivos:`, filesError.message)
      } else {
        console.log(`📁 [TEST-STORAGE] Archivos en bucket:`, files?.length || 0)
      }
      
      // Verificar políticas RLS
      console.log(`🔒 [TEST-STORAGE] Verificando políticas RLS...`)
      try {
        const { data: policies, error: policiesError } = await supabase
          .from('storage.policies')
          .select('*')
          .eq('bucket_id', targetBucket)
        
        if (policiesError) {
          console.log(`  - Políticas: No se pudieron verificar (${policiesError.message})`)
        } else {
          console.log(`  - Políticas encontradas: ${policies?.length || 0}`)
        }
      } catch (e) {
        console.log(`  - Políticas: No se pudieron verificar`)
      }
    }
    
    // Test de permisos
    console.log(`\n🧪 [TEST-STORAGE] Probando permisos de escritura...`)
    try {
      const testFile = Buffer.from('test')
      const testPath = 'test/test.txt'
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(targetBucket)
        .upload(testPath, testFile, {
          contentType: 'text/plain',
          upsert: true
        })
      
      if (uploadError) {
        console.error(`❌ [TEST-STORAGE] Error de escritura:`, uploadError.message)
      } else {
        console.log(`✅ [TEST-STORAGE] Escritura exitosa:`, uploadData.path)
        
        // Limpiar archivo de prueba
        await supabase.storage
          .from(targetBucket)
          .remove([testPath])
        console.log(`🧹 [TEST-STORAGE] Archivo de prueba eliminado`)
      }
    } catch (e) {
      console.error(`❌ [TEST-STORAGE] Error en test de permisos:`, e.message)
    }
    
  } catch (error) {
    console.error('💥 [TEST-STORAGE] Error inesperado:', error.message)
  }
}

// Ejecutar test
testStorage().then(() => {
  console.log('\n🏁 [TEST-STORAGE] Diagnóstico completado')
  process.exit(0)
}).catch(error => {
  console.error('💥 [TEST-STORAGE] Error fatal:', error)
  process.exit(1)
})
