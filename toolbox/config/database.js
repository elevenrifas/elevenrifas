/**
 * 🗄️ CONFIGURACIÓN DE BASE DE DATOS
 * 
 * Configuración de tablas, campos y estructura de la base de datos
 */

module.exports = {
  // Nombres de las tablas principales
  tables: {
    rifas: 'rifas',
    usuarios: 'usuarios',
    pagos: 'pagos',
    tickets: 'tickets',
    categorias: 'categorias'
  },
  
  // Campos por defecto para rifas
  defaultRifaFields: {
    tipo_rifa: 'vehiculo',
    categoria: 'automovil',
    estado: 'activa',
    activa: true,
    destacada: false,
    orden: 0
  },
  
  // Tipos de rifas disponibles
  tiposRifa: [
    'vehiculo',
    'electronico',
    'inmueble',
    'servicio',
    'otro'
  ],
  
  // Categorías disponibles
  categorias: [
    'automovil',
    'suv',
    'camioneta',
    'moto',
    'electronico',
    'hogar',
    'servicio',
    'otro'
  ],
  
  // Estados de rifas
  estadosRifa: [
    'borrador',
    'activa',
    'pausada',
    'finalizada',
    'cancelada'
  ],
  
  // Configuración de paginación
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  },
  
  // Configuración de búsqueda
  search: {
    minLength: 3,
    maxResults: 50
  },
  
  // Configuración de índices
  indexes: [
    'idx_rifas_estado_destacada',
    'idx_rifas_tipo',
    'idx_rifas_orden',
    'idx_rifas_slug',
    'idx_rifas_categoria'
  ]
};
