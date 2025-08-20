// =====================================================
// 🛠️ ADMIN DB - USUARIOS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// =====================================================

import { supabase } from '@/lib/database'

export interface AdminUsuario {
  id: string
  nombre?: string | null
  correo?: string | null
  telefono?: string | null
  creado_el?: string | null
}

export async function adminListUsuarios() {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id, nombre, correo, telefono, creado_el')
    .order('creado_el', { ascending: false })
  if (error) return { success: false as const, error: error.message }
  return { success: true as const, data: (data || []) as AdminUsuario[] }
}


