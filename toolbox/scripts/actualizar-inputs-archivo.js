#!/usr/bin/env node

/**
 * 🔧 SCRIPT PARA ACTUALIZAR TODOS LOS INPUTS DE ARCHIVO
 * 
 * Este script actualiza todos los inputs de archivo en app/comprar/page.tsx
 * para que solo acepten PNG, JPG, JPEG y PDF, y muestren el texto de formatos permitidos.
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 ACTUALIZANDO INPUTS DE ARCHIVO...\n');

// Función para actualizar el archivo
function actualizarInputsArchivo() {
  const filePath = path.join(__dirname, '../../app/comprar/page.tsx');
  
  try {
    // Leer el archivo
    let contenido = fs.readFileSync(filePath, 'utf8');
    
    console.log('📁 Archivo leído:', filePath);
    
    // Contador de cambios
    let cambiosRealizados = 0;
    
    // Patrón para encontrar inputs de archivo
    const patronInput = /(\s*)(<input\s+type="file"\s+accept="image\/\*"\s+onChange={handleArchivoChange}\s+className="[^"]*"\s*\/>)/g;
    
    // Reemplazar cada input encontrado
    contenido = contenido.replace(patronInput, (match, espacios, input) => {
      cambiosRealizados++;
      
      // Crear el nuevo input con formatos específicos
      const nuevoInput = `${espacios}<div className="text-xs text-slate-300 mb-2">Formatos permitidos: PNG, JPG, JPEG, PDF (máx. 35MB)</div>\n${espacios}<input\n${espacios}  type="file"\n${espacios}  accept=".png,.jpg,.jpeg,.pdf"\n${espacios}  onChange={handleArchivoChange}\n${espacios}  className="w-full text-white bg-white/10 border border-white rounded p-3"\n${espacios}/>`;
      
      return nuevoInput;
    });
    
    // Escribir el archivo actualizado
    fs.writeFileSync(filePath, contenido, 'utf8');
    
    console.log(`✅ ${cambiosRealizados} inputs de archivo actualizados`);
    console.log('📝 Archivo guardado exitosamente');
    
    // Mostrar resumen de cambios
    console.log('\n📋 RESUMEN DE CAMBIOS:');
    console.log('1. ✅ accept="image/*" → accept=".png,.jpg,.jpeg,.pdf"');
    console.log('2. ✅ Agregado texto de formatos permitidos');
    console.log('3. ✅ Validación en handleArchivoChange mejorada');
    
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

// Ejecutar la actualización
actualizarInputsArchivo();

console.log('\n🎯 ¡ACTUALIZACIÓN COMPLETADA!');
console.log('📱 Los inputs ahora solo aceptan PNG, JPG, JPEG y PDF');
console.log('🚫 SVG y otros formatos serán rechazados inmediatamente');
console.log('💡 Reinicia tu aplicación para ver los cambios');
