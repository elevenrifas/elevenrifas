// =====================================================
// 📧 TEMPLATES DE RECORDATORIOS - ELEVEN RIFAS
// =====================================================
// Templates específicos para emails de recordatorio
// =====================================================

import { EmailTemplate } from '../types'

/**
 * Template de recordatorio de sorteo próximo
 */
export const REMINDER_DRAW_TEMPLATE: EmailTemplate = {
  id: 'reminder-draw',
  name: 'Recordatorio de Sorteo',
  subject: '¡Sorteo próximo! {{rifaName}} - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Sorteo</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .highlight { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .countdown { text-align: center; font-size: 24px; font-weight: bold; color: #dc2626; margin: 20px 0; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>¡Sorteo Próximo!</h1>
          <p>No te pierdas la oportunidad de ganar</p>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>Te recordamos que el sorteo de la rifa <strong>{{rifaName}}</strong> está muy cerca.</p>
          
          <div class="highlight">
            <h3>🏆 Premio: {{prize}}</h3>
            <p><strong>Fecha del sorteo:</strong> {{drawDate}}</p>
            <p><strong>Hora:</strong> {{drawTime}}</p>
            <div class="countdown">{{timeRemaining}}</div>
          </div>
          
          <p>Tu ticket <strong>{{ticketNumbers}}</strong> está participando en este sorteo.</p>
          
          <p style="text-align: center;">
            <a href="{{ticketUrl}}" class="button">Ver Mi Ticket</a>
          </p>
          
          <p>¡Mucha suerte! Te notificaremos inmediatamente si resultas ganador.</p>
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
¡Sorteo Próximo! - {{rifaName}}

Hola {{userName}},

Te recordamos que el sorteo de la rifa {{rifaName}} está muy cerca.

🏆 Premio: {{prize}}
Fecha del sorteo: {{drawDate}}
Hora: {{drawTime}}
Tiempo restante: {{timeRemaining}}

Tu ticket {{ticketNumbers}} está participando en este sorteo.

Ver mi ticket: {{ticketUrl}}

¡Mucha suerte! Te notificaremos inmediatamente si resultas ganador.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'rifaName', 'prize', 'drawDate', 'drawTime', 'timeRemaining', 'ticketNumbers', 'ticketUrl', 'companyName'],
  category: 'reminder'
}

/**
 * Template de recordatorio de pago pendiente
 */
export const REMINDER_PAYMENT_TEMPLATE: EmailTemplate = {
  id: 'reminder-payment',
  name: 'Recordatorio de Pago',
  subject: 'Pago pendiente - {{rifaName}} - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio de Pago</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .warning { background: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .payment-info { background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>Pago Pendiente</h1>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>Te recordamos que tienes un pago pendiente para la rifa <strong>{{rifaName}}</strong>.</p>
          
          <div class="warning">
            <h3>⚠️ Acción Requerida</h3>
            <p>Tu reserva expirará en <strong>{{expirationTime}}</strong> si no se completa el pago.</p>
          </div>
          
          <div class="payment-info">
            <h4>Detalles del Pago:</h4>
            <p><strong>Rifa:</strong> {{rifaName}}</p>
            <p><strong>Números reservados:</strong> {{ticketNumbers}}</p>
            <p><strong>Monto total:</strong> ${{totalAmount}}</p>
            <p><strong>Método de pago:</strong> {{paymentMethod}}</p>
          </div>
          
          <p style="text-align: center;">
            <a href="{{paymentUrl}}" class="button">Completar Pago</a>
          </p>
          
          <p>Si ya realizaste el pago, puedes ignorar este mensaje.</p>
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
Pago Pendiente - {{rifaName}}

Hola {{userName}},

Te recordamos que tienes un pago pendiente para la rifa {{rifaName}}.

⚠️ Acción Requerida
Tu reserva expirará en {{expirationTime}} si no se completa el pago.

Detalles del Pago:
- Rifa: {{rifaName}}
- Números reservados: {{ticketNumbers}}
- Monto total: ${{totalAmount}}
- Método de pago: {{paymentMethod}}

Completar pago: {{paymentUrl}}

Si ya realizaste el pago, puedes ignorar este mensaje.

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'rifaName', 'ticketNumbers', 'totalAmount', 'paymentMethod', 'expirationTime', 'paymentUrl', 'companyName'],
  category: 'reminder'
}

/**
 * Template de recordatorio de finalización de rifa
 */
export const REMINDER_RIFA_ENDING_TEMPLATE: EmailTemplate = {
  id: 'reminder-rifa-ending',
  name: 'Recordatorio de Rifa Finalizando',
  subject: '¡Últimas horas! {{rifaName}} - {{companyName}}',
  html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rifa Finalizando</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: linear-gradient(135deg, #f59e0b, #fbbf24); color: white; padding: 30px; border-radius: 8px; }
        .logo { max-width: 150px; height: auto; }
        .content { padding: 20px 0; }
        .urgent { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .stats { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
        .stat { background: #f8f9fa; padding: 15px; border-radius: 6px; }
        .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <img src="{{logoUrl}}" alt="{{companyName}}" class="logo">
          <h1>¡Últimas Horas!</h1>
          <p>La rifa está por finalizar</p>
        </div>
        <div class="content">
          <p>Hola <strong>{{userName}}</strong>,</p>
          <p>La rifa <strong>{{rifaName}}</strong> está por finalizar. ¡No te quedes sin participar!</p>
          
          <div class="urgent">
            <h3>⏰ Tiempo Restante</h3>
            <p><strong>{{timeRemaining}}</strong> para que termine la venta de tickets.</p>
          </div>
          
          <div class="stats">
            <div class="stat">
              <h4>Tickets Vendidos</h4>
              <p>{{ticketsSold}} / {{totalTickets}}</p>
            </div>
            <div class="stat">
              <h4>Precio por Ticket</h4>
              <p>${{ticketPrice}}</p>
            </div>
            <div class="stat">
              <h4>Premio</h4>
              <p>{{prize}}</p>
            </div>
          </div>
          
          <p style="text-align: center;">
            <a href="{{rifaUrl}}" class="button">Comprar Tickets Ahora</a>
          </p>
          
          <p>¡No pierdas esta oportunidad única de ganar {{prize}}!</p>
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
¡Últimas Horas! - {{rifaName}}

Hola {{userName}},

La rifa {{rifaName}} está por finalizar. ¡No te quedes sin participar!

⏰ Tiempo Restante: {{timeRemaining}}

Estadísticas:
- Tickets vendidos: {{ticketsSold}} / {{totalTickets}}
- Precio por ticket: ${{ticketPrice}}
- Premio: {{prize}}

Comprar tickets: {{rifaUrl}}

¡No pierdas esta oportunidad única de ganar {{prize}}!

{{companyName}}
{{companyAddress}}
{{companyUrl}}
  `,
  variables: ['userName', 'rifaName', 'timeRemaining', 'ticketsSold', 'totalTickets', 'ticketPrice', 'prize', 'rifaUrl', 'companyName'],
  category: 'reminder'
}


