# 🎯 ESTANDARIZACIÓN DE TABLAS - ELEVEN RIFAS

## 📋 Resumen

Se ha implementado un sistema unificado y estandarizado para todas las tablas del panel de administración, eliminando inconsistencias y creando componentes reutilizables.

## 🏗️ Arquitectura del Sistema

### Componentes Principales

1. **`DataTableHeader`** - Header estandarizado con botones de acción
2. **`DataTableToolbar`** - Toolbar unificado con búsqueda, filtros y acciones
3. **`DataTableEnhanced`** - Tabla completa que integra todos los componentes
4. **`DataTable`** - Tabla original (mantenida para compatibilidad)
5. **`DataTableSimple`** - Tabla simplificada (mantenida para compatibilidad)

### Funciones Helper

- **`createCRUDTable`** - Para tablas con operaciones CRUD completas
- **`createReadOnlyTable`** - Para tablas de solo lectura
- **`createMultiSelectTable`** - Para tablas con selección múltiple

## 🚀 Uso del Sistema Estandarizado

### 1. Tabla Básica con DataTableEnhanced

```tsx
import { DataTableEnhanced } from "../data-table"

export function MiTabla() {
  return (
    <DataTableEnhanced
      columns={columns}
      data={data}
      title="Mi Tabla"
      description="Descripción de la tabla"
      searchKey="nombre"
      searchPlaceholder="Buscar..."
      onRefresh={handleRefresh}
      onExport={handleExport}
    />
  )
}
```

### 2. Tabla CRUD Completa

```tsx
import { createCRUDTable } from "../data-table"

export function MiTablaCRUD() {
  return createCRUDTable({
    columns: columns,
    data: data,
    title: "Mi Tabla CRUD",
    description: "Tabla con operaciones completas",
    searchKey: "nombre",
    onCreate: handleCreate,
    onExport: handleExport,
    onRefresh: handleRefresh,
    onDelete: handleDelete
  })
}
```

### 3. Tabla de Solo Lectura

```tsx
import { createReadOnlyTable } from "../data-table"

export function MiTablaReadOnly() {
  return createReadOnlyTable({
    columns: columns,
    data: data,
    title: "Mi Tabla Read-Only",
    description: "Tabla de solo lectura",
    searchKey: "nombre",
    onExport: handleExport,
    onRefresh: handleRefresh
  })
}
```

### 4. Tabla con Selección Múltiple

```tsx
import { createMultiSelectTable } from "../data-table"

export function MiTablaMultiSelect() {
  return createMultiSelectTable({
    columns: columns,
    data: data,
    title: "Mi Tabla Multi-Select",
    description: "Tabla con selección múltiple",
    searchKey: "nombre",
    onCreate: handleCreate,
    onExport: handleExport,
    onRefresh: handleRefresh,
    onDelete: handleDelete
  })
}
```

## 🎨 Personalización de Acciones

### Acciones del Header

```tsx
headerActions={[
  {
    key: "create",
    label: "Crear Nuevo",
    icon: Plus,
    variant: "default",
    onClick: handleCreate
  },
  {
    key: "export",
    label: selectedRows.length > 0 ? `Exportar (${selectedRows.length})` : "Exportar Todo",
    icon: Download,
    variant: "outline",
    onClick: handleExport
  }
]}
```

### ⚠️ Importante: Botón Exportar

El botón de **Exportar** debe estar **siempre disponible** para permitir exportar todos los datos:

- ✅ **Label dinámico**: Cambia entre "Exportar Todo" y "Exportar (N)" según el contexto
- ✅ **Siempre visible**: No usar `showWhen: { hasSelection: true }`
- ✅ **Siempre habilitado**: No usar `disabled: selectedRows.length === 0`
- ✅ **Lógica inteligente**: Exporta seleccionados si los hay, sino exporta todo

**Ver checklist completo**: `toolbox/EXPORT_BUTTON_CHECKLIST.md`

### Configuraciones de Acciones Predefinidas

```tsx
import { actionConfigs, commonActions } from "../data-table"

// Usar configuraciones predefinidas
const actions = actionConfigs.fullCRUD({
  onCreate: handleCreate,
  onExport: handleExport,
  onRefresh: handleRefresh,
  onDelete: handleDelete
})

// O crear acciones personalizadas
const customAction = commonActions.create(
  handleCreate, 
  "Crear Personalizado"
)
```

## 🔧 Configuración Avanzada

### Filtros Facetados

```tsx
facetedFilters={[
  {
    column: "estado",
    title: "Estado",
    options: [
      { label: "Activo", value: "activo" },
      { label: "Inactivo", value: "inactivo" }
    ]
  }
]}
```

### Estados Personalizados

```tsx
emptyState={
  <div className="text-center py-8">
    <p className="text-muted-foreground mb-2">No hay datos</p>
    <Button onClick={handleCreate}>Crear primero</Button>
  </div>
}
```

### Configuración de Columnas

```tsx
showColumnToggle={true}
showRowSelection={true}
showFacetedFilters={true}
enableSorting={true}
enableColumnFilters={true}
```

## 📊 Migración de Tablas Existentes

### Antes (RifasTable)

```tsx
// Header personalizado
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-2xl font-bold tracking-tight">Rifas</h2>
    <p className="text-muted-foreground">Gestiona todas las rifas</p>
  </div>
  <div className="flex items-center space-x-2">
    <Button onClick={openCreateModal}>
      <Plus className="h-4 w-4 mr-2" />
      Crear Rifa
    </Button>
    {/* Más botones... */}
  </div>
</div>

// Tabla separada
<DataTableSimple
  columns={columns}
  data={data}
  // ... más props
/>
```

### Después (RifasTable Estandarizada)

```tsx
<DataTableEnhanced
  columns={columns}
  data={data}
  title="Rifas"
  description="Gestiona todas las rifas del sistema"
  headerActions={[
    {
      key: "create",
      label: "Crear Rifa",
      icon: Plus,
      onClick: openCreateModal
    }
    // ... más acciones
  ]}
  // ... resto de configuración
/>
```

## ✅ Beneficios de la Estandarización

1. **Consistencia Visual** - Todas las tablas tienen la misma apariencia
2. **Reutilización** - Componentes compartidos entre tablas
3. **Mantenibilidad** - Cambios centralizados en un lugar
4. **Flexibilidad** - Configuración personalizable por tabla
5. **Rendimiento** - Optimizaciones centralizadas
6. **Accesibilidad** - Patrones consistentes de UX

## 🔄 Estado de Migración

### ✅ Completadas
- `RifasTable` - Migrada a DataTableEnhanced
- `CategoriasRifasTable` - Migrada a DataTableEnhanced

### 🔄 Pendientes
- `TicketsTable` - Migrar a DataTableEnhanced
- `PagosTable` - Migrar a DataTableEnhanced
- `ProfilesTable` - Migrar a DataTableEnhanced
- `UsuariosTable` - Migrar a DataTableEnhanced

## 📝 Notas de Implementación

- Se mantienen los componentes originales para compatibilidad
- La migración es gradual y no rompe funcionalidad existente
- Cada tabla puede personalizar sus acciones específicas
- El sistema es extensible para futuras necesidades

## 🎯 Próximos Pasos

1. Migrar las tablas restantes
2. Implementar tests para los nuevos componentes
3. Crear documentación de componentes individuales
4. Optimizar rendimiento según uso real
5. Implementar temas personalizables
