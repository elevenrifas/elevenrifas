# 🎯 EJEMPLOS PRÁCTICOS - SISTEMA DE LOGGING PROFESIONAL

## 📋 Resumen

Esta guía contiene ejemplos prácticos y casos de uso del nuevo sistema de logging profesional implementado en ElevenRifas.

## 🚀 **EJEMPLOS BÁSICOS**

### **1. Componente Simple con Logging**

```tsx
import { useLogger } from '@/hooks/use-logger'

export default function UserProfile() {
  const logger = useLogger({
    context: 'USER',
    componentName: 'UserProfile',
    enableDebug: true
  })

  useEffect(() => {
    logger.logInfo('Perfil de usuario cargado')
  }, [])

  const handleUpdateProfile = async (data) => {
    try {
      logger.logUserAction('Usuario actualizando perfil')
      await updateProfile(data)
      logger.logInfo('Perfil actualizado exitosamente', { userId: data.id })
    } catch (error) {
      logger.logError('Error al actualizar perfil', error, { userId: data.id })
    }
  }

  return (
    <div>
      {/* UI del componente */}
    </div>
  )
}
```

### **2. Hook Personalizado con Logging**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function useDataFetcher(endpoint) {
  const logger = useLogger({
    context: 'API',
    componentName: 'useDataFetcher',
    logPerformance: true
  })

  const fetchData = async () => {
    const startTime = performance.now()
    
    try {
      logger.logInfo('Iniciando fetch de datos', { endpoint })
      
      const response = await fetch(endpoint)
      const data = await response.json()
      
      const duration = performance.now() - startTime
      logger.logInfo('Datos obtenidos exitosamente', { 
        endpoint, 
        count: data.length,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logger.logError('Error al obtener datos', error, { 
        endpoint, 
        duration: `${duration.toFixed(2)}ms`
      })
      throw error
    }
  }

  return { fetchData }
}
```

## 🎯 **EJEMPLOS ESPECÍFICOS PARA TABLAS**

### **1. Tabla CRUD con Logging Completo**

```tsx
import { useTableLogger } from '@/hooks/use-logger'

export function RifasTable() {
  const logger = useTableLogger('RifasTable', {
    enableDebug: true,
    logPerformance: true,
    logUserActions: true
  })

  // Log de acciones de tabla
  const handleSort = (column, direction) => {
    logger.logTableAction('Usuario ordenó tabla', { 
      column, 
      direction,
      currentData: data.length 
    })
  }

  const handleFilter = (filterType, value) => {
    logger.logTableAction('Usuario aplicó filtro', { 
      filterType, 
      value,
      resultsBefore: data.length 
    })
  }

  const handleRowSelection = (selectedRows) => {
    logger.logTableAction('Usuario seleccionó filas', { 
      count: selectedRows.length,
      selectedIds: selectedRows.map(r => r.id)
    })
  }

  // Log de operaciones CRUD
  const handleCreate = async (rifaData) => {
    try {
      logger.logInfo('Iniciando creación de rifa')
      const result = await createRifa(rifaData)
      logger.logInfo('Rifa creada exitosamente', { 
        rifaId: result.id,
        titulo: result.titulo 
      })
    } catch (error) {
      logger.logError('Error al crear rifa', error, { rifaData })
    }
  }

  const handleUpdate = async (rifaId, updates) => {
    try {
      logger.logInfo('Iniciando actualización de rifa', { rifaId, updates })
      const result = await updateRifa(rifaId, updates)
      logger.logInfo('Rifa actualizada exitosamente', { 
        rifaId, 
        changes: updates 
      })
    } catch (error) {
      logger.logError('Error al actualizar rifa', error, { rifaId, updates })
    }
  }

  const handleDelete = async (rifaIds) => {
    try {
      logger.logWarning('Iniciando eliminación de rifas', { 
        count: rifaIds.length,
        rifaIds 
      })
      await deleteRifas(rifaIds)
      logger.logInfo('Rifas eliminadas exitosamente', { 
        count: rifaIds.length,
        rifaIds 
      })
    } catch (error) {
      logger.logError('Error al eliminar rifas', error, { rifaIds })
    }
  }

  return (
    <DataTableEnhanced
      columns={columns}
      data={data}
      onSort={handleSort}
      onFilter={handleFilter}
      onRowSelectionChange={handleRowSelection}
      onCreate={handleCreate}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
    />
  )
}
```

### **2. Tabla con Logging de Performance**

```tsx
import { useTableLogger } from '@/hooks/use-logger'

export function PerformanceTable() {
  const logger = useTableLogger('PerformanceTable', {
    logPerformance: true,
    enableDebug: true
  })

  const handleBulkOperation = async (operation, items) => {
    const startTime = performance.now()
    
    try {
      logger.logInfo('Iniciando operación en lote', { 
        operation, 
        itemCount: items.length 
      })
      
      const results = await performBulkOperation(operation, items)
      
      const duration = performance.now() - startTime
      logger.logTablePerformance(operation, duration)
      
      logger.logInfo('Operación en lote completada', { 
        operation,
        successCount: results.success.length,
        errorCount: results.errors.length,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return results
    } catch (error) {
      const duration = performance.now() - startTime
      logger.logError('Error en operación en lote', error, { 
        operation, 
        itemCount: items.length,
        duration: `${duration.toFixed(2)}ms`
      })
      throw error
    }
  }

  return (
    <DataTableEnhanced
      // ... props
      onBulkOperation={handleBulkOperation}
    />
  )
}
```

## 🔐 **EJEMPLOS DE AUTENTICACIÓN**

### **1. Hook de Autenticación con Logging**

```tsx
import { useAuthLogger } from '@/hooks/use-logger'

export function useAdminAuth() {
  const logger = useAuthLogger({
    enableDebug: true,
    logUserActions: true
  })

  const checkSession = async () => {
    try {
      logger.logInfo('Verificando sesión de usuario')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        logger.logError('Error obteniendo sesión', error)
        return null
      }
      
      if (!session?.user) {
        logger.logInfo('No hay sesión activa')
        return null
      }
      
      logger.logInfo('Sesión verificada exitosamente', { 
        userId: session.user.id,
        email: session.user.email 
      })
      
      return session.user
    } catch (error) {
      logger.logError('Error inesperado verificando sesión', error)
      return null
    }
  }

  const login = async (credentials) => {
    try {
      logger.logInfo('Iniciando proceso de login', { email: credentials.email })
      
      const { data, error } = await supabase.auth.signInWithPassword(credentials)
      
      if (error) {
        logger.logError('Error en login', error, { email: credentials.email })
        throw error
      }
      
      logger.logLoginAttempt(credentials.email, true)
      logger.logInfo('Login exitoso', { userId: data.user.id })
      
      return data
    } catch (error) {
      logger.logLoginAttempt(credentials.email, false, error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      const userId = user?.id
      logger.logInfo('Iniciando logout', { userId })
      
      await supabase.auth.signOut()
      
      logger.logLogout(userId)
      logger.logInfo('Logout completado exitosamente', { userId })
    } catch (error) {
      logger.logError('Error en logout', error, { userId: user?.id })
      throw error
    }
  }

  const checkPermission = (resource, action) => {
    const hasPermission = user?.permissions?.[resource]?.includes(action)
    
    logger.logPermissionCheck(resource, action, hasPermission)
    
    return hasPermission
  }

  return {
    user,
    login,
    logout,
    checkPermission,
    checkSession
  }
}
```

### **2. Componente de Login con Logging**

```tsx
import { useAuthLogger } from '@/hooks/use-logger'

export function LoginForm() {
  const logger = useAuthLogger({
    enableDebug: true
  })

  const handleSubmit = async (credentials) => {
    try {
      logger.logInfo('Usuario intentando login', { email: credentials.email })
      
      const result = await login(credentials)
      
      logger.logInfo('Login exitoso, redirigiendo', { 
        userId: result.user.id,
        email: result.user.email 
      })
      
      router.push('/admin/dashboard')
    } catch (error) {
      logger.logError('Login fallido', error, { 
        email: credentials.email,
        errorType: error.name 
      })
      
      setError('Credenciales inválidas')
    }
  }

  const handleValidation = (field, isValid, message) => {
    logger.logFormValidation(field, isValid, message)
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## 📊 **EJEMPLOS DE MONITOREO**

### **1. Monitoreo de Performance**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function PerformanceMonitor() {
  const logger = useLogger({
    context: 'PERFORMANCE',
    componentName: 'PerformanceMonitor',
    logPerformance: true
  })

  const measureOperation = (operationName, operation) => {
    const startTime = performance.now()
    
    try {
      const result = operation()
      const duration = performance.now() - startTime
      
      logger.logPerformance(`Operación ${operationName} completada`, { 
        duration: `${duration.toFixed(2)}ms`,
        operationName 
      })
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      logger.logError(`Error en operación ${operationName}`, error, { 
        duration: `${duration.toFixed(2)}ms`,
        operationName 
      })
      throw error
    }
  }

  const monitorApiCall = async (endpoint, options = {}) => {
    const startTime = performance.now()
    
    try {
      logger.logInfo('Iniciando llamada API', { endpoint, options })
      
      const response = await fetch(endpoint, options)
      const data = await response.json()
      
      const duration = performance.now() - startTime
      logger.logPerformance('Llamada API completada', { 
        endpoint,
        status: response.status,
        duration: `${duration.toFixed(2)}ms`
      })
      
      return data
    } catch (error) {
      const duration = performance.now() - startTime
      logger.logError('Error en llamada API', error, { 
        endpoint,
        duration: `${duration.toFixed(2)}ms`
      })
      throw error
    }
  }

  return { measureOperation, monitorApiCall }
}
```

### **2. Monitoreo de Errores**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function ErrorBoundary({ children }) {
  const logger = useLogger({
    context: 'ERROR_BOUNDARY',
    componentName: 'ErrorBoundary'
  })

  useEffect(() => {
    const handleError = (error, errorInfo) => {
      logger.logError('Error capturado por boundary', error, {
        errorInfo,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      })
    }

    const handleUnhandledRejection = (event) => {
      logger.logError('Promesa rechazada no manejada', event.reason, {
        type: 'unhandledRejection',
        timestamp: new Date().toISOString()
      })
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [logger])

  return children
}
```

## 🔧 **EJEMPLOS DE UTILIDADES**

### **1. Función de Validación con Logging**

```tsx
import { log } from '@/toolbox/utils/logger'

export function validateRifaData(data) {
  log.info('VALIDATION', 'Iniciando validación de datos de rifa', { data })
  
  const errors = []
  
  // Validar título
  if (!data.titulo || data.titulo.trim().length < 3) {
    errors.push('Título debe tener al menos 3 caracteres')
    log.warn('VALIDATION', 'Título inválido', { 
      titulo: data.titulo,
      length: data.titulo?.length 
    })
  }
  
  // Validar precio
  if (!data.precio_ticket || data.precio_ticket <= 0) {
    errors.push('Precio debe ser mayor a 0')
    log.warn('VALIDATION', 'Precio inválido', { precio: data.precio_ticket })
  }
  
  // Validar fecha de cierre
  if (data.fecha_cierre) {
    const cierreDate = new Date(data.fecha_cierre)
    const now = new Date()
    
    if (cierreDate <= now) {
      errors.push('Fecha de cierre debe ser futura')
      log.warn('VALIDATION', 'Fecha de cierre inválida', { 
        fecha_cierre: data.fecha_cierre,
        now: now.toISOString()
      })
    }
  }
  
  if (errors.length > 0) {
    log.warn('VALIDATION', 'Validación fallida', { 
      errors,
      data 
    })
  } else {
    log.info('VALIDATION', 'Validación exitosa', { data })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
```

### **2. Función de Transformación con Logging**

```tsx
import { log } from '@/toolbox/utils/logger'

export function transformRifaData(rawData) {
  log.info('TRANSFORM', 'Iniciando transformación de datos de rifa', { 
    rawDataCount: rawData?.length 
  })
  
  try {
    const transformed = rawData.map(item => {
      // Transformar fechas
      const transformedItem = {
        ...item,
        fecha_creacion: item.fecha_creacion ? new Date(item.fecha_creacion) : null,
        fecha_cierre: item.fecha_cierre ? new Date(item.fecha_cierre) : null,
        precio_ticket: parseFloat(item.precio_ticket) || 0,
        total_tickets: parseInt(item.total_tickets) || 0,
        tickets_disponibles: parseInt(item.tickets_disponibles) || 0
      }
      
      log.debug('TRANSFORM', 'Item transformado', { 
        original: item,
        transformed: transformedItem 
      })
      
      return transformedItem
    })
    
    log.info('TRANSFORM', 'Transformación completada exitosamente', { 
      originalCount: rawData?.length,
      transformedCount: transformed.length
    })
    
    return transformed
  } catch (error) {
    log.error('TRANSFORM', 'Error en transformación', error, { rawData })
    throw error
  }
}
```

## 📱 **EJEMPLOS DE COMPONENTES UI**

### **1. Modal con Logging**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function RifaFormModal({ isOpen, onClose, rifaData }) {
  const logger = useLogger({
    context: 'MODAL',
    componentName: 'RifaFormModal',
    logUserActions: true
  })

  useEffect(() => {
    if (isOpen) {
      logger.logInfo('Modal de rifa abierto', { 
        hasData: !!rifaData,
        rifaId: rifaData?.id 
      })
    }
  }, [isOpen, rifaData])

  const handleClose = () => {
    logger.logUserAction('Usuario cerró modal de rifa')
    onClose()
  }

  const handleSubmit = async (formData) => {
    try {
      logger.logInfo('Usuario enviando formulario de rifa', { 
        isEdit: !!rifaData,
        rifaId: rifaData?.id 
      })
      
      if (rifaData) {
        await updateRifa(rifaData.id, formData)
        logger.logInfo('Rifa actualizada exitosamente', { 
          rifaId: rifaData.id,
          changes: formData 
        })
      } else {
        const result = await createRifa(formData)
        logger.logInfo('Rifa creada exitosamente', { 
          newRifaId: result.id,
          data: formData 
        })
      }
      
      onClose()
    } catch (error) {
      logger.logError('Error al guardar rifa', error, { 
        formData,
        isEdit: !!rifaData 
      })
    }
  }

  return (
    <Modal open={isOpen} onClose={handleClose}>
      {/* Contenido del modal */}
    </Modal>
  )
}
```

### **2. Formulario con Logging de Validación**

```tsx
import { useFormLogger } from '@/hooks/use-logger'

export function RifaForm({ onSubmit, initialData }) {
  const logger = useFormLogger('RifaForm', {
    enableDebug: true
  })

  const handleFieldChange = (field, value) => {
    logger.logDebug('Campo cambiado', { field, value })
  }

  const handleFieldBlur = (field, value) => {
    logger.logDebug('Campo perdió foco', { field, value })
  }

  const handleValidation = (field, isValid, message) => {
    logger.logFormValidation(field, isValid, message)
  }

  const handleSubmit = async (formData) => {
    try {
      logger.logFormAction('Usuario enviando formulario', { 
        hasInitialData: !!initialData,
        fieldCount: Object.keys(formData).length 
      })
      
      const result = await onSubmit(formData)
      
      logger.logFormSubmission(true, formData)
      logger.logInfo('Formulario enviado exitosamente', { result })
      
      return result
    } catch (error) {
      logger.logFormSubmission(false, formData, error.message)
      throw error
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
    </form>
  )
}
```

## 🎯 **CONFIGURACIONES AVANZADAS**

### **1. Configuración Personalizada por Componente**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function AdvancedComponent() {
  const logger = useLogger({
    context: 'ADVANCED',
    componentName: 'AdvancedComponent',
    enableDebug: process.env.NODE_ENV === 'development',
    logUserActions: true,
    logPerformance: true
  })

  // Configurar nivel de log específico para este componente
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.setLogLevel('debug')
      logger.logDebug('Debug habilitado para componente avanzado')
    }
  }, [])

  return (
    <div>
      {/* Componente con logging avanzado */}
    </div>
  )
}
```

### **2. Logging Condicional**

```tsx
import { useLogger } from '@/hooks/use-logger'

export function ConditionalLoggingComponent() {
  const logger = useLogger({
    context: 'CONDITIONAL',
    componentName: 'ConditionalLoggingComponent'
  })

  const logConditionally = (message, data, condition) => {
    if (condition) {
      logger.logInfo(message, data)
    } else {
      logger.logDebug(message, data)
    }
  }

  const handleAction = (actionType, data) => {
    // Log diferente según el tipo de acción
    switch (actionType) {
      case 'critical':
        logger.logError('Acción crítica realizada', null, data)
        break
      case 'important':
        logger.logWarning('Acción importante realizada', data)
        break
      case 'normal':
        logger.logInfo('Acción normal realizada', data)
        break
      default:
        logger.logDebug('Acción desconocida realizada', data)
    }
  }

  return (
    <div>
      {/* Componente con logging condicional */}
    </div>
  )
}
```

---

**¡Estos ejemplos te ayudarán a implementar el sistema de logging de manera efectiva en todo tu proyecto!** 🎉

Recuerda que el sistema es flexible y puedes adaptarlo a tus necesidades específicas.
