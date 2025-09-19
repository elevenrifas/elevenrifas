// =====================================================
// 📧 INTEGRACIÓN DE VERIFICACIÓN DE PAGOS - ELEVEN RIFAS
// =====================================================
// Servicio para integrar el envío de emails con la verificación de pagos
// =====================================================

import { paymentEmailService } from './payment-email-service'
import { EmailRecipient } from '../types'
import type { AdminPago } from '@/lib/database/admin_database/pagos'

export interface PaymentVerificationData {
  pago: AdminPago
  tickets: Array<{
    numero_ticket: string
    nombre: string
    cedula: string
    telefono: string
    correo: string
    es_ticket_especial?: boolean
  }>
  rifa: {
    id: string
    titulo: string
    precio_ticket: number
    premio?: string
    fecha_sorteo?: string
  }
}

export class PaymentVerificationIntegration {
  /**
   * Envía email de confirmación después de verificar un pago
   */
  async sendVerificationEmail(data: PaymentVerificationData) {
    try {
      console.log('📧 Iniciando envío de email de verificación...', {
        pago_id: data.pago.id,
        tickets_count: data.tickets.length,
        rifa: data.rifa.titulo
      })

      // Obtener datos del cliente del primer ticket
      const primerTicket = data.tickets[0]
      if (!primerTicket) {
        throw new Error('No hay tickets asociados al pago')
      }

      // Formatear datos para el email
      const emailData = this.formatEmailData(data, primerTicket)
      
      // Enviar email
      const result = await paymentEmailService.sendPaymentVerifiedEmail(
        { 
          email: primerTicket.correo, 
          name: primerTicket.nombre 
        },
        emailData
      )

      console.log('✅ Email de verificación enviado exitosamente', {
        pago_id: data.pago.id,
        email: primerTicket.correo,
        message_id: result.id
      })

      return {
        success: true,
        message_id: result.id,
        email: primerTicket.correo
      }

    } catch (error) {
      console.error('❌ Error enviando email de verificación:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Formatea los datos del pago para el email
   */
  private formatEmailData(data: PaymentVerificationData, primerTicket: any) {
    const { pago, tickets, rifa } = data

    // Formatear números de tickets
    const ticketNumbers = tickets
      .map(t => t.numero_ticket)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .join(', ')

    // Formatear método de pago
    const paymentMethod = this.formatPaymentMethod(pago.tipo_pago)

    // Formatear fechas
    const verificationDate = new Date().toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })

    const drawDate = rifa.fecha_sorteo 
      ? new Date(rifa.fecha_sorteo).toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'Por definir'

    // Generar URL de tickets
    const ticketIds = tickets.map(t => t.numero_ticket).join(',')
    const ticketUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'}/mis-tickets?ids=${ticketIds}`

    return {
      userName: primerTicket.nombre,
      userEmail: primerTicket.correo,
      rifaName: rifa.titulo,
      prize: rifa.premio || 'Premio especial',
      drawDate: drawDate,
      ticketCount: tickets.length,
      ticketNumbers: ticketNumbers,
      totalAmount: pago.monto_usd,
      paymentMethod: paymentMethod,
      paymentReference: pago.referencia || 'N/A',
      verificationDate: verificationDate,
      ticketUrl: ticketUrl
    }
  }

  /**
   * Formatea el método de pago para mostrar
   */
  private formatPaymentMethod(method: string): string {
    const methods: Record<string, string> = {
      'pago_movil': 'Pago Móvil',
      'binance': 'Binance',
      'zelle': 'Zelle',
      'zinli': 'Zinli',
      'paypal': 'PayPal',
      'efectivo': 'Efectivo',
      'transferencia': 'Transferencia Bancaria'
    }
    
    return methods[method] || method
  }

  /**
   * Verifica si un pago tiene todos los datos necesarios para enviar email
   */
  validatePaymentData(data: PaymentVerificationData): { valid: boolean; error?: string } {
    if (!data.pago) {
      return { valid: false, error: 'No hay datos del pago' }
    }

    if (!data.tickets || data.tickets.length === 0) {
      return { valid: false, error: 'No hay tickets asociados al pago' }
    }

    const primerTicket = data.tickets[0]
    if (!primerTicket.correo) {
      return { valid: false, error: 'No hay email del cliente' }
    }

    if (!primerTicket.nombre) {
      return { valid: false, error: 'No hay nombre del cliente' }
    }

    if (!data.rifa) {
      return { valid: false, error: 'No hay datos de la rifa' }
    }

    return { valid: true }
  }
}

// Instancia singleton del servicio
export const paymentVerificationIntegration = new PaymentVerificationIntegration()

