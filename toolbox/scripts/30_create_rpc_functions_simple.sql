-- =====================================================
-- 🚀 FUNCIONES RPC PARA ELEVEN RIFAS
-- =====================================================
-- Ejecutar este archivo directamente en la base de datos
-- para crear las funciones RPC necesarias
-- =====================================================

-- Función para obtener una rifa completa con estadísticas
CREATE OR REPLACE FUNCTION public.get_rifa_full(p_rifa_id uuid)
RETURNS TABLE(
  rifa_id uuid,
  titulo text,
  descripcion text,
  imagen_url text,
  precio_ticket numeric,
  estado text,
  fecha_cierre timestamp,
  total_tickets int,
  vendidos int,
  reservas_activas int,
  disponibles int,
  progreso int
)
LANGUAGE sql
STABLE
AS $$
WITH
vendidos AS (
  SELECT rifa_id, count(*)::int AS cnt
  FROM tickets
  WHERE estado = 'pagado' AND rifa_id = p_rifa_id
  GROUP BY rifa_id
),
reservas AS (
  SELECT rifa_id, count(*)::int AS cnt
  FROM tickets
  WHERE estado = 'reservado' AND reservado_hasta > now() AND rifa_id = p_rifa_id
  GROUP BY rifa_id
)
SELECT
  r.id AS rifa_id,
  r.titulo,
  r.descripcion,
  r.imagen_url,
  r.precio_ticket,
  r.estado,
  r.fecha_cierre,
  r.total_tickets,
  COALESCE(v.cnt, 0) AS vendidos,
  COALESCE(res.cnt, 0) AS reservas_activas,
  GREATEST(r.total_tickets - COALESCE(v.cnt,0) - COALESCE(res.cnt,0), 0) AS disponibles,
  CASE WHEN r.total_tickets > 0
       THEN round((COALESCE(v.cnt,0)::numeric / r.total_tickets) * 100)::int
       ELSE 0 END AS progreso
FROM rifas r
LEFT JOIN vendidos v ON v.rifa_id = r.id
LEFT JOIN reservas res ON res.rifa_id = r.id
WHERE r.id = p_rifa_id;
$$;

-- Función para obtener todas las rifas con estadísticas
CREATE OR REPLACE FUNCTION public.get_rifas_full()
RETURNS TABLE(
  rifa_id uuid,
  titulo text,
  descripcion text,
  imagen_url text,
  precio_ticket numeric,
  estado text,
  fecha_cierre timestamp,
  total_tickets int,
  vendidos int,
  reservas_activas int,
  disponibles int,
  progreso int
)
LANGUAGE sql
STABLE
AS $$
WITH
vendidos AS (
  SELECT rifa_id, count(*)::int AS cnt
  FROM tickets
  WHERE estado = 'pagado'
  GROUP BY rifa_id
),
reservas AS (
  SELECT rifa_id, count(*)::int AS cnt
  FROM tickets
  WHERE estado = 'reservado' AND reservado_hasta > now()
  GROUP BY rifa_id
)
SELECT
  r.id AS rifa_id,
  r.titulo,
  r.descripcion,
  r.imagen_url,
  r.precio_ticket,
  r.estado,
  r.fecha_cierre,
  r.total_tickets,
  COALESCE(v.cnt, 0) AS vendidos,
  COALESCE(res.cnt, 0) AS reservas_activas,
  GREATEST(r.total_tickets - COALESCE(v.cnt,0) - COALESCE(res.cnt,0), 0) AS disponibles,
  CASE WHEN r.total_tickets > 0
       THEN round((COALESCE(v.cnt,0)::numeric / r.total_tickets) * 100)::int
       ELSE 0 END AS progreso
FROM rifas r
LEFT JOIN vendidos v ON v.rifa_id = r.id
LEFT JOIN reservas res ON res.rifa_id = r.id
ORDER BY r.fecha_creacion DESC;
$$;

-- Verificar que las funciones se crearon correctamente
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('get_rifa_full', 'get_rifas_full')
ORDER BY routine_name;
