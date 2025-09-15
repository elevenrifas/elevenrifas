-- =====================================================
-- SCRIPT DE DEPURACIÓN: Tickets Especiales Asignados
-- =====================================================
-- Este script ayuda a verificar qué está pasando con los tickets especiales
-- cuando se asignan a pagos
-- =====================================================

-- 1. Verificar tickets especiales que están asignados a pagos
SELECT 
  t.id,
  t.numero_ticket,
  t.nombre,
  t.cedula,
  t.telefono,
  t.correo,
  t.es_ticket_especial,
  t.estado,
  t.pago_id,
  p.nombre_titular,
  p.cedula_pago,
  p.telefono_pago,
  p.estado as estado_pago
FROM public.tickets t
LEFT JOIN public.pagos p ON t.pago_id = p.id
WHERE t.es_ticket_especial = true
  AND t.pago_id IS NOT NULL
ORDER BY t.fecha_compra DESC
LIMIT 10;

-- 2. Verificar si hay tickets especiales que no se actualizaron correctamente
SELECT 
  t.id,
  t.numero_ticket,
  t.nombre,
  t.cedula,
  t.es_ticket_especial,
  t.pago_id,
  p.nombre_titular,
  p.cedula_pago
FROM public.tickets t
LEFT JOIN public.pagos p ON t.pago_id = p.id
WHERE t.es_ticket_especial = true
  AND t.pago_id IS NOT NULL
  AND (t.nombre = 'TICKET RESERVADO' OR t.cedula = '000000000')
ORDER BY t.fecha_compra DESC;

-- 3. Verificar pagos que tienen tickets especiales
SELECT 
  p.id,
  p.nombre_titular,
  p.cedula_pago,
  p.telefono_pago,
  p.estado,
  COUNT(t.id) as total_tickets,
  COUNT(CASE WHEN t.es_ticket_especial = true THEN 1 END) as tickets_especiales
FROM public.pagos p
LEFT JOIN public.tickets t ON p.id = t.pago_id
WHERE p.id IN (
  SELECT DISTINCT pago_id 
  FROM public.tickets 
  WHERE es_ticket_especial = true 
    AND pago_id IS NOT NULL
)
GROUP BY p.id, p.nombre_titular, p.cedula_pago, p.telefono_pago, p.estado
ORDER BY p.fecha_pago DESC;

-- 4. Verificar tickets especiales disponibles (sin asignar)
SELECT 
  t.id,
  t.numero_ticket,
  t.nombre,
  t.cedula,
  t.es_ticket_especial,
  t.estado,
  t.pago_id
FROM public.tickets t
WHERE t.es_ticket_especial = true
  AND t.pago_id IS NULL
  AND t.estado = 'reservado'
ORDER BY t.numero_ticket
LIMIT 10;
