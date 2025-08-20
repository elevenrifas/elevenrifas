-- =====================================================
-- 🗄️ INSERT SIMPLE: Crear Usuario Administrador
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política básica
CREATE POLICY "Allow all operations" ON public.profiles
  FOR ALL USING (true);

-- 4. INSERT del perfil de administrador
-- NOTA: Primero crea el usuario desde Supabase Dashboard > Authentication > Users
-- Luego ejecuta este INSERT con el ID del usuario creado

-- Opción A: Si ya tienes el usuario creado, solo actualiza el rol
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@elevenrifas.com';

-- Opción B: Insertar perfil completo (reemplaza USER_ID_AQUI con el ID real)
-- INSERT INTO public.profiles (id, email, role, created_at)
-- VALUES ('USER_ID_AQUI', 'admin@elevenrifas.com', 'admin', NOW());

-- 5. Verificar
SELECT * FROM public.profiles WHERE email = 'admin@elevenrifas.com';
