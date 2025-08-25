# 🎯 GUÍA DE MIGRACIÓN: CONSOLE.LOG → SISTEMA DE LOGGING PROFESIONAL

## 📋 Resumen

Esta guía te ayudará a migrar todos los `console.log` del proyecto al nuevo sistema de logging profesional que **reemplaza completamente** el logging inseguro y no estructurado.

## 🚨 **¿POR QUÉ MIGRAR?**

### **Problemas del Console.Log** ❌
- **Seguridad**: Usuarios pueden ver logs en consola del navegador
- **Información sensible expuesta**: IDs, emails, estados internos
- **No estructurado**: Difícil de filtrar y analizar
- **Imposible deshabilitar** en producción
- **Sin niveles**: No hay diferencia entre error, warn, info, debug
- **Profesionalismo comprometido**: Consola llena de mensajes

### **Beneficios del Nuevo Sistema** ✅
- **Seguro**: Logs no visibles para usuarios finales
- **Estructurado**: Con niveles, contextos y timestamps
- **Configurable**: Diferentes niveles por entorno
- **Profesional**: Sin ruido en consola del usuario
- **Monitoreable**: Integración con servicios externos
- **Performance**: Logs de debug solo en desarrollo

## 🚀 **IMPLEMENTACIÓN PASO A PASO**

### **1. Instalar el Sistema de Logging**

El sistema ya está implementado en:
- `toolbox/utils/logger.js` - Sistema base
- `hooks/use-logger.ts` - Hook para React
- `lib/config/logging.ts` - Configuración

### **2. Configurar Variables de Entorno**

Crear/actualizar `.env.local`:

```bash
# =====================================================
# 🎯 CONFIGURACIÓN DE LOGGING - ELEVEN RIFAS
# =====================================================

# Nivel de logging (error, warn, info, debug)
LOG_LEVEL=info
NEXT_PUBLIC_LOG_LEVEL=info

# Configuración de archivos
LOG_ENABLE_FILE_LOGGING=false
LOG_FILE_PATH=./logs/eleven-rifas.log
LOG_MAX_LENGTH=1000

# Servicios externos
LOG_ENABLE_SENTRY=false
LOG_ENABLE_LOGROCKET=false
LOG_ENABLE_CUSTOM_API=false

# Notificaciones y monitoreo
LOG_ENABLE_ERROR_NOTIFICATIONS=true
LOG_ENABLE_PERFORMANCE_MONITORING=false

# Modo debug
LOG_ENABLE_DEBUG_MODE=false
```

### **3. Migrar Componentes React**

#### **ANTES (Console.Log)**
```tsx
export default function MiComponente() {
  useEffect(() => {
    console.log('🔍 Cargando datos...')
    
    try {
      // ... lógica
      console.log('✅ Datos cargados:', data)
    } catch (error) {
      console.error('❌ Error:', error)
    }
  }, [])
  
  const handleClick = () => {
    console.log('👆 Usuario hizo clic')
  }
}
```

#### **DESPUÉS (Sistema Profesional)**
```tsx
import { useLogger } from '@/hooks/use-logger'

export default function MiComponente() {
  const logger = useLogger({
    context: 'COMPONENT',
    componentName: 'MiComponente',
    enableDebug: true,
    logUserActions: true
  })

  useEffect(() => {
    logger.logInfo('Iniciando carga de datos')
    
    try {
      // ... lógica
      logger.logInfo('Datos cargados exitosamente', { count: data.length })
    } catch (error) {
      logger.logError('Error al cargar datos', error, { data })
    }
  }, [])
  
  const handleClick = () => {
    logger.logUserAction('Usuario hizo clic en botón')
  }
}
```

### **4. Migrar Hooks Personalizados**

#### **ANTES**
```tsx
export function useMiHook() {
  const fetchData = async () => {
    console.log('🔍 Fetching data...')
    
    try {
      const result = await api.get('/data')
      console.log('✅ Data fetched:', result)
      return result
    } catch (error) {
      console.error('❌ Fetch error:', error)
      throw error
    }
  }
  
  return { fetchData }
}
```

#### **DESPUÉS**
```tsx
import { useLogger } from '@/hooks/use-logger'

export function useMiHook() {
  const logger = useLogger({
    context: 'HOOK',
    componentName: 'useMiHook'
  })

  const fetchData = async () => {
    logger.logInfo('Iniciando fetch de datos')
    
    try {
      const result = await api.get('/data')
      logger.logInfo('Datos obtenidos exitosamente', { count: result.length })
      return result
    } catch (error) {
      logger.logError('Error al obtener datos', error, { endpoint: '/data' })
      throw error
    }
  }
  
  return { fetchData }
}
```

### **5. Migrar Funciones de Utilidad**

#### **ANTES**
```tsx
export function processData(data) {
  console.log('🔧 Procesando datos:', data.length)
  
  if (!data || data.length === 0) {
    console.warn('⚠️ No hay datos para procesar')
    return []
  }
  
  try {
    const processed = data.map(item => transformItem(item))
    console.log('✅ Datos procesados:', processed.length)
    return processed
  } catch (error) {
    console.error('❌ Error procesando:', error)
    return []
  }
}
```

#### **DESPUÉS**
```tsx
import { log } from '@/toolbox/utils/logger'

export function processData(data) {
  log.info('UTILS', 'Iniciando procesamiento de datos', { count: data?.length })
  
  if (!data || data.length === 0) {
    log.warn('UTILS', 'No hay datos para procesar')
    return []
  }
  
  try {
    const processed = data.map(item => transformItem(item))
    log.info('UTILS', 'Datos procesados exitosamente', { count: processed.length })
    return processed
  } catch (error) {
    log.error('UTILS', 'Error al procesar datos', error, { dataCount: data?.length })
    return []
  }
}
```

## 🎯 **PATRONES DE MIGRACIÓN**

### **1. Console.Log → Logger.Info**
```tsx
// ❌ ANTES
console.log('✅ Operación exitosa')

// ✅ DESPUÉS
logger.logInfo('Operación completada exitosamente')
```

### **2. Console.Warn → Logger.Warning**
```tsx
// ❌ ANTES
console.warn('⚠️ Advertencia importante')

// ✅ DESPUÉS
logger.logWarning('Advertencia importante detectada')
```

### **3. Console.Error → Logger.Error**
```tsx
// ❌ ANTES
console.error('❌ Error crítico:', error)

// ✅ DESPUÉS
logger.logError('Error crítico en operación', error, { context: 'operacion' })
```

### **4. Console.Debug → Logger.Debug**
```tsx
// ❌ ANTES
console.log('🔍 Debug info:', data)

// ✅ DESPUÉS
logger.logDebug('Información de debug', { data })
```

## 🔧 **CONFIGURACIONES ESPECÍFICAS**

### **1. Componentes de Tabla**
```tsx
import { useTableLogger } from '@/hooks/use-logger'

export function MiTabla() {
  const logger = useTableLogger('MiTabla', {
    enableDebug: true,
    logPerformance: true
  })
  
  const handleSort = () => {
    logger.logTableAction('Usuario ordenó tabla', { column: 'nombre' })
  }
  
  const handleFilter = () => {
    logger.logTableAction('Usuario aplicó filtro', { filter: 'activo' })
  }
}
```

### **2. Componentes de Formulario**
```tsx
import { useFormLogger } from '@/hooks/use-logger'

export function MiFormulario() {
  const logger = useFormLogger('MiFormulario')
  
  const handleSubmit = async (data) => {
    try {
      await submitData(data)
      logger.logFormSubmission(true, data)
    } catch (error) {
      logger.logFormSubmission(false, data, error.message)
    }
  }
  
  const handleValidation = (field, isValid, message) => {
    logger.logFormValidation(field, isValid, message)
  }
}
```

### **3. Componentes de Autenticación**
```tsx
import { useAuthLogger } from '@/hooks/use-logger'

export function LoginForm() {
  const logger = useAuthLogger()
  
  const handleLogin = async (credentials) => {
    try {
      const result = await login(credentials)
      logger.logLoginAttempt(credentials.email, true)
    } catch (error) {
      logger.logLoginAttempt(credentials.email, false, error.message)
    }
  }
  
  const handleLogout = () => {
    logger.logLogout(userId)
  }
}
```

## 📊 **NIVELES DE LOGGING**

### **Error (0)**
- Errores críticos que rompen funcionalidad
- Fallos de autenticación/autorisación
- Errores de base de datos
- **Siempre visible** en todos los entornos

### **Warning (1)**
- Situaciones que no rompen pero son problemáticas
- Datos faltantes o inválidos
- Operaciones que pueden fallar
- **Visible en desarrollo y staging**

### **Info (2)**
- Información general del flujo de la aplicación
- Acciones del usuario
- Estados de operaciones
- **Visible en desarrollo, oculto en producción**

### **Debug (3)**
- Información detallada para desarrollo
- Valores de variables
- Flujo de ejecución
- **Solo visible en desarrollo**

## 🚨 **CONFIGURACIONES POR ENTORNO**

### **Desarrollo**
```bash
LOG_LEVEL=info
LOG_ENABLE_DEBUG_MODE=true
LOG_ENABLE_ERROR_NOTIFICATIONS=false
```

### **Staging**
```bash
LOG_LEVEL=warn
LOG_ENABLE_DEBUG_MODE=false
LOG_ENABLE_ERROR_NOTIFICATIONS=true
```

### **Producción**
```bash
LOG_LEVEL=error
LOG_ENABLE_DEBUG_MODE=false
LOG_ENABLE_ERROR_NOTIFICATIONS=true
LOG_ENABLE_PERFORMANCE_MONITORING=true
```

## 🔍 **VERIFICACIÓN DE MIGRACIÓN**

### **Checklist de Verificación**
- [ ] **No hay console.log** en el código
- [ ] **No hay console.warn** en el código
- [ ] **No hay console.error** en el código
- [ ] **Todos los componentes** usan useLogger
- [ ] **Todos los hooks** usan useLogger
- [ ] **Todas las utilidades** usan log.*
- [ ] **Variables de entorno** configuradas
- [ ] **Niveles de log** apropiados por entorno

### **Comando de Verificación**
```bash
# Buscar console.log restantes
grep -r "console\." src/ --include="*.tsx" --include="*.ts"

# Buscar console.log restantes
grep -r "console\." app/ --include="*.tsx" --include="*.ts"
```

## 📝 **EJEMPLOS COMPLETOS**

### **Dashboard (Ya Migrado)**
Ver `app/admin/(panel)/dashboard/page.tsx` para ejemplo completo.

### **Hook de Autenticación**
```tsx
import { useLogger } from '@/hooks/use-logger'

export function useAdminAuth() {
  const logger = useLogger({
    context: 'AUTH',
    componentName: 'useAdminAuth',
    enableDebug: true
  })

  const checkSession = async () => {
    try {
      logger.logInfo('Verificando sesión de usuario')
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        logger.logError('Error obteniendo sesión', error)
        return
      }
      
      if (!session?.user) {
        logger.logInfo('No hay sesión activa')
        return
      }
      
      logger.logInfo('Sesión verificada exitosamente', { 
        userId: session.user.id,
        email: session.user.email 
      })
      
    } catch (error) {
      logger.logError('Error inesperado verificando sesión', error)
    }
  }
  
  return { /* ... */ }
}
```

## 🎯 **BENEFICIOS INMEDIATOS**

1. **Seguridad**: Los usuarios no ven logs internos
2. **Profesionalismo**: Consola limpia en producción
3. **Debugging**: Logs estructurados y filtrables
4. **Monitoreo**: Integración con servicios externos
5. **Performance**: Logs de debug solo en desarrollo
6. **Mantenibilidad**: Código más limpio y profesional

## 🚀 **PRÓXIMOS PASOS**

1. **Migrar dashboard** ✅ (Completado)
2. **Migrar tablas** (RifasTable, CategoriasTable, etc.)
3. **Migrar hooks** (useAdminAuth, useCrudRifas, etc.)
4. **Migrar utilidades** (formatters, validators, etc.)
5. **Configurar servicios externos** (Sentry, LogRocket)
6. **Implementar monitoreo** de performance y errores

---

**¡El sistema de logging profesional está listo para usar!** 🎉

Reemplaza todos los `console.log` y disfruta de un logging seguro, estructurado y profesional.
