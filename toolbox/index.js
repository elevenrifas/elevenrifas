// =====================================================
// 🎯 TOOLBOX - ELEVEN RIFAS
// =====================================================
// Herramientas y utilidades para el desarrollo
// =====================================================

// Configuración base
const config = require('./config');
const database = require('./database');
const utils = require('./utils');

// =====================================================
// 🎯 HERRAMIENTAS DE DATATABLE
// =====================================================
// Sistema estandarizado para creación de tablas
// =====================================================

const datatableTools = {
  // Generador automático de tablas
  generateTable: (tipo, nombre, entidad) => {
    const { generateCRUDTemplate, generateReadOnlyTemplate, generateMultiSelectTemplate, generateCustomTemplate } = require('./scripts/generate_datatable');
    
    switch (tipo) {
      case 'crud':
        return generateCRUDTemplate(nombre, entidad);
      case 'readonly':
        return generateReadOnlyTemplate(nombre, entidad);
      case 'multiselect':
        return generateMultiSelectTemplate(nombre, entidad);
      case 'custom':
        return generateCustomTemplate(nombre, entidad);
      default:
        throw new Error(`Tipo de tabla no soportado: ${tipo}`);
    }
  },

  // Validación de patrones de tabla
  validateTablePattern: (tableConfig) => {
    const required = ['columns', 'data', 'title'];
    const missing = required.filter(field => !tableConfig[field]);
    
    if (missing.length > 0) {
      throw new Error(`Campos requeridos faltantes: ${missing.join(', ')}`);
    }
    
    return true;
  },

  // Generación de nombres consistentes
  generateNames: (entidad) => {
    const singular = entidad.charAt(0).toUpperCase() + entidad.slice(1);
    const plural = entidad.endsWith('s') ? entidad : entidad + 's';
    
    return {
      fileName: `${singular}Table.tsx`,
      componentName: `${singular}Table`,
      hookName: `use${plural}`,
      typeName: `Admin${singular}`,
      tableName: `${singular}`
    };
  },

  // Checklist del botón exportar
  exportChecklist: () => {
    console.log('📋 Checklist del Botón Exportar disponible en: toolbox/EXPORT_BUTTON_CHECKLIST.md');
    console.log('✅ Verificar configuración correcta del botón exportar');
    console.log('🚫 NO usar showWhen: { hasSelection: true }');
    console.log('🚫 NO usar disabled: selectedRows.length === 0');
    console.log('🚫 NO usar exportDisabled: selectedRows.length === 0');
    console.log('✅ Usar label dinámico: selectedRows.length > 0 ? "Exportar (N)" : "Exportar Todo"');
  }
};

// =====================================================
// 🎯 HERRAMIENTAS DE BASE DE DATOS
// =====================================================
// Gestión y consultas de base de datos
// =====================================================

const databaseTools = {
  // Configuración de base de datos
  config: database.config,
  
  // Consultas predefinidas
  queries: database.queries,
  
  // Estructura de base de datos
  structure: database.structure,
  
  // Datos de ejemplo
  data: database.data,
  
  // Utilidades de base de datos
  utils: database.utils
};

// =====================================================
// 🎯 HERRAMIENTAS DE UTILIDAD
// =====================================================
// Funciones auxiliares generales
// =====================================================

const utilityTools = {
  // Formateadores
  formatters: utils.formatters,
  
  // Generadores
  generators: utils.generators,
  
  // Validadores
  validators: utils.validators,
  
  // Logger
  logger: utils.logger
};

// =====================================================
// 🎯 HERRAMIENTAS DE CONFIGURACIÓN
// =====================================================
// Configuración del sistema
// =====================================================

const configTools = {
  // Configuración de la aplicación
  app: config.app,
  
  // Configuración de base de datos
  database: config.database,
  
  // Configuración de logging
  logging: config.logging,
  
  // Configuración de Supabase
  supabase: config.supabase
};

// =====================================================
// 🎯 EXPORTACIONES PRINCIPALES
// =====================================================

module.exports = {
  // Herramientas principales
  config: configTools,
  database: databaseTools,
  utils: utilityTools,
  
  // Herramientas de DataTable
  datatable: datatableTools,
  
  // Funciones de conveniencia
  generateTable: datatableTools.generateTable,
  validateTable: datatableTools.validateTablePattern,
  generateNames: datatableTools.generateNames,
  exportChecklist: datatableTools.exportChecklist,
  
  // Configuración rápida
  setup: config.setup,
  connect: database.connect,
  log: utils.logger.log
};

// =====================================================
// 🎯 USO RÁPIDO
// =====================================================
// Ejemplos de uso de las herramientas
// =====================================================

/*
// Ejemplo de uso del generador de tablas
const { generateTable, generateNames } = require('./toolbox');

// Generar nombres consistentes
const names = generateNames('producto');
console.log(names);
// Output: {
//   fileName: 'ProductoTable.tsx',
//   componentName: 'ProductoTable',
//   hookName: 'useProductos',
//   typeName: 'AdminProducto',
//   tableName: 'Producto'
// }

// Generar template de tabla CRUD
const template = generateTable('crud', 'Productos', 'producto');
console.log(template);

// Ejemplo de validación
const { validateTable } = require('./toolbox');

const tableConfig = {
  columns: [],
  data: [],
  title: 'Mi Tabla'
};

try {
  validateTable(tableConfig);
  console.log('✅ Configuración válida');
} catch (error) {
  console.error('❌ Error:', error.message);
}
*/
