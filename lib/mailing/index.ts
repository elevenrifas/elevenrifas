// =====================================================
// 📧 MÓDULO DE MAILING - ELEVEN RIFAS
// =====================================================
// Exportaciones centralizadas de todo el sistema de mailing
// =====================================================

// Configuración
export * from './config/mailersend'

// Tipos
export * from './types'

// Servicios
export * from './services'

// Utilidades
export * from './utils'

// Re-exportar servicios principales para fácil acceso
export { 
  emailService, 
  templateService, 
  mailingService 
} from './services'

export { 
  emailLogger 
} from './utils'


