#!/usr/bin/env node

/**
 * 🎯 GENERADOR DE DATATABLES - ELEVEN RIFAS
 * 
 * Script para generar tablas estandarizadas siguiendo los patrones establecidos
 * Uso: node generate_datatable.js [tipo] [nombre] [entidad]
 * 
 * Tipos disponibles:
 * - crud: Tabla con operaciones CRUD completas
 * - readonly: Tabla de solo lectura
 * - multiselect: Tabla con selección múltiple
 * - custom: Tabla personalizada
 */

const fs = require('fs');
const path = require('path');

// Configuración
const TABLES_DIR = path.join(__dirname, '../../app/admin/components/tables');
const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Colores para consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Función para log con colores
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Función para error
function error(message) {
  log(`❌ ERROR: ${message}`, 'red');
  process.exit(1);
}

// Función para éxito
function success(message) {
  log(`✅ ${message}`, 'green');
}

// Función para info
function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

// Función para warning
function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

// Función para validar argumentos
function validateArgs() {
  const args = process.argv.slice(2);
  
  if (args.length < 3) {
    error('Uso: node generate_datatable.js [tipo] [nombre] [entidad]');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node generate_datatable.js crud Productos producto');
    console.log('  node generate_datatable.js readonly Reportes reporte');
    console.log('  node generate_datatable.js multiselect Usuarios usuario');
    console.log('  node generate_datatable.js custom Dashboard dashboard');
    console.log('');
    console.log('Tipos disponibles: crud, readonly, multiselect, custom');
    process.exit(1);
  }

  const [tipo, nombre, entidad] = args;
  
  const tiposValidos = ['crud', 'readonly', 'multiselect', 'custom'];
  if (!tiposValidos.includes(tipo)) {
    error(`Tipo inválido: ${tipo}. Tipos válidos: ${tiposValidos.join(', ')}`);
  }

  return { tipo, nombre, entidad };
}

// Función para generar nombre de archivo
function generateFileName(nombre, entidad) {
  const fileName = nombre.replace(/\s+/g, '') + 'Table.tsx';
  return path.join(TABLES_DIR, fileName);
}

// Función para generar nombre de clase
function generateClassName(nombre) {
  return nombre.replace(/\s+/g, '') + 'Table';
}

// Función para generar nombre de tipo
function generateTypeName(entidad) {
  return entidad.charAt(0).toUpperCase() + entidad.slice(1);
}

// Función para generar nombre de hook
function generateHookName(entidad) {
  return `use${generateTypeName(entidad)}s`;
}

// Función para generar template CRUD
function generateCRUDTemplate(nombre, entidad) {
  const className = generateClassName(nombre);
  const typeName = generateTypeName(entidad);
  const hookName = generateHookName(entidad);
  
  return `"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createCRUDTable } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Tag, Calendar } from "lucide-react"
import type { Admin${typeName} } from "@/lib/database/admin_database/${entidad}s"
import { use${typeName}s } from "@/hooks/${hookName}"

// =====================================================
// 🎯 TABLA ${nombre.toUpperCase()} - ELEVEN RIFAS
// =====================================================
// Tabla estandarizada para gestionar ${entidad}s
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface ${className}Props {
  onCreate?: () => void
  onEdit?: (${entidad}: Admin${typeName}) => void
  onDelete?: (${entidad}s: Admin${typeName}[]) => void
  onView?: (${entidad}: Admin${typeName}) => void
  onExport?: (${entidad}s: Admin${typeName}[]) => void
}

// Componente principal
export function ${className}({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: ${className}Props) {
  // Hook para obtener ${entidad}s de la base de datos
  const { ${entidad}s, loading, error, load${typeName}s } = use${typeName}s()
  const [selectedRows, setSelectedRows] = React.useState<Admin${typeName}[]>([])

  // Cargar ${entidad}s al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando ${entidad}s...')
    load${typeName}s()
  }, [])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: Admin${typeName}[]) => {
    setSelectedRows(rows)
  }, [])

  // Función para manejar la exportación
  const handleExport = () => {
    if (onExport) {
      onExport(selectedRows.length > 0 ? selectedRows : ${entidad}s)
    }
  }

  // Función para manejar el refresh
  const handleRefresh = () => {
    load${typeName}s()
  }

  // Función para manejar la eliminación
  const handleDelete = () => {
    if (onDelete && selectedRows.length > 0) {
      onDelete(selectedRows)
    }
  }

  // Columnas de la tabla
  const ${entidad}sColumns: ColumnDef<Admin${typeName}>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
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
      size: 100,
    },
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
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const ${entidad} = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(${entidad})}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(${entidad})}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.([${entidad}])}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createCRUDTable */}
      {createCRUDTable({
        columns: ${entidad}sColumns,
        data: ${entidad}s,
        title: "${nombre}",
        description: "Gestiona todos los ${entidad}s del sistema",
        searchKey: "nombre",
        searchPlaceholder: "Buscar ${entidad}s...",
        pageSize: 10,
        showPagination: true,
        showToolbar: true,
        showSearch: true,
        showColumnToggle: true,
        showRowSelection: true,
        loading: loading,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: onCreate,
        onDelete: handleDelete
      })}
    </div>
  )
}
`;
}

// Función para generar template ReadOnly
function generateReadOnlyTemplate(nombre, entidad) {
  const className = generateClassName(nombre);
  const typeName = generateTypeName(entidad);
  const hookName = generateHookName(entidad);
  
  return `"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { createReadOnlyTable } from "../data-table"
import { Calendar } from "lucide-react"
import type { Admin${typeName} } from "@/lib/database/admin_database/${entidad}s"
import { use${typeName}s } from "@/hooks/${hookName}"

// =====================================================
// 🎯 TABLA ${nombre.toUpperCase()} - ELEVEN RIFAS
// =====================================================
// Tabla de solo lectura para visualizar ${entidad}s
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface ${className}Props {
  onExport?: (${entidad}s: Admin${typeName}[]) => void
}

// Componente principal
export function ${className}({
  onExport,
}: ${className}Props) {
  // Hook para obtener ${entidad}s de la base de datos
  const { ${entidad}s, loading, error, load${typeName}s } = use${typeName}s()

  // Cargar ${entidad}s al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando ${entidad}s...')
    load${typeName}s()
  }, [])

  // Función para manejar el refresh
  const handleRefresh = () => {
    load${typeName}s()
  }

  // Función para manejar la exportación
  const handleExport = () => {
    if (onExport) {
      onExport(${entidad}s)
    }
  }

  // Columnas de la tabla
  const ${entidad}sColumns: ColumnDef<Admin${typeName}>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
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
      size: 100,
    },
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
    },
  ]

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createReadOnlyTable */}
      {createReadOnlyTable({
        columns: ${entidad}sColumns,
        data: ${entidad}s,
        title: "${nombre}",
        description: "Visualización de ${entidad}s para análisis",
        searchKey: "nombre",
        searchPlaceholder: "Buscar ${entidad}s...",
        pageSize: 10,
        showPagination: true,
        showToolbar: true,
        showSearch: true,
        showColumnToggle: true,
        loading: loading,
        error: error,
        onRefresh: handleRefresh,
        onExport: handleExport
      })}
    </div>
  )
}
`;
}

// Función para generar template MultiSelect
function generateMultiSelectTemplate(nombre, entidad) {
  const className = generateClassName(nombre);
  const typeName = generateTypeName(entidad);
  const hookName = generateHookName(entidad);
  
  return `"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { createMultiSelectTable } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar } from "lucide-react"
import type { Admin${typeName} } from "@/lib/database/admin_database/${entidad}s"
import { use${typeName}s } from "@/hooks/${hookName}"

// =====================================================
// 🎯 TABLA ${nombre.toUpperCase()} - ELEVEN RIFAS
// =====================================================
// Tabla con selección múltiple para operaciones en lote
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface ${className}Props {
  onCreate?: () => void
  onEdit?: (${entidad}: Admin${typeName}) => void
  onDelete?: (${entidad}s: Admin${typeName}[]) => void
  onView?: (${entidad}: Admin${typeName}) => void
  onExport?: (${entidad}s: Admin${typeName}[]) => void
}

// Componente principal
export function ${className}({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
}: ${className}Props) {
  // Hook para obtener ${entidad}s de la base de datos
  const { ${entidad}s, loading, error, load${typeName}s } = use${typeName}s()
  const [selectedRows, setSelectedRows] = React.useState<Admin${typeName}[]>([])

  // Cargar ${entidad}s al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando ${entidad}s...')
    load${typeName}s()
  }, [])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: Admin${typeName}[]) => {
    setSelectedRows(rows)
  }, [])

  // Función para manejar la exportación
  const handleExport = () => {
    if (onExport) {
      onExport(selectedRows.length > 0 ? selectedRows : ${entidad}s)
    }
  }

  // Función para manejar el refresh
  const handleRefresh = () => {
    load${typeName}s()
  }

  // Función para manejar la eliminación
  const handleDelete = () => {
    if (onDelete && selectedRows.length > 0) {
      onDelete(selectedRows)
    }
  }

  // Columnas de la tabla
  const ${entidad}sColumns: ColumnDef<Admin${typeName}>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
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
      size: 100,
    },
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
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const ${entidad} = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(${entidad})}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(${entidad})}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onDelete?.([${entidad}])}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando createMultiSelectTable */}
      {createMultiSelectTable({
        columns: ${entidad}sColumns,
        data: ${entidad}s,
        title: "${nombre}",
        description: "Operaciones múltiples sobre ${entidad}s seleccionados",
        searchKey: "nombre",
        searchPlaceholder: "Buscar ${entidad}s...",
        pageSize: 10,
        showPagination: true,
        showToolbar: true,
        showSearch: true,
        showColumnToggle: true,
        loading: loading,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        onCreate: onCreate,
        onDelete: handleDelete
      })}
    </div>
  )
}
`;
}

// Función para generar template Custom
function generateCustomTemplate(nombre, entidad) {
  const className = generateClassName(nombre);
  const typeName = generateTypeName(entidad);
  const hookName = generateHookName(entidad);
  
  return `"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { DataTableEnhanced, commonActions } from "../data-table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, Eye, Calendar, Settings } from "lucide-react"
import type { Admin${typeName} } from "@/lib/database/admin_database/${entidad}s"
import { use${typeName}s } from "@/hooks/${hookName}"

// =====================================================
// 🎯 TABLA ${nombre.toUpperCase()} - ELEVEN RIFAS
// =====================================================
// Tabla personalizada con funcionalidades específicas
// Usa el nuevo sistema DataTableEnhanced
// =====================================================

// Props del componente
interface ${className}Props {
  onCreate?: () => void
  onEdit?: (${entidad}: Admin${typeName}) => void
  onDelete?: (${entidad}s: Admin${typeName}[]) => void
  onView?: (${entidad}: Admin${typeName}) => void
  onExport?: (${entidad}s: Admin${typeName}[]) => void
  onCustomAction?: (${entidad}: Admin${typeName}) => void
}

// Componente principal
export function ${className}({
  onCreate,
  onEdit,
  onDelete,
  onView,
  onExport,
  onCustomAction,
}: ${className}Props) {
  // Hook para obtener ${entidad}s de la base de datos
  const { ${entidad}s, loading, error, load${typeName}s } = use${typeName}s()
  const [selectedRows, setSelectedRows] = React.useState<Admin${typeName}[]>([])

  // Cargar ${entidad}s al montar el componente
  React.useEffect(() => {
    console.log('🔄 Cargando ${entidad}s...')
    load${typeName}s()
  }, [])

  // Función para manejar la selección de filas
  const handleRowSelectionChange = React.useCallback((rows: Admin${typeName}[]) => {
    setSelectedRows(rows)
  }, [])

  // Función para manejar la exportación
  const handleExport = () => {
    if (onExport) {
      onExport(selectedRows.length > 0 ? selectedRows : ${entidad}s)
    }
  }

  // Función para manejar el refresh
  const handleRefresh = () => {
    load${typeName}s()
  }

  // Función para manejar la eliminación
  const handleDelete = () => {
    if (onDelete && selectedRows.length > 0) {
      onDelete(selectedRows)
    }
  }

  // Acciones personalizadas
  const customActions = [
    commonActions.create(onCreate || (() => {}), "Crear ${typeName}"),
    commonActions.refresh(handleRefresh),
    commonActions.export(handleExport),
    {
      key: "custom",
      label: "Acción Personalizada",
      icon: Settings,
      variant: "secondary",
      onClick: () => console.log("Acción personalizada")
    }
  ]

  // Columnas de la tabla
  const ${entidad}sColumns: ColumnDef<Admin${typeName}>[] = [
    {
      accessorKey: "id",
      header: "ID",
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.getValue("id")}</div>
      ),
      size: 80,
    },
    {
      accessorKey: "nombre",
      header: "Nombre",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("nombre")}</div>
      ),
    },
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
      size: 100,
    },
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
    },
    {
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => {
        const ${entidad} = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView?.(${entidad})}>
                <Eye className="mr-2 h-4 w-4" />
                Ver
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit?.(${entidad})}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {onCustomAction && (
                <DropdownMenuItem onClick={() => onCustomAction(${entidad})}>
                  <Settings className="mr-2 h-4 w-4" />
                  Acción Personalizada
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete?.([${entidad}])}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      {/* Tabla estandarizada usando DataTableEnhanced */}
      <DataTableEnhanced
        columns={${entidad}sColumns}
        data={${entidad}s}
        title="${nombre}"
        description="Tabla personalizada con funcionalidades específicas"
        searchKey="nombre"
        searchPlaceholder="Buscar ${entidad}s..."
        pageSize: 10,
        showPagination: true,
        showToolbar: true,
        showSearch: true,
        showColumnToggle: true,
        showRowSelection: true,
        loading: loading,
        error: error,
        onRowSelectionChange: handleRowSelectionChange,
        onRefresh: handleRefresh,
        onExport: handleExport,
        headerActions={customActions}
        // Configuraciones específicas
        showFacetedFilters: true,
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
    </div>
  )
}
`;
}

// Función principal
function main() {
  try {
    log('🎯 GENERADOR DE DATATABLES - ELEVEN RIFAS', 'bright');
    log('====================================================', 'cyan');
    
    // Validar argumentos
    const { tipo, nombre, entidad } = validateArgs();
    
    info(`Generando tabla de tipo: ${tipo}`);
    info(`Nombre de la tabla: ${nombre}`);
    info(`Entidad: ${entidad}`);
    
    // Verificar que el directorio de tablas existe
    if (!fs.existsSync(TABLES_DIR)) {
      error(`El directorio de tablas no existe: ${TABLES_DIR}`);
    }
    
    // Generar nombre del archivo
    const fileName = generateFileName(nombre, entidad);
    
    // Verificar si el archivo ya existe
    if (fs.existsSync(fileName)) {
      warning(`El archivo ya existe: ${fileName}`);
      const readline = require('readline');
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question('¿Desea sobrescribirlo? (y/N): ', (answer) => {
        rl.close();
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          generateTable(tipo, nombre, entidad, fileName);
        } else {
          info('Operación cancelada');
          process.exit(0);
        }
      });
    } else {
      generateTable(tipo, nombre, entidad, fileName);
    }
    
  } catch (error) {
    error(`Error inesperado: ${error.message}`);
    process.exit(1);
  }
}

// Función para generar la tabla
function generateTable(tipo, nombre, entidad, fileName) {
  let template = '';
  
  switch (tipo) {
    case 'crud':
      template = generateCRUDTemplate(nombre, entidad);
      break;
    case 'readonly':
      template = generateReadOnlyTemplate(nombre, entidad);
      break;
    case 'multiselect':
      template = generateMultiSelectTemplate(nombre, entidad);
      break;
    case 'custom':
      template = generateCustomTemplate(nombre, entidad);
      break;
    default:
      error(`Tipo de tabla no soportado: ${tipo}`);
  }
  
  // Escribir el archivo
  try {
    fs.writeFileSync(fileName, template, 'utf8');
    success(`Tabla generada exitosamente: ${fileName}`);
    
    // Mostrar información adicional
    log('', 'reset');
    info('📝 Próximos pasos:');
    info('1. Revisar y personalizar las columnas según tus necesidades');
    info('2. Implementar los hooks necesarios (use' + generateHookName(entidad) + ')');
    info('3. Crear los tipos de datos en la base de datos');
    info('4. Implementar las funciones de manejo (onCreate, onEdit, etc.)');
    info('5. Agregar la tabla al archivo de índice si es necesario');
    
    log('', 'reset');
    info('🔗 Recursos útiles:');
    info('- Guía de creación: toolbox/DATATABLE_CREATION_GUIDE.md');
    info('- Ejemplos de uso: app/admin/components/data-table/example-usage.tsx');
    info('- Documentación: DATATABLE_STANDARDIZATION.md');
    
  } catch (error) {
    error(`Error al escribir el archivo: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  generateCRUDTemplate,
  generateReadOnlyTemplate,
  generateMultiSelectTemplate,
  generateCustomTemplate
};
