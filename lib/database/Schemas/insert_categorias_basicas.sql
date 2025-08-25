-- =====================================================
-- 📋 INSERTAR CATEGORÍAS BÁSICAS - ELEVEN RIFAS
-- =====================================================
-- Script simple para insertar solo las categorías esenciales
-- =====================================================

-- Limpiar tabla si tiene datos existentes
DELETE FROM public.categorias_rifas;

-- Insertar solo las categorías básicas necesarias
INSERT INTO public.categorias_rifas (nombre, icono) VALUES
  ('Vehículos', 'car'),
  ('Tecnología', 'smartphone'),
  ('Hogar', 'home'),
  ('Entretenimiento', 'gamepad2'),
  ('Moda', 'shirt'),
  ('Deportes', 'bicycle'),
  ('Alimentos', 'coffee'),
  ('Educación', 'book-open'),
  ('Viajes', 'plane'),
  ('Mascotas', 'heart');

-- Verificar inserción
SELECT id, nombre, icono FROM public.categorias_rifas ORDER BY nombre;
