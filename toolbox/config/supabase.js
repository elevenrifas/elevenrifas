/**
 * 🔗 CONFIGURACIÓN DE SUPABASE
 * 
 * Configuración de conexión y credenciales de Supabase
 */

module.exports = {
  // URL de la instancia de Supabase
  url: 'https://jlugofbpazvaoksvwcvy.supabase.co',
  
  // Clave anónima (segura para operaciones públicas)
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpsdWdvZmJwYXp2YW9rc3Z3Y3Z5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0NDk2NTYsImV4cCI6MjA3MTAyNTY1Nn0.pJ_tGa0wdvuEmZjx5bOKxcXX7errZnoPUW7BdOj0WTA',
  
  // Configuración de la conexión
  options: {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'eleven-rifas-toolbox'
      }
    }
  },
  
  // Configuración de reintentos
  retry: {
    maxAttempts: 3,
    delayMs: 1000
  },
  
  // Configuración de timeouts
  timeout: {
    request: 30000, // 30 segundos
    connection: 10000 // 10 segundos
  }
};
