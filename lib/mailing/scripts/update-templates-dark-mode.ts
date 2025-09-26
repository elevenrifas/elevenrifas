// =====================================================
// 🔄 SCRIPT DE ACTUALIZACIÓN DE TEMPLATES - ELEVEN RIFAS
// =====================================================
// Script para actualizar todos los templates con protección contra modo oscuro
// =====================================================

import { updateTemplateWithDarkModeProtection, validateDarkModeProtection } from '../utils/template-updater'
import { 
  WINNER_NOTIFICATION_TEMPLATE,
  SYSTEM_NOTIFICATION_TEMPLATE,
  SYSTEM_ERROR_TEMPLATE
} from '../templates/system-templates'
import { 
  REMINDER_DRAW_TEMPLATE,
  REMINDER_PAYMENT_TEMPLATE,
  REMINDER_RIFA_ENDING_TEMPLATE
} from '../templates/reminder-templates'

/**
 * Actualiza un template con protección contra modo oscuro
 */
function updateTemplate(template: any, templateName: string) {
  console.log(`🔄 Actualizando template: ${templateName}`)
  
  // Validar protección actual
  const validation = validateDarkModeProtection(template.html)
  console.log(`📊 Estado actual:`, {
    protegido: validation.isProtected ? '✅' : '❌',
    metaTags: validation.hasMetaTags ? '✅' : '❌',
    dataAttributes: validation.hasDataAttributes ? '✅' : '❌',
    importantColors: validation.hasImportantColors ? '✅' : '❌'
  })
  
  if (validation.recommendations.length > 0) {
    console.log(`💡 Recomendaciones:`, validation.recommendations)
  }
  
  // Actualizar template
  const updatedHtml = updateTemplateWithDarkModeProtection(template.html)
  
  // Validar protección después de la actualización
  const newValidation = validateDarkModeProtection(updatedHtml)
  console.log(`📊 Estado después:`, {
    protegido: newValidation.isProtected ? '✅' : '❌',
    metaTags: newValidation.hasMetaTags ? '✅' : '❌',
    dataAttributes: newValidation.hasDataAttributes ? '✅' : '❌',
    importantColors: newValidation.hasImportantColors ? '✅' : '❌'
  })
  
  return {
    ...template,
    html: updatedHtml
  }
}

/**
 * Actualiza todos los templates del sistema
 */
export function updateAllTemplates() {
  console.log('🚀 Iniciando actualización de templates con protección contra modo oscuro...\n')
  
  const templates = [
    { template: WINNER_NOTIFICATION_TEMPLATE, name: 'Notificación de Ganador' },
    { template: SYSTEM_NOTIFICATION_TEMPLATE, name: 'Notificación del Sistema' },
    { template: SYSTEM_ERROR_TEMPLATE, name: 'Error del Sistema' },
    { template: REMINDER_DRAW_TEMPLATE, name: 'Recordatorio de Sorteo' },
    { template: REMINDER_PAYMENT_TEMPLATE, name: 'Recordatorio de Pago' },
    { template: REMINDER_RIFA_ENDING_TEMPLATE, name: 'Recordatorio de Rifa Finalizando' }
  ]
  
  const updatedTemplates = []
  
  for (const { template, name } of templates) {
    try {
      const updated = updateTemplate(template, name)
      updatedTemplates.push({ name, template: updated })
      console.log(`✅ ${name} actualizado correctamente\n`)
    } catch (error) {
      console.error(`❌ Error actualizando ${name}:`, error)
    }
  }
  
  console.log('📊 Resumen de actualización:')
  console.log(`✅ Templates actualizados: ${updatedTemplates.length}`)
  console.log(`❌ Errores: ${templates.length - updatedTemplates.length}`)
  
  return updatedTemplates
}

/**
 * Genera código para reemplazar templates en archivos
 */
export function generateTemplateReplacementCode(updatedTemplates: any[]) {
  console.log('\n📝 Código generado para reemplazar templates:\n')
  
  updatedTemplates.forEach(({ name, template }) => {
    console.log(`// Template: ${name}`)
    console.log(`export const ${template.id.toUpperCase().replace(/-/g, '_')}_TEMPLATE: EmailTemplate = {`)
    console.log(`  id: '${template.id}',`)
    console.log(`  name: '${template.name}',`)
    console.log(`  subject: \`${template.subject}\`,`)
    console.log(`  html: \`${template.html}\`,`)
    if (template.text) {
      console.log(`  text: \`${template.text}\`,`)
    }
    console.log(`  variables: [${template.variables.map((v: string) => `'${v}'`).join(', ')}],`)
    console.log(`  category: '${template.category}'`)
    console.log(`}\n`)
  })
}

/**
 * Valida todos los templates del sistema
 */
export function validateAllTemplates() {
  console.log('🔍 Validando protección contra modo oscuro en todos los templates...\n')
  
  const templates = [
    { template: WINNER_NOTIFICATION_TEMPLATE, name: 'Notificación de Ganador' },
    { template: SYSTEM_NOTIFICATION_TEMPLATE, name: 'Notificación del Sistema' },
    { template: SYSTEM_ERROR_TEMPLATE, name: 'Error del Sistema' },
    { template: REMINDER_DRAW_TEMPLATE, name: 'Recordatorio de Sorteo' },
    { template: REMINDER_PAYMENT_TEMPLATE, name: 'Recordatorio de Pago' },
    { template: REMINDER_RIFA_ENDING_TEMPLATE, name: 'Recordatorio de Rifa Finalizando' }
  ]
  
  const results = templates.map(({ template, name }) => {
    const validation = validateDarkModeProtection(template.html)
    return {
      name,
      isProtected: validation.isProtected,
      hasMetaTags: validation.hasMetaTags,
      hasDataAttributes: validation.hasDataAttributes,
      hasImportantColors: validation.hasImportantColors,
      recommendations: validation.recommendations
    }
  })
  
  console.log('📊 Resultados de validación:')
  results.forEach(result => {
    console.log(`\n${result.name}:`)
    console.log(`  Protegido: ${result.isProtected ? '✅' : '❌'}`)
    console.log(`  Meta Tags: ${result.hasMetaTags ? '✅' : '❌'}`)
    console.log(`  Data Attributes: ${result.hasDataAttributes ? '✅' : '❌'}`)
    console.log(`  Important Colors: ${result.hasImportantColors ? '✅' : '❌'}`)
    if (result.recommendations.length > 0) {
      console.log(`  Recomendaciones: ${result.recommendations.join(', ')}`)
    }
  })
  
  const protectedCount = results.filter(r => r.isProtected).length
  console.log(`\n📈 Resumen: ${protectedCount}/${results.length} templates están protegidos`)
  
  return results
}

/**
 * Ejecuta todas las funciones de actualización
 */
export function runFullUpdate() {
  console.log('🚀 Ejecutando actualización completa de templates...\n')
  
  // 1. Validar estado actual
  console.log('1️⃣ Validando estado actual...')
  validateAllTemplates()
  
  // 2. Actualizar templates
  console.log('\n2️⃣ Actualizando templates...')
  const updatedTemplates = updateAllTemplates()
  
  // 3. Generar código de reemplazo
  console.log('\n3️⃣ Generando código de reemplazo...')
  generateTemplateReplacementCode(updatedTemplates)
  
  // 4. Validar estado final
  console.log('\n4️⃣ Validando estado final...')
  validateAllTemplates()
  
  console.log('\n✅ Actualización completa finalizada')
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runFullUpdate()
}

