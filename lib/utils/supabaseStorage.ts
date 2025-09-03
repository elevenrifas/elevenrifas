// =====================================================
// 🗄️ SUPABASE STORAGE UTILITIES - ELEVEN RIFAS
// =====================================================
// Utilidades para manejar archivos en Supabase Storage
// Compatible con Vercel y otros entornos serverless
// =====================================================

import { createClient } from '@supabase/supabase-js'

// Configuración del cliente Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Cliente con permisos de administrador para operaciones de storage
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// =====================================================
// 📋 TIPOS Y INTERFACES
// =====================================================

export interface UploadResult {
  success: boolean
  url?: string
  path?: string
  error?: string
  fileName?: string
}

export interface StorageConfig {
  bucket: string
  folder?: string
  maxSize?: number // en bytes
  allowedTypes?: string[]
}

// =====================================================
// 🔧 FUNCIONES PRINCIPALES
// =====================================================

/**
 * Subir imagen de rifa a Supabase Storage
 * @param file - Archivo de imagen
 * @param rifaId - ID de la rifa
 * @returns Resultado de la subida
 */
export async function uploadRifaImage(
  file: File, 
  rifaId: string
): Promise<UploadResult> {
  try {
    // Validar archivo
    const validation = validateFile(file, {
      bucket: 'imagenes-rifas',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    })

    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    // Generar nombre único con estructura de carpetas
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `rifa-${rifaId}_${timestamp}_${randomString}.${extension}`
    const filePath = `rifas/${rifaId}/${fileName}`

    console.log('🔍 [uploadRifaImage] Intentando subir:', {
      bucket: 'imagenes-rifas',
      filePath,
      fileName,
      rifaId
    })

    // Subir archivo - Supabase creará las carpetas automáticamente
    const { data, error } = await supabaseAdmin.storage
      .from('imagenes-rifas')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false // No sobrescribir si existe
      })

    if (error) {
      console.error('❌ Error subiendo imagen:', error)
      return { success: false, error: error.message }
    }

    // Obtener URL pública
    const { data: urlData } = supabaseAdmin.storage
      .from('imagenes-rifas')
      .getPublicUrl(filePath)

    console.log('✅ [uploadRifaImage] Imagen subida exitosamente:', urlData.publicUrl)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName
    }

  } catch (error) {
    console.error('💥 Error inesperado subiendo imagen:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Subir comprobante de pago a Supabase Storage
 * @param file - Archivo del comprobante
 * @param rifaId - ID de la rifa
 * @param pagoId - ID del pago (opcional)
 * @returns Resultado de la subida
 */
export async function uploadComprobante(
  file: File, 
  rifaId: string,
  pagoId?: string
): Promise<UploadResult> {
  try {
    // Validar archivo
    const validation = validateFile(file, {
      bucket: 'Comprobantes', // Usar tu bucket existente
      maxSize: 35 * 1024 * 1024, // 35MB
      allowedTypes: [
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'application/pdf'
      ]
    })

    if (!validation.success) {
      return { success: false, error: validation.error }
    }

    // Generar nombre único
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = pagoId 
      ? `pago-${pagoId}_${timestamp}_${randomString}.${extension}`
      : `comprobante_${timestamp}_${randomString}.${extension}`
    
    const filePath = `rifas/${rifaId}/${fileName}`

    // Subir archivo al bucket "Comprobantes"
    const { data, error } = await supabaseAdmin.storage
      .from('Comprobantes') // Tu bucket existente
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('❌ Error subiendo comprobante:', error)
      return { success: false, error: error.message }
    }

    // Obtener URL pública del bucket "Comprobantes"
    const { data: urlData } = supabaseAdmin.storage
      .from('Comprobantes') // Tu bucket existente
      .getPublicUrl(filePath)

    return {
      success: true,
      url: urlData.publicUrl,
      path: filePath,
      fileName
    }

  } catch (error) {
    console.error('💥 Error inesperado subiendo comprobante:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Eliminar archivo de Supabase Storage
 * @param bucket - Nombre del bucket
 * @param filePath - Ruta del archivo
 * @returns Resultado de la eliminación
 */
export async function deleteFile(
  bucket: string, 
  filePath: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('❌ Error eliminando archivo:', error)
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    console.error('💥 Error inesperado eliminando archivo:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// =====================================================
// 🔍 FUNCIONES DE VALIDACIÓN
// =====================================================

/**
 * Validar archivo antes de subir
 * @param file - Archivo a validar
 * @param config - Configuración de validación
 * @returns Resultado de la validación
 */
function validateFile(file: File, config: StorageConfig): { success: boolean; error?: string } {
  // Validar tipo de archivo
  if (config.allowedTypes && !config.allowedTypes.includes(file.type)) {
    return {
      success: false,
      error: `Tipo de archivo no permitido. Tipos aceptados: ${config.allowedTypes.join(', ')}`
    }
  }

  // Validar tamaño
  if (config.maxSize && file.size > config.maxSize) {
    const maxSizeMB = (config.maxSize / (1024 * 1024)).toFixed(1)
    return {
      success: false,
      error: `Archivo demasiado grande. Tamaño máximo: ${maxSizeMB}MB`
    }
  }

  return { success: true }
}

// =====================================================
// 🗂️ FUNCIONES DE GESTIÓN DE BUCKETS
// =====================================================

/**
 * Crear bucket si no existe (solo para configuración inicial)
 * @param bucketName - Nombre del bucket
 * @param isPublic - Si el bucket debe ser público
 * @returns Resultado de la creación
 */
export async function createBucketIfNotExists(
  bucketName: string, 
  isPublic: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verificar si el bucket existe
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets()
    
    if (listError) {
      console.error('❌ Error listando buckets:', listError)
      return { success: false, error: listError.message }
    }

    const bucketExists = buckets.some(bucket => bucket.name === bucketName)
    
    if (bucketExists) {
      return { success: true }
    }

    // Crear bucket
    const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
      public: isPublic,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/webp',
        'application/pdf'
      ]
    })

    if (createError) {
      console.error('❌ Error creando bucket:', createError)
      return { success: false, error: createError.message }
    }

    return { success: true }

  } catch (error) {
    console.error('💥 Error inesperado creando bucket:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Inicializar buckets necesarios para la aplicación
 * @returns Resultado de la inicialización
 */
export async function initializeStorageBuckets(): Promise<{ success: boolean; errors?: string[] }> {
  const buckets = [
    { name: 'imagenes-rifas', public: true },
    { name: 'Comprobantes', public: true } // Tu bucket existente
  ]

  const errors: string[] = []

  for (const bucket of buckets) {
    const result = await createBucketIfNotExists(bucket.name, bucket.public)
    if (!result.success) {
      errors.push(`Error creando bucket ${bucket.name}: ${result.error}`)
    }
  }

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return { success: true }
}
