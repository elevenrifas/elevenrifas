#!/usr/bin/env node

/**
 * 📚 EJEMPLO DE USO DE TOOLBOX MODULAR
 * 
 * Este archivo muestra cómo usar la toolbox reorganizada en módulos
 * desde otros scripts o cómo integrarla en tu aplicación
 */

const toolbox = require('./toolbox');

// ============================================================================
// 🚀 EJEMPLO 1: USO BÁSICO DE FUNCIONES
// ============================================================================

async function ejemploBasico() {
  console.log('🛠️  EJEMPLO BÁSICO DE USO');
  
  try {
    // Verificar estado de la base de datos
    await toolbox.database.checkDatabaseStatus();
    
    // Verificar estructura de la tabla
    await toolbox.database.checkTableStructure();
    
    console.log('✅ Ejemplo básico completado');
    
  } catch (error) {
    console.error('❌ Error en ejemplo básico:', error.message);
  }
}

// ============================================================================
// 📝 EJEMPLO 2: MANIPULACIÓN DE DATOS
// ============================================================================

async function ejemploManipulacionDatos() {
  console.log('\n📝 EJEMPLO DE MANIPULACIÓN DE DATOS');
  
  try {
    // Generar datos de ejemplo
    const rifaEjemplo = toolbox.utils.generateSampleRifa({
      titulo: 'Rifa de Prueba desde Script',
      precio_ticket: 25.00,
      slug: toolbox.utils.generateSlug('Rifa de Prueba desde Script')
    });
    
    console.log('📋 Rifa generada:', rifaEjemplo);
    
    // Validar campos
    const validation = toolbox.utils.validateRifaFields(rifaEjemplo);
    if (validation.isValid) {
      console.log('✅ Rifa válida');
    } else {
      console.log('❌ Errores de validación:', validation.errors);
    }
    
    // Formatear precio
    const precioFormateado = toolbox.utils.formatPrice(rifaEjemplo.precio_ticket);
    console.log('💰 Precio formateado:', precioFormateado);
    
    // Mostrar en formato tabla
    console.log(toolbox.utils.objectToTable(rifaEjemplo, 'Rifa de Ejemplo'));
    
  } catch (error) {
    console.error('❌ Error en manipulación de datos:', error.message);
  }
}

// ============================================================================
// 🔍 EJEMPLO 3: QUERIES PERSONALIZADAS
// ============================================================================

async function ejemploQueriesPersonalizadas() {
  console.log('\n🔍 EJEMPLO DE QUERIES PERSONALIZADAS');
  
  try {
    // Query de ejemplo (SELECT)
    await toolbox.database.executeQuery(
      "SELECT titulo, precio_ticket FROM rifas WHERE estado = 'activa'",
      'Consultando rifas activas'
    );
    
    // Query de ejemplo (INSERT)
    await toolbox.database.executeQuery(
      "INSERT INTO rifas (titulo, descripcion, precio_ticket) VALUES ('Rifa de Prueba', 'Descripción de prueba', 15.00)",
      'Insertando rifa de prueba'
    );
    
    // Query de ejemplo (UPDATE)
    await toolbox.database.executeQuery(
      "UPDATE rifas SET precio_ticket = 20.00 WHERE titulo = 'Rifa de Prueba'",
      'Actualizando precio de rifa de prueba'
    );
    
    // Query de ejemplo (DELETE)
    await toolbox.database.executeQuery(
      "DELETE FROM rifas WHERE titulo = 'Rifa de Prueba'",
      'Eliminando rifa de prueba'
    );
    
  } catch (error) {
    console.error('❌ Error en queries personalizadas:', error.message);
  }
}

// ============================================================================
// 🏗️ EJEMPLO 4: CONFIGURACIÓN Y SETUP
// ============================================================================

async function ejemploSetup() {
  console.log('\n🏗️  EJEMPLO DE SETUP Y CONFIGURACIÓN');
  
  try {
    // Agregar campos faltantes
    await toolbox.database.addMissingColumns();
    
    // Crear índices
    await toolbox.database.createIndexes();
    
    // Insertar datos
    await toolbox.database.insertSampleData();
    
    console.log('✅ Setup completado exitosamente');
    
  } catch (error) {
    console.error('❌ Error en setup:', error.message);
  }
}

// ============================================================================
// ⚙️ EJEMPLO 5: CONFIGURACIÓN Y UTILIDADES
// ============================================================================

function ejemploConfiguracion() {
  console.log('\n⚙️  EJEMPLO DE CONFIGURACIÓN Y UTILIDADES');
  
  try {
    // Mostrar configuración
    console.log('📋 Configuración de la aplicación:', toolbox.config.app);
    console.log('🗄️  Configuración de base de datos:', toolbox.config.database);
    console.log('🔗 Configuración de Supabase:', {
      url: toolbox.config.supabase.url,
      options: toolbox.config.supabase.options
    });
    
    // Configurar logging
    toolbox.utils.logger.setLevel('DEBUG');
    toolbox.utils.logger.setColors(true);
    toolbox.utils.logger.setTimestamp(true);
    
    console.log('✅ Configuración aplicada');
    
  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
  }
}

// ============================================================================
// 🎯 FUNCIÓN PRINCIPAL
// ============================================================================

async function main() {
  console.log('🚀 INICIANDO EJEMPLOS DE USO DE TOOLBOX MODULAR');
  console.log('📅 Fecha:', new Date().toLocaleString('es-ES'));
  console.log('🔧 Versión:', toolbox.config.app.version);
  
  try {
    // Ejecutar ejemplos en secuencia
    await ejemploBasico();
    await ejemploManipulacionDatos();
    await ejemploQueriesPersonalizadas();
    await ejemploSetup();
    ejemploConfiguracion();
    
    console.log('\n🎉 ¡TODOS LOS EJEMPLOS COMPLETADOS EXITOSAMENTE!');
    
  } catch (error) {
    console.error('\n❌ Error en ejecución de ejemplos:', error.message);
  }
}

// ============================================================================
// 📋 MANEJO DE ARGUMENTOS
// ============================================================================

if (process.argv.includes('--basico')) {
  ejemploBasico();
} else if (process.argv.includes('--datos')) {
  ejemploManipulacionDatos();
} else if (process.argv.includes('--queries')) {
  ejemploQueriesPersonalizadas();
} else if (process.argv.includes('--setup')) {
  ejemploSetup();
} else if (process.argv.includes('--config')) {
  ejemploConfiguracion();
} else if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Error no manejado:', error.message);
    process.exit(1);
  });
}

// ============================================================================
// 📤 EXPORTACIÓN
// ============================================================================

module.exports = {
  ejemploBasico,
  ejemploManipulacionDatos,
  ejemploQueriesPersonalizadas,
  ejemploSetup,
  ejemploConfiguracion
};
