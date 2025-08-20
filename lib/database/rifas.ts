// =====================================================
// 🎯 OPERACIONES DE RIFAS - ELEVEN RIFAS
// =====================================================
// Todas las operaciones relacionadas con rifas
// Centralizadas y organizadas por funcionalidad
// =====================================================

import { supabase } from './supabase'
import type { Database } from '@/types/supabase'
import type { Rifa } from '@/types'

type RifasInsert = Database['public']['Tables']['rifas']['Insert']
type RifasUpdate = Database['public']['Tables']['rifas']['Update']

// =====================================================
// CONSULTAS PRINCIPALES
// =====================================================

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
          color
        )
      `)
      .eq('activa', true)
      .eq('estado', 'activa')
      .order('fecha_creacion', { ascending: false })

    if (error) {
      console.error('❌ Error al obtener rifas:', error.message)
      return []
    }

    // Transformar y validar datos
    const rifasTransformadas = (data || []).map((rifa) => ({
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
      valor_estimado_usd: rifa.valor_estimado_usd || null
    }))

    // console.debug(`✅ Rifas obtenidas: ${rifasTransformadas.length}`)
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
          color
        )
      `)
      .eq('id', id)
      .eq('activa', true)
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
          color
        )
      `)
      .eq('categoria_id', categoriaId)
      .eq('activa', true)
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
    const { data, error } = await supabase
      .from('rifas')
      .insert(datos)
      .select()
      .single()

    if (error) {
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
export async function cambiarEstadoRifa(id: string, nuevoEstado: 'activa' | 'cerrada' | 'finalizada'): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('rifas')
      .update({ 
        estado: nuevoEstado,
        fecha_cierre: nuevoEstado !== 'activa' ? new Date().toISOString() : null
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
      .select('estado, activa')
      .eq('activa', true)

    if (error) {
      throw error
    }

    const estadisticas = {
      total: data.length,
      activas: data.filter(r => r.estado === 'activa').length,
      cerradas: data.filter(r => r.estado === 'cerrada').length,
      finalizadas: data.filter(r => r.estado === 'finalizada').length
    }

    return { success: true, data: estadisticas }

  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

