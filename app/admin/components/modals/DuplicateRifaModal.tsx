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
import { Copy } from "lucide-react"
import type { AdminRifa } from "@/lib/database/admin_database/rifas"

interface DuplicateRifaModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => Promise<{ success: boolean; error?: string }>
  rifa: AdminRifa | null
  isSubmitting?: boolean
}

export function DuplicateRifaModal({
  isOpen,
  onClose,
  onConfirm,
  rifa,
  isSubmitting = false
}: DuplicateRifaModalProps) {
  const handleConfirm = async () => {
    try {
      const result = await onConfirm()
      if (result.success) {
        onClose()
      }
    } catch (error) {
      console.error("Error al duplicar:", error)
    }
  }

  if (!rifa) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Duplicar Rifa
          </DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres duplicar la rifa "{rifa.titulo}"?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Se creará una copia exacta de esta rifa con:
          </p>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            <li>• Mismo título (con sufijo "Copia")</li>
            <li>• Misma descripción e imagen</li>
            <li>• Mismo precio y configuración de tickets</li>
            <li>• Estado "Cerrada" por defecto</li>
            <li>• Nuevo ID único</li>
          </ul>
        </div>

        <DialogFooter className="gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                Duplicando...
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar Rifa
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

