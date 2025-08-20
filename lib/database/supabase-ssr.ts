// =====================================================
// 🔌 CLIENTE SUPABASE SSR - ELEVEN RIFAS
// =====================================================
// Cliente específico para Server Components con cookies
// IMPORTANTE: Solo importar este archivo en Server Components
// NO importar en archivos que se ejecuten en el cliente
// =====================================================

// NOTA: Este archivo solo se debe importar en Server Components
// Para evitar conflictos, no se exporta desde el index principal

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

// Variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Cliente para Server Components con cookies completas
export async function createSSRClient() {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignorar errores en Server Components
          }
        },
      },
    }
  )
}

// Cliente SSR estático (para casos donde no se necesiten cookies)
export const supabaseSSR = createServerClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No hacer nada en SSR estático
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
)

