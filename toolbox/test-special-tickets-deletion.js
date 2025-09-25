/**
 * Script de prueba para verificar la eliminación de tickets especiales
 * Verifica que solo se puedan eliminar tickets especiales sin pago asignado
 */

const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usar variables de entorno)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testSpecialTicketsDeletion() {
  console.log('🧪 [TEST] Iniciando pruebas de eliminación de tickets especiales')
  
  try {
    // 1. Obtener algunos tickets para probar
    console.log('\n📋 [TEST] 1. Obteniendo tickets de prueba...')
    const { data: tickets, error: fetchError } = await supabase
      .from('tickets')
      .select('id, numero_ticket, es_ticket_especial, pago_id, nombre, cedula')
      .limit(10)
    
    if (fetchError) {
      console.error('❌ [TEST] Error al obtener tickets:', fetchError)
      return
    }
    
    console.log(`✅ [TEST] Tickets obtenidos: ${tickets.length}`)
    
    // 2. Categorizar tickets
    const ticketsEspeciales = tickets.filter(t => t.es_ticket_especial)
    const ticketsNormales = tickets.filter(t => !t.es_ticket_especial)
    const ticketsConPago = tickets.filter(t => t.pago_id)
    const ticketsSinPago = tickets.filter(t => !t.pago_id)
    
    console.log('\n📊 [TEST] Categorización de tickets:')
    console.log(`   - Tickets especiales: ${ticketsEspeciales.length}`)
    console.log(`   - Tickets normales: ${ticketsNormales.length}`)
    console.log(`   - Tickets con pago: ${ticketsConPago.length}`)
    console.log(`   - Tickets sin pago: ${ticketsSinPago.length}`)
    
    // 3. Identificar tickets que SÍ se pueden eliminar
    const ticketsEliminables = tickets.filter(t => 
      t.es_ticket_especial && !t.pago_id
    )
    
    console.log(`\n🎯 [TEST] Tickets eliminables (especiales sin pago): ${ticketsEliminables.length}`)
    
    if (ticketsEliminables.length > 0) {
      console.log('📝 [TEST] Tickets que se pueden eliminar:')
      ticketsEliminables.forEach(ticket => {
        console.log(`   - #${ticket.numero_ticket} (${ticket.nombre}) - Especial: ${ticket.es_ticket_especial}, Pago: ${ticket.pago_id || 'Ninguno'}`)
      })
    }
    
    // 4. Identificar tickets que NO se pueden eliminar
    const ticketsNoEliminables = tickets.filter(t => 
      !t.es_ticket_especial || t.pago_id
    )
    
    console.log(`\n🚫 [TEST] Tickets NO eliminables: ${ticketsNoEliminables.length}`)
    
    if (ticketsNoEliminables.length > 0) {
      console.log('📝 [TEST] Tickets que NO se pueden eliminar:')
      ticketsNoEliminables.forEach(ticket => {
        const motivos = []
        if (!ticket.es_ticket_especial) motivos.push('No es especial')
        if (ticket.pago_id) motivos.push('Tiene pago asignado')
        
        console.log(`   - #${ticket.numero_ticket} (${ticket.nombre}) - Motivos: ${motivos.join(', ')}`)
      })
    }
    
    // 5. Probar eliminación de un ticket especial sin pago (si existe)
    if (ticketsEliminables.length > 0) {
      const ticketPrueba = ticketsEliminables[0]
      console.log(`\n🧪 [TEST] Probando eliminación de ticket #${ticketPrueba.numero_ticket}...`)
      
      // Importar la función de eliminación
      const { adminDeleteTicket } = require('../lib/database/admin_database/tickets')
      
      try {
        const result = await adminDeleteTicket(ticketPrueba.id)
        
        if (result.success) {
          console.log('✅ [TEST] Ticket eliminado exitosamente')
          
          // Verificar que realmente se eliminó
          const { data: ticketVerificacion, error: verifError } = await supabase
            .from('tickets')
            .select('id')
            .eq('id', ticketPrueba.id)
            .single()
          
          if (verifError && verifError.code === 'PGRST116') {
            console.log('✅ [TEST] Verificación: Ticket eliminado correctamente de la BD')
          } else {
            console.log('⚠️ [TEST] Verificación: Ticket aún existe en la BD')
          }
        } else {
          console.log('❌ [TEST] Error al eliminar ticket:', result.error)
        }
      } catch (error) {
        console.log('❌ [TEST] Error inesperado:', error.message)
      }
    } else {
      console.log('\n⚠️ [TEST] No hay tickets especiales sin pago para probar eliminación')
    }
    
    // 6. Probar eliminación de un ticket normal (debería fallar)
    if (ticketsNormales.length > 0) {
      const ticketNormal = ticketsNormales[0]
      console.log(`\n🧪 [TEST] Probando eliminación de ticket normal #${ticketNormal.numero_ticket} (debería fallar)...`)
      
      try {
        const { adminDeleteTicket } = require('../lib/database/admin_database/tickets')
        const result = await adminDeleteTicket(ticketNormal.id)
        
        if (result.success) {
          console.log('❌ [TEST] ERROR: Se eliminó un ticket normal (no debería pasar)')
        } else {
          console.log('✅ [TEST] Correcto: No se pudo eliminar ticket normal:', result.error)
        }
      } catch (error) {
        console.log('✅ [TEST] Correcto: Error al intentar eliminar ticket normal:', error.message)
      }
    }
    
    console.log('\n🎉 [TEST] Pruebas completadas')
    
  } catch (error) {
    console.error('💥 [TEST] Error inesperado:', error)
  }
}

// Ejecutar las pruebas
if (require.main === module) {
  testSpecialTicketsDeletion()
    .then(() => {
      console.log('\n✅ [TEST] Todas las pruebas finalizadas')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 [TEST] Error en las pruebas:', error)
      process.exit(1)
    })
}

module.exports = { testSpecialTicketsDeletion }





