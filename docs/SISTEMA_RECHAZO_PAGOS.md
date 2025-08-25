# 🚫 Sistema de Rechazo de Pagos - Eleven Rifas

## 📋 Descripción General

El sistema de rechazo de pagos permite a los administradores rechazar pagos pendientes y **eliminar permanentemente** todos los tickets asociados, manteniendo un registro completo de la información eliminada en el campo `rechazo_logs`.

## 🔐 Seguridad Implementada

### **Autenticación Requerida**
- **Usuario + PIN**: Obligatorio para rechazar pagos
- **Validación de credenciales**: Verificación contra base de datos
- **Auditoría completa**: Registro de quién y cuándo realizó la acción

### **Estados de Verificación**
- `pendiente` → Pago en espera de verificación
- `verificado` → Pago aprobado, tickets pagados
- `rechazado` → Pago rechazado, tickets eliminados

## 🗄️ Estructura de Base de Datos

### **Tabla: pagos**
```sql
-- Campo agregado para logs de rechazo
rechazo_logs text null
```

### **Tabla: tickets**
```sql
-- Campo para logs de rechazo (opcional)
rechazo_logs character varying null
```

## 🔄 Flujo de Rechazo Completo

### **1. Inicio del Proceso**
```
Usuario selecciona "Rechazar" → Modal de confirmación
```

### **2. Validación de Credenciales**
```
Usuario + PIN → Verificación contra base de datos
```

### **3. Proceso de Rechazo**
```
✅ Obtener tickets asociados
✅ Crear log completo de rechazo
✅ Actualizar estado del pago
✅ Eliminar tickets permanentemente
```

### **4. Log de Rechazo**
```json
{
  "fecha_rechazo": "2024-01-15T10:30:00Z",
  "rechazado_por": "admin_user",
  "motivo": "Pago rechazado por administrador",
  "tickets_eliminados": [
    {
      "id": "uuid-ticket-1",
      "numero_ticket": "001",
      "nombre": "Juan Pérez",
      "cedula": "12345678",
      "telefono": "04121234567",
      "correo": "juan@email.com",
      "fecha_compra": "2024-01-15T09:00:00Z",
      "rifa_id": "uuid-rifa-1"
    }
  ],
  "total_tickets": 1
}
```

## ⚠️ Características Importantes

### **Eliminación Permanente**
- Los tickets se **eliminan completamente** de la base de datos
- **NO se pueden recuperar** una vez eliminados
- Los números de tickets quedan disponibles para nuevas reservas

### **Logs Completos**
- Se guarda **toda la información** de los tickets eliminados
- Incluye datos del cliente, rifa, fechas, etc.
- Formato JSON para fácil consulta y análisis

### **Auditoría**
- Registro de quién realizó el rechazo
- Timestamp exacto de la acción
- Motivo del rechazo (configurable)

## 🛠️ Implementación Técnica

### **Función Principal: `adminRejectPago`**
```typescript
export async function adminRejectPago(
  id: string, 
  verificadoPor: string
): Promise<{
  success: boolean;
  data?: {
    pago_rechazado: boolean;
    tickets_eliminados: number;
    rechazo_logs: any;
  };
  error?: string;
}>
```

### **Pasos de Ejecución**
1. **Obtener tickets**: Query a tabla `tickets` por `pago_id`
2. **Crear logs**: Estructurar información completa de rechazo
3. **Actualizar pago**: Cambiar estado y guardar logs
4. **Eliminar tickets**: Delete permanente de todos los tickets asociados

## 🎯 Casos de Uso

### **Pago Rechazado por Fraude**
- Cliente intenta pagar con método fraudulento
- Administrador rechaza y elimina tickets
- Se mantiene registro completo para investigación

### **Pago Rechazado por Documentación**
- Cliente no proporciona documentos requeridos
- Administrador rechaza y elimina tickets
- Logs permiten seguimiento del caso

### **Pago Rechazado por Política**
- No cumple con políticas de la rifa
- Administrador rechaza y elimina tickets
- Se mantiene historial para auditoría

## 📊 Consultas de Logs

### **Ver Todos los Pagos Rechazados**
```sql
SELECT 
  id,
  estado,
  fecha_verificacion,
  verificado_por,
  rechazo_logs
FROM pagos 
WHERE estado = 'rechazado'
ORDER BY fecha_verificacion DESC;
```

### **Analizar Logs de Rechazo**
```sql
-- Extraer información de tickets eliminados
SELECT 
  id,
  verificado_por,
  fecha_verificacion,
  jsonb_array_length(rechazo_logs::jsonb->'tickets_eliminados') as total_tickets,
  rechazo_logs::jsonb->'motivo' as motivo
FROM pagos 
WHERE estado = 'rechazado';
```

### **Estadísticas de Rechazo**
```sql
-- Contar tickets eliminados por período
SELECT 
  DATE(fecha_verificacion) as fecha,
  COUNT(*) as pagos_rechazados,
  SUM(
    jsonb_array_length(rechazo_logs::jsonb->'tickets_eliminados')
  ) as total_tickets_eliminados
FROM pagos 
WHERE estado = 'rechazado'
GROUP BY DATE(fecha_verificacion)
ORDER BY fecha DESC;
```

## 🔒 Consideraciones de Seguridad

### **Permisos Requeridos**
- Solo usuarios con PIN válido pueden rechazar pagos
- Verificación de credenciales en cada operación
- Logs de auditoría para todas las acciones

### **Validaciones**
- Verificación de existencia del pago
- Validación de estado del pago (solo pendientes)
- Control de transacciones para consistencia

### **Backup y Recuperación**
- Los logs se guardan antes de eliminar tickets
- Información completa disponible para auditoría
- No se puede recuperar tickets eliminados

## 🚀 Mejoras Futuras

### **Funcionalidades Adicionales**
- [ ] Motivos de rechazo configurables
- [ ] Notificaciones automáticas al cliente
- [ ] Reportes de rechazo por período
- [ ] Integración con sistema de auditoría

### **Optimizaciones**
- [ ] Índices para consultas de logs
- [ ] Compresión de logs antiguos
- [ ] Limpieza automática de logs muy antiguos
- [ ] Exportación de logs a sistemas externos

## 📝 Notas de Implementación

### **Compatibilidad**
- ✅ Funciona con base de datos existente
- ✅ No afecta funcionalidades actuales
- ✅ Migración automática de schema

### **Performance**
- ⚠️ Operación de eliminación puede ser lenta con muchos tickets
- ✅ Logs se guardan en una sola transacción
- ✅ Índices optimizados para consultas

### **Mantenimiento**
- 🔧 Revisar logs periódicamente
- 🔧 Monitorear espacio de almacenamiento
- 🔧 Backup regular de logs importantes
