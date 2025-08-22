// =====================================================
// 🔌 CLIENTE SUPABASE CENTRALIZADO - ELEVEN RIFAS
// =====================================================
// Cliente único para operaciones del lado del cliente (browser)
// Para operaciones del servidor, usar lib/database/supabase-server.ts
// =====================================================

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/supabase'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// =====================================================
// CLIENTE ÚNICO DEL LADO DEL CLIENTE (BROWSER)
// =====================================================

// Cliente único para operaciones del lado del cliente
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'eleven-rifas-auth'
  }
})

// NOTA: Solo exportar el cliente principal para evitar múltiples instancias
