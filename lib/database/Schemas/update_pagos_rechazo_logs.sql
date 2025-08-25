-- =====================================================
-- 🗄️ ACTUALIZACIÓN SCHEMA PAGOS - CAMPO RECHAZO_LOGS
-- =====================================================
-- Script para agregar el campo rechazo_logs a la tabla pagos existente
-- Este campo almacenará logs completos cuando se rechacen pagos
-- =====================================================

-- Agregar el campo rechazo_logs a la tabla pagos
ALTER TABLE public.pagos 
ADD COLUMN IF NOT EXISTS rechazo_logs text null;

-- Comentario del campo
COMMENT ON COLUMN public.pagos.rechazo_logs IS 'Logs completos de rechazo incluyendo información de tickets eliminados';

-- Verificar que el campo se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pagos' 
AND column_name = 'rechazo_logs';

-- Mostrar la estructura actualizada de la tabla
\d+ public.pagos;
