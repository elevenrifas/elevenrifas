-- =====================================================
-- 🗄️ SCRIPT SQL: Crear Usuario Administrador
-- =====================================================
-- Ejecuta este script en Supabase SQL Editor
-- =====================================================

-- Primero, crear la tabla profiles si no existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad básicas
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Permitir inserción de perfiles (para el admin inicial)
CREATE POLICY "Allow profile insertion" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- CREAR USUARIO ADMINISTRADOR
-- =====================================================

-- Insertar usuario en auth.users (esto se hace automáticamente al registrarse)
-- Pero podemos crear el perfil directamente

-- Crear perfil de administrador (reemplaza 'USER_ID_AQUI' con el ID real del usuario)
-- Para obtener el USER_ID, primero crea el usuario desde el dashboard de Supabase
-- o usa este query después de crear el usuario manualmente

-- Opción 1: Si ya tienes un usuario creado, actualiza su rol a admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'admin@elevenrifas.com';

-- Opción 2: Insertar perfil de admin (reemplaza USER_ID_AQUI con el ID real)
-- INSERT INTO public.profiles (id, email, role, created_at)
-- VALUES ('USER_ID_AQUI', 'admin@elevenrifas.com', 'admin', NOW());

-- =====================================================
-- VERIFICAR QUE EL USUARIO ADMIN EXISTE
-- =====================================================

-- Verificar usuarios admin
SELECT 
  p.id,
  p.email,
  p.role,
  p.created_at,
  u.email_confirmed_at,
  u.last_sign_in_at
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.role = 'admin';

-- =====================================================
-- INSTRUCCIONES PARA CREAR EL USUARIO MANUALMENTE
-- =====================================================

/*
PASOS PARA CREAR EL USUARIO ADMIN:

1. Ve a Supabase Dashboard > Authentication > Users
2. Haz clic en "Add User"
3. Completa los campos:
   - Email: admin@elevenrifas.com
   - Password: admin123456
   - Email Confirm: ✅ (marca esta casilla)
4. Haz clic en "Add User"

5. Una vez creado, ejecuta este query para hacerlo admin:
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE email = 'admin@elevenrifas.com';

6. Verifica que se creó correctamente:
   SELECT * FROM public.profiles WHERE email = 'admin@elevenrifas.com';
*/
