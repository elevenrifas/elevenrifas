"use client"

import * as React from "react"
import { ColumnDef } from "@tanstack/react-table"
import { createCRUDTable } from "./DataTableEnhanced"

// =====================================================
// 🎯 EJEMPLO DE TABLA MÍNIMA - ELEVEN RIFAS
// =====================================================
// Esta tabla demuestra lo mínimo que necesitas para crear
// una tabla completa con todas las funcionalidades
// =====================================================

// Tipo de datos
interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
}

// Props mínimas
interface UsuariosTableProps {
  onCreate?: () => void
  onEdit?: (usuario: Usuario) => void
  onDelete?: (usuario: Usuario) => void
}

// Componente principal - ¡SÚPER SIMPLE!
export function UsuariosTable({ onCreate, onEdit, onDelete }: UsuariosTableProps) {
  // Solo lo esencial: datos y funciones
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([
    { id: "1", nombre: "Juan Pérez", email: "juan@example.com", rol: "Admin" },
    { id: "2", nombre: "María García", email: "maria@example.com", rol: "Usuario" }
  ])

  // Funciones mínimas requeridas
  const handleRefresh = () => {
    console.log("🔄 Refrescando usuarios...")
  }

  const handleExport = () => {
    console.log("📤 Exportando usuarios...")
  }

  // Columnas de la tabla
  const columns: ColumnDef<Usuario>[] = [
    {
      accessorKey: "nombre",
      header: "Nombre",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "rol",
      header: "Rol",
    },
  ]

  // ¡SOLO ESTO NECESITAS! Todo lo demás viene automáticamente
  return createCRUDTable({
    columns,
    data: usuarios,
    title: "Usuarios",
    description: "Gestiona los usuarios del sistema",
    searchKey: "nombre",
    searchPlaceholder: "Buscar usuarios...",
    onRefresh: handleRefresh,
    onExport: handleExport,
    onCreate: onCreate || (() => {})
  })
}

// =====================================================
// 🎯 COMPARACIÓN: ANTES vs DESPUÉS
// =====================================================

// ANTES (cada tabla definía todo):
/*
{createCRUDTable({
  columns: columns,
  data: data,
  title: "Mi Tabla",
  description: "Descripción",
  searchKey: "nombre",
  searchPlaceholder: "Buscar...",
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
  loading: loading,
  error: error,
  onRowSelectionChange: handleSelection,
  onRefresh: handleRefresh,
  onExport: handleExport,
  onCreate: handleCreate
})}
*/

// DESPUÉS (solo lo esencial):
/*
{createCRUDTable({
  columns,
  data,
  title: "Mi Tabla",
  description: "Descripción",
  searchKey: "nombre",
  searchPlaceholder: "Buscar...",
  loading,
  error,
  onRefresh: handleRefresh,
  onExport: handleExport,
  onCreate: handleCreate
})}
*/

// =====================================================
// 🎯 LO QUE SE GENERA AUTOMÁTICAMENTE
// =====================================================
// ✅ Botón Crear (si hay onCreate)
// ✅ Botón Refrescar (si hay onRefresh)  
// ✅ Botón Exportar (si hay onExport)
// ✅ Paginación (por defecto)
// ✅ Toolbar con búsqueda (por defecto)
// ✅ Toggle de columnas (por defecto)
// ✅ Ordenamiento (por defecto)
// ✅ Filtros (por defecto)
// ✅ Estados de loading y error
// ✅ Selección de filas (si se necesita)
// ✅ Header con título y descripción
// ✅ Acciones en el header
// =====================================================

