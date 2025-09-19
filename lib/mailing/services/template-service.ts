// =====================================================
// 📧 SERVICIO DE TEMPLATES - ELEVEN RIFAS
// =====================================================
// Servicio para manejo de templates de email
// =====================================================

import { 
  EmailTemplate, 
  EmailTemplateCategory,
  WelcomeEmailData,
  PaymentConfirmationData,
  TicketEmailData,
  VerificationEmailData,
  AdminNotificationData
} from '../types'
import { getEmailBaseUrl, getEmailLogoUrl, getCompanyInfo } from '../config/mailersend'

export class TemplateService {
  private templates: Map<string, EmailTemplate> = new Map()

  constructor() {
    this.initializeTemplates()
  }

  /**
   * Inicializa los templates por defecto
   */
  private initializeTemplates(): void {
    // Template de bienvenida
    this.registerTemplate({
      id: 'welcome',
      name: 'Bienvenida',
      subject: '¡Bienvenido a {{companyName}}!',
      html: this.getWelcomeTemplate(),
      text: this.getWelcomeTextTemplate(),
      variables: ['userName', 'userEmail', 'loginUrl', 'companyName'],
      category: 'welcome'
    })

    // Template de confirmación de pago
    this.registerTemplate({
      id: 'payment-confirmation',
      name: 'Confirmación de Pago',
      subject: 'Confirmación de pago - {{rifaName}}',
      html: this.getPaymentConfirmationTemplate(),
      text: this.getPaymentConfirmationTextTemplate(),
      variables: ['userName', 'rifaName', 'ticketNumbers', 'totalAmount', 'paymentMethod', 'paymentDate', 'ticketUrl', 'companyName'],
      category: 'payment'
    })

    // Template de ticket
    this.registerTemplate({
      id: 'ticket',
      name: 'Ticket de Rifa',
      subject: 'Tu ticket para {{rifaName}}',
      html: this.getTicketTemplate(),
      text: this.getTicketTextTemplate(),
      variables: ['userName', 'rifaName', 'ticketNumbers', 'ticketUrl', 'drawDate', 'prize', 'companyName'],
      category: 'ticket'
    })

    // Template de verificación
    this.registerTemplate({
      id: 'verification',
      name: 'Verificación de Email',
      subject: 'Verifica tu email - {{companyName}}',
      html: this.getVerificationTemplate(),
      text: this.getVerificationTextTemplate(),
      variables: ['userName', 'verificationCode', 'verificationUrl', 'expiresAt', 'companyName'],
      category: 'verification'
    })

    // Template de notificación admin
    this.registerTemplate({
      id: 'admin-notification',
      name: 'Notificación Administrativa',
      subject: '{{notificationType}} - {{companyName}}',
      html: this.getAdminNotificationTemplate(),
      text: this.getAdminNotificationTextTemplate(),
      variables: ['adminName', 'notificationType', 'message', 'actionUrl', 'priority', 'companyName'],
      category: 'admin'
    })
  }

  /**
   * Registra un template
   */
  registerTemplate(template: EmailTemplate): void {
    this.templates.set(template.id, template)
  }

  /**
   * Obtiene un template por ID
   */
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId)
  }

  /**
   * Obtiene todos los templates
   */
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values())
  }

  /**
   * Obtiene templates por categoría
   */
  getTemplatesByCategory(category: EmailTemplateCategory): EmailTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category)
  }

  /**
   * Renderiza un template con datos
   */
  renderTemplate(templateId: string, data: Record<string, any>): { subject: string; html: string; text?: string } | null {
    const template = this.getTemplate(templateId)
    if (!template) {
      return null
    }

    // Agregar datos de la empresa
    const companyInfo = getCompanyInfo()
    const fullData = {
      ...data,
      companyName: companyInfo.name,
      companyUrl: companyInfo.url,
      companyAddress: companyInfo.address,
      supportEmail: companyInfo.support_email,
      logoUrl: getEmailLogoUrl(),
      baseUrl: getEmailBaseUrl()
    }

    // Renderizar subject
    let subject = template.subject
    for (const [key, value] of Object.entries(fullData)) {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    // Renderizar HTML
    let html = template.html
    for (const [key, value] of Object.entries(fullData)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }

    // Renderizar texto (si existe)
    let text = template.text
    if (text) {
      for (const [key, value] of Object.entries(fullData)) {
        text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
      }
    }

    return { subject, html, text }
  }

  /**
   * Template de bienvenida HTML
   */
  private getWelcomeTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a {{companyName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .logo { max-width: 150px; height: auto; }
          .content { padding: 20px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
            <h1>¡Bienvenido a {{companyName}}!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>{{userName}}</strong>,</p>
            <p>¡Gracias por registrarte en {{companyName}}! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
            <p>Ahora puedes:</p>
            <ul>
              <li>Participar en nuestras rifas emocionantes</li>
              <li>Comprar tickets fácilmente</li>
              <li>Seguir el progreso de tus rifas</li>
              <li>Recibir notificaciones sobre sorteos</li>
            </ul>
            <p style="text-align: center;">
              <a href="{{loginUrl}}" class="button">Iniciar Sesión</a>
            </p>
            <p>Si tienes alguna pregunta, no dudes en contactarnos en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
          </div>
          <div class="footer">
            <p>{{companyName}}<br>{{companyAddress}}</p>
            <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Template de bienvenida texto
   */
  private getWelcomeTextTemplate(): string {
    return `
¡Bienvenido a {{companyName}}!

Hola {{userName}},

¡Gracias por registrarte en {{companyName}}! Estamos emocionados de tenerte como parte de nuestra comunidad.

Ahora puedes:
- Participar en nuestras rifas emocionantes
- Comprar tickets fácilmente
- Seguir el progreso de tus rifas
- Recibir notificaciones sobre sorteos

Inicia sesión aquí: {{loginUrl}}

Si tienes alguna pregunta, no dudes en contactarnos en {{supportEmail}}

{{companyName}}
{{companyAddress}}
{{companyUrl}}
    `
  }

  /**
   * Template de confirmación de pago HTML
   */
  private getPaymentConfirmationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmación de Pago - {{rifaName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .logo { max-width: 150px; height: auto; }
          .content { padding: 20px 0; }
          .ticket-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .ticket-numbers { font-family: monospace; font-size: 18px; font-weight: bold; color: #dc2626; }
          .payment-details { background: #f9fafb; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
            <h1>¡Pago Confirmado!</h1>
          </div>
          <div class="content">
            <p>Hola <strong>{{userName}}</strong>,</p>
            <p>Tu pago ha sido confirmado exitosamente. Aquí están los detalles de tu compra:</p>
            
            <div class="ticket-info">
              <h3>Rifa: {{rifaName}}</h3>
              <p><strong>Números de ticket:</strong></p>
              <div class="ticket-numbers">{{ticketNumbers}}</div>
            </div>
            
            <div class="payment-details">
              <h4>Detalles del Pago:</h4>
              <p><strong>Monto total:</strong> ${{totalAmount}}</p>
              <p><strong>Método de pago:</strong> {{paymentMethod}}</p>
              <p><strong>Fecha de pago:</strong> {{paymentDate}}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="{{ticketUrl}}" class="button">Ver Mi Ticket</a>
            </p>
            
            <p>¡Gracias por participar en {{companyName}}! Te deseamos mucha suerte.</p>
          </div>
          <div class="footer">
            <p>{{companyName}}<br>{{companyAddress}}</p>
            <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Template de confirmación de pago texto
   */
  private getPaymentConfirmationTextTemplate(): string {
    return `
¡Pago Confirmado!

Hola {{userName}},

Tu pago ha sido confirmado exitosamente. Aquí están los detalles de tu compra:

Rifa: {{rifaName}}
Números de ticket: {{ticketNumbers}}

Detalles del Pago:
- Monto total: ${{totalAmount}}
- Método de pago: {{paymentMethod}}
- Fecha de pago: {{paymentDate}}

Ver mi ticket: {{ticketUrl}}

¡Gracias por participar en {{companyName}}! Te deseamos mucha suerte.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
    `
  }

  /**
   * Template de ticket HTML
   */
  private getTicketTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tu Ticket - {{rifaName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .logo { max-width: 150px; height: auto; }
          .content { padding: 20px 0; }
          .ticket { background: #fff; border: 2px solid #dc2626; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .ticket-numbers { font-family: monospace; font-size: 24px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
          .prize-info { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 15px 0; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
            <h1>Tu Ticket de Rifa</h1>
          </div>
          <div class="content">
            <p>Hola <strong>{{userName}}</strong>,</p>
            <p>Aquí está tu ticket para la rifa <strong>{{rifaName}}</strong>:</p>
            
            <div class="ticket">
              <h3 style="text-align: center; margin-top: 0;">{{rifaName}}</h3>
              <div class="ticket-numbers">{{ticketNumbers}}</div>
              <p style="text-align: center; margin: 0;"><strong>Fecha del sorteo:</strong> {{drawDate}}</p>
            </div>
            
            <div class="prize-info">
              <h4>🏆 Premio:</h4>
              <p>{{prize}}</p>
            </div>
            
            <p style="text-align: center;">
              <a href="{{ticketUrl}}" class="button">Ver Ticket Completo</a>
            </p>
            
            <p>¡Mucha suerte! Te notificaremos cuando se realice el sorteo.</p>
          </div>
          <div class="footer">
            <p>{{companyName}}<br>{{companyAddress}}</p>
            <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Template de ticket texto
   */
  private getTicketTextTemplate(): string {
    return `
Tu Ticket de Rifa

Hola {{userName}},

Aquí está tu ticket para la rifa {{rifaName}}:

{{rifaName}}
{{ticketNumbers}}
Fecha del sorteo: {{drawDate}}

🏆 Premio: {{prize}}

Ver ticket completo: {{ticketUrl}}

¡Mucha suerte! Te notificaremos cuando se realice el sorteo.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
    `
  }

  /**
   * Template de verificación HTML
   */
  private getVerificationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verifica tu Email - {{companyName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .logo { max-width: 150px; height: auto; }
          .content { padding: 20px 0; }
          .verification-code { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .code { font-family: monospace; font-size: 24px; font-weight: bold; color: #dc2626; letter-spacing: 2px; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
            <h1>Verifica tu Email</h1>
          </div>
          <div class="content">
            <p>Hola <strong>{{userName}}</strong>,</p>
            <p>Para completar tu registro en {{companyName}}, necesitas verificar tu dirección de email.</p>
            
            <div class="verification-code">
              <p>Tu código de verificación es:</p>
              <div class="code">{{verificationCode}}</div>
              <p><small>Este código expira el {{expiresAt}}</small></p>
            </div>
            
            <p style="text-align: center;">
              <a href="{{verificationUrl}}" class="button">Verificar Email</a>
            </p>
            
            <p>Si no solicitaste esta verificación, puedes ignorar este email.</p>
          </div>
          <div class="footer">
            <p>{{companyName}}<br>{{companyAddress}}</p>
            <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Template de verificación texto
   */
  private getVerificationTextTemplate(): string {
    return `
Verifica tu Email - {{companyName}}

Hola {{userName}},

Para completar tu registro en {{companyName}}, necesitas verificar tu dirección de email.

Tu código de verificación es: {{verificationCode}}
Este código expira el {{expiresAt}}

Verificar email: {{verificationUrl}}

Si no solicitaste esta verificación, puedes ignorar este email.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
    `
  }

  /**
   * Template de notificación admin HTML
   */
  private getAdminNotificationTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{{notificationType}} - {{companyName}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
          .logo { max-width: 150px; height: auto; }
          .content { padding: 20px 0; }
          .notification { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .priority-high { border-left: 4px solid #dc2626; }
          .priority-medium { border-left: 4px solid #f59e0b; }
          .priority-low { border-left: 4px solid #10b981; }
          .button { display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
            <h1>{{notificationType}}</h1>
          </div>
          <div class="content">
            <p>Hola <strong>{{adminName}}</strong>,</p>
            
            <div class="notification priority-{{priority}}">
              <h3>{{notificationType}}</h3>
              <p>{{message}}</p>
            </div>
            
            {{#if actionUrl}}
            <p style="text-align: center;">
              <a href="{{actionUrl}}" class="button">Ver Detalles</a>
            </p>
            {{/if}}
            
            <p>Este es un mensaje automático del sistema {{companyName}}.</p>
          </div>
          <div class="footer">
            <p>{{companyName}}<br>{{companyAddress}}</p>
            <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  /**
   * Template de notificación admin texto
   */
  private getAdminNotificationTextTemplate(): string {
    return `
{{notificationType}} - {{companyName}}

Hola {{adminName}},

{{notificationType}}
{{message}}

{{#if actionUrl}}
Ver detalles: {{actionUrl}}
{{/if}}

Este es un mensaje automático del sistema {{companyName}}.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
    `
  }
}

// Instancia singleton del servicio
export const templateService = new TemplateService()


