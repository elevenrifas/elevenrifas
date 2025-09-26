// =====================================================
// 🌙 EJEMPLOS DE PROTECCIÓN CONTRA MODO OSCURO - ELEVEN RIFAS
// =====================================================
// Ejemplos prácticos de cómo usar la protección contra modo oscuro
// =====================================================

import { 
  applyDarkModeProtection,
  createProtectedStyles,
  validateDarkModeProtection,
  updateTemplateWithDarkModeProtection,
  createProtectedEmailTemplate,
  SAFE_EMAIL_COLORS
} from '../utils/dark-mode-protection'

/**
 * Ejemplo 1: Proteger un template existente
 */
export function ejemploProtegerTemplate() {
  console.log('🌙 Ejemplo 1: Proteger template existente')
  
  const templateHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Mi Template</title>
      <style>
        body { color: #333; background: white; }
        .button { background: #dc2626; color: white; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Mi Template</h1>
        <a href="#" class="button">Mi Botón</a>
      </div>
    </body>
    </html>
  `
  
  // Aplicar protección
  const protectedHtml = applyDarkModeProtection(templateHtml)
  
  // Validar protección
  const validation = validateDarkModeProtection(protectedHtml)
  
  console.log('📊 Resultado de protección:')
  console.log(`  Protegido: ${validation.isProtected ? '✅' : '❌'}`)
  console.log(`  Meta Tags: ${validation.hasMetaTags ? '✅' : '❌'}`)
  console.log(`  Data Attributes: ${validation.hasDataAttributes ? '✅' : '❌'}`)
  console.log(`  Important Colors: ${validation.hasImportantColors ? '✅' : '❌'}`)
  
  if (validation.recommendations.length > 0) {
    console.log(`  Recomendaciones: ${validation.recommendations.join(', ')}`)
  }
  
  return { protectedHtml, validation }
}

/**
 * Ejemplo 2: Crear un template protegido desde cero
 */
export function ejemploCrearTemplateProtegido() {
  console.log('🌙 Ejemplo 2: Crear template protegido desde cero')
  
  const template = createProtectedEmailTemplate({
    title: 'Mi Nuevo Template',
    headerText: '¡Hola desde Eleven Rifas!',
    headerColor: SAFE_EMAIL_COLORS.primary,
    content: `
      <p>Este es un template completamente protegido contra modo oscuro.</p>
      <p>Los colores se mantendrán consistentes en todos los clientes de email.</p>
      <ul>
        <li>Protección contra inversión de colores</li>
        <li>Meta tags específicos</li>
        <li>Atributos de datos de protección</li>
        <li>Colores con !important</li>
      </ul>
    `,
    buttonText: 'Ver Más',
    buttonUrl: 'https://elevenrifas.com'
  })
  
  console.log('✅ Template protegido creado')
  console.log('📊 Características:')
  console.log('  - Meta tags de color-scheme')
  console.log('  - Atributos data-ogsc y data-ogsb')
  console.log('  - Colores con !important')
  console.log('  - Protección contra modo oscuro')
  
  return template
}

/**
 * Ejemplo 3: Actualizar template existente con protección
 */
export function ejemploActualizarTemplate() {
  console.log('🌙 Ejemplo 3: Actualizar template existente')
  
  const templateHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Template Original</title>
      <style>
        body { font-family: Arial; color: #333; }
        .header { background: #f8f9fa; padding: 20px; }
        .button { background: #dc2626; color: white; padding: 10px 20px; }
        .footer { color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Mi Header</h1>
      </div>
      <div class="content">
        <p>Contenido del email</p>
        <a href="#" class="button">Mi Botón</a>
      </div>
      <div class="footer">
        <p>Mi Footer</p>
      </div>
    </body>
    </html>
  `
  
  // Validar estado actual
  const validationAntes = validateDarkModeProtection(templateHtml)
  console.log('📊 Estado antes de la actualización:')
  console.log(`  Protegido: ${validationAntes.isProtected ? '✅' : '❌'}`)
  
  // Actualizar template
  const templateActualizado = updateTemplateWithDarkModeProtection(templateHtml)
  
  // Validar estado después
  const validationDespues = validateDarkModeProtection(templateActualizado)
  console.log('📊 Estado después de la actualización:')
  console.log(`  Protegido: ${validationDespues.isProtected ? '✅' : '❌'}`)
  console.log(`  Meta Tags: ${validationDespues.hasMetaTags ? '✅' : '❌'}`)
  console.log(`  Data Attributes: ${validationDespues.hasDataAttributes ? '✅' : '❌'}`)
  console.log(`  Important Colors: ${validationDespues.hasImportantColors ? '✅' : '❌'}`)
  
  return { templateActualizado, validationAntes, validationDespues }
}

/**
 * Ejemplo 4: Crear estilos CSS protegidos
 */
export function ejemploCrearEstilosProtegidos() {
  console.log('🌙 Ejemplo 4: Crear estilos CSS protegidos')
  
  const estilosBase = `
    body { font-family: Arial, sans-serif; color: #333; }
    .header { background: #dc2626; color: white; padding: 20px; }
    .button { background: #dc2626; color: white; padding: 10px 20px; }
    .footer { color: #666; font-size: 14px; }
  `
  
  const estilosProtegidos = createProtectedStyles(estilosBase)
  
  console.log('✅ Estilos protegidos creados')
  console.log('📊 Características:')
  console.log('  - Colores con !important')
  console.log('  - Protección contra modo oscuro')
  console.log('  - Atributos de datos de protección')
  console.log('  - Media queries para modo oscuro')
  
  return estilosProtegidos
}

/**
 * Ejemplo 5: Validar múltiples templates
 */
export function ejemploValidarMultiplesTemplates() {
  console.log('🌙 Ejemplo 5: Validar múltiples templates')
  
  const templates = [
    {
      name: 'Template 1 - Sin protección',
      html: '<html><body><h1>Mi Template</h1></body></html>'
    },
    {
      name: 'Template 2 - Con meta tags',
      html: `
        <html>
        <head>
          <meta name="color-scheme" content="light only">
        </head>
        <body><h1>Mi Template</h1></body>
        </html>
      `
    },
    {
      name: 'Template 3 - Completamente protegido',
      html: `
        <html>
        <head>
          <meta name="color-scheme" content="light only">
          <meta name="supported-color-schemes" content="light only">
          <meta name="x-apple-color-scheme" content="light only">
          <style>
            body { color: #333 !important; background: white !important; }
          </style>
        </head>
        <body data-ogsc data-ogsb>
          <h1>Mi Template</h1>
        </body>
        </html>
      `
    }
  ]
  
  const resultados = templates.map(template => {
    const validation = validateDarkModeProtection(template.html)
    return {
      name: template.name,
      isProtected: validation.isProtected,
      hasMetaTags: validation.hasMetaTags,
      hasDataAttributes: validation.hasDataAttributes,
      hasImportantColors: validation.hasImportantColors,
      recommendations: validation.recommendations
    }
  })
  
  console.log('📊 Resultados de validación:')
  resultados.forEach(resultado => {
    console.log(`\n${resultado.name}:`)
    console.log(`  Protegido: ${resultado.isProtected ? '✅' : '❌'}`)
    console.log(`  Meta Tags: ${resultado.hasMetaTags ? '✅' : '❌'}`)
    console.log(`  Data Attributes: ${resultado.hasDataAttributes ? '✅' : '❌'}`)
    console.log(`  Important Colors: ${resultado.hasImportantColors ? '✅' : '❌'}`)
    if (resultado.recommendations.length > 0) {
      console.log(`  Recomendaciones: ${resultado.recommendations.join(', ')}`)
    }
  })
  
  return resultados
}

/**
 * Ejemplo 6: Usar colores seguros
 */
export function ejemploUsarColoresSeguros() {
  console.log('🌙 Ejemplo 6: Usar colores seguros')
  
  console.log('🎨 Colores seguros disponibles:')
  Object.entries(SAFE_EMAIL_COLORS).forEach(([nombre, color]) => {
    console.log(`  ${nombre}: ${color}`)
  })
  
  const templateConColoresSeguros = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="color-scheme" content="light only">
      <style>
        body { 
          color: ${SAFE_EMAIL_COLORS.textPrimary} !important;
          background: ${SAFE_EMAIL_COLORS.background} !important;
        }
        .header { 
          background: ${SAFE_EMAIL_COLORS.primary} !important;
          color: white !important;
        }
        .button { 
          background: ${SAFE_EMAIL_COLORS.primary} !important;
          color: white !important;
        }
        .footer { 
          color: ${SAFE_EMAIL_COLORS.textSecondary} !important;
        }
      </style>
    </head>
    <body data-ogsc data-ogsb>
      <div class="header" data-ogsc data-ogsb>
        <h1>Mi Template con Colores Seguros</h1>
      </div>
      <div class="content" data-ogsc data-ogsb>
        <p>Este template usa colores seguros que no cambian en modo oscuro.</p>
        <a href="#" class="button" data-ogsc data-ogsb>Mi Botón</a>
      </div>
      <div class="footer" data-ogsc data-ogsb>
        <p>Mi Footer</p>
      </div>
    </body>
    </html>
  `
  
  console.log('✅ Template con colores seguros creado')
  
  return templateConColoresSeguros
}

/**
 * Ejecutar todos los ejemplos
 */
export function ejecutarTodosLosEjemplos() {
  console.log('🚀 Ejecutando ejemplos de protección contra modo oscuro...\n')
  
  try {
    ejemploProtegerTemplate()
    console.log('\n' + '='.repeat(50) + '\n')
    
    ejemploCrearTemplateProtegido()
    console.log('\n' + '='.repeat(50) + '\n')
    
    ejemploActualizarTemplate()
    console.log('\n' + '='.repeat(50) + '\n')
    
    ejemploCrearEstilosProtegidos()
    console.log('\n' + '='.repeat(50) + '\n')
    
    ejemploValidarMultiplesTemplates()
    console.log('\n' + '='.repeat(50) + '\n')
    
    ejemploUsarColoresSeguros()
    
    console.log('\n✅ Todos los ejemplos ejecutados correctamente')
  } catch (error) {
    console.error('\n❌ Error ejecutando ejemplos:', error)
  }
}

// Exportar función principal
export default ejecutarTodosLosEjemplos

