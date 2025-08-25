#!/usr/bin/env node

// =====================================================
// 🎯 CREAR TABLA RIFAS - ELEVEN RIFAS
// =====================================================
// Script para crear la tabla rifas con todos los campos necesarios
// =====================================================

const { config } = require('../config/index.js');
const { logger } = require('../utils/logger.js');

async function createRifasTable() {
  try {
    logger.info('🚀 Iniciando creación de tabla rifas...');
    
    // Schema SQL para la tabla rifas
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.rifas (
        id uuid NOT NULL DEFAULT gen_random_uuid(),
        titulo character varying(255) NOT NULL,
        descripcion text,
        precio_ticket numeric(10, 2) NOT NULL,
        imagen_url character varying(500),
        estado character varying(50) DEFAULT 'activa',
        fecha_creacion timestamp without time zone DEFAULT now(),
        fecha_cierre timestamp without time zone,
        total_tickets integer DEFAULT 0,
        tickets_disponibles integer DEFAULT 0,
        premio_principal text,
        condiciones text,
        activa boolean DEFAULT true,
        categoria_id uuid REFERENCES public.categorias_rifas(id),
        cantidad_tickets integer DEFAULT 0,
        numero_tickets_comprar jsonb DEFAULT '[1, 2, 3, 5, 10]',
        tipo_rifa character varying(100) DEFAULT 'vehiculo',
        fecha_culminacion timestamp without time zone,
        categoria character varying(100) DEFAULT 'automovil',
        marca character varying(100),
        modelo character varying(100),
        ano integer,
        color character varying(100),
        valor_estimado_usd numeric(12, 2),
        destacada boolean DEFAULT false,
        orden integer DEFAULT 0,
        slug character varying(255),
        progreso_manual numeric(5, 2),
        CONSTRAINT rifas_pkey PRIMARY KEY (id),
        CONSTRAINT rifas_estado_check CHECK (
          estado IN ('activa', 'cerrada', 'finalizada')
        )
      );
    `;

    // Crear índices
    const createIndexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_rifas_estado ON public.rifas(estado);
      CREATE INDEX IF NOT EXISTS idx_rifas_activa ON public.rifas(activa);
      CREATE INDEX IF NOT EXISTS idx_rifas_categoria_id ON public.rifas(categoria_id);
      CREATE INDEX IF NOT EXISTS idx_rifas_fecha_creacion ON public.rifas(fecha_creacion);
      CREATE INDEX IF NOT EXISTS idx_rifas_destacada ON public.rifas(destacada);
    `;

    // Ejecutar creación de tabla
    logger.info('📋 Creando tabla rifas...');
    const { error: tableError } = await config.supabase.rpc('exec_sql', { 
      sql_query: createTableSQL 
    });

    if (tableError) {
      logger.error('❌ Error al crear tabla rifas:', tableError);
      return false;
    }

    logger.success('✅ Tabla rifas creada exitosamente');

    // Ejecutar creación de índices
    logger.info('🔍 Creando índices...');
    const { error: indexError } = await config.supabase.rpc('exec_sql', { 
      sql_query: createIndexesSQL 
    });

    if (indexError) {
      logger.warning('⚠️ Error al crear algunos índices:', indexError);
    } else {
      logger.success('✅ Índices creados exitosamente');
    }

    // Verificar que la tabla se creó correctamente
    logger.info('🔍 Verificando estructura de la tabla...');
    const { data: columns, error: describeError } = await config.supabase.rpc('exec_sql', { 
      sql_query: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'rifas' 
        ORDER BY ordinal_position;
      ` 
    });

    if (describeError) {
      logger.error('❌ Error al verificar estructura:', describeError);
      return false;
    }

    logger.info('📊 Estructura de la tabla rifas:');
    columns.forEach(col => {
      logger.info(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)'}`);
    });

    // Insertar algunas rifas de ejemplo si la tabla está vacía
    const { count, error: countError } = await config.supabase
      .from('rifas')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      logger.warning('⚠️ No se pudo verificar si la tabla tiene datos:', countError);
    } else if (count === 0) {
      logger.info('📝 Insertando rifas de ejemplo...');
      
      const rifasEjemplo = [
        {
          titulo: 'Toyota 4Runner TRD Pro 2022',
          descripcion: 'SUV todoterreno de alta gama con especificaciones TRD Pro',
          precio_ticket: 25.00,
          imagen_url: '/images/2022_Toyota_4Runner_TRD_Pro_Lime_Rush_001.jpeg',
          estado: 'activa',
          total_tickets: 100,
          tickets_disponibles: 100,
          premio_principal: 'Toyota 4Runner TRD Pro 2022',
          condiciones: 'Ganador debe ser mayor de 18 años y residente en Venezuela',
          activa: true,
          tipo_rifa: 'vehiculo',
          categoria: 'automovil',
          marca: 'Toyota',
          modelo: '4Runner TRD Pro',
          ano: 2022,
          color: 'Lime Rush',
          valor_estimado_usd: 45000,
          destacada: true,
          orden: 1,
          slug: 'toyota-4runner-trd-pro-2022'
        },
        {
          titulo: 'Toyota Camry 2023',
          descripcion: 'Sedán ejecutivo con tecnología avanzada y confort premium',
          precio_ticket: 20.00,
          imagen_url: '/images/camry.jpeg',
          estado: 'activa',
          total_tickets: 150,
          tickets_disponibles: 150,
          premio_principal: 'Toyota Camry 2023',
          condiciones: 'Ganador debe ser mayor de 18 años y residente en Venezuela',
          activa: true,
          tipo_rifa: 'vehiculo',
          categoria: 'automovil',
          marca: 'Toyota',
          modelo: 'Camry',
          ano: 2023,
          color: 'Blanco Perla',
          valor_estimado_usd: 35000,
          destacada: false,
          orden: 2,
          slug: 'toyota-camry-2023'
        }
      ];

      const { error: insertError } = await config.supabase
        .from('rifas')
        .insert(rifasEjemplo);

      if (insertError) {
        logger.error('❌ Error al insertar rifas de ejemplo:', insertError);
      } else {
        logger.success(`✅ ${rifasEjemplo.length} rifas de ejemplo insertadas`);
      }
    } else {
      logger.info(`📊 La tabla ya tiene ${count} rifas registradas`);
    }

    logger.success('🎉 Proceso completado exitosamente');
    return true;

  } catch (error) {
    logger.error('💥 Error inesperado:', error);
    return false;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  createRifasTable()
    .then(success => {
      if (success) {
        logger.success('✅ Script ejecutado exitosamente');
        process.exit(0);
      } else {
        logger.error('❌ Script falló');
        process.exit(1);
      }
    })
    .catch(err => {
      logger.error('💥 Error fatal:', err);
      process.exit(1);
    });
}

module.exports = { createRifasTable };
