-- =====================================================
-- 🎯 SCHEMA TABLA RIFAS - ELEVEN RIFAS
-- =====================================================
-- Schema completo de la tabla rifas con todos los campos necesarios
-- =====================================================

CREATE TABLE IF NOT EXISTS public.rifas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  titulo character varying(255) NOT NULL,
  descripcion text,
  precio_ticket numeric(10, 2) NOT NULL,
  imagen_url character varying(500),
  estado character varying(50) DEFAULT 'activa',
  fecha_creacion timestamp without time zone DEFAULT now(),
  fecha_cierre timestamp without time zone,
  total_tickets integer DEFAULT 0,
  tickets_disponibles integer DEFAULT 0,
  premio_principal text,
  condiciones text,
  activa boolean DEFAULT true,
  categoria_id uuid REFERENCES public.categorias_rifas(id),
  cantidad_tickets integer DEFAULT 0,
  numero_tickets_comprar jsonb DEFAULT '[1, 2, 3, 5, 10]',
  tipo_rifa character varying(100) DEFAULT 'vehiculo',
  fecha_culminacion timestamp without time zone,
  categoria character varying(100) DEFAULT 'automovil',
  marca character varying(100),
  modelo character varying(100),
  ano integer,
  color character varying(100),
  valor_estimado_usd numeric(12, 2),
  destacada boolean DEFAULT false,
  orden integer DEFAULT 0,
  slug character varying(255),
  progreso_manual numeric(5, 2),
  CONSTRAINT rifas_pkey PRIMARY KEY (id),
  CONSTRAINT rifas_estado_check CHECK (
    estado IN ('activa', 'cerrada', 'finalizada')
  )
) TABLESPACE pg_default;

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_rifas_estado ON public.rifas(estado);
CREATE INDEX IF NOT EXISTS idx_rifas_activa ON public.rifas(activa);
CREATE INDEX IF NOT EXISTS idx_rifas_categoria_id ON public.rifas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_rifas_fecha_creacion ON public.rifas(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_rifas_destacada ON public.rifas(destacada);

-- Comentarios de la tabla
COMMENT ON TABLE public.rifas IS 'Tabla principal de rifas del sistema Eleven Rifas';
COMMENT ON COLUMN public.rifas.activa IS 'Indica si la rifa está activa y visible';
COMMENT ON COLUMN public.rifas.estado IS 'Estado de la rifa: activa, cerrada, finalizada';
COMMENT ON COLUMN public.rifas.progreso_manual IS 'Progreso manual de la rifa (0-100)';
COMMENT ON COLUMN public.rifas.numero_tickets_comprar IS 'Array de números de tickets disponibles para compra';
