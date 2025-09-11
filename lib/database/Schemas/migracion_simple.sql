-- =====================================================
-- MIGRACIÓN SIMPLE: AGREGAR CAMPOS DE COMPROBANTES
-- =====================================================
-- Fecha: $(date)
-- Descripción: Agregar solo los campos necesarios para comprobantes
-- =====================================================

-- Agregar campos de comprobantes a la tabla pagos
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS comprobante_pago_url VARCHAR(500) NULL,
ADD COLUMN IF NOT EXISTS comprobante_pago_nombre VARCHAR(255) NULL;

-- Verificar que los campos se agregaron
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name IN ('comprobante_pago_url', 'comprobante_pago_nombre');

-- Mostrar estructura final de la tabla
\d+ public.pagos;







