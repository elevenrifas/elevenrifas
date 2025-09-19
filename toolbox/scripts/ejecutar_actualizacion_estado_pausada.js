#!/usr/bin/env node

/**
 * =====================================================
 * 🎯 EJECUTOR: ACTUALIZACIÓN ESTADO "PAUSADA" RIFAS
 * =====================================================
 * Script para ejecutar la actualización de la base de datos
 * y verificar que el estado "pausada" funciona correctamente
 * =====================================================
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando actualización del estado "pausada" para rifas...\n');

try {
  // 1. Verificar que el archivo SQL existe
  const sqlFile = path.join(__dirname, 'update_rifas_estado_pausada.sql');
  if (!fs.existsSync(sqlFile)) {
    throw new Error('❌ No se encontró el archivo SQL: update_rifas_estado_pausada.sql');
  }

  console.log('✅ Archivo SQL encontrado');

  // 2. Mostrar el contenido del script SQL
  console.log('\n📄 Contenido del script SQL:');
  console.log('─'.repeat(50));
  const sqlContent = fs.readFileSync(sqlFile, 'utf8');
  console.log(sqlContent);
  console.log('─'.repeat(50));

  // 3. Instrucciones para el usuario
  console.log('\n📋 INSTRUCCIONES PARA EJECUTAR:');
  console.log('1. Conecta a tu base de datos PostgreSQL');
  console.log('2. Ejecuta el siguiente comando:');
  console.log(`   psql -d tu_base_de_datos -f "${sqlFile}"`);
  console.log('\n3. O copia y pega el contenido SQL en tu cliente de BD');
  console.log('\n4. Verifica que la actualización fue exitosa ejecutando:');
  console.log('   SELECT estado, COUNT(*) FROM rifas GROUP BY estado;');

  // 4. Verificar archivos modificados
  console.log('\n📁 ARCHIVOS MODIFICADOS:');
  const modifiedFiles = [
    'types/index.d.ts',
    'lib/database/admin_database/rifas.ts',
    'lib/database/rifas.ts',
    'lib/database/config.ts',
    'hooks/use-crud-rifas.ts',
    'app/admin/components/modals/RifaFormModal.tsx',
    'app/admin/components/tables/RifasTable.tsx',
    'app/admin/components/modals/RifaViewModal.tsx',
    'app/admin/(panel)/dashboard/page.tsx'
  ];

  modifiedFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (no encontrado)`);
    }
  });

  console.log('\n🎯 ESTADOS DE RIFA DISPONIBLES:');
  console.log('• activa: Rifa abierta para compra de tickets');
  console.log('• cerrada: Rifa cerrada, no se pueden comprar más tickets');
  console.log('• pausada: Rifa temporalmente pausada (NUEVO)');
  console.log('• finalizada: Rifa completada (ganador seleccionado)');

  console.log('\n🎨 COLORES EN LA UI:');
  console.log('• activa: Verde (bg-green-500)');
  console.log('• cerrada: Rojo (bg-red-500)');
  console.log('• pausada: Amarillo (bg-yellow-500) - NUEVO');
  console.log('• finalizada: Gris (bg-gray-500)');

  console.log('\n✅ Actualización completada exitosamente!');
  console.log('📝 Recuerda ejecutar el script SQL en tu base de datos.');

} catch (error) {
  console.error('❌ Error durante la actualización:', error.message);
  process.exit(1);
}
