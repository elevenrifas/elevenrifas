import { NextRequest, NextResponse } from 'next/server';
import { uploadComprobante } from '@/lib/utils/supabaseStorage';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const carpetaRifa = formData.get('carpetaRifa') as string;
    const rifaId = formData.get('rifaId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }
    
    if (!carpetaRifa) {
      return NextResponse.json(
        { error: 'No se proporcionó carpeta de rifa' },
        { status: 400 }
      );
    }

    if (!rifaId) {
      return NextResponse.json(
        { error: 'No se proporcionó ID de rifa' },
        { status: 400 }
      );
    }
    
    // Mostrar información del archivo para debugging
    console.log('📤 [upload-comprobante] ARCHIVO RECIBIDO:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      rifaId,
      carpetaRifa
    });
    
    // Validar tipo de archivo - SOLO PNG, JPG, JPEG y PDF
    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf'
    ];
    
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG y PDF' },
        { status: 400 }
      );
    }
    
    // Validar tamaño (35MB máximo)
    const tamañoMaximo = 35 * 1024 * 1024;
    if (file.size > tamañoMaximo) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande (máximo 35MB)' },
        { status: 400 }
      );
    }
    
    console.log('📂 [upload-comprobante] Procesando upload para rifa:', rifaId);
    
    // Subir comprobante a Supabase Storage
    const result = await uploadComprobante(file, rifaId);
    
    if (!result.success) {
      console.error('❌ [upload-comprobante] Error subiendo comprobante:', result.error);
      return NextResponse.json(
        { error: result.error || 'Error al subir el comprobante' },
        { status: 500 }
      );
    }
    
    console.log('✅ [upload-comprobante] Comprobante subido exitosamente:', result.url);
    
    return NextResponse.json({
      success: true,
      ruta: result.url,
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type
    });
    
  } catch (error) {
    console.error('💥 [upload-comprobante] Error inesperado:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}


