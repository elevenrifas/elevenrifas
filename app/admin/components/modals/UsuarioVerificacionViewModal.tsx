"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Key, 
  Calendar, 
  Clock, 
  Shield, 
  ShieldOff, 
  CheckCircle, 
  UserCheck,
  Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { showSuccessToast, showErrorToast } from "@/components/ui/toast-notifications"
import type { AdminUsuarioVerificacion } from "@/lib/database/admin_database/usuarios_verificacion"

// =====================================================
// 🎯 MODAL VER USUARIO VERIFICACION - ELEVEN RIFAS
// =====================================================
// Modal para visualizar detalles completos de usuarios de verificación
// Solo lectura, sin capacidad de edición
// =====================================================

interface UsuarioVerificacionViewModalProps {
  isOpen: boolean
  onClose: () => void
  usuario?: AdminUsuarioVerificacion | null
}

export function UsuarioVerificacionViewModal({
  isOpen,
  onClose,
  usuario
}: UsuarioVerificacionViewModalProps) {
  if (!usuario) return null

  // Función para copiar ID al portapapeles
  const copyIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(usuario.id)
      showSuccessToast('ID copiado al portapapeles')
    } catch (error) {
      showErrorToast('Error al copiar el ID')
    }
  }

  // Calcular tiempo transcurrido desde el último acceso
  const getUltimoAccesoInfo = () => {
    if (!usuario.ultimo_acceso) {
      return {
        texto: 'Nunca ha accedido',
        color: 'text-gray-500',
        icon: Clock
      }
    }

    const fechaAcceso = new Date(usuario.ultimo_acceso)
    const ahora = new Date()
    const diffMs = ahora.getTime() - fechaAcceso.getTime()
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutos = Math.floor(diffMs / (1000 * 60))

    let texto = ''
    let color = ''

    if (diffDias > 30) {
      texto = `Hace más de 30 días`
      color = 'text-red-500'
    } else if (diffDias > 7) {
      texto = `Hace ${diffDias} días`
      color = 'text-orange-500'
    } else if (diffDias > 0) {
      texto = `Hace ${diffDias} día${diffDias > 1 ? 's' : ''}`
      color = 'text-yellow-600'
    } else if (diffHoras > 0) {
      texto = `Hace ${diffHoras} hora${diffHoras > 1 ? 's' : ''}`
      color = 'text-green-600'
    } else if (diffMinutos > 0) {
      texto = `Hace ${diffMinutos} minuto${diffMinutos > 1 ? 's' : ''}`
      color = 'text-green-500'
    } else {
      texto = 'Hace menos de un minuto'
      color = 'text-green-400'
    }

    return {
      texto,
      color,
      icon: UserCheck
    }
  }

  const fechaCreacion = new Date(usuario.fecha_creacion)
  const ultimoAccesoInfo = getUltimoAccesoInfo()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Detalles del Usuario de Verificación
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información Principal */}
          <div className="space-y-4">
            {/* Usuario */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Usuario:</span>
              </div>
              <div className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
                {usuario.usuario}
              </div>
            </div>

            {/* PIN (Oculto por seguridad) */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                <span className="font-medium">PIN:</span>
              </div>
              <div className="font-mono text-lg bg-gray-100 px-3 py-1 rounded">
                ••••
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {usuario.activo ? (
                  <Shield className="h-5 w-5 text-green-600" />
                ) : (
                  <ShieldOff className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Estado:</span>
              </div>
              <Badge variant={usuario.activo ? "default" : "secondary"} className="flex items-center gap-1">
                {usuario.activo ? (
                  <>
                    <CheckCircle className="h-3 w-3" />
                    Activo
                  </>
                ) : (
                  <>
                    <ShieldOff className="h-3 w-3" />
                    Inactivo
                  </>
                )}
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Información de Fechas */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información Temporal
            </h3>

            {/* Fecha de Creación */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-600" />
                <span className="font-medium">Creado:</span>
              </div>
              <div className="text-right">
                <div className="font-medium">
                  {fechaCreacion.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="text-sm text-muted-foreground">
                  {fechaCreacion.toLocaleTimeString('es-ES', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Último Acceso */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <ultimoAccesoInfo.icon className={`h-5 w-5 ${ultimoAccesoInfo.color}`} />
                <span className="font-medium">Último Acceso:</span>
              </div>
              <div className="text-right">
                {usuario.ultimo_acceso ? (
                  <>
                    <div className="font-medium">
                      {new Date(usuario.ultimo_acceso).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    <div className={`text-sm ${ultimoAccesoInfo.color}`}>
                      {ultimoAccesoInfo.texto}
                    </div>
                  </>
                ) : (
                  <div className="text-muted-foreground">
                    Nunca ha accedido
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Técnica */}
          <div className="space-y-4">
            <h3 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
              Información Técnica
            </h3>

            {/* ID del Usuario */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">ID:</span>
              <div className="flex items-center gap-2">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                  {usuario.id}
                </code>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyIdToClipboard}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Resumen de Seguridad */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900 text-sm">Resumen de Seguridad</span>
              </div>
              <div className="space-y-1 text-xs text-blue-800">
                <div>• PIN: Configurado y protegido</div>
                <div>• Estado: {usuario.activo ? 'Acceso permitido' : 'Acceso denegado'}</div>
                <div>• Último uso: {usuario.ultimo_acceso ? 'Registrado' : 'Sin registros'}</div>
              </div>
            </div>
          </div>

          {/* Botón de Cerrar */}
          <div className="flex justify-end">
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
