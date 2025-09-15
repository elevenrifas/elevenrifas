-- =====================================================
-- AGREGAR CAMPO: nombre_titular
-- =====================================================
-- Fecha: $(date)
-- Descripción: Agregar campo nombre_titular para todos los tipos de pago
-- =====================================================

-- Agregar campo nombre_titular a la tabla pagos
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS nombre_titular VARCHAR(255) NULL;

-- Verificar que el campo se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name = 'nombre_titular';

-- Mostrar estructura final de la tabla
\d+ public.pagos;
