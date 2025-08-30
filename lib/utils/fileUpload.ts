import { writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

/**
 * Subir archivo a carpeta local
 * @param file - Archivo a subir
 * @param carpetaRifa - Nombre de la carpeta de la rifa
 * @returns Ruta del archivo subido
 */
export async function subirArchivoLocal(
  file: File, 
  carpetaRifa: string
): Promise<string> {
  try {
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
    return `/comprobantes/${carpetaRifa}/${nombreArchivo}`;
    
  } catch (error) {
    console.error('❌ Error subiendo archivo:', error);
    throw new Error(`Error al subir archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}

/**
 * Sanitizar nombre de carpeta
 * @param titulo - Título de la rifa
 * @returns Nombre sanitizado para carpeta
 */
export function sanitizarNombreCarpeta(titulo: string): string {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .trim();
}

/**
 * Verificar si un archivo es válido
 * @param file - Archivo a verificar
 * @returns true si es válido
 */
export function validarArchivo(file: File): boolean {
  // Tipos permitidos
  const tiposPermitidos = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  // Tamaño máximo: 10MB
  const tamañoMaximo = 10 * 1024 * 1024; // 10MB en bytes
  
  return tiposPermitidos.includes(file.type) && file.size <= tamañoMaximo;
}

