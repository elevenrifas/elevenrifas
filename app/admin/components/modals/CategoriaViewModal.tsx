"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tag, Palette, Image, Calendar, Eye, Edit, Trash2 } from "lucide-react"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"

// =====================================================
// 🎯 MODAL VISTA CATEGORIA - ELEVEN RIFAS
// =====================================================
// Modal para ver detalles de una categoría
// Sigue el patrón establecido para modales admin
// =====================================================

// Extender el tipo para incluir campos adicionales que pueden venir de la base de datos
interface CategoriaWithStats extends AdminCategoria {
  rifas_count?: number
}

interface CategoriaViewModalProps {
  isOpen: boolean
  onClose: () => void
  categoria: CategoriaWithStats | null
  onEdit?: (categoria: CategoriaWithStats) => void
  onDelete?: (categoria: CategoriaWithStats) => void
}

export function CategoriaViewModal({
  isOpen,
  onClose,
  categoria,
  onEdit,
  onDelete
}: CategoriaViewModalProps) {
  if (!categoria) return null

  // =====================================================
  // 🔧 FUNCIONES DEL MODAL
  // =====================================================

  const handleEdit = () => {
    if (onEdit) {
      onEdit(categoria)
      onClose()
    }
  }

  const handleDelete = () => {
    if (onDelete) {
      onDelete(categoria)
      onClose()
    }
  }

  // =====================================================
  // 🎨 RENDERIZADO
  // =====================================================

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Fecha no válida'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Detalles de la Categoría
          </DialogTitle>
          <DialogDescription>
            Información completa de la categoría seleccionada
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header con badge de estado */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge 
                style={{ backgroundColor: categoria.color || '#3B82F6' }}
                className="text-white border-0 px-3 py-1 text-base"
              >
                {categoria.nombre}
              </Badge>
              <Badge variant={categoria.activa ? "default" : "secondary"}>
                {categoria.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            
            {/* Acciones rápidas */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  className="h-8 px-3"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              )}
            </div>
          </div>

          <Separator />

          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Columna izquierda */}
            <div className="space-y-4">
              {/* Nombre */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Nombre
                </h4>
                <p className="text-base font-medium">{categoria.nombre}</p>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Descripción
                </h4>
                <p className="text-sm text-muted-foreground">
                  {categoria.descripcion || 'Sin descripción'}
                </p>
              </div>

              {/* Color */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Color
                </h4>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: categoria.color || '#3B82F6' }}
                  />
                  <span className="text-sm font-mono">{categoria.color || '#3B82F6'}</span>
                </div>
              </div>
            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Icono */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  Icono
                </h4>
                <p className="text-sm font-mono">
                  {categoria.icono || 'tag'}
                </p>
              </div>

              {/* Orden */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Orden de Visualización
                </h4>
                <Badge variant="outline" className="text-sm">
                  {categoria.orden || 0}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Posición en la lista de categorías
                </p>
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Estado
                </h4>
                <Badge variant={categoria.activa ? "default" : "secondary"}>
                  {categoria.activa ? "Activa" : "Inactiva"}
                </Badge>
                <p className="text-xs text-muted-foreground">
                  {categoria.activa 
                    ? 'Esta categoría se muestra en el frontend'
                    : 'Esta categoría está oculta del frontend'
                  }
                </p>
              </div>

              {/* Fecha de creación */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Creación
                </h4>
                <p className="text-sm">
                  {formatDate(categoria.fecha_creacion)}
                </p>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          {categoria.rifas_count !== undefined && (
            <>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Estadísticas
                </h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                      {categoria.rifas_count} rifa{categoria.rifas_count !== 1 ? 's' : ''}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      en esta categoría
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Vista previa */}
          <Separator />
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              Vista Previa
            </h4>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                <Badge 
                  style={{ backgroundColor: categoria.color || '#3B82F6' }}
                  className="text-white border-0"
                >
                  {categoria.nombre}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Como se verá en el frontend
                </span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
