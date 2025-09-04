// =====================================================
// 🛠️ ADMIN DB - PAGOS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering 
} from '@/lib/database'
import type { Database } from '@/types/supabase'

type PagoRow = Database['public']['Tables']['pagos']['Row']
type PagoInsert = Database['public']['Tables']['pagos']['Insert']
type PagoUpdate = Database['public']['Tables']['pagos']['Update']

// Tipo extendido para incluir tickets y rifas
export interface AdminPago extends PagoRow {
  rifa_id?: string  // Agregar rifa_id que existe en el schema
  tickets?: Array<{
    id: string
    numero_ticket: string
    nombre: string
    cedula: string
    telefono: string
    correo: string
    fecha_compra: string
    rifa_id: string
    rifas?: {
      id: string
      titulo: string
      precio_ticket: number
    }
  }>
}
export type AdminPagoEstado = 'pendiente' | 'verificado' | 'rechazado'

export async function adminListPagos(params?: { 
  estado?: AdminPagoEstado
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}) {
  const { 
    estado,
    ordenarPor = 'fecha_pago',
    orden = 'desc',
    limite = 1000,
    offset = 0
  } = params || {}

  return safeAdminQuery(
    async () => {
      let query = createAdminQuery('pagos')
        .select(`
          *,
          tickets (
            id,
            numero_ticket,
            nombre,
            cedula,
            telefono,
            correo,
            fecha_compra,
            rifa_id,
            rifas (
              id,
              titulo,
              precio_ticket
            )
          )
        `)
      
      // Aplicar filtros
      if (estado) {
        query = query.eq('estado', estado)
      }
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      
      // Aplicar paginación
      if (limite) {
        query = query.limit(limite)
      }
      
      if (offset) {
        query = query.range(offset, offset + limite - 1)
      }

      const result = await query
      
      // Transformar y validar datos
      const pagosTransformados = (result.data || []).map((pago: any) => ({
        ...pago,
        // Valores por defecto para campos opcionales
        tipo_pago: pago.tipo_pago || 'efectivo',
        monto_bs: pago.monto_bs || 0,
        monto_usd: pago.monto_usd || 0,
        tasa_cambio: pago.tasa_cambio || 1,
        referencia: pago.referencia || '',
        estado: pago.estado || 'pendiente',
        fecha_pago: pago.fecha_pago || new Date().toISOString(),
        fecha_verificacion: pago.fecha_verificacion || null,
        telefono_pago: pago.telefono_pago || '',
        banco_pago: pago.banco_pago || '',
        cedula_pago: pago.cedula_pago || '',
        fecha_visita: pago.fecha_visita || null,
        verificado_por: pago.verificado_por || null,
        notas: pago.notas || null,
        // Tickets asociados
        tickets: pago.tickets || []
      }))

      // Ordenar: pendientes primero, luego verificados y rechazados.
      // Dentro de cada grupo, ordenar por fecha de pago descendente.
      const estadoPeso: Record<string, number> = {
        pendiente: 0,
        verificado: 1,
        aprobado: 1, // por compatibilidad si existiera
        rechazado: 2,
      }

      pagosTransformados.sort((a: any, b: any) => {
        const pa = estadoPeso[(a.estado || '').toLowerCase()] ?? 99
        const pb = estadoPeso[(b.estado || '').toLowerCase()] ?? 99
        if (pa !== pb) return pa - pb
        const da = a.fecha_pago ? new Date(a.fecha_pago).getTime() : 0
        const db = b.fecha_pago ? new Date(b.fecha_pago).getTime() : 0
        return db - da
      })

      return { 
        data: pagosTransformados as AdminPago[],
        error: null,
        total: pagosTransformados.length
      }
    },
    'Error al listar pagos'
  )
}

export async function adminGetPago(id: string) {
  return safeAdminQuery(
    async () => {
      return createAdminQuery('pagos')
        .select('*')
        .eq('id', id)
        .single()
    },
    'Error al obtener pago'
  )
}

export async function adminCreatePago(datos: PagoInsert) {
  return safeAdminQuery(
    async () => {
      // Validar datos requeridos
      if (!datos.tipo_pago || !datos.monto_bs || !datos.monto_usd || !datos.tasa_cambio) {
        throw new Error('tipo_pago, monto_bs, monto_usd y tasa_cambio son requeridos')
      }

      // Validar monto
      if (datos.monto_bs <= 0 || datos.monto_usd <= 0) {
        throw new Error('Los montos deben ser mayores a 0')
      }

      // Validar tasa de cambio
      if (datos.tasa_cambio <= 0) {
        throw new Error('La tasa de cambio debe ser mayor a 0')
      }

      // Establecer valores por defecto
      const datosConValoresPorDefecto = {
        ...datos,
        estado: datos.estado || 'pendiente',
        fecha_pago: datos.fecha_pago || new Date().toISOString()
      }

      const { data, error } = await createAdminQuery('pagos')
        .insert(datosConValoresPorDefecto)
        .select()
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al crear pago'
  )
}

export async function adminUpdatePago(id: string, datos: PagoUpdate) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .update(datos)
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al actualizar pago'
  )
}

export async function adminDeletePago(id: string) {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('pagos')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al eliminar pago'
  )
}

export async function adminVerifyPago(id: string, verificadoPor: string) {
  return safeAdminQuery(
    async () => {
      console.log('🔍 Iniciando verificación de pago:', { id, verificadoPor })
      
      // ✅ SOLO ACTUALIZAR EL PAGO - los tickets heredan el estado
      console.log('📝 Actualizando estado del pago...')
      const { error: pagoError } = await createAdminQuery('pagos')
        .update({
          estado: 'verificado',
          fecha_verificacion: new Date().toISOString(),
          verificado_por: verificadoPor
        })
        .eq('id', id)
      
      if (pagoError) {
        console.error('❌ Error al actualizar pago:', pagoError)
        throw pagoError
      }
      console.log('✅ Pago verificado correctamente')

      console.log('🎉 Verificación de pago completada exitosamente')
      return { data: null, error: null }
    },
    'Error al verificar pago'
  )
}

export async function adminRejectPago(id: string, verificadoPor: string) {
  return safeAdminQuery(
    async () => {
      console.log('🔍 Iniciando rechazo de pago:', { id, verificadoPor })
      
      // PASO 1: Obtener todos los tickets asociados al pago
      console.log('📋 Obteniendo tickets asociados...')
      const { data: tickets, error: ticketsError } = await createAdminQuery('tickets')
        .select('*')
        .eq('pago_id', id)
      
      if (ticketsError) {
        console.error('❌ Error al obtener tickets:', ticketsError)
        throw ticketsError
      }
      
      if (!tickets || tickets.length === 0) {
        console.log('⚠️ No hay tickets asociados a este pago')
      } else {
        console.log(`📊 Encontrados ${tickets.length} tickets asociados`)
      }
      
      // PASO 2: Crear log de rechazo con toda la información de los tickets
      const rechazoLogs = {
        fecha_rechazo: new Date().toISOString(),
        rechazado_por: verificadoPor,
        motivo: 'Pago rechazado por administrador',
        tickets_eliminados: tickets?.map(ticket => ({
          id: ticket.id,
          numero_ticket: ticket.numero_ticket,
          nombre: ticket.nombre,
          cedula: ticket.cedula,
          telefono: ticket.telefono,
          correo: ticket.correo,
          fecha_compra: ticket.fecha_compra,
          rifa_id: ticket.rifa_id
        })) || [],
        total_tickets: tickets?.length || 0
      }
      
      // PASO 3: Actualizar el pago con el log de rechazo
      console.log('📝 Actualizando estado del pago y guardando logs...')
      const { error: pagoError } = await createAdminQuery('pagos')
        .update({ 
          estado: 'rechazado',
          fecha_verificacion: new Date().toISOString(),
          verificado_por: verificadoPor,
          rechazo_logs: JSON.stringify(rechazoLogs)
        })
        .eq('id', id)
      
      if (pagoError) {
        console.error('❌ Error al actualizar pago:', pagoError)
        throw pagoError
      }
      console.log('✅ Pago actualizado con logs de rechazo')
      
      // PASO 4: Eliminar todos los tickets asociados
      if (tickets && tickets.length > 0) {
        console.log('🗑️ Eliminando tickets asociados...')
        const { error: deleteError } = await createAdminQuery('tickets')
          .delete()
          .eq('pago_id', id)
        
        if (deleteError) {
          console.error('❌ Error al eliminar tickets:', deleteError)
          throw deleteError
        }
        console.log(`✅ ${tickets.length} tickets eliminados correctamente`)
      }
      
      console.log('🎉 Rechazo de pago completado exitosamente')
      return { 
        data: { 
          pago_rechazado: true, 
          tickets_eliminados: tickets?.length || 0,
          rechazo_logs: rechazoLogs
        }, 
        error: null 
      }
    },
    'Error al rechazar pago'
  )
}


