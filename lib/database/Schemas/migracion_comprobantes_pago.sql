-- =====================================================
-- MIGRACIÓN: AGREGAR CAMPOS DE COMPROBANTES DE PAGO
-- =====================================================
-- Fecha: $(date)
-- Descripción: Agregar campos para almacenar comprobantes de pago
-- =====================================================

-- Agregar campos de comprobantes a la tabla pagos (OPCIONALES)
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS comprobante_pago_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS comprobante_pago_nombre VARCHAR(255) NULL;

-- Crear índice para búsquedas por comprobante
CREATE INDEX IF NOT EXISTS idx_pagos_comprobante_url ON public.pagos(comprobante_pago_url);
CREATE INDEX IF NOT EXISTS idx_pagos_comprobante_nombre ON public.pagos(comprobante_pago_nombre);

-- Comentarios para documentar los nuevos campos
COMMENT ON COLUMN public.pagos.comprobante_pago_url IS 'URL del comprobante de pago subido por el usuario';
COMMENT ON COLUMN public.pagos.comprobante_pago_nombre IS 'Nombre original del archivo del comprobante de pago';

-- Verificar que los campos se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name IN ('comprobante_pago_url', 'comprobante_pago_nombre');

-- =====================================================
-- ACTUALIZAR FUNCIONES EXISTENTES
-- =====================================================

-- Actualizar la función reportar_pago_con_tickets para incluir comprobantes
-- (Esto ya se hizo en los archivos principales)

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
-- Verificar la estructura final de la tabla
\d+ public.pagos;
