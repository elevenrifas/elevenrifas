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
  estado?: string
  estado_verificacion?: string
  bloqueado_por_pago?: boolean
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
            precio_ticket,
            estado
          ),
          pagos!pago_id (
            id,
            monto_bs,
            monto_usd,
            estado,
            tipo_pago
          )
        `)
        .limit(5)
      
      console.log('🔍 [adminListTickets] 2. ✅ Query base construida')
      console.log('🔍 [adminListTickets] 2. 🔍 Query object:', query)
      
      // Aplicar filtros
      if (options.rifa_id) {
        console.log('🔍 [adminListTickets] 3a. Aplicando filtro rifa_id:', options.rifa_id)
        query = query.eq('rifa_id', options.rifa_id)
      }
      
      if (options.estado) {
        console.log('🔍 [adminListTickets] 3b. Aplicando filtro estado:', options.estado)
        query = query.eq('estado', options.estado)
      }
      
      if (options.estado_verificacion) {
        console.log('🔍 [adminListTickets] 3c. Aplicando filtro estado_verificacion:', options.estado_verificacion)
        query = query.eq('estado_verificacion', options.estado_verificacion)
      }
      
      if (options.bloqueado_por_pago !== undefined) {
        console.log('🔍 [adminListTickets] 3d. Aplicando filtro bloqueado_por_pago:', options.bloqueado_por_pago)
        query = query.eq('bloqueado_por_pago', options.bloqueado_por_pago)
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
      console.log('🔍 [adminListTickets] ===== FIN DEBUG =====')
      
      return queryResult
    },
    'Error al listar tickets'
  )
}

// Función para obtener un ticket por ID
export async function adminGetTicket(id: string): Promise<{ success: boolean; ticket?: AdminTicket; error?: string }> {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('tickets')
        .select('*')
        .eq('id', id)
        .single()
    },
    'Error al obtener ticket'
  )
}

// Función para crear un ticket
export async function adminCreateTicket(data: CreateTicketData): Promise<{ success: boolean; id?: string; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Verificar que el número de ticket no exista para la rifa
      const { data: existingTicket, error: checkError } = await createAdminQuery('tickets')
        .select('id')
        .eq('rifa_id', data.rifa_id)
        .eq('numero_ticket', data.numero_ticket)
        .single()
      
      if (existingTicket && !checkError) {
        throw new Error('El número de ticket ya existe para esta rifa')
      }
      
      const { data: ticket, error } = await createAdminQuery('tickets')
        .insert({
          rifa_id: data.rifa_id,
          numero_ticket: data.numero_ticket,
          precio: data.precio,
          nombre: data.nombre,
          cedula: data.cedula,
          telefono: data.telefono,
          correo: data.correo,
          estado: data.estado || 'reservado',
          email: data.email,
          fecha_compra: new Date().toISOString()
        })
        .select('id')
        .single()
      
      if (error) throw error
      
      return { data: ticket, error: null }
    },
    'Error al crear ticket'
  )
}

// Función para actualizar un ticket
export async function adminUpdateTicket(id: string, data: UpdateTicketData): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Si se está cambiando el número de ticket, verificar que no exista
      if (data.numero_ticket) {
        const { data: existingTicket, error: checkError } = await createAdminQuery('tickets')
          .select('id')
          .eq('rifa_id', data.rifa_id)
          .eq('numero_ticket', data.numero_ticket)
          .neq('id', id)
          .single()
        
        if (existingTicket && !checkError) {
          throw new Error('El número de ticket ya existe para esta rifa')
        }
      }
      
      const updateData: any = { ...data }
      
      // Si se está verificando, agregar fecha de verificación
      if (data.estado_verificacion === 'verificado' && !data.fecha_verificacion) {
        updateData.fecha_verificacion = new Date().toISOString()
      }
      
      const { error } = await createAdminQuery('tickets')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al actualizar ticket'
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

// Función para cambiar el estado de un ticket
export async function adminChangeTicketState(id: string, estado: 'reservado' | 'pagado' | 'verificado' | 'cancelado'): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('tickets')
        .update({ estado })
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al cambiar estado del ticket'
  )
}

// Función para cambiar el estado de verificación
export async function adminChangeTicketVerificationState(id: string, estado_verificacion: 'pendiente' | 'verificado' | 'rechazado'): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const updateData: any = { estado_verificacion }
      
      if (estado_verificacion === 'verificado') {
        updateData.fecha_verificacion = new Date().toISOString()
      }
      
      const { error } = await createAdminQuery('tickets')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al cambiar estado de verificación del ticket'
  )
}

// Función para bloquear/desbloquear ticket por pago
export async function adminToggleTicketPaymentBlock(id: string, bloqueado: boolean, pago_id?: string): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const updateData: any = { 
        bloqueado_por_pago: bloqueado,
        fecha_bloqueo: bloqueado ? new Date().toISOString() : null
      }
      
      if (pago_id) {
        updateData.pago_bloqueante_id = bloqueado ? pago_id : null
      }
      
      const { error } = await createAdminQuery('tickets')
        .update(updateData)
        .eq('id', id)
      
      if (error) throw error
      
      return { data: null, error: null }
    },
    'Error al cambiar bloqueo del ticket'
  )
}
