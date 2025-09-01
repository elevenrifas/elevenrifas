-- =====================================================
-- 📋 ACTUALIZACIÓN DE TABLA PAGOS - COMPROBANTES
-- =====================================================
-- Script para asegurar que la tabla pagos tenga el campo comprobante_url
-- y mostrar cómo se guarda la URL del comprobante
-- =====================================================

-- Verificar si existe el campo comprobante_url
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pagos' 
        AND column_name = 'comprobante_url'
    ) THEN
        -- Agregar el campo si no existe
        ALTER TABLE public.pagos 
        ADD COLUMN comprobante_url character varying(500);
        
        RAISE NOTICE 'Campo comprobante_url agregado a la tabla pagos';
    ELSE
        RAISE NOTICE 'Campo comprobante_url ya existe en la tabla pagos';
    END IF;
END $$;

-- Crear índice para optimizar búsquedas por comprobante
CREATE INDEX IF NOT EXISTS idx_pagos_comprobante_url 
ON public.pagos(comprobante_url);

-- Crear índice para optimizar búsquedas por rifa_id
CREATE INDEX IF NOT EXISTS idx_pagos_rifa_id 
ON public.pagos(rifa_id);

-- =====================================================
-- 📋 EJEMPLO DE INSERCIÓN CON COMPROBANTE
-- =====================================================

-- Ejemplo de cómo se insertaría un pago con comprobante:
/*
INSERT INTO public.pagos (
    tipo_pago,
    monto_bs,
    monto_usd,
    tasa_cambio,
    referencia,
    telefono_pago,
    banco_pago,
    cedula_pago,
    estado,
    rifa_id,
    comprobante_url  -- ← Aquí se guarda la URL del comprobante
) VALUES (
    'pago_movil',
    100.00,
    3.45,
    29.00,
    'REF-123456789',
    '0412-1234567',
    'Banco de Venezuela',
    'V-12345678',
    'pendiente',
    'uuid-de-la-rifa',
    'https://tu-proyecto.supabase.co/storage/v1/object/public/Comprobantes/rifas/uuid-rifa/pago-uuid-timestamp-random.pdf'
);
*/

-- =====================================================
-- 📋 CONSULTAS ÚTILES PARA VERIFICAR COMPROBANTES
-- =====================================================

-- Ver todos los pagos con comprobantes
-- SELECT id, tipo_pago, monto_usd, comprobante_url, estado FROM pagos WHERE comprobante_url IS NOT NULL;

-- Ver pagos de una rifa específica con comprobantes
-- SELECT p.*, r.titulo as rifa_titulo 
-- FROM pagos p 
-- JOIN rifas r ON p.rifa_id = r.id 
-- WHERE p.rifa_id = 'uuid-de-la-rifa' AND p.comprobante_url IS NOT NULL;

-- Contar pagos con y sin comprobantes
-- SELECT 
--     COUNT(*) as total_pagos,
--     COUNT(comprobante_url) as con_comprobante,
--     COUNT(*) - COUNT(comprobante_url) as sin_comprobante
-- FROM pagos;

-- =====================================================
-- 📋 POLÍTICAS RLS PARA EL BUCKET "Comprobantes"
-- =====================================================

-- Nota: Estas políticas deben ejecutarse en Supabase Dashboard → Storage → Policies

/*
-- Política para permitir inserción de comprobantes (usuarios autenticados)
CREATE POLICY "Subir comprobantes" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir lectura de comprobantes (solo admins/service_role)
CREATE POLICY "Leer comprobantes" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'service_role'
);

-- Política para permitir actualización de comprobantes (usuarios autenticados)
CREATE POLICY "Actualizar comprobantes" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'authenticated'
);

-- Política para permitir eliminación de comprobantes (solo admins)
CREATE POLICY "Eliminar comprobantes" ON storage.objects
FOR DELETE USING (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'service_role'
);
*/
