// =====================================================
// 📧 VALIDADOR DE EMAIL - ELEVEN RIFAS
// =====================================================
// Utilidades para validación de direcciones de email
// =====================================================

import { EmailValidationResult } from '../types'

/**
 * Expresión regular para validar formato de email
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

/**
 * Dominios de email temporales conocidos
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  '10minutemail.com',
  'tempmail.org',
  'guerrillamail.com',
  'mailinator.com',
  'temp-mail.org',
  'throwaway.email',
  'yopmail.com',
  'getnada.com',
  'maildrop.cc',
  'sharklasers.com'
])

/**
 * Dominios de email gratuitos conocidos
 */
const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'live.com',
  'aol.com',
  'icloud.com',
  'protonmail.com',
  'yandex.com',
  'mail.ru'
])

/**
 * Dominios de roles conocidos
 */
const ROLE_EMAIL_PATTERNS = [
  /^admin@/i,
  /^info@/i,
  /^support@/i,
  /^noreply@/i,
  /^no-reply@/i,
  /^postmaster@/i,
  /^webmaster@/i,
  /^abuse@/i,
  /^contact@/i,
  /^sales@/i,
  /^marketing@/i,
  /^billing@/i,
  /^help@/i
]

/**
 * Valida una dirección de email
 */
export function validateEmail(email: string): EmailValidationResult {
  const result: EmailValidationResult = {
    isValid: false,
    isDisposable: false,
    isRole: false,
    isFree: false,
    domain: '',
    suggestions: []
  }

  // Validar formato básico
  if (!email || typeof email !== 'string') {
    return result
  }

  const trimmedEmail = email.trim().toLowerCase()
  
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    return result
  }

  // Extraer dominio
  const domain = trimmedEmail.split('@')[1]
  result.domain = domain
  result.isValid = true

  // Verificar si es email desechable
  result.isDisposable = DISPOSABLE_EMAIL_DOMAINS.has(domain)

  // Verificar si es email de rol
  result.isRole = ROLE_EMAIL_PATTERNS.some(pattern => pattern.test(trimmedEmail))

  // Verificar si es email gratuito
  result.isFree = FREE_EMAIL_DOMAINS.has(domain)

  // Generar sugerencias si es necesario
  if (result.isDisposable) {
    result.suggestions = ['Usa una dirección de email permanente']
  } else if (result.isRole) {
    result.suggestions = ['Usa una dirección de email personal']
  }

  return result
}

/**
 * Valida múltiples direcciones de email
 */
export function validateEmails(emails: string[]): Map<string, EmailValidationResult> {
  const results = new Map<string, EmailValidationResult>()
  
  for (const email of emails) {
    results.set(email, validateEmail(email))
  }
  
  return results
}

/**
 * Filtra emails válidos
 */
export function filterValidEmails(emails: string[]): string[] {
  return emails.filter(email => validateEmail(email).isValid)
}

/**
 * Filtra emails inválidos
 */
export function filterInvalidEmails(emails: string[]): string[] {
  return emails.filter(email => !validateEmail(email).isValid)
}

/**
 * Filtra emails desechables
 */
export function filterDisposableEmails(emails: string[]): string[] {
  return emails.filter(email => validateEmail(email).isDisposable)
}

/**
 * Filtra emails de rol
 */
export function filterRoleEmails(emails: string[]): string[] {
  return emails.filter(email => validateEmail(email).isRole)
}

/**
 * Obtiene estadísticas de validación
 */
export function getValidationStats(emails: string[]): {
  total: number
  valid: number
  invalid: number
  disposable: number
  role: number
  free: number
} {
  const results = validateEmails(emails)
  
  let valid = 0
  let invalid = 0
  let disposable = 0
  let role = 0
  let free = 0
  
  for (const result of results.values()) {
    if (result.isValid) {
      valid++
      if (result.isDisposable) disposable++
      if (result.isRole) role++
      if (result.isFree) free++
    } else {
      invalid++
    }
  }
  
  return {
    total: emails.length,
    valid,
    invalid,
    disposable,
    role,
    free
  }
}

/**
 * Normaliza una dirección de email
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return ''
  }
  
  return email.trim().toLowerCase()
}

/**
 * Verifica si dos emails son iguales (normalizados)
 */
export function areEmailsEqual(email1: string, email2: string): boolean {
  return normalizeEmail(email1) === normalizeEmail(email2)
}

/**
 * Extrae el dominio de un email
 */
export function extractDomain(email: string): string {
  const normalized = normalizeEmail(email)
  const parts = normalized.split('@')
  return parts.length === 2 ? parts[1] : ''
}

/**
 * Verifica si un dominio es válido
 */
export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false
  }
  
  const domainRegex = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return domainRegex.test(domain)
}


