/**
 * 🚀 MÓDULO DE GENERADORES
 * 
 * Funciones para generar datos, IDs y contenido
 */

const logger = require('./logger');

/**
 * Genera un slug a partir de un título
 */
function generateSlug(title) {
  if (!title || typeof title !== 'string') {
    return 'sin-titulo';
  }
  
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
 * Genera un ID único
 */
function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Genera un UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
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
 * Genera múltiples rifas de ejemplo
 */
function generateMultipleRifas(count = 5, baseData = {}) {
  const rifas = [];
  
  for (let i = 0; i < count; i++) {
    const rifa = generateSampleRifa({
      ...baseData,
      titulo: `Rifa de Ejemplo ${i + 1}`,
      slug: `rifa-de-ejemplo-${i + 1}`,
      orden: i + 1
    });
    
    rifas.push(rifa);
  }
  
  return rifas;
}

/**
 * Genera un hash simple
 */
function generateHash(input, length = 8) {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  return Math.abs(hash).toString(36).substring(0, length);
}

/**
 * Genera un código de ticket
 */
function generateTicketCode(prefix = 'TKT') {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
}

/**
 * Genera un nombre de archivo único
 */
function generateFileName(originalName, extension = '') {
  if (!originalName) {
    originalName = 'archivo';
  }
  
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  
  if (extension && !extension.startsWith('.')) {
    extension = '.' + extension;
  }
  
  return `${originalName}-${timestamp}-${random}${extension}`;
}

/**
 * Genera datos de usuario de ejemplo
 */
function generateSampleUser(overrides = {}) {
  const baseUser = {
    nombre: 'Usuario Ejemplo',
    email: 'usuario@ejemplo.com',
    telefono: '+584141234567',
    direccion: 'Dirección de ejemplo',
    activo: true,
    fecha_registro: new Date().toISOString()
  };
  
  return { ...baseUser, ...overrides };
}

/**
 * Genera datos de pago de ejemplo
 */
function generateSamplePayment(overrides = {}) {
  const basePayment = {
    monto: 25.00,
    metodo: 'zelle',
    estado: 'pendiente',
    referencia: generateTicketCode('REF'),
    fecha: new Date().toISOString(),
    descripcion: 'Pago de ejemplo'
  };
  
  return { ...basePayment, ...overrides };
}

/**
 * Genera un array de números secuenciales
 */
function generateSequence(start = 1, end = 10, step = 1) {
  const sequence = [];
  for (let i = start; i <= end; i += step) {
    sequence.push(i);
  }
  return sequence;
}

/**
 * Genera un array de fechas
 */
function generateDateRange(startDate, endDate, interval = 'day') {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(new Date(current));
    
    switch (interval) {
      case 'day':
        current.setDate(current.getDate() + 1);
        break;
      case 'week':
        current.setDate(current.getDate() + 7);
        break;
      case 'month':
        current.setMonth(current.getMonth() + 1);
        break;
      default:
        current.setDate(current.getDate() + 1);
    }
  }
  
  return dates;
}

module.exports = {
  generateSlug,
  generateUniqueId,
  generateUUID,
  generateSampleRifa,
  generateMultipleRifas,
  generateHash,
  generateTicketCode,
  generateFileName,
  generateSampleUser,
  generateSamplePayment,
  generateSequence,
  generateDateRange
};
