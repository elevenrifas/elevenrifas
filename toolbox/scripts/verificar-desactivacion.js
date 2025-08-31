#!/usr/bin/env node

/**
 * 🔍 SCRIPT PARA VERIFICAR QUE EL SISTEMA DE LIMPIEZA ESTÉ COMPLETAMENTE DESACTIVADO
 * 
 * Este script verifica que no haya ninguna llamada al sistema de limpieza
 * en tu aplicación.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO DESACTIVACIÓN COMPLETA DEL SISTEMA DE LIMPIEZA...\n');

// Función para verificar archivo layout.tsx
function verificarLayout() {
  const layoutPath = path.join(__dirname, '../../app/layout.tsx');
  
  try {
    const contenido = fs.readFileSync(layoutPath, 'utf8');
    
    console.log('📁 VERIFICANDO app/layout.tsx:');
    
    // Verificar import
    const tieneImport = contenido.includes('import { iniciarLimpiezaAutomatica }');
    const tieneImportComentado = contenido.includes('// import { iniciarLimpiezaAutomatica }');
    
    if (tieneImport && !tieneImportComentado) {
      console.log('   ❌ IMPORT ACTIVO - El sistema se puede ejecutar');
      return false;
    } else if (tieneImportComentado) {
      console.log('   ✅ IMPORT COMENTADO - No se importará el módulo');
    } else {
      console.log('   ✅ SIN IMPORT - No hay import del módulo');
    }
    
    // Verificar llamada
    const tieneLlamada = contenido.includes('iniciarLimpiezaAutomatica(');
    const tieneLlamadaComentada = contenido.includes('// iniciarLimpiezaAutomatica(');
    
    if (tieneLlamada && !tieneLlamadaComentada) {
      console.log('   ❌ LLAMADA ACTIVA - El sistema se ejecutará');
      return false;
    } else if (tieneLlamadaComentada) {
      console.log('   ✅ LLAMADA COMENTADA - No se ejecutará');
    } else {
      console.log('   ✅ SIN LLAMADA - No hay llamada a la función');
    }
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Error al leer layout.tsx:', error.message);
    return false;
  }
}

// Función para verificar archivo limpiar-reservas.ts
function verificarCron() {
  const cronPath = path.join(__dirname, '../../lib/cron/limpiar-reservas.ts');
  
  try {
    const contenido = fs.readFileSync(cronPath, 'utf8');
    
    console.log('\n📁 VERIFICANDO lib/cron/limpiar-reservas.ts:');
    
    // Verificar auto-inicio
    const tieneAutoInicio = contenido.includes('iniciarLimpiezaAutomatica(1)');
    const tieneAutoInicioComentado = contenido.includes('// iniciarLimpiezaAutomatica(1)');
    
    if (tieneAutoInicio && !tieneAutoInicioComentado) {
      console.log('   ❌ AUTO-INICIO ACTIVO - Se ejecutará en desarrollo');
      return false;
    } else if (tieneAutoInicioComentado) {
      console.log('   ✅ AUTO-INICIO COMENTADO - No se ejecutará automáticamente');
    } else {
      console.log('   ✅ SIN AUTO-INICIO - No hay auto-inicio configurado');
    }
    
    return true;
    
  } catch (error) {
    console.error('   ❌ Error al leer limpiar-reservas.ts:', error.message);
    return false;
  }
}

// Función para verificar archivo de configuración
function verificarConfiguracion() {
  const configPath = path.join(__dirname, '../../.limpieza-desactivada');
  
  try {
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      console.log('\n📁 VERIFICANDO .limpieza-desactivada:');
      console.log(`   ✅ ARCHIVO EXISTE - Estado: ${config.sistema_limpieza.estado}`);
      console.log(`   🕐 Desactivado el: ${config.sistema_limpieza.desactivado_el}`);
      console.log(`   📝 Motivo: ${config.sistema_limpieza.motivo}`);
      
      return true;
    } else {
      console.log('\n📁 VERIFICANDO .limpieza-desactivada:');
      console.log('   ❌ ARCHIVO NO EXISTE - No hay confirmación de desactivación');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Error al leer configuración:', error.message);
    return false;
  }
}

// Función para verificar búsqueda global
function verificarBusquedaGlobal() {
  console.log('\n🔍 BÚSQUEDA GLOBAL EN EL PROYECTO:');
  
  try {
    // Buscar en archivos .ts y .tsx
    const archivos = [
      'app/layout.tsx',
      'lib/cron/limpiar-reservas.ts',
      'app/api/limpiar-reservas/route.ts',
      'app/api/admin/estado-sistema/route.ts'
    ];
    
    let totalLlamadas = 0;
    let llamadasActivas = 0;
    
    archivos.forEach(archivo => {
      const archivoPath = path.join(__dirname, '../../', archivo);
      
      if (fs.existsSync(archivoPath)) {
        const contenido = fs.readFileSync(archivoPath, 'utf8');
        
        // Contar llamadas totales
        const llamadas = (contenido.match(/iniciarLimpiezaAutomatica/g) || []).length;
        totalLlamadas += llamadas;
        
        // Contar llamadas activas (no comentadas)
        const llamadasActivasRegex = /(?<!\/\/\s*)iniciarLimpiezaAutomatica/g;
        const llamadasActivasEnArchivo = (contenido.match(llamadasActivasRegex) || []).length;
        llamadasActivas += llamadasActivasEnArchivo;
        
        if (llamadas > 0) {
          console.log(`   📄 ${archivo}: ${llamadas} llamadas totales, ${llamadasActivasEnArchivo} activas`);
        }
      }
    });
    
    console.log(`\n📊 RESUMEN DE BÚSQUEDA:`);
    console.log(`   • Total de llamadas encontradas: ${totalLlamadas}`);
    console.log(`   • Llamadas activas (no comentadas): ${llamadasActivas}`);
    
    if (llamadasActivas === 0) {
      console.log('   ✅ SISTEMA COMPLETAMENTE DESACTIVADO');
      return true;
    } else {
      console.log('   ❌ HAY LLAMADAS ACTIVAS - El sistema se puede ejecutar');
      return false;
    }
    
  } catch (error) {
    console.error('   ❌ Error en búsqueda global:', error.message);
    return false;
  }
}

// Función principal
function verificarDesactivacion() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL SISTEMA DE LIMPIEZA\n');
  
  const layoutOk = verificarLayout();
  const cronOk = verificarCron();
  const configOk = verificarConfiguracion();
  const globalOk = verificarBusquedaGlobal();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE VERIFICACIÓN:');
  console.log('='.repeat(60));
  
  console.log(`   📁 Layout.tsx: ${layoutOk ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`   ⏰ Cron: ${cronOk ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`   📁 Configuración: ${configOk ? '✅ OK' : '❌ PROBLEMA'}`);
  console.log(`   🔍 Búsqueda global: ${globalOk ? '✅ OK' : '❌ PROBLEMA'}`);
  
  const todoOk = layoutOk && cronOk && configOk && globalOk;
  
  if (todoOk) {
    console.log('\n🎉 ¡SISTEMA COMPLETAMENTE DESACTIVADO!');
    console.log('   • No se ejecutará limpieza automática');
    console.log('   • No verás logs de limpieza');
    console.log('   • Las reservas expiradas NO se liberarán automáticamente');
    console.log('\n💡 Para reactivarlo: descomenta las líneas comentadas en los archivos');
  } else {
    console.log('\n⚠️ PROBLEMAS DETECTADOS:');
    console.log('   • El sistema puede ejecutarse en algunos casos');
    console.log('   • Revisa los archivos marcados con ❌');
    console.log('   • Comenta todas las llamadas a iniciarLimpiezaAutomatica');
  }
  
  console.log('\n' + '='.repeat(60));
}

// Ejecutar script
verificarDesactivacion();
