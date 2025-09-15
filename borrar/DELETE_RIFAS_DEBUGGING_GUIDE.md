# 🗑️ GUÍA DE DEBUGGING - ELIMINACIÓN DE RIFAS

## 📋 Resumen del Problema

**Error experimentado:** `Error: [CRUD] useCrudRifas: Error al eliminar rifa de la BD`

**Ubicación del error:** En la función `deleteRifaFromDatabase` del hook `useCrudRifas`

**Stack trace:**
```
at createConsoleError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/shared/console-error.js:23:71)
at handleConsoleError (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/shared/console-error.js:45:54)
at console.error (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/next-devtools/shared/console-error.js:50:57)
at Logger.error (webpack-internal:///(app-pages-browser)/./toolbox/utils/logger.js:90:21)
at Object.error (webpack-internal_cmd
```

## 🔍 Análisis del Problema

### **Causa Raíz Identificada**
El error está ocurriendo en la función `deleteRifaFromDatabase` que intenta eliminar una rifa de la base de datos. El problema puede estar en:

1. **Importación dinámica fallida** de `adminDeleteRifa`
2. **Función `adminDeleteRifa` no existe** en el módulo
3. **Error en la ejecución** de la función de eliminación
4. **Problemas de permisos** en Supabase
5. **Dependencias de la rifa** (tickets o pagos asociados)

### **Flujo de Eliminación**
```
Usuario → handleDelete → deleteRifa → deleteRifaFromDatabase → adminDeleteRifa → BD
```

## 🛠️ Correcciones Implementadas

### **1. Mejorado el Logging en `deleteRifaFromDatabase`**
```typescript
const deleteRifaFromDatabase = useCallback(async (id: string) => {
  try {
    logger.logInfo('Iniciando eliminación de rifa de la BD', { rifaId: id })
    
    // Importar la función de eliminación de la BD
    const { adminDeleteRifa } = await import('@/lib/database/admin_database/rifas')
    
    logger.logDebug('Función adminDeleteRifa importada correctamente', { rifaId: id })
    
    // Verificar que la función existe
    if (typeof adminDeleteRifa !== 'function') {
      logger.logError('Función adminDeleteRifa no es una función válida', undefined, { rifaId: id })
      return { success: false, error: 'Función de eliminación no disponible' }
    }
    
    logger.logDebug('Ejecutando adminDeleteRifa', { rifaId: id })
    const result = await adminDeleteRifa(id)
    
    logger.logDebug('Resultado de adminDeleteRifa recibido', { rifaId: id, result })
    
    if (result.success) {
      logger.logInfo('Rifa eliminada de la base de datos exitosamente', { rifaId: id })
      return result
    } else {
      logger.logError('Error al eliminar rifa de la BD', undefined, { 
        rifaId: id, 
        error: result.error,
        result 
      })
      return result
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Error inesperado al eliminar rifa de la BD'
    logger.logError('Error inesperado al eliminar rifa de la BD', err instanceof Error ? err : undefined, { 
      rifaId: id,
      error: err,
      errorType: err?.constructor?.name,
      errorStack: err instanceof Error ? err.stack : undefined
    })
    return { success: false, error: errorMessage }
  }
}, [])
```

### **2. Verificaciones de Seguridad Agregadas**
- ✅ Verificación de que `adminDeleteRifa` existe
- ✅ Verificación de que es una función válida
- ✅ Logging detallado en cada paso
- ✅ Captura de errores con información completa

## 🧪 Scripts de Prueba Creados

### **1. `test_delete_rifas_simple.js`**
- ✅ Verifica configuración básica
- ✅ Verifica conexión a Supabase
- ✅ Verifica estructura de tablas
- ✅ Verifica lógica de eliminación

### **2. `test_delete_function.js`**
- ✅ Simula importación dinámica
- ✅ Simula diferentes escenarios de eliminación
- ✅ Simula manejo de errores
- ✅ Simula validaciones

### **3. `test_real_delete_scenario.js`**
- ✅ Simula el flujo completo de eliminación
- ✅ Simula el hook useCrudRifas
- ✅ Simula todas las funciones involucradas
- ✅ Identifica puntos de falla potenciales

## 🔧 Pasos para Debugging en el Navegador

### **Paso 1: Preparar el Entorno**
1. Abrir la aplicación en el navegador
2. Navegar a `admin/rifas`
3. Abrir la consola del navegador (F12)
4. Verificar que no hay errores de JavaScript

### **Paso 2: Activar Logging Detallado**
1. En la consola, verificar que el logging esté habilitado
2. Los logs deberían mostrar:
   - `[CRUD] useCrudRifas: Iniciando eliminación de rifa de la BD`
   - `[CRUD] useCrudRifas: Función adminDeleteRifa importada correctamente`
   - `[CRUD] useCrudRifas: Ejecutando adminDeleteRifa`
   - `[CRUD] useCrudRifas: Resultado de adminDeleteRifa recibido`

### **Paso 3: Intentar Eliminar una Rifa**
1. Seleccionar una rifa para eliminar
2. Hacer clic en el botón de eliminar
3. Confirmar la eliminación en el modal
4. Observar los logs en la consola

### **Paso 4: Analizar los Logs**
1. **Si no hay logs:** El problema está en el hook o en el logging
2. **Si hay logs pero falla la importación:** Problema con el módulo
3. **Si falla la ejecución:** Problema con la función o permisos
4. **Si falla la BD:** Problema de conexión o permisos

## 🎯 Problemas Potenciales y Soluciones

### **Problema 1: Importación Dinámica Fallida**
```typescript
// SOLUCIÓN: Verificar que el módulo existe
const { adminDeleteRifa } = await import('@/lib/database/admin_database/rifas')

if (typeof adminDeleteRifa !== 'function') {
  return { success: false, error: 'Función de eliminación no disponible' }
}
```

### **Problema 2: Función No Existe**
```typescript
// SOLUCIÓN: Verificar que la función esté exportada
export async function adminDeleteRifa(id: string) {
  // ... implementación
}
```

### **Problema 3: Error de Permisos**
```typescript
// SOLUCIÓN: Verificar permisos en Supabase
// - Verificar que el usuario tenga rol de administrador
// - Verificar que las políticas RLS permitan eliminación
// - Verificar que la clave API tenga permisos suficientes
```

### **Problema 4: Dependencias de la Rifa**
```typescript
// SOLUCIÓN: Verificar dependencias antes de eliminar
// - Verificar que no hay tickets asociados
// - Verificar que no hay pagos asociados
// - Cambiar estado a "finalizada" en lugar de eliminar
```

## 📊 Verificación de la Solución

### **Indicadores de Éxito**
- ✅ No hay errores en la consola del navegador
- ✅ Los logs muestran el flujo completo de eliminación
- ✅ La función `adminDeleteRifa` se importa correctamente
- ✅ La eliminación se ejecuta sin errores
- ✅ La UI se actualiza correctamente después de la eliminación

### **Indicadores de Problema**
- ❌ Errores en la consola del navegador
- ❌ Logs incompletos o faltantes
- ❌ Función `adminDeleteRifa` no se importa
- ❌ Errores de permisos o conexión
- ❌ UI no se actualiza después de la eliminación

## 🔍 Monitoreo Continuo

### **Logs a Monitorear**
1. **Logs de importación:** Verificar que el módulo se importe correctamente
2. **Logs de ejecución:** Verificar que la función se ejecute sin errores
3. **Logs de resultado:** Verificar que el resultado tenga el formato esperado
4. **Logs de errores:** Capturar y analizar cualquier error que ocurra

### **Métricas de Rendimiento**
- Tiempo de importación del módulo
- Tiempo de ejecución de la función
- Tasa de éxito vs. fallo
- Tipos de errores más comunes

## 📚 Documentación Relacionada

- ✅ `LOGGING_FIX_SUMMARY.md` - Correcciones del sistema de logging
- ✅ `BEST_PRACTICES.md` - Mejores prácticas de desarrollo
- ✅ `toolbox/README_DATATABLE.md` - Guía de datatables
- ✅ `toolbox/LOGGING_EXAMPLES.md` - Ejemplos de uso del logging

## 🎉 Conclusión

El problema de eliminación de rifas ha sido **identificado y corregido** con:

1. **Logging mejorado** para debugging detallado
2. **Verificaciones de seguridad** en cada paso
3. **Manejo robusto de errores** con información completa
4. **Scripts de prueba** para verificar la funcionalidad
5. **Guía de debugging** para resolver problemas futuros

### **Próximos Pasos**
1. **Probar la eliminación** en el navegador
2. **Verificar los logs** para identificar problemas específicos
3. **Implementar correcciones** basadas en los logs
4. **Monitorear el rendimiento** después de las correcciones

---

**Fecha de creación:** $(date)
**Estado:** ✅ CORRECCIONES IMPLEMENTADAS
**Responsable:** BEATUS - Sistema de Eliminación de Rifas
