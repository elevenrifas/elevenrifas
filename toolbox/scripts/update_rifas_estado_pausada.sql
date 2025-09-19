-- =====================================================
-- 🎯 ACTUALIZACIÓN: AGREGAR ESTADO "PAUSADA" A RIFAS
-- =====================================================
-- Script para agregar el estado "pausada" a la tabla rifas
-- Fecha: $(date)
-- =====================================================

-- 1. Eliminar constraint existente
ALTER TABLE public.rifas DROP CONSTRAINT IF EXISTS rifas_estado_check;

-- 2. Agregar nuevo constraint con estado "pausada"
ALTER TABLE public.rifas ADD CONSTRAINT rifas_estado_check CHECK (
  (estado)::text = ANY (
    ARRAY[
      ('activa'::character varying)::text,
      ('cerrada'::character varying)::text,
      ('pausada'::character varying)::text
    ]
  )
);

-- 3. Agregar comentario explicativo
COMMENT ON COLUMN public.rifas.estado IS 'Estado de la rifa: activa (abierta), cerrada (cerrada), pausada (temporalmente pausada)';

-- 4. Verificar que el constraint se aplicó correctamente
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.rifas'::regclass 
  AND conname = 'rifas_estado_check';

-- 5. Mostrar estados actuales en la tabla (para verificación)
SELECT 
  estado,
  COUNT(*) as cantidad
FROM public.rifas 
GROUP BY estado 
ORDER BY estado;

-- =====================================================
-- ✅ VERIFICACIÓN FINAL
-- =====================================================
-- Verificar que se pueden insertar rifas con el nuevo estado
-- (Esta consulta debe ejecutarse manualmente para verificar)

-- INSERT INTO public.rifas (titulo, descripcion, precio_ticket, estado) 
-- VALUES ('Test Pausada', 'Rifa de prueba', 1.00, 'pausada');

-- SELECT * FROM public.rifas WHERE titulo = 'Test Pausada';
-- DELETE FROM public.rifas WHERE titulo = 'Test Pausada';
