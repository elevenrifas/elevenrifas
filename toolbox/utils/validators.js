/**
 * ✅ MÓDULO DE VALIDADORES
 * 
 * Funciones de validación para datos y entradas
 */

const logger = require('./logger');

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
 * Valida un email
 */
function validateEmail(email) {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida un número de teléfono
 */
function validatePhone(phone) {
  if (!phone) return false;
  
  // Remover espacios, guiones y paréntesis
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // Debe tener al menos 10 dígitos
  return /^\d{10,}$/.test(cleanPhone);
}

/**
 * Valida un precio
 */
function validatePrice(price) {
  if (typeof price !== 'number') return false;
  return price >= 0;
}

/**
 * Valida un slug
 */
function validateSlug(slug) {
  if (!slug) return false;
  
  // Solo letras minúsculas, números y guiones
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug);
}

/**
 * Valida un UUID
 */
function validateUUID(uuid) {
  if (!uuid) return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Valida un objeto completo
 */
function validateObject(obj, schema) {
  const errors = [];
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = obj[field];
    
    if (rules.required && !value) {
      errors.push(`Campo requerido: ${field}`);
      continue;
    }
    
    if (value && rules.type && typeof value !== rules.type) {
      errors.push(`Campo ${field} debe ser de tipo ${rules.type}`);
    }
    
    if (value && rules.min && value < rules.min) {
      errors.push(`Campo ${field} debe ser mayor o igual a ${rules.min}`);
    }
    
    if (value && rules.max && value > rules.max) {
      errors.push(`Campo ${field} debe ser menor o igual a ${rules.max}`);
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push(`Campo ${field} no cumple con el formato requerido`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateImageUrl,
  validateRifaFields,
  sanitizeInput,
  validateEmail,
  validatePhone,
  validatePrice,
  validateSlug,
  validateUUID,
  validateObject
};
