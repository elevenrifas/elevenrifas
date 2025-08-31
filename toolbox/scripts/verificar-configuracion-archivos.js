#!/usr/bin/env node

/**
 * 🔍 SCRIPT PARA VERIFICAR CONFIGURACIÓN DE ARCHIVOS
 * 
 * Este script verifica que la configuración de archivos esté correcta
 * en la página de compra y en la API.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE ARCHIVOS...\n');

// Función para verificar página de compra
function verificarPaginaCompra() {
  const filePath = path.join(__dirname, '../../app/comprar/page.tsx');
  
  try {
    const contenido = fs.readFileSync(filePath, 'utf8');
    
    console.log('📁 VERIFICANDO app/comprar/page.tsx:');
    
    // Verificar función handleArchivoChange
    const tieneValidacion = contenido.includes('const tiposPermitidos = [\'image/jpeg\', \'image/jpg\', \'image/png\', \'application/pdf\']');
    const tieneValidacionTamaño = contenido.includes('const tamañoMaximo = 35 * 1024 * 1024');
    const tieneToastError = contenido.includes('toast.error(\'❌ Formato no permitido');
    
    console.log(`  ✅ Función de validación: ${tieneValidacion ? 'SÍ' : 'NO'}`);
    console.log(`  ✅ Validación de tamaño: ${tieneValidacionTamaño ? 'SÍ' : 'NO'}`);
    console.log(`  ✅ Toast de error: ${tieneToastError ? 'SÍ' : 'NO'}`);
    
    // Verificar inputs de archivo
    const inputsConAccept = contenido.match(/accept="[^"]*"/g) || [];
    const inputsConTexto = contenido.match(/Formatos permitidos: PNG, JPG, JPEG, PDF/g) || [];
    
    console.log(`  📎 Inputs con accept específico: ${inputsConAccept.length}`);
    console.log(`  📝 Inputs con texto de formatos: ${inputsConTexto.length}`);
    
    // Verificar que no haya accept="image/*"
    const tieneImageWildcard = contenido.includes('accept="image/*"');
    console.log(`  🚫 Inputs con accept="image/*": ${tieneImageWildcard ? 'SÍ (PROBLEMA)' : 'NO (CORRECTO)'}`);
    
  } catch (error) {
    console.error('❌ ERROR leyendo página de compra:', error.message);
  }
}

// Función para verificar API de comprobantes
function verificarAPIComprobantes() {
  const filePath = path.join(__dirname, '../../app/api/upload-comprobante/route.ts');
  
  try {
    const contenido = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n📁 VERIFICANDO app/api/upload-comprobante/route.ts:');
    
    // Verificar tipos permitidos
    const tienePNG = contenido.includes("'image/png'");
    const tieneJPG = contenido.includes("'image/jpg'") || contenido.includes("'image/jpeg'");
    const tienePDF = contenido.includes("'application/pdf'");
    const tieneWebP = contenido.includes("'image/webp'");
    const tieneGIF = contenido.includes("'image/gif'");
    
    console.log(`  ✅ PNG: ${tienePNG ? 'SÍ' : 'NO'}`);
    console.log(`  ✅ JPG/JPEG: ${tieneJPG ? 'SÍ' : 'NO'}`);
    console.log(`  ✅ PDF: ${tienePDF ? 'SÍ' : 'NO'}`);
    console.log(`  🚫 WebP: ${tieneWebP ? 'SÍ (PROBLEMA)' : 'NO (CORRECTO)'}`);
    console.log(`  🚫 GIF: ${tieneGIF ? 'SÍ (PROBLEMA)' : 'NO (CORRECTO)'}`);
    
    // Verificar tamaño máximo
    const tieneTamaño35MB = contenido.includes('35 * 1024 * 1024');
    console.log(`  📏 Tamaño máximo 35MB: ${tieneTamaño35MB ? 'SÍ' : 'NO'}`);
    
    // Verificar mensajes de error
    const tieneMensajeFormato = contenido.includes('Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG y PDF');
    const tieneMensajeTamaño = contenido.includes('Archivo demasiado grande (máximo 35MB)');
    
    console.log(`  💬 Mensaje formato: ${tieneMensajeFormato ? 'SÍ' : 'NO'}`);
    console.log(`  💬 Mensaje tamaño: ${tieneMensajeTamaño ? 'SÍ' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ ERROR leyendo API de comprobantes:', error.message);
  }
}

// Función para verificar documentación
function verificarDocumentacion() {
  const filePath = path.join(__dirname, '../../CONFIGURACION_COMPROBANTES.md');
  
  try {
    const contenido = fs.readFileSync(filePath, 'utf8');
    
    console.log('\n📁 VERIFICANDO CONFIGURACION_COMPROBANTES.md:');
    
    const tienePNG = contenido.includes('**PNG**');
    const tieneJPG = contenido.includes('**JPG/JPEG**');
    const tienePDF = contenido.includes('**PDF**');
    const tiene35MB = contenido.includes('**35 MB**');
    
    console.log(`  📖 PNG documentado: ${tienePNG ? 'SÍ' : 'NO'}`);
    console.log(`  📖 JPG/JPEG documentado: ${tieneJPG ? 'SÍ' : 'NO'}`);
    console.log(`  📖 PDF documentado: ${tienePDF ? 'SÍ' : 'NO'}`);
    console.log(`  📖 35MB documentado: ${tiene35MB ? 'SÍ' : 'NO'}`);
    
  } catch (error) {
    console.error('❌ ERROR leyendo documentación:', error.message);
  }
}

// Ejecutar verificaciones
verificarPaginaCompra();
verificarAPIComprobantes();
verificarDocumentacion();

console.log('\n🎯 VERIFICACIÓN COMPLETADA!');
console.log('📋 Revisa los resultados arriba para confirmar que todo esté configurado correctamente.');
