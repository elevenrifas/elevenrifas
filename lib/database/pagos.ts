/**
 * 🎫 MÓDULO DE GESTIÓN DE PAGOS - ELEVEN RIFAS
 * 
 * NUEVA IMPLEMENTACIÓN: 1 PAGO → MÚLTIPLES TICKETS
 * Implementa la lógica completa de reporte de pagos:
 * 1. Crear pago en tabla pagos
 * 2. Crear múltiples tickets asociados al pago
 * 3. Tickets se bloquean automáticamente
 * 4. Todo en una transacción
 */

import { supabase } from '@/lib/database';

// Tipos no utilizados removidos para evitar warnings de ESLint

// =====================================================
// TIPOS PARA EL NUEVO FLUJO
// =====================================================

export interface DatosPagoCompleto {
  // Datos del pago
  tipo_pago: 'pago_movil' | 'binance' | 'zelle' | 'zinli' | 'paypal' | 'efectivo';
  monto_bs: number;
  monto_usd: number;
  tasa_cambio: number;
  referencia: string;
  telefono_pago?: string;
  banco_pago?: string;
  cedula_pago?: string;
  id_binance?: string;
  correo_zelle?: string;
  banco_zelle?: string;
  usuario_zinli?: string;
  correo_paypal?: string;
  fecha_visita?: string;
  notas?: string;
  
  // Datos de los tickets
  cantidad_tickets: number;
  rifa_id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  email: string;
}

export interface ResultadoPagoCompleto {
  success: boolean;
  pago_id?: string;
  tickets_creados?: number;
  error?: string;
  detalles?: {
    pago: Record<string, unknown>;
    tickets: Record<string, unknown>[];
  };
}

// =====================================================
// NUEVA FUNCIÓN: REPORTAR PAGO Y CREAR TICKETS
// =====================================================

/**
 * NUEVA FUNCIÓN: Reportar pago y crear tickets en la misma transacción
 * Esta es la función principal que implementa el flujo correcto
 */
export async function reportarPagoConTickets(datos: DatosPagoCompleto): Promise<ResultadoPagoCompleto> {
  try {
    // Ejecutar la transacción completa usando SQL directo
    const { data, error } = await supabase.rpc('reportar_pago_con_tickets', {
      // Parámetros del pago
      p_tipo_pago: datos.tipo_pago,
      p_monto_bs: datos.monto_bs,
      p_monto_usd: datos.monto_usd,
      p_tasa_cambio: datos.tasa_cambio,
      p_referencia: datos.referencia,
      p_telefono_pago: datos.telefono_pago,
      p_banco_pago: datos.banco_pago,
      p_cedula_pago: datos.cedula_pago,
      p_id_binance: datos.id_binance,
      p_correo_zelle: datos.correo_zelle,
      p_banco_zelle: datos.banco_zelle,
      p_usuario_zinli: datos.usuario_zinli,
      p_correo_paypal: datos.correo_paypal,
      p_fecha_visita: datos.fecha_visita,
      p_notas: datos.notas,
      
      // Parámetros de los tickets
      p_cantidad_tickets: datos.cantidad_tickets,
      p_rifa_id: datos.rifa_id,
      p_nombre: datos.nombre,
      p_cedula: datos.cedula,
      p_telefono: datos.telefono,
      p_email: datos.email
    });

    if (error) {
      return {
        success: false,
        error: `Error en transacción: ${error.message}`
      };
    }

    return {
      success: true,
      pago_id: data?.pago_id,
      tickets_creados: datos.cantidad_tickets,
      detalles: {
        pago: data?.pago,
        tickets: data?.tickets || []
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// =====================================================
// FUNCIÓN ALTERNATIVA: Si no existe la función SQL
// =====================================================

/**
 * FUNCIÓN ALTERNATIVA: Implementación en TypeScript puro
 * Se usa si no existe la función SQL reportar_pago_con_tickets
 */
export async function reportarPagoConTicketsTS(datos: DatosPagoCompleto): Promise<ResultadoPagoCompleto> {
  try {
    // PASO 1: Crear el pago
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert({
        tipo_pago: datos.tipo_pago,
        estado: 'pendiente',
        monto_bs: datos.monto_bs,
        monto_usd: datos.monto_usd,
        tasa_cambio: datos.tasa_cambio,
        referencia: datos.referencia,
        fecha_pago: new Date().toISOString(),
        telefono_pago: datos.telefono_pago,
        banco_pago: datos.banco_pago,
        cedula_pago: datos.cedula_pago,
        id_binance: datos.id_binance,
        correo_zelle: datos.correo_zelle,
        banco_zelle: datos.banco_zelle,
        usuario_zinli: datos.usuario_zinli,
        correo_paypal: datos.correo_paypal,
        fecha_visita: datos.fecha_visita,
        notas: datos.notas
      })
      .select()
      .single();

    if (pagoError || !pago) {
      return {
        success: false,
        error: `Error al crear pago: ${pagoError?.message || 'Pago no creado'}`
      };
    }

    const pago_id = pago.id;
    const tickets_creados = [];

    // PASO 2: Crear múltiples tickets asociados al pago
    for (let i = 0; i < datos.cantidad_tickets; i++) {
      // Generar número de ticket único usando la función SQL
      const { data: numero_ticket, error: numeroError } = await supabase.rpc(
        'generar_numero_ticket',
        { rifa_id_param: datos.rifa_id }
      );

      if (numeroError) {
        return {
          success: false,
          error: `Error al generar número de ticket: ${numeroError.message}`
        };
      }

      // Crear el ticket
      const { data: ticket, error: ticketError } = await supabase
        .from('tickets')
        .insert({
          rifa_id: datos.rifa_id,
          pago_id: pago_id,
          numero_ticket: numero_ticket,
          nombre: datos.nombre,
          cedula: datos.cedula,
          telefono: datos.telefono,
          email: datos.email,
          estado: 'reservado',
          fecha_compra: new Date().toISOString(),
          bloqueado_por_pago: true,  // Se bloquea automáticamente
          pago_bloqueador_id: pago_id,  // El mismo pago lo bloquea
          fecha_bloqueo: new Date().toISOString(),
          estado_verificacion: 'pendiente'
        })
        .select()
        .single();

      if (ticketError || !ticket) {
        return {
          success: false,
          error: `Error al crear ticket ${i + 1}: ${ticketError?.message || 'Ticket no creado'}`
        };
      }

      tickets_creados.push(ticket);
    }

    return {
      success: true,
      pago_id: pago_id,
      tickets_creados: datos.cantidad_tickets,
      detalles: {
        pago: pago,
        tickets: tickets_creados
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// =====================================================
// FUNCIONES DE VERIFICACIÓN Y RECHAZO (ACTUALIZADAS)
// =====================================================

/**
 * Verificar pago y desbloquear tickets asociados
 */
export async function verificarPagoCompleto(
  pago_id: string, 
  verificado_por: string, 
  notas?: string
): Promise<ResultadoPagoCompleto> {
  try {
    // PASO 1: Verificar el pago
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .update({
        estado: 'verificado',
        fecha_verificacion: new Date().toISOString(),
        verificado_por: verificado_por,
        notas: notas
      })
      .eq('id', pago_id)
      .select()
      .single();

    if (pagoError || !pago) {
      return {
        success: false,
        error: `Error al verificar pago: ${pagoError?.message || 'Pago no encontrado'}`
      };
    }

    // PASO 2: Desbloquear todos los tickets asociados
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .update({
        bloqueado_por_pago: false,
        pago_bloqueador_id: null,
        fecha_bloqueo: null,
        estado_verificacion: 'verificado',
        estado: 'pagado',
        fecha_verificacion: new Date().toISOString()
      })
      .eq('pago_id', pago_id)
      .select();

    if (ticketsError) {
      return {
        success: false,
        error: `Error al desbloquear tickets: ${ticketsError.message}`
      };
    }

    return {
      success: true,
      pago_id: pago_id,
      tickets_creados: tickets?.length || 0,
      detalles: {
        pago: pago,
        tickets: tickets || []
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Rechazar pago y desbloquear tickets asociados
 */
export async function rechazarPagoCompleto(
  pago_id: string,
  verificado_por: string,
  motivo_rechazo: string
): Promise<ResultadoPagoCompleto> {
  try {
    // PASO 1: Rechazar el pago
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .update({
        estado: 'rechazado',
        fecha_verificacion: new Date().toISOString(),
        verificado_por: verificado_por,
        notas: motivo_rechazo
      })
      .eq('id', pago_id)
      .select()
      .single();

    if (pagoError || !pago) {
      return {
        success: false,
        error: `Error al rechazar pago: ${pagoError?.message || 'Pago no encontrado'}`
      };
    }

    // PASO 2: Desbloquear todos los tickets asociados
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .update({
        bloqueado_por_pago: false,
        pago_bloqueador_id: null,
        fecha_bloqueo: null,
        estado_verificacion: 'rechazado',
        estado: 'reservado'  // Volver a estado reservado
      })
      .eq('pago_id', pago_id)
      .select();

    if (ticketsError) {
      return {
        success: false,
        error: `Error al desbloquear tickets: ${ticketsError.message}`
      };
    }

    return {
      success: true,
      pago_id: pago_id,
      tickets_creados: tickets?.length || 0,
      detalles: {
        pago: pago,
        tickets: tickets || []
      }
    };

  } catch (error) {
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// =====================================================
// FUNCIONES DE CONSULTA (ACTUALIZADAS)
// =====================================================

/**
 * Obtener todos los tickets de un pago específico
 */
export async function obtenerTicketsDePago(pago_id: string) {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        pagos!inner(tipo_pago, monto_usd, referencia, estado),
        rifas!inner(titulo)
      `)
      .eq('pago_id', pago_id)
      .order('numero_ticket');

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * Obtener pagos pendientes de verificación
 */
export async function obtenerPagosPendientes() {
  try {
    const { data, error } = await supabase
      .from('pagos')
      .select(`
        *,
        tickets!inner(id, numero_ticket, nombre, rifa_id),
        rifas!inner(titulo, precio_ticket)
      `)
      .eq('estado', 'pendiente')
      .order('fecha_pago');

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

/**
 * OBTENER ESTADÍSTICAS DE PAGOS
 * Resumen de pagos por estado y tipo
 */
export async function obtenerEstadisticasPagos() {
  try {
    // Estadísticas por estado
    const { data: porEstado, error: errorEstado } = await supabase
      .from('pagos')
      .select('estado, monto_usd, monto_bs');
    
    if (errorEstado) throw errorEstado;
    
    // Estadísticas por tipo de pago
    const { data: porTipo, error: errorTipo } = await supabase
      .from('pagos')
      .select('tipo_pago, monto_usd, monto_bs')
      .eq('estado', 'verificado');
    
    if (errorTipo) throw errorTipo;
    
    // Procesar estadísticas
    const estadisticas = {
      porEstado: porEstado?.reduce((acc, pago) => {
        if (!acc[pago.estado]) {
          acc[pago.estado] = { cantidad: 0, total_usd: 0, total_bs: 0 };
        }
        acc[pago.estado].cantidad++;
        acc[pago.estado].total_usd += pago.monto_usd;
        acc[pago.estado].total_bs += pago.monto_bs;
        return acc;
      }, {} as Record<string, { cantidad: number; total_usd: number; total_bs: number }>),
      
      porTipo: porTipo?.reduce((acc, pago) => {
        if (!acc[pago.tipo_pago]) {
          acc[pago.tipo_pago] = { cantidad: 0, total_usd: 0, total_bs: 0 };
        }
        acc[pago.tipo_pago].cantidad++;
        acc[pago.tipo_pago].total_usd += pago.monto_usd;
        acc[pago.tipo_pago].total_bs += pago.monto_bs;
        return acc;
      }, {} as Record<string, { cantidad: number; total_usd: number; total_bs: number }>)
    };
    
    return estadisticas;
    
  } catch (error) {
    throw new Error(`Error al obtener estadísticas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
  }
}


