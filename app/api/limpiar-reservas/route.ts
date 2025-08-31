import { NextRequest, NextResponse } from 'next/server';
import { liberarReservasExpiradas } from '@/lib/database/reservas';

export async function POST(request: NextRequest) {
  try {
    console.log('🧹 INICIANDO LIMPIEZA AUTOMÁTICA DE RESERVAS EXPIRADAS...');
    
    const resultado = await liberarReservasExpiradas();
    
    if (resultado.success) {
      console.log(`✅ LIMPIEZA COMPLETADA: ${resultado.liberadas} reservas expiradas liberadas`);
      return NextResponse.json({
        success: true,
        liberadas: resultado.liberadas,
        mensaje: `Se liberaron ${resultado.liberadas} reservas expiradas`
      });
    } else {
      console.error('❌ ERROR EN LIMPIEZA:', resultado.error);
      return NextResponse.json({
        success: false,
        error: resultado.error
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ ERROR INESPERADO EN LIMPIEZA:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

// Endpoint GET para verificar el estado (útil para monitoreo)
export async function GET() {
  try {
    const resultado = await liberarReservasExpiradas();
    
    return NextResponse.json({
      success: true,
      estado: 'Endpoint de limpieza funcionando',
      ultima_limpieza: {
        exitosa: resultado.success,
        reservas_liberadas: resultado.liberadas,
        error: resultado.error || null
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Error al verificar estado'
    }, { status: 500 });
  }
}
