# 🎯 GUÍA DE CREACIÓN DE DATATABLES - ELEVEN RIFAS

## 📋 Resumen

Esta guía establece los estándares y mejores prácticas para crear tablas de datos consistentes en el panel de administración, utilizando el sistema unificado `DataTableEnhanced`.

## 🏗️ Arquitectura del Sistema

### Componentes Disponibles

1. **`DataTableEnhanced`** - Tabla completa con header, toolbar y paginación
2. **`DataTableHeader`** - Header estandarizado con botones de acción
3. **`DataTableToolbar`** - Toolbar con búsqueda, filtros y acciones
4. **`DataTable`** - Tabla original (mantener para compatibilidad)
5. **`DataTableSimple`** - Tabla simplificada (mantener para compatibilidad)

### Funciones Helper

- **`createCRUDTable`** - Para tablas con operaciones CRUD completas
- **`createReadOnlyTable`** - Para tablas de solo lectura
- **`createMultiSelectTable`** - Para tablas con selección múltiple

## 🚀 Patrones de Implementación

### 1. Tabla CRUD Completa (Recomendado para gestión)

```tsx
import { createCRUDTable } from "../data-table"

export function MiTablaCRUD() {
  const handleCreate = () => { /* lógica de creación */ }
  const handleRefresh = () => { /* lógica de refresh */ }
  const handleExport = () => { /* lógica de exportación */ }
  const handleDelete = () => { /* lógica de eliminación */ }

  return createCRUDTable({
    columns: columns,
    data: data,
    title: "Mi Entidad",
    description: "Gestiona todos los elementos de esta entidad",
    searchKey: "nombre",
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })
}
```

### 2. Tabla de Solo Lectura (Para reportes y visualización)

```tsx
import { createReadOnlyTable } from "../data-table"

export function MiTablaReadOnly() {
  const handleRefresh = () => { /* lógica de refresh */ }
  const handleExport = () => { /* lógica de exportación */ }

  return createReadOnlyTable({
    columns: columns,
    data: data,
    title: "Reporte de Entidad",
    description: "Visualización de datos para análisis",
    searchKey: "nombre",
    onRefresh: handleRefresh,
    onExport: handleExport
  })
}
```

### 3. Tabla con Selección Múltiple (Para operaciones en lote)

```tsx
import { createMultiSelectTable } from "../data-table"

export function MiTablaMultiSelect() {
  const handleCreate = () => { /* lógica de creación */ }
  const handleRefresh = () => { /* lógica de refresh */ }
  const handleExport = () => { /* lógica de exportación */ }
  const handleDelete = () => { /* lógica de eliminación */ }

  return createMultiSelectTable({
    columns: columns,
    data: data,
    title: "Gestión en Lote",
    description: "Operaciones múltiples sobre elementos seleccionados",
    searchKey: "nombre",
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })
}
```

### 4. Tabla Personalizada (Para casos especiales)

```tsx
import { DataTableEnhanced, commonActions } from "../data-table"

export function MiTablaPersonalizada() {
  const handleCreate = () => { /* lógica de creación */ }
  const handleRefresh = () => { /* lógica de refresh */ }
  const handleExport = () => { /* lógica de exportación */ }
  const handleCustomAction = () => { /* acción personalizada */ }

  // Acciones personalizadas
  const customActions = [
    commonActions.create(handleCreate, "Crear Nuevo"),
    commonActions.refresh(handleRefresh),
    commonActions.export(handleExport),
    {
      key: "custom",
      label: "Acción Personalizada",
      icon: CustomIcon,
      variant: "secondary",
      onClick: handleCustomAction
    }
  ]

  return (
    <DataTableEnhanced
      columns={columns}
      data={data}
      title="Tabla Personalizada"
      description="Tabla con funcionalidades específicas"
      searchKey="nombre"
      onRefresh={handleRefresh}
      onExport={handleExport}
      headerActions={customActions}
      // Configuraciones específicas
      showFacetedFilters={true}
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
    />
  )
}
```

## 🎨 Estándares de Columnas

### Estructura Básica de Columna

```tsx
const columns: ColumnDef<MiTipo>[] = [
  {
    accessorKey: "campo",
    header: "Título de Columna",
    cell: ({ row }) => {
      const valor = row.getValue("campo")
      return <div className="font-medium">{valor}</div>
    },
    size: 150, // Ancho recomendado
  }
]
```

### Tipos de Columna Comunes

#### 1. Columna de Texto Simple
```tsx
{
  accessorKey: "nombre",
  header: "Nombre",
  cell: ({ row }) => (
    <div className="font-medium">{row.getValue("nombre")}</div>
  ),
}
```

#### 2. Columna de Estado con Badge
```tsx
{
  accessorKey: "estado",
  header: "Estado",
  cell: ({ row }) => {
    const estado = row.getValue("estado") as string
    const variant = estado === 'activo' ? 'default' : 'secondary'
    
    return (
      <Badge variant={variant}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    )
  },
}
```

#### 3. Columna de Fecha
```tsx
{
  accessorKey: "fecha_creacion",
  header: "Fecha Creación",
  cell: ({ row }) => {
    const fecha = new Date(row.getValue("fecha_creacion"))
    return (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
    )
  },
}
```

#### 4. Columna de Acciones
```tsx
{
  id: "actions",
  header: "Acciones",
  cell: ({ row }) => {
    const item = row.original

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleView(item)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(item)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```

#### 3. Columna de Fecha
```tsx
{
  accessorKey: "fecha_creacion",
  header: "Fecha Creación",
  cell: ({ row }) => {
    const fecha = new Date(row.getValue("fecha_creacion"))
    return (
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">
          {fecha.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </span>
      </div>
    )
  },
}
```

#### 4. Columna de Acciones
```tsx
{
  id: "actions",
  header: "Acciones",
  cell: ({ row }) => {
    const item = row.original

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Abrir menú</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleView(item)}>
            <Eye className="mr-2 h-4 w-4" />
            Ver
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleEdit(item)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(item)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
```

## 🔧 Configuraciones Recomendadas

### Configuración Básica
```tsx
{
  pageSize: 10,
  showPagination: true,
  showToolbar: true,
  showSearch: true,
  showColumnToggle: true,
  showRowSelection: true,
  enableSorting: true,
  enableColumnFilters: true,
  enableRowSelection: true,
  enableGlobalFilter: true,
}
```

### Configuración para Tablas Grandes
```tsx
{
  pageSize: 25,
  pageSizeOptions: [10, 25, 50, 100],
  showFacetedFilters: true,
  showRowSelection: true,
}
```

### Configuración para Tablas de Solo Lectura
```tsx
{
  showRowSelection: false,
  enableRowSelection: false,
  showColumnToggle: false,
}
```

## 📱 Responsive Design

### Breakpoints Recomendados
```tsx
// Columna que se oculta en móvil
{
  accessorKey: "detalles",
  header: "Detalles",
  cell: ({ row }) => <div>{row.getValue("detalles")}</div>,
  size: 200,
  meta: {
    hideOnMobile: true
  }
}

// Columna que cambia de tamaño
{
  accessorKey: "descripcion",
  header: "Descripción",
  cell: ({ row }) => <div>{row.getValue("descripcion")}</div>,
  size: { default: 300, mobile: 150 }
}
```

## 🎯 Patrones de Acciones

### Acciones del Header
```tsx
headerActions={[
  // Acción siempre visible
  {
    key: "create",
    label: "Crear Nuevo",
    icon: Plus,
    variant: "default",
    onClick: handleCreate
  },
  
  // Acción de exportar - siempre disponible
  {
    key: "export",
    label: selectedCount > 0 ? `Exportar (${selectedCount})` : "Exportar Todo",
    icon: Download,
    variant: "outline",
    onClick: handleExport
  },
  
  // Acción solo cuando hay selección
  {
    key: "delete",
    label: `Eliminar (${selectedCount})`,
    icon: Trash2,
    variant: "destructive",
    onClick: handleDelete,
    disabled: selectedCount === 0,
    showWhen: { hasSelection: true, minSelection: 1 }
  }
]}
```

### ⚠️ Importante: Comportamiento del Botón Exportar

El botón de **Exportar** debe estar **siempre disponible** para permitir exportar todos los datos, incluso cuando no hay filas seleccionadas:

```tsx
// ✅ CORRECTO - Exportar siempre disponible
{
  key: "export",
  label: selectedCount > 0 ? `Exportar (${selectedCount})` : "Exportar Todo",
  icon: Download,
  variant: "outline",
  onClick: handleExport
}

// ❌ INCORRECTO - Exportar solo con selección
{
  key: "export",
  label: `Exportar (${selectedCount})`,
  icon: Download,
  variant: "outline",
  onClick: handleExport,
  disabled: selectedCount === 0,
  showWhen: { hasSelection: true }  // Esto bloquea la exportación
}
```

**Lógica de exportación recomendada:**
- **Sin selección**: Exportar todos los datos de la tabla
- **Con selección**: Exportar solo los datos seleccionados
- **Label dinámico**: Cambiar entre "Exportar Todo" y "Exportar (N)" según el contexto

### Acciones de Fila
```tsx
// Acciones contextuales según el estado
const getRowActions = (item: MiTipo) => {
  const actions = [
    {
      label: "Ver",
      icon: Eye,
      onClick: () => handleView(item)
    }
  ]

  if (item.estado === 'activo') {
    actions.push({
      label: "Pausar",
      icon: Pause,
      onClick: () => handlePause(item)
    })
  }

  if (item.estado === 'pausado') {
    actions.push({
      label: "Activar",
      icon: Play,
      onClick: () => handleActivate(item)
    })
  }

  actions.push({
    label: "Eliminar",
    icon: Trash2,
    onClick: () => handleDelete(item),
    className: "text-red-600"
  })

  return actions
}
```

## 🚨 Manejo de Estados

### Estados de Carga
```tsx
// Estado de carga inicial
if (isLoading && !data.length) {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
        <p className="text-muted-foreground">Cargando datos...</p>
      </div>
    </div>
  )
}

// Estado de error
if (error) {
  return (
    <div className="space-y-4">
      <DataTableHeader
        title={title}
        description={description}
        actions={headerActions}
      />
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600">Error: {error}</p>
        <Button 
          onClick={handleRetry} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Reintentar
        </Button>
      </div>
    </div>
  )
}
```

### Estados Vacíos
```tsx
emptyState={
  <div className="text-center py-8">
    <div className="text-muted-foreground mb-2">
      No se encontraron resultados
    </div>
    {onCreate && (
      <Button onClick={onCreate} variant="outline" size="sm">
        Crear primer elemento
      </Button>
    )}
  </div>
}
```

## 🔄 Migración de Tablas Existentes

### Paso 1: Identificar el Tipo de Tabla
- **CRUD Completo**: Usar `createCRUDTable`
- **Solo Lectura**: Usar `createReadOnlyTable`
- **Selección Múltiple**: Usar `createMultiSelectTable`
- **Casos Especiales**: Usar `DataTableEnhanced` directamente

### Paso 2: Refactorizar el Header
```tsx
// ANTES
<div className="flex items-center justify-between">
  <div>
    <h2 className="text-2xl font-bold tracking-tight">Mi Tabla</h2>
    <p className="text-muted-foreground">Descripción</p>
  </div>
  <div className="flex items-center space-x-2">
    <Button onClick={handleCreate}>Crear</Button>
    <Button onClick={handleExport}>Exportar</Button>
  </div>
</div>

// DESPUÉS
<DataTableEnhanced
  title="Mi Tabla"
  description="Descripción"
  headerActions={[
    {
      key: "create",
      label: "Crear",
      icon: Plus,
      onClick: handleCreate
    },
    {
      key: "export",
      label: "Exportar",
      icon: Download,
      onClick: handleExport
    }
  ]}
  // ... resto de props
/>
```

### Paso 3: Actualizar Imports
```tsx
// ANTES
import { DataTable } from "../data-table/DataTable"

// DESPUÉS
import { createCRUDTable } from "../data-table"
```

## ✅ Checklist de Implementación

### Antes de Crear una Nueva Tabla
- [ ] ¿Qué tipo de tabla es? (CRUD, Read-Only, Multi-Select)
- [ ] ¿Qué acciones necesita? (Crear, Editar, Eliminar, Exportar)
- [ ] ¿Necesita selección múltiple?
- [ ] ¿Qué filtros requiere?

### Durante la Implementación
- [ ] Usar la función helper apropiada
- [ ] Definir columnas con tipos correctos
- [ ] Implementar acciones del header
- [ ] Manejar estados de carga y error
- [ ] Configurar responsive design

### Después de la Implementación
- [ ] Verificar consistencia visual
- [ ] Probar funcionalidades en móvil
- [ ] Validar accesibilidad
- [ ] Documentar casos especiales

## 🎨 Personalización de Temas

### Variables CSS Recomendadas
```css
:root {
  --datatable-border-radius: 0.5rem;
  --datatable-header-height: 2.25rem;
  --datatable-row-height: 2.5rem;
  --datatable-padding: 1rem;
  --datatable-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

### Clases CSS Personalizadas
```tsx
className="custom-datatable"
// En CSS:
.custom-datatable {
  border-radius: var(--datatable-border-radius);
  box-shadow: var(--datatable-shadow);
}

.custom-datatable .datatable-header {
  background: var(--datatable-header-bg);
  border-bottom: 1px solid var(--datatable-border);
}
```

## 📊 Métricas y Rendimiento

### Optimizaciones Recomendadas
```tsx
// Virtualización para tablas grandes
import { useVirtualizer } from '@tanstack/react-virtual'

// Lazy loading de datos
const { data, isLoading, fetchNextPage } = useInfiniteQuery({
  queryKey: ['mi-tabla'],
  queryFn: fetchPage,
  getNextPageParam: (lastPage) => lastPage.nextCursor,
})

// Debounce en búsqueda
const debouncedSearch = useDebounce(searchTerm, 300)
```

### Monitoreo de Rendimiento
```tsx
// Medir tiempo de renderizado
const startTime = performance.now()
useEffect(() => {
  const endTime = performance.now()
  console.log(`Tabla renderizada en ${endTime - startTime}ms`)
}, [data])

// Memoización de columnas
const columns = useMemo(() => [
  // ... definición de columnas
], [handleEdit, handleDelete])
```

## 🔍 Testing y Debugging

### Tests Recomendados
```tsx
// Test de renderizado
test('renderiza tabla con datos', () => {
  render(<MiTabla data={mockData} />)
  expect(screen.getByText('Mi Tabla')).toBeInTheDocument()
  expect(screen.getByText('Crear')).toBeInTheDocument()
})

// Test de acciones
test('ejecuta acción de crear', () => {
  const mockCreate = jest.fn()
  render(<MiTabla onCreate={mockCreate} />)
  fireEvent.click(screen.getByText('Crear'))
  expect(mockCreate).toHaveBeenCalled()
})
```

### Debugging
```tsx
// Logs de debug
useEffect(() => {
  console.log('🔄 Estado de la tabla:', {
    data: data.length,
    loading,
    error,
    selectedRows: selectedRows.length
  })
}, [data, loading, error, selectedRows])

// Validación de props
if (process.env.NODE_ENV === 'development') {
  if (!columns || columns.length === 0) {
    console.warn('⚠️ MiTabla: No se proporcionaron columnas')
  }
  if (!data) {
    console.warn('⚠️ MiTabla: No se proporcionaron datos')
  }
}
```

## 📚 Recursos Adicionales

### Documentación
- [DATATABLE_STANDARDIZATION.md](../DATATABLE_STANDARDIZATION.md)
- [example-usage.tsx](../app/admin/components/data-table/example-usage.tsx)

### Componentes Relacionados
- [DataTableHeader](../app/admin/components/data-table/DataTableHeader.tsx)
- [DataTableToolbar](../app/admin/components/data-table/DataTableToolbar.tsx)
- [DataTableEnhanced](../app/admin/components/data-table/DataTableEnhanced.tsx)

### Patrones de Diseño
- [shadcn/ui Table](https://ui.shadcn.com/docs/components/table)
- [TanStack Table](https://tanstack.com/table/v8/docs/guide/introduction)

---

**Nota**: Esta guía debe actualizarse conforme evolucione el sistema. Mantener consistencia es clave para la experiencia del usuario y la mantenibilidad del código.
