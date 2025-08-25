#!/usr/bin/env node

// =====================================================
// 🔍 VERIFICAR ESTRUCTURA TABLA RIFAS - ELEVEN RIFAS
// =====================================================
// Script simple para verificar qué campos tiene la tabla rifas
// =====================================================

const { config } = require('../config/index.js');

async function checkRifasStructure() {
  try {
    console.log('🔍 Verificando estructura de la tabla rifas...');
    
    // Verificar campos existentes
    const { data: columns, error: describeError } = await config.supabase.rpc('exec_sql', { 
      sql_query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'rifas' 
        ORDER BY ordinal_position;
      ` 
    });

    if (describeError) {
      console.error('❌ Error al verificar estructura:', describeError);
      return false;
    }

    console.log('📊 Estructura actual de la tabla rifas:');
    columns.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    // Verificar si falta el campo 'activa'
    const hasActivaField = columns.some(col => col.column_name === 'activa');
    
    if (!hasActivaField) {
      console.log('\n⚠️  Campo "activa" NO existe. Agregándolo...');
      
      const { error: alterError } = await config.supabase.rpc('exec_sql', { 
        sql_query: `ALTER TABLE public.rifas ADD COLUMN IF NOT EXISTS activa boolean DEFAULT true;` 
      });

      if (alterError) {
        console.error('❌ Error al agregar campo activa:', alterError);
      } else {
        console.log('✅ Campo "activa" agregado exitosamente');
      }
    } else {
      console.log('\n✅ Campo "activa" ya existe');
    }

    // Verificar datos existentes
    const { count, error: countError } = await config.supabase
      .from('rifas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.log('⚠️  No se pudo verificar cantidad de rifas:', countError);
    } else {
      console.log(`\n📊 La tabla tiene ${count} rifas registradas`);
    }

    return true;

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    return false;
  }
}

// Ejecutar
checkRifasStructure()
  .then(success => {
    if (success) {
      console.log('\n✅ Verificación completada');
      process.exit(0);
    } else {
      console.log('\n❌ Verificación falló');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n💥 Error fatal:', err);
    process.exit(1);
  });
