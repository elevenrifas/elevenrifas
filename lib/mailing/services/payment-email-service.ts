// =====================================================
// 📧 SERVICIO DE EMAILS DE PAGO - ELEVEN RIFAS
// =====================================================
// Servicio específico para emails relacionados con pagos
// =====================================================

import { resendEmailService } from './resend-service'
import { EmailRecipient } from '../types'
import { defaultResendSender, resendSupportEmail } from '../config/resend'

export interface PaymentEmailData {
  userName: string
  userEmail: string
  rifaName: string
  prize: string
  drawDate: string
  ticketCount: number
  ticketNumbers: string
  totalAmount: number
  paymentMethod: string
  paymentReference: string
  reportDate: string
  verificationDate?: string
  ticketUrl: string
}

export class PaymentEmailService {
  /**
   * Envía email de confirmación cuando se reporta un pago
   */
  async sendPaymentReportedEmail(
    to: EmailRecipient,
    data: PaymentEmailData
  ) {
    const templateData = {
      ...data,
      companyName: 'Eleven Rifas',
      companyAddress: 'Venezuela',
      companyUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com',
      supportEmail: resendSupportEmail,
      // Usar logo PNG existente; fallback al circular si no carga
      logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'}/logoblancorojo.png`,
      fallbackLogoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'}/logo_circular.png`,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'
    }

    // Generar contenido del email directamente
    const subject = `✅ Pago Reportado - ${templateData.rifaName} - Eleven Rifas`
    const html = this.generatePaymentReportedHTML(templateData)
    const text = this.generatePaymentReportedText(templateData)

    return await resendEmailService.sendEmail(to, {
      subject,
      html,
      text
    })
  }

  /**
   * Envía email de confirmación cuando se verifica un pago
   */
  async sendPaymentVerifiedEmail(
    to: EmailRecipient,
    data: PaymentEmailData
  ) {
    const templateData = {
      ...data,
      companyName: 'Eleven Rifas',
      companyAddress: 'Venezuela',
      companyUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com',
      supportEmail: resendSupportEmail,
      logoUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'}/logo_circular.png`,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'
    }

    // Generar contenido del email directamente
    const subject = `✅ Pago Verificado - ${templateData.rifaName} - Eleven Rifas`
    const html = this.generatePaymentVerifiedHTML(templateData)
    const text = this.generatePaymentVerifiedText(templateData)

    return await resendEmailService.sendEmail(to, {
      subject,
      html,
      text
    })
  }

  /**
   * Genera HTML para email de pago reportado
   */
  private generatePaymentReportedHTML(data: any): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pago Reportado - ${data.rifaName}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f8fafc; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 40px 30px; border-radius: 12px 12px 0 0; }
          .content { background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .success-badge { background: #f0fdf4; border: 2px solid #10b981; color: #059669; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
          .info-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .ticket-section { background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .ticket-numbers { font-family: 'Courier New', monospace; font-size: 18px; font-weight: bold; color: #dc2626; text-align: center; letter-spacing: 2px; margin: 15px 0; }
          .payment-details { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
          .detail-item { background: #f1f5f9; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; }
          .detail-label { font-weight: bold; color: #374151; font-size: 14px; }
          .detail-value { color: #1f2937; font-size: 16px; margin-top: 5px; }
          .verification-notice { background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 20px; margin: 20px 0; }
          .verification-notice h3 { color: #1e40af; margin: 0 0 10px 0; font-size: 18px; }
          .verification-notice p { color: #1e40af; margin: 5px 0; }
          .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
          .ticket-count { font-size: 24px; font-weight: bold; color: #dc2626; }
          .amount { font-size: 20px; font-weight: bold; color: #059669; }
          @media (max-width: 600px) {
            .payment-details { grid-template-columns: 1fr; }
            .container { padding: 10px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 ¡Pago Reportado!</h1>
            <p style="font-size: 18px; margin: 10px 0 0 0;">Tu participación ha sido registrada exitosamente</p>
          </div>
          
          <div class="content">
            <p>Hola <strong>${data.userName}</strong>,</p>
            <p>¡Excelente! Has reportado tu pago para la rifa <strong>${data.rifaName}</strong> y tu participación ha sido registrada correctamente.</p>
            
            <div class="success-badge">
              <h3 style="margin: 0 0 10px 0; font-size: 20px;">✅ Pago Reportado Exitosamente</h3>
              <p style="margin: 0; font-size: 16px;">Tu pago está siendo procesado por nuestro equipo</p>
            </div>
            
            <!-- Información de la Rifa -->
            <div class="info-card">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">🎯 Información de la Rifa</h3>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Rifa:</span>
                <span style="color: #1f2937; font-size: 16px;">${data.rifaName}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Premio:</span>
                <span style="color: #1f2937; font-size: 16px;">${data.prize}</span>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: bold; color: #374151;">Fecha del Sorteo:</span>
                <span style="color: #1f2937; font-size: 16px;">${data.drawDate}</span>
              </div>
            </div>
            
            <!-- Tickets Asignados -->
            <div class="ticket-section">
              <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 18px; text-align: center;">🎫 Tus Tickets</h3>
              <div style="text-align: center; margin-bottom: 15px;">
                <span class="ticket-count">${data.ticketCount} ticket(s)</span>
              </div>
              <div class="ticket-numbers">${data.ticketNumbers}</div>
              <p style="text-align: center; margin: 15px 0 0 0; color: #92400e; font-size: 14px;">
                Estos son tus números de participación en la rifa
              </p>
            </div>
            
            <!-- Detalles del Pago -->
            <div class="info-card">
              <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px;">💳 Detalles del Pago</h3>
              <div class="payment-details">
                <div class="detail-item">
                  <div class="detail-label">Monto Total</div>
                  <div class="detail-value amount">$${data.totalAmount} USD</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Método de Pago</div>
                  <div class="detail-value">${data.paymentMethod}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Referencia</div>
                  <div class="detail-value">${data.paymentReference}</div>
                </div>
                <div class="detail-item">
                  <div class="detail-label">Fecha de Reporte</div>
                  <div class="detail-value">${data.reportDate}</div>
                </div>
              </div>
            </div>
            
            <!-- Estado de Verificación -->
            <div class="verification-notice">
              <h3>⏳ Estado: Pendiente de Verificación</h3>
              <p><strong>📧 Recibirás tus tickets por correo electrónico</strong> una vez que tu pago haya sido verificado por nuestro equipo.</p>
              <p><strong>⏱️ Tiempo estimado:</strong> El proceso de verificación puede tomar entre 24-48 horas.</p>
              <p><strong>📧 Correo de notificación:</strong> ${data.userEmail}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${data.ticketUrl}" class="button">Ver Mis Tickets</a>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px;">
              Si tienes alguna pregunta, no dudes en contactarnos en 
              <a href="mailto:${data.supportEmail}" style="color: #dc2626;">${data.supportEmail}</a>
            </p>
          </div>
          
          <div class="footer">
            <p><strong>${data.companyName}</strong></p>
            <p>${data.companyAddress}</p>
            <p><a href="${data.companyUrl}" style="color: #dc2626;">${data.companyUrl}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Genera texto para email de pago reportado
   */
  private generatePaymentReportedText(data: any): string {
    return `
🎉 ¡Pago Reportado! - ${data.rifaName}

Hola ${data.userName},

¡Excelente! Has reportado tu pago para la rifa ${data.rifaName} y tu participación ha sido registrada correctamente.

✅ PAGO REPORTADO EXITOSAMENTE
Tu pago está siendo procesado por nuestro equipo

🎯 INFORMACIÓN DE LA RIFA
Rifa: ${data.rifaName}
Premio: ${data.prize}
Fecha del Sorteo: ${data.drawDate}

🎫 TUS TICKETS
${data.ticketCount} ticket(s)
${data.ticketNumbers}

Estos son tus números de participación en la rifa

💳 DETALLES DEL PAGO
Monto Total: $${data.totalAmount} USD
Método de Pago: ${data.paymentMethod}
Referencia: ${data.paymentReference}
Fecha de Reporte: ${data.reportDate}

⏳ ESTADO: PENDIENTE DE VERIFICACIÓN
📧 Recibirás tus tickets por correo electrónico una vez que tu pago haya sido verificado por nuestro equipo.
⏱️ Tiempo estimado: El proceso de verificación puede tomar entre 24-48 horas.
📧 Correo de notificación: ${data.userEmail}

Ver mis tickets: ${data.ticketUrl}

Si tienes alguna pregunta, no dudes en contactarnos en ${data.supportEmail}

${data.companyName}
${data.companyAddress}
${data.companyUrl}
    `
  }

  /**
   * Genera HTML para email de pago verificado
   */
  private generatePaymentVerifiedHTML(data: any): string {
    const amountFormatted = (data as any).amountFormatted || `$${data.totalAmount} USD`
    const fallbackLogo = data.fallbackLogoUrl || 'https://elevenrifas.com/logo_circular.png'
    const ticketPills = this.generateTicketPills(data.ticketNumbers)
    
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pago Verificado - ${data.rifaName}</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; margin: 0; padding: 20px; background-color: #f5f5f5; }
    * { box-sizing: border-box; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .container { max-width: 600px; margin: 0 auto; }
    .card { background: #000000 !important; color: #ffffff !important; border-radius: 12px; padding: 30px; border: 2px solid #e11d2a; }
    .logo { max-width: 200px; height: auto; display: block; margin: 0 auto 20px auto; }
    .title { text-align: center; font-size: 28px; font-weight: bold; color: #e11d2a; margin-bottom: 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .tickets-section { margin: 25px 0; }
    .tickets-title { font-size: 18px; font-weight: bold; color: #e11d2a; margin-bottom: 10px; }
    .ticket-count { font-size: 20px; font-weight: bold; color: #e11d2a; text-align: center; margin: 10px 0; }
    .ticket-numbers { text-align: center; margin: 15px 0; }
    .ticket-pill { font-family: 'Courier New', monospace; font-size: 16px; color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; }
    .payment-details { margin-top: 25px; }
    .details-title { font-size: 18px; font-weight: bold; color: #e11d2a; margin-bottom: 15px; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #333; }
    .detail-label { color: #cccccc; font-weight: 600; font-size: 15px; }
    .detail-value { color: #ffffff; font-weight: 600; font-size: 15px; }
    .amount { color: #e11d2a; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999999; }
    .footer a { color: #e11d2a; text-decoration: none; }
    @media (max-width: 600px) { 
      .container { padding: 10px; } 
      .card { padding: 20px; background: #000000 !important; color: #ffffff !important; }
      .detail-row { flex-direction: column; gap: 5px; }
      .ticket-pill { margin: 3px 4px; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="card" style="background-color: #000000 !important; color: #ffffff !important; border: 2px solid #e11d2a !important;">
      <img src="https://eleven-rifas-master.vercel.app/logoblancorojo.png" alt="Eleven Rifas" class="logo" onerror="this.onerror=null;this.src='${fallbackLogo}';" />
      
      <h1 class="title" style="color: #e11d2a !important;">Pago Verificado</h1>
      
      <p class="greeting" style="color: #ffffff !important;">Hola <strong style="color: #ffffff !important;">${data.userName}</strong>, tu pago para la rifa <strong style="color: #ffffff !important;">${data.rifaName}</strong> ha sido verificado exitosamente.</p>
      
      <div class="tickets-section">
        <h3 class="tickets-title" style="color: #e11d2a !important;">🎫 Tickets</h3>
        <div class="ticket-count" style="color: #e11d2a !important;">${data.ticketCount} ticket(s)</div>
        <div class="ticket-numbers">${ticketPills}</div>
      </div>
      
      <div class="payment-details">
        <h3 class="details-title" style="color: #e11d2a !important;">💳 Detalles del Pago</h3>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Rifa:</span>
          <span class="detail-value" style="color: #ffffff !important;">${data.rifaName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Monto:</span>
          <span class="detail-value amount" style="color: #e11d2a !important;">${amountFormatted}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Método:</span>
          <span class="detail-value" style="color: #ffffff !important;">${data.paymentMethod}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Referencia:</span>
          <span class="detail-value" style="color: #ffffff !important;">${data.paymentReference}</span>
        </div>
      </div>
      
      <div class="footer" style="color: #999999 !important;">
        <p>¿Dudas? Escríbenos a <a href="mailto:${data.supportEmail}" style="color: #e11d2a !important;">${data.supportEmail}</a></p>
        <p><strong style="color: #ffffff !important;">${data.companyName}</strong> · ${data.companyAddress}</p>
      </div>
    </div>
  </div>
</body>
</html>`
  }

  /**
   * Genera píldoras individuales para cada número de ticket
   */
  private generateTicketPills(ticketNumbers: string): string {
    if (!ticketNumbers) return ''
    
    const numbers = ticketNumbers.split(',').map(num => num.trim())
    return numbers.map(num => `<span class="ticket-pill" style="color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; font-family: 'Courier New', monospace; font-size: 16px;">${num}</span>`).join('')
  }

  /**
   * Genera texto para email de pago verificado
   */
  private generatePaymentVerifiedText(data: any): string {
    return `
🎉 ¡Pago Verificado! - ${data.rifaName}

Hola ${data.userName},

¡Excelente! Tu pago para la rifa ${data.rifaName} ha sido verificado y tus tickets están oficialmente confirmados.

✅ PAGO VERIFICADO EXITOSAMENTE
Tus tickets están oficialmente confirmados

🎫 TUS TICKETS CONFIRMADOS
${data.ticketCount} ticket(s)
${data.ticketNumbers}

¡Estos son tus números oficiales de participación!

💳 RESUMEN DEL PAGO
Rifa: ${data.rifaName}
Monto Total: $${data.totalAmount} USD
Método de Pago: ${data.paymentMethod}
Referencia: ${data.paymentReference}
Fecha de Verificación: ${data.verificationDate}

Ver mis tickets oficiales: ${data.ticketUrl}

Si tienes alguna pregunta, no dudes en contactarnos en ${data.supportEmail}

${data.companyName}
${data.companyAddress}
${data.companyUrl}
    `
  }

  /**
   * Formatea los números de tickets para mostrar
   */
  formatTicketNumbers(tickets: Array<{ numero_ticket: string }>): string {
    if (!tickets || tickets.length === 0) return 'N/A'
    
    const numbers = tickets.map(ticket => ticket.numero_ticket).join(', ')
    return numbers
  }

  /**
   * Formatea el método de pago para mostrar
   */
  formatPaymentMethod(method: string): string {
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
   * Formatea la fecha para mostrar
   */
  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Genera URL para ver tickets
   */
  generateTicketUrl(ticketIds: string[]): string {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://elevenrifas.com'
    const ids = ticketIds.join(',')
    return `${baseUrl}/mis-tickets?ids=${ids}`
  }
}

// Instancia singleton del servicio
export const paymentEmailService = new PaymentEmailService()
