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

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<void>
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
      await onConfirm()
      onClose()
    } catch (error) {
      console.error("Error al eliminar:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const defaultDescription = description || `¿Estás seguro de que quieres eliminar este ${entityName}? Esta acción no se puede deshacer.`

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
            onClick={onClose}
            disabled={isProcessing || isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            variant="destructive" 
            onClick={handleConfirm}
            disabled={isProcessing || isDeleting}
            className="gap-2"
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
