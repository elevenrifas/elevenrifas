/**
 * 💰 SISTEMA DE REPORTE DE PAGOS CON TICKETS
 * 
 * Implementación completa en TypeScript para reportar pagos y crear tickets
 * Reemplaza la función SQL problemática con una solución más robusta
 */

import { supabase } from './supabase';
import { 
  generateMultipleTicketNumbers, 
  TicketNumberOptions,
  getTicketAvailabilityStats
} from './utils/ticket-generator';
import { getVenezuelaISOString } from '../utils/venezuela-date';

// =====================================================
// INTERFACES Y TIPOS
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
  
  // Datos de los tickets
  cantidad_tickets: number;
  rifa_id: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
}

export interface ResultadoPagoCompleto {
  success: boolean;
  pago_id?: string;
  tickets_creados?: number;
  detalles?: {
    pago: any;
    tickets: any[];
  };
  error?: string;
}

export interface TicketData {
  rifa_id: string;
  pago_id: string;
  numero_ticket: string;
  nombre: string;
  cedula: string;
  telefono: string;
  correo: string;
  fecha_compra: string;
  estado: 'pagado' | 'pendiente' | 'reservado';
}

// =====================================================
// FUNCIÓN PRINCIPAL: REPORTAR PAGO CON TICKETS
// =====================================================

/**
 * Función principal para reportar pago y crear tickets
 * Implementa transacciones para garantizar consistencia
 */
export async function reportarPagoConTicketsTS(
  datos: DatosPagoCompleto
): Promise<ResultadoPagoCompleto> {
  
  console.log('🚀 INICIANDO reportarPagoConTicketsTS:', {
    rifa_id: datos.rifa_id,
    cantidad: datos.cantidad_tickets,
    tipo_pago: datos.tipo_pago,
    monto_usd: datos.monto_usd,
    monto_bs: datos.monto_bs,
    reserva_id: datos.reserva_id || 'N/A',
          tiene_comprobante: !!datos.comprobante_url
  });
  
  console.log('📊 DATOS COMPLETOS RECIBIDOS:', {
    ...datos,
          comprobante_url: datos.comprobante_url || 'N/A'
  });

  try {
    // PASO 1: Verificar que la rifa existe y obtener información
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select('id, precio_ticket, total_tickets')
      .eq('id', datos.rifa_id)
      .single();

    if (rifaError || !rifa) {
      return {
        success: false,
        error: `Rifa no encontrada: ${rifaError?.message || 'ID inválido'}`
      };
    }

    console.log('✅ Rifa verificada:', {
      id: rifa.id,
      precio_ticket: rifa.precio_ticket,
      total_tickets: rifa.total_tickets
    });

    // 🆕 PASO 2: VERIFICAR SI HAY TICKETS RESERVADOS
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

    // 🆕 PASO 3: SOLO VALIDAR DISPONIBILIDAD SI NO HAY RESERVA
    console.log('🔍 DECISIÓN DE VALIDACIÓN:', {
      tieneReserva,
      ticketsReservados: ticketsReservados.length,
      reserva_id: datos.reserva_id,
      proceder_a_validar: !tieneReserva
    });
    
    if (!tieneReserva) {
      console.log('🔍 VERIFICANDO DISPONIBILIDAD (NO HAY RESERVA)...');
    const statsPre = await getTicketAvailabilityStats(datos.rifa_id, 4);
    const disponiblesPre = statsPre.available;
    
    console.log('📊 DISPONIBILIDAD VERIFICADA:', {
      disponibles: disponiblesPre,
      solicitados: datos.cantidad_tickets,
      total_rifa: rifa.total_tickets,
      existing: statsPre.existing
    });
    
    if (disponiblesPre < datos.cantidad_tickets) {
      const error = `Solo hay ${disponiblesPre} tickets disponibles, se solicitaron ${datos.cantidad_tickets}`;
      console.error('❌ ERROR DE DISPONIBILIDAD:', error);
      return {
        success: false,
        error: error
      };
    }
    
    console.log('✅ DISPONIBILIDAD CONFIRMADA - Continuando con la creación del pago');
    } else {
      console.log('✅ USANDO TICKETS RESERVADOS - Saltando validación de disponibilidad');
      console.log('🎫 Tickets reservados confirmados para uso:', {
        cantidad: ticketsReservados.length,
        reserva_id: datos.reserva_id,
        numeros: ticketsReservados.map(t => t.numero_ticket)
      });
    }

    // PASO 4: Crear el pago
    console.log('💳 Creando pago...');
    
    // Preparar datos del pago con validación (solo campos que existen en la tabla)
    const pagoData = {
      tipo_pago: datos.tipo_pago,
      estado: datos.estado || 'pendiente',
      monto_bs: datos.monto_bs,
      monto_usd: datos.monto_usd,
      tasa_cambio: datos.tasa_cambio,
      referencia: datos.referencia || `AUTO-${Date.now()}`,
      telefono_pago: datos.telefono_pago || null,
      banco_pago: datos.banco_pago || null,
      cedula_pago: datos.cedula_pago || null,
      fecha_visita: datos.fecha_visita || null,
      rifa_id: datos.rifa_id,
      comprobante_url: datos.comprobante_url || null,
      nombre_titular: datos.nombre_titular || null
    };

    console.log('📝 Datos del pago a insertar:', pagoData);
    
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert(pagoData)
      .select()
      .single();

    if (pagoError || !pago) {
      console.error('❌ Error al crear pago:', pagoError);
      console.error('📝 Datos que causaron el error:', pagoData);
      return {
        success: false,
        error: `Error al crear pago: ${pagoError?.message || 'Pago no creado'}. Detalles: ${JSON.stringify(pagoError?.details || {})}`
      };
    }

    const pago_id = pago.id;
    console.log('✅ Pago creado:', pago_id);
    
    // 🆕 PASO 5: USAR TICKETS RESERVADOS O CREAR NUEVOS
    let tickets_creados: any[] = [];
    
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
        // Limpiar pago creado
        await supabase.from('pagos').delete().eq('id', pago_id);
        return {
          success: false,
          error: `Error al actualizar tickets reservados: ${actualizacionError.message}`
        };
      }

      tickets_creados = ticketsActualizados || [];
      console.log('✅ Tickets reservados adoptados:', {
        cantidad: tickets_creados.length,
        numeros: tickets_creados.map(t => t.numero_ticket)
      });

    } else {
      // ✅ OPCIÓN B: Crear nuevos tickets
      console.log('🆕 CREANDO NUEVOS TICKETS...');
      
      for (let i = 0; i < datos.cantidad_tickets; i++) {
        const { data: numero_ticket, error: numeroError } = await supabase.rpc(
          'generar_numero_ticket',
          { rifa_id_param: datos.rifa_id }
        );
        
        if (numeroError) {
          console.error(`❌ Error al generar número de ticket ${i + 1}:`, numeroError);
          // Limpiar pago creado
          await supabase.from('pagos').delete().eq('id', pago_id);
        return {
          success: false,
            error: `Error al generar número de ticket ${i + 1}: ${numeroError.message}`
          };
        }
        
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
          // Limpiar pago creado
          await supabase.from('pagos').delete().eq('id', pago_id);
          return {
            success: false,
            error: `Error al crear ticket ${i + 1}: ${ticketError?.message || 'Ticket no creado'}`
          };
        }
        
        tickets_creados.push(ticket);
      }
      
      console.log('✅ Nuevos tickets creados:', {
        cantidad: tickets_creados.length,
        numeros: tickets_creados.map(t => t.numero_ticket)
      });
    }
    
    // 🆕 PASO 6: VERIFICACIÓN FINAL
    if (tickets_creados.length !== datos.cantidad_tickets) {
      console.error('❌ VERIFICACIÓN FINAL FALLIDA - LIMPIANDO TODO');
      
      // Limpiar pago creado
      await supabase.from('pagos').delete().eq('id', pago_id);
        
        return {
          success: false,
        error: `Verificación final fallida: se esperaban ${datos.cantidad_tickets} tickets, se crearon ${tickets_creados.length}`
      };
    }
    
    console.log('🎉 PAGO COMPLETADO EXITOSAMENTE:', {
      pago_id,
      tickets_creados: tickets_creados.length,
      numeros: tickets_creados.map(t => t.numero_ticket)
    });
    
    return {
      success: true,
      pago_id: pago_id,
      tickets_creados: tickets_creados.length,
      detalles: {
        pago: pago,
        tickets: tickets_creados
      }
    };

  } catch (error) {
    console.error('❌ ERROR GENERAL EN reportarPagoConTicketsTS:', error);
    return {
      success: false,
      error: `Error inesperado: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

/**
 * Verifica el estado de un pago
 */
export async function verificarEstadoPago(pago_id: string): Promise<any> {
  const { data: pago, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('id', pago_id)
    .single();

  if (error) {
    throw new Error(`Error obteniendo pago: ${error.message}`);
  }

  return pago;
}

/**
 * Obtiene todos los tickets asociados a un pago
 */
export async function obtenerTicketsDePago(pago_id: string): Promise<any[]> {
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('pago_id', pago_id);

  if (error) {
    throw new Error(`Error obteniendo tickets: ${error.message}`);
  }

  return tickets || [];
}

/**
 * Obtiene estadísticas de tickets para una rifa
 */
export async function obtenerEstadisticasTickets(rifa_id: string): Promise<{
  total: number;
  vendidos: number;
  disponibles: number;
}> {
  const { data: rifa, error } = await supabase
    .from('rifas')
    .select('total_tickets, tickets_disponibles')
    .eq('id', rifa_id)
    .single();

  if (error) {
    throw new Error(`Error obteniendo estadísticas: ${error.message}`);
  }

  const total = rifa.total_tickets || 0;
  const vendidos = (rifa.total_tickets || 0) - (rifa.tickets_disponibles || 0);
  const disponibles = rifa.tickets_disponibles || 0;

  return { total, vendidos, disponibles };
}
