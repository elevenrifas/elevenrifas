import { NextRequest, NextResponse } from 'next/server'
import { uploadRifaImage } from '@/lib/utils/supabaseStorage'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const rifaId = formData.get('rifaId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
        { status: 400 }
      )
    }

    if (!rifaId) {
      return NextResponse.json(
        { error: 'No se proporcionó ID de rifa' },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'El archivo debe ser una imagen' },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'La imagen debe ser menor a 5MB' },
        { status: 400 }
      )
    }

    console.log('📤 [upload-image] Subiendo imagen para rifa:', rifaId)
    console.log('📤 [upload-image] Archivo:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: `${(file.size / (1024 * 1024)).toFixed(2)} MB`
    })

    // Subir imagen a Supabase Storage
    const result = await uploadRifaImage(file, rifaId)

    if (!result.success) {
      console.error('❌ [upload-image] Error subiendo imagen:', result.error)
      return NextResponse.json(
        { error: result.error || 'Error al subir la imagen' },
        { status: 500 }
      )
    }

    console.log('✅ [upload-image] Imagen subida exitosamente:', result.url)

    return NextResponse.json({
      success: true,
      imageUrl: result.url,
      fileName: result.fileName,
      message: 'Imagen subida exitosamente'
    })

  } catch (error) {
    console.error('💥 [upload-image] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al subir la imagen' },
      { status: 500 }
    )
  }
}

// Configurar límites para la subida
export const config = {
  api: {
    bodyParser: false,
  },
}
