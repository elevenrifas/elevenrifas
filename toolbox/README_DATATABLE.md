# 🎯 TOOLBOX DATATABLE - ELEVEN RIFAS

## 📋 Resumen

Este directorio contiene herramientas y guías para la creación estandarizada de DataTables en el panel de administración, siguiendo los patrones establecidos para mantener consistencia y calidad en todo el sistema.

## 🛠️ Herramientas Disponibles

### 1. Generador de DataTables
**Archivo**: `scripts/generate_datatable.js`

Script automatizado para generar tablas estandarizadas siguiendo los patrones establecidos.

#### Uso Básico
```bash
cd toolbox/scripts
node generate_datatable.js [tipo] [nombre] [entidad]
```

#### Tipos de Tabla Disponibles
- **`crud`** - Tabla con operaciones CRUD completas (crear, leer, actualizar, eliminar)
- **`readonly`** - Tabla de solo lectura para reportes y visualización
- **`multiselect`** - Tabla con selección múltiple para operaciones en lote
- **`custom`** - Tabla personalizada con funcionalidades específicas

#### Ejemplos de Uso

```bash
# Generar tabla CRUD para productos
node generate_datatable.js crud Productos producto

# Generar tabla de solo lectura para reportes
node generate_datatable.js readonly Reportes reporte

# Generar tabla con selección múltiple para usuarios
node generate_datatable.js multiselect Usuarios usuario

# Generar tabla personalizada para dashboard
node generate_datatable.js custom Dashboard dashboard
```

#### Estructura Generada

El generador crea automáticamente:
- ✅ Componente React con TypeScript
- ✅ Props tipadas correctamente
- ✅ Columnas estándar (ID, Nombre, Estado, Fecha, Acciones)
- ✅ Hooks y funciones de manejo
- ✅ Integración con el sistema DataTableEnhanced
- ✅ Comentarios y documentación
- ✅ Patrones de nomenclatura consistentes

### 2. Guía de Creación
**Archivo**: `DATATABLE_CREATION_GUIDE.md`

Guía completa que cubre:
- 🏗️ Arquitectura del sistema
- 🚀 Patrones de implementación
- 🎨 Estándares de columnas
- 🔧 Configuraciones recomendadas
- 📱 Responsive design
- 🎯 Patrones de acciones
- 🚨 Manejo de estados
- 🔄 Migración de tablas existentes
- ✅ Checklist de implementación
- 🎨 Personalización de temas
- 📊 Métricas y rendimiento
- 🔍 Testing y debugging

## 📚 Recursos de Referencia

### Documentación Principal
- **`DATATABLE_STANDARDIZATION.md`** - Documentación técnica del sistema
- **`DATATABLE_CREATION_GUIDE.md`** - Guía práctica de implementación
- **`example-usage.tsx`** - Ejemplos de uso en código

### Componentes del Sistema
- **`DataTableEnhanced`** - Tabla unificada principal
- **`DataTableHeader`** - Header estandarizado con acciones
- **`DataTableToolbar`** - Toolbar con búsqueda y filtros
- **`DataTable`** - Tabla original (compatibilidad)
- **`DataTableSimple`** - Tabla simplificada (compatibilidad)

### Funciones Helper
- **`createCRUDTable`** - Para tablas CRUD completas
- **`createReadOnlyTable`** - Para tablas de solo lectura
- **`createMultiSelectTable`** - Para tablas con selección múltiple

## 🚀 Flujo de Trabajo Recomendado

### 1. Planificación
```bash
# Identificar el tipo de tabla necesaria
- ¿Es para gestión (CRUD)?
- ¿Es para visualización (ReadOnly)?
- ¿Necesita selección múltiple?
- ¿Requiere funcionalidades especiales?
```

### 2. Generación Automática
```bash
# Usar el generador para crear la estructura base
node generate_datatable.js [tipo] [nombre] [entidad]
```

### 3. Personalización
- Revisar y ajustar las columnas según necesidades
- Implementar hooks específicos para la entidad
- Configurar acciones y filtros personalizados
- Ajustar estilos y comportamiento

### 4. Integración
- Agregar la tabla al sistema de navegación
- Implementar modales y formularios necesarios
- Configurar permisos y validaciones
- Agregar tests y documentación

## 🔧 Configuración del Entorno

### Prerrequisitos
- Node.js 16+ instalado
- Acceso al directorio del proyecto
- Conocimiento básico de React y TypeScript

### Estructura de Directorios
```
toolbox/
├── README_DATATABLE.md              # Este archivo
├── DATATABLE_CREATION_GUIDE.md      # Guía completa
├── scripts/
│   └── generate_datatable.js        # Generador automático
└── templates/                       # Plantillas (futuro)
```

### Permisos de Ejecución
```bash
# En sistemas Unix/Linux
chmod +x scripts/generate_datatable.js

# En Windows (PowerShell)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 📝 Ejemplos de Implementación

### Tabla CRUD Básica
```tsx
import { createCRUDTable } from "../data-table"

export function ProductosTable() {
  return createCRUDTable({
    columns: productColumns,
    data: products,
    title: "Productos",
    description: "Gestiona todos los productos del sistema",
    searchKey: "nombre",
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })
}
```

### Tabla Personalizada
```tsx
import { DataTableEnhanced, commonActions } from "../data-table"

export function DashboardTable() {
  const customActions = [
    commonActions.create(handleCreate, "Nuevo Elemento"),
    commonActions.refresh(handleRefresh),
    commonActions.export(handleExport)
  ]

  return (
    <DataTableEnhanced
      columns={dashboardColumns}
      data={dashboardData}
      title="Dashboard"
      description="Vista personalizada del sistema"
      headerActions={customActions}
      showFacetedFilters={true}
      facetedFilters={[
        {
          column: "categoria",
          title: "Categoría",
          options: [
            { label: "Ventas", value: "ventas" },
            { label: "Inventario", value: "inventario" }
          ]
        }
      ]}
    />
  )
}
```

## 🎯 Mejores Prácticas

### 1. Nomenclatura
- **Archivos**: `[Entidad]Table.tsx` (ej: `ProductosTable.tsx`)
- **Componentes**: `[Entidad]Table` (ej: `ProductosTable`)
- **Hooks**: `use[Entidad]s` (ej: `useProductos`)
- **Tipos**: `Admin[Entidad]` (ej: `AdminProducto`)

### 2. Estructura de Columnas
- **ID**: Siempre primera, con estilo monoespaciado
- **Nombre/Título**: Columna principal para búsqueda
- **Estado**: Con badges coloridos y consistentes
- **Fecha**: Con iconos y formato localizado
- **Acciones**: Última columna con menú desplegable

### 3. Estados y Loading
- Manejar estados de carga inicial
- Mostrar errores de manera amigable
- Estados vacíos con call-to-action
- Indicadores de progreso para operaciones

### 4. Responsive Design
- Ocultar columnas menos importantes en móvil
- Ajustar tamaños de columna según viewport
- Menús de acción adaptables
- Paginación optimizada para móvil

### 5. ⚠️ Configuración del Botón Exportar

**IMPORTANTE**: El botón de exportar debe estar **siempre disponible** para permitir exportar todos los datos:

```tsx
// ✅ CORRECTO - Exportar siempre disponible
const handleExport = () => {
  try {
    if (onExport) {
      // Exportar seleccionados si los hay, sino exportar todo
      const dataToExport = selectedRows.length > 0 ? selectedRows : data
      onExport(dataToExport)
      console.log(`🔄 Exportando ${dataToExport.length} elementos`)
    }
  } catch (error) {
    console.error('Error al exportar:', error)
  }
}

// En headerActions - NO usar showWhen ni disabled
{
  key: "export",
  label: selectedRows.length > 0 ? `Exportar (${selectedRows.length})` : "Exportar Todo",
  icon: () => <div className="h-4 w-4 mr-2">↓</div>,
  variant: "outline",
  onClick: handleExport
}
```

**Evitar estas configuraciones que bloquean la exportación:**
- ❌ `showWhen: { hasSelection: true }`
- ❌ `disabled: selectedRows.length === 0`
- ❌ `exportDisabled: selectedRows.length === 0`

## 🔍 Troubleshooting

### Problemas Comunes

#### 1. Error de Importación
```bash
# Error: Cannot find module '../data-table'
# Solución: Verificar que el archivo index.ts existe y exporta correctamente
```

#### 2. Tipos TypeScript Incorrectos
```bash
# Error: Property 'nombre' does not exist on type 'AdminProducto'
# Solución: Verificar que el tipo AdminProducto tiene la propiedad 'nombre'
```

#### 3. Botón Exportar Bloqueado
```bash
# Problema: El botón exportar no funciona o está deshabilitado
# Solución: Verificar que NO se use:
# - showWhen: { hasSelection: true } en la acción de exportar
# - disabled: selectedRows.length === 0 en la acción de exportar
# - exportDisabled: selectedRows.length === 0 en las props del componente
```

#### 3. Hook No Encontrado
```bash
# Error: Hook 'useProductos' is not defined
# Solución: Crear el hook useProductos en hooks/use-productos.ts
```

#### 4. Estilos No Aplicados
```bash
# Error: Los estilos de la tabla no se ven correctos
# Solución: Verificar que los componentes UI están importados correctamente
```

### Logs de Debug
```tsx
// Agregar logs para debugging
useEffect(() => {
  console.log('🔄 Estado de la tabla:', {
    data: data.length,
    loading,
    error,
    selectedRows: selectedRows.length
  })
}, [data, loading, error, selectedRows])
```

## 📊 Métricas y Monitoreo

### Performance
- Medir tiempo de renderizado
- Monitorear re-renders innecesarios
- Optimizar con React.memo y useMemo
- Lazy loading para tablas grandes

### Usabilidad
- Tracking de acciones del usuario
- Métricas de búsqueda y filtros
- Tiempo de respuesta de operaciones
- Feedback de errores y éxito

## 🔮 Roadmap y Futuro

### Próximas Funcionalidades
- [ ] Generador de modales automático
- [ ] Plantillas de formularios
- [ ] Sistema de permisos integrado
- [ ] Tests automatizados
- [ ] Temas personalizables
- [ ] Exportación a múltiples formatos
- [ ] Filtros avanzados
- [ ] Drag & Drop para reordenamiento

### Contribuciones
- Reportar bugs y sugerencias
- Proponer nuevas funcionalidades
- Contribuir con mejoras de código
- Documentar casos de uso especiales

## 📞 Soporte y Contacto

### Recursos de Ayuda
- **Documentación**: Revisar `DATATABLE_CREATION_GUIDE.md`
- **Ejemplos**: Ver `example-usage.tsx`
- **Issues**: Reportar en el sistema de tickets del proyecto

### Comunidad
- Compartir soluciones y patrones
- Documentar casos de uso exitosos
- Contribuir con mejoras y optimizaciones

---

**Nota**: Esta documentación debe mantenerse actualizada conforme evolucione el sistema. Para preguntas específicas, consultar la guía completa o contactar al equipo de desarrollo.
