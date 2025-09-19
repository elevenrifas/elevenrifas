// =====================================================
// 📧 SERVICIO DE EMAIL - ELEVEN RIFAS
// =====================================================
// Servicio principal para el envío de emails usando MailerSend
// =====================================================

import { EmailParams, Sender, Recipient } from 'mailersend'
import { getMailerSendClient, createSender, createRecipient, validateMailerSendConfig } from '../config/mailersend'
import { 
  EmailMessage, 
  EmailSendResult, 
  EmailRecipient, 
  EmailSender,
  BulkEmailConfig,
  BulkEmailResult,
  RetryConfig,
  RateLimitConfig
} from '../types'

// Configuración por defecto
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2
}

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxEmailsPerMinute: 60,
  maxEmailsPerHour: 1000,
  maxEmailsPerDay: 10000
}

export class EmailService {
  private retryConfig: RetryConfig
  private rateLimitConfig: RateLimitConfig
  private emailCounts: Map<string, number> = new Map()

  constructor(
    retryConfig: Partial<RetryConfig> = {},
    rateLimitConfig: Partial<RateLimitConfig> = {}
  ) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig }
    this.rateLimitConfig = { ...DEFAULT_RATE_LIMIT_CONFIG, ...rateLimitConfig }
  }

  /**
   * Envía un email individual
   */
  async sendEmail(emailMessage: EmailMessage): Promise<EmailSendResult> {
    try {
      // Validar configuración
      const configValidation = validateMailerSendConfig()
      if (!configValidation.isValid) {
        return {
          success: false,
          error: `Configuración inválida: ${configValidation.errors.join(', ')}`
        }
      }

      // Validar rate limiting
      if (!this.checkRateLimit()) {
        return {
          success: false,
          error: 'Rate limit excedido. Intenta más tarde.'
        }
      }

      // Crear parámetros de email
      const emailParams = this.createEmailParams(emailMessage)
      
      // Enviar con retry
      const result = await this.sendWithRetry(emailParams)
      
      // Actualizar contadores
      this.updateEmailCounts()
      
      return result

    } catch (error) {
      console.error('Error enviando email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Envía emails en lote
   */
  async sendBulkEmails(
    emailMessages: EmailMessage[], 
    config: Partial<BulkEmailConfig> = {}
  ): Promise<BulkEmailResult> {
    const bulkConfig: BulkEmailConfig = {
      batchSize: 50,
      delayBetweenBatches: 1000,
      maxRetries: 3,
      stopOnError: false,
      ...config
    }

    const results: BulkEmailResult = {
      totalSent: 0,
      totalFailed: 0,
      errors: [],
      success: true
    }

    // Procesar en lotes
    for (let i = 0; i < emailMessages.length; i += bulkConfig.batchSize) {
      const batch = emailMessages.slice(i, i + bulkConfig.batchSize)
      
      for (const emailMessage of batch) {
        try {
          const result = await this.sendEmail(emailMessage)
          
          if (result.success) {
            results.totalSent++
          } else {
            results.totalFailed++
            results.errors.push({
              email: Array.isArray(emailMessage.to) 
                ? emailMessage.to[0].email 
                : emailMessage.to.email,
              error: result.error || 'Error desconocido'
            })
            
            if (bulkConfig.stopOnError) {
              results.success = false
              return results
            }
          }
        } catch (error) {
          results.totalFailed++
          results.errors.push({
            email: Array.isArray(emailMessage.to) 
              ? emailMessage.to[0].email 
              : emailMessage.to.email,
            error: error instanceof Error ? error.message : 'Error desconocido'
          })
        }
      }

      // Delay entre lotes
      if (i + bulkConfig.batchSize < emailMessages.length) {
        await this.delay(bulkConfig.delayBetweenBatches)
      }
    }

    results.success = results.totalFailed === 0
    return results
  }

  /**
   * Crea parámetros de email para MailerSend
   */
  private createEmailParams(emailMessage: EmailMessage): EmailParams {
    const mailerSend = getMailerSendClient()
    
    // Configurar remitente
    const from = emailMessage.config?.from 
      ? createSender(emailMessage.config.from.email, emailMessage.config.from.name)
      : createSender()

    // Configurar destinatarios
    const to = Array.isArray(emailMessage.to) 
      ? emailMessage.to.map(recipient => createRecipient(recipient.email, recipient.name))
      : [createRecipient(emailMessage.to.email, emailMessage.to.name)]

    // Crear parámetros base
    const emailParams = new EmailParams()
      .setFrom(from)
      .setTo(to)
      .setSubject(emailMessage.content.subject)

    // Configurar contenido
    if (emailMessage.content.html) {
      emailParams.setHtml(emailMessage.content.html)
    }
    
    if (emailMessage.content.text) {
      emailParams.setText(emailMessage.content.text)
    }

    // Configurar CC
    if (emailMessage.config?.cc) {
      const cc = emailMessage.config.cc.map(recipient => 
        createRecipient(recipient.email, recipient.name)
      )
      emailParams.setCc(cc)
    }

    // Configurar BCC
    if (emailMessage.config?.bcc) {
      const bcc = emailMessage.config.bcc.map(recipient => 
        createRecipient(recipient.email, recipient.name)
      )
      emailParams.setBcc(bcc)
    }

    // Configurar Reply-To
    if (emailMessage.config?.replyTo) {
      emailParams.setReplyTo(createSender(
        emailMessage.config.replyTo.email, 
        emailMessage.config.replyTo.name
      ))
    }

    // Configurar tags
    if (emailMessage.config?.tags) {
      emailParams.setTags(emailMessage.config.tags)
    }

    // Configurar variables
    if (emailMessage.config?.variables) {
      emailParams.setVariables(emailMessage.config.variables)
    }

    return emailParams
  }

  /**
   * Envía email con reintentos
   */
  private async sendWithRetry(emailParams: EmailParams): Promise<EmailSendResult> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        const mailerSend = getMailerSendClient()
        const response = await mailerSend.email.send(emailParams)
        
        return {
          success: true,
          messageId: response.body?.message_id,
          details: response.body
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Error desconocido')
        
        // Si no es el último intento, esperar antes del siguiente
        if (attempt < this.retryConfig.maxRetries) {
          const delay = Math.min(
            this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt),
            this.retryConfig.maxDelay
          )
          await this.delay(delay)
        }
      }
    }

    return {
      success: false,
      error: lastError?.message || 'Error después de múltiples intentos'
    }
  }

  /**
   * Verifica rate limiting
   */
  private checkRateLimit(): boolean {
    const now = new Date()
    const minute = now.getMinutes()
    const hour = now.getHours()
    const day = now.getDate()
    
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}-${minute}`
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}`
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${day}`

    const minuteCount = this.emailCounts.get(minuteKey) || 0
    const hourCount = this.emailCounts.get(hourKey) || 0
    const dayCount = this.emailCounts.get(dayKey) || 0

    return minuteCount < this.rateLimitConfig.maxEmailsPerMinute &&
           hourCount < this.rateLimitConfig.maxEmailsPerHour &&
           dayCount < this.rateLimitConfig.maxEmailsPerDay
  }

  /**
   * Actualiza contadores de emails
   */
  private updateEmailCounts(): void {
    const now = new Date()
    const minute = now.getMinutes()
    const hour = now.getHours()
    const day = now.getDate()
    
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}-${minute}`
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}`
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${day}`

    this.emailCounts.set(minuteKey, (this.emailCounts.get(minuteKey) || 0) + 1)
    this.emailCounts.set(hourKey, (this.emailCounts.get(hourKey) || 0) + 1)
    this.emailCounts.set(dayKey, (this.emailCounts.get(dayKey) || 0) + 1)
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Limpia contadores antiguos
   */
  cleanupCounters(): void {
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    for (const [key] of this.emailCounts) {
      const [year, month, day] = key.split('-').map(Number)
      const keyDate = new Date(year, month, day)
      
      if (keyDate < oneDayAgo) {
        this.emailCounts.delete(key)
      }
    }
  }

  /**
   * Obtiene estadísticas de rate limiting
   */
  getRateLimitStats(): { minute: number; hour: number; day: number } {
    const now = new Date()
    const minute = now.getMinutes()
    const hour = now.getHours()
    const day = now.getDate()
    
    const minuteKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}-${minute}`
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${day}-${hour}`
    const dayKey = `${now.getFullYear()}-${now.getMonth()}-${day}`

    return {
      minute: this.emailCounts.get(minuteKey) || 0,
      hour: this.emailCounts.get(hourKey) || 0,
      day: this.emailCounts.get(dayKey) || 0
    }
  }
}

// Instancia singleton del servicio
export const emailService = new EmailService()


