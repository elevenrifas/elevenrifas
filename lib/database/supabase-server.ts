// =====================================================
// 🔌 CLIENTE SUPABASE DEL SERVIDOR - ELEVEN RIFAS
// =====================================================
// Cliente para operaciones del servidor (compatible con ambos contextos)
// NO usa next/headers para evitar conflictos con Pages Router
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente del servidor (sin cookies, solo para operaciones básicas)
export const supabaseServer = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

// Función para crear cliente con cookies (solo usar en Server Components)
export async function createServerClient() {
  // Retornar el cliente básico del servidor
  // Para funcionalidad completa de cookies, usar directamente en Server Components
  return supabaseServer
}

// Cliente para operaciones de autenticación del servidor
export const supabaseServerAuth = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)
