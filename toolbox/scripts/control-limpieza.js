#!/usr/bin/env node

/**
 * 🎛️ SCRIPT PRINCIPAL PARA CONTROLAR EL SISTEMA DE LIMPIEZA
 * 
 * Este script te permite controlar fácilmente el sistema de limpieza
 * automática de reservas expiradas.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

console.log('🎛️ CONTROL DEL SISTEMA DE LIMPIEZA AUTOMÁTICA\n');

// Crear interfaz de lectura
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Función para verificar estado actual
function verificarEstado() {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  const configPath = path.join(__dirname, '../../.limpieza-pausada');
  
  try {
    const contenido = fs.readFileSync(layoutPath, 'utf8');
    const estaComentada = contenido.includes('// iniciarLimpiezaAutomatica(2)');
    const existeConfig = fs.existsSync(configPath);
    
    console.log('📊 ESTADO ACTUAL DEL SISTEMA:');
    console.log(`   • Línea de limpieza: ${estaComentada ? '🔴 COMENTADA (PAUSADO)' : '🟢 ACTIVA'}`);
    console.log(`   • Archivo de configuración: ${existeConfig ? '📁 Existe (.limpieza-pausada)' : '❌ No existe'}`);
    
    if (existeConfig) {
      try {
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        console.log(`   • Pausado el: ${config.pausado_el}`);
        console.log(`   • Motivo: ${config.motivo}`);
      } catch (e) {
        console.log('   • Error al leer configuración');
      }
    }
    
    return { estaComentada, existeConfig };
    
  } catch (error) {
    console.error('❌ Error al verificar estado:', error.message);
    return { estaComentada: false, existeConfig: false };
  }
}

// Función para pausar el sistema
function pausarSistema() {
  console.log('\n🛑 PAUSANDO SISTEMA DE LIMPIEZA...');
  
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  const configPath = path.join(__dirname, '../../.limpieza-pausada');
  
  try {
    // Comentar línea
    let contenido = fs.readFileSync(layoutPath, 'utf8');
    const contenidoModificado = contenido.replace(
      /iniciarLimpiezaAutomatica\(2\);/g,
      '// iniciarLimpiezaAutomatica(2); // PAUSADO TEMPORALMENTE'
    );
    fs.writeFileSync(layoutPath, contenidoModificado, 'utf8');
    
    // Crear configuración
    const config = {
      pausado: true,
      pausado_el: new Date().toISOString(),
      motivo: 'Pausado por solicitud del usuario',
      instrucciones: [
        'Para reactivar: ejecuta este script y elige opción 2',
        'Para mantener pausado: no hagas nada',
        'El sistema se reactivará automáticamente al reiniciar la app'
      ]
    };
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    
    console.log('✅ Sistema pausado exitosamente');
    console.log('📝 Archivo modificado: app/layout.tsx');
    console.log('📁 Configuración creada: .limpieza-pausada');
    
  } catch (error) {
    console.error('❌ Error al pausar sistema:', error.message);
  }
}

// Función para reactivar el sistema
function reactivarSistema() {
  console.log('\n🟢 REACTIVANDO SISTEMA DE LIMPIEZA...');
  
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  const configPath = path.join(__dirname, '../../.limpieza-pausada');
  
  try {
    // Descomentar línea
    let contenido = fs.readFileSync(layoutPath, 'utf8');
    const contenidoModificado = contenido.replace(
      /\/\/ iniciarLimpiezaAutomatica\(2\);\s*\/\/ PAUSADO TEMPORALMENTE/g,
      'iniciarLimpiezaAutomatica(2); // Cada 2 minutos'
    );
    fs.writeFileSync(layoutPath, contenidoModificado, 'utf8');
    
    // Eliminar configuración
    if (fs.existsSync(configPath)) {
      fs.unlinkSync(configPath);
    }
    
    console.log('✅ Sistema reactivado exitosamente');
    console.log('📝 Archivo modificado: app/layout.tsx');
    console.log('🗑️ Configuración eliminada');
    
  } catch (error) {
    console.error('❌ Error al reactivar sistema:', error.message);
  }
}

// Función para mostrar menú
function mostrarMenu() {
  const estado = verificarEstado();
  
  console.log('\n🎯 OPCIONES DISPONIBLES:');
  console.log('   1. 📊 Ver estado actual');
  console.log('   2. 🛑 Pausar sistema de limpieza');
  console.log('   3. 🟢 Reactivar sistema de limpieza');
  console.log('   4. 📋 Ver instrucciones');
  console.log('   5. 🚪 Salir');
  
  rl.question('\n👉 Selecciona una opción (1-5): ', (opcion) => {
    switch (opcion.trim()) {
      case '1':
        verificarEstado();
        mostrarMenu();
        break;
        
      case '2':
        if (estado.estaComentada) {
          console.log('⚠️ El sistema ya está pausado');
        } else {
          pausarSistema();
        }
        mostrarMenu();
        break;
        
      case '3':
        if (!estado.estaComentada) {
          console.log('⚠️ El sistema ya está activo');
        } else {
          reactivarSistema();
        }
        mostrarMenu();
        break;
        
      case '4':
        mostrarInstrucciones();
        mostrarMenu();
        break;
        
      case '5':
        console.log('\n👋 ¡Hasta luego!');
        rl.close();
        break;
        
      default:
        console.log('❌ Opción inválida. Por favor selecciona 1-5.');
        mostrarMenu();
        break;
    }
  });
}

// Función para mostrar instrucciones
function mostrarInstrucciones() {
  console.log('\n📋 INSTRUCCIONES COMPLETAS:\n');
  
  console.log('🛑 PARA PAUSAR EL SISTEMA:');
  console.log('   1. Selecciona opción 2 en este menú');
  console.log('   2. El script comentará la línea en app/layout.tsx');
  console.log('   3. Detén la aplicación (Ctrl+C)');
  console.log('   4. Reinicia la aplicación (npm run dev)');
  console.log('   5. El sistema NO se iniciará automáticamente');
  
  console.log('\n🟢 PARA REACTIVAR EL SISTEMA:');
  console.log('   1. Selecciona opción 3 en este menú');
  console.log('   2. El script descomentará la línea en app/layout.tsx');
  console.log('   3. Detén la aplicación (Ctrl+C)');
  console.log('   4. Reinicia la aplicación (npm run dev)');
  console.log('   5. El sistema se iniciará automáticamente cada 2 minutos');
  
  console.log('\n📁 ARCHIVOS DE CONFIGURACIÓN:');
  console.log('   • .limpieza-pausada: Indica que el sistema está pausado');
  console.log('   • app/layout.tsx: Contiene la línea comentada/activa');
  
  console.log('\n🔍 VERIFICACIÓN:');
  console.log('   • Los logs mostrarán el estado del sistema');
  console.log('   • Puedes verificar el estado con opción 1');
  console.log('   • El archivo .limpieza-pausada confirma el estado');
}

// Función principal
function main() {
  console.log('🎛️ CONTROL DEL SISTEMA DE LIMPIEZA AUTOMÁTICA');
  console.log('   Sistema que libera reservas expiradas cada 2 minutos\n');
  
  mostrarMenu();
}

// Manejar cierre del programa
rl.on('close', () => {
  process.exit(0);
});

// Ejecutar script
main();
