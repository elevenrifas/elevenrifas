import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyPagination, 
  applyOrdering 
} from '@/lib/database'
import type { AdminCliente, CreateClienteData, UpdateClienteData } from '@/types'

// =====================================================
// 👥 FUNCIONES ADMIN PARA CLIENTES - ELEVEN RIFAS
// =====================================================
// Usando el sistema unificado y seguro para operaciones admin
// Los clientes se extraen y agrupan desde la tabla tickets
// =====================================================

// Función para listar clientes únicos agrupados desde tickets
export async function adminListClientes(options: {
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
  search?: string
} = {}): Promise<{ success: boolean; data?: AdminCliente[]; error?: string; total?: number }> {
  
  console.log('🔍 [adminListClientes] ===== INICIO DEBUG COMPLETO =====')
  console.log('🔍 [adminListClientes] Opciones recibidas:', JSON.stringify(options, null, 2))
  
  return safeAdminQuery(
    async () => {
      console.log('🔍 [adminListClientes] 1. ✅ Usando sistema unificado adminSupabase')
      
      console.log('🔍 [adminListClientes] 2. Construyendo query base...')
      
      // Query para obtener clientes únicos agrupados por cédula
      // EXCLUIR tickets especiales/internos del sistema
      let query = createAdminQuery('tickets')
        .select(`
          cedula,
          nombre,
          telefono,
          correo,
          fecha_compra,
          rifa_id,
          rifas!rifa_id (
            id,
            titulo,
            imagen_url,
            estado
          )
        `)
        // Filtrar tickets especiales/internos del sistema
        .not('nombre', 'eq', 'TICKET RESERVADO')
        .not('cedula', 'eq', '000000000')
        .not('correo', 'eq', 'N/A')
        .not('telefono', 'eq', '000000000')
        .order('cedula', { ascending: true })
      
      console.log('🔍 [adminListClientes] 2. ✅ Query base construida')
      
      // Aplicar búsqueda si se especifica
      if (options.search) {
        console.log('🔍 [adminListClientes] 3. Aplicando búsqueda:', options.search)
        query = query.or(`nombre.ilike.%${options.search}%,cedula.ilike.%${options.search}%,correo.ilike.%${options.search}%`)
      }
      
      // Ordenamiento usando helper
      const ordenarPor = options.ordenarPor || 'nombre'
      const orden = options.orden || 'asc'
      console.log('🔍 [adminListClientes] 4. Aplicando ordenamiento:', ordenarPor, orden)
      query = applyOrdering(query, ordenarPor, orden)
      
      // Paginación usando helper
      if (options.limite) {
        console.log('🔍 [adminListClientes] 5a. Aplicando límite:', options.limite)
        query = query.limit(options.limite)
      }
      
      if (options.offset) {
        console.log('🔍 [adminListClientes] 5b. Aplicando offset:', options.offset)
        query = query.range(options.offset, options.offset + (options.limite || 100) - 1)
      }
      
      console.log('🔍 [adminListClientes] 6. Query final construida')
      console.log('🔍 [adminListClientes] 7. Ejecutando query...')
      
      // Ejecutar query
      const queryResult = await query
      
      console.log('🔍 [adminListClientes] ===== RESULTADO DE LA QUERY =====')
      console.log('🔍 [adminListClientes] - Error:', queryResult.error)
      console.log('🔍 [adminListClientes] - Count:', queryResult.count)
      console.log('🔍 [adminListClientes] - Tickets length:', queryResult.data?.length)
      
      if (queryResult.error) {
        throw queryResult.error
      }
      
      // Procesar y agrupar los datos por cliente único
      const clientesMap = new Map<string, AdminCliente>()
      
      if (queryResult.data) {
        queryResult.data.forEach((ticket: any) => {
          const cedula = ticket.cedula
          
          if (!clientesMap.has(cedula)) {
            // Crear nuevo cliente
            clientesMap.set(cedula, {
              id: cedula, // Usar cédula como ID único
              nombre: ticket.nombre,
              cedula: cedula,
              telefono: ticket.telefono,
              correo: ticket.correo,
              total_tickets: 0,
              total_rifas: 0,
              primer_compra: null,
              ultima_compra: null,
              rifas_compradas: [],
              tickets: [],
              rifas_detalle: []
            })
          }
          
          const cliente = clientesMap.get(cedula)!
          
          // Actualizar estadísticas
          cliente.total_tickets += 1
          
          // Agregar ticket
          if (cliente.tickets) {
            cliente.tickets.push({
              id: ticket.id,
              numero_ticket: ticket.numero_ticket,
              rifa_id: ticket.rifa_id,
              fecha_compra: ticket.fecha_compra,
              pago_id: ticket.pago_id
            })
          }
          
          // Agregar rifa si no existe
          if (ticket.rifa_id && !cliente.rifas_compradas.includes(ticket.rifa_id)) {
            cliente.rifas_compradas.push(ticket.rifa_id)
            cliente.total_rifas += 1
            
            if (ticket.rifas && cliente.rifas_detalle) {
              cliente.rifas_detalle.push({
                id: ticket.rifas.id,
                titulo: ticket.rifas.titulo,
                imagen_url: ticket.rifas.imagen_url,
                estado: ticket.rifas.estado
              })
            }
          }
          
          // Actualizar fechas
          if (ticket.fecha_compra) {
            const fechaCompra = new Date(ticket.fecha_compra)
            
            if (!cliente.primer_compra || fechaCompra < new Date(cliente.primer_compra)) {
              cliente.primer_compra = ticket.fecha_compra
            }
            
            if (!cliente.ultima_compra || fechaCompra > new Date(cliente.ultima_compra)) {
              cliente.ultima_compra = ticket.fecha_compra
            }
          }
        })
      }
      
      const clientes = Array.from(clientesMap.values())
      
      console.log('🔍 [adminListClientes] ===== CLIENTES PROCESADOS =====')
      console.log('🔍 [adminListClientes] Total de clientes únicos:', clientes.length)
      console.log('🔍 [adminListClientes] ===== FIN DEBUG =====')
      
      return { 
        data: clientes, 
        error: null,
        total: clientes.length
      }
    },
    'Error al listar clientes'
  )
}

// Función para obtener un cliente específico por cédula
export async function adminGetCliente(cedula: string): Promise<{ success: boolean; data?: AdminCliente; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data: tickets, error } = await createAdminQuery('tickets')
        .select(`
          *,
          rifas!rifa_id (
            id,
            titulo,
            imagen_url,
            estado
          ),
          pagos!pago_id (
            id,
            estado,
            tipo_pago,
            monto_bs,
            monto_usd
          )
        `)
        .eq('cedula', cedula)
        // Filtrar tickets especiales/internos del sistema
        .not('nombre', 'eq', 'TICKET RESERVADO')
        .not('cedula', 'eq', '000000000')
        .not('correo', 'eq', 'N/A')
        .not('telefono', 'eq', '000000000')
        .order('fecha_compra', { ascending: false })

      if (error) throw error

      if (!tickets || tickets.length === 0) {
        throw new Error('Cliente no encontrado')
      }

      // Procesar el primer ticket para obtener datos del cliente
      const primerTicket = tickets[0]
      
      const cliente: AdminCliente = {
        id: cedula,
        nombre: primerTicket.nombre,
        cedula: cedula,
        telefono: primerTicket.telefono,
        correo: primerTicket.correo,
        total_tickets: tickets.length,
        total_rifas: 0,
        primer_compra: null,
        ultima_compra: null,
        rifas_compradas: [],
        tickets: tickets.map(t => ({
          id: t.id,
          numero_ticket: t.numero_ticket,
          rifa_id: t.rifa_id,
          fecha_compra: t.fecha_compra,
          pago_id: t.pago_id
        })),
        rifas_detalle: []
      }

      // Procesar rifas únicas y fechas
      const rifasSet = new Set<string>()
      
      tickets.forEach(ticket => {
        if (ticket.rifa_id && !rifasSet.has(ticket.rifa_id)) {
          rifasSet.add(ticket.rifa_id)
          cliente.total_rifas += 1
          
          if (ticket.rifas) {
            cliente.rifas_detalle!.push({
              id: ticket.rifas.id,
              titulo: ticket.rifas.titulo,
              imagen_url: ticket.rifas.imagen_url,
              estado: ticket.rifas.estado
            })
          }
        }
        
        // Actualizar fechas
        if (ticket.fecha_compra) {
          const fechaCompra = new Date(ticket.fecha_compra)
          
          if (!cliente.primer_compra || fechaCompra < new Date(cliente.primer_compra)) {
            cliente.primer_compra = ticket.fecha_compra
          }
          
          if (!cliente.ultima_compra || fechaCompra > new Date(cliente.ultima_compra)) {
            cliente.ultima_compra = ticket.fecha_compra
          }
        }
      })

      return { data: cliente, error: null }
    },
    'Error al obtener cliente'
  )
}

// Función para obtener estadísticas de clientes
export async function adminGetClienteStats(): Promise<{ success: boolean; data?: any; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('tickets')
        .select('cedula, nombre, fecha_compra')
        // Filtrar tickets especiales/internos del sistema
        .not('nombre', 'eq', 'TICKET RESERVADO')
        .not('cedula', 'eq', '000000000')
        .not('correo', 'eq', 'N/A')
        .not('telefono', 'eq', '000000000')
        .limit(10000)
      
      if (error) throw error
      
      // Agrupar por cliente
      const clientesMap = new Map<string, any>()
      
      data?.forEach((ticket: any) => {
        const cedula = ticket.cedula
        
        if (!clientesMap.has(cedula)) {
          clientesMap.set(cedula, {
            cedula,
            nombre: ticket.nombre,
            total_tickets: 0,
            primer_compra: null,
            ultima_compra: null
          })
        }
        
        const cliente = clientesMap.get(cedula)!
        cliente.total_tickets += 1
        
        if (ticket.fecha_compra) {
          const fechaCompra = new Date(ticket.fecha_compra)
          
          if (!cliente.primer_compra || fechaCompra < new Date(cliente.primer_compra)) {
            cliente.primer_compra = ticket.fecha_compra
          }
          
          if (!cliente.ultima_compra || fechaCompra > new Date(cliente.ultima_compra)) {
            cliente.ultima_compra = ticket.fecha_compra
          }
        }
      })
      
      const stats = Array.from(clientesMap.values())
      
      return { 
        data: {
          total_clientes: stats.length,
          clientes_mas_activos: stats
            .sort((a, b) => b.total_tickets - a.total_tickets)
            .slice(0, 10),
          clientes_recientes: stats
            .filter(c => c.ultima_compra)
            .sort((a, b) => new Date(b.ultima_compra).getTime() - new Date(a.ultima_compra).getTime())
            .slice(0, 10)
        }, 
        error: null 
      }
    },
    'Error al obtener estadísticas de clientes'
  )
}

// Función para buscar clientes
export async function adminSearchClientes(searchTerm: string): Promise<{ success: boolean; data?: AdminCliente[]; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('tickets')
        .select(`
          cedula,
          nombre,
          telefono,
          correo,
          fecha_compra,
          rifa_id,
          rifas!rifa_id (
            id,
            titulo,
            imagen_url,
            estado
          )
        `)
        .or(`nombre.ilike.%${searchTerm}%,cedula.ilike.%${searchTerm}%,correo.ilike.%${searchTerm}%`)
        // Filtrar tickets especiales/internos del sistema
        .not('nombre', 'eq', 'TICKET RESERVADO')
        .not('cedula', 'eq', '000000000')
        .not('correo', 'eq', 'N/A')
        .not('telefono', 'eq', '000000000')
        .order('nombre', { ascending: true })
        .limit(50)
      
      if (error) throw error
      
      // Procesar y agrupar igual que en adminListClientes
      const clientesMap = new Map<string, AdminCliente>()
      
      data?.forEach((ticket: any) => {
        const cedula = ticket.cedula
        
        if (!clientesMap.has(cedula)) {
          clientesMap.set(cedula, {
            id: cedula,
            nombre: ticket.nombre,
            cedula: cedula,
            telefono: ticket.telefono,
            correo: ticket.correo,
            total_tickets: 0,
            total_rifas: 0,
            primer_compra: null,
            ultima_compra: null,
            rifas_compradas: [],
            tickets: [],
            rifas_detalle: []
          })
        }
        
        const cliente = clientesMap.get(cedula)!
        cliente.total_tickets += 1
        
        if (ticket.rifa_id && !cliente.rifas_compradas.includes(ticket.rifa_id)) {
          cliente.rifas_compradas.push(ticket.rifa_id)
          cliente.total_rifas += 1
          
          if (ticket.rifas && cliente.rifas_detalle) {
            cliente.rifas_detalle.push({
              id: ticket.rifas.id,
              titulo: ticket.rifas.titulo,
              imagen_url: ticket.rifas.imagen_url,
              estado: ticket.rifas.estado
            })
          }
        }
        
        if (ticket.fecha_compra) {
          const fechaCompra = new Date(ticket.fecha_compra)
          
          if (!cliente.primer_compra || fechaCompra < new Date(cliente.primer_compra)) {
            cliente.primer_compra = ticket.fecha_compra
          }
          
          if (!cliente.ultima_compra || fechaCompra > new Date(cliente.ultima_compra)) {
            cliente.ultima_compra = ticket.fecha_compra
          }
        }
      })
      
      const clientes = Array.from(clientesMap.values())
      
      return { data: clientes, error: null }
    },
    'Error al buscar clientes'
  )
}
