/**
 * 🎯 CONFIGURACIÓN DE LA APLICACIÓN
 * 
 * Configuración general de la aplicación Eleven Rifas
 */

module.exports = {
  // Información básica de la aplicación
  name: 'Eleven Rifas',
  version: '1.0.0',
  description: 'Sistema de rifas online',
  
  // Configuración del entorno
  environment: process.env.NODE_ENV || 'development',
  
  // Configuración de la aplicación
  app: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || 'localhost',
    baseUrl: process.env.BASE_URL || 'http://localhost:3000'
  },
  
  // Configuración de sesiones
  session: {
    secret: process.env.SESSION_SECRET || 'eleven-rifas-secret',
    maxAge: 24 * 60 * 60 * 1000, // 24 horas
    secure: process.env.NODE_ENV === 'production'
  },
  
  // Configuración de archivos
  uploads: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    uploadDir: './uploads'
  },
  
  // Configuración de emails
  email: {
    from: 'noreply@elevenrifas.com',
    templates: {
      welcome: 'welcome',
      resetPassword: 'reset-password',
      ticketConfirmation: 'ticket-confirmation'
    }
  },
  
  // Configuración de pagos
  payments: {
    currencies: ['USD', 'VES'],
    methods: ['zelle', 'pago_movil', 'binance'],
    minAmount: 1.00,
    maxAmount: 10000.00
  },
  
  // Configuración de seguridad
  security: {
    bcryptRounds: 12,
    jwtSecret: process.env.JWT_SECRET || 'eleven-rifas-jwt-secret',
    jwtExpiresIn: '7d',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 100 // máximo 100 requests por ventana
    }
  },
  
  // Configuración de caché
  cache: {
    ttl: 5 * 60, // 5 minutos
    maxKeys: 1000
  }
};
