"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  Download, 
  RefreshCw, 
  Trash2,
  Eye,
  Edit,
  Copy
} from "lucide-react"

// =====================================================
// 🎯 DATA TABLE HEADER - ELEVEN RIFAS
// =====================================================
// Header estandarizado para todas las tablas admin
// Incluye botones de acción comunes y configurables
// =====================================================

export interface DataTableHeaderAction {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  disabled?: boolean
  onClick: () => void
  showWhen?: {
    hasSelection?: boolean
    minSelection?: number
    maxSelection?: number
  }
}

export interface DataTableHeaderProps {
  title: string
  description?: string
  actions?: DataTableHeaderAction[]
  selectedCount?: number
  showSelectionInfo?: boolean
  className?: string
}

export function DataTableHeader({
  title,
  description,
  actions = [],
  selectedCount = 0,
  showSelectionInfo = true,
  className = ""
}: DataTableHeaderProps) {
  // Filtrar acciones según las condiciones de visualización
  const visibleActions = actions.filter(action => {
    if (!action.showWhen) return true
    
    const { hasSelection, minSelection, maxSelection } = action.showWhen
    
    if (hasSelection !== undefined) {
      if (hasSelection && selectedCount === 0) return false
      if (!hasSelection && selectedCount > 0) return false
    }
    
    if (minSelection !== undefined && selectedCount < minSelection) return false
    if (maxSelection !== undefined && selectedCount > maxSelection) return false
    
    return true
  })

  return (
    <div className={`flex items-center justify-between ${className}`}>
      {/* Información del título y descripción */}
      <div className="flex-1">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
        
        {/* Información de selección */}
        {showSelectionInfo && selectedCount > 0 && (
          <div className="mt-2">
            <span className="text-sm text-muted-foreground">
              {selectedCount} elemento{selectedCount !== 1 ? 's' : ''} seleccionado{selectedCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      {visibleActions.length > 0 && (
        <div className="flex items-center space-x-2">
          {visibleActions.map((action) => (
            <Button
              key={action.key}
              variant={action.variant || "outline"}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-8 w-8 p-0 border-2 border-gray-400 hover:border-gray-600 hover:bg-gray-50 transition-all duration-200"
              title={action.label}
            >
              <action.icon className="h-4 w-4" />
              <span className="sr-only">{action.label}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

// =====================================================
// 🎯 ACCIONES PREDEFINIDAS - ELEVEN RIFAS
// =====================================================
// Funciones helper para crear acciones comunes
// =====================================================

export function createAction(
  key: string,
  label: string,
  icon: React.ComponentType<{ className?: string }>,
  onClick: () => void,
  options: Partial<DataTableHeaderAction> = {}
): DataTableHeaderAction {
  return {
    key,
    label,
    icon,
    onClick,
    ...options
  }
}

// Acciones comunes predefinidas
export const commonActions = {
  create: (onClick: () => void, label = "Crear") => 
    createAction("create", label, Plus, onClick, { variant: "default" }),
  
  export: (onClick: () => void, label = "Exportar") => 
    createAction("export", label, Download, onClick, { variant: "outline" }),
  
  refresh: (onClick: () => void, label = "Refrescar") => 
    createAction("refresh", label, RefreshCw, onClick, { variant: "outline" }),
  
  delete: (onClick: () => void, label = "Eliminar") => 
    createAction("delete", label, Trash2, onClick, { variant: "destructive" }),
  
  view: (onClick: () => void, label = "Ver") => 
    createAction("view", label, Eye, onClick, { variant: "outline" }),
  
  edit: (onClick: () => void, label = "Editar") => 
    createAction("edit", label, Edit, onClick, { variant: "outline" }),
  
  duplicate: (onClick: () => void, label = "Duplicar") => 
    createAction("duplicate", label, Copy, onClick, { variant: "outline" })
}

// Configuraciones de acciones para diferentes tipos de tabla
export const actionConfigs = {
  // Tabla con CRUD completo
  fullCRUD: (handlers: {
    onCreate: () => void
    onExport: () => void
    onRefresh: () => void
    onDelete?: () => void
  }) => [
    // commonActions.create(handlers.onCreate), // Ahora está en el toolbar
    commonActions.refresh(handlers.onRefresh),
    commonActions.export(handlers.onExport, "Exportar"),
    ...(handlers.onDelete ? [commonActions.delete(handlers.onDelete, "Eliminar")] : [])
  ],

  // Tabla de solo lectura
  readOnly: (handlers: {
    onExport: () => void
    onRefresh: () => void
  }) => [
    commonActions.refresh(handlers.onRefresh),
    commonActions.export(handlers.onExport, "Exportar")
  ],

  // Tabla con selección múltiple
  multiSelect: (handlers: {
    onCreate: () => void
    onExport: () => void
    onRefresh: () => void
    onDelete: () => void
  }) => [
    // commonActions.create(handlers.onCreate), // Ahora está en el toolbar
    commonActions.refresh(handlers.onRefresh),
    commonActions.export(handlers.onExport, "Exportar"),
    commonActions.delete(handlers.onDelete, "Eliminar")
  ]
}





