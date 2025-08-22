// =====================================================
// 🎯 DATA TABLE COMPONENTS - ELEVEN RIFAS
// =====================================================
// Exportaciones de todos los componentes de tabla estandarizados
// =====================================================

// Componentes principales
export { DataTable } from "./DataTable"
export { DataTableSimple } from "./DataTableSimple"
export { DataTableEnhanced } from "./DataTableEnhanced"

// Componentes de soporte
export { DataTableColumnHeader } from "./DataTableColumnHeader"
export { DataTableFacetedFilter } from "./DataTableFacetedFilter"
export { DataTablePagination } from "./DataTablePagination"
export { DataTableToolbar } from "./DataTableToolbar"

// Header y acciones
export { 
  DataTableHeader, 
  type DataTableHeaderAction,
  createAction,
  commonActions,
  actionConfigs
} from "./DataTableHeader"

// Funciones helper para crear tablas
export {
  createCRUDTable,
  createReadOnlyTable,
  createMultiSelectTable
} from "./DataTableEnhanced"

// Ejemplos de uso
export {
  DataTableExamples,
  ExampleBasicTable,
  ExampleCRUDTable,
  ExampleReadOnlyTable,
  ExampleMultiSelectTable,
  ExampleCustomTable,
  ExampleActionConfigTable
} from "./example-usage"

// Ejemplo de tabla mínima
export { UsuariosTable as ExampleMinimalTable } from "./example-minimal-table"
