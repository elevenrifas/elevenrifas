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
import { Tag, Calendar, Eye, Edit, Trash2 } from "lucide-react"
import * as LucideIcons from "lucide-react"
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
              <Badge className="px-3 py-1 text-base">
                {categoria.nombre}
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
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Descripción
                </h4>
                <p className="text-sm">
                  {categoria.descripcion || 'Sin descripción'}
                </p>
              </div>

            </div>

            {/* Columna derecha */}
            <div className="space-y-4">
              {/* Icono */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Icono
                </h4>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                    {(() => {
                      const iconName = categoria.icono || 'tag'
                      const pascalCaseName = iconName
                        .split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                        .join('')
                      const IconComponent = (LucideIcons as any)[pascalCaseName] || Tag
                      return <IconComponent className="h-4 w-4 text-gray-600" />
                    })()}
                  </div>
                  <span className="text-sm font-mono">
                    {categoria.icono || 'tag'}
                  </span>
                </div>
              </div>



              {/* Fecha de creación - No disponible en esquema actual */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Fecha de Creación
                </h4>
                <p className="text-sm text-muted-foreground">
                  No disponible
                </p>
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
