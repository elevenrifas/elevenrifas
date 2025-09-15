-- =====================================================
-- MIGRACIÓN: Marcar tickets especiales existentes
-- =====================================================
-- Este script marca como especiales todos los tickets que
-- actualmente se identifican por nombre='TICKET RESERVADO' y cedula='000000000'
-- =====================================================

-- Actualizar tickets existentes que son especiales pero no tienen el campo marcado
UPDATE public.tickets 
SET es_ticket_especial = true 
WHERE nombre = 'TICKET RESERVADO' 
  AND cedula = '000000000'
  AND (es_ticket_especial IS NULL OR es_ticket_especial = false);

-- Verificar la migración
SELECT 
  COUNT(*) as total_tickets_especiales,
  COUNT(CASE WHEN es_ticket_especial = true THEN 1 END) as marcados_como_especiales,
  COUNT(CASE WHEN es_ticket_especial = false THEN 1 END) as marcados_como_normales,
  COUNT(CASE WHEN es_ticket_especial IS NULL THEN 1 END) as sin_marcar
FROM public.tickets 
WHERE nombre = 'TICKET RESERVADO' AND cedula = '000000000';

-- Mostrar algunos ejemplos
SELECT 
  id,
  numero_ticket,
  nombre,
  cedula,
  es_ticket_especial,
  estado,
  pago_id
FROM public.tickets 
WHERE nombre = 'TICKET RESERVADO' AND cedula = '000000000'
ORDER BY fecha_compra DESC
LIMIT 10;
