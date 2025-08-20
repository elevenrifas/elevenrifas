-- =====================================================
-- 🗄️ SCRIPT FINAL: Crear Usuario Administrador
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

-- 4. Hacer admin al usuario existente
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@elevenrifas.com';

-- 5. Verificar
SELECT * FROM public.profiles WHERE email = 'admin@elevenrifas.com';
