// =====================================================
// 📧 SERVICIO DE MAILING - ELEVEN RIFAS
// =====================================================
// Servicio de alto nivel que combina email y templates
// =====================================================

import { emailService } from './email-service'
import { templateService } from './template-service'
import { 
  EmailMessage, 
  EmailSendResult, 
  EmailRecipient,
  WelcomeEmailData,
  PaymentConfirmationData,
  TicketEmailData,
  VerificationEmailData,
  AdminNotificationData,
  BulkEmailConfig,
  BulkEmailResult
} from '../types'

export class MailingService {
  /**
   * Envía email de bienvenida
   */
  async sendWelcomeEmail(
    to: EmailRecipient, 
    data: WelcomeEmailData
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate('welcome', data)
    if (!template) {
      return {
        success: false,
        error: 'Template de bienvenida no encontrado'
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        tags: ['welcome', 'user-registration']
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía confirmación de pago
   */
  async sendPaymentConfirmation(
    to: EmailRecipient, 
    data: PaymentConfirmationData
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate('payment-confirmation', data)
    if (!template) {
      return {
        success: false,
        error: 'Template de confirmación de pago no encontrado'
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        tags: ['payment', 'confirmation', 'ticket']
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía ticket de rifa
   */
  async sendTicketEmail(
    to: EmailRecipient, 
    data: TicketEmailData
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate('ticket', data)
    if (!template) {
      return {
        success: false,
        error: 'Template de ticket no encontrado'
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        tags: ['ticket', 'rifa', 'participation']
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía email de verificación
   */
  async sendVerificationEmail(
    to: EmailRecipient, 
    data: VerificationEmailData
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate('verification', data)
    if (!template) {
      return {
        success: false,
        error: 'Template de verificación no encontrado'
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        tags: ['verification', 'email-confirmation']
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía notificación administrativa
   */
  async sendAdminNotification(
    to: EmailRecipient, 
    data: AdminNotificationData
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate('admin-notification', data)
    if (!template) {
      return {
        success: false,
        error: 'Template de notificación admin no encontrado'
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        tags: ['admin', 'notification', data.priority]
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía email personalizado con template
   */
  async sendCustomEmail(
    to: EmailRecipient | EmailRecipient[],
    templateId: string,
    data: Record<string, any>,
    config?: {
      from?: { email: string; name?: string }
      replyTo?: { email: string; name?: string }
      cc?: EmailRecipient[]
      bcc?: EmailRecipient[]
      tags?: string[]
    }
  ): Promise<EmailSendResult> {
    const template = templateService.renderTemplate(templateId, data)
    if (!template) {
      return {
        success: false,
        error: `Template '${templateId}' no encontrado`
      }
    }

    const emailMessage: EmailMessage = {
      to,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        from: config?.from,
        replyTo: config?.replyTo,
        cc: config?.cc,
        bcc: config?.bcc,
        tags: config?.tags
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Envía email masivo con template
   */
  async sendBulkEmail(
    recipients: EmailRecipient[],
    templateId: string,
    data: Record<string, any>,
    config?: {
      from?: { email: string; name?: string }
      replyTo?: { email: string; name?: string }
      cc?: EmailRecipient[]
      bcc?: EmailRecipient[]
      tags?: string[]
      bulkConfig?: Partial<BulkEmailConfig>
    }
  ): Promise<BulkEmailResult> {
    const template = templateService.renderTemplate(templateId, data)
    if (!template) {
      return {
        totalSent: 0,
        totalFailed: recipients.length,
        errors: recipients.map(recipient => ({
          email: recipient.email,
          error: `Template '${templateId}' no encontrado`
        })),
        success: false
      }
    }

    const emailMessages: EmailMessage[] = recipients.map(recipient => ({
      to: recipient,
      content: {
        subject: template.subject,
        html: template.html,
        text: template.text
      },
      config: {
        from: config?.from,
        replyTo: config?.replyTo,
        cc: config?.cc,
        bcc: config?.bcc,
        tags: config?.tags
      }
    }))

    return await emailService.sendBulkEmails(emailMessages, config?.bulkConfig)
  }

  /**
   * Envía email de prueba
   */
  async sendTestEmail(
    to: EmailRecipient,
    subject: string = 'Email de Prueba - Eleven Rifas'
  ): Promise<EmailSendResult> {
    const emailMessage: EmailMessage = {
      to,
      content: {
        subject,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email de Prueba</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
              .content { padding: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Email de Prueba</h1>
                <p>El sistema de mailing está funcionando correctamente</p>
              </div>
              <div class="content">
                <p>Hola,</p>
                <p>Este es un email de prueba para verificar que el sistema de envío de emails está funcionando correctamente.</p>
                <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
                <p><strong>Servidor:</strong> ${process.env.NODE_ENV || 'development'}</p>
                <p>Si recibiste este email, significa que la configuración de MailerSend está correcta.</p>
              </div>
              <div class="footer">
                <p>Eleven Rifas - Sistema de Mailing</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
Email de Prueba - Eleven Rifas

Hola,

Este es un email de prueba para verificar que el sistema de envío de emails está funcionando correctamente.

Fecha y hora: ${new Date().toLocaleString('es-ES')}
Servidor: ${process.env.NODE_ENV || 'development'}

Si recibiste este email, significa que la configuración de MailerSend está correcta.

Eleven Rifas - Sistema de Mailing
        `
      },
      config: {
        tags: ['test', 'system']
      }
    }

    return await emailService.sendEmail(emailMessage)
  }

  /**
   * Obtiene estadísticas de rate limiting
   */
  getRateLimitStats() {
    return emailService.getRateLimitStats()
  }

  /**
   * Limpia contadores de rate limiting
   */
  cleanupRateLimitCounters() {
    emailService.cleanupCounters()
  }

  /**
   * Obtiene todos los templates disponibles
   */
  getAllTemplates() {
    return templateService.getAllTemplates()
  }

  /**
   * Obtiene un template específico
   */
  getTemplate(templateId: string) {
    return templateService.getTemplate(templateId)
  }
}

// Instancia singleton del servicio
export const mailingService = new MailingService()


