import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// =====================================================
// 🛡️ MIDDLEWARE DE AUTENTICACIÓN - ELEVEN RIFAS
// =====================================================
// TEMPORALMENTE DESHABILITADO para evitar loops infinitos
// La autenticación se maneja en el LoginGuard y ProtectedRoute
// =====================================================

export async function middleware(request: NextRequest) {
  // TEMPORALMENTE DESHABILITADO - Permitir todas las rutas
  // La autenticación se maneja en el cliente con LoginGuard
  return NextResponse.next()
  
  // CÓDIGO ORIGINAL COMENTADO:
  /*
  const { pathname } = request.nextUrl
  
  // Solo proteger rutas admin (excluyendo login y assets)
  if (!pathname.startsWith('/admin') || 
      pathname === '/admin/login' ||
      pathname.startsWith('/admin/_next') ||
      pathname.startsWith('/admin/api')) {
    return NextResponse.next()
  }

  try {
    // Obtener token de autorización del header o cookies de Supabase
    const authHeader = request.headers.get('authorization')
    let token = authHeader?.replace('Bearer ', '')
    
    // Si no hay token en header, buscar en cookies de Supabase
    if (!token) {
      // Buscar en todas las cookies posibles de Supabase
      const cookies = request.cookies
      const supabaseCookies = [
        'sb-eleven-rifas-auth-token',
        'sb-eleven-rifas-auth-token-0',
        'sb-eleven-rifas-auth-token-1',
        'sb-eleven-rifas-auth-token-2'
      ]
      
      for (const cookieName of supabaseCookies) {
        const cookie = cookies.get(cookieName)
        if (cookie?.value) {
          try {
            // Intentar parsear el valor de la cookie
            const cookieData = JSON.parse(decodeURIComponent(cookie.value))
            if (cookieData.access_token) {
              token = cookieData.access_token
              break
            }
          } catch (e) {
            // Si no se puede parsear, continuar con la siguiente cookie
            continue
          }
        }
      }
    }

    if (!token) {
      console.log(`🔒 Middleware: Sin token, redirigiendo a login desde ${pathname}`)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar token con Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      console.log(`🔒 Middleware: Token inválido, redirigiendo a login desde ${pathname}`)
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Verificar si es admin (solo en rutas críticas)
    if (pathname.startsWith('/admin/dashboard') || 
        pathname.startsWith('/admin/rifas') ||
        pathname.startsWith('/admin/usuarios') ||
        pathname.startsWith('/admin/pagos')) {
      
      // Verificar rol admin en base de datos
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .eq('role', 'admin')
        .single()

      if (profileError || !profile || profile.role !== 'admin') {
        console.log(`🔒 Middleware: Usuario no es admin, acceso denegado a ${pathname}`)
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    }

    console.log(`✅ Middleware: Acceso permitido a ${pathname} para ${user.email}`)
    return NextResponse.next()

  } catch (error) {
    console.error(`❌ Middleware: Error verificando autenticación para ${pathname}:`, error)
    // En caso de error, permitir acceso (fallback de seguridad)
    return NextResponse.next()
  }
  */
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (handled separately)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}
