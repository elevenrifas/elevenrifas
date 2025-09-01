import { NextRequest, NextResponse } from 'next/server'
import { initializeAppStorage } from '@/lib/utils/initStorage'

export async function POST(request: NextRequest) {
  try {
    // Verificar que sea una solicitud autorizada (puedes agregar autenticación aquí)
    const authHeader = request.headers.get('authorization')
    
    // En producción, deberías verificar un token válido
    if (process.env.NODE_ENV === 'production' && !authHeader) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    console.log('🚀 [init-storage] Inicializando buckets de storage...')
    
    const result = await initializeAppStorage()
    
    if (result.success) {
      console.log('✅ [init-storage] Storage inicializado correctamente')
      return NextResponse.json({
        success: true,
        message: 'Buckets de storage inicializados correctamente'
      })
    } else {
      console.error('❌ [init-storage] Error inicializando storage:', result.errors)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al inicializar buckets',
          details: result.errors
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('💥 [init-storage] Error inesperado:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [init-storage] Verificando estado de storage...')
    
    const { initializeStorageBuckets } = await import('@/lib/utils/supabaseStorage')
    const result = await initializeStorageBuckets()
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        status: 'ready',
        message: 'Storage listo para usar'
      })
    } else {
      return NextResponse.json({
        success: false,
        status: 'warning',
        message: 'Algunos buckets tienen problemas',
        errors: result.errors
      })
    }

  } catch (error) {
    console.error('💥 [init-storage] Error verificando storage:', error)
    return NextResponse.json(
      { 
        success: false, 
        status: 'error',
        message: 'Error verificando storage',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
