// =====================================================
// 📧 EJEMPLOS DE USO - ELEVEN RIFAS
// =====================================================
// Ejemplos prácticos de uso del sistema de mailing
// =====================================================

import { 
  mailingService, 
  emailService, 
  templateService,
  validateEmail,
  emailLogger 
} from './index'

/**
 * Ejemplo 1: Envío de email de bienvenida
 */
export async function ejemploBienvenida() {
  console.log('📧 Ejemplo: Email de Bienvenida')
  
  const result = await mailingService.sendWelcomeEmail(
    { 
      email: 'nuevo@usuario.com', 
      name: 'Juan Pérez' 
    },
    {
      userName: 'Juan Pérez',
      userEmail: 'nuevo@usuario.com',
      loginUrl: 'https://elevenrifas.com/login'
    }
  )
  
  if (result.success) {
    console.log('✅ Email de bienvenida enviado:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 2: Confirmación de pago
 */
export async function ejemploConfirmacionPago() {
  console.log('💳 Ejemplo: Confirmación de Pago')
  
  const result = await mailingService.sendPaymentConfirmation(
    { 
      email: 'cliente@ejemplo.com', 
      name: 'María González' 
    },
    {
      userName: 'María González',
      rifaName: 'Rifa del Auto Toyota Corolla 2024',
      ticketNumbers: '001, 002, 003, 004, 005',
      totalAmount: 25000,
      paymentMethod: 'Transferencia Bancaria',
      paymentDate: '2024-01-15 14:30:00',
      ticketUrl: 'https://elevenrifas.com/mi-ticket/12345'
    }
  )
  
  if (result.success) {
    console.log('✅ Confirmación de pago enviada:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 3: Envío de ticket
 */
export async function ejemploTicket() {
  console.log('🎫 Ejemplo: Envío de Ticket')
  
  const result = await mailingService.sendTicketEmail(
    { 
      email: 'participante@ejemplo.com', 
      name: 'Carlos Rodríguez' 
    },
    {
      userName: 'Carlos Rodríguez',
      rifaName: 'Rifa del Auto Toyota Corolla 2024',
      ticketNumbers: '001, 002, 003',
      ticketUrl: 'https://elevenrifas.com/mi-ticket/12345',
      drawDate: '15 de Febrero de 2024',
      prize: 'Toyota Corolla 2024 Modelo Híbrido'
    }
  )
  
  if (result.success) {
    console.log('✅ Ticket enviado:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 4: Verificación de email
 */
export async function ejemploVerificacion() {
  console.log('🔐 Ejemplo: Verificación de Email')
  
  const verificationCode = Math.random().toString(36).substr(2, 6).toUpperCase()
  
  const result = await mailingService.sendVerificationEmail(
    { 
      email: 'verificar@ejemplo.com', 
      name: 'Ana López' 
    },
    {
      userName: 'Ana López',
      verificationCode,
      verificationUrl: `https://elevenrifas.com/verify?code=${verificationCode}`,
      expiresAt: '2024-01-16 14:30:00'
    }
  )
  
  if (result.success) {
    console.log('✅ Email de verificación enviado:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 5: Notificación administrativa
 */
export async function ejemploNotificacionAdmin() {
  console.log('👨‍💼 Ejemplo: Notificación Administrativa')
  
  const result = await mailingService.sendAdminNotification(
    { 
      email: 'admin@elevenrifas.com', 
      name: 'Administrador' 
    },
    {
      adminName: 'Administrador',
      notificationType: 'Nuevo Pago Reportado',
      message: 'Se ha reportado un nuevo pago por $25,000 en la rifa "Auto Toyota Corolla 2024"',
      actionUrl: 'https://elevenrifas.com/admin/pagos',
      priority: 'high'
    }
  )
  
  if (result.success) {
    console.log('✅ Notificación admin enviada:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 6: Envío masivo
 */
export async function ejemploEnvioMasivo() {
  console.log('📬 Ejemplo: Envío Masivo')
  
  const recipients = [
    { email: 'usuario1@ejemplo.com', name: 'Usuario 1' },
    { email: 'usuario2@ejemplo.com', name: 'Usuario 2' },
    { email: 'usuario3@ejemplo.com', name: 'Usuario 3' }
  ]
  
  const result = await mailingService.sendBulkEmail(
    recipients,
    'welcome',
    {
      userName: '{{name}}', // Se reemplaza con el nombre de cada destinatario
      userEmail: '{{email}}', // Se reemplaza con el email de cada destinatario
      loginUrl: 'https://elevenrifas.com/login'
    },
    {
      tags: ['welcome', 'bulk'],
      bulkConfig: {
        batchSize: 2,
        delayBetweenBatches: 1000
      }
    }
  )
  
  console.log('📊 Resultado envío masivo:', {
    totalSent: result.totalSent,
    totalFailed: result.totalFailed,
    success: result.success
  })
  
  if (result.errors.length > 0) {
    console.log('❌ Errores:', result.errors)
  }
  
  return result
}

/**
 * Ejemplo 7: Email personalizado
 */
export async function ejemploEmailPersonalizado() {
  console.log('✉️ Ejemplo: Email Personalizado')
  
  const result = await mailingService.sendCustomEmail(
    { 
      email: 'personalizado@ejemplo.com', 
      name: 'Usuario Personalizado' 
    },
    'welcome',
    {
      userName: 'Usuario Personalizado',
      userEmail: 'personalizado@ejemplo.com',
      loginUrl: 'https://elevenrifas.com/login'
    },
    {
      from: { 
        email: 'personalizado@elevenrifas.com', 
        name: 'Equipo Eleven Rifas' 
      },
      tags: ['personalizado', 'test'],
      cc: [{ email: 'copia@ejemplo.com', name: 'Copia' }]
    }
  )
  
  if (result.success) {
    console.log('✅ Email personalizado enviado:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 8: Validación de emails
 */
export function ejemploValidacionEmails() {
  console.log('🔍 Ejemplo: Validación de Emails')
  
  const emails = [
    'usuario@ejemplo.com',
    'email-invalido',
    'admin@ejemplo.com',
    'test@10minutemail.com', // Email desechable
    'info@ejemplo.com' // Email de rol
  ]
  
  console.log('📋 Validando emails:')
  emails.forEach(email => {
    const validation = validateEmail(email)
    console.log(`${email}:`, {
      válido: validation.isValid ? '✅' : '❌',
      desechable: validation.isDisposable ? '⚠️' : '✅',
      rol: validation.isRole ? '⚠️' : '✅',
      gratuito: validation.isFree ? 'ℹ️' : '✅'
    })
  })
  
  return emails.map(email => ({ email, validation: validateEmail(email) }))
}

/**
 * Ejemplo 9: Uso de templates
 */
export function ejemploUsoTemplates() {
  console.log('📄 Ejemplo: Uso de Templates')
  
  // Obtener todos los templates
  const templates = templateService.getAllTemplates()
  console.log('📋 Templates disponibles:', templates.map(t => t.name))
  
  // Obtener template específico
  const welcomeTemplate = templateService.getTemplate('welcome')
  if (welcomeTemplate) {
    console.log('📄 Template de bienvenida:', {
      id: welcomeTemplate.id,
      name: welcomeTemplate.name,
      variables: welcomeTemplate.variables
    })
  }
  
  // Renderizar template
  const rendered = templateService.renderTemplate('welcome', {
    userName: 'Usuario de Prueba',
    userEmail: 'prueba@ejemplo.com',
    loginUrl: 'https://elevenrifas.com/login'
  })
  
  if (rendered) {
    console.log('🎨 Template renderizado:', {
      subject: rendered.subject,
      hasHtml: !!rendered.html,
      hasText: !!rendered.text
    })
  }
  
  return { templates, rendered }
}

/**
 * Ejemplo 10: Logging y monitoreo
 */
export function ejemploLogging() {
  console.log('📊 Ejemplo: Logging y Monitoreo')
  
  // Registrar algunos logs de ejemplo
  emailLogger.info('Iniciando envío de email', { recipient: 'test@ejemplo.com' })
  emailLogger.warn('Rate limit cerca del límite', { current: 45, limit: 50 })
  emailLogger.error('Error de conexión', { error: 'Connection timeout' })
  
  // Obtener estadísticas
  const stats = emailLogger.getLogStats()
  console.log('📈 Estadísticas de logs:', stats)
  
  // Obtener logs por nivel
  const errorLogs = emailLogger.getLogsByLevel('error')
  console.log('❌ Logs de error:', errorLogs.length)
  
  // Obtener logs recientes
  const recentLogs = emailLogger.getLogsByDateRange(
    new Date(Date.now() - 60 * 60 * 1000), // Última hora
    new Date()
  )
  console.log('🕐 Logs de la última hora:', recentLogs.length)
  
  return { stats, errorLogs, recentLogs }
}

/**
 * Ejemplo 11: Email de prueba
 */
export async function ejemploEmailPrueba() {
  console.log('🧪 Ejemplo: Email de Prueba')
  
  const result = await mailingService.sendTestEmail(
    { 
      email: 'prueba@ejemplo.com', 
      name: 'Usuario de Prueba' 
    },
    'Email de Prueba - Sistema de Mailing'
  )
  
  if (result.success) {
    console.log('✅ Email de prueba enviado:', result.messageId)
  } else {
    console.error('❌ Error:', result.error)
  }
  
  return result
}

/**
 * Ejemplo 12: Rate limiting
 */
export function ejemploRateLimiting() {
  console.log('⏱️ Ejemplo: Rate Limiting')
  
  const stats = mailingService.getRateLimitStats()
  console.log('📊 Estadísticas de rate limiting:', stats)
  
  // Limpiar contadores si es necesario
  if (stats.day > 1000) {
    console.log('🧹 Limpiando contadores de rate limiting...')
    mailingService.cleanupRateLimitCounters()
  }
  
  return stats
}

/**
 * Ejecutar todos los ejemplos
 */
export async function ejecutarTodosLosEjemplos() {
  console.log('🚀 Ejecutando todos los ejemplos...\n')
  
  try {
    // Ejemplos que no requieren configuración
    ejemploValidacionEmails()
    ejemploUsoTemplates()
    ejemploLogging()
    ejemploRateLimiting()
    
    // Ejemplos que requieren configuración de MailerSend
    // Descomenta estos si tienes la configuración lista
    // await ejemploBienvenida()
    // await ejemploConfirmacionPago()
    // await ejemploTicket()
    // await ejemploVerificacion()
    // await ejemploNotificacionAdmin()
    // await ejemploEnvioMasivo()
    // await ejemploEmailPersonalizado()
    // await ejemploEmailPrueba()
    
    console.log('\n✅ Todos los ejemplos ejecutados correctamente')
  } catch (error) {
    console.error('\n❌ Error ejecutando ejemplos:', error)
  }
}

// Exportar función principal
export default ejecutarTodosLosEjemplos


