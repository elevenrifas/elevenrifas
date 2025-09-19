// =====================================================
// 📧 CONFIGURACIÓN RESEND - ELEVEN RIFAS
// =====================================================
// Configuración para el servicio de envío de emails con Resend
// =====================================================

// Next.js maneja automáticamente las variables de entorno (solo disponibles en servidor)
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@elevenrifas.com'
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'Eleven Rifas'
const RESEND_SUPPORT_EMAIL = process.env.RESEND_SUPPORT_EMAIL || 'support@elevenrifas.com'

// Lazy import de Resend para evitar problemas de build
let resendInstance: any = null

export const getResend = async () => {
  if (!resendInstance) {
    const { Resend } = await import('resend')
    // Leer la API key en tiempo de ejecución (lado servidor)
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.warn('⚠️ RESEND_API_KEY no está configurada. Los emails no se enviarán.')
    }
    resendInstance = new Resend(apiKey as any)
  }
  return resendInstance
}

export const defaultResendSender = {
  email: RESEND_FROM_EMAIL,
  name: RESEND_FROM_NAME,
}

export const resendSupportEmail = RESEND_SUPPORT_EMAIL

