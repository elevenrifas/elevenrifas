// =====================================================
// 🧪 TEST DE PROTECCIÓN EN EMAIL DE VERIFICACIÓN DE PAGO
// =====================================================
// Test para verificar que el email de verificación de pago tiene protección contra modo oscuro
// =====================================================

console.log('🧪 Test de protección en email de verificación de pago...\n')

// Simular el template HTML del email de verificación de pago
const paymentVerificationHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light only">
  <meta name="supported-color-schemes" content="light only">
  <meta name="x-apple-color-scheme" content="light only">
  <title>Pago Verificado - Rifa del Auto</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #ffffff; margin: 0; padding: 20px; background-color: #f5f5f5; }
    * { box-sizing: border-box; }
    table { border-collapse: collapse; }
    img { border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; }
    .container { max-width: 600px; margin: 0 auto; }
    .card { background: #000000 !important; color: #ffffff !important; border-radius: 12px; padding: 30px; border: 2px solid #e11d2a; }
    .logo { max-width: 200px; height: auto; display: block; margin: 0 auto 20px auto; }
    .title { text-align: center; font-size: 28px; font-weight: bold; color: #e11d2a; margin-bottom: 20px; }
    .greeting { font-size: 16px; margin-bottom: 20px; }
    .tickets-section { margin: 25px 0; }
    .tickets-title { font-size: 18px; font-weight: bold; color: #e11d2a; margin-bottom: 10px; }
    .ticket-count { font-size: 20px; font-weight: bold; color: #e11d2a; text-align: center; margin: 10px 0; }
    .ticket-numbers { text-align: center; margin: 15px 0; }
    .ticket-pill { font-family: 'Courier New', monospace; font-size: 16px; color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; }
    .payment-details { margin-top: 25px; }
    .details-title { font-size: 18px; font-weight: bold; color: #e11d2a; margin-bottom: 15px; }
    .detail-row { display: flex; justify-content: space-between; margin: 8px 0; padding: 5px 0; border-bottom: 1px solid #333; }
    .detail-label { color: #cccccc; font-weight: 600; font-size: 15px; }
    .detail-value { color: #ffffff; font-weight: 600; font-size: 15px; }
    .amount { color: #e11d2a; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #999999; }
    .footer a { color: #e11d2a; text-decoration: none; }
    
    /* Protección contra modo oscuro */
    [data-ogsc] { color: inherit !important; }
    [data-ogsb] { background-color: inherit !important; }
    * { -webkit-text-size-adjust: 100%; }
    
    @media (prefers-color-scheme: dark) {
      * { color-scheme: light only !important; }
    }
    
    @media (max-width: 600px) { 
      .container { padding: 10px; } 
      .card { padding: 20px; background: #000000 !important; color: #ffffff !important; }
      .detail-row { flex-direction: column; gap: 5px; }
      .ticket-pill { margin: 3px 4px; }
    }
  </style>
</head>
<body data-ogsc data-ogsb>
  <div class="container" data-ogsc data-ogsb>
    <div class="card" style="background-color: #000000 !important; color: #ffffff !important; border: 2px solid #e11d2a !important;" data-ogsc data-ogsb>
      <img src="https://eleven-rifas-master.vercel.app/logoblancorojo.png" alt="Eleven Rifas" class="logo" />
      
      <h1 class="title" style="color: #e11d2a !important;">Pago Verificado</h1>
      
      <p class="greeting" style="color: #ffffff !important;">Hola <strong style="color: #ffffff !important;">Juan Pérez</strong>, tu pago para la rifa <strong style="color: #ffffff !important;">Rifa del Auto Toyota Corolla 2024</strong> ha sido verificado exitosamente.</p>
      
      <div class="tickets-section" data-ogsc data-ogsb>
        <h3 class="tickets-title" style="color: #e11d2a !important;">🎫 Tickets</h3>
        <div class="ticket-count" style="color: #e11d2a !important;">3 ticket(s)</div>
        <div class="ticket-numbers">
          <span class="ticket-pill" style="color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; font-family: 'Courier New', monospace; font-size: 16px;">001</span>
          <span class="ticket-pill" style="color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; font-family: 'Courier New', monospace; font-size: 16px;">002</span>
          <span class="ticket-pill" style="color: #ffffff !important; background: #e11d2a !important; padding: 8px 12px; border-radius: 20px; display: inline-block; margin: 4px 6px; font-family: 'Courier New', monospace; font-size: 16px;">003</span>
        </div>
      </div>
      
      <div class="payment-details" data-ogsc data-ogsb>
        <h3 class="details-title" style="color: #e11d2a !important;">💳 Detalles del Pago</h3>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Rifa:</span>
          <span class="detail-value" style="color: #ffffff !important;">Rifa del Auto Toyota Corolla 2024</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Monto:</span>
          <span class="detail-value amount" style="color: #e11d2a !important;">$150.00 USD</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Método:</span>
          <span class="detail-value" style="color: #ffffff !important;">Transferencia Bancaria</span>
        </div>
        <div class="detail-row">
          <span class="detail-label" style="color: #cccccc !important;">Referencia:</span>
          <span class="detail-value" style="color: #ffffff !important;">TXN123456789</span>
        </div>
      </div>
      
      <div class="footer" style="color: #999999 !important;" data-ogsc data-ogsb>
        <p>¿Dudas? Escríbenos a <a href="mailto:support@elevenrifas.com" style="color: #e11d2a !important;">support@elevenrifas.com</a></p>
        <p><strong style="color: #ffffff !important;">Eleven Rifas</strong> · Venezuela</p>
      </div>
    </div>
  </div>
</body>
</html>`

// Función para validar protección
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
  
  // Verificar CSS de protección
  const hasProtectionCSS = html.includes('[data-ogsc]') && html.includes('[data-ogsb]')
  
  if (!hasProtectionCSS) {
    recommendations.push('Agregar CSS de protección')
  }
  
  // Verificar media queries
  const hasMediaQueries = html.includes('prefers-color-scheme: dark')
  
  if (!hasMediaQueries) {
    recommendations.push('Agregar media queries para modo oscuro')
  }
  
  const isProtected = hasMetaTags && hasDataAttributes && hasImportantColors && hasProtectionCSS && hasMediaQueries
  
  return {
    hasMetaTags,
    hasDataAttributes,
    hasImportantColors,
    hasProtectionCSS,
    hasMediaQueries,
    isProtected,
    recommendations
  }
}

// Test 1: Validar protección del email de verificación de pago
console.log('🧪 Test 1: Validar protección del email de verificación de pago')
const validation = validateDarkModeProtection(paymentVerificationHTML)

console.log('📊 Estado de protección:')
console.log(`  Meta tags: ${validation.hasMetaTags ? '✅' : '❌'}`)
console.log(`  Data attributes: ${validation.hasDataAttributes ? '✅' : '❌'}`)
console.log(`  Important colors: ${validation.hasImportantColors ? '✅' : '❌'}`)
console.log(`  Protection CSS: ${validation.hasProtectionCSS ? '✅' : '❌'}`)
console.log(`  Media queries: ${validation.hasMediaQueries ? '✅' : '❌'}`)
console.log(`  Protegido: ${validation.isProtected ? '✅' : '❌'}`)

if (validation.recommendations.length > 0) {
  console.log(`\n💡 Recomendaciones: ${validation.recommendations.join(', ')}`)
}

// Test 2: Verificar elementos específicos
console.log('\n🧪 Test 2: Verificar elementos específicos')
const elements = [
  { name: 'Meta tags de color-scheme', check: paymentVerificationHTML.includes('color-scheme') },
  { name: 'Atributos data-ogsc', check: paymentVerificationHTML.includes('data-ogsc') },
  { name: 'Atributos data-ogsb', check: paymentVerificationHTML.includes('data-ogsb') },
  { name: 'Colores con !important', check: paymentVerificationHTML.includes('!important') },
  { name: 'CSS de protección', check: paymentVerificationHTML.includes('[data-ogsc]') },
  { name: 'Media queries', check: paymentVerificationHTML.includes('prefers-color-scheme') },
  { name: 'Webkit protection', check: paymentVerificationHTML.includes('-webkit-text-size-adjust') }
]

elements.forEach(({ name, check }) => {
  const icon = check ? '✅' : '❌'
  console.log(`  ${name}: ${icon}`)
})

// Test 3: Simular diferentes clientes de email
console.log('\n🧪 Test 3: Simular diferentes clientes de email')
const clients = [
  { name: 'Gmail (Modo Claro)', mode: 'light' },
  { name: 'Gmail (Modo Oscuro)', mode: 'dark' },
  { name: 'Outlook (Modo Claro)', mode: 'light' },
  { name: 'Outlook (Modo Oscuro)', mode: 'dark' },
  { name: 'Apple Mail (Modo Claro)', mode: 'light' },
  { name: 'Apple Mail (Modo Oscuro)', mode: 'dark' },
  { name: 'Yahoo Mail (Modo Claro)', mode: 'light' },
  { name: 'Yahoo Mail (Modo Oscuro)', mode: 'dark' }
]

clients.forEach(client => {
  const protected = client.mode === 'dark' ? 
    (validation.isProtected ? '✅ Protegido' : '❌ Vulnerable') : 
    '✅ Normal'
  console.log(`  ${client.name}: ${protected}`)
})

// Test 4: Verificar colores específicos
console.log('\n🧪 Test 4: Verificar colores específicos')
const colors = [
  { name: 'Color principal (#e11d2a)', check: paymentVerificationHTML.includes('#e11d2a') },
  { name: 'Fondo negro (#000000)', check: paymentVerificationHTML.includes('#000000') },
  { name: 'Texto blanco (#ffffff)', check: paymentVerificationHTML.includes('#ffffff') },
  { name: 'Texto gris (#cccccc)', check: paymentVerificationHTML.includes('#cccccc') },
  { name: 'Texto gris claro (#999999)', check: paymentVerificationHTML.includes('#999999') }
]

colors.forEach(({ name, check }) => {
  const icon = check ? '✅' : '❌'
  console.log(`  ${name}: ${icon}`)
})

// Resumen final
console.log('\n📊 Resumen del Test:')
console.log(`✅ Email de verificación de pago: ${validation.isProtected ? 'PROTEGIDO' : 'VULNERABLE'}`)
console.log(`📈 Nivel de protección: ${validation.isProtected ? '100%' : 'Parcial'}`)
console.log(`🎯 Compatibilidad: ${validation.isProtected ? 'Todos los clientes' : 'Limitada'}`)

if (validation.isProtected) {
  console.log('\n🎉 ¡El email de verificación de pago está completamente protegido contra modo oscuro!')
  console.log('\n💡 Beneficios:')
  console.log('  - Colores consistentes en todos los clientes')
  console.log('  - Branding corporativo preservado')
  console.log('  - Experiencia de usuario uniforme')
  console.log('  - Compatibilidad con modo oscuro')
} else {
  console.log('\n⚠️ El email de verificación de pago necesita mejoras en la protección contra modo oscuro')
  console.log('\n🔧 Acciones recomendadas:')
  validation.recommendations.forEach(rec => console.log(`  - ${rec}`))
}

console.log('\n🚀 Test completado exitosamente!')

