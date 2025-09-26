import { 
  adminSupabase, 
  createAdminQuery, 
  safeAdminQuery 
} from '@/lib/database'
import { adminGetRifasStats } from './rifas'
import { adminGetTicketStats } from './tickets'
import { adminGetClienteStats } from './clientes'

// =====================================================
// 📊 FUNCIONES DASHBOARD ADMIN - ELEVEN RIFAS
// =====================================================
// Funciones centralizadas para obtener estadísticas del dashboard
// Usa las funciones optimizadas existentes
// =====================================================

export interface DashboardStats {
  // Rifas
  totalRifas: number
  rifasActivas: number
  rifasPausadas: number
  rifasFinalizadas: number
  
  // Tickets
  totalTickets: number
  ticketsReservados: number
  ticketsPagados: number
  ticketsVerificados: number
  ticketsCancelados: number
  
  // Clientes
  totalClientes: number
  
  // Ingresos
  ingresosEstimados: number
  ingresosVerificados: number
  
  // Estado general
  sistemaActivo: boolean
}

/**
 * Obtener estadísticas completas del dashboard
 * Usa las funciones optimizadas existentes
 */
export async function adminGetDashboardStats(): Promise<{ 
  success: boolean; 
  data?: DashboardStats; 
  error?: string 
}> {
  return safeAdminQuery(
    async () => {
      console.log('📊 [adminGetDashboardStats] Iniciando carga de estadísticas...')
      
      // 1. Obtener estadísticas de rifas
      console.log('📊 [adminGetDashboardStats] Cargando estadísticas de rifas...')
      const rifasResult = await adminGetRifasStats()
      if (!rifasResult.success) {
        throw new Error(`Error al cargar rifas: ${rifasResult.error}`)
      }
      
      // 2. Obtener estadísticas de tickets usando función RPC optimizada
      console.log('📊 [adminGetDashboardStats] Cargando estadísticas de tickets...')
      const ticketsResult = await getTicketsStatsOptimized()
      if (!ticketsResult.success) {
        throw new Error(`Error al cargar tickets: ${ticketsResult.error}`)
      }
      
      // 3. Obtener estadísticas de clientes
      console.log('📊 [adminGetDashboardStats] Cargando estadísticas de clientes...')
      const clientesResult = await adminGetClienteStats()
      if (!clientesResult.success) {
        throw new Error(`Error al cargar clientes: ${clientesResult.error}`)
      }
      
      // 4. Obtener estadísticas de ingresos
      console.log('📊 [adminGetDashboardStats] Cargando estadísticas de ingresos...')
      const ingresosResult = await getIngresosStats()
      if (!ingresosResult.success) {
        throw new Error(`Error al cargar ingresos: ${ingresosResult.error}`)
      }
      
      // Combinar todas las estadísticas
      const stats: DashboardStats = {
        // Rifas
        totalRifas: rifasResult.data?.total || 0,
        rifasActivas: rifasResult.data?.activas || 0,
        rifasPausadas: rifasResult.data?.pausadas || 0,
        rifasFinalizadas: rifasResult.data?.finalizadas || 0,
        
        // Tickets
        totalTickets: ticketsResult.data?.total || 0,
        ticketsReservados: ticketsResult.data?.reservados || 0,
        ticketsPagados: ticketsResult.data?.pagados || 0,
        ticketsVerificados: ticketsResult.data?.verificados || 0,
        ticketsCancelados: ticketsResult.data?.cancelados || 0,
        
        // Clientes
        totalClientes: clientesResult.data?.total_clientes || 0,
        
        // Ingresos
        ingresosEstimados: ingresosResult.data?.estimados || 0,
        ingresosVerificados: ingresosResult.data?.verificados || 0,
        
        // Estado general
        sistemaActivo: (rifasResult.data?.activas || 0) > 0
      }
      
      console.log('📊 [adminGetDashboardStats] Estadísticas calculadas:', stats)
      
      return { data: stats, error: null }
    },
    'Error al obtener estadísticas del dashboard'
  )
}

/**
 * Obtener estadísticas de tickets optimizadas
 * Usa la función RPC get_rifas_full para datos precisos
 */
async function getTicketsStatsOptimized(): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string 
}> {
  return safeAdminQuery(
    async () => {
      console.log('🎫 [getTicketsStatsOptimized] Obteniendo estadísticas de tickets...')
      
      // Usar la función RPC get_rifas_full para obtener datos precisos
      const { data: rifasData, error: rifasError } = await adminSupabase.rpc('get_rifas_full')
      
      if (rifasError) {
        console.error('❌ [getTicketsStatsOptimized] Error en RPC get_rifas_full:', rifasError)
        throw rifasError
      }
      
      if (!rifasData || !Array.isArray(rifasData)) {
        throw new Error('Datos inválidos del RPC get_rifas_full')
      }
      
      // Calcular estadísticas agregadas
      const totalTickets = rifasData.reduce((sum, rifa) => sum + (rifa.total_tickets || 0), 0)
      const ticketsVendidos = rifasData.reduce((sum, rifa) => sum + (rifa.vendidos || 0), 0)
      const ticketsReservados = rifasData.reduce((sum, rifa) => sum + (rifa.reservas_activas || 0), 0)
      const ticketsDisponibles = rifasData.reduce((sum, rifa) => sum + (rifa.disponibles || 0), 0)
      
      // Obtener estadísticas de pagos para estados precisos
      const { data: pagosData, error: pagosError } = await createAdminQuery('pagos')
        .select('estado')
        .limit(10000)
      
      if (pagosError) {
        console.warn('⚠️ [getTicketsStatsOptimized] Error al cargar pagos, usando datos de rifas:', pagosError.message)
      }
      
      // Calcular estados de tickets basados en pagos
      const ticketsPagados = pagosData?.filter(p => p.estado === 'pendiente').length || 0
      const ticketsVerificados = pagosData?.filter(p => p.estado === 'verificado').length || 0
      const ticketsCancelados = pagosData?.filter(p => p.estado === 'rechazado').length || 0
      
      const stats = {
        total: totalTickets,
        vendidos: ticketsVendidos,
        reservados: ticketsReservados,
        disponibles: ticketsDisponibles,
        pagados: ticketsPagados,
        verificados: ticketsVerificados,
        cancelados: ticketsCancelados
      }
      
      console.log('🎫 [getTicketsStatsOptimized] Estadísticas de tickets:', stats)
      
      return { data: stats, error: null }
    },
    'Error al obtener estadísticas de tickets'
  )
}

/**
 * Obtener estadísticas de ingresos
 * Calcula ingresos reales basados en pagos verificados
 */
async function getIngresosStats(): Promise<{ 
  success: boolean; 
  data?: any; 
  error?: string 
}> {
  return safeAdminQuery(
    async () => {
      console.log('💰 [getIngresosStats] Obteniendo estadísticas de ingresos...')
      
      // Obtener pagos verificados y pendientes
      const { data: pagosData, error: pagosError } = await createAdminQuery('pagos')
        .select('monto_usd, monto_bs, estado, tasa_cambio')
        .in('estado', ['verificado', 'pendiente'])
        .limit(10000)
      
      if (pagosError) {
        throw pagosError
      }
      
      if (!pagosData || pagosData.length === 0) {
        return { 
          data: { 
            estimados: 0, 
            verificados: 0 
          }, 
          error: null 
        }
      }
      
      // Calcular ingresos
      const ingresosEstimados = pagosData.reduce((sum, pago) => {
        return sum + (pago.monto_usd || 0)
      }, 0)
      
      const ingresosVerificados = pagosData
        .filter(pago => pago.estado === 'verificado')
        .reduce((sum, pago) => {
          return sum + (pago.monto_usd || 0)
        }, 0)
      
      const stats = {
        estimados: ingresosEstimados,
        verificados: ingresosVerificados,
        total_pagos: pagosData.length,
        pagos_verificados: pagosData.filter(p => p.estado === 'verificado').length
      }
      
      console.log('💰 [getIngresosStats] Estadísticas de ingresos:', stats)
      
      return { data: stats, error: null }
    },
    'Error al obtener estadísticas de ingresos'
  )
}

/**
 * Obtener estadísticas rápidas del dashboard
 * Versión ligera para carga rápida
 */
export async function adminGetDashboardStatsQuick(): Promise<{ 
  success: boolean; 
  data?: Partial<DashboardStats>; 
  error?: string 
}> {
  return safeAdminQuery(
    async () => {
      console.log('⚡ [adminGetDashboardStatsQuick] Cargando estadísticas rápidas...')
      
      // Solo cargar datos esenciales
      const [rifasResult, clientesResult] = await Promise.all([
        adminGetRifasStats(),
        adminGetClienteStats()
      ])
      
      if (!rifasResult.success) {
        throw new Error(`Error al cargar rifas: ${rifasResult.error}`)
      }
      
      if (!clientesResult.success) {
        throw new Error(`Error al cargar clientes: ${clientesResult.error}`)
      }
      
      const stats = {
        totalRifas: rifasResult.data?.total || 0,
        rifasActivas: rifasResult.data?.activas || 0,
        totalClientes: clientesResult.data?.total_clientes || 0,
        sistemaActivo: (rifasResult.data?.activas || 0) > 0
      }
      
      console.log('⚡ [adminGetDashboardStatsQuick] Estadísticas rápidas:', stats)
      
      return { data: stats, error: null }
    },
    'Error al obtener estadísticas rápidas del dashboard'
  )
}





