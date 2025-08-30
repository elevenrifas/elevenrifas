-- =====================================================
-- ACTUALIZAR SCHEMA: COMPROBANTES DE PAGO
-- =====================================================
-- Fecha: $(date)
-- Descripción: Actualizar schema para usar solo comprobante_url
-- =====================================================

-- Verificar estructura actual
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name LIKE '%comprobante%';

-- Agregar campo comprobante_url si no existe
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS comprobante_url VARCHAR(500) NULL;

-- Verificar que se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name = 'comprobante_url';

-- Mostrar estructura final de la tabla
\d+ public.pagos;

