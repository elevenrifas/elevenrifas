import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyPagination, 
  applyOrdering 
} from '@/lib/database'
import type { AdminTicket, CreateTicketData, UpdateTicketData } from '@/types'

// =====================================================
// 🎫 FUNCIONES ADMIN PARA TICKETS - ELEVEN RIFAS
// =====================================================
// Usando el sistema unificado y seguro para operaciones admin
// =====================================================

// Función para listar tickets con información relacionada
export async function adminListTickets(options: {
  rifa_id?: string
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
} = {}): Promise<{ success: boolean; data?: AdminTicket[]; error?: string; total?: number }> {
  
  console.log('🔍 [adminListTickets] ===== INICIO DEBUG COMPLETO =====')
  console.log('🔍 [adminListTickets] Opciones recibidas:', JSON.stringify(options, null, 2))
  
  // Usar el sistema unificado y seguro
  return safeAdminQuery(
    async () => {
      console.log('🔍 [adminListTickets] 1. ✅ Usando sistema unificado adminSupabase')
      
      console.log('🔍 [adminListTickets] 2. Construyendo query base...')
      let query = createAdminQuery('tickets')
        .select(`
          *,
          rifas!rifa_id (
            id,
            titulo,
            descripcion,
            estado,
            precio_ticket
          ),
          pagos!pago_id (
            id,
            tipo_pago,
            monto_bs,
            monto_usd,
            tasa_cambio,
            referencia,
            fecha_pago,
            fecha_verificacion,
            telefono_pago,
            banco_pago,
            cedula_pago,
            fecha_visita,
            verificado_por,
            estado,
            nombre_titular
          )
        `)
        // Removemos el límite hardcodeado de 5
        // .limit(5)
      
      console.log('🔍 [adminListTickets] 2. ✅ Query base construida')
      console.log('🔍 [adminListTickets] 2. 🔍 Query object:', query)
      
      // Aplicar filtros
      if (options.rifa_id) {
        console.log('🔍 [adminListTickets] 3a. Aplicando filtro rifa_id:', options.rifa_id)
        query = query.eq('rifa_id', options.rifa_id)
      }
      
      // Ordenamiento usando helper
      const ordenarPor = options.ordenarPor || 'fecha_compra'
      const orden = options.orden || 'desc'
      console.log('🔍 [adminListTickets] 4. Aplicando ordenamiento:', ordenarPor, orden)
      query = applyOrdering(query, ordenarPor, orden)
      
      // Paginación usando helper
      if (options.limite) {
        console.log('🔍 [adminListTickets] 5a. Aplicando límite:', options.limite)
        query = query.limit(options.limite)
      }
      
      if (options.offset) {
        console.log('🔍 [adminListTickets] 5b. Aplicando offset:', options.offset)
        query = query.range(options.offset, options.offset + (options.limite || 100) - 1)
      }
      
      console.log('🔍 [adminListTickets] 6. Query final construida:', query)
      console.log('🔍 [adminListTickets] 7. Ejecutando query...')
      
      // Ejecutar query
      const queryResult = await query
      
      console.log('🔍 [adminListTickets] ===== RESULTADO DE LA QUERY =====')
      console.log('🔍 [adminListTickets] - Error:', queryResult.error)
      console.log('🔍 [adminListTickets] - Count:', queryResult.count)
      console.log('🔍 [adminListTickets] - Tickets length:', queryResult.data?.length)
      console.log('🔍 [adminListTickets] - Primer ticket:', queryResult.data?.[0])
      
      // DEBUG EXTRA: Verificar cada ticket individualmente
      if (queryResult.data && queryResult.data.length > 0) {
        console.log('🔍 [adminListTickets] ===== DEBUG TICKETS INDIVIDUALES =====')
        console.log(`🔍 [adminListTickets] Total de tickets cargados: ${queryResult.data.length}`)
        console.log('🔍 [adminListTickets] ===== FIN DEBUG TICKETS =====')
      }
      
      console.log('🔍 [adminListTickets] ===== FIN DEBUG =====')
      
      return queryResult
    },
    'Error al listar tickets'
  )
}

// Función para eliminar un ticket
export async function adminDeleteTicket(id: string): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('tickets')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al eliminar ticket'
  )
}

// Función para obtener estadísticas de tickets
export async function adminGetTicketStats(): Promise<{ success: boolean; data?: any; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('tickets')
        .select('rifa_id, rifas!rifa_id(titulo)')
        .limit(1000)
      
      if (error) throw error
      
      // Agrupar por rifa
      const stats = (data || []).reduce((acc: any, ticket: any) => {
        const rifaId = ticket.rifa_id
        if (!acc[rifaId]) {
          acc[rifaId] = {
            rifa_id: rifaId,
            titulo: ticket.rifas?.titulo || 'Sin título',
            total_tickets: 0
          }
        }
        acc[rifaId].total_tickets++
        return acc
      }, {})
      
      return { 
        data: Object.values(stats), 
        error: null 
      }
    },
    'Error al obtener estadísticas de tickets'
  )
}

// Función optimizada para obtener tickets de una rifa específica con estadísticas
export async function adminGetTicketsByRifa(rifa_id: string): Promise<{ 
  success: boolean; 
  data?: AdminTicket[]; 
  stats?: {
    total: number;
    pagados: number;
    reservados: number;
    sinPago: number;
    disponibles: number;
  };
  error?: string 
}> {
  return safeAdminQuery(
    async () => {
      console.log('🎫 [adminGetTicketsByRifa] Obteniendo tickets para rifa:', rifa_id)
      
      // Query optimizada para tickets de una rifa específica
      const { data: tickets, error: ticketsError } = await createAdminQuery('tickets')
        .select(`
          *,
          rifas!rifa_id (
            id,
            titulo,
            descripcion,
            estado,
            precio_ticket,
            total_tickets
          ),
          pagos!pago_id (
            id,
            tipo_pago,
            monto_bs,
            monto_usd,
            tasa_cambio,
            referencia,
            fecha_pago,
            fecha_verificacion,
            telefono_pago,
            banco_pago,
            cedula_pago,
            fecha_visita,
            verificado_por,
            estado,
            nombre_titular
          )
        `)
        .eq('rifa_id', rifa_id)
        .order('fecha_compra', { ascending: false })
      
      if (ticketsError) throw ticketsError
      
      // Debug: mostrar información detallada
      console.log('🎫 [adminGetTicketsByRifa] Tickets obtenidos:', tickets?.length || 0)
      console.log('🎫 [adminGetTicketsByRifa] Primer ticket:', tickets?.[0])
      console.log('🎫 [adminGetTicketsByRifa] Todos los tickets:', tickets)
      
      // Calcular estadísticas
      const total = tickets?.length || 0
      console.log('🎫 [adminGetTicketsByRifa] Total tickets:', total)
      
      const pagados = tickets?.filter(t => {
        const estado = t.pagos?.estado
        const isPagado = estado === 'pagado' || estado === 'verificado'
        console.log(`🎫 Ticket ${t.numero_ticket}: estado=${estado}, isPagado=${isPagado}`)
        return isPagado
      }).length || 0
      
      const reservados = tickets?.filter(t => {
        const estado = t.pagos?.estado
        const isReservado = estado === 'reservado' || estado === 'pendiente'
        console.log(`🎫 Ticket ${t.numero_ticket}: estado=${estado}, isReservado=${isReservado}`)
        return isReservado
      }).length || 0
      
      const sinPago = tickets?.filter(t => {
        const hasPago = !!t.pago_id
        console.log(`🎫 Ticket ${t.numero_ticket}: pago_id=${t.pago_id}, hasPago=${hasPago}`)
        return !hasPago
      }).length || 0
      
      // Obtener total de tickets de la rifa para calcular disponibles
      const rifa = tickets?.[0]?.rifas
      const totalTicketsRifa = rifa?.total_tickets || 0
      const disponibles = Math.max(0, totalTicketsRifa - total)
      
      const stats = {
        total,
        pagados,
        reservados,
        sinPago,
        disponibles
      }
      
      console.log('🎫 [adminGetTicketsByRifa] Estadísticas calculadas:', stats)
      
      return { 
        data: tickets || [], 
        stats,
        error: null 
      }
    },
    'Error al obtener tickets de la rifa'
  )
}

// Función de debug para verificar tickets en la base de datos
export async function adminDebugTickets(): Promise<{ success: boolean; data?: any; error?: string }> {
  return safeAdminQuery(
    async () => {
      console.log('🔍 [adminDebugTickets] ===== INICIO DEBUG TOTAL =====')
      
      // 1. Contar total de tickets
      const { count: totalTickets, error: countError } = await createAdminQuery('tickets')
        .select('*', { count: 'exact', head: true })
      
      if (countError) {
        console.error('❌ [adminDebugTickets] Error contando tickets:', countError)
        throw countError
      }
      
      console.log('🔍 [adminDebugTickets] Total de tickets en BD:', totalTickets)
      
      // 2. Contar tickets con pago
      const { count: ticketsConPago, error: pagoError } = await createAdminQuery('tickets')
        .select('*', { count: 'exact', head: true })
        .not('pago_id', 'is', null)
      
      if (pagoError) {
        console.error('❌ [adminDebugTickets] Error contando tickets con pago:', pagoError)
        throw pagoError
      }
      
      console.log('🔍 [adminDebugTickets] Tickets con pago:', ticketsConPago)
      
      // 3. Contar tickets sin pago
      const { count: ticketsSinPago, error: sinPagoError } = await createAdminQuery('tickets')
        .select('*', { count: 'exact', head: true })
        .is('pago_id', null)
      
      if (sinPagoError) {
        console.error('❌ [adminDebugTickets] Error contando tickets sin pago:', sinPagoError)
        throw sinPagoError
      }
      
      console.log('🔍 [adminDebugTickets] Tickets sin pago:', ticketsSinPago)
      
      // 4. Verificar que la suma sea correcta
      const suma = (ticketsConPago || 0) + (ticketsSinPago || 0)
      console.log('🔍 [adminDebugTickets] Suma tickets con + sin pago:', suma)
      console.log('🔍 [adminDebugTickets] ¿Coincide con total?', suma === totalTickets)
      
      // 5. Obtener algunos ejemplos
      const { data: ejemplos, error: ejemplosError } = await createAdminQuery('tickets')
        .select('id, numero_ticket, nombre, pago_id')
        .limit(5)
      
      if (ejemplosError) {
        console.error('❌ [adminDebugTickets] Error obteniendo ejemplos:', ejemplosError)
        throw ejemplosError
      }
      
      console.log('🔍 [adminDebugTickets] Ejemplos de tickets:', ejemplos)
      console.log('🔍 [adminDebugTickets] ===== FIN DEBUG TOTAL =====')
      
      return { 
        data: {
          total: totalTickets,
          con_pago: ticketsConPago,
          sin_pago: ticketsSinPago,
          suma_coincide: suma === totalTickets,
          ejemplos
        }, 
        error: null 
      }
    },
    'Error al debuggear tickets'
  )
}

// Función para crear un ticket
export async function adminCreateTicket(data: CreateTicketData): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data: ticket, error } = await adminSupabase
        .from('tickets')
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return { data: ticket, error: null }
    },
    'Error al crear ticket'
  )
}

// Función para actualizar un ticket
export async function adminUpdateTicket(id: string, data: UpdateTicketData): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data: ticket, error } = await adminSupabase
        .from('tickets')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: ticket, error: null }
    },
    'Error al actualizar ticket'
  )
}

// Función para cambiar el estado de un ticket (ahora es el estado del pago)
export async function adminChangeTicketState(id: string, estado: 'pendiente' | 'verificado' | 'rechazado'): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Primero obtener el ticket para encontrar el pago_id
      const { data: ticket, error: fetchError } = await adminSupabase
        .from('tickets')
        .select('pago_id')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      if (!ticket.pago_id) {
        throw new Error('Este ticket no tiene un pago asociado')
      }

      // Actualizar el estado del pago en lugar del ticket
      const { data: pago, error: pagoError } = await adminSupabase
        .from('pagos')
        .update({ estado })
        .eq('id', ticket.pago_id)
        .select()
        .single()

      if (pagoError) throw pagoError

      // Retornar el ticket actualizado (el estado se refleja a través de la relación)
      const { data: updatedTicket, error: ticketError } = await adminSupabase
        .from('tickets')
        .select(`
          *,
          rifas!rifa_id (
            id,
            titulo,
            descripcion,
            estado,
            precio_ticket
          ),
          pagos!pago_id (
            id,
            tipo_pago,
            monto_bs,
            monto_usd,
            tasa_cambio,
            referencia,
            fecha_pago,
            fecha_verificacion,
            telefono_pago,
            banco_pago,
            cedula_pago,
            fecha_visita,
            verificado_por,
            estado,
            nombre_titular
          )
        `)
        .eq('id', id)
        .single()

      if (ticketError) throw ticketError
      return { data: updatedTicket, error: null }
    },
    'Error al cambiar estado del pago del ticket'
  )
}

// Función para cambiar el estado de verificación de un ticket
export async function adminChangeTicketVerificationState(id: string, verificado: boolean): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data: ticket, error } = await adminSupabase
        .from('tickets')
        .update({ verificado })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: ticket, error: null }
    },
    'Error al cambiar estado de verificación del ticket'
  )
}

// Función para alternar el bloqueo de pago de un ticket
export async function adminToggleTicketPaymentBlock(id: string): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Primero obtener el estado actual
      const { data: currentTicket, error: fetchError } = await adminSupabase
        .from('tickets')
        .select('pago_bloqueado')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // Alternar el estado
      const newBlockedState = !currentTicket.pago_bloqueado
      
      const { data: ticket, error } = await adminSupabase
        .from('tickets')
        .update({ pago_bloqueado: newBlockedState })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data: ticket, error: null }
    },
    'Error al alternar bloqueo de pago del ticket'
  )
}

// Listar tickets especiales disponibles por rifa (sentinelas y sin pago asignado)
export async function adminListSpecialTicketsByRifa(rifa_id: string): Promise<{ success: boolean; data?: Array<{ id: string; numero_ticket: string }>; error?: string }> {
  return safeAdminQuery(
    async () => {
      if (!rifa_id) throw new Error('rifa_id es requerido')

      const { data, error } = await adminSupabase
        .from('tickets')
        .select('id, numero_ticket, pago_id, es_ticket_especial, nombre, cedula')
        .eq('rifa_id', rifa_id)
        .eq('estado', 'reservado')
        .is('pago_id', null)
        .eq('es_ticket_especial', true)
        .order('numero_ticket', { ascending: true })

      if (error) throw error
      
      // Filtrar solo los que realmente están disponibles (sin pago_id)
      const ticketsDisponibles = (data || []).filter(t => !t.pago_id)
      
      console.log(`🎫 [adminListSpecialTicketsByRifa] Tickets especiales disponibles: ${ticketsDisponibles.length}`)
      
      return { 
        data: ticketsDisponibles.map(t => ({ id: t.id, numero_ticket: t.numero_ticket })), 
        error: null 
      }
    },
    'Error al listar tickets especiales por rifa'
  )
}

// Función para crear un ticket reservado (para premios)
export async function adminCreateTicketReservado(data: {
  rifa_id: string
  numero_ticket: string
  nombre?: string
  cedula?: string
  telefono?: string
  correo?: string
  es_ticket_especial?: boolean
}): Promise<{ success: boolean; data?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Validar que el número de ticket no exista en la rifa
      const { data: existingTicket, error: checkError } = await adminSupabase
        .from('tickets')
        .select('id')
        .eq('rifa_id', data.rifa_id)
        .eq('numero_ticket', data.numero_ticket)
        .single()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      if (existingTicket) {
        throw new Error(`El número de ticket ${data.numero_ticket} ya existe en esta rifa`)
      }

      // Crear el ticket reservado
      const ticketData = {
        rifa_id: data.rifa_id,
        numero_ticket: data.numero_ticket,
        nombre: data.nombre || 'TICKET RESERVADO',
        cedula: data.cedula || '000000000',
        telefono: data.telefono || '000000000',
        correo: data.correo || 'N/A',
        estado: 'reservado',
        reserva_id: crypto.randomUUID(),
        reservado_hasta: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 año
        es_ticket_especial: data.es_ticket_especial ?? true // Marcar como especial por defecto
      }

      const { data: ticket, error } = await adminSupabase
        .from('tickets')
        .insert(ticketData)
        .select(`
          *,
          rifas!rifa_id (
            id,
            titulo,
            descripcion,
            estado,
            precio_ticket
          )
        `)
        .single()

      if (error) throw error
      return { data: ticket, error: null }
    },
    'Error al crear ticket reservado'
  )
}
