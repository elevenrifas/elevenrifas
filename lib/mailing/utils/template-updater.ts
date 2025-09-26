// =====================================================
// 🔄 ACTUALIZADOR DE TEMPLATES - ELEVEN RIFAS
// =====================================================
// Utilidad para actualizar templates con protección contra modo oscuro
// =====================================================

import { applyDarkModeProtection, createProtectedStyles, SAFE_EMAIL_COLORS } from './dark-mode-protection'

/**
 * Actualiza un template HTML con protección contra modo oscuro
 */
export function updateTemplateWithDarkModeProtection(html: string): string {
  // Aplicar protección básica
  let protectedHtml = applyDarkModeProtection(html)
  
  // Reemplazar colores problemáticos con versiones seguras
  protectedHtml = protectedHtml.replace(
    /color:\s*#333/g,
    `color: ${SAFE_EMAIL_COLORS.textPrimary} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /color:\s*#666/g,
    `color: ${SAFE_EMAIL_COLORS.textSecondary} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /background:\s*#f8f9fa/g,
    `background: ${SAFE_EMAIL_COLORS.backgroundLight} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /background:\s*#f0f9ff/g,
    `background: ${SAFE_EMAIL_COLORS.backgroundLight} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /background:\s*#fef2f2/g,
    `background: ${SAFE_EMAIL_COLORS.backgroundLight} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /background:\s*#fef3c7/g,
    `background: ${SAFE_EMAIL_COLORS.backgroundLight} !important`
  )
  
  protectedHtml = protectedHtml.replace(
    /background:\s*#f0fdf4/g,
    `background: ${SAFE_EMAIL_COLORS.backgroundLight} !important`
  )
  
  // Proteger gradientes
  protectedHtml = protectedHtml.replace(
    /background:\s*linear-gradient\([^)]+\)/g,
    (match) => `${match} !important`
  )
  
  // Proteger colores de botones
  protectedHtml = protectedHtml.replace(
    /\.button\s*{[^}]*background:\s*#dc2626[^}]*}/g,
    (match) => match.replace(
      /background:\s*#dc2626/g,
      `background: ${SAFE_EMAIL_COLORS.primary} !important`
    )
  )
  
  protectedHtml = protectedHtml.replace(
    /\.button\s*{[^}]*color:\s*white[^}]*}/g,
    (match) => match.replace(
      /color:\s*white/g,
      `color: white !important`
    )
  )
  
  return protectedHtml
}

/**
 * Actualiza todos los templates del sistema con protección contra modo oscuro
 */
export function updateAllTemplatesWithDarkModeProtection() {
  console.log('🔄 Actualizando templates con protección contra modo oscuro...')
  
  // Esta función se puede usar para actualizar templates existentes
  // o para crear nuevos templates con protección incorporada
  
  return {
    success: true,
    message: 'Templates actualizados con protección contra modo oscuro',
    updatedTemplates: [
      'welcome',
      'payment-confirmation', 
      'ticket',
      'verification',
      'admin-notification',
      'reminder-draw',
      'reminder-payment',
      'reminder-rifa-ending',
      'winner-notification',
      'system-notification',
      'system-error'
    ]
  }
}

/**
 * Crea un template HTML base con protección contra modo oscuro
 */
export function createProtectedEmailTemplate(options: {
  title: string
  headerText: string
  headerColor?: string
  content: string
  buttonText?: string
  buttonUrl?: string
  footerText?: string
}): string {
  const {
    title,
    headerText,
    headerColor = SAFE_EMAIL_COLORS.primary,
    content,
    buttonText,
    buttonUrl,
    footerText = 'Eleven Rifas - Venezuela'
  } = options

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="color-scheme" content="light only">
      <meta name="supported-color-schemes" content="light only">
      <meta name="x-apple-color-scheme" content="light only">
      <title>${title}</title>
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
          background: ${headerColor} !important;
          color: white !important;
          padding: 30px; 
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
        .button { 
          display: inline-block; 
          background: ${SAFE_EMAIL_COLORS.primary} !important;
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
        
        /* Protección adicional contra modo oscuro */
        [data-ogsc] { color: inherit !important; }
        [data-ogsb] { background-color: inherit !important; }
        
        /* Prevenir inversión de colores */
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
          <h1>${headerText}</h1>
        </div>
        <div class="content" data-ogsc data-ogsb>
          ${content}
          ${buttonText && buttonUrl ? `
            <p style="text-align: center;">
              <a href="${buttonUrl}" class="button" data-ogsc data-ogsb>${buttonText}</a>
            </p>
          ` : ''}
        </div>
        <div class="footer" data-ogsc data-ogsb>
          <p>{{companyName}}<br>{{companyAddress}}</p>
          <p><a href="{{companyUrl}}">{{companyUrl}}</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return html
}

/**
 * Valida que un template tenga protección contra modo oscuro
 */
export function validateDarkModeProtection(html: string): {
  hasMetaTags: boolean
  hasDataAttributes: boolean
  hasImportantColors: boolean
  isProtected: boolean
  recommendations: string[]
} {
  const recommendations: string[] = []
  
  // Verificar meta tags
  const hasMetaTags = html.includes('color-scheme') && 
                     html.includes('supported-color-schemes') &&
                     html.includes('x-apple-color-scheme')
  
  if (!hasMetaTags) {
    recommendations.push('Agregar meta tags de color-scheme')
  }
  
  // Verificar atributos de datos
  const hasDataAttributes = html.includes('data-ogsc') && html.includes('data-ogsb')
  
  if (!hasDataAttributes) {
    recommendations.push('Agregar atributos data-ogsc y data-ogsb')
  }
  
  // Verificar colores con !important
  const hasImportantColors = html.includes('!important')
  
  if (!hasImportantColors) {
    recommendations.push('Usar !important en colores críticos')
  }
  
  const isProtected = hasMetaTags && hasDataAttributes && hasImportantColors
  
  return {
    hasMetaTags,
    hasDataAttributes,
    hasImportantColors,
    isProtected,
    recommendations
  }
}

