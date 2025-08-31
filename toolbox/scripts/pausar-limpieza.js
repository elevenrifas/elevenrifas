#!/usr/bin/env node

/**
 * 🛑 SCRIPT PARA PAUSAR EL SISTEMA DE LIMPIEZA AUTOMÁTICA
 * 
 * Este script permite pausar temporalmente el sistema de limpieza
 * de reservas expiradas sin necesidad de reiniciar la aplicación.
 */

const http = require('http');

console.log('🛑 PAUSANDO SISTEMA DE LIMPIEZA AUTOMÁTICA...\n');

// Función para hacer petición HTTP
function hacerPeticion(method, path, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: path,
    method: method,
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const response = JSON.parse(data);
        callback(null, response, res.statusCode);
      } catch (e) {
        callback(null, { raw: data }, res.statusCode);
      }
    });
  });

  req.on('error', (err) => {
    callback(err);
  });

  req.end();
}

// Función principal
async function pausarLimpieza() {
  try {
    console.log('📊 Verificando estado actual del sistema...');
    
    // Verificar estado actual
    hacerPeticion('GET', '/api/admin/estado-sistema', (err, response, statusCode) => {
      if (err) {
        console.error('❌ Error al conectar con el servidor:', err.message);
        console.log('\n💡 Asegúrate de que la aplicación esté ejecutándose en http://localhost:3000');
        return;
      }
      
      if (statusCode !== 200) {
        console.error('❌ Error del servidor:', statusCode);
        return;
      }
      
      console.log('✅ Estado actual del sistema:');
      console.log(`   - Sistema de limpieza: ${response.data?.limpieza?.estado?.activa ? '🟢 ACTIVO' : '🔴 INACTIVO'}`);
      console.log(`   - Última limpieza: ${response.data?.limpieza?.ultima_limpieza?.exitosa ? '✅ Exitosa' : '❌ Fallida'}`);
      console.log(`   - Reservas liberadas: ${response.data?.limpieza?.ultima_limpieza?.reservas_liberadas || 0}`);
      
      if (response.data?.limpieza?.estado?.activa) {
        console.log('\n🛑 El sistema de limpieza está ACTIVO. Para pausarlo:');
        console.log('   1. Detén la aplicación (Ctrl+C)');
        console.log('   2. Comenta la línea en app/layout.tsx:');
        console.log('      // iniciarLimpiezaAutomatica(2); // Comentado temporalmente');
        console.log('   3. Reinicia la aplicación');
        console.log('\n💡 Alternativamente, puedes usar el endpoint de administración:');
        console.log('   curl -X POST http://localhost:3000/api/admin/estado-sistema');
      } else {
        console.log('\n✅ El sistema de limpieza ya está INACTIVO');
      }
    });
    
  } catch (error) {
    console.error('❌ Error inesperado:', error.message);
  }
}

// Ejecutar script
pausarLimpieza();
