// =====================================================
// 🛠️ ADMIN DB - AUTH
// =====================================================
// Lógica de autenticación exclusiva para el panel de administración
// =====================================================

import { supabase } from '@/lib/database'

export interface AdminUser {
  id: string
  email: string
  role: 'admin' | 'user'
  created_at: string
}

export interface AdminSession {
  user: {
    id: string
    email?: string
  }
}

export async function adminVerifyUser(userId: string): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('id', userId)
      .eq('role', 'admin')
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data) {
      return { success: false, error: 'Usuario no encontrado o sin permisos de administrador' }
    }

    return { success: true, user: data as AdminUser }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

export async function adminGetCurrentUser(session: AdminSession | null): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  if (!session?.user?.id) {
    return { success: false, error: 'No hay sesión activa' }
  }

  return adminVerifyUser(session.user.id)
}

// Iniciar sesión y verificar que el usuario sea admin usando la capa centralizada
export async function adminSignIn(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AdminUser; error?: string }> {
  try {
    // 1) Autenticar con Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      return { success: false, error: error.message }
    }

    if (!data?.user?.id) {
      return { success: false, error: 'No se recibió un usuario válido después de iniciar sesión' }
    }

    // 2) Verificar rol admin
    const verify = await adminVerifyUser(data.user.id)
    if (!verify.success) {
      // Cerrar sesión si no es admin
      await supabase.auth.signOut()
      return { success: false, error: verify.error ?? 'No tienes permisos de administrador' }
    }

    return { success: true, user: verify.user }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido durante el inicio de sesión'
    }
  }
}
