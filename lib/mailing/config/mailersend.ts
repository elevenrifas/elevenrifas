// =====================================================
// 📧 CONFIGURACIÓN MAILERSEND - ELEVEN RIFAS
// =====================================================
// Configuración centralizada para el servicio de envío de emails
// =====================================================

import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend'

// Configuración de MailerSend
export const MAILERSEND_CONFIG = {
  // API Key de MailerSend
  API_KEY: process.env.MAILERSEND_API_KEY!,
  
  // Configuración del remitente por defecto
  DEFAULT_SENDER: {
    email: process.env.MAILERSEND_FROM_EMAIL || 'noreply@elevenrifas.com',
    name: process.env.MAILERSEND_FROM_NAME || 'Eleven Rifas',
  },
  
  // Configuración de la aplicación
  APP: {
    name: 'Eleven Rifas',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    support_email: process.env.MAILERSEND_SUPPORT_EMAIL || 'support@elevenrifas.com',
  },
  
  // Configuración de templates
  TEMPLATES: {
    base_url: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
    logo_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/logo_circular.png`,
    company_name: 'Eleven Rifas',
    company_address: 'Venezuela',
  },
  
  // Configuración de límites y timeouts
  LIMITS: {
    max_recipients: 1000,
    timeout: 30000, // 30 segundos
    retry_attempts: 3,
  },
} as const

// Cliente de MailerSend
let mailerSendClient: MailerSend | null = null

/**
 * Obtiene o inicializa el cliente de MailerSend
 */
export function getMailerSendClient(): MailerSend {
  if (!mailerSendClient) {
    if (!MAILERSEND_CONFIG.API_KEY) {
      throw new Error('MAILERSEND_API_KEY no está configurada')
    }
    
    mailerSendClient = new MailerSend({
      apiKey: MAILERSEND_CONFIG.API_KEY,
    })
  }
  
  return mailerSendClient
}

/**
 * Crea un objeto Sender para MailerSend
 */
export function createSender(email?: string, name?: string): Sender {
  return new Sender(
    email || MAILERSEND_CONFIG.DEFAULT_SENDER.email,
    name || MAILERSEND_CONFIG.DEFAULT_SENDER.name
  )
}

/**
 * Crea un objeto Recipient para MailerSend
 */
export function createRecipient(email: string, name?: string): Recipient {
  return new Recipient(email, name)
}

/**
 * Valida la configuración de MailerSend
 */
export function validateMailerSendConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  
  if (!MAILERSEND_CONFIG.API_KEY) {
    errors.push('MAILERSEND_API_KEY no está configurada')
  }
  
  if (!MAILERSEND_CONFIG.DEFAULT_SENDER.email) {
    errors.push('MAILERSEND_FROM_EMAIL no está configurada')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Obtiene la URL base para enlaces en emails
 */
export function getEmailBaseUrl(): string {
  return MAILERSEND_CONFIG.TEMPLATES.base_url
}

/**
 * Obtiene la URL del logo para emails
 */
export function getEmailLogoUrl(): string {
  return MAILERSEND_CONFIG.TEMPLATES.logo_url
}

/**
 * Obtiene información de la empresa para emails
 */
export function getCompanyInfo() {
  return {
    name: MAILERSEND_CONFIG.TEMPLATES.company_name,
    address: MAILERSEND_CONFIG.TEMPLATES.company_address,
    url: MAILERSEND_CONFIG.APP.url,
    support_email: MAILERSEND_CONFIG.APP.support_email,
  }
}


