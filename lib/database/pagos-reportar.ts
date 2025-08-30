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
  
  console.log('🚀 Iniciando reporte de pago y creación de tickets...');
  console.log('📊 Datos recibidos:', {
    rifa_id: datos.rifa_id,
    cantidad_tickets: datos.cantidad_tickets,
    monto_total_usd: datos.monto_usd,
    monto_total_bs: datos.monto_bs
  });

  try {
    // PASO 1: Verificar que la rifa existe y obtener información
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select('id, precio_ticket, total_tickets, tickets_disponibles')
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
      total_tickets: rifa.total_tickets,
      tickets_disponibles: rifa.tickets_disponibles
    });

    // PASO 2: Verificar disponibilidad de tickets
    const ticketsDisponibles = rifa.tickets_disponibles || 0;
    
    if (ticketsDisponibles < datos.cantidad_tickets) {
      return {
        success: false,
        error: `Solo hay ${ticketsDisponibles} tickets disponibles, se solicitaron ${datos.cantidad_tickets}`
      };
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
        fecha_pago: new Date().toISOString(),
        telefono_pago: datos.telefono_pago,
        banco_pago: datos.banco_pago,
        cedula_pago: datos.cedula_pago,
        fecha_visita: datos.fecha_visita,
        rifa_id: datos.rifa_id,
        comprobante_url: datos.comprobante_url
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
    console.log('✅ Pago creado:', pago_id);

    // PASO 4: Generar números de ticket únicos
    console.log('🎫 Generando números de ticket únicos...');
    
    const ticketOptions: TicketNumberOptions = {
      rifa_id: datos.rifa_id,
      minDigits: 5, // 00001, 00002, etc.
      maxNumber: 99999 // Número máximo de ticket
    };

    // Obtener estadísticas de disponibilidad
    const stats = await getTicketAvailabilityStats(datos.rifa_id, 5, 99999);
    console.log('📊 Estadísticas de tickets:', {
      total: stats.total,
      existentes: stats.existing,
      disponibles: stats.available,
      porcentaje: `${stats.percentage}%`
    });

    const numerosTicket = await generateMultipleTicketNumbers(
      ticketOptions, 
      datos.cantidad_tickets
    );

    console.log('✅ Números de ticket generados:', numerosTicket);

    // PASO 5: Crear los tickets
    console.log('🎫 Creando tickets...');
    
    const ticketsData: TicketData[] = numerosTicket.map(numero => ({
      rifa_id: datos.rifa_id,
      pago_id: pago_id,
      numero_ticket: numero,
      nombre: datos.nombre,
      cedula: datos.cedula,
      telefono: datos.telefono,
      correo: datos.correo,
      fecha_compra: new Date().toISOString()
    }));

    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .insert(ticketsData)
      .select();

    if (ticketsError || !tickets) {
      // Si falla la creación de tickets, eliminar el pago creado
      console.error('❌ Error creando tickets, eliminando pago...');
      await supabase
        .from('pagos')
        .delete()
        .eq('id', pago_id);
      
      return {
        success: false,
        error: `Error al crear tickets: ${ticketsError?.message || 'Tickets no creados'}`
      };
    }

    console.log('✅ Tickets creados:', tickets.length);

    // PASO 6: Actualizar contador de tickets disponibles en la rifa
    console.log('📊 Actualizando contador de tickets disponibles...');
    
    const { error: updateError } = await supabase
      .from('rifas')
      .update({ 
        tickets_disponibles: Math.max(0, (rifa.tickets_disponibles || 0) - datos.cantidad_tickets)
      })
      .eq('id', datos.rifa_id);

    if (updateError) {
      console.warn('⚠️ Error actualizando contador de tickets vendidos:', updateError);
      // No es crítico, continuar
    }

    // PASO 7: Retornar resultado exitoso
    console.log('🎉 Proceso completado exitosamente');
    
    return {
      success: true,
      pago_id: pago_id,
      tickets_creados: datos.cantidad_tickets,
      detalles: {
        pago: pago,
        tickets: tickets
      }
    };

  } catch (error) {
    console.error('💥 Error inesperado:', error);
    
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
