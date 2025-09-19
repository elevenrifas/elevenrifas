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
import { esTicketEspecial, debeMantenerIdentidadEspecial, combinarDatosTicketEspecialAsignado } from '../../utils/ticket-especial'

type PagoRow = Database['public']['Tables']['pagos']['Row']
type PagoInsert = Database['public']['Tables']['pagos']['Insert']
type PagoUpdate = Database['public']['Tables']['pagos']['Update']

// Tipo extendido para incluir tickets y rifas
export interface AdminPago extends PagoRow {
  rifa_id?: string  // Agregar rifa_id que existe en el schema
  comprobante_url?: string | null  // Agregar comprobante_url del schema
  rifas?: {
    id: string
    titulo: string
    precio_ticket: number
  }
}
export type AdminPagoEstado = 'pendiente' | 'verificado' | 'rechazado'

export async function adminListPagos(params?: { 
  estado?: AdminPagoEstado
  rifa_id?: string
  ordenarPor?: string
  orden?: 'asc' | 'desc'
  limite?: number
  offset?: number
}) {
  const { 
    estado,
    rifa_id,
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
          rifas!rifa_id (
            id,
            titulo,
            precio_ticket
          ),
          tickets (
            id,
            numero_ticket,
            nombre,
            cedula,
            telefono,
            correo,
            fecha_compra,
            rifa_id,
            es_ticket_especial,
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
      
      // Filtrar por rifa_id a través de los tickets asociados
      if (rifa_id) {
        query = query.eq('tickets.rifa_id', rifa_id)
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
        // Información de la rifa directamente del pago
        rifas: pago.rifas || null,
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

export async function adminVerifyPago(
  id: string, 
  verificadoPor: string,
  options?: { especialesCantidad?: number; modo?: 'agregar' | 'reemplazar'; selectedIds?: string[] }
) {
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

      // 🆕 Opcional: gestionar tickets especiales
      const cantidad = Math.max(0, options?.especialesCantidad || (options?.selectedIds?.length || 0))
      const modo = (options?.modo ?? (options as any)?.mode) as 'agregar' | 'reemplazar'
      if (cantidad > 0 && modo) {
        console.log('🎫 Gestionando tickets especiales:', { cantidad, modo })

        // Obtener rifa_id desde algún ticket asociado
        const { data: ticketsExistentes, error: ticketsReadError } = await createAdminQuery('tickets')
          .select('id, rifa_id')
          .eq('pago_id', id)
          .limit(1)

        if (ticketsReadError) throw ticketsReadError
        const rifa_id = ticketsExistentes?.[0]?.rifa_id
        if (!rifa_id) {
          throw new Error('No se pudo determinar la rifa para generar tickets especiales')
        }

        // Determinar fuente de especiales: IDs seleccionados o generar
        let especialesIds: string[] = []
        let numerosEspeciales: string[] = []
        if (options?.selectedIds && options.selectedIds.length > 0) {
          // Validar que pertenecen a la rifa y que están libres (sin pago)
          const { data: especialesValidos, error: valError } = await createAdminQuery('tickets')
            .select('id, numero_ticket, pago_id, es_ticket_especial, nombre, cedula')
            .eq('rifa_id', rifa_id)
            .in('id', options.selectedIds)
            .is('pago_id', null)
            .eq('estado', 'reservado')
            .eq('es_ticket_especial', true)
          if (valError) throw valError
          
          // Verificar que no estén ya asignados a otro pago
          const ticketsDisponibles = (especialesValidos || []).filter((t: any) => !t.pago_id)
          if (ticketsDisponibles.length !== options.selectedIds.length) {
            const asignados = options.selectedIds.length - ticketsDisponibles.length
            throw new Error(`${asignados} ticket(s) especial(es) ya están asignados a otro pago`)
          }
          
          especialesIds = ticketsDisponibles.map((t: any) => t.id)
          numerosEspeciales = ticketsDisponibles.map((t: any) => t.numero_ticket)
        } else {
          // Generar números disponibles
          const { generateMultipleTicketNumbers } = await import('../utils/ticket-generator')
          numerosEspeciales = await generateMultipleTicketNumbers({ rifa_id }, cantidad)
        }

        if (modo === 'agregar') {
          // Obtener datos del cliente desde el pago (para fallback)
          const { data: pagoData, error: pagoError } = await createAdminQuery('pagos')
            .select('nombre_titular, cedula_pago, telefono_pago')
            .eq('id', id)
            .single()
          if (pagoError) throw pagoError

          // Obtener datos del cliente desde un ticket del mismo pago (preferido)
          const { data: ticketExistente, error: ticketError } = await createAdminQuery('tickets')
            .select('nombre, cedula, telefono, correo, es_ticket_especial')
            .eq('pago_id', id)
            .limit(1)
          if (ticketError) throw ticketError

          // Combinar datos: priorizar ticket existente, hacer fallback a datos del pago
          const nombre = (ticketExistente?.[0]?.nombre || pagoData?.nombre_titular || 'TICKET RESERVADO')
          const cedula = (ticketExistente?.[0]?.cedula || pagoData?.cedula_pago || '000000000')
          const telefono = (ticketExistente?.[0]?.telefono || pagoData?.telefono_pago || '000000000')
          const correo = (ticketExistente?.[0]?.correo || 'N/A')

          const datosCliente = {
            nombre,
            cedula,
            telefono,
            correo,
            es_ticket_especial: true
          }
          
          // Agregar tickets especiales al pago (mantener tickets existentes)
          if (especialesIds.length > 0) {
            
            console.log(`🎫 Agregando tickets especiales con datos del cliente:`, datosCliente)
            console.log(`🎫 IDs de tickets especiales:`, especialesIds)
            console.log(`🎫 Datos del pago obtenidos:`, pagoData)
            console.log(`🎫 Tickets existentes en el pago:`, ticketExistente)
            
            // Actualizar tickets especiales con datos del cliente pero manteniendo es_ticket_especial
            const { error: updError } = await createAdminQuery('tickets')
              .update({ 
                estado: 'pagado', 
                pago_id: id, 
                fecha_compra: new Date().toISOString() as any,
                // Actualizar con datos del cliente real
                nombre: datosCliente.nombre,
                cedula: datosCliente.cedula,
                telefono: datosCliente.telefono,
                correo: datosCliente.correo,
                // Mantener solo la identidad especial
                es_ticket_especial: true
              })
              .in('id', especialesIds)
            if (updError) throw updError
            console.log(`✅ Agregados ${especialesIds.length} ticket(s) especial(es) manteniendo identidad especial`)
            
            // Verificar que se actualizaron correctamente
            const { data: ticketsActualizados } = await createAdminQuery('tickets')
              .select('id, numero_ticket, nombre, cedula, es_ticket_especial')
              .in('id', especialesIds)
            console.log(`🔍 Tickets especiales actualizados:`, ticketsActualizados)
          } else {
            // Solo crear nuevos si no se seleccionaron tickets específicos
            console.log(`🎫 Creando tickets especiales nuevos:`, numerosEspeciales)
            for (let i = 0; i < cantidad; i++) {
              const numero = numerosEspeciales[i]
              const { error: insertError } = await createAdminQuery('tickets')
                .insert({
                  rifa_id,
                  numero_ticket: numero,
                  // Usar datos del cliente real
                  nombre: datosCliente.nombre,
                  cedula: datosCliente.cedula,
                  telefono: datosCliente.telefono,
                  correo: datosCliente.correo,
                  estado: 'pagado',
                  pago_id: id,
                  fecha_compra: new Date().toISOString() as any,
                  es_ticket_especial: true
                } as any)
              if (insertError) throw insertError
            }
            console.log(`✅ Creados ${cantidad} ticket(s) especial(es) nuevos para la compra`)
          }
        } else if (modo === 'reemplazar') {
          // Reemplazar aleatoriamente tickets actuales por especiales
          // Obtener tickets con datos de contacto para poder copiar ANTES de eliminar
          const { data: ticketsDelPago, error: listError } = await createAdminQuery('tickets')
            .select('id, rifa_id, nombre, cedula, telefono, correo')
            .eq('pago_id', id)
          if (listError) throw listError

          const aReemplazar = Math.min(cantidad, ticketsDelPago?.length || 0)

          // Elegir aleatoriamente IDs a reemplazar
          const ids = (ticketsDelPago || []).map((t: any) => t.id)
          for (let i = ids.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[ids[i], ids[j]] = [ids[j], ids[i]]
          }
          const idsSeleccionados = ids.slice(0, aReemplazar)

          // Capturar datos de contacto de uno de los tickets seleccionados (si hay)
          const ticketFuente = (ticketsDelPago || []).find((t: any) => idsSeleccionados.includes(t.id)) || ticketsDelPago?.[0]

          // Obtener datos del pago para fallback
          const { data: pagoData2, error: pagoError2 } = await createAdminQuery('pagos')
            .select('nombre_titular, cedula_pago, telefono_pago')
            .eq('id', id)
            .single()
          if (pagoError2) throw pagoError2

          const nombre = (ticketFuente?.nombre || pagoData2?.nombre_titular || 'TICKET RESERVADO')
          const cedula = (ticketFuente?.cedula || pagoData2?.cedula_pago || '000000000')
          const telefono = (ticketFuente?.telefono || pagoData2?.telefono_pago || '000000000')
          const correo = (ticketFuente?.correo || 'N/A')

          const datosCliente = { nombre, cedula, telefono, correo }

          // Eliminar seleccionados
          if (idsSeleccionados.length > 0) {
            const { error: delError } = await createAdminQuery('tickets')
              .delete()
              .in('id', idsSeleccionados)
            if (delError) throw delError
          }
          
          // Reutilizar especiales existentes seleccionados o crear nuevos
          const usarExistentes = Math.min(aReemplazar, especialesIds.length)
          // Actualizar especiales existentes mapeando 1 a 1 con los tickets reemplazados
          for (let i = 0; i < usarExistentes; i++) {
            const especialId = especialesIds[i]
            const fuente = (ticketsDelPago || []).find((t: any) => idsSeleccionados[i] === t.id) || ticketFuente
            const { error: updError } = await createAdminQuery('tickets')
              .update({ 
                estado: 'pagado', 
                pago_id: id, 
                fecha_compra: new Date().toISOString() as any,
                nombre: (fuente?.nombre || nombre),
                cedula: (fuente?.cedula || cedula),
                telefono: (fuente?.telefono || telefono),
                correo: (fuente?.correo || correo),
                es_ticket_especial: true
              })
              .eq('id', especialId)
            if (updError) throw updError
          }
          const restantes = aReemplazar - usarExistentes
          for (let i = 0; i < restantes; i++) {
            const numero = numerosEspeciales[i]
            const fuente = (ticketsDelPago || []).find((t: any) => idsSeleccionados[usarExistentes + i] === t.id) || ticketFuente
            const { error: insertError } = await createAdminQuery('tickets')
              .insert({
                rifa_id,
                numero_ticket: numero,
                nombre: (fuente?.nombre || nombre),
                cedula: (fuente?.cedula || cedula),
                telefono: (fuente?.telefono || telefono),
                correo: (fuente?.correo || correo),
                estado: 'pagado',
                pago_id: id,
                fecha_compra: new Date().toISOString() as any,
                es_ticket_especial: true
              } as any)
            if (insertError) throw insertError
          }
          console.log(`✅ Reemplazados ${aReemplazar} ticket(s) por especial(es) en la compra`)
        }
      }

      // Consultar tickets finales asociados para depuración y retorno
      const { data: ticketsFinales } = await createAdminQuery('tickets')
        .select('id, numero_ticket, nombre, cedula, telefono, correo, es_ticket_especial')
        .eq('pago_id', id)
        .order('numero_ticket', { ascending: true })

      console.log('🎉 Verificación de pago completada exitosamente')
      console.log('📋 Tickets asociados al pago tras verificación:', ticketsFinales?.map((t: any) => t.numero_ticket))

      // 📧 ENVIAR EMAIL DE CONFIRMACIÓN
      try {
        console.log('📧 Iniciando envío de email de confirmación...')
        
        // Obtener datos del pago para el email (consulta básica primero)
        const { data: pagoData, error: pagoError } = await createAdminQuery('pagos')
          .select('*')
          .eq('id', id)
          .single()

        if (pagoError || !pagoData) {
          console.error('❌ Error obteniendo datos del pago para email:', pagoError)
        } else {
          // Obtener datos de la rifa por separado
          const rifaId = pagoData.rifa_id
          let rifaData = null
          
          if (rifaId) {
            const { data: rifaInfo, error: rifaError } = await createAdminQuery('rifas')
              .select('id, titulo, precio_ticket, descripcion, fecha_cierre')
              .eq('id', rifaId)
              .single()
            
            if (rifaError) {
              console.warn('⚠️ Error obteniendo datos de la rifa:', rifaError)
            } else {
              rifaData = rifaInfo
            }
          }
          // Obtener tickets asociados
          const { data: ticketsData, error: ticketsError } = await createAdminQuery('tickets')
            .select(`
              id,
              numero_ticket,
              nombre,
              cedula,
              telefono,
              correo,
              es_ticket_especial,
              rifa_id
            `)
            .eq('pago_id', id)
            .order('numero_ticket', { ascending: true })

          if (ticketsError || !ticketsData || ticketsData.length === 0) {
            console.error('❌ Error obteniendo tickets para email:', ticketsError)
          } else {
            // Usar datos reales de la rifa obtenidos por separado
            const rifaDataFinal = {
              id: rifaData?.id || pagoData.rifa_id || ticketsData[0]?.rifa_id || 'unknown',
              titulo: rifaData?.titulo || 'Rifa',
              precio_ticket: rifaData?.precio_ticket || 0,
              premio: rifaData?.descripcion || 'Premio especial', // Usar descripción como premio
              fecha_sorteo: rifaData?.fecha_cierre || new Date().toISOString() // Usar fecha_cierre como fecha de sorteo
            }

            console.log('📊 Datos del pago para email:', {
              pago_id: pagoData.id,
              monto: pagoData.monto_usd,
              tipo_pago: pagoData.tipo_pago,
              referencia: pagoData.referencia
            })
            console.log('🎯 Datos de la rifa para email:', rifaDataFinal)
            console.log('🎫 Tickets para email:', ticketsData.map(t => ({ numero: t.numero_ticket, nombre: t.nombre, email: t.correo })))

            // Enviar email usando API route (servidor)
            try {
              const emailData = {
                pago: pagoData,
                tickets: ticketsData,
                rifa: rifaDataFinal
              }

              const response = await fetch('/api/send-payment-verification-email', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData)
              })

              const result = await response.json()
              
              if (result.success) {
                console.log('✅ Email de confirmación enviado exitosamente:', result.message_id)
              } else {
                console.error('❌ Error enviando email de confirmación:', result.error)
              }
            } catch (apiError) {
              console.error('❌ Error llamando API de email:', apiError)
            }
          }
        }
      } catch (emailError) {
        console.error('❌ Error inesperado enviando email de confirmación:', emailError)
        // No fallar la verificación por error de email
      }

      return { data: { tickets: ticketsFinales || [] }, error: null }
    },
    'Error al verificar pago'
  )
}

export async function adminRejectPago(id: string, verificadoPor: string, rechazoNote?: string) {
  return safeAdminQuery(
    async () => {
      console.log('🔍 Iniciando rechazo de pago:', { id, verificadoPor, rechazoNote })
      
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
        motivo: rechazoNote || 'Pago rechazado por administrador',
        tickets_eliminados: tickets?.map((ticket: any) => ({
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
          rechazo_logs: JSON.stringify(rechazoLogs),
          rechazo_note: rechazoNote || null
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

/**
 * Validar si existe una referencia duplicada para el mismo tipo de pago y rifa
 */
export async function adminValidateReferenciaDuplicada(
  referencia: string, 
  tipoPago: string, 
  rifaId: string, 
  pagoIdExcluir?: string
) {
  return safeAdminQuery(
    async () => {
      if (!referencia || !tipoPago || !rifaId) {
        return { data: { esDuplicada: false, pagoExistente: null }, error: null }
      }

      let query = createAdminQuery('pagos')
        .select('id, referencia, tipo_pago, estado, fecha_pago')
        .eq('referencia', referencia)
        .eq('tipo_pago', tipoPago)
        .eq('rifa_id', rifaId)
        .in('estado', ['pendiente', 'verificado'])

      // Excluir el pago actual si se está editando
      if (pagoIdExcluir) {
        query = query.neq('id', pagoIdExcluir)
      }

      const { data: pagosExistentes, error } = await query

      if (error) {
        throw error
      }

      const esDuplicada = pagosExistentes && pagosExistentes.length > 0
      const pagoExistente = esDuplicada ? pagosExistentes[0] : null

      return { 
        data: { 
          esDuplicada, 
          pagoExistente,
          totalEncontrados: pagosExistentes?.length || 0
        }, 
        error: null 
      }
    },
    'Error al validar referencia duplicada'
  )
}


