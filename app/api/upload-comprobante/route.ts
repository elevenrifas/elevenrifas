import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const carpetaRifa = formData.get('carpetaRifa') as string;
    
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
    
    // Validar tipo de archivo
    const tiposPermitidos = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    
    if (!tiposPermitidos.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo de archivo no permitido' },
        { status: 400 }
      );
    }
    
    // Validar tamaño (10MB máximo)
    const tamañoMaximo = 10 * 1024 * 1024;
    if (file.size > tamañoMaximo) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande (máximo 10MB)' },
        { status: 400 }
      );
    }
    
    // Crear ruta base para comprobantes
    const rutaBase = join(process.cwd(), 'public', 'comprobantes');
    const rutaCarpetaRifa = join(rutaBase, carpetaRifa);
    
    // Crear carpeta de rifa si no existe
    if (!existsSync(rutaCarpetaRifa)) {
      await mkdir(rutaCarpetaRifa, { recursive: true });
      console.log('📁 Carpeta creada:', rutaCarpetaRifa);
    }
    
    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreArchivo = `${timestamp}_${file.name}`;
    const rutaCompleta = join(rutaCarpetaRifa, nombreArchivo);
    
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Escribir archivo
    await writeFile(rutaCompleta, buffer);
    
    console.log('📁 Archivo subido:', rutaCompleta);
    
    // Retornar ruta relativa para la base de datos
    const rutaRelativa = `/comprobantes/${carpetaRifa}/${nombreArchivo}`;
    
    return NextResponse.json({
      success: true,
      ruta: rutaRelativa,
      nombre: file.name,
      tamaño: file.size,
      tipo: file.type
    });
    
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        detalles: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

