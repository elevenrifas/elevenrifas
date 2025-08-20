// =====================================================
// 🔌 CLIENTE SUPABASE CENTRALIZADO - ELEVEN RIFAS
// =====================================================
// Clientes para operaciones del lado del cliente (browser)
// Para operaciones del servidor, usar lib/database/supabase-server.ts
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// =====================================================
// CLIENTES DEL LADO DEL CLIENTE (BROWSER)
// =====================================================

// Cliente principal para operaciones del lado del cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Cliente para operaciones que requieren autenticación
export const supabaseAuth = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)

// Cliente universal compatible con ambos contextos
export const supabaseUniversal = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
)
