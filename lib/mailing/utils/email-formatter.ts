// =====================================================
// 📧 FORMATEADOR DE EMAIL - ELEVEN RIFAS
// =====================================================
// Utilidades para formateo y procesamiento de emails
// =====================================================

import { EmailRecipient, EmailSender } from '../types'

/**
 * Formatea un nombre de email para mostrar
 */
export function formatEmailDisplay(email: string, name?: string): string {
  if (name && name.trim()) {
    return `${name.trim()} <${email}>`
  }
  return email
}

/**
 * Formatea una lista de destinatarios para mostrar
 */
export function formatRecipientsDisplay(recipients: EmailRecipient[]): string {
  return recipients
    .map(recipient => formatEmailDisplay(recipient.email, recipient.name))
    .join(', ')
}

/**
 * Extrae el nombre de un email formateado
 */
export function extractNameFromEmail(email: string): string | undefined {
  const match = email.match(/^(.+?)\s*<(.+?)>$/)
  if (match) {
    return match[1].trim()
  }
  return undefined
}

/**
 * Extrae la dirección de un email formateado
 */
export function extractAddressFromEmail(email: string): string {
  const match = email.match(/^(.+?)\s*<(.+?)>$/)
  if (match) {
    return match[2].trim()
  }
  return email.trim()
}

/**
 * Convierte un string de email a objeto EmailRecipient
 */
export function parseEmailRecipient(emailString: string): EmailRecipient {
  const name = extractNameFromEmail(emailString)
  const email = extractAddressFromEmail(emailString)
  
  return {
    email,
    name: name || undefined
  }
}

/**
 * Convierte un string de email a objeto EmailSender
 */
export function parseEmailSender(emailString: string): EmailSender {
  const name = extractNameFromEmail(emailString)
  const email = extractAddressFromEmail(emailString)
  
  return {
    email,
    name: name || undefined
  }
}

/**
 * Convierte una lista de strings de email a objetos EmailRecipient
 */
export function parseEmailRecipients(emailStrings: string[]): EmailRecipient[] {
  return emailStrings.map(parseEmailRecipient)
}

/**
 * Convierte una lista de strings de email a objetos EmailSender
 */
export function parseEmailSenders(emailStrings: string[]): EmailSender[] {
  return emailStrings.map(parseEmailSender)
}

/**
 * Formatea un número de teléfono para mostrar
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return ''
  
  // Remover todos los caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '')
  
  // Formatear según la longitud
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
  }
  
  return phone
}

/**
 * Formatea una cantidad de dinero
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount)
}

/**
 * Formatea una fecha
 */
export function formatDate(date: Date | string, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(dateObj)
}

/**
 * Formatea una fecha y hora
 */
export function formatDateTime(date: Date | string, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formatea una fecha relativa (hace X tiempo)
 */
export function formatRelativeDate(date: Date | string, locale: string = 'es-ES'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'hace un momento'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `hace ${minutes} minuto${minutes !== 1 ? 's' : ''}`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `hace ${hours} hora${hours !== 1 ? 's' : ''}`
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400)
    return `hace ${days} día${days !== 1 ? 's' : ''}`
  } else {
    return formatDate(dateObj, locale)
  }
}

/**
 * Trunca un texto a una longitud específica
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) {
    return text
  }
  
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Genera un ID único para emails
 */
export function generateEmailId(): string {
  return `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Genera un código de verificación
 */
export function generateVerificationCode(length: number = 6): string {
  const chars = '0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Genera un código alfanumérico
 */
export function generateAlphanumericCode(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return result
}

/**
 * Escapa caracteres HTML
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }
  
  return text.replace(/[&<>"']/g, (m) => map[m])
}

/**
 * Convierte texto a HTML básico
 */
export function textToHtml(text: string): string {
  return text
    .replace(/\n/g, '<br>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
}

/**
 * Extrae enlaces de un texto
 */
export function extractLinks(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.match(urlRegex) || []
}

/**
 * Convierte enlaces a HTML
 */
export function linkifyText(text: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>')
}


