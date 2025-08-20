// =====================================================
// 🗄️ CENTRO DE BASE DE DATOS - ELEVEN RIFAS
// =====================================================
// Este archivo centraliza todas las operaciones de base de datos
// Organizado por funcionalidad y componentes
// =====================================================

// Cliente de Supabase centralizado (lado del cliente)
export { supabase, supabaseAuth, supabaseUniversal } from './supabase'

// Cliente de Supabase del servidor (compatible con ambos contextos)
export { supabaseServer, supabaseServerAuth, createServerClient } from './supabase-server'

// NOTA: Para Server Components con cookies completas, importar directamente:
// import { createSSRClient } from '@/lib/database/supabase-ssr'

// Configuración de base de datos
export { 
  DB_CONFIG, 
  validarConfiguracionDB,
  obtenerConfiguracionPorAmbiente,
  esAmbienteDesarrollo,
  esAmbienteProduccion,
  esAmbienteTest
} from './config'

// Operaciones de Rifas
export * from './rifas'

// Operaciones de Pagos (módulo activo)
export * from './pagos'

// (Categorías, Usuarios, Estadísticas y Utils) eliminados por no uso
