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
import { AlertTriangle, Trash2, AlertCircle, CheckCircle, Info } from "lucide-react"
import { Badge } from "@/components/ui/badge"

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
  const [result, setResult] = React.useState<{ success: boolean; error?: string; details?: any } | null>(null)

  const handleConfirm = async () => {
    try {
      setIsProcessing(true)
      setResult(null)
      
      const deleteResult = await onConfirm()
      setResult(deleteResult)
      
      if (deleteResult.success) {
        // Si es exitoso, cerrar el modal después de un breve delay
        setTimeout(() => {
          onClose()
          setResult(null)
        }, 1500)
      }
    } catch (error) {
      console.error("Error al eliminar:", error)
      setResult({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error inesperado al eliminar' 
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setResult(null)
    onClose()
  }

  const defaultDescription = description || `¿Estás seguro de que quieres eliminar este ${entityName}? Esta acción no se puede deshacer.`

  // Función para renderizar el mensaje de error con detalles
  const renderErrorMessage = (error: string, details?: any) => {
    return (
      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
        
        {details && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Info className="h-3 w-3" />
              Detalles del problema:
            </div>
            
            {/* Mostrar información específica según el tipo de error */}
            {details.ticketsCount && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {details.ticketsCount} ticket(s)
                </Badge>
                <span className="text-xs text-muted-foreground">
                  asociado(s) a esta rifa
                </span>
              </div>
            )}
            
            {details.ticketsConPagosCount && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {details.ticketsConPagosCount} ticket(s)
                </Badge>
                <span className="text-xs text-muted-foreground">
                  con pago(s) asociado(s)
                </span>
              </div>
            )}
            
            {details.estado && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  Estado: {details.estado}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {details.estado === 'activa' ? 'Debe cerrarse antes de eliminar' : ''}
                </span>
              </div>
            )}
            
            {details.sampleTickets && details.sampleTickets.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <div className="font-medium mb-1">Ejemplos de tickets:</div>
                <div className="space-y-1">
                  {details.sampleTickets.map((ticket: any, index: number) => (
                    <div key={index} className="pl-2 border-l-2 border-muted">
                      • Ticket #{ticket.numero || ticket.id} - {ticket.nombre || 'Sin nombre'}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Función para renderizar el mensaje de éxito
  const renderSuccessMessage = (details?: any) => {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="font-medium">
          {details?.message || `${entityName} eliminado exitosamente`}
        </span>
      </div>
    )
  }

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
            {!result && defaultDescription}
          </DialogDescription>
          
          {/* Contenido dinámico fuera del DialogDescription para evitar errores de hidratación */}
          {result && (
            <div className="mt-2">
              {result.success ? renderSuccessMessage(result.details) : renderErrorMessage(result.error!, result.details)}
            </div>
          )}
        </DialogHeader>

        <DialogFooter className="gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isProcessing || isDeleting}
          >
            {result?.success ? 'Cerrar' : 'Cancelar'}
          </Button>
          
          {!result?.success && (
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
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
