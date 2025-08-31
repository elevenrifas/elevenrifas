#!/usr/bin/env node

/**
 * 🟢 SCRIPT PARA REACTIVAR EL SISTEMA DE LIMPIEZA AUTOMÁTICA
 * 
 * Este script reactiva el sistema de limpieza automática
 * descomentando la línea en layout.tsx.
 */

const fs = require('fs');
const path = require('path');

console.log('🟢 REACTIVANDO SISTEMA DE LIMPIEZA AUTOMÁTICA...\n');

// Función para descomentar la línea de limpieza en layout.tsx
function descomentarLimpieza() {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  
  try {
    // Leer el archivo
    let contenido = fs.readFileSync(layoutPath, 'utf8');
    
    // Buscar la línea comentada
    const lineaComentada = contenido.includes('// iniciarLimpiezaAutomatica(2)');
    
    if (!lineaComentada) {
      console.log('✅ La línea de limpieza ya está activa o no existe');
      return;
    }
    
    // Descomentar la línea
    const contenidoModificado = contenido.replace(
      /\/\/ iniciarLimpiezaAutomatica\(2\);\s*\/\/ PAUSADO TEMPORALMENTE/g,
      'iniciarLimpiezaAutomatica(2); // Cada 2 minutos'
    );
    
    // Escribir el archivo modificado
    fs.writeFileSync(layoutPath, contenidoModificado, 'utf8');
    
    console.log('✅ Línea de limpieza descomentada exitosamente');
    console.log('📝 Archivo modificado: app/layout.tsx');
    
  } catch (error) {
    console.error('❌ Error al modificar el archivo:', error.message);
    console.log('\n💡 Modificación manual requerida:');
    console.log('   1. Abre app/layout.tsx');
    console.log('   2. Busca la línea: // iniciarLimpiezaAutomatica(2); // PAUSADO TEMPORALMENTE');
    console.log('   3. Descoméntala: iniciarLimpiezaAutomatica(2);');
  }
}

// Función para eliminar archivo de configuración
function eliminarConfiguracion() {
  const configPath = path.join(__dirname, '../../.limpieza-pausada');
  
  try {
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
      console.log('✅ Archivo de configuración eliminado: .limpieza-pausada');
    } else {
      console.log('ℹ️ No hay archivo de configuración para eliminar');
    }
    
  } catch (error) {
    console.error('❌ Error al eliminar archivo de configuración:', error.message);
  }
}

// Función principal
function reactivarLimpieza() {
  console.log('📋 PASOS PARA REACTIVAR EL SISTEMA DE LIMPIEZA:\n');
  
  console.log('1️⃣ Descomentando línea de limpieza en layout.tsx...');
  descomentarLimpieza();
  
  console.log('\n2️⃣ Eliminando archivo de configuración...');
  eliminarConfiguracion();
  
  console.log('\n3️⃣ INSTRUCCIONES COMPLETAS:');
  console.log('   • El sistema de limpieza automática ha sido REACTIVADO');
  console.log('   • Se ejecutará cada 2 minutos automáticamente');
  console.log('   • Para mantenerlo activo: NO hagas nada');
  console.log('   • Para pausarlo nuevamente: ejecuta detener-limpieza.js');
  
  console.log('\n4️⃣ PRÓXIMOS PASOS:');
  console.log('   • Detén la aplicación actual (Ctrl+C)');
  console.log('   • Reinicia la aplicación (npm run dev)');
  console.log('   • El sistema de limpieza se iniciará automáticamente');
  
  console.log('\n5️⃣ VERIFICACIÓN:');
  console.log('   • El sistema se ejecutará cada 2 minutos');
  console.log('   • Puedes verificar el estado con: node toolbox/scripts/pausar-limpieza.js');
  console.log('   • Los logs mostrarán: "🧹 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA"');
  
  console.log('\n✅ SISTEMA DE LIMPIEZA REACTIVADO EXITOSAMENTE');
}

// Ejecutar script
reactivarLimpieza();
