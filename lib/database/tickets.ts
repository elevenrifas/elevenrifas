// =====================================================
// 🎫 OPERACIONES DE TICKETS - ELEVEN RIFAS
// =====================================================
// Todas las operaciones relacionadas con tickets
// Centralizadas y organizadas por funcionalidad
// =====================================================

import { supabase } from './supabase'

// =====================================================
// INTERFACES PARA TICKETS
// =====================================================

export interface TicketConRifa {
  id: string
  rifa_id: string
  numero_ticket: string
  nombre: string
  cedula: string
  telefono?: string
  correo: string
  fecha_compra: string
  pago_id?: string
  // Datos de la rifa
  rifa: {
    id: string
    titulo: string
    imagen_url: string
    estado: string
    activa: boolean
  }
}

export interface RifaConTickets {
  rifa_id: string
  titulo: string
  imagen_url: string
  estado: string
  activa: boolean
  tickets: TicketConRifa[]
  total_tickets: number
}

// =====================================================
// CONSULTAS PRINCIPALES
// =====================================================

/**
 * Obtener tickets por cédula o correo
 */
export async function obtenerTicketsPorIdentificacion(
  tipo: 'cedula' | 'email',
  valor: string
): Promise<TicketConRifa[]> {
  try {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        rifa:rifas(
          id,
          titulo,
          imagen_url,
          estado,
          activa
        )
      `)
      .eq(tipo === 'cedula' ? 'cedula' : 'correo', valor)
      .order('fecha_compra', { ascending: false })

    if (error) {
      console.error(`❌ Error al obtener tickets por ${tipo}:`, error.message)
      return []
    }

    return (data || []) as TicketConRifa[]

  } catch (error) {
    console.error('💥 Error inesperado al obtener tickets:', error)
    return []
  }
}

/**
 * Agrupar tickets por rifa para mostrar en la interfaz
 */
export async function obtenerRifasConTickets(
  tipo: 'cedula' | 'email',
  valor: string
): Promise<RifaConTickets[]> {
  try {
    const tickets = await obtenerTicketsPorIdentificacion(tipo, valor)
    
    // Agrupar tickets por rifa
    const rifasMap = new Map<string, RifaConTickets>()
    
    tickets.forEach(ticket => {
      if (!ticket.rifa) return
      
      const rifaId = ticket.rifa_id
      
      if (!rifasMap.has(rifaId)) {
        rifasMap.set(rifaId, {
          rifa_id: rifaId,
          titulo: ticket.rifa.titulo,
          imagen_url: ticket.rifa.imagen_url,
          estado: ticket.rifa.estado,
          activa: ticket.rifa.activa,
          tickets: [],
          total_tickets: 0
        })
      }
      
      const rifa = rifasMap.get(rifaId)!
      rifa.tickets.push(ticket)
      rifa.total_tickets += 1
    })
    
    return Array.from(rifasMap.values())

  } catch (error) {
    console.error('💥 Error inesperado al agrupar tickets por rifa:', error)
    return []
  }
}

/**
 * Verificar si existen tickets para una identificación
 */
export async function verificarExistenciaTickets(
  tipo: 'cedula' | 'email',
  valor: string
): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq(tipo === 'cedula' ? 'cedula' : 'correo', valor)

    if (error) {
      console.error(`❌ Error al verificar tickets por ${tipo}:`, error.message)
      return false
    }

    return (count || 0) > 0

  } catch (error) {
    console.error('💥 Error inesperado al verificar tickets:', error)
    return false
  }
}
