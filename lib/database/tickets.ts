// =====================================================
// 🎫 OPERACIONES DE TICKETS - ELEVEN RIFAS
// =====================================================
// Funciones para consultar tickets de usuarios
// =====================================================

import { supabase } from './supabase'
import type { RifaConTickets, TicketConRifa } from '@/types'

/**
 * Obtener rifas con tickets agrupados por tipo de búsqueda
 * @param tipo - 'cedula' o 'email'
 * @param valor - Valor a buscar
 * @returns Array de rifas con tickets agrupados
 */
export async function obtenerRifasConTickets(
  tipo: 'cedula' | 'email', 
  valor: string
): Promise<RifaConTickets[]> {
  try {
    // 1. Obtener tickets que coincidan con la búsqueda
    const { data: tickets, error: ticketsError } = await supabase
      .from('tickets')
      .select(`
        *,
        rifas (
          id,
          titulo,
          imagen_url,
          estado,
          total_tickets,
          precio_ticket
        )
      `)
      .eq(tipo === 'cedula' ? 'cedula' : 'correo', valor)
      .eq('estado', 'pagado') // Solo tickets pagados
      .order('fecha_compra', { ascending: false })

    if (ticketsError) {
      console.error('❌ Error obteniendo tickets:', ticketsError)
      throw new Error('Error al obtener tickets')
    }

    if (!tickets || tickets.length === 0) {
      return []
    }

    // 2. Agrupar tickets por rifa
    const rifasMap = new Map<string, RifaConTickets>()

    tickets.forEach((ticket: any) => {
      const rifa = ticket.rifas
      if (!rifa) return

      const rifaId = rifa.id
      
      if (!rifasMap.has(rifaId)) {
        // Crear nueva entrada de rifa
        rifasMap.set(rifaId, {
          rifa_id: rifaId,
          titulo: rifa.titulo,
          imagen_url: rifa.imagen_url || '',
          estado: rifa.estado,
          tickets: [],
          total_tickets: rifa.total_tickets || 0,
          precio_promedio: 0
        })
      }

      // Agregar ticket a la rifa
      const rifaConTickets = rifasMap.get(rifaId)!
      const ticketConRifa: TicketConRifa = {
        id: ticket.id,
        rifa_id: ticket.rifa_id,
        numero_ticket: ticket.numero_ticket,
        precio: rifa.precio_ticket || 0,
        nombre: ticket.nombre,
        cedula: ticket.cedula,
        telefono: ticket.telefono,
        correo: ticket.correo,
        estado: ticket.estado,
        fecha_compra: ticket.fecha_compra,
        fecha_verificacion: ticket.fecha_verificacion,
        bloqueado_por_pago: false, // Por defecto
        estado_verificacion: 'verificado', // Por defecto para tickets pagados
        pago_id: ticket.pago_id,
        email: ticket.correo,
        rifa: {
          id: rifa.id,
          titulo: rifa.titulo,
          imagen_url: rifa.imagen_url || '',
          estado: rifa.estado
        }
      }

      rifaConTickets.tickets.push(ticketConRifa)
    })

    // 3. Calcular estadísticas para cada rifa
    const rifasConTickets = Array.from(rifasMap.values()).map(rifa => {
      const totalTickets = rifa.tickets.length
      const precioPromedio = totalTickets > 0 
        ? rifa.tickets.reduce((sum, ticket) => sum + ticket.precio, 0) / totalTickets
        : 0

      return {
        ...rifa,
        precio_promedio: Math.round(precioPromedio * 100) / 100 // Redondear a 2 decimales
      }
    })

    return rifasConTickets

  } catch (error) {
    console.error('💥 Error inesperado en obtenerRifasConTickets:', error)
    throw new Error('Error interno del servidor')
  }
}

/**
 * Obtener tickets de una rifa específica para un usuario
 * @param rifaId - ID de la rifa
 * @param cedula - Cédula del usuario
 * @returns Array de tickets del usuario en esa rifa
 */
export async function obtenerTicketsUsuarioEnRifa(
  rifaId: string, 
  cedula: string
): Promise<TicketConRifa[]> {
  try {
    const { data: tickets, error } = await supabase
      .from('tickets')
      .select(`
        *,
        rifas (
          id,
          titulo,
          imagen_url,
          estado,
          precio_ticket
        )
      `)
      .eq('rifa_id', rifaId)
      .eq('cedula', cedula)
      .eq('estado', 'pagado')
      .order('numero_ticket')

    if (error) {
      console.error('❌ Error obteniendo tickets del usuario:', error)
      throw new Error('Error al obtener tickets')
    }

    if (!tickets || tickets.length === 0) {
      return []
    }

    return tickets.map((ticket: any) => ({
      id: ticket.id,
      rifa_id: ticket.rifa_id,
      numero_ticket: ticket.numero_ticket,
      precio: ticket.rifas?.precio_ticket || 0,
      nombre: ticket.nombre,
      cedula: ticket.cedula,
      telefono: ticket.telefono,
      correo: ticket.correo,
      estado: ticket.estado,
      fecha_compra: ticket.fecha_compra,
      fecha_verificacion: ticket.fecha_verificacion,
      bloqueado_por_pago: false,
      estado_verificacion: 'verificado',
      pago_id: ticket.pago_id,
      email: ticket.correo,
      rifa: {
        id: ticket.rifas?.id || '',
        titulo: ticket.rifas?.titulo || '',
        imagen_url: ticket.rifas?.imagen_url || '',
        estado: ticket.rifas?.estado || ''
      }
    }))

  } catch (error) {
    console.error('💥 Error inesperado en obtenerTicketsUsuarioEnRifa:', error)
    throw new Error('Error interno del servidor')
  }
}













