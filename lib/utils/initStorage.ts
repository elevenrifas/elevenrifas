// =====================================================
// 🚀 INITIALIZE STORAGE - ELEVEN RIFAS
// =====================================================
// Script para inicializar buckets de Supabase Storage
// Ejecutar una vez al desplegar la aplicación
// =====================================================

import { initializeStorageBuckets } from './supabaseStorage'

/**
 * Inicializar buckets de storage para la aplicación
 * Esta función debe ejecutarse una vez al desplegar
 */
export async function initializeAppStorage() {
  console.log('🚀 [initStorage] Inicializando buckets de Supabase Storage...')
  
  try {
    const result = await initializeStorageBuckets()
    
    if (result.success) {
      console.log('✅ [initStorage] Buckets inicializados correctamente')
      return { success: true }
    } else {
      console.error('❌ [initStorage] Errores al inicializar buckets:', result.errors)
      return { success: false, errors: result.errors }
    }
    
  } catch (error) {
    console.error('💥 [initStorage] Error inesperado:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Verificar estado de los buckets
 * Útil para debugging y monitoreo
 */
export async function checkStorageStatus() {
  console.log('🔍 [initStorage] Verificando estado de buckets...')
  
  try {
    const result = await initializeStorageBuckets()
    
    if (result.success) {
      console.log('✅ [initStorage] Todos los buckets están disponibles')
      return { 
        status: 'ready',
        message: 'Storage listo para usar'
      }
    } else {
      console.warn('⚠️ [initStorage] Algunos buckets tienen problemas:', result.errors)
      return { 
        status: 'warning',
        message: 'Storage parcialmente disponible',
        errors: result.errors
      }
    }
    
  } catch (error) {
    console.error('❌ [initStorage] Error verificando storage:', error)
    return { 
      status: 'error',
      message: 'Error verificando storage',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

// Exportar funciones para uso manual si es necesario
export { initializeStorageBuckets } from './supabaseStorage'
