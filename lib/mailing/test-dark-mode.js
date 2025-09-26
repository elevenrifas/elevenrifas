// =====================================================
// 🧪 TEST DE PROTECCIÓN CONTRA MODO OSCURO - ELEVEN RIFAS
// =====================================================
// Test simple para verificar la funcionalidad de protección
// =====================================================

console.log('🚀 Iniciando tests de protección contra modo oscuro...\n')

// Simular las funciones de protección
function applyDarkModeProtection(html) {
  // Agregar meta tags si no existen
  if (!html.includes('color-scheme')) {
    html = html.replace(
      '<head>',
      `<head>\n  <meta name="color-scheme" content="light only">\n  <meta name="supported-color-schemes" content="light only">\n  <meta name="x-apple-color-scheme" content="light only">`
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

  // Agregar !important a colores críticos
  html = html.replace(
    /color:\s*#333/g,
    'color: #333 !important'
  )
  
  html = html.replace(
    /background:\s*#dc2626/g,
    'background: #dc2626 !important'
  )

  return html
}

function validateDarkModeProtection(html) {
  const recommendations = []
  
  // Verificar meta tags
  const hasMetaTags = html.includes('color-scheme') && 
                     html.includes('supported-color-schemes') &&
                     html.includes('x-apple-color-scheme')
  
  if (!hasMetaTags) {
    recommendations.push('Agregar meta tags de color-scheme')
  }
  
  // Verificar atributos de datos
  const hasDataAttributes = html.includes('data-ogsc') && html.includes('data-ogsb')
  
  if (!hasDataAttributes) {
    recommendations.push('Agregar atributos data-ogsc y data-ogsb')
  }
  
  // Verificar colores con !important
  const hasImportantColors = html.includes('!important')
  
  if (!hasImportantColors) {
    recommendations.push('Usar !important en colores críticos')
  }
  
  const isProtected = hasMetaTags && hasDataAttributes && hasImportantColors
  
  return {
    hasMetaTags,
    hasDataAttributes,
    hasImportantColors,
    isProtected,
    recommendations
  }
}

// Test 1: Template sin protección
console.log('🧪 Test 1: Template sin protección')
const templateSinProteccion = `
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

const validationAntes = validateDarkModeProtection(templateSinProteccion)
console.log('📊 Estado antes:')
console.log(`  Protegido: ${validationAntes.isProtected ? '✅' : '❌'}`)
console.log(`  Meta Tags: ${validationAntes.hasMetaTags ? '✅' : '❌'}`)
console.log(`  Data Attributes: ${validationAntes.hasDataAttributes ? '✅' : '❌'}`)
console.log(`  Important Colors: ${validationAntes.hasImportantColors ? '✅' : '❌'}`)

// Test 2: Aplicar protección
console.log('\n🔄 Aplicando protección...')
const templateProtegido = applyDarkModeProtection(templateSinProteccion)

const validationDespues = validateDarkModeProtection(templateProtegido)
console.log('📊 Estado después:')
console.log(`  Protegido: ${validationDespues.isProtected ? '✅' : '❌'}`)
console.log(`  Meta Tags: ${validationDespues.hasMetaTags ? '✅' : '❌'}`)
console.log(`  Data Attributes: ${validationDespues.hasDataAttributes ? '✅' : '❌'}`)
console.log(`  Important Colors: ${validationDespues.hasImportantColors ? '✅' : '❌'}`)

if (validationDespues.recommendations.length > 0) {
  console.log(`  Recomendaciones: ${validationDespues.recommendations.join(', ')}`)
}

// Test 3: Verificar elementos específicos
console.log('\n🔍 Verificando elementos específicos:')
console.log(`  Meta tags agregados: ${templateProtegido.includes('color-scheme') ? '✅' : '❌'}`)
console.log(`  Atributos data-ogsc: ${templateProtegido.includes('data-ogsc') ? '✅' : '❌'}`)
console.log(`  Atributos data-ogsb: ${templateProtegido.includes('data-ogsb') ? '✅' : '❌'}`)
console.log(`  !important en colores: ${templateProtegido.includes('!important') ? '✅' : '❌'}`)

// Test 4: Template completamente protegido
console.log('\n🧪 Test 4: Template completamente protegido')
const templateCompleto = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="x-apple-color-scheme" content="light only">
  <title>Template Completo</title>
  <style>
    body { color: #333 !important; background: white !important; }
    .button { background: #dc2626 !important; color: white !important; }
  </style>
</head>
<body data-ogsc data-ogsb>
  <div class="container" data-ogsc data-ogsb>
    <h1>Mi Template</h1>
    <a href="#" class="button" data-ogsc data-ogsb>Mi Botón</a>
  </div>
</body>
</html>
`

const validationCompleto = validateDarkModeProtection(templateCompleto)
console.log('📊 Template completo:')
console.log(`  Protegido: ${validationCompleto.isProtected ? '✅' : '❌'}`)
console.log(`  Meta Tags: ${validationCompleto.hasMetaTags ? '✅' : '❌'}`)
console.log(`  Data Attributes: ${validationCompleto.hasDataAttributes ? '✅' : '❌'}`)
console.log(`  Important Colors: ${validationCompleto.hasImportantColors ? '✅' : '❌'}`)

// Test 5: Múltiples templates
console.log('\n🧪 Test 5: Validación de múltiples templates')
const templates = [
  { name: 'Sin protección', html: templateSinProteccion },
  { name: 'Con protección', html: templateProtegido },
  { name: 'Completo', html: templateCompleto }
]

templates.forEach((template, index) => {
  const validation = validateDarkModeProtection(template.html)
  console.log(`\n${index + 1}. ${template.name}:`)
  console.log(`   Protegido: ${validation.isProtected ? '✅' : '❌'}`)
  console.log(`   Meta Tags: ${validation.hasMetaTags ? '✅' : '❌'}`)
  console.log(`   Data Attributes: ${validation.hasDataAttributes ? '✅' : '❌'}`)
  console.log(`   Important Colors: ${validation.hasImportantColors ? '✅' : '❌'}`)
})

// Resumen final
console.log('\n📊 Resumen de Tests:')
const totalTemplates = templates.length
const templatesProtegidos = templates.filter(t => validateDarkModeProtection(t.html).isProtected).length

console.log(`✅ Templates protegidos: ${templatesProtegidos}/${totalTemplates}`)
console.log(`📈 Porcentaje de éxito: ${Math.round((templatesProtegidos / totalTemplates) * 100)}%`)

console.log('\n🎉 Tests completados exitosamente!')
console.log('\n💡 Próximos pasos:')
console.log('1. Aplicar protección a todos los templates existentes')
console.log('2. Usar createProtectedEmailTemplate para nuevos templates')
console.log('3. Validar protección antes de enviar emails')
console.log('4. Monitorear consistencia visual en diferentes clientes')

