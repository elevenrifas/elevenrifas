import React from 'react'
import { AlertTriangle, X, Info, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ErrorNotificationProps {
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  details?: string
  actions?: React.ReactNode
  onClose?: () => void
  autoClose?: boolean
  duration?: number
}

const notificationIcons = {
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle,
}

const notificationStyles = {
  error: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200',
  warning: 'border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200',
  info: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200',
  success: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200',
}

export function ErrorNotification({
  type = 'error',
  title,
  message,
  details,
  actions,
  onClose,
  autoClose = true,
  duration = 5000,
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = React.useState(true)
  const IconComponent = notificationIcons[type]

  React.useEffect(() => {
    if (autoClose && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        onClose?.()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [autoClose, duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    onClose?.()
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      'relative w-full rounded-lg border p-4 shadow-sm transition-all duration-300',
      notificationStyles[type]
    )}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <IconComponent className="h-5 w-5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-sm opacity-90">{message}</p>
          </div>
        </div>
        
        {onClose && (
          <button
            onClick={handleClose}
            className="rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Details */}
      {details && (
        <div className="mt-3 pl-8">
          <p className="text-sm opacity-80 font-mono bg-black/5 dark:bg-white/5 rounded px-2 py-1">
            {details}
          </p>
        </div>
      )}

      {/* Actions */}
      {actions && (
        <div className="mt-3 pl-8 flex gap-2">
          {actions}
        </div>
      )}
    </div>
  )
}

// Hook para manejar notificaciones
export function useErrorNotification() {
  const [notifications, setNotifications] = React.useState<ErrorNotificationProps[]>([])

  const addNotification = React.useCallback((notification: Omit<ErrorNotificationProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    setNotifications(prev => [...prev, { ...notification, id }])
  }, [])

  const removeNotification = React.useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearNotifications = React.useCallback(() => {
    setNotifications([])
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
  }
}

// Componente contenedor para múltiples notificaciones
export function ErrorNotificationContainer() {
  const { notifications, removeNotification } = useErrorNotification()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
      {notifications.map((notification) => (
        <ErrorNotification
          key={notification.id}
          {...notification}
          onClose={() => removeNotification(notification.id!)}
        />
      ))}
    </div>
  )
}
