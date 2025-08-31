import { liberarReservasExpiradas } from '@/lib/database/reservas';

/**
 * 🧹 SISTEMA DE LIMPIEZA AUTOMÁTICA DE RESERVAS EXPIRADAS
 * 
 * Esta función se ejecuta automáticamente para liberar tickets
 * que fueron reservados pero nunca se pagaron.
 */

let limpiezaActiva = false;
let intervaloLimpieza: NodeJS.Timeout | null = null;

/**
 * Inicia el sistema de limpieza automática
 * @param intervaloMinutos - Cada cuántos minutos ejecutar la limpieza (default: 2)
 */
export function iniciarLimpiezaAutomatica(intervaloMinutos: number = 2): void {
  if (limpiezaActiva) {
    console.log('⚠️ Sistema de limpieza ya está activo');
    return;
  }

  console.log(`🧹 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA (cada ${intervaloMinutos} minutos)`);
  
  limpiezaActiva = true;
  
  // Ejecutar limpieza inmediatamente
  ejecutarLimpieza();
  
  // Programar limpieza periódica
  intervaloLimpieza = setInterval(ejecutarLimpieza, intervaloMinutos * 60 * 1000);
  
  console.log('✅ Sistema de limpieza automática iniciado');
}

/**
 * Detiene el sistema de limpieza automática
 */
export function detenerLimpiezaAutomatica(): void {
  if (!limpiezaActiva) {
    console.log('⚠️ Sistema de limpieza no está activo');
    return;
  }

  console.log('🛑 DETENIENDO SISTEMA DE LIMPIEZA AUTOMÁTICA');
  
  limpiezaActiva = false;
  
  if (intervaloLimpieza) {
    clearInterval(intervaloLimpieza);
    intervaloLimpieza = null;
  }
  
  console.log('✅ Sistema de limpieza automática detenido');
}

/**
 * Ejecuta una limpieza manual de reservas expiradas
 */
export async function ejecutarLimpieza(): Promise<void> {
  try {
    console.log('🧹 EJECUTANDO LIMPIEZA AUTOMÁTICA DE RESERVAS EXPIRADAS...');
    
    const resultado = await liberarReservasExpiradas();
    
    if (resultado.success) {
      if (resultado.liberadas > 0) {
        console.log(`✅ LIMPIEZA COMPLETADA: ${resultado.liberadas} reservas expiradas liberadas`);
      } else {
        console.log('✅ LIMPIEZA COMPLETADA: No hay reservas expiradas para limpiar');
      }
    } else {
      console.error('❌ ERROR EN LIMPIEZA AUTOMÁTICA:', resultado.error);
    }
  } catch (error) {
    console.error('❌ ERROR INESPERADO EN LIMPIEZA AUTOMÁTICA:', error);
  }
}

/**
 * Verifica el estado del sistema de limpieza
 */
export function obtenerEstadoLimpieza(): {
  activa: boolean;
  ultimaEjecucion?: Date;
  proximaEjecucion?: Date;
} {
  return {
    activa: limpiezaActiva,
    // Aquí podrías agregar más información del estado
  };
}

/**
 * Función para limpiar reservas expiradas en el servidor
 * Se puede llamar desde un cron job externo o desde el sistema
 */
export async function limpiarReservasExpiradas(): Promise<{
  success: boolean;
  liberadas: number;
  error?: string;
}> {
  try {
    console.log('🧹 LIMPIEZA MANUAL DE RESERVAS EXPIRADAS SOLICITADA');
    
    const resultado = await liberarReservasExpiradas();
    
    if (resultado.success) {
      console.log(`✅ LIMPIEZA MANUAL COMPLETADA: ${resultado.liberadas} reservas expiradas liberadas`);
    } else {
      console.error('❌ ERROR EN LIMPIEZA MANUAL:', resultado.error);
    }
    
    return resultado;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.error('❌ ERROR INESPERADO EN LIMPIEZA MANUAL:', errorMsg);
    return { success: false, liberadas: 0, error: errorMsg };
  }
}

// AUTO-INICIO DESACTIVADO - SISTEMA DE LIMPIEZA COMPLETAMENTE PAUSADO
// Auto-iniciar limpieza cuando se importe el módulo (solo en desarrollo)
// if (process.env.NODE_ENV === 'development') {
//   // En desarrollo, iniciar limpieza cada 1 minuto para testing
//   setTimeout(() => {
//     iniciarLimpiezaAutomatica(1);
//   }, 5000); // Esperar 5 segundos antes de iniciar
// }
