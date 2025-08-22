// =====================================================
// 🎯 EXPORTACIONES ADMIN NORMALIZADAS
// =====================================================
// Todas las funciones admin siguen el mismo patrón:
// - Usan safeAdminQuery para manejo seguro de errores
// - Devuelven { success: boolean, data: T[], total: number, error?: string }
// - Usan createAdminQuery, applyOrdering, applyPagination
// =====================================================

// ✅ RIFAS - Completamente normalizada
export * from './rifas'

// ✅ TICKETS - Completamente normalizada  
export * from './tickets'

// ✅ PAGOS - Completamente normalizada
export * from './pagos'

// ✅ USUARIOS - Completamente normalizada
export * from './usuarios'

// ✅ CATEGORIAS - Completamente normalizada
export * from './categorias'

// ✅ PROFILES - Completamente normalizada
export * from './profiles'

// ✅ AUTH - Completamente normalizada
export * from './auth'

// =====================================================
// 🎯 PATRÓN UNIFICADO PARA TODAS LAS FUNCIONES ADMIN
// =====================================================
// 
// ✅ adminList[Entity]() → { success: boolean, data: T[], total: number, error?: string }
// ✅ adminGet[Entity]() → { success: boolean, data: T, error?: string }
// ✅ adminCreate[Entity]() → { success: boolean, data: T, error?: string }
// ✅ adminUpdate[Entity]() → { success: boolean, error?: string }
// ✅ adminDelete[Entity]() → { success: boolean, error?: string }
//
// =====================================================


