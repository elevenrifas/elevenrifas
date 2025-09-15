# 🚀 GUÍA DE MIGRACIÓN DE SCHEMAS - ELEVEN RIFAS

## 📋 Resumen de Cambios

Esta guía documenta la migración completa de los schemas de base de datos para las tablas `pagos`, `rifas` y `tickets` en el sistema Eleven Rifas.

## 🔄 Cambios en la Tabla `pagos`

### Nuevos Campos Agregados:
- **`estado`** (character varying): Estado del pago (pendiente, verificado, rechazado, cancelado, en_revision)
- **`verificado_por`** (character varying(255)): Usuario que verificó el pago
- **`fecha_visita`** (date): Fecha programada para visita o entrega

### Campos Existentes Mantenidos:
- `id` (uuid, PK)
- `tipo_pago` (character varying(50))
- `monto_bs` (numeric(10,2))
- `monto_usd` (numeric(10,2))
- `tasa_cambio` (numeric(10,2))
- `referencia` (character varying(255))
- `fecha_pago` (timestamp)
- `fecha_verificacion` (timestamp)
- `telefono_pago` (character varying(20))
- `banco_pago` (character varying(100))
- `cedula_pago` (character varying(20))

### Constraint de Validación:
```sql
CONSTRAINT pagos_tipo_pago_check CHECK (
  tipo_pago IN ('pago_movil', 'binance', 'zelle', 'zinli', 'paypal', 'efectivo')
)
```

## 🔄 Cambios en la Tabla `rifas`

### Nuevos Campos Agregados:
- **`numero_tickets_comprar`** (jsonb): Array de números de tickets que se pueden comprar
  - Valor por defecto: `[1, 2, 3, 5, 10]`
  - Permite configurar opciones de compra flexibles
- **`progreso_manual`** (numeric): Progreso manual de la rifa (0-100)
  - Valor por defecto: `NULL`
  - Permite establecer un progreso personalizado

### Campos Existentes Mantenidos:
- `id` (uuid, PK)
- `titulo` (character varying(255))
- `descripcion` (text)
- `precio_ticket` (numeric(10,2))
- `imagen_url` (character varying(500))
- `estado` (character varying(50))
- `fecha_creacion` (timestamp)
- `fecha_cierre` (timestamp)
- `total_tickets` (integer)
- `tickets_disponibles` (integer)
- `condiciones` (text)
- `categoria_id` (uuid, FK)

### Constraint de Validación:
```sql
CONSTRAINT rifas_estado_check CHECK (
  estado IN ('activa', 'cerrada', 'finalizada')
)
```

## 🔄 Cambios en la Tabla `tickets`

### Nuevos Campos Agregados:
- **`correo`** (character varying(255)): Email del comprador (NOT NULL)
- **`fecha_compra`** (timestamp): Fecha de compra del ticket (default: now())

### Campos Simplificados/Eliminados:
- ❌ `precio` (eliminado - se obtiene de la rifa)
- ❌ `estado` (eliminado - simplificado)
- ❌ `bloqueado_por_pago` (eliminado)
- ❌ `estado_verificacion` (eliminado)
- ❌ `fecha_verificacion` (eliminado)

### Campos Existentes Mantenidos:
- `id` (uuid, PK)
- `rifa_id` (uuid, FK)
- `numero_ticket` (character varying(10))
- `nombre` (character varying(255))
- `cedula` (character varying(20))
- `telefono` (character varying(20))
- `pago_id` (uuid, FK)

### Constraints Mantenidos:
```sql
CONSTRAINT tickets_rifa_id_numero_ticket_key UNIQUE (rifa_id, numero_ticket)
CONSTRAINT tickets_pago_id_fkey FOREIGN KEY (pago_id) REFERENCES pagos (id)
CONSTRAINT tickets_rifa_id_fkey FOREIGN KEY (rifa_id) REFERENCES rifas (id) ON DELETE CASCADE
```

## 🛠️ Archivos Actualizados

### 1. Tipos TypeScript (`types/index.d.ts`)
- ✅ Actualizada interfaz `Rifa` con `numero_tickets_comprar`
- ✅ Actualizada interfaz `Ticket` simplificada
- ✅ Nueva interfaz `Pago` con campos actualizados
- ✅ Nuevas interfaces `CreatePagoData` y `UpdatePagoData`

### 2. Configuración (`lib/database/config.ts`)
- ✅ Agregadas validaciones para `numero_tickets_comprar`
- ✅ Agregados estados válidos para pagos
- ✅ Agregados tipos de pago válidos
- ✅ Agregados estados válidos para rifas

### 3. Funciones de Base de Datos
- ✅ `lib/database/rifas.ts`: Actualizada para `numero_tickets_comprar`
- ✅ `lib/database/tickets.ts`: Simplificada según nuevo schema
- ✅ `lib/database/pagos.ts`: Actualizada para nuevos campos

### 4. Base de Datos Administrativa
- ✅ `lib/database/admin_database/rifas.ts`: Validaciones actualizadas
- ✅ `lib/database/admin_database/tickets.ts`: Schema simplificado
- ✅ `lib/database/admin_database/pagos.ts`: Nuevos campos

### 5. Hooks Personalizados
- ✅ `hooks/use-admin-rifas.ts`: Validaciones para `numero_tickets_comprar`

### 6. Toolbox
- ✅ `toolbox/scripts/19_migrate_schemas.js`: Script de migración

## 🚀 Proceso de Migración

### Paso 1: Ejecutar Script de Migración
```bash
cd toolbox/scripts
node 19_migrate_schemas.js
```

### Paso 2: Verificar Cambios
El script verificará automáticamente que todos los nuevos campos estén presentes.

### Paso 3: Actualizar Aplicación
Reiniciar la aplicación para que los nuevos tipos y funciones tomen efecto.

## ⚠️ Consideraciones Importantes

### 1. Compatibilidad hacia Atrás
- Los campos nuevos tienen valores por defecto
- Las consultas existentes seguirán funcionando
- Los campos eliminados ya no están disponibles

### 2. Validaciones
- Se agregaron validaciones para `numero_tickets_comprar`
- Se validan los estados de pagos
- Se validan los tipos de pago

### 3. Performance
- El campo `numero_tickets_comprar` es JSONB para flexibilidad
- Se mantienen los índices existentes
- Las consultas se optimizaron

## 🔍 Verificación Post-Migración

### 1. Verificar Campos Nuevos
```sql
-- Verificar tabla pagos
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pagos' AND column_name IN ('estado', 'verificado_por', 'fecha_visita');

-- Verificar tabla rifas
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'rifas' AND column_name IN ('numero_tickets_comprar', 'progreso_manual');

-- Verificar tabla tickets
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'tickets' AND column_name IN ('correo', 'fecha_compra');
```

### 2. Verificar Constraints
```sql
-- Verificar constraints de pagos
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'pagos';

-- Verificar constraints de rifas
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'rifas';

-- Verificar constraints de tickets
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'tickets';
```

## 📞 Soporte

Si encuentras algún problema durante la migración:

1. Revisar los logs del script de migración
2. Verificar que las variables de entorno estén configuradas
3. Confirmar que tienes permisos de administrador en la base de datos
4. Revisar la documentación de Supabase para cambios de schema

## 🎯 Próximos Pasos

Después de la migración exitosa:

1. **Testing**: Probar todas las funcionalidades principales
2. **Documentación**: Actualizar documentación de API si es necesario
3. **Monitoreo**: Monitorear performance y errores
4. **Backup**: Crear backup de la base de datos migrada

---

**Fecha de Migración**: $(date)
**Versión**: 2.0.0
**Responsable**: BEATUS - Sistema de Migración Automatizada
