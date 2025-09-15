import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * API Route profesional para invalidación de caché en Vercel
 * Optimizada para el ecosistema Vercel + Supabase
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, secret, data } = body;

    // Verificar secret para seguridad (especialmente importante en Vercel)
    const validSecret = process.env.REVALIDATE_SECRET || 'dev-secret';
    if (secret !== validSecret) {
      console.error('❌ Revalidate: Secret inválido');
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    console.log(`🔄 Revalidando caché por evento: ${type}`, data);

    // Invalidación selectiva basada en el tipo de evento
    switch (type) {
      case 'rifa_created':
      case 'rifa_updated':
      case 'rifa_deleted':
      case 'rifa_state_changed':
        // Invalidar página home y páginas de rifas específicas
        revalidatePath('/');
        revalidatePath('/rifa/[id]', 'page');
        revalidateTag('rifas');
        console.log('✅ Caché de rifas invalidado');
        break;
        
      case 'pago_verified':
      case 'pago_rejected':
        // Invalidar páginas relacionadas con pagos
        revalidatePath('/admin/pagos');
        revalidateTag('pagos');
        console.log('✅ Caché de pagos invalidado');
        break;
        
      case 'full_revalidate':
        // Invalidación completa (para casos críticos)
        revalidatePath('/');
        revalidatePath('/admin', 'layout');
        revalidateTag('rifas');
        revalidateTag('pagos');
        console.log('✅ Caché completo invalidado');
        break;
        
      default:
        // Invalidación conservadora por defecto
        revalidatePath('/');
        console.log('✅ Caché de página home invalidado');
    }

    return NextResponse.json({
      success: true,
      type,
      timestamp: new Date().toISOString(),
      message: `Caché invalidado para: ${type}`
    });

  } catch (error) {
    console.error('❌ Error en revalidate API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar que la API está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'API de revalidación de caché activa',
    status: 'operational',
    timestamp: new Date().toISOString(),
    usage: 'POST con { type, secret, data }'
  });
}
