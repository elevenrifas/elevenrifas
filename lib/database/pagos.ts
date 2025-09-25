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
import { reportarPagoConTicketsTS as reportarPagoConTicketsNuevo } from './pagos-reportar';
import { getVenezuelaISOString } from '../utils/venezuela-date';

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
  referencia?: string;
  telefono_pago?: string;
  banco_pago?: string;
  cedula_pago?: string;
  fecha_visita?: string;
  estado?: string;
  comprobante_url?: string;
  nombre_titular?: string;
  
  // Datos de los tickets
  cantidad_tickets: number;
  rifa_id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  
  // ID de reserva para usar tickets reservados
  reserva_id?: string;
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
 * FUNCIÓN PRINCIPAL: Reportar pago y crear tickets
 * Usa directamente la implementación TypeScript (más confiable)
 */
export async function reportarPagoConTickets(datos: DatosPagoCompleto): Promise<ResultadoPagoCompleto> {
  console.log('🚀 INICIANDO reportarPagoConTickets:', {
    rifa_id: datos.rifa_id,
    cantidad: datos.cantidad_tickets,
    tipo_pago: datos.tipo_pago,
    monto_usd: datos.monto_usd,
    monto_bs: datos.monto_bs,
    reserva_id: datos.reserva_id || 'N/A',
    tiene_comprobante: !!datos.comprobante_url
  });
  
  console.log('🔄 LLAMANDO A reportarPagoConTicketsNuevo...');
  const resultado = await reportarPagoConTicketsNuevo(datos);
  console.log('📋 RESULTADO DE reportarPagoConTicketsNuevo:', resultado);
  
  return resultado;
}

// =====================================================
// IMPLEMENTACIÓN TYPESCRIPT: FUNCIÓN PRINCIPAL
// =====================================================

/**
 * IMPLEMENTACIÓN PRINCIPAL: Reportar pago y crear tickets en TypeScript
 * Esta función maneja todo el flujo usando tickets reservados
 */
export async function reportarPagoConTicketsTS(datos: DatosPagoCompleto): Promise<ResultadoPagoCompleto> {
  console.log('🚀 INICIANDO reportarPagoConTicketsTS:', {
    rifa_id: datos.rifa_id,
    cantidad: datos.cantidad_tickets,
    tipo_pago: datos.tipo_pago,
    monto_usd: datos.monto_usd,
    monto_bs: datos.monto_bs,
    reserva_id: datos.reserva_id || 'N/A',
    tiene_comprobante: !!datos.comprobante_url
  });

  try {
    // 🆕 PASO 1: VERIFICAR SI HAY TICKETS RESERVADOS
    let ticketsReservados: any[] = [];
    let tieneReserva = false;
    
    console.log('🔍 DIAGNÓSTICO DE RESERVA:', {
      reserva_id_recibido: datos.reserva_id,
      tipo_reserva_id: typeof datos.reserva_id,
      cantidad_solicitada: datos.cantidad_tickets
    });
    
    if (datos.reserva_id) {
      console.log('🎫 VERIFICANDO TICKETS RESERVADOS...');
      
      const { data: reservados, error: reservadosError } = await supabase
        .from('tickets')
        .select('*')
        .eq('reserva_id', datos.reserva_id)
        .eq('estado', 'reservado')
        .eq('rifa_id', datos.rifa_id);

      if (reservadosError) {
        console.error('❌ Error al buscar tickets reservados:', reservadosError);
        return {
          success: false,
          error: `Error al buscar tickets reservados: ${reservadosError.message}`
        };
      }

      console.log('📊 RESULTADO DE BÚSQUEDA DE TICKETS RESERVADOS:', {
        reservados_encontrados: reservados?.length || 0,
        reservados_datos: reservados || [],
        reserva_id_buscado: datos.reserva_id,
        rifa_id_buscado: datos.rifa_id
      });

      if (reservados && reservados.length === datos.cantidad_tickets) {
        ticketsReservados = reservados;
        tieneReserva = true;
        console.log('✅ Tickets reservados encontrados:', {
          cantidad: ticketsReservados.length,
          reserva_id: datos.reserva_id,
          numeros: ticketsReservados.map(t => t.numero_ticket)
        });
      } else {
        console.log('⚠️ No se encontraron tickets reservados válidos:', {
          esperados: datos.cantidad_tickets,
          encontrados: reservados?.length || 0,
          reserva_id: datos.reserva_id,
          condicion_cumplida: reservados && reservados.length === datos.cantidad_tickets
        });
      }
    } else {
      console.log('⚠️ NO HAY RESERVA_ID - Se procederá a validar disponibilidad');
    }
    
    console.log('🎯 ESTADO FINAL DE RESERVA:', {
      tieneReserva,
      ticketsReservados: ticketsReservados.length,
      reserva_id: datos.reserva_id
    });

    // 🆕 PASO 2: SOLO VALIDAR DISPONIBILIDAD SI NO HAY RESERVA
    console.log('🔍 DECISIÓN DE VALIDACIÓN:', {
      tieneReserva,
      ticketsReservados: ticketsReservados.length,
      reserva_id: datos.reserva_id,
      proceder_a_validar: !tieneReserva
    });
    
    if (!tieneReserva) {
      console.log('🔍 VERIFICANDO DISPONIBILIDAD (NO HAY RESERVA)...');
      // Aquí iría la validación de disponibilidad si fuera necesaria
      console.log('⚠️ NO HAY RESERVA - Se procederá a crear tickets nuevos');
    } else {
      console.log('✅ USANDO TICKETS RESERVADOS - Saltando validación de disponibilidad');
      console.log('🎫 Tickets reservados confirmados para uso:', {
        cantidad: ticketsReservados.length,
        reserva_id: datos.reserva_id,
        numeros: ticketsReservados.map(t => t.numero_ticket)
      });
    }

    // PASO 3: Crear el pago
    console.log('💳 Creando pago...');
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert({
        tipo_pago: datos.tipo_pago,
        estado: datos.estado || 'pendiente',
        monto_bs: datos.monto_bs,
        monto_usd: datos.monto_usd,
        tasa_cambio: datos.tasa_cambio,
        referencia: datos.referencia,
        fecha_pago: getVenezuelaISOString(),
        telefono_pago: datos.telefono_pago,
        banco_pago: datos.banco_pago,
        cedula_pago: datos.cedula_pago,
        fecha_visita: datos.fecha_visita,
        comprobante_url: datos.comprobante_url,
        comprobante_pago_nombre: datos.comprobante_url ? datos.comprobante_url.split('/').pop() : null
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
    const tickets_creados = [] as any[];

    // 🆕 PASO 4: USAR TICKETS RESERVADOS O CREAR NUEVOS
    if (tieneReserva && ticketsReservados.length > 0) {
      // ✅ OPCIÓN A: Usar tickets reservados existentes
      console.log('🎫 ADOPTANDO TICKETS RESERVADOS...');
      
      const { data: ticketsActualizados, error: actualizacionError } = await supabase
        .from('tickets')
        .update({
          pago_id: pago_id,
          estado: 'pagado',
          reservado_hasta: null,
          reserva_id: null,
          fecha_compra: getVenezuelaISOString()
        })
        .eq('reserva_id', datos.reserva_id)
        .eq('estado', 'reservado')
        .eq('rifa_id', datos.rifa_id)
        .select('*');

      if (actualizacionError) {
        console.error('❌ Error al actualizar tickets reservados:', actualizacionError);
        return {
          success: false,
          error: `Error al actualizar tickets reservados: ${actualizacionError.message}`
        };
      }

      tickets_creados.push(...(ticketsActualizados || []));
      console.log('✅ Tickets reservados adoptados exitosamente:', {
        cantidad: tickets_creados.length,
        numeros: tickets_creados.map(t => t.numero_ticket)
      });
    } else {
      // ✅ OPCIÓN B: Crear nuevos tickets
      console.log('🆕 CREANDO TICKETS NUEVOS...');
      for (let i = 0; i < datos.cantidad_tickets; i++) {
        console.log(`🔄 Creando ticket ${i + 1}/${datos.cantidad_tickets}...`);
        
        const { data: numero_ticket, error: numeroError } = await supabase.rpc(
          'generar_numero_ticket',
          { rifa_id_param: datos.rifa_id }
        );
        if (numeroError) {
          console.error(`❌ Error al generar número de ticket ${i + 1}:`, numeroError);
          return { success: false, error: `Error al generar número de ticket: ${numeroError.message}` };
        }
        
        console.log(`✅ Número de ticket ${i + 1} generado:`, numero_ticket);
        
        const { data: ticket, error: ticketError } = await supabase
          .from('tickets')
          .insert({
            rifa_id: datos.rifa_id,
            pago_id: pago_id,
            numero_ticket: numero_ticket,
            nombre: datos.nombre,
            cedula: datos.cedula,
            telefono: datos.telefono,
            correo: datos.correo,
            fecha_compra: getVenezuelaISOString(),
            estado: 'pagado'
          })
          .select()
          .single();
        if (ticketError || !ticket) {
          console.error(`❌ Error al crear ticket ${i + 1}:`, ticketError);
          return { success: false, error: `Error al crear ticket ${i + 1}: ${ticketError?.message || 'Ticket no creado'}` };
        }
        
        console.log(`✅ Ticket ${i + 1} creado exitosamente:`, ticket.numero_ticket);
        tickets_creados.push(ticket);
      }
      
      console.log('✅ Todos los tickets nuevos creados exitosamente:', {
        cantidad: tickets_creados.length,
        numeros: tickets_creados.map(t => t.numero_ticket)
      });
    }

    console.log('🎉 PAGO COMPLETADO EXITOSAMENTE:', {
      pago_id,
      tickets_creados: tickets_creados.length,
      numeros: tickets_creados.map(t => t.numero_ticket),
      tipo_creacion: tieneReserva ? 'TICKETS RESERVADOS ADOPTADOS' : 'TICKETS NUEVOS CREADOS'
    });

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
        fecha_verificacion: getVenezuelaISOString(),
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
        fecha_verificacion: getVenezuelaISOString()
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
        fecha_verificacion: getVenezuelaISOString(),
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
export async function obtenerEstadisticasPagos(rifaId?: string) {
  try {
    // Estadísticas por estado
    let porEstadoQuery = supabase
      .from('pagos')
      .select('estado, monto_usd, monto_bs');
    if (rifaId) {
      porEstadoQuery = porEstadoQuery.eq('rifa_id', rifaId)
    }
    const { data: porEstado, error: errorEstado } = await porEstadoQuery;
    
    if (errorEstado) throw errorEstado;
    
    // Estadísticas por tipo de pago
    let porTipoQuery = supabase
      .from('pagos')
      .select('tipo_pago, monto_usd, monto_bs')
      .eq('estado', 'verificado');
    if (rifaId) {
      porTipoQuery = porTipoQuery.eq('rifa_id', rifaId)
    }
    const { data: porTipo, error: errorTipo } = await porTipoQuery;
    
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

// =====================================================
// FUNCIÓN TEST SIMPLE - VERIFICAR RPC
// =====================================================




