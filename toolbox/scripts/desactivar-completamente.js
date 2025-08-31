#!/usr/bin/env node

/**
 * 🛑 SCRIPT PARA DESACTIVAR COMPLETAMENTE EL SISTEMA DE LIMPIEZA
 * 
 * Este script desactiva TODAS las funciones del sistema de limpieza
 * para que NO se ejecute en absoluto.
 */

const fs = require('fs');
const path = require('path');

console.log('🛑 DESACTIVANDO COMPLETAMENTE EL SISTEMA DE LIMPIEZA...\n');

// Función para comentar completamente el archivo layout.tsx
function comentarLayout() {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  
  try {
    let contenido = fs.readFileSync(layoutPath, 'utf8');
    
    // Comentar import
    contenido = contenido.replace(
      /import \{ iniciarLimpiezaAutomatica \} from "@\/lib\/cron\/limpiar-reservas";/g,
      '// import { iniciarLimpiezaAutomatica } from "@/lib/cron/limpiar-reservas"; // SISTEMA COMPLETAMENTE DESACTIVADO'
    );
    
    // Comentar llamada
    contenido = contenido.replace(
      /iniciarLimpiezaAutomatica\(2\);/g,
      '// iniciarLimpiezaAutomatica(2); // SISTEMA COMPLETAMENTE DESACTIVADO'
    );
    
    fs.writeFileSync(layoutPath, contenido, 'utf8');
    console.log('✅ Layout.tsx comentado completamente');
    
  } catch (error) {
    console.error('❌ Error al comentar layout.tsx:', error.message);
  }
}

// Función para comentar completamente el archivo limpiar-reservas.ts
function comentarCron() {
  const cronPath = path.join(__dirname, '../../lib/cron/limpiar-reservas.ts');
  
  try {
    let contenido = fs.readFileSync(cronPath, 'utf8');
    
    // Comentar auto-inicio
    contenido = contenido.replace(
      /if \(process\.env\.NODE_ENV === 'development'\) \{[\s\S]*?iniciarLimpiezaAutomatica\(1\);[\s\S]*?\}/g,
      '// AUTO-INICIO COMPLETAMENTE DESACTIVADO\n// if (process.env.NODE_ENV === \'development\') {\n//   setTimeout(() => {\n//     iniciarLimpiezaAutomatica(1);\n//   }, 5000);\n// }'
    );
    
    fs.writeFileSync(cronPath, contenido, 'utf8');
    console.log('✅ Cron comentado completamente');
    
  } catch (error) {
    console.error('❌ Error al comentar cron:', error.message);
  }
}

// Función para crear archivo de confirmación
function crearConfirmacion() {
  const configPath = path.join(__dirname, '../../.limpieza-desactivada');
  
  try {
    const config = {
      sistema_limpieza: {
        estado: "COMPLETAMENTE DESACTIVADO",
        desactivado_el: new Date().toISOString(),
        motivo: "Desactivado completamente por solicitud del usuario",
        archivos_modificados: [
          "app/layout.tsx - Import y llamada comentados",
          "lib/cron/limpiar-reservas.ts - Auto-inicio comentado"
        ],
        instrucciones: [
          "El sistema NO se ejecutará automáticamente",
          "No se importará el módulo de limpieza",
          "No se llamará iniciarLimpiezaAutomatica()",
          "Para reactivarlo: descomenta las líneas comentadas"
        ],
        verificacion: [
          "No verás logs de '🧹 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA'",
          "No se ejecutará limpieza cada 2 minutos",
          "Las reservas expiradas NO se liberarán automáticamente"
        ]
      }
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    console.log('✅ Archivo de confirmación creado');
    
  } catch (error) {
    console.error('❌ Error al crear confirmación:', error.message);
  }
}

// Función principal
function desactivarCompletamente() {
  console.log('📋 DESACTIVANDO SISTEMA DE LIMPIEZA...\n');
  
  console.log('1️⃣ Comentando layout.tsx...');
  comentarLayout();
  
  console.log('\n2️⃣ Comentando cron...');
  comentarCron();
  
  console.log('\n3️⃣ Creando confirmación...');
  crearConfirmacion();
  
  console.log('\n✅ SISTEMA COMPLETAMENTE DESACTIVADO');
  console.log('\n📝 PRÓXIMOS PASOS:');
  console.log('   • Reinicia tu aplicación (Ctrl+C y npm run dev)');
  console.log('   • No verás logs de limpieza automática');
  console.log('   • Las reservas expiradas NO se liberarán');
  
  console.log('\n🔍 VERIFICACIÓN:');
  console.log('   • Ejecuta: node toolbox/scripts/verificar-desactivacion.js');
  console.log('   • Debe mostrar: "SISTEMA COMPLETAMENTE DESACTIVADO"');
}

// Ejecutar script
desactivarCompletamente();
