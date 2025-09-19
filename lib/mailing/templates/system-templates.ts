// =====================================================
// 📧 TEMPLATES DEL SISTEMA - ELEVEN RIFAS
// =====================================================
// Templates para notificaciones del sistema
// =====================================================

import { EmailTemplate } from '../types'

/**
 * Template de notificación de ganador
 */
export const WINNER_NOTIFICATION_TEMPLATE: EmailTemplate = {
  id: 'winner-notification',
  name: 'Notificación de Ganador',
  subject: '¡FELICITACIONES! Has ganado {{rifaName}} - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>¡Has Ganado!</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 40px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .winner { background: #f0fdf4; padding: 30px; border-radius: 8px; margin: 20px 0; border: 3px solid #10b981; text-align: center; }
        .prize { font-size: 28px; font-weight: bold; color: #059669; margin: 20px 0; }
        .ticket-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>🎉 ¡FELICITACIONES! 🎉</h1>
          <p>¡Has ganado la rifa!</p>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>¡Tenemos excelentes noticias para ti!</p>
          
          <div class="winner">
            <h2>🏆 ¡ERES EL GANADOR! 🏆</h2>
            <div class="prize">{{prize}}</div>
            <p>de la rifa <strong>{{rifaName}}</strong></p>
          </div>
          
          <div class="ticket-info">
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
            <a href="{{claimUrl}}" class="button">Reclamar Premio</a>
          </p>
          
          <p><strong>¡Felicidades nuevamente! ¡Disfruta tu premio!</strong></p>
        </div>
        <div class="footer">
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

/**
 * Template de notificación de sistema
 */
export const SYSTEM_NOTIFICATION_TEMPLATE: EmailTemplate = {
  id: 'system-notification',
  name: 'Notificación del Sistema',
  subject: 'Notificación del Sistema - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Notificación del Sistema</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .notification { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>Notificación del Sistema</h1>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          
          <div class="notification">
            <h3>{{notificationTitle}}</h3>
            <p>{{notificationMessage}}</p>
          </div>
          
          <p>Este es un mensaje automático del sistema {{companyName}}.</p>
        </div>
        <div class="footer">
          <p>{{companyName}}<br>{{companyAddress}}</p>
          <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
Notificación del Sistema - {{companyName}}

Hola {{userName}},

{{notificationTitle}}
{{notificationMessage}}

Este es un mensaje automático del sistema {{companyName}}.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'notificationTitle', 'notificationMessage', 'companyName'],
  category: 'system'
}

/**
 * Template de error del sistema
 */
export const SYSTEM_ERROR_TEMPLATE: EmailTemplate = {
  id: 'system-error',
  name: 'Error del Sistema',
  subject: 'Error del Sistema - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Error del Sistema</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: #fef2f2; padding: 20px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .error { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>⚠️ Error del Sistema</h1>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          
          <div class="error">
            <h3>Se ha producido un error</h3>
            <p><strong>Error:</strong> {{errorMessage}}</p>
            <p><strong>Fecha:</strong> {{errorDate}}</p>
            <p><strong>ID de Error:</strong> {{errorId}}</p>
          </div>
          
          <p>Nuestro equipo técnico ha sido notificado y está trabajando para resolver el problema.</p>
          <p>Si el problema persiste, por favor contacta con soporte técnico.</p>
        </div>
        <div class="footer">
          <p>{{companyName}}<br>{{companyAddress}}</p>
          <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
⚠️ Error del Sistema - {{companyName}}

Hola {{userName}},

Se ha producido un error:

Error: {{errorMessage}}
Fecha: {{errorDate}}
ID de Error: {{errorId}}

Nuestro equipo técnico ha sido notificado y está trabajando para resolver el problema.

Si el problema persiste, por favor contacta con soporte técnico.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'errorMessage', 'errorDate', 'errorId', 'companyName'],
  category: 'system'
}


