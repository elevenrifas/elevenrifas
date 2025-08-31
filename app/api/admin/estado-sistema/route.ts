import { NextRequest, NextResponse } from 'next/server';
import { obtenerEstadoLimpieza, limpiarReservasExpiradas } from '@/lib/cron/limpiar-reservas';
import { liberarReservasExpiradas } from '@/lib/database/reservas';

export async function GET(request: NextRequest) {
  try {
    // Verificar si es una solicitud de administrador (aquí podrías agregar autenticación)
    const authHeader = request.headers.get('authorization');
    
    // Por ahora, permitir acceso sin autenticación para testing
    // En producción, deberías verificar un token válido
    
    console.log('📊 SOLICITUD DE ESTADO DEL SISTEMA');
    
    // Obtener estado del sistema de limpieza
    const estadoLimpieza = obtenerEstadoLimpieza();
    
    // Ejecutar una limpieza manual para obtener estadísticas
    const resultadoLimpieza = await liberarReservasExpiradas();
    
    // Obtener información del sistema
    const infoSistema = {
      timestamp: new Date().toISOString(),
      entorno: process.env.NODE_ENV || 'desarrollo',
      version: '1.0.0',
      limpieza: {
        estado: estadoLimpieza,
        ultima_limpieza: {
          exitosa: resultadoLimpieza.success,
          reservas_liberadas: resultadoLimpieza.liberadas,
          error: resultadoLimpieza.error || null
        }
      },
      estadisticas: {
        reservas_expiradas_limpiadas: resultadoLimpieza.liberadas,
        sistema_activo: estadoLimpieza.activa
      }
    };
    
    console.log('📊 ESTADO DEL SISTEMA:', infoSistema);
    
    return NextResponse.json({
      success: true,
      data: infoSistema
    });
    
  } catch (error) {
    console.error('❌ ERROR AL OBTENER ESTADO DEL SISTEMA:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Endpoint para ejecutar limpieza manual
    const authHeader = request.headers.get('authorization');
    
    console.log('🧹 SOLICITUD DE LIMPIEZA MANUAL');
    
    const resultado = await limpiarReservasExpiradas();
    
    if (resultado.success) {
      console.log(`✅ LIMPIEZA MANUAL EJECUTADA: ${resultado.liberadas} reservas liberadas`);
      return NextResponse.json({
        success: true,
        mensaje: `Limpieza manual ejecutada exitosamente`,
        resultado: {
          reservas_liberadas: resultado.liberadas,
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('❌ ERROR EN LIMPIEZA MANUAL:', resultado.error);
      return NextResponse.json({
        success: false,
        error: resultado.error
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ ERROR INESPERADO EN LIMPIEZA MANUAL:', error);
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 });
  }
}
