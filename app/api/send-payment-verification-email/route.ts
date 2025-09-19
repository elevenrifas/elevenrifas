// =====================================================
// 📧 API ROUTE - ENVÍO DE EMAIL DE VERIFICACIÓN
// =====================================================
// API route para enviar emails de verificación de pagos
// =====================================================

import { NextRequest, NextResponse } from 'next/server'

// Forzar runtime Node.js para asegurar acceso a process.env
export const runtime = 'nodejs'
import { paymentEmailService } from '@/lib/mailing/services/payment-email-service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos requeridos
    if (!body.pago || !body.tickets || !body.rifa) {
      return NextResponse.json(
        { success: false, error: 'Datos incompletos para enviar email' },
        { status: 400 }
      )
    }

    // Obtener datos del primer ticket para el email
    const primerTicket = body.tickets[0]
    if (!primerTicket) {
      return NextResponse.json(
        { success: false, error: 'No hay tickets asociados al pago' },
        { status: 400 }
      )
    }

    // Formatear datos para el email
    const isPagoMovil = (body.pago?.tipo_pago || '').toLowerCase() === 'pago_movil'
    const amountValue = isPagoMovil ? Number(body.pago?.monto_bs || 0) : Number(body.pago?.monto_usd || 0)
    const amountCurrency = isPagoMovil ? 'Bs' : 'USD'
    const amountFormatted = isPagoMovil 
      ? `${amountValue.toLocaleString('es-VE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${amountCurrency}`
      : `$${amountValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${amountCurrency}`

    const emailData = {
      userName: primerTicket.nombre,
      userEmail: primerTicket.correo,
      rifaName: body.rifa.titulo,
      prize: body.rifa.premio || 'Premio especial',
      drawDate: body.rifa.fecha_sorteo || 'Por definir',
      ticketCount: body.tickets.length,
      ticketNumbers: body.tickets
        .map((t: any) => t.numero_ticket)
        .sort((a: string, b: string) => parseInt(a) - parseInt(b))
        .join(', '),
      totalAmount: amountValue, // compat
      amountValue,
      amountCurrency,
      amountFormatted,
      paymentMethod: formatPaymentMethod(body.pago.tipo_pago),
      paymentReference: body.pago.referencia || 'N/A',
      verificationDate: new Date().toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      ticketUrl: generateTicketUrl(body.tickets.map((t: any) => t.numero_ticket))
    }

    // Enviar email
    const result = await paymentEmailService.sendPaymentVerifiedEmail(
      { 
        email: primerTicket.correo, 
        name: primerTicket.nombre 
      },
      emailData
    )

    if (result.success) {
      return NextResponse.json({
        success: true,
        message_id: result.messageId,
        email: primerTicket.correo
      })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('❌ Error en API de envío de email:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * Formatea el método de pago para mostrar
 */
function formatPaymentMethod(method: string): string {
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
 * Genera URL para ver tickets
 */
function generateTicketUrl(ticketIds: string[]): string {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'
  const ids = ticketIds.join(',')
  return `${baseUrl}/mis-tickets?ids=${ids}`
}
