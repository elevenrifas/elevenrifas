// =====================================================
// 🎯 EXPORTACIONES DE HOOKS - ELEVEN RIFAS
// =====================================================
// Todos los hooks del sistema centralizados
// =====================================================

// Hooks de autenticación
export { useAdminAuth } from './use-admin-auth'
export { useAdminAuthSimple } from './use-admin-auth-simple'

// Hooks de datos admin
export { useAdminRifas } from './use-admin-rifas'
export { useAdminTickets } from './use-admin-tickets'
export { useAdminPagos } from './use-admin-pagos'
export { useAdminCategorias } from './use-admin-categorias'
export { useAdminUsuariosVerificacion } from './use-admin-usuarios-verificacion'

// Nuevo hook de clientes
export { useAdminClientes } from './use-admin-clientes'

// Hooks CRUD
export { useCrudRifas } from './use-crud-rifas'
export { useCrudTickets } from './use-crud-tickets'
export { useCrudPagos } from './use-crud-pagos'
export { useCrudCategorias } from './use-crud-categorias'
export { useCrudUsuariosVerificacion } from './use-crud-usuarios-verificacion'

// Hooks de utilidad
export { useCategorias } from './use-categorias'
export { useLogger } from './use-logger'
export { useMobile } from './use-mobile'
export { useNavigation } from './use-navigation'
