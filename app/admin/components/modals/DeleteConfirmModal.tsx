"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Trash2 } from "lucide-react"
import { showDeleteSuccessToast, showErrorToast } from "@/components/ui/toast-notifications"

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<{ success: boolean; error?: string; details?: any }>
  title?: string
  description?: string
  entityName?: string
  isDeleting?: boolean
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar Eliminación",
  description,
  entityName = "elemento",
  isDeleting = false
}: DeleteConfirmModalProps) {
  const [isProcessing, setIsProcessing] = React.useState(false)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      
      const deleteResult = await onConfirm()
      
      if (deleteResult.success) {
        // Si es exitoso, mostrar toast de éxito y cerrar el modal
        showDeleteSuccessToast(entityName)
        setTimeout(() => {
          onClose()
        }, 500)
      } else {
        // Si hay error, mostrar toast de error y cerrar el modal
        showErrorToast(deleteResult.error || 'Error al eliminar el elemento')
        setTimeout(() => {
          onClose()
        }, 500)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado al eliminar el elemento'
      showErrorToast(errorMessage)
      setTimeout(() => {
        onClose()
      }, 500)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    onClose()
  }

  const defaultDescription = description || `¿Estás seguro de que quieres eliminar este ${entityName}? Esta acción no se puede deshacer.`

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        // Solo permitir cerrar si NO se está procesando
        if (!isProcessing && !isDeleting) {
          onClose()
        }
      }}
    >
      <DialogContent 
        className="sm:max-w-[500px]"
        // Prevenir cierre con ESC durante envío
        onEscapeKeyDown={(e) => {
          if (isProcessing || isDeleting) {
            e.preventDefault()
          }
        }}
        // Prevenir cierre con click fuera durante envío
        onPointerDownOutside={(e) => {
          if (isProcessing || isDeleting) {
            e.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {defaultDescription}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing || isDeleting}
          >
            Cancelar
          </Button>
          
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isProcessing || isDeleting}
            className={`gap-2 font-semibold transition-all duration-200 ${
              isProcessing || isDeleting 
                ? 'opacity-50 cursor-not-allowed' 
                : 'opacity-100 cursor-pointer hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl'
            }`}
          >
            {isProcessing || isDeleting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Eliminar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
