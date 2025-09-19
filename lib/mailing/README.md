# 📧 Sistema de Mailing - Eleven Rifas

Sistema completo de envío de emails usando MailerSend para la aplicación Eleven Rifas.

## 🚀 Características

- ✅ Integración completa con MailerSend
- ✅ Templates HTML y texto responsivos
- ✅ Sistema de rate limiting
- ✅ Reintentos automáticos
- ✅ Validación de emails
- ✅ Logging completo
- ✅ Envío masivo
- ✅ Templates predefinidos para casos comunes

## 📁 Estructura

```
lib/mailing/
├── config/           # Configuración de MailerSend
├── services/         # Servicios principales
├── templates/        # Templates de email
├── types/           # Tipos TypeScript
├── utils/           # Utilidades y helpers
└── index.ts         # Exportaciones principales
```

## ⚙️ Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# MailerSend Configuration
MAILERSEND_API_KEY=tu_api_key_aqui
MAILERSEND_FROM_EMAIL=noreply@elevenrifas.com
MAILERSEND_FROM_NAME=Eleven Rifas
MAILERSEND_SUPPORT_EMAIL=support@elevenrifas.com
```

### Configuración Inicial

```typescript
import { validateMailerSendConfig } from '@/lib/mailing'

// Validar configuración
const config = validateMailerSendConfig()
if (!config.isValid) {
  console.error('Configuración inválida:', config.errors)
}
```

## 🎯 Uso Básico

### Envío de Email Simple

```typescript
import { mailingService } from '@/lib/mailing'

// Enviar email de bienvenida
const result = await mailingService.sendWelcomeEmail(
  { email: 'usuario@ejemplo.com', name: 'Juan Pérez' },
  {
    userName: 'Juan Pérez',
    userEmail: 'usuario@ejemplo.com',
    loginUrl: 'https://elevenrifas.com/login'
  }
)

if (result.success) {
  console.log('Email enviado:', result.messageId)
} else {
  console.error('Error:', result.error)
}
```

### Envío de Confirmación de Pago

```typescript
const result = await mailingService.sendPaymentConfirmation(
  { email: 'usuario@ejemplo.com', name: 'Juan Pérez' },
  {
    userName: 'Juan Pérez',
    rifaName: 'Rifa del Auto',
    ticketNumbers: '001, 002, 003',
    totalAmount: 15000,
    paymentMethod: 'Transferencia',
    paymentDate: '2024-01-15',
    ticketUrl: 'https://elevenrifas.com/mi-ticket/123'
  }
)
```

### Envío de Ticket

```typescript
const result = await mailingService.sendTicketEmail(
  { email: 'usuario@ejemplo.com', name: 'Juan Pérez' },
  {
    userName: 'Juan Pérez',
    rifaName: 'Rifa del Auto',
    ticketNumbers: '001, 002, 003',
    ticketUrl: 'https://elevenrifas.com/mi-ticket/123',
    drawDate: '2024-02-15',
    prize: 'Toyota Corolla 2024'
  }
)
```

## 📧 Templates Disponibles

### Templates Principales

- `welcome` - Email de bienvenida
- `payment-confirmation` - Confirmación de pago
- `ticket` - Ticket de rifa
- `verification` - Verificación de email
- `admin-notification` - Notificación administrativa

### Templates de Recordatorio

- `reminder-draw` - Recordatorio de sorteo próximo
- `reminder-payment` - Recordatorio de pago pendiente
- `reminder-rifa-ending` - Recordatorio de rifa finalizando

### Templates del Sistema

- `winner-notification` - Notificación de ganador
- `system-notification` - Notificación del sistema
- `system-error` - Error del sistema

## 🔧 Servicios Disponibles

### EmailService

Servicio de bajo nivel para envío de emails.

```typescript
import { emailService } from '@/lib/mailing'

// Envío individual
const result = await emailService.sendEmail({
  to: { email: 'usuario@ejemplo.com', name: 'Juan Pérez' },
  content: {
    subject: 'Asunto del email',
    html: '<h1>Contenido HTML</h1>',
    text: 'Contenido texto'
  }
})

// Envío masivo
const bulkResult = await emailService.sendBulkEmails([
  // Array de EmailMessage
], {
  batchSize: 50,
  delayBetweenBatches: 1000
})
```

### TemplateService

Servicio para manejo de templates.

```typescript
import { templateService } from '@/lib/mailing'

// Obtener template
const template = templateService.getTemplate('welcome')

// Renderizar template
const rendered = templateService.renderTemplate('welcome', {
  userName: 'Juan Pérez',
  userEmail: 'usuario@ejemplo.com'
})
```

### MailingService

Servicio de alto nivel que combina email y templates.

```typescript
import { mailingService } from '@/lib/mailing'

// Envío con template personalizado
const result = await mailingService.sendCustomEmail(
  { email: 'usuario@ejemplo.com', name: 'Juan Pérez' },
  'welcome',
  { userName: 'Juan Pérez' },
  {
    tags: ['welcome', 'user-registration'],
    from: { email: 'bienvenida@elevenrifas.com', name: 'Equipo Eleven Rifas' }
  }
)
```

## 🛠️ Utilidades

### Validación de Emails

```typescript
import { validateEmail, filterValidEmails } from '@/lib/mailing'

// Validar email individual
const validation = validateEmail('usuario@ejemplo.com')
console.log(validation.isValid) // true
console.log(validation.isDisposable) // false

// Filtrar emails válidos
const validEmails = filterValidEmails([
  'usuario@ejemplo.com',
  'email-invalido',
  'otro@ejemplo.com'
])
// Resultado: ['usuario@ejemplo.com', 'otro@ejemplo.com']
```

### Formateo de Emails

```typescript
import { formatEmailDisplay, formatCurrency } from '@/lib/mailing'

// Formatear email para mostrar
const display = formatEmailDisplay('usuario@ejemplo.com', 'Juan Pérez')
// Resultado: "Juan Pérez <usuario@ejemplo.com>"

// Formatear moneda
const currency = formatCurrency(15000, 'USD')
// Resultado: "$15,000.00"
```

### Logging

```typescript
import { emailLogger } from '@/lib/mailing'

// Configurar logging
emailLogger.updateConfig({
  level: 'debug',
  enableConsole: true
})

// Registrar logs
emailLogger.info('Email enviado exitosamente', { messageId: '123' })
emailLogger.error('Error enviando email', { error: 'Rate limit exceeded' })

// Obtener estadísticas
const stats = emailLogger.getLogStats()
console.log(stats.total) // Total de logs
console.log(stats.byLevel) // Logs por nivel
```

## 📊 Rate Limiting

El sistema incluye rate limiting automático:

```typescript
import { mailingService } from '@/lib/mailing'

// Obtener estadísticas de rate limiting
const stats = mailingService.getRateLimitStats()
console.log(stats.minute) // Emails enviados en el último minuto
console.log(stats.hour)   // Emails enviados en la última hora
console.log(stats.day)    // Emails enviados hoy

// Limpiar contadores
mailingService.cleanupRateLimitCounters()
```

## 🧪 Testing

### Email de Prueba

```typescript
import { mailingService } from '@/lib/mailing'

// Enviar email de prueba
const result = await mailingService.sendTestEmail(
  { email: 'test@ejemplo.com', name: 'Usuario de Prueba' },
  'Email de Prueba - Eleven Rifas'
)
```

## 🔍 Monitoreo

### Estadísticas de Logs

```typescript
import { emailLogger } from '@/lib/mailing'

// Obtener estadísticas
const stats = emailLogger.getLogStats()
console.log({
  total: stats.total,
  errors: stats.byLevel.error,
  recentErrors: stats.recentErrors
})
```

### Logs por Email

```typescript
// Obtener logs de un email específico
const emailLogs = emailLogger.getLogsByEmail('usuario@ejemplo.com')

// Obtener logs de un messageId
const messageLogs = emailLogger.getLogsByMessageId('msg_123')
```

## 🚨 Manejo de Errores

```typescript
import { mailingService } from '@/lib/mailing'

try {
  const result = await mailingService.sendWelcomeEmail(recipient, data)
  
  if (!result.success) {
    console.error('Error enviando email:', result.error)
    // Manejar error específico
  }
} catch (error) {
  console.error('Error inesperado:', error)
  // Manejar error general
}
```

## 📝 Notas Importantes

1. **Configuración**: Asegúrate de configurar correctamente las variables de entorno de MailerSend.

2. **Rate Limiting**: El sistema respeta los límites de MailerSend automáticamente.

3. **Templates**: Los templates incluyen variables que se reemplazan automáticamente.

4. **Logging**: Todos los envíos se registran para monitoreo y debugging.

5. **Validación**: Los emails se validan antes del envío para evitar errores.

## 🔗 Enlaces Útiles

- [Documentación de MailerSend](https://developers.mailersend.com/)
- [API de MailerSend](https://api.mailersend.com/v1/)
- [Templates de Email](https://developers.mailersend.com/email/templates)


