#!/usr/bin/env node

/**
 * 🛑 SCRIPT PARA DETENER COMPLETAMENTE EL SISTEMA DE LIMPIEZA
 * 
 * Este script detiene el sistema de limpieza automática
 * y proporciona instrucciones para mantenerlo pausado.
 */

const fs = require('fs');
const path = require('path');

console.log('🛑 DETENIENDO SISTEMA DE LIMPIEZA AUTOMÁTICA...\n');

// Función para comentar la línea de limpieza en layout.tsx
function comentarLimpieza() {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  
  try {
    // Leer el archivo
    let contenido = fs.readFileSync(layoutPath, 'utf8');
    
    // Buscar la línea que inicia la limpieza
    const lineaLimpieza = contenido.includes('iniciarLimpiezaAutomatica(2)');
    
    if (!lineaLimpieza) {
      console.log('✅ La línea de limpieza ya está comentada o no existe');
      return;
    }
    
    // Comentar la línea
    const contenidoModificado = contenido.replace(
      /iniciarLimpiezaAutomatica\(2\);/g,
      '// iniciarLimpiezaAutomatica(2); // PAUSADO TEMPORALMENTE'
    );
    
    // Escribir el archivo modificado
    fs.writeFileSync(layoutPath, contenidoModificado, 'utf8');
    
    console.log('✅ Línea de limpieza comentada exitosamente');
    console.log('📝 Archivo modificado: app/layout.tsx');
    
  } catch (error) {
    console.error('❌ Error al modificar el archivo:', error.message);
    console.log('\n💡 Modificación manual requerida:');
    console.log('   1. Abre app/layout.tsx');
    console.log('   2. Busca la línea: iniciarLimpiezaAutomatica(2);');
    console.log('   3. Coméntala: // iniciarLimpiezaAutomatica(2);');
  }
}

// Función para crear un archivo de configuración
function crearConfiguracion() {
  const configPath = path.join(__dirname, '../../.limpieza-pausada');
  
  try {
    const timestamp = new Date().toISOString();
    const config = {
      pausado: true,
      pausado_el: timestamp,
      motivo: 'Pausado por solicitud del usuario',
      instrucciones: [
        'Para reactivar: descomenta la línea en app/layout.tsx',
        'Para mantener pausado: no hagas nada',
        'El sistema se reactivará automáticamente al reiniciar la app'
      ]
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('✅ Archivo de configuración creado: .limpieza-pausada');
    
  } catch (error) {
    console.error('❌ Error al crear archivo de configuración:', error.message);
  }
}

// Función principal
function detenerLimpieza() {
  console.log('📋 PASOS PARA PAUSAR EL SISTEMA DE LIMPIEZA:\n');
  
  console.log('1️⃣ Comentando línea de limpieza en layout.tsx...');
  comentarLimpieza();
  
  console.log('\n2️⃣ Creando archivo de configuración...');
  crearConfiguracion();
  
  console.log('\n3️⃣ INSTRUCCIONES COMPLETAS:');
  console.log('   • El sistema de limpieza automática ha sido PAUSADO');
  console.log('   • Para mantenerlo pausado: NO hagas nada');
  console.log('   • Para reactivarlo: descomenta la línea en app/layout.tsx');
  console.log('   • Para reactivarlo temporalmente: reinicia la aplicación');
  
  console.log('\n4️⃣ PRÓXIMOS PASOS:');
  console.log('   • Detén la aplicación actual (Ctrl+C)');
  console.log('   • Reinicia la aplicación (npm run dev)');
  console.log('   • El sistema de limpieza NO se iniciará automáticamente');
  
  console.log('\n5️⃣ VERIFICACIÓN:');
  console.log('   • El archivo .limpieza-pausada confirma el estado');
  console.log('   • Puedes verificar el estado con: node toolbox/scripts/pausar-limpieza.js');
  
  console.log('\n✅ SISTEMA DE LIMPIEZA PAUSADO EXITOSAMENTE');
}

// Ejecutar script
detenerLimpieza();
