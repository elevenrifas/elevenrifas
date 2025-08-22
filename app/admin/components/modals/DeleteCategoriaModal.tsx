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
import { AlertTriangle, Trash2, Tag } from "lucide-react"
import type { AdminCategoria } from "@/lib/database/admin_database/categorias"

// =====================================================
// 🎯 MODAL CONFIRMACIÓN ELIMINAR CATEGORIA - ELEVEN RIFAS
// =====================================================
// Modal para confirmar la eliminación de categorías
// Sigue el patrón establecido para modales admin
// =====================================================

interface DeleteCategoriaModalProps {
  isOpen: boolean
  onClose: () => void
  categoria: AdminCategoria | null
  onConfirm: (categoria: AdminCategoria) => Promise<void>
  isLoading?: boolean
}

export function DeleteCategoriaModal({
  isOpen,
  onClose,
  categoria,
  onConfirm,
  isLoading = false
}: DeleteCategoriaModalProps) {
  if (!categoria) return null

  // =====================================================
  // 🔧 FUNCIONES DEL MODAL
  // =====================================================

  const handleConfirm = async () => {
    try {
      await onConfirm(categoria)
      onClose()
    } catch (error) {
      // El error se maneja en el componente padre
      console.error('Error al eliminar categoría:', error)
    }
  }

  // =====================================================
  // 🎨 RENDERIZADO
  // =====================================================

  const hasRifas = categoria.rifas_count && categoria.rifas_count > 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirmar Eliminación
          </DialogTitle>
          <DialogDescription>
            Esta acción no se puede deshacer. ¿Estás seguro de que quieres eliminar esta categoría?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información de la categoría a eliminar */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Badge 
                style={{ backgroundColor: categoria.color || '#3B82F6' }}
                className="text-white border-0"
              >
                <Tag className="h-4 w-4 mr-2" />
                {categoria.nombre}
              </Badge>
              <Badge variant={categoria.activa ? "default" : "secondary"}>
                {categoria.activa ? "Activa" : "Inactiva"}
              </Badge>
            </div>
            
            {categoria.descripcion && (
              <p className="text-sm text-muted-foreground mt-2">
                {categoria.descripcion}
              </p>
            )}
          </div>

          {/* Advertencias */}
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-amber-800">
                  ⚠️ Acción irreversible
                </p>
                <p className="text-sm text-amber-700">
                  Una vez eliminada, esta categoría no se podrá recuperar.
                </p>
              </div>
            </div>

            {hasRifas && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Tag className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-800">
                    📊 Rifas asociadas
                  </p>
                  <p className="text-sm text-blue-700">
                    Esta categoría tiene {categoria.rifas_count} rifa{categoria.rifas_count !== 1 ? 's' : ''} asociada{categoria.rifas_count !== 1 ? 's' : ''}. 
                    Las rifas no se eliminarán, pero perderán su categorización.
                  </p>
                </div>
              </div>
            )}

            {categoria.activa && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <Tag className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-orange-800">
                    🌐 Categoría activa
                  </p>
                  <p className="text-sm text-orange-700">
                    Esta categoría está visible en el frontend. Su eliminación afectará la experiencia del usuario.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de impacto */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Resumen del impacto:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• La categoría será eliminada permanentemente</li>
              <li>• Las rifas asociadas quedarán sin categoría</li>
              {categoria.activa && (
                <li>• Los usuarios ya no podrán filtrar por esta categoría</li>
              )}
              <li>• No se puede deshacer esta acción</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Categoría
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
