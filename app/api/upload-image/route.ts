import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ninguna imagen' },
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

    // Crear directorio si no existe
    const imagesDir = join(process.cwd(), 'public', 'images')
    if (!existsSync(imagesDir)) {
      await mkdir(imagesDir, { recursive: true })
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const fileName = `${timestamp}_${randomString}.${extension}`

    // Ruta completa del archivo
    const filePath = join(imagesDir, fileName)

    // Convertir archivo a buffer y guardarlo
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // URL pública de la imagen
    const imageUrl = `/images/${fileName}`

    return NextResponse.json({
      success: true,
      imageUrl,
      fileName,
      message: 'Imagen subida exitosamente'
    })

  } catch (error) {
    console.error('Error al subir imagen:', error)
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
