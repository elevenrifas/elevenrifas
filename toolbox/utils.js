/**
 * 🛠️ UTILIDADES DE TOOLBOX
 * 
 * Funciones auxiliares para la caja de herramientas
 */

const config = require('./config');

/**
 * Genera un slug a partir de un título
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

/**
 * Valida el formato de una URL de imagen
 */
function validateImageUrl(url) {
  if (!url) return false;
  
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const hasValidExtension = validExtensions.some(ext => 
    url.toLowerCase().endsWith(ext)
  );
  
  return hasValidExtension || url.startsWith('http');
}

/**
 * Formatea un precio para mostrar
 */
function formatPrice(price) {
  if (typeof price !== 'number') return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
}

/**
 * Genera un ID único
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Valida los campos de una rifa
 */
function validateRifaFields(rifa) {
  const requiredFields = ['titulo', 'descripcion', 'precio_ticket', 'total_tickets'];
  const errors = [];
  
  requiredFields.forEach(field => {
    if (!rifa[field]) {
      errors.push(`Campo requerido: ${field}`);
    }
  });
  
  if (rifa.precio_ticket && rifa.precio_ticket <= 0) {
    errors.push('El precio del ticket debe ser mayor a 0');
  }
  
  if (rifa.total_tickets && rifa.total_tickets <= 0) {
    errors.push('El total de tickets debe ser mayor a 0');
  }
  
  if (rifa.tickets_disponibles && rifa.tickets_disponibles > rifa.total_tickets) {
    errors.push('Los tickets disponibles no pueden ser más que el total');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Limpia y normaliza datos de entrada
 */
function sanitizeInput(data) {
  const cleaned = {};
  
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      if (typeof data[key] === 'string') {
        cleaned[key] = data[key].trim();
      } else {
        cleaned[key] = data[key];
      }
    }
  });
  
  return cleaned;
}

/**
 * Genera datos de ejemplo para una rifa
 */
function generateSampleRifa(overrides = {}) {
  const baseRifa = {
    titulo: 'Rifa de Ejemplo',
    descripcion: 'Descripción de ejemplo para la rifa',
    precio_ticket: 10.00,
    imagen_url: '/images/example.jpg',
    estado: 'activa',
    total_tickets: 100,
    tickets_disponibles: 100,
    premio_principal: 'Premio de Ejemplo',
    condiciones: 'Condiciones de ejemplo',
    activa: true,
    tipo_rifa: 'vehiculo',
    categoria: 'automovil',
    marca: 'Marca',
    modelo: 'Modelo',
    ano: 2024,
    color: 'Color',
    valor_estimado_usd: 10000.00,
    destacada: false,
    orden: 999,
    slug: 'rifa-de-ejemplo'
  };
  
  return { ...baseRifa, ...overrides };
}

/**
 * Convierte un objeto a formato de tabla para mostrar en consola
 */
function objectToTable(obj, title = 'Datos') {
  const rows = Object.entries(obj).map(([key, value]) => {
    const formattedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    return `  ${key.padEnd(20)} | ${formattedValue}`;
  });
  
  const separator = '  ' + '-'.repeat(20) + '-+-' + '-'.repeat(30);
  
  return [
    `\n${title}:`,
    separator,
    ...rows,
    separator
  ].join('\n');
}

module.exports = {
  generateSlug,
  validateImageUrl,
  formatPrice,
  generateUniqueId,
  validateRifaFields,
  sanitizeInput,
  generateSampleRifa,
  objectToTable
};
