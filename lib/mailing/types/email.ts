// =====================================================
// 📧 TIPOS DE EMAIL - ELEVEN RIFAS
// =====================================================
// Definiciones de tipos para el sistema de envío de emails
// =====================================================

// Tipos básicos de email
export interface EmailRecipient {
  email: string
  name?: string
}

export interface EmailSender {
  email: string
  name?: string
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  type?: string
  disposition?: 'attachment' | 'inline'
  cid?: string
}

// Tipos de contenido de email
export interface EmailContent {
  subject: string
  text?: string
  html?: string
  template?: string
  templateData?: Record<string, any>
}

// Tipos de configuración de email
export interface EmailConfig {
  from?: EmailSender
  replyTo?: EmailSender
  cc?: EmailRecipient[]
  bcc?: EmailRecipient[]
  attachments?: EmailAttachment[]
  tags?: string[]
  variables?: Record<string, any>
}

// Tipo completo de email
export interface EmailMessage {
  to: EmailRecipient | EmailRecipient[]
  content: EmailContent
  config?: EmailConfig
}

// Tipos de respuesta de envío
export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
  details?: any
}

// Tipos de templates
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  html: string
  text?: string
  variables: string[]
  category: EmailTemplateCategory
}

export type EmailTemplateCategory = 
  | 'welcome'
  | 'verification'
  | 'payment'
  | 'ticket'
  | 'notification'
  | 'reminder'
  | 'admin'
  | 'system'

// Tipos específicos para diferentes casos de uso
export interface WelcomeEmailData {
  userName: string
  userEmail: string
  loginUrl: string
}

export interface PaymentConfirmationData {
  userName: string
  userEmail: string
  rifaName: string
  ticketNumbers: string[]
  totalAmount: number
  paymentMethod: string
  paymentDate: string
  ticketUrl: string
}

export interface TicketEmailData {
  userName: string
  userEmail: string
  rifaName: string
  ticketNumbers: string[]
  ticketUrl: string
  drawDate: string
  prize: string
}

export interface VerificationEmailData {
  userName: string
  userEmail: string
  verificationCode: string
  verificationUrl: string
  expiresAt: string
}

export interface AdminNotificationData {
  adminName: string
  adminEmail: string
  notificationType: string
  message: string
  actionUrl?: string
  priority: 'low' | 'medium' | 'high'
}

// Tipos de configuración de envío masivo
export interface BulkEmailConfig {
  batchSize: number
  delayBetweenBatches: number
  maxRetries: number
  stopOnError: boolean
}

export interface BulkEmailResult {
  totalSent: number
  totalFailed: number
  errors: Array<{
    email: string
    error: string
  }>
  success: boolean
}

// Tipos de estadísticas de email
export interface EmailStats {
  totalSent: number
  totalDelivered: number
  totalBounced: number
  totalOpened: number
  totalClicked: number
  deliveryRate: number
  openRate: number
  clickRate: number
}

// Tipos de eventos de webhook
export interface EmailWebhookEvent {
  type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  messageId: string
  email: string
  timestamp: string
  data?: any
}

// Tipos de configuración de webhook
export interface WebhookConfig {
  url: string
  events: EmailWebhookEvent['type'][]
  secret?: string
}

// Tipos de validación de email
export interface EmailValidationResult {
  isValid: boolean
  isDisposable: boolean
  isRole: boolean
  isFree: boolean
  domain: string
  suggestions?: string[]
}

// Tipos de configuración de rate limiting
export interface RateLimitConfig {
  maxEmailsPerMinute: number
  maxEmailsPerHour: number
  maxEmailsPerDay: number
}

// Tipos de configuración de retry
export interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

// Tipos de logging
export interface EmailLogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'debug'
  message: string
  data?: any
  messageId?: string
  email?: string
}

// Tipos de configuración de logging
export interface LoggingConfig {
  level: EmailLogEntry['level']
  enableConsole: boolean
  enableFile: boolean
  enableDatabase: boolean
  maxLogEntries: number
}


