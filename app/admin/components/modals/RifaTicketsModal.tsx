"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Ticket, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Eye,
  Search,
  X
} from "lucide-react"
import { adminGetTicketsByRifa } from "@/lib/database/admin_database/tickets"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"

interface RifaTicketsModalProps {
  isOpen: boolean
  onClose: () => void
  rifa: AdminRifa | null
}

// Generar array de todos los números de tickets (0000-9999)
const generateAllTicketNumbers = () => {
  const tickets = []
  for (let i = 0; i <= 9999; i++) {
    tickets.push(i.toString().padStart(4, '0'))
  }
  return tickets
}

// Estados de tickets
type TicketState = 'disponible' | 'reservado' | 'verificado' | 'especial'

export function RifaTicketsModal({
  isOpen,
  onClose,
  rifa
}: RifaTicketsModalProps) {
  const [ticketsReservados, setTicketsReservados] = React.useState<Set<string>>(new Set())
  const [ticketsVerificados, setTicketsVerificados] = React.useState<Set<string>>(new Set())
  const [ticketsEspeciales, setTicketsEspeciales] = React.useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [searchTerm, setSearchTerm] = React.useState("")
  const [filterState, setFilterState] = React.useState<TicketState | 'all'>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const ticketsPerPage = 1000 // 1000 tickets por página
  
  // Generar todos los números de tickets
  const allTickets = React.useMemo(() => generateAllTicketNumbers(), [])
  
  const [stats, setStats] = React.useState({
    total: 10000,
    reservados: 0,
    verificados: 0,
    especiales: 0,
    disponibles: 10000
  })

  const loadTickets = React.useCallback(async () => {
    if (!rifa?.id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🎫 [RifaTicketsModal] Cargando tickets para rifa:', rifa.id)
      const result = await adminGetTicketsByRifa(rifa.id)
      
      if (result.success && result.data) {
        // Separar tickets por estado
        const reservados = new Set<string>()
        const verificados = new Set<string>()
        const especiales = new Set<string>()
        
        result.data.forEach(ticket => {
          const numero = ticket.numero_ticket
          const estadoPago = ticket.pagos?.estado
          const nombre = ticket.nombre
          const cedula = ticket.cedula
          
          console.log(`🎫 [RifaTicketsModal] Ticket ${numero}: estado_pago=${estadoPago}, nombre=${nombre}, cedula=${cedula}`)
          
          // Detectar tickets especiales (creados con adminCreateTicketReservado)
          const isEspecial = nombre === 'TICKET RESERVADO' && cedula === '000000000'
          
          if (isEspecial) {
            especiales.add(numero)
            console.log(`🎫 [RifaTicketsModal] ✅ Ticket ${numero} marcado como ESPECIAL`)
          } else if (ticket.pagos) {
            switch (ticket.pagos.estado) {
              case 'reservado':
              case 'pendiente':
                reservados.add(numero)
                console.log(`🎫 [RifaTicketsModal] ✅ Ticket ${numero} marcado como RESERVADO`)
                break
              case 'verificado':
                verificados.add(numero)
                console.log(`🎫 [RifaTicketsModal] ✅ Ticket ${numero} marcado como VERIFICADO`)
                break
              default:
                // Tickets sin pago o con estado desconocido van a reservados
                reservados.add(numero)
                console.log(`🎫 [RifaTicketsModal] ✅ Ticket ${numero} marcado como RESERVADO (default)`)
            }
          } else {
            // Tickets sin pago van a reservados
            reservados.add(numero)
            console.log(`🎫 [RifaTicketsModal] ✅ Ticket ${numero} marcado como RESERVADO (sin pago)`)
          }
        })
        
        setTicketsReservados(reservados)
        setTicketsVerificados(verificados)
        setTicketsEspeciales(especiales)
        
        // Debug: mostrar los sets
        console.log('🎫 [RifaTicketsModal] Sets finales:')
        console.log('🎫 [RifaTicketsModal] - Reservados:', Array.from(reservados))
        console.log('🎫 [RifaTicketsModal] - Verificados:', Array.from(verificados))
        console.log('🎫 [RifaTicketsModal] - Especiales:', Array.from(especiales))
        
        // Calcular estadísticas
        const totalOcupados = reservados.size + verificados.size + especiales.size
        const disponibles = 10000 - totalOcupados
        
        setStats({
          total: 10000,
          reservados: reservados.size,
          verificados: verificados.size,
          especiales: especiales.size,
          disponibles
        })
        
        console.log('🎫 [RifaTicketsModal] Estadísticas finales:', {
          reservados: reservados.size,
          verificados: verificados.size,
          especiales: especiales.size,
          disponibles
        })
      } else {
        setError(result.error || 'Error al cargar tickets')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error inesperado al cargar tickets'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [rifa?.id])

  React.useEffect(() => {
    if (isOpen && rifa?.id) {
      loadTickets()
    }
  }, [isOpen, rifa?.id, loadTickets])

  // Filtrar tickets según búsqueda y estado
  const filteredTickets = React.useMemo(() => {
    return allTickets.filter(ticket => {
      // Filtro de búsqueda
      const matchesSearch = !searchTerm || ticket.includes(searchTerm)
      
      // Filtro de estado
      let matchesState = true
      if (filterState !== 'all') {
        switch (filterState) {
          case 'disponible':
            matchesState = !ticketsReservados.has(ticket) && 
                          !ticketsVerificados.has(ticket) &&
                          !ticketsEspeciales.has(ticket)
            break
          case 'reservado':
            matchesState = ticketsReservados.has(ticket)
            break
          case 'verificado':
            matchesState = ticketsVerificados.has(ticket)
            break
          case 'especial':
            matchesState = ticketsEspeciales.has(ticket)
            break
        }
      }
      
      return matchesSearch && matchesState
    })
  }, [allTickets, searchTerm, filterState, ticketsReservados, ticketsVerificados, ticketsEspeciales])

  // Paginación
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage)
  const startIndex = (currentPage - 1) * ticketsPerPage
  const endIndex = startIndex + ticketsPerPage
  const currentTickets = filteredTickets.slice(startIndex, endIndex)

  // Función para obtener el estado de un ticket
  const getTicketState = (ticket: string): TicketState => {
    if (ticketsVerificados.has(ticket)) return 'verificado'
    if (ticketsEspeciales.has(ticket)) return 'especial'
    if (ticketsReservados.has(ticket)) return 'reservado'
    return 'disponible'
  }

  // Función para obtener el color de un ticket según su estado
  const getTicketColor = (state: TicketState) => {
    switch (state) {
      case 'disponible':
        return 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
      case 'reservado':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100 hover:border-yellow-300'
      case 'verificado':
        return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300'
      case 'especial':
        return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 hover:border-purple-300'
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200'
    }
  }

  // Función para obtener el icono del estado
  const getStateIcon = (state: TicketState) => {
    switch (state) {
      case 'verificado':
        return <CheckCircle className="h-3 w-3" />
      case 'reservado':
        return <AlertCircle className="h-3 w-3" />
      case 'especial':
        return <Ticket className="h-3 w-3" />
      default:
        return <Eye className="h-3 w-3" />
    }
  }

  if (!isOpen || !rifa) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full h-full max-w-[98vw] max-h-[98vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Ticket className="h-6 w-6 text-primary" />
              Tickets de la Rifa
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {rifa.titulo} - Sistema de 10,000 tickets (0000-9999)
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

         {/* Estadísticas */}
         <div className="p-4 border-b bg-gray-50">
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
             <div className="text-center bg-primary/5 rounded-lg p-3 border border-primary/20">
               <div className="text-xl font-bold text-primary">{stats.total.toLocaleString()}</div>
               <div className="text-xs text-muted-foreground">Total</div>
             </div>
             <div className="text-center bg-green-50 rounded-lg p-3 border border-green-200">
               <div className="text-xl font-bold text-green-600">{stats.verificados}</div>
               <div className="text-xs text-muted-foreground">Verificados</div>
             </div>
             <div className="text-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
               <div className="text-xl font-bold text-yellow-600">{stats.reservados}</div>
               <div className="text-xs text-muted-foreground">Reservados</div>
             </div>
             <div className="text-center bg-purple-50 rounded-lg p-3 border border-purple-200">
               <div className="text-xl font-bold text-purple-600">{stats.especiales}</div>
               <div className="text-xs text-muted-foreground">Especiales</div>
             </div>
             <div className="text-center bg-gray-50 rounded-lg p-3 border border-gray-200">
               <div className="text-xl font-bold text-gray-600">{stats.disponibles.toLocaleString()}</div>
               <div className="text-xs text-muted-foreground">Disponibles</div>
             </div>
           </div>
         </div>

        {/* Controles */}
        <div className="p-4 border-b bg-white">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar ticket (ej: 0001, 1234, 9999)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10"
              />
            </div>
            
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value as TicketState | 'all')}
              className="px-4 py-2 border border-input rounded-md bg-background text-sm h-10 min-w-[150px]"
            >
               <option value="all">Todos los estados</option>
               <option value="disponible">Disponibles</option>
               <option value="reservado">Reservados</option>
               <option value="verificado">Verificados</option>
               <option value="especial">Especiales</option>
            </select>


            <Button
              variant="outline"
              onClick={() => { setSearchTerm(""); setFilterState('all'); setCurrentPage(1) }}
              className="h-10"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>

            <Button
              variant="outline"
              onClick={loadTickets}
              disabled={isLoading}
              className="h-10"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Área de tickets */}
        <div className="flex-1 overflow-auto bg-gray-50 p-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando tickets...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>Error: {error}</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-muted-foreground bg-white rounded-lg p-3 border">
                <span>
                  Mostrando {currentTickets.length.toLocaleString()} de {filteredTickets.length.toLocaleString()} tickets
                  {searchTerm && ` (filtrados por "${searchTerm}")`}
                  {filterState !== 'all' && ` (estado: ${filterState})`}
                </span>
                <span>Página {currentPage} de {totalPages}</span>
              </div>
              
              <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-20 xl:grid-cols-25 gap-2">
                {currentTickets.map((ticket) => {
                  const state = getTicketState(ticket)
                  return (
                    <div
                      key={ticket}
                      className={`border-2 rounded text-xs font-mono text-center p-2 transition-colors cursor-pointer ${getTicketColor(state)}`}
                      title={`Ticket #${ticket} - ${state}`}
                    >
                      {ticket}
                    </div>
                  )
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6 bg-white rounded-lg p-4 border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="w-8 h-8 p-0"
                        >
                          {page}
                        </Button>
                      )
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-white">
          <div className="text-center">
            {stats.disponibles > 0 ? (
              <div className="flex items-center justify-center gap-2 text-green-600 font-medium">
                <CheckCircle className="h-5 w-5" />
                <span>{stats.disponibles.toLocaleString()} tickets disponibles para compra</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 text-primary font-medium">
                <AlertCircle className="h-5 w-5" />
                <span>¡Rifa agotada! Todos los tickets vendidos</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}