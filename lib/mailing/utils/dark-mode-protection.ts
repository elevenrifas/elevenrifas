// =====================================================
// 🌙 PROTECCIÓN CONTRA MODO OSCURO - ELEVEN RIFAS
// =====================================================
// Utilidades para prevenir que los clientes de email cambien colores en modo oscuro
// =====================================================

/**
 * Meta tags necesarios para prevenir cambios de color en modo oscuro
 */
export const DARK_MODE_META_TAGS = `
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="x-apple-color-scheme" content="light only">
`

/**
 * Estilos CSS para forzar colores y prevenir cambios en modo oscuro
 */
export const DARK_MODE_PROTECTION_CSS = `
  /* Protección contra modo oscuro */
  [data-ogsc] { color: inherit !important; }
  [data-ogsb] { background-color: inherit !important; }
  
  /* Forzar colores específicos */
  .force-color { color: inherit !important; }
  .force-bg { background-color: inherit !important; }
  
  /* Prevenir inversión de colores */
  * { -webkit-text-size-adjust: 100%; }
  
  /* Protección para elementos específicos */
  body, div, p, h1, h2, h3, h4, h5, h6, span, a, td, th {
    color: inherit !important;
    background-color: inherit !important;
  }
  
  /* Protección para botones */
  .button, .btn {
    color: inherit !important;
    background-color: inherit !important;
    border-color: inherit !important;
  }
  
  /* Protección para tablas */
  table, tr, td, th {
    background-color: inherit !important;
    color: inherit !important;
  }
`

/**
 * Aplica protección contra modo oscuro a un template HTML
 */
export function applyDarkModeProtection(html: string): string {
  // Agregar meta tags si no existen
  if (!html.includes('color-scheme')) {
    html = html.replace(
      '<head>',
      `<head>\n${DARK_MODE_META_TAGS}`
    )
  }

  // Agregar estilos de protección si no existen
  if (!html.includes('data-ogsc')) {
    html = html.replace(
      '</style>',
      `\n${DARK_MODE_PROTECTION_CSS}\n</style>`
    )
  }

  // Agregar atributos de protección a elementos clave
  html = html.replace(
    /<body([^>]*)>/g,
    '<body$1 data-ogsc data-ogsb>'
  )

  // Agregar atributos a contenedores principales
  html = html.replace(
    /<div class="container"([^>]*)>/g,
    '<div class="container"$1 data-ogsc data-ogsb>'
  )

  // Agregar atributos a botones
  html = html.replace(
    /<a class="button"([^>]*)>/g,
    '<a class="button"$1 data-ogsc data-ogsb>'
  )

  return html
}

/**
 * Crea estilos CSS con colores forzados para prevenir cambios
 */
export function createProtectedStyles(baseStyles: string): string {
  return `
    ${baseStyles}
    
    /* Protección contra modo oscuro */
    [data-ogsc] { color: inherit !important; }
    [data-ogsc] * { color: inherit !important; }
    [data-ogsb] { background-color: inherit !important; }
    [data-ogsb] * { background-color: inherit !important; }
    
    /* Forzar colores específicos en elementos críticos */
    .header { 
      background: linear-gradient(135deg, #dc2626, #ef4444) !important;
      color: white !important;
    }
    .header * { color: white !important; }
    
    .button { 
      background: #dc2626 !important;
      color: white !important;
    }
    .button * { color: white !important; }
    
    .footer { 
      color: #666 !important;
    }
    .footer * { color: #666 !important; }
    
    /* Protección para texto principal */
    body { 
      color: #333 !important;
      background-color: white !important;
    }
    
    /* Protección para contenedores */
    .container { 
      background-color: white !important;
    }
    
    /* Prevenir inversión de colores en iOS */
    @media (prefers-color-scheme: dark) {
      * { color-scheme: light only !important; }
    }
  `
}

/**
 * Aplica protección completa a un template de email
 */
export function protectEmailTemplate(template: {
  html: string
  subject: string
  text?: string
}): {
  html: string
  subject: string
  text?: string
} {
  return {
    ...template,
    html: applyDarkModeProtection(template.html)
  }
}

/**
 * Colores seguros para emails que no cambian en modo oscuro
 */
export const SAFE_EMAIL_COLORS = {
  // Colores principales
  primary: '#dc2626',
  primaryLight: '#ef4444',
  primaryDark: '#b91c1c',
  
  // Colores de texto
  textPrimary: '#1f2937',
  textSecondary: '#6b7280',
  textLight: '#9ca3af',
  
  // Colores de fondo
  background: '#ffffff',
  backgroundLight: '#f9fafb',
  backgroundGray: '#f3f4f6',
  
  // Colores de estado
  success: '#10b981',
  warning: '#f59e0b',
  error: '#dc2626',
  info: '#3b82f6',
  
  // Colores neutros
  white: '#ffffff',
  black: '#000000',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827'
} as const

/**
 * Genera CSS con colores seguros
 */
export function generateSafeEmailCSS(): string {
  return `
    /* Colores seguros para emails */
    :root {
      --primary: ${SAFE_EMAIL_COLORS.primary};
      --primary-light: ${SAFE_EMAIL_COLORS.primaryLight};
      --primary-dark: ${SAFE_EMAIL_COLORS.primaryDark};
      --text-primary: ${SAFE_EMAIL_COLORS.textPrimary};
      --text-secondary: ${SAFE_EMAIL_COLORS.textSecondary};
      --background: ${SAFE_EMAIL_COLORS.background};
      --background-light: ${SAFE_EMAIL_COLORS.backgroundLight};
    }
    
    /* Aplicar colores seguros */
    .email-safe {
      color: var(--text-primary) !important;
      background-color: var(--background) !important;
    }
    
    .email-primary {
      color: var(--primary) !important;
    }
    
    .email-bg-primary {
      background-color: var(--primary) !important;
      color: white !important;
    }
  `
}

