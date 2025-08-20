-- =====================================================
-- 🗄️ INSERT DIRECTO: Crear Usuario Administrador
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- 1. Crear tabla profiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Política para permitir inserción
CREATE POLICY "Allow profile insertion" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 4. INSERT DIRECTO del usuario en auth.users
-- NOTA: Esto requiere permisos de administrador en Supabase
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(), -- Genera un UUID único
  'admin@elevenrifas.com',
  crypt('admin123456', gen_salt('bf')), -- Encripta la contraseña
  NOW(), -- Email confirmado
  NOW(), -- Fecha de creación
  NOW(), -- Fecha de actualización
  '', -- Token de confirmación
  '', -- Cambio de email
  '', -- Token de cambio de email
  '' -- Token de recuperación
);

-- 5. Obtener el ID del usuario recién creado
WITH new_user AS (
  SELECT id FROM auth.users 
  WHERE email = 'admin@elevenrifas.com' 
  ORDER BY created_at DESC 
  LIMIT 1
)
-- 6. INSERT del perfil de administrador
INSERT INTO public.profiles (id, email, role, created_at)
SELECT 
  id,
  'admin@elevenrifas.com',
  'admin',
  NOW()
FROM new_user;

-- 7. Verificar que se creó correctamente
SELECT 
  u.id,
  u.email,
  u.email_confirmed_at,
  p.role,
  p.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@elevenrifas.com';
