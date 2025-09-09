import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

/**
 * Webhook de Supabase para invalidación automática de caché
 * Se ejecuta automáticamente cuando cambian los datos en la BD
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, table, record, old_record } = body;

    // Verificar que viene de Supabase (opcional, por seguridad)
    const authHeader = request.headers.get('authorization');
    if (authHeader && !authHeader.includes(process.env.SUPABASE_WEBHOOK_SECRET || 'supabase-secret')) {
      console.log('❌ Webhook: Token de autorización inválido');
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    console.log(`🔄 Webhook Supabase: ${type} en tabla ${table}`, { record, old_record });

    // Invalidar caché basado en la tabla y tipo de evento
    switch (table) {
      case 'rifas':
        handleRifasWebhook(type, record, old_record);
        break;
        
      case 'tickets':
        handleTicketsWebhook(type, record, old_record);
        break;
        
      case 'pagos':
        handlePagosWebhook(type, record, old_record);
        break;
        
      default:
        // Para otras tablas, invalidación conservadora
        revalidatePath('/');
        console.log('✅ Caché general invalidado por webhook');
    }

    return NextResponse.json({
      success: true,
      message: `Webhook procesado: ${type} en ${table}`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error en webhook de Supabase:', error);
    return NextResponse.json(
      { 
        error: 'Error procesando webhook',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * Manejar eventos de la tabla rifas
 */
function handleRifasWebhook(type: string, record: any, old_record: any) {
  switch (type) {
    case 'INSERT':
      // Nueva rifa creada
      revalidatePath('/');
      revalidateTag('rifas');
      console.log('✅ Caché invalidado: Nueva rifa creada');
      break;
      
    case 'UPDATE':
      // Rifa actualizada
      revalidatePath('/');
      revalidatePath('/rifa/[id]', 'page');
      revalidateTag('rifas');
      console.log('✅ Caché invalidado: Rifa actualizada');
      break;
      
    case 'DELETE':
      // Rifa eliminada
      revalidatePath('/');
      revalidateTag('rifas');
      console.log('✅ Caché invalidado: Rifa eliminada');
      break;
  }
}

/**
 * Manejar eventos de la tabla tickets
 */
function handleTicketsWebhook(type: string, record: any, old_record: any) {
  // Los tickets afectan el progreso de las rifas
  if (type === 'INSERT' || type === 'UPDATE' || type === 'DELETE') {
    revalidatePath('/');
    revalidateTag('rifas');
    console.log('✅ Caché invalidado: Cambio en tickets');
  }
}

/**
 * Manejar eventos de la tabla pagos
 */
function handlePagosWebhook(type: string, record: any, old_record: any) {
  if (type === 'UPDATE' && record.estado !== old_record?.estado) {
    // Cambio de estado de pago
    revalidatePath('/admin/pagos');
    revalidateTag('pagos');
    console.log('✅ Caché invalidado: Estado de pago cambiado');
  }
}

// Endpoint GET para verificar que el webhook está funcionando
export async function GET() {
  return NextResponse.json({
    message: 'Webhook de Supabase activo',
    status: 'operational',
    timestamp: new Date().toISOString(),
    tables: ['rifas', 'tickets', 'pagos']
  });
}
