// =====================================================
// 🎯 ADMIN DB - RIFAS - ELEVEN RIFAS
// =====================================================
// Lógica de base de datos exclusiva para el panel de administración
// Sigue el patrón establecido del template
// =====================================================

import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery, 
  applyOrdering,
  applyPagination
} from '@/lib/database'

// =====================================================
// 📋 TIPOS Y INTERFACES
// =====================================================

// Tipo para la relación con categorías
interface CategoriaRifa {
  id: string;
  nombre: string;
  icono: string;
}

// Tipo base para inserción de rifas
interface RifasInsertCustom {
  titulo: string;
  descripcion?: string;
  precio_ticket: number;
  imagen_url?: string;
  estado?: 'activa' | 'cerrada' | 'pausada' | 'finalizada';
  fecha_creacion?: string;
  fecha_cierre?: string;
  total_tickets?: number;
  tickets_disponibles?: number;
  condiciones?: string;
  categoria_id?: string;
  numero_tickets_comprar?: number[];
  progreso_manual?: number;
  tasa?: number;
  activa?: boolean;
}

// Tipo para actualización de rifas
interface RifasUpdateCustom {
  titulo?: string;
  descripcion?: string;
  precio_ticket?: number;
  imagen_url?: string;
  estado?: 'activa' | 'cerrada' | 'pausada' | 'finalizada';
  fecha_cierre?: string;
  total_tickets?: number;
  tickets_disponibles?: number;
  condiciones?: string;
  categoria_id?: string;
  numero_tickets_comprar?: number[];
  progreso_manual?: number;
  tasa?: number;
  activa?: boolean;
}

// Tipo principal para rifas en el admin
export type AdminRifa = RifasInsertCustom & { 
  id: string;
  categorias_rifas?: CategoriaRifa;
  // Campos de progreso calculados por RPC
  vendidos?: number;
  reservas_activas?: number;
  disponibles?: number;
  progreso?: number;
}

// =====================================================
// 📋 FUNCIONES ADMIN RIFAS
// =====================================================

// 1. LISTAR RIFAS
export async function adminListRifas(options: {
  incluirCerradas?: boolean;
  incluirInactivas?: boolean;
  ordenarPor?: 'fecha_creacion' | 'titulo' | 'estado' | 'precio_ticket';
  orden?: 'asc' | 'desc';
  limite?: number;
  offset?: number;
} = {}): Promise<{ success: boolean; data?: AdminRifa[]; error?: string; total?: number }> {
  const {
    incluirCerradas = true,
    incluirInactivas = true,
    ordenarPor = 'fecha_creacion',
    orden = 'desc',
    limite = 1000,
    offset = 0
  } = options

  return safeAdminQuery(
    async () => {
      console.log('🔍 [adminListRifas] Iniciando consulta de rifas...')
      console.log('🔍 [adminListRifas] Parámetros:', { incluirCerradas, incluirInactivas, ordenarPor, orden, limite, offset })
      
      let query = createAdminQuery('rifas')
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono
          )
        `)
      
      console.log('🔍 [adminListRifas] Query base creada')
      
      // Aplicar filtros de estado
      if (!incluirCerradas) {
        query = query.neq('estado', 'cerrada')
      }
      
      // Aplicar filtros de activación
      if (!incluirInactivas) {
        query = query.eq('estado', 'activa')
      }
      
      // Aplicar ordenamiento usando helper
      query = applyOrdering(query, ordenarPor, orden)
      console.log('🔍 [adminListRifas] Ordenamiento aplicado')
      
      // Aplicar paginación usando helper
      query = applyPagination(query, limite, offset)
      console.log('🔍 [adminListRifas] Paginación aplicada')

      console.log('🔍 [adminListRifas] Ejecutando query...')
      
      try {
        // Usar la función RPC get_rifas_full para obtener estadísticas calculadas
        console.log('🔍 [adminListRifas] Usando RPC get_rifas_full...')
        const rpcResult: any = await adminSupabase.rpc('get_rifas_full')
        
        if (rpcResult.error) {
          console.error('❌ [adminListRifas] Error en RPC get_rifas_full:', rpcResult.error.message)
          // Fallback a consulta normal si falla el RPC
          console.log('🔄 [adminListRifas] Usando fallback...')
          const result = await query
          return { 
            data: result.data || [],
            error: result.error
          }
        }

        if (!rpcResult.data || !Array.isArray(rpcResult.data)) {
          console.error('❌ [adminListRifas] Datos inválidos retornados por RPC')
          throw new Error('Datos inválidos del RPC')
        }

        console.log('✅ [adminListRifas] RPC exitoso, procesando datos...')
        
        // Obtener datos completos de todas las rifas con categorías (incluyendo inactivas/cerradas)
        const { data: rifasCompletas, error: rifasError } = await adminSupabase
          .from('rifas')
          .select(`
            *,
            categorias_rifas (
              id,
              nombre,
              icono
            )
          `)

        if (rifasError) {
          console.error('❌ [adminListRifas] Error obteniendo rifas completas:', rifasError.message)
          throw rifasError
        }

        // Combinar estadísticas RPC con datos completos
        const rifasConStats = rifasCompletas.map((rifa: any) => {
          const stats = rpcResult.data.find((s: any) => s.rifa_id === rifa.id)
          
          if (!stats) {
            return {
              ...rifa,
              // Campos críticos para la barra de progreso - mantener compatibilidad
              vendidos: 0,
              reservas_activas: 0,
              disponibles: rifa.total_tickets || 0,
              progreso: 0
            }
          }

          return {
            ...rifa,
            // Campos críticos para la barra de progreso - mantener compatibilidad
            vendidos: stats.vendidos,
            reservas_activas: stats.reservas_activas,
            disponibles: stats.disponibles,
            progreso: stats.progreso
          }
        })

        // Aplicar filtros de estado
        let rifasFiltradas = rifasConStats
        
        if (!incluirCerradas) {
          rifasFiltradas = rifasFiltradas.filter((r: any) => r.estado !== 'cerrada')
        }
        
        if (!incluirInactivas) {
          rifasFiltradas = rifasFiltradas.filter((r: any) => r.estado === 'activa')
        }

        // Aplicar ordenamiento
        rifasFiltradas.sort((a: any, b: any) => {
          let aValue: any, bValue: any
          
          switch (ordenarPor) {
            case 'fecha_creacion':
              aValue = new Date(a.fecha_creacion || 0)
              bValue = new Date(b.fecha_creacion || 0)
              break
            case 'titulo':
              aValue = a.titulo?.toLowerCase() || ''
              bValue = b.titulo?.toLowerCase() || ''
              break
            case 'estado':
              aValue = a.estado || ''
              bValue = b.estado || ''
              break
            case 'precio_ticket':
              aValue = a.precio_ticket || 0
              bValue = b.precio_ticket || 0
              break
            default:
              aValue = new Date(a.fecha_creacion || 0)
              bValue = new Date(b.fecha_creacion || 0)
          }
          
          if (orden === 'asc') {
            return aValue > bValue ? 1 : -1
          } else {
            return aValue < bValue ? 1 : -1
          }
        })

        // Aplicar paginación
        const rifasPaginadas = rifasFiltradas.slice(offset, offset + limite)
        
        console.log('✅ [adminListRifas] Procesamiento exitoso')
        console.log('📊 [adminListRifas] Total rifas:', rifasFiltradas.length)
        console.log('📊 [adminListRifas] Rifas retornadas:', rifasPaginadas.length)
        
        return { 
          data: rifasPaginadas,
          error: null,
          total: rifasFiltradas.length
        }
        
      } catch (error) {
        console.error('💥 [adminListRifas] Error inesperado:', error)
        // Fallback a consulta normal si hay error
        console.log('🔄 [adminListRifas] Usando fallback por error...')
        const result = await query
        return { 
          data: result.data || [],
          error: result.error
        }
      }
    },
    'Error al listar rifas'
  )
}

// 2. OBTENER RIFA INDIVIDUAL
export async function adminGetRifa(id: string): Promise<{ success: boolean; data?: AdminRifa; error?: string }> {
  return safeAdminQuery(
    async () => {
      const result = await createAdminQuery('rifas')
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono
          )
        `)
        .eq('id', id)
        .single()
      
      return { data: result.data, error: result.error }
    },
    'Error al obtener rifa'
  )
}

// 3. CREAR RIFA
export async function adminCreateRifa(datos: RifasInsertCustom): Promise<{ success: boolean; data?: AdminRifa; error?: string }> {
  return safeAdminQuery(
    async () => {
      // Validar datos requeridos
      if (!datos.titulo || !datos.precio_ticket) {
        throw new Error('Título y precio del ticket son requeridos')
      }

      // Validar precio del ticket
      if (datos.precio_ticket <= 0) {
        throw new Error('El precio del ticket debe ser mayor a 0')
      }

      // Validar numero_tickets_comprar
      if (datos.numero_tickets_comprar && !Array.isArray(datos.numero_tickets_comprar)) {
        throw new Error('numero_tickets_comprar debe ser un array')
      }

      // Validar progreso_manual
      if (datos.progreso_manual !== undefined && (datos.progreso_manual < 0 || datos.progreso_manual > 100)) {
        throw new Error('progreso_manual debe estar entre 0 y 100')
      }

      // Establecer valores por defecto
      const datosConValoresPorDefecto = {
        ...datos,
        estado: datos.estado || 'activa',
        fecha_creacion: datos.fecha_creacion || new Date().toISOString(),
        total_tickets: datos.total_tickets || 0,
        tickets_disponibles: datos.tickets_disponibles || datos.total_tickets || 0,
        numero_tickets_comprar: datos.numero_tickets_comprar || [1, 2, 3, 5, 10],
        progreso_manual: datos.progreso_manual !== undefined ? datos.progreso_manual : null,
        tasa: datos.tasa || 12.3
      }

      const { data, error } = await createAdminQuery('rifas')
        .insert(datosConValoresPorDefecto)
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono
          )
        `)
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al crear rifa'
  )
}

// 4. ACTUALIZAR RIFA
export async function adminUpdateRifa(id: string, datos: RifasUpdateCustom): Promise<{ success: boolean; data?: AdminRifa; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('rifas')
        .update(datos)
        .eq('id', id)
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono
          )
        `)
        .single()
      
      if (error) throw error
      return { data, error: null }
    },
    'Error al actualizar rifa'
  )
}

// 5. CAMBIAR ESTADO DE RIFA
export async function adminChangeRifaState(id: string, estado: 'activa' | 'cerrada' | 'pausada'): Promise<{ success: boolean; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { error } = await createAdminQuery('rifas')
        .update({ 
          estado: estado,
          fecha_cierre: estado !== 'activa' ? new Date().toISOString() : null
        })
        .eq('id', id)
      
      if (error) throw error
      return { data: null, error: null }
    },
    'Error al cambiar estado de rifa'
  )
}

// 6. ELIMINAR RIFA
export async function adminDeleteRifa(id: string): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('🗑️ [adminDeleteRifa] Iniciando eliminación de rifa:', id)
    
    // Verificar si la rifa tiene tickets asociados
    console.log('🔍 [adminDeleteRifa] Verificando tickets asociados...')
    const { data: tickets, error: ticketsError } = await createAdminQuery('tickets')
      .select('id, pago_id')
      .eq('rifa_id', id)
      .limit(5) // Limitar para performance

    if (ticketsError) {
      console.error('❌ Error al verificar tickets:', ticketsError)
      return { success: false, error: 'Error al verificar tickets: ' + ticketsError.message }
    }

    console.log('🎫 [adminDeleteRifa] Tickets encontrados:', tickets?.length || 0)
    
    if (tickets && tickets.length > 0) {
      // Verificar si algún ticket tiene pago asociado
      const ticketsConPago = tickets.filter((t: any) => t.pago_id)
      console.log('💰 [adminDeleteRifa] Tickets con pago:', ticketsConPago.length)
      
      if (ticketsConPago.length > 0) {
        return { 
          success: false, 
          error: `No se puede eliminar la rifa porque tiene ${ticketsConPago.length} ticket(s) con pagos asociados`,
          details: { ticketsCount: tickets.length, ticketsConPago: ticketsConPago.length }
        }
      } else {
        return { 
          success: false, 
          error: `No se puede eliminar la rifa porque tiene ${tickets.length} ticket(s) asociados`,
          details: { ticketsCount: tickets.length }
        }
      }
    }

    console.log('✅ [adminDeleteRifa] No hay dependencias, procediendo con eliminación...')
    
    // Si no hay dependencias, proceder con la eliminación
    const { error } = await createAdminQuery('rifas')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('❌ Error al eliminar rifa:', error)
      return { success: false, error: error.message }
    }

    console.log('🗑️ ✅ [adminDeleteRifa] Rifa eliminada exitosamente')
    return { success: true }

  } catch (error) {
    console.error('💥 Error inesperado al eliminar rifa:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// 7. ELIMINAR MÚLTIPLES RIFAS
export async function adminDeleteMultipleRifas(ids: string[]): Promise<{ success: boolean; error?: string; results?: any[] }> {
  try {
    const results = []
    
    for (const id of ids) {
      const result = await adminDeleteRifa(id)
      results.push({ id, ...result })
      
      if (!result.success) {
        // Si falla una, continuar con las demás pero registrar el error
        console.error(`Error al eliminar rifa ${id}:`, result.error)
      }
    }

    const successCount = results.filter(r => r.success).length
    const errorCount = results.filter(r => !r.success).length

    if (errorCount === 0) {
      return { success: true }
    } else if (successCount > 0) {
      return { 
        success: false, 
        error: `Se eliminaron ${successCount} rifas, pero fallaron ${errorCount}`,
        results 
      }
    } else {
      return { 
        success: false, 
        error: 'No se pudo eliminar ninguna rifa',
        results 
      }
    }

  } catch (error) {
    console.error('Error inesperado al eliminar múltiples rifas:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    }
  }
}

// =====================================================
// 📋 FUNCIONES DE UTILIDAD
// =====================================================

// Obtener estadísticas de rifas
export async function adminGetRifasStats(): Promise<{ success: boolean; data?: any; error?: string }> {
  return safeAdminQuery(
    async () => {
      const { data, error } = await createAdminQuery('rifas')
        .select('estado')

      if (error) throw error

      const estadisticas = {
        total: data.length,
        activas: data.filter((r: any) => r.estado === 'activa').length,
        cerradas: data.filter((r: any) => r.estado === 'cerrada').length,
        finalizadas: data.filter((r: any) => r.estado === 'finalizada').length
      }

      return { data: estadisticas, error: null }
    },
    'Error al obtener estadísticas de rifas'
  )
}

// Obtener rifas por categoría
export async function adminGetRifasByCategoria(categoriaId: string): Promise<{ success: boolean; data?: AdminRifa[]; error?: string }> {
  return safeAdminQuery(
    async () => {
      const result = await createAdminQuery('rifas')
        .select(`
          *,
          categorias_rifas (
            id,
            nombre,
            icono
          )
        `)
        .eq('categoria_id', categoriaId)
        .eq('estado', 'activa')
        .order('fecha_creacion', { ascending: false })

      return { data: result.data || [], error: result.error }
    },
    'Error al obtener rifas por categoría'
  )
}