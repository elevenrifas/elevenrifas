"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Ticket, 
  Gift, 
  Users, 
  DollarSign, 
  TrendingUp, 
  RefreshCw,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Bug
} from 'lucide-react'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { supabase } from '@/lib/database'

interface DashboardStats {
  totalRifas: number
  rifasActivas: number
  rifasFinalizadas: number
  totalTickets: number
  ticketsReservados: number
  ticketsPagados: number
  ticketsVerificados: number
  ticketsCancelados: number
  ingresosEstimados: number
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRifas: 0,
    rifasActivas: 0,
    rifasFinalizadas: 0,
    totalTickets: 0,
    ticketsReservados: 0,
    ticketsPagados: 0,
    ticketsVerificados: 0,
    ticketsCancelados: 0,
    ingresosEstimados: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const { user, profile, loading: authLoading, isAdmin } = useAdminAuth()

  // Función para cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      setWarning(null)
      
      console.log('📊 Cargando datos del dashboard...')
      
      // Verificar qué tablas están disponibles
      console.log('🔍 Verificando tablas disponibles...')
      
      // Cargar rifas
      console.log('🔍 Cargando rifas...')
      const { data: rifas, error: rifasError } = await supabase
        .from('rifas')
        .select('id, titulo, estado, fecha_creacion, fecha_cierre')
      
      if (rifasError) {
        console.error('❌ Error cargando rifas:', rifasError)
        throw new Error(`Error cargando rifas: ${rifasError.message}`)
      }
      
      console.log('✅ Rifas cargadas:', rifas?.length || 0)
      
      // Intentar cargar tickets (pero no fallar si hay error)
      let tickets = null
      let ticketsError = null
      
      try {
        console.log('🔍 Cargando tickets...')
        const ticketsResult = await supabase
          .from('tickets')
          .select('id, estado, precio, rifa_id')
        
        tickets = ticketsResult.data
        ticketsError = ticketsResult.error
        
        if (ticketsError) {
          console.warn('⚠️ Advertencia cargando tickets:', ticketsError.message)
          console.warn('⚠️ Continuando solo con rifas...')
        } else {
          console.log('✅ Tickets cargados:', tickets?.length || 0)
        }
      } catch (ticketError) {
        console.warn('⚠️ Error inesperado cargando tickets:', ticketError)
        console.warn('⚠️ Continuando solo con rifas...')
      }
      
      console.log('✅ Datos cargados:', { rifas: rifas?.length, tickets: tickets?.length })
      
      // Calcular estadísticas
      const rifasActivas = rifas?.filter(r => r.estado === 'activa').length || 0
      const rifasFinalizadas = rifas?.filter(r => r.estado === 'finalizada').length || 0
      
      // Si no hay tickets, usar valores por defecto
      const ticketsReservados = tickets?.filter(t => t.estado === 'reservado').length || 0
      const ticketsPagados = tickets?.filter(t => t.estado === 'pagado').length || 0
      const ticketsVerificados = tickets?.filter(t => t.estado === 'verificado').length || 0
      const ticketsCancelados = tickets?.filter(t => t.estado === 'cancelado').length || 0
      
      const ingresosEstimados = tickets
        ?.filter(t => t.estado === 'pagado' || t.estado === 'verificado')
        .reduce((sum, t) => sum + (t.precio || 0), 0) || 0

      setStats({
        totalRifas: rifas?.length || 0,
        rifasActivas,
        rifasFinalizadas,
        totalTickets: tickets?.length || 0,
        ticketsReservados,
        ticketsPagados,
        ticketsVerificados,
        ticketsCancelados,
        ingresosEstimados
      })
      
      // Si hay problemas con tickets, mostrar advertencia pero no error
      if (ticketsError) {
        setWarning(`Dashboard cargado parcialmente. Advertencia: ${ticketsError.message}`)
      }
      
    } catch (error) {
      console.error('❌ Error cargando dashboard:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos cuando el componente se monta
  useEffect(() => {
    if (!authLoading && isAdmin) {
      loadDashboardData()
    }
  }, [authLoading, isAdmin])

  const handleRefresh = () => {
    loadDashboardData()
  }

  const handleDebug = () => {
    console.log('🔍 DEBUG - Estado de autenticación:', {
      user: user ? { id: user.id, email: user.email } : null,
      profile,
      authLoading,
      isAdmin
    })
    
    // Verificar sesión actual
    supabase.auth.getSession().then(({ data, error }: any) => {
      console.log('🔍 DEBUG - Sesión actual:', { data, error })
    })
  }

  // Mostrar loading mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si no es admin
  if (!isAdmin) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Acceso Denegado
          </h1>
          <p className="text-muted-foreground">
            No tienes permisos de administrador para acceder a esta sección.
          </p>
        </div>
      </div>
    )
  }

  // Mostrar loading mientras se cargan los datos
  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Error al cargar datos
          </h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de rifas
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDebug} variant="outline" size="sm">
            <Bug className="mr-2 h-4 w-4" />
            Debug Auth
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Estado de Autenticación (Debug) */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800">Estado de Autenticación (Debug)</CardTitle>
          <CardDescription className="text-orange-700">
            Información para diagnosticar problemas de autenticación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            <div><strong>Usuario:</strong> {user ? `${user.email} (${user.id})` : 'No autenticado'}</div>
            <div><strong>Perfil:</strong> {profile ? `${profile.role} - ${profile.email}` : 'No encontrado'}</div>
            <div><strong>Es Admin:</strong> {isAdmin ? 'Sí' : 'No'}</div>
            <div><strong>Loading Auth:</strong> {authLoading ? 'Sí' : 'No'}</div>
            <div><strong>Loading Data:</strong> {isLoading ? 'Sí' : 'No'}</div>
          </div>
        </CardContent>
      </Card>

      {/* Advertencia si hay problemas con tickets */}
      {warning && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ Advertencia</CardTitle>
            <CardDescription className="text-yellow-700">
              El dashboard se cargó parcialmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700">{warning}</p>
            <p className="text-yellow-600 text-sm mt-2">
              Solo se muestran las estadísticas de rifas. Los datos de tickets no están disponibles.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rifas</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRifas}</div>
            <p className="text-xs text-muted-foreground">
              {stats.rifasActivas} activas, {stats.rifasFinalizadas} finalizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              {stats.ticketsPagados + stats.ticketsVerificados} vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats.ingresosEstimados.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimado de tickets pagados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.rifasActivas > 0 ? 'Activo' : 'Inactivo'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.rifasActivas} rifas en curso
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Estado de Tickets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservados</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.ticketsReservados}
            </div>
            <Badge variant="secondary" className="mt-2">
              Pendientes de pago
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pagados</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.ticketsPagados}
            </div>
            <Badge variant="secondary" className="mt-2">
              Pago confirmado
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificados</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.ticketsVerificados}
            </div>
            <Badge variant="secondary" className="mt-2">
              Entregados
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelados</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.ticketsCancelados}
            </div>
            <Badge variant="destructive" className="mt-2">
              No válidos
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
          <CardDescription>
            Accede rápidamente a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Gift className="h-4 w-4" />
              Nueva Rifa
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Nuevo Ticket
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestionar Usuarios
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ver Calendario
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


