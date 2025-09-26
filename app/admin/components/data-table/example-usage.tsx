"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DataTableEnhanced, 
  createCRUDTable, 
  createReadOnlyTable, 
  createMultiSelectTable,
  actionConfigs,
  commonActions
} from "./index"
import { Plus, Download, RefreshCw, Trash2, Edit, Eye } from "lucide-react"

// =====================================================
// 🎯 EJEMPLOS DE USO - DATA TABLE ENHANCED
// =====================================================
// Muestra diferentes formas de implementar tablas estandarizadas
// =====================================================

// Tipo de ejemplo
interface ExampleData {
  id: string
  name: string
  status: 'active' | 'inactive' | 'pending'
  category: string
  createdAt: Date
}

// Columnas de ejemplo
const exampleColumns: ColumnDef<ExampleData>[] = [
  {
    accessorKey: "name",
    header: "Nombre",
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const variant = status === 'active' ? 'default' : status === 'pending' ? 'secondary' : 'outline'
      return <Badge variant={variant}>{status}</Badge>
    },
  },
  {
    accessorKey: "category",
    header: "Categoría",
    cell: ({ row }) => <div className="text-sm">{row.getValue("category")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: "Fecha",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"))
      return <div className="text-sm">{date.toLocaleDateString()}</div>
    },
  },
]

// Datos de ejemplo
const exampleData: ExampleData[] = [
  { id: "1", name: "Ejemplo 1", status: "active", category: "A", createdAt: new Date() },
  { id: "2", name: "Ejemplo 2", status: "pending", category: "B", createdAt: new Date() },
  { id: "3", name: "Ejemplo 3", status: "inactive", category: "A", createdAt: new Date() },
]

// =====================================================
// 🎯 EJEMPLO 1: TABLA BÁSICA CON DATA TABLE ENHANCED
// =====================================================

export function ExampleBasicTable() {
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")

  return (
    <DataTableEnhanced
      columns={exampleColumns}
      data={exampleData}
      title="Tabla Básica"
      description="Ejemplo de tabla básica con funcionalidades estándar"
      searchKey="name"
      searchPlaceholder="Buscar por nombre..."
      onRefresh={handleRefresh}
      onExport={handleExport}
    />
  )
}

// =====================================================
// 🎯 EJEMPLO 2: TABLA CRUD COMPLETA
// =====================================================

export function ExampleCRUDTable() {
  const handleCreate = () => console.log("Crear")
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")
  const handleDelete = () => console.log("Eliminar")

  return createCRUDTable({
    columns: exampleColumns,
    data: exampleData,
    title: "Tabla CRUD",
    description: "Tabla con operaciones CRUD completas",
    searchKey: "name",
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })
}

// =====================================================
// 🎯 EJEMPLO 3: TABLA DE SOLO LECTURA
// =====================================================

export function ExampleReadOnlyTable() {
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")

  return createReadOnlyTable({
    columns: exampleColumns,
    data: exampleData,
    title: "Tabla Read-Only",
    description: "Tabla de solo lectura para visualización",
    searchKey: "name",
    onRefresh: handleRefresh,
    onExport: handleExport
  })
}

// =====================================================
// 🎯 EJEMPLO 4: TABLA CON SELECCIÓN MÚLTIPLE
// =====================================================

export function ExampleMultiSelectTable() {
  const handleCreate = () => console.log("Crear")
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")
  const handleDelete = () => console.log("Eliminar")

  return createMultiSelectTable({
    columns: exampleColumns,
    data: exampleData,
    title: "Tabla Multi-Select",
    description: "Tabla con selección múltiple de filas",
    searchKey: "name",
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })
}

// =====================================================
// 🎯 EJEMPLO 5: TABLA PERSONALIZADA CON ACCIONES
// =====================================================

export function ExampleCustomTable() {
  const handleCreate = () => console.log("Crear")
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")
  const handleDelete = () => console.log("Eliminar")
  const handleView = () => console.log("Ver")

  // Acciones personalizadas
  const customActions = [
    commonActions.create(handleCreate, "Crear Nuevo"),
    commonActions.view(handleView, "Ver Detalles"),
    commonActions.refresh(handleRefresh),
    commonActions.export(handleExport),
    commonActions.delete(handleDelete, "Eliminar Seleccionados")
  ]

  return (
    <DataTableEnhanced
      columns={exampleColumns}
      data={exampleData}
      title="Tabla Personalizada"
      description="Tabla con acciones personalizadas y configuración avanzada"
      searchKey="name"
      searchPlaceholder="Buscar elementos..."
      pageSize={5}
      showPagination={true}
      showToolbar={true}
      showSearch={true}
      showColumnToggle={true}
      showRowSelection={true}
      onRefresh={handleRefresh}
      onExport={handleExport}
      onRowSelectionChange={(rows) => console.log("Filas seleccionadas:", rows)}
      headerActions={customActions}
      facetedFilters={[
        {
          column: "status",
          title: "Estado",
          options: [
            { label: "Activo", value: "active" },
            { label: "Pendiente", value: "pending" },
            { label: "Inactivo", value: "inactive" }
          ]
        },
        {
          column: "category",
          title: "Categoría",
          options: [
            { label: "Categoría A", value: "A" },
            { label: "Categoría B", value: "B" }
          ]
        }
      ]}
      emptyState={
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-2">No hay datos disponibles</p>
          <Button onClick={handleCreate} variant="outline" size="sm">
            Crear primer elemento
          </Button>
        </div>
      }
    />
  )
}

// =====================================================
// 🎯 EJEMPLO 6: TABLA CON CONFIGURACIÓN DE ACCIONES
// =====================================================

export function ExampleActionConfigTable() {
  const handleCreate = () => console.log("Crear")
  const handleRefresh = () => console.log("Refrescar")
  const handleExport = () => console.log("Exportar")
  const handleDelete = () => console.log("Eliminar")

  // Usar configuraciones predefinidas
  const actions = actionConfigs.fullCRUD({
    onCreate: handleCreate,
    onRefresh: handleRefresh,
    onExport: handleExport,
    onDelete: handleDelete
  })

  return (
    <DataTableEnhanced
      columns={exampleColumns}
      data={exampleData}
      title="Tabla con Configuración de Acciones"
      description="Tabla usando configuraciones predefinidas de acciones"
      searchKey="name"
      onRefresh={handleRefresh}
      onExport={handleExport}
      headerActions={actions}
    />
  )
}

// =====================================================
// 🎯 COMPONENTE PRINCIPAL DE EJEMPLOS
// =====================================================

export function DataTableExamples() {
  const [activeExample, setActiveExample] = React.useState<string>("basic")

  const examples = {
    basic: { label: "Básica", component: <ExampleBasicTable /> },
    crud: { label: "CRUD", component: <ExampleCRUDTable /> },
    readonly: { label: "Read-Only", component: <ExampleReadOnlyTable /> },
    multiselect: { label: "Multi-Select", component: <ExampleMultiSelectTable /> },
    custom: { label: "Personalizada", component: <ExampleCustomTable /> },
    actionconfig: { label: "Configuración de Acciones", component: <ExampleActionConfigTable /> }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Ejemplos de DataTable Enhanced</h1>
        <p className="text-muted-foreground mt-2">
          Diferentes formas de implementar tablas estandarizadas
        </p>
      </div>

      {/* Selector de ejemplos */}
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(examples).map(([key, { label }]) => (
          <Button
            key={key}
            variant={activeExample === key ? "default" : "outline"}
            onClick={() => setActiveExample(key)}
            size="sm"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Ejemplo activo */}
      <div className="border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {examples[activeExample as keyof typeof examples].label}
        </h2>
        {examples[activeExample as keyof typeof examples].component}
      </div>
    </div>
  )
}











































