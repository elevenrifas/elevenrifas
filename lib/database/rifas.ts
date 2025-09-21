// =====================================================
// 🎯 OPERACIONES DE RIFAS - ELEVEN RIFAS
// =====================================================
// Todas las operaciones relacionadas con rifas
// Centralizadas y organizadas por funcionalidad
// =====================================================

import { supabase } from './supabase'
import type { Database } from '@/types/supabase'
import type { Rifa } from '@/types'
import { getVenezuelaISOString } from '../utils/venezuela-date'

// Usar tipos de Supabase directamente
type RifasInsert = Database['public']['Tables']['rifas']['Insert']
type RifasUpdate = Database['public']['Tables']['rifas']['Update']
type RifasRow = Database['public']['Tables']['rifas']['Row']

// =====================================================
// CONSULTAS PRINCIPALES
// =====================================================

/**
 * Obtener todas las rifas (activas e inactivas) con categorías
 * Para uso en filtros y administración
 */
export async function obtenerTodasLasRifas(): Promise<Rifa[]> {
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener todas las rifas:', error.message)
      return []
    }

    // Transformar y validar datos
    const rifasTransformadas = (data || []).map((rifa: any) => ({
        ...rifa,
        tipo_rifa: rifa.tipo_rifa || 'vehiculo',
        categoria: rifa.categoria || 'general',
        destacada: rifa.destacada || false,
        orden: rifa.orden || 0,
        slug: rifa.slug || (rifa.titulo ? rifa.titulo.toLowerCase().replace(/\s+/g, '-') : 'rifa-sin-titulo'),
        fecha_culminacion: rifa.fecha_culminacion || null,
        premio_principal: rifa.premio_principal || rifa.titulo,
        condiciones: rifa.condiciones || 'Ganador debe ser mayor de 18 años.',
        marca: rifa.marca || null,
        modelo: rifa.modelo || null,
        ano: rifa.ano || null,
        color: rifa.color || null,
        valor_estimado_usd: rifa.valor_estimado_usd || null,
        progreso_manual: rifa.progreso_manual || null
      }))

    return rifasTransformadas

  } catch (error) {
    console.error('💥 Error inesperado al obtener todas las rifas:', error)
    return []
  }
}

/**
 * Obtener todas las rifas activas con categorías
 * Query principal que se ejecuta al inicio de la aplicación
 */
export async function obtenerRifasActivas(): Promise<Rifa[]> {
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('estado', 'activa')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener rifas:', error.message)
      return []
    }

    // Transformar y validar datos
    const rifasTransformadas = (data || []).map((rifa: any) => ({
        ...rifa,
        tipo_rifa: rifa.tipo_rifa || 'vehiculo',
        categoria: rifa.categoria || 'general',
        destacada: rifa.destacada || false,
        orden: rifa.orden || 0,
        slug: rifa.slug || (rifa.titulo ? rifa.titulo.toLowerCase().replace(/\s+/g, '-') : 'rifa-sin-titulo'),
        fecha_culminacion: rifa.fecha_culminacion || null,
        premio_principal: rifa.premio_principal || rifa.titulo,
        condiciones: rifa.condiciones || 'Ganador debe ser mayor de 18 años.',
        marca: rifa.marca || null,
        modelo: rifa.modelo || null,
        ano: rifa.ano || null,
        color: rifa.color || null,
        valor_estimado_usd: rifa.valor_estimado_usd || null,
        progreso_manual: rifa.progreso_manual || null
      }))

    return rifasTransformadas

  } catch (error) {
    console.error('💥 Error inesperado al obtener rifas:', error)
    return []
  }
}

/**
 * Obtener rifa por ID específico
 */
export async function obtenerRifaPorId(id: string): Promise<Rifa | null> {
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('id', id)
      .eq('estado', 'activa')
      .single()

    if (error) {
      console.error(`❌ Error al obtener rifa ${id}:`, error.message)
      return null
    }

    return data as Rifa

  } catch (error) {
    console.error(`💥 Error inesperado al obtener rifa ${id}:`, error)
    return null
  }
}

/**
 * Obtener rifas por categoría
 */
export async function obtenerRifasPorCategoria(categoriaId: string): Promise<Rifa[]> {
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('categoria_id', categoriaId)
      .eq('estado', 'activa')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error(`❌ Error al obtener rifas de categoría ${categoriaId}:`, error.message)
      return []
    }

    return (data || []) as Rifa[]

  } catch (error) {
    console.error(`💥 Error inesperado al obtener rifas de categoría ${categoriaId}:`, error)
    return []
  }
}

// =====================================================
// OPERACIONES DE ADMINISTRACIÓN
// =====================================================

/**
 * Crear nueva rifa
 */
export async function crearRifa(datos: RifasInsert): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Validar datos requeridos
    if (!datos.titulo || !datos.precio_ticket) {
      return { success: false, error: 'Título y precio del ticket son requeridos' }
    }

    // Validar precio del ticket
    if (datos.precio_ticket <= 0) {
      return { success: false, error: 'El precio del ticket debe ser mayor a 0' }
    }

    // Validar numero_tickets_comprar
    if (datos.numero_tickets_comprar && !Array.isArray(datos.numero_tickets_comprar)) {
      return { success: false, error: 'numero_tickets_comprar debe ser un array' }
    }

    // Validar progreso_manual
    if (datos.progreso_manual !== undefined && (datos.progreso_manual < 0 || datos.progreso_manual > 100)) {
      return { success: false, error: 'progreso_manual debe estar entre 0 y 100' }
    }

    // Establecer valores por defecto
    const datosConValoresPorDefecto = {
      ...datos,
      estado: datos.estado || 'activa',
      fecha_creacion: datos.fecha_creacion || getVenezuelaISOString(),
      total_tickets: datos.total_tickets || 0,
      tickets_disponibles: datos.tickets_disponibles || datos.total_tickets || 0,
      numero_tickets_comprar: datos.numero_tickets_comprar || [1, 2, 3, 5, 10],
      progreso_manual: datos.progreso_manual !== undefined ? datos.progreso_manual : null,
    }

    const { data, error } = await supabase
      .from('rifas')
      .insert(datosConValoresPorDefecto)
      .select('id')
      .single()

    if (error) {
      console.error('❌ Error al crear rifa:', error.message)
      return { success: false, error: error.message }
    }

    return { success: true, id: data.id }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Actualizar rifa existente
 */
export async function actualizarRifa(id: string, datos: RifasUpdate): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('rifas')
      .update(datos)
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

/**
 * Cambiar estado de rifa
 */
export async function cambiarEstadoRifa(id: string, nuevoEstado: 'activa' | 'cerrada' | 'pausada'): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('rifas')
      .update({ 
        estado: nuevoEstado,
        fecha_cierre: nuevoEstado !== 'activa' ? getVenezuelaISOString() : null
      })
      .eq('id', id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// =====================================================
// CONSULTAS DE ESTADÍSTICAS
// =====================================================

/**
 * Obtener estadísticas de rifas
 */
export async function obtenerEstadisticasRifas() {
  try {
    const { data, error } = await supabase
      .from('rifas')
      .select('estado')
      .eq('estado', 'activa')

    if (error) {
      throw error
    }

    const estadisticas = {
      total: data.length,
      activas: data.filter(r => r.estado === 'activa').length,
      cerradas: data.filter(r => r.estado === 'cerrada').length,
    }

    return { success: true, data: estadisticas }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// =====================================================
// FUNCIONES DE ESTADÍSTICAS OPTIMIZADAS
// =====================================================

/**
 * Obtener rifa completa con estadísticas calculadas
 * Usa la función SQL RPC optimizada existente
 * CRÍTICO: Se usa en RifaCard para progreso en tiempo real
 */
export async function getRifaFull(rifa_id: string) {
  // Validación de entrada
  if (!rifa_id || typeof rifa_id !== 'string') {
    console.error('❌ getRifaFull: rifa_id inválido:', rifa_id)
    return null
  }

  try {
    // Usar la función SQL RPC existente
    const result: any = await supabase.rpc('get_rifa_full', { 
      p_rifa_id: rifa_id 
    })
    
    if (result.error) {
      console.error('❌ getRifaFull: Error en RPC:', result.error.message)
      // Fallback inmediato para mantener funcionalidad
      return await getRifaStatsFallback(rifa_id)
    }

    if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
      console.error('❌ getRifaFull: No se encontró rifa con ID:', rifa_id)
      return null
    }

    const rifaStats = result.data[0]
    
    // Obtener datos completos de la rifa para campos adicionales
    const { data: rifaCompleta, error: rifaError } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('id', rifa_id)
      .single()

    if (rifaError) {
      console.error('❌ getRifaFull: Error obteniendo datos completos:', rifaError.message)
      // Retornar solo los datos de estadísticas si falla
      return {
        ...rifaStats,
        categoria: null,
        tipo_rifa: 'vehiculo',
        destacada: false,
        orden: 0,
        slug: null,
        // Campos críticos para RifaCard
        progreso: rifaStats.progreso,
        vendidos: rifaStats.vendidos,
        disponibles: rifaStats.disponibles,
        reservas_activas: rifaStats.reservas_activas
      }
    }

    // Combinar estadísticas con datos completos
    return {
      ...rifaCompleta,
      // Campos críticos para RifaCard - mantener compatibilidad
      vendidos: rifaStats.vendidos,
      reservas_activas: rifaStats.reservas_activas,
      disponibles: rifaStats.disponibles,
      progreso: rifaStats.progreso
    }

  } catch (error) {
    console.error('💥 getRifaFull: Error inesperado:', error)
    // Fallback para mantener funcionalidad crítica
    return await getRifaStatsFallback(rifa_id)
  }
}

/**
 * Obtener todas las rifas con estadísticas calculadas
 * Usa la función SQL RPC optimizada existente
 * CRÍTICO: Se usa en Home page para listar todas las rifas
 */
export async function getRifasFull() {
  try {
    // Usar la función SQL RPC existente
    const result: any = await supabase.rpc('get_rifas_full')
    
    if (result.error) {
      console.error('❌ getRifasFull: Error en RPC:', result.error.message)
      // Fallback inmediato para mantener funcionalidad del home
      return await getRifasStatsFallback()
    }

    if (!result.data || !Array.isArray(result.data)) {
      console.error('❌ getRifasFull: Datos inválidos retornados por RPC')
      return []
    }

    // Obtener datos completos de todas las rifas (activas y pausadas)
    const { data: rifasCompletas, error: rifasError } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .in('estado', ['activa', 'pausada'])
      .order('fecha_creacion', { ascending: false })

    if (rifasError) {
      console.error('❌ getRifasFull: Error obteniendo rifas completas:', rifasError.message)
      return []
    }

    // Combinar estadísticas con datos completos
    return rifasCompletas.map(rifa => {
      const stats = result.data.find((s: any) => s.rifa_id === rifa.id)
      
      if (!stats) {
        return {
          ...rifa,
          // Campos críticos para RifaCard - mantener compatibilidad
          vendidos: 0,
          reservas_activas: 0,
          disponibles: rifa.total_tickets || 0,
          progreso: 0
        }
      }

      return {
        ...rifa,
        // Campos críticos para RifaCard - mantener compatibilidad
        vendidos: stats.vendidos,
        reservas_activas: stats.reservas_activas,
        disponibles: stats.disponibles,
        progreso: stats.progreso
      }
    })

  } catch (error) {
    console.error('💥 getRifasFull: Error inesperado:', error)
    // Fallback para mantener funcionalidad crítica del home
    return await getRifasStatsFallback()
  }
}

// =====================================================
// FUNCIONES DE FALLBACK OPTIMIZADAS
// =====================================================

/**
 * Fallback optimizado para obtener estadísticas de una rifa
 * Solo usar si las funciones RPC fallan completamente
 * MANTIENE COMPATIBILIDAD TOTAL con RifaCard
 */
export async function getRifaStatsFallback(rifa_id: string) {
  try {
    const { data: rifa, error: rifaError } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('id', rifa_id)
      .single()

    if (rifaError || !rifa) return null

    // Contar tickets vendidos
    const { count: vendidos } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifa_id)
      .eq('estado', 'pagado')

    // Contar reservas activas
    const { count: reservas } = await supabase
      .from('tickets')
      .select('*', { count: 'exact', head: true })
      .eq('rifa_id', rifa_id)
      .eq('estado', 'reservado')
      .gt('reservado_hasta', getVenezuelaISOString())

    // Calcular estadísticas - MANTENER COMPATIBILIDAD
    const totalTickets = rifa.total_tickets || 0
    const ticketsVendidos = vendidos || 0
    const reservasActivas = reservas || 0
    const disponibles = Math.max(0, totalTickets - ticketsVendidos - reservasActivas)
    const progreso = totalTickets > 0 ? Math.round((ticketsVendidos / totalTickets) * 100) : 0
    
    return {
      ...rifa,
      // Campos críticos para RifaCard - mantener compatibilidad
      vendidos: ticketsVendidos,
      reservas_activas: reservasActivas,
      disponibles,
      progreso
    }

  } catch (error) {
    console.error('💥 getRifaStatsFallback: Error:', error)
    return null
  }
}

/**
 * Fallback optimizado para obtener estadísticas de todas las rifas
 * Solo usar si las funciones RPC fallan completamente
 * MANTIENE COMPATIBILIDAD TOTAL con Home page
 */
export async function getRifasStatsFallback() {
  try {
    // Obtener todas las rifas activas
    const { data: rifas, error: rifasError } = await supabase
      .from('rifas')
      .select(`
        *,
        categorias_rifas (
          id,
          nombre,
          icono,
          descripcion
        )
      `)
      .eq('estado', 'activa')
      .order('fecha_creacion', { ascending: false })

    if (rifasError || !rifas) {
      console.error('❌ getRifasStatsFallback: Error obteniendo rifas:', rifasError)
      return []
    }

    // Para cada rifa, calcular estadísticas
    const rifasConStats = await Promise.all(
      rifas.map(async (rifa) => {
        try {
          // Contar tickets vendidos
          const { count: vendidos } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('rifa_id', rifa.id)
            .eq('estado', 'pagado')

          // Contar reservas activas
          const { count: reservasActivas } = await supabase
            .from('tickets')
            .select('*', { count: 'exact', head: true })
            .eq('rifa_id', rifa.id)
            .eq('estado', 'reservado')
            .gt('reservado_hasta', getVenezuelaISOString())

          // Calcular estadísticas - MANTENER COMPATIBILIDAD
          const totalTickets = rifa.total_tickets || 0
          const ticketsVendidos = vendidos || 0
          const reservas = reservasActivas || 0
          const disponibles = Math.max(0, totalTickets - ticketsVendidos - reservas)
          const progreso = totalTickets > 0 ? Math.round((ticketsVendidos / totalTickets) * 100) : 0

          return {
            ...rifa,
            // Campos críticos para RifaCard - mantener compatibilidad
            vendidos: ticketsVendidos,
            reservas_activas: reservas,
            disponibles,
            progreso
          }
        } catch (error) {
          console.error(`❌ getRifasStatsFallback: Error para rifa ${rifa.id}:`, error)
          return {
            ...rifa,
            // Campos críticos para RifaCard - mantener compatibilidad
            vendidos: 0,
            reservas_activas: 0,
            disponibles: rifa.total_tickets || 0,
            progreso: 0
          }
        }
      })
    )

    return rifasConStats

  } catch (error) {
    console.error('💥 getRifasStatsFallback: Error fatal:', error)
    return []
  }
}
