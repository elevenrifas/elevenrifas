-- Calcula métricas de una rifa específica y retorna datos completos
create or replace function public.get_rifa_full(p_rifa_id uuid)
returns table(
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
language sql
stable
as $$
with
vendidos as (
  select rifa_id, count(*)::int as cnt
  from tickets
  where estado = 'pagado' and rifa_id = p_rifa_id
  group by rifa_id
),
reservas as (
  select rifa_id, count(*)::int as cnt
  from tickets
  where estado = 'reservado' and reservado_hasta > now() and rifa_id = p_rifa_id
  group by rifa_id
)
select
  r.id as rifa_id,
  r.titulo,
  r.descripcion,
  r.imagen_url,
  r.precio_ticket,
  r.estado,
  r.fecha_cierre,
  r.total_tickets,
  coalesce(v.cnt, 0) as vendidos,
  coalesce(res.cnt, 0) as reservas_activas,
  greatest(r.total_tickets - coalesce(v.cnt,0) - coalesce(res.cnt,0), 0) as disponibles,
  case when r.total_tickets > 0
       then round((coalesce(v.cnt,0)::numeric / r.total_tickets) * 100)::int
       else 0 end as progreso
from rifas r
left join vendidos v on v.rifa_id = r.id
left join reservas res on res.rifa_id = r.id
where r.id = p_rifa_id;
$$;













