// =====================================================
// 📧 SERVICIO DE EMAIL CON RESEND - ELEVEN RIFAS
// =====================================================
// Servicio para el envío de emails usando Resend
// =====================================================

import { getResend, defaultResendSender } from '../config/resend'
import { EmailRecipient, EmailContent } from '../types'
import { emailLogger } from '../utils/email-logger'

export const resendEmailService = {
  async sendEmail(
    to: EmailRecipient | EmailRecipient[],
    content: EmailContent,
    from?: { email: string; name?: string }
  ) {
    const recipients = Array.isArray(to) ? to : [to]
    const fromSender = from || defaultResendSender

    try {
      const resend = await getResend()

      const response = await resend.emails.send({
        from: `${fromSender.name} <${fromSender.email}>`,
        to: recipients.map(r => `${r.name ? r.name + ' ' : ''}<${r.email}>`),
        subject: content.subject,
        html: content.html,
        text: content.text,
      })

      if (response.data) {
        emailLogger.info(`Email enviado exitosamente a ${recipients.map(r => r.email).join(', ')}. ID: ${response.data.id}`)
        return { success: true, id: response.data.id, data: response.data }
      } else {
        emailLogger.error(`Error enviando email: ${response.error?.message}`, response.error)
        return { success: false, error: response.error?.message || 'Error desconocido', details: response.error }
      }
    } catch (error: any) {
      emailLogger.error(`Excepción al enviar email con Resend: ${error.message}`, error)
      return { success: false, error: error.message || 'Excepción desconocida', details: error }
    }
  },

  async sendTestEmail(recipient: EmailRecipient, subject: string = '¡Email de Prueba de Resend!') {
    const testContent: EmailContent = {
      subject: subject,
      html: `<h1>Hola ${recipient.name || 'Usuario'}!</h1><p>Este es un email de prueba enviado desde Resend.</p><p>¡Tu sistema de mailing está funcionando!</p>`,
      text: `Hola ${recipient.name || 'Usuario'}! Este es un email de prueba enviado desde Resend. ¡Tu sistema de mailing está funcionando!`,
    }
    return this.sendEmail(recipient, testContent)
  }
}