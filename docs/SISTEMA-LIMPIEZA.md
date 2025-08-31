# 🧹 Sistema de Limpieza Automática de Reservas Expiradas

## 📋 **Descripción General**

Este sistema **automáticamente libera tickets reservados** que nunca se pagaron, manteniendo la base de datos limpia y consistente.

## 🎯 **Problema Resuelto**

### **❌ Antes (Sin Sistema de Limpieza):**
```
Usuario reserva tickets → No completa pago → 
Tickets quedan "huérfanos" → Base de datos se llena → 
Otros usuarios no pueden comprar
```

### **✅ Ahora (Con Sistema de Limpieza):**
```
Usuario reserva tickets → No completa pago → 
5 minutos pasan → Sistema automático detecta → 
Tickets se liberan → Base de datos limpia → 
Otros usuarios pueden comprar
```

## 🏗️ **Arquitectura del Sistema**

### **✅ Componentes Principales:**

#### **1. `lib/database/reservas.ts`**
- **Función:** `liberarReservasExpiradas()`
- **Propósito:** Elimina tickets reservados expirados
- **Criterios:** Solo tickets con estado 'reservado' y sin `pago_id`

#### **2. `lib/cron/limpiar-reservas.ts`**
- **Función:** Sistema de tareas programadas
- **Propósito:** Ejecuta limpieza automáticamente
- **Configuración:** Cada 2 minutos por defecto

#### **3. `app/api/limpiar-reservas/route.ts`**
- **Endpoint:** `/api/limpiar-reservas`
- **Propósito:** Limpieza manual y monitoreo
- **Métodos:** GET (estado) y POST (limpieza)

#### **4. `app/api/admin/estado-sistema/route.ts`**
- **Endpoint:** `/api/admin/estado-sistema`
- **Propósito:** Monitoreo administrativo
- **Funcionalidades:** Estado del sistema y limpieza manual

## 🚀 **Configuración y Uso**

### **✅ Inicio Automático:**
El sistema se inicia automáticamente cuando se importa el módulo en `app/layout.tsx`:

```typescript
import { iniciarLimpiezaAutomatica } from "@/lib/cron/limpiar-reservas";

// Inicializar sistema de limpieza automática
if (typeof window === 'undefined') {
  // Solo en el servidor
  console.log('🚀 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA...');
  iniciarLimpiezaAutomatica(2); // Cada 2 minutos
}
```

### **✅ Configuración Personalizada:**
```typescript
// Iniciar cada 5 minutos
iniciarLimpiezaAutomatica(5);

// Iniciar cada 1 minuto (para desarrollo/testing)
iniciarLimpiezaAutomatica(1);
```

## 🧪 **Pruebas del Sistema**

### **✅ Script de Prueba:**
```bash
# Ejecutar script de prueba
node scripts/test-limpieza.js
```

### **✅ Endpoints de Prueba:**
```bash
# Verificar estado del sistema
curl http://localhost:3000/api/admin/estado-sistema

# Ejecutar limpieza manual
curl -X POST http://localhost:3000/api/admin/estado-sistema

# Verificar endpoint de limpieza
curl http://localhost:3000/api/limpiar-reservas
```

## 📊 **Monitoreo y Logs**

### **✅ Logs del Sistema:**
```
🧹 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA (cada 2 minutos)
🧹 EJECUTANDO LIMPIEZA AUTOMÁTICA DE RESERVAS EXPIRADAS...
✅ LIMPIEZA COMPLETADA: 3 reservas expiradas liberadas
```

### **✅ Estado del Sistema:**
```json
{
  "success": true,
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "entorno": "desarrollo",
    "version": "1.0.0",
    "limpieza": {
      "estado": { "activa": true },
      "ultima_limpieza": {
        "exitoso": true,
        "reservas_liberadas": 3,
        "error": null
      }
    },
    "estadisticas": {
      "reservas_expiradas_limpiadas": 3,
      "sistema_activo": true
    }
  }
}
```

## 🛡️ **Seguridad y Validaciones**

### **✅ Criterios de Limpieza:**
- **Estado:** Solo tickets con estado 'reservado'
- **Pago:** Solo tickets sin `pago_id` asociado
- **Tiempo:** Solo tickets que expiraron hace más de 5 minutos
- **Rifa:** Solo tickets de la rifa específica

### **✅ Prevención de Errores:**
- **Verificación:** Confirma que la limpieza fue exitosa
- **Logs:** Registra todas las operaciones
- **Reintentos:** Maneja errores de conexión
- **Rollback:** Revierte cambios si algo falla

## 🔧 **Mantenimiento y Troubleshooting**

### **✅ Verificar Funcionamiento:**
1. **Revisar logs** del servidor
2. **Verificar endpoints** de monitoreo
3. **Comprobar base de datos** para tickets huérfanos
4. **Ejecutar limpieza manual** si es necesario

### **✅ Problemas Comunes:**

#### **❌ Sistema no se inicia:**
```bash
# Verificar importación en layout.tsx
# Verificar que el archivo existe
# Revisar logs de compilación
```

#### **❌ Limpieza no funciona:**
```bash
# Verificar conexión a base de datos
# Revisar permisos de Supabase
# Ejecutar limpieza manual para debug
```

#### **❌ Logs no aparecen:**
```bash
# Verificar nivel de logging
# Comprobar que el servidor esté corriendo
# Verificar configuración de entorno
```

## 📈 **Métricas y Rendimiento**

### **✅ Indicadores de Rendimiento:**
- **Frecuencia:** Cada 2 minutos (configurable)
- **Tiempo de ejecución:** < 1 segundo
- **Tickets procesados:** Hasta 250 por operación
- **Uso de memoria:** Mínimo

### **✅ Optimizaciones:**
- **Consultas eficientes:** Solo campos necesarios
- **Lotes pequeños:** Máximo 100 tickets por consulta
- **Reintentos inteligentes:** Solo para errores de conexión
- **Logging selectivo:** Solo información relevante

## 🚀 **Despliegue en Producción**

### **✅ Configuración Recomendada:**
```typescript
// En producción, usar intervalo más largo
iniciarLimpiezaAutomatica(5); // Cada 5 minutos

// Agregar autenticación a endpoints admin
// Configurar monitoreo externo
// Establecer alertas para errores
```

### **✅ Monitoreo Externo:**
- **Health checks** cada 5 minutos
- **Alertas** si la limpieza falla
- **Métricas** de tickets liberados
- **Backup** de logs importantes

## 🎉 **Beneficios Implementados**

### **✅ Para Usuarios:**
- **Tickets disponibles** siempre actualizados
- **Sin bloqueos** por reservas abandonadas
- **Experiencia fluida** de compra

### **✅ Para Administradores:**
- **Base de datos limpia** automáticamente
- **Monitoreo en tiempo real** del sistema
- **Limpieza manual** cuando sea necesario

### **✅ Para el Sistema:**
- **Rendimiento optimizado** sin tickets huérfanos
- **Escalabilidad** para muchos usuarios
- **Consistencia** de datos garantizada

## 🔮 **Futuras Mejoras**

### **✅ Funcionalidades Planificadas:**
- **Dashboard administrativo** con gráficos
- **Notificaciones** por email/SMS
- **Configuración dinámica** de intervalos
- **Métricas avanzadas** de uso

### **✅ Integraciones:**
- **Slack/Discord** para alertas
- **Grafana** para visualización
- **Prometheus** para métricas
- **Sentry** para errores

---

## 📞 **Soporte y Contacto**

Si tienes problemas con el sistema de limpieza:

1. **Revisar logs** del servidor
2. **Verificar endpoints** de monitoreo
3. **Ejecutar script** de prueba
4. **Contactar al equipo** de desarrollo

---

**🎯 Sistema de Limpieza Automática - Eleven Rifas v1.0**
