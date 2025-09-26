// =====================================================
// 📧 TEMPLATES PROTEGIDOS CONTRA MODO OSCURO - ELEVEN RIFAS
// =====================================================
// Templates con protección completa contra cambios de color en modo oscuro
// =====================================================

import { EmailTemplate } from '../types'
import { createProtectedEmailTemplate, SAFE_EMAIL_COLORS } from '../utils/template-updater'

/**
 * Template de bienvenida protegido contra modo oscuro
 */
export const PROTECTED_WELCOME_TEMPLATE: EmailTemplate = {
  id: 'welcome-protected',
  name: 'Bienvenida (Protegido)',
  subject: '¡Bienvenido a {{companyName}}!',
  html: createProtectedEmailTemplate({
    title: 'Bienvenido a {{companyName}}',
    headerText: '¡Bienvenido a {{companyName}}!',
    content: `
      <p>Hola <strong>{{userName}}</strong>,</p>
      <p>¡Gracias por registrarte en {{companyName}}! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
      <p>Ahora puedes:</p>
      <ul>
        <li>Participar en nuestras rifas emocionantes</li>
        <li>Comprar tickets fácilmente</li>
        <li>Seguir el progreso de tus rifas</li>
        <li>Recibir notificaciones sobre sorteos</li>
      </ul>
      <p>Si tienes alguna pregunta, no dudes en contactarnos en <a href="mailto:{{supportEmail}}">{{supportEmail}}</a></p>
    `,
    buttonText: 'Iniciar Sesión',
    buttonUrl: '{{loginUrl}}'
  }),
  text: `
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
  `,
  variables: ['userName', 'userEmail', 'loginUrl', 'companyName'],
  category: 'welcome'
}

/**
 * Template de confirmación de pago protegido
 */
export const PROTECTED_PAYMENT_CONFIRMATION_TEMPLATE: EmailTemplate = {
  id: 'payment-confirmation-protected',
  name: 'Confirmación de Pago (Protegido)',
  subject: 'Confirmación de pago - {{rifaName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light only">
      <meta name="x-apple-color-scheme" content="light only">
      <title>Confirmación de Pago - {{rifaName}}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
          background-color: ${SAFE_EMAIL_COLORS.background} !important;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: ${SAFE_EMAIL_COLORS.background} !important;
        }
        .header { 
          text-align: center; 
          background: ${SAFE_EMAIL_COLORS.backgroundLight} !important;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
          padding: 20px; 
          border-radius: 8px;
        }
        .header * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .logo { 
          max-width: 150px; 
          height: auto; 
        }
        .content { 
          padding: 20px 0;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .content * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .ticket-info { 
          background: ${SAFE_EMAIL_COLORS.backgroundLight} !important;
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .ticket-info * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .ticket-numbers { 
          font-family: monospace; 
          font-size: 18px; 
          font-weight: bold; 
          color: ${SAFE_EMAIL_COLORS.primary} !important;
        }
        .payment-details { 
          background: ${SAFE_EMAIL_COLORS.backgroundLight} !important;
          padding: 15px; 
          border-radius: 6px; 
          margin: 15px 0;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .payment-details * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .button { 
          display: inline-block; 
          background: ${SAFE_EMAIL_COLORS.primary} !important;
          color: white !important;
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0;
        }
        .button * { color: white !important; }
        .footer { 
          text-align: center; 
          color: ${SAFE_EMAIL_COLORS.textSecondary} !important;
          font-size: 14px; 
          margin-top: 30px;
        }
        .footer * { color: ${SAFE_EMAIL_COLORS.textSecondary} !important; }
        
        /* Protección contra modo oscuro */
        [data-ogsc] { color: inherit !important; }
        [data-ogsb] { background-color: inherit !important; }
        * { -webkit-text-size-adjust: 100%; }
        
        @media (prefers-color-scheme: dark) {
          * { color-scheme: light only !important; }
        }
      </style>
    </head>
    <body data-ogsc data-ogsb>
      <div class="container" data-ogsc data-ogsb>
        <div class="header" data-ogsc data-ogsb>
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>¡Pago Confirmado!</h1>
        </div>
        <div class="content" data-ogsc data-ogsb>
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>Tu pago ha sido confirmado exitosamente. Aquí están los detalles de tu compra:</p>
          
          <div class="ticket-info" data-ogsc data-ogsb>
            <h3>Rifa: {{rifaName}}</h3>
            <p><strong>Números de ticket:</strong></p>
            <div class="ticket-numbers">{{ticketNumbers}}</div>
          </div>
          
          <div class="payment-details" data-ogsc data-ogsb>
            <h4>Detalles del Pago:</h4>
            <p><strong>Monto total:</strong> ${{totalAmount}}</p>
            <p><strong>Método de pago:</strong> {{paymentMethod}}</p>
            <p><strong>Fecha de pago:</strong> {{paymentDate}}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="{{ticketUrl}}" class="button" data-ogsc data-ogsb>Ver Mi Ticket</a>
          </p>
          
          <p>¡Gracias por participar en {{companyName}}! Te deseamos mucha suerte.</p>
        </div>
        <div class="footer" data-ogsc data-ogsb>
          <p>{{companyName}}<br>{{companyAddress}}</p>
          <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
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
  `,
  variables: ['userName', 'rifaName', 'ticketNumbers', 'totalAmount', 'paymentMethod', 'paymentDate', 'ticketUrl', 'companyName'],
  category: 'payment'
}

/**
 * Template de notificación de ganador protegido
 */
export const PROTECTED_WINNER_NOTIFICATION_TEMPLATE: EmailTemplate = {
  id: 'winner-notification-protected',
  name: 'Notificación de Ganador (Protegido)',
  subject: '¡FELICITACIONES! Has ganado {{rifaName}} - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light only">
      <meta name="x-apple-color-scheme" content="light only">
      <title>¡Has Ganado!</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
          background-color: ${SAFE_EMAIL_COLORS.background} !important;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          background-color: ${SAFE_EMAIL_COLORS.background} !important;
        }
        .header { 
          text-align: center; 
          background: linear-gradient(135deg, ${SAFE_EMAIL_COLORS.success}, #059669) !important;
          color: white !important;
          padding: 40px; 
          border-radius: 8px;
        }
        .header * { color: white !important; }
        .logo { 
          max-width: 150px; 
          height: auto; 
        }
        .content { 
          padding: 20px 0;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .content * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .winner { 
          background: ${SAFE_EMAIL_COLORS.backgroundLight} !important;
          padding: 30px; 
          border-radius: 8px; 
          margin: 20px 0; 
          border: 3px solid ${SAFE_EMAIL_COLORS.success} !important;
          text-align: center;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .winner * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .prize { 
          font-size: 28px; 
          font-weight: bold; 
          color: ${SAFE_EMAIL_COLORS.success} !important;
          margin: 20px 0; 
        }
        .ticket-info { 
          background: ${SAFE_EMAIL_COLORS.backgroundLight} !important;
          padding: 20px; 
          border-radius: 8px; 
          margin: 20px 0;
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
        }
        .ticket-info * { color: ${SAFE_EMAIL_COLORS.textPrimary} !important; }
        .button { 
          display: inline-block; 
          background: ${SAFE_EMAIL_COLORS.success} !important;
          color: white !important;
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0; 
          font-weight: bold;
        }
        .button * { color: white !important; }
        .footer { 
          text-align: center; 
          color: ${SAFE_EMAIL_COLORS.textSecondary} !important;
          font-size: 14px; 
          margin-top: 30px;
        }
        .footer * { color: ${SAFE_EMAIL_COLORS.textSecondary} !important; }
        
        /* Protección contra modo oscuro */
        [data-ogsc] { color: inherit !important; }
        [data-ogsb] { background-color: inherit !important; }
        * { -webkit-text-size-adjust: 100%; }
        
        @media (prefers-color-scheme: dark) {
          * { color-scheme: light only !important; }
        }
      </style>
    </head>
    <body data-ogsc data-ogsb>
      <div class="container" data-ogsc data-ogsb>
        <div class="header" data-ogsc data-ogsb>
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>🎉 ¡FELICITACIONES! 🎉</h1>
          <p>¡Has ganado la rifa!</p>
        </div>
        <div class="content" data-ogsc data-ogsb>
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>¡Tenemos excelentes noticias para ti!</p>
          
          <div class="winner" data-ogsc data-ogsb>
            <h2>🏆 ¡ERES EL GANADOR! 🏆</h2>
            <div class="prize">{{prize}}</div>
            <p>de la rifa <strong>{{rifaName}}</strong></p>
          </div>
          
          <div class="ticket-info" data-ogsc data-ogsb>
            <h4>Detalles de tu Ticket Ganador:</h4>
            <p><strong>Número de ticket:</strong> {{ticketNumber}}</p>
            <p><strong>Fecha del sorteo:</strong> {{drawDate}}</p>
            <p><strong>Hora del sorteo:</strong> {{drawTime}}</p>
          </div>
          
          <p>Para reclamar tu premio, por favor contacta con nosotros lo antes posible:</p>
          <ul>
            <li>Email: {{supportEmail}}</li>
            <li>Teléfono: {{supportPhone}}</li>
            <li>WhatsApp: {{whatsappNumber}}</li>
          </ul>
          
          <p style="text-align: center;">
            <a href="{{claimUrl}}" class="button" data-ogsc data-ogsb>Reclamar Premio</a>
          </p>
          
          <p><strong>¡Felicidades nuevamente! ¡Disfruta tu premio!</strong></p>
        </div>
        <div class="footer" data-ogsc data-ogsb>
          <p>{{companyName}}<br>{{companyAddress}}</p>
          <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
🎉 ¡FELICITACIONES! 🎉

Hola {{userName}},

¡Tenemos excelentes noticias para ti!

🏆 ¡ERES EL GANADOR! 🏆
{{prize}}
de la rifa {{rifaName}}

Detalles de tu Ticket Ganador:
- Número de ticket: {{ticketNumber}}
- Fecha del sorteo: {{drawDate}}
- Hora del sorteo: {{drawTime}}

Para reclamar tu premio, por favor contacta con nosotros lo antes posible:
- Email: {{supportEmail}}
- Teléfono: {{supportPhone}}
- WhatsApp: {{whatsappNumber}}

Reclamar premio: {{claimUrl}}

¡Felicidades nuevamente! ¡Disfruta tu premio!

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'rifaName', 'prize', 'ticketNumber', 'drawDate', 'drawTime', 'supportEmail', 'supportPhone', 'whatsappNumber', 'claimUrl', 'companyName'],
  category: 'notification'
}

