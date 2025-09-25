import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery 
} from '@/lib/database'

// =====================================================
// 📊 ANÁLISIS DE GANANCIAS - ELEVEN RIFAS
// =====================================================
// Funciones para analizar ganancias por moneda (BS y USD)
// Sigue el patrón de funciones de BD del módulo admin
// =====================================================

export interface RevenueDataPoint {
  date: string
  bolivares: number
  dolares: number
  total_bs: number
  total_usd: number
}

export interface RevenueStats {
  totalBolivares: number
  totalDolares: number
  totalBolivaresConvertido: number
  totalDolaresConvertido: number
  gananciaTotal: number
  porcentajeBolivares: number
  porcentajeDolares: number
}

/**
 * Obtener datos de ganancias por fecha y moneda
 */
export async function getRevenueByCurrency(
  days: number = 30,
  rifaId?: string
): Promise<{ success: boolean; data?: RevenueDataPoint[]; error?: string }> {
  return safeAdminQuery(async () => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    
    let query = createAdminQuery('pagos')
      .select(`
        fecha_pago,
        monto_bs,
        monto_usd,
        tasa_cambio,
        estado,
        tipo_pago
      `)
      .gte('fecha_pago', startDate.toISOString())
      .eq('estado', 'verificado')
      .order('fecha_pago', { ascending: true })

    if (rifaId) {
      query = query.eq('rifa_id', rifaId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener datos de ganancias: ${error.message}`)
    }

    // Agrupar por fecha y calcular totales
    const groupedData = new Map<string, {
      bolivares: number
      dolares: number
      total_bs: number
      total_usd: number
    }>()

    data?.forEach(pago => {
      const fecha = new Date(pago.fecha_pago).toISOString().split('T')[0]
      
      if (!groupedData.has(fecha)) {
        groupedData.set(fecha, {
          bolivares: 0,
          dolares: 0,
          total_bs: 0,
          total_usd: 0
        })
      }

      const dayData = groupedData.get(fecha)!
      
      // Solo bolívares de pago móvil
      if (pago.tipo_pago === 'pago_movil' && pago.monto_bs && pago.monto_bs > 0) {
        dayData.bolivares += pago.monto_bs
        dayData.total_bs += pago.monto_bs
      }
      
      // Solo dólares de otros tipos de pago (no pago móvil)
      if (pago.tipo_pago !== 'pago_movil' && pago.monto_usd && pago.monto_usd > 0) {
        dayData.dolares += pago.monto_usd
        dayData.total_usd += pago.monto_usd
      }
    })

    // Convertir a array y ordenar por fecha
    const result = Array.from(groupedData.entries())
      .map(([date, data]) => ({
        date,
        bolivares: data.bolivares,
        dolares: data.dolares,
        total_bs: data.total_bs,
        total_usd: data.total_usd
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    return { data: result, error: null }
  }, 'Error al obtener datos de ganancias por moneda')
}

/**
 * Obtener estadísticas de ganancias por moneda
 */
export async function getRevenueStats(): Promise<{ success: boolean; data?: RevenueStats; error?: string }> {
  return safeAdminQuery(async () => {
    const { data, error } = await createAdminQuery('pagos')
      .select(`
        monto_bs,
        monto_usd,
        tasa_cambio,
        estado
      `)
      .eq('estado', 'verificado')

    if (error) {
      throw new Error(`Error al obtener estadísticas de ganancias: ${error.message}`)
    }

    let totalBolivares = 0
    let totalDolares = 0
    let totalBolivaresConvertido = 0
    let totalDolaresConvertido = 0

    data?.forEach(pago => {
      if (pago.monto_bs && pago.monto_bs > 0) {
        totalBolivares += pago.monto_bs
        // Convertir a USD usando la tasa de cambio
        if (pago.tasa_cambio && pago.tasa_cambio > 0) {
          totalBolivaresConvertido += pago.monto_bs / pago.tasa_cambio
        }
      }
      
      if (pago.monto_usd && pago.monto_usd > 0) {
        totalDolares += pago.monto_usd
        totalDolaresConvertido += pago.monto_usd
      }
    })

    const gananciaTotal = totalBolivaresConvertido + totalDolaresConvertido
    const porcentajeBolivares = gananciaTotal > 0 ? (totalBolivaresConvertido / gananciaTotal) * 100 : 0
    const porcentajeDolares = gananciaTotal > 0 ? (totalDolaresConvertido / gananciaTotal) * 100 : 0

    const stats: RevenueStats = {
      totalBolivares,
      totalDolares,
      totalBolivaresConvertido,
      totalDolaresConvertido,
      gananciaTotal,
      porcentajeBolivares,
      porcentajeDolares
    }

    return { data: stats, error: null }
  }, 'Error al obtener estadísticas de ganancias')
}

/**
 * Obtener datos de ganancias por rifa y moneda
 */
export async function getRevenueByRifa(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  return safeAdminQuery(async () => {
    const { data, error } = await createAdminQuery('pagos')
      .select(`
        monto_bs,
        monto_usd,
        tasa_cambio,
        estado,
        rifa_id,
        rifas!rifa_id (id, titulo, precio_ticket)
      `)
      .eq('estado', 'verificado')

    if (error) {
      throw new Error(`Error al obtener datos de ganancias por rifa: ${error.message}`)
    }

    // Agrupar por rifa
    const rifaData = new Map<string, {
      titulo: string
      bolivares: number
      dolares: number
      total_bs: number
      total_usd: number
      tickets: number
    }>()

    data?.forEach(pago => {
      const rifaId = pago.rifa_id
      const rifa = pago.rifas
      
      if (!rifaData.has(rifaId)) {
        rifaData.set(rifaId, {
          titulo: rifa?.titulo || 'Rifa desconocida',
          bolivares: 0,
          dolares: 0,
          total_bs: 0,
          total_usd: 0,
          tickets: 0
        })
      }

      const rifaInfo = rifaData.get(rifaId)!
      
      if (pago.monto_bs && pago.monto_bs > 0) {
        rifaInfo.bolivares += pago.monto_bs
        rifaInfo.total_bs += pago.monto_bs
      }
      
      if (pago.monto_usd && pago.monto_usd > 0) {
        rifaInfo.dolares += pago.monto_usd
        rifaInfo.total_usd += pago.monto_usd
      }
      
      rifaInfo.tickets += 1
    })

    // Convertir a array y ordenar por ganancia total
    const result = Array.from(rifaData.entries())
      .map(([rifaId, data]) => ({
        rifaId,
        ...data,
        gananciaTotal: data.total_bs + data.total_usd
      }))
      .sort((a, b) => b.gananciaTotal - a.gananciaTotal)

    return { data: result, error: null }
  }, 'Error al obtener datos de ganancias por rifa')
}

