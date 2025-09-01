// =====================================================
// 🎯 COMPONENTES ADMIN - ELEVEN RIFAS
// =====================================================
// Exportaciones centralizadas de todos los componentes
// =====================================================

// Componentes principales
export { LoginForm } from './login-form'
export { LoginGuard } from './login-guard'
export { ProtectedRoute } from './protected-route'
export { SiteHeader } from './site-header'
export { AdminNavbar } from './AdminNavbar'

// Modales
export { CategoriaFormModal } from './modals/CategoriaFormModal'
export { CategoriaViewModal } from './modals/CategoriaViewModal'
export { DeleteConfirmModal } from './modals/DeleteConfirmModal'
export { ClienteViewModal } from './modals/ClienteViewModal'

// Tablas
export { CategoriasRifasTable } from './tables/CategoriasRifasTable'
export { ClientesTable } from './tables/ClientesTable'
export { PagosVerificacionTable } from './tables/PagosVerificacionTable'
export { ProfilesTable } from './tables/ProfilesTable'
export { RifasTable } from './tables/RifasTable'
export { TicketsTable } from './tables/TicketsTable'
export { UsuariosTable } from './tables/UsuariosTable'
export { UsuariosVerificacionTable } from './tables/UsuariosVerificacionTable'

// Componentes de UI
export { IconPicker } from './ui/icon-picker'
export { ImageUpload } from './ui/image-upload'

// Componentes de datos
export { DataTable } from './data-table/DataTable'
export { DataTableEnhanced } from './data-table/DataTableEnhanced'
export { DataTableSimple } from './data-table/DataTableSimple'
export { DataTableToolbar } from './data-table/DataTableToolbar'
export { DataTableHeader } from './data-table/DataTableHeader'
export { DataTablePagination } from './data-table/DataTablePagination'
export { DataTableColumnHeader } from './data-table/DataTableColumnHeader'
export { DataTableFacetedFilter } from './data-table/DataTableFacetedFilter'

// Funciones helper de tablas
export {
  createCRUDTable,
  createReadOnlyTable,
  createMultiSelectTable,
  commonActions,
  actionConfigs
} from './data-table/DataTableEnhanced'

// Otros componentes
export { SectionCards } from './section-cards'
export { ChartAreaInteractive } from './chart-area-interactive'
