/**
 * ⚙️ CONFIGURACIÓN DE TOOLBOX
 * 
 * Archivo de configuración centralizada para la caja de herramientas
 */

module.exports = {
  // Configuración de Supabase
  supabase: {
    url: 'https://jlugofbpazvaoksvwcvy.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdWdvZmJwYXp2YW9rc3Z3Y3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDk2NTYsImV4cCI6MjA3MTAyNTY1Nn0.pJ_tGa0wdvuEmZjx5bOKxcXX7errZnoPUW7BdOj0WTA'
  },

  // Configuración de la base de datos
  database: {
    tables: {
      rifas: 'rifas',
      usuarios: 'usuarios',
      pagos: 'pagos',
      tickets: 'tickets'
    },
    
    // Campos por defecto para rifas
    defaultRifaFields: {
      tipo_rifa: 'vehiculo',
      categoria: 'automovil',
      estado: 'activa',
      activa: true,
      destacada: false,
      orden: 0
    }
  },

  // Configuración de la aplicación
  app: {
    name: 'Eleven Rifas',
    version: '1.0.0',
    description: 'Sistema de rifas online'
  },

  // Configuración de logging
  logging: {
    colors: {
      reset: '\x1b[0m',
      green: '\x1b[32m',
      red: '\x1b[31m',
      yellow: '\x1b[33m',
      blue: '\x1b[34m',
      cyan: '\x1b[36m',
      magenta: '\x1b[35m',
      white: '\x1b[37m'
    },
    timestamp: true,
    verbose: false
  }
};
