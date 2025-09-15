# 🎫 Sistema de Tickets Especiales

## Descripción
Los tickets especiales son tickets reservados para premios que mantienen su identidad especial incluso cuando son asignados a pagos.

## Campo de Base de Datos
- **`es_ticket_especial`**: Campo boolean que identifica si un ticket es especial
- **Valor por defecto**: `false`
- **Ubicación**: Tabla `public.tickets`

## Identificación de Tickets Especiales

### Método Único (Actual)
```typescript
const isEspecial = ticket.es_ticket_especial === true
```

**Nota**: Solo se usa el campo `es_ticket_especial` para identificar tickets especiales. Los valores de `nombre` y `cedula` se actualizan con los datos del cliente real cuando se asigna el ticket.

## Creación de Tickets Especiales

### 1. Modal de Reservar Ticket
- Valores por defecto:
  - `nombre: 'TICKET RESERVADO'`
  - `cedula: '000000000'`
  - `telefono: '000000000'`
  - `correo: 'N/A'`
  - `es_ticket_especial: true`

### 2. Función `adminCreateTicketReservado`
```typescript
const ticketData = {
  // ... otros campos
  es_ticket_especial: data.es_ticket_especial ?? true
}
```

## Asignación a Pagos

### Comportamiento Actual
Cuando un ticket especial se asigna a un pago:
- ✅ **Mantiene** `es_ticket_especial: true` (único campo que mantiene identidad especial)
- ✅ **Actualiza** `nombre: [nombre_del_cliente]`
- ✅ **Actualiza** `cedula: [cedula_del_cliente]`
- ✅ **Actualiza** `telefono: [telefono_del_cliente]`
- ✅ **Actualiza** `correo: [correo_del_cliente]`
- ✅ **Cambia** `estado: 'pagado'`
- ✅ **Asigna** `pago_id: [id_del_pago]`

### Función `adminVerifyPago`
La función actualiza tickets especiales con datos del cliente pero mantiene solo `es_ticket_especial`:
```typescript
.update({ 
  estado: 'pagado', 
  pago_id: id, 
  fecha_compra: new Date().toISOString(),
  // Actualizar con datos del cliente real
  nombre: datosCliente.nombre,
  cedula: datosCliente.cedula,
  telefono: datosCliente.telefono,
  correo: datosCliente.correo,
  // Mantener solo la identidad especial
  es_ticket_especial: true
})
```

## Visualización en UI

### 1. Tabla de Tickets (`TicketsTable.tsx`)
- Badge "ESPECIAL" en color púrpura
- Texto "Ticket reservado para premio"

### 2. Modal de Detalles de Pago (`PagoDetallesModal.tsx`)
- Color púrpura en la grilla de tickets
- Identificación visual clara

### 3. Modal de Tickets de Rifa (`RifaTicketsModal.tsx`)
- Color púrpura en la grilla
- Conteo separado en estadísticas

## Consultas de Base de Datos

### Listar Tickets Especiales Disponibles
```sql
SELECT id, numero_ticket, pago_id, es_ticket_especial, nombre, cedula
FROM tickets
WHERE rifa_id = $1
  AND estado = 'reservado'
  AND pago_id IS NULL
  AND es_ticket_especial = true
ORDER BY numero_ticket ASC
```

### Validar Tickets Especiales para Asignación
```sql
SELECT id, numero_ticket, pago_id, es_ticket_especial, nombre, cedula
FROM tickets
WHERE rifa_id = $1
  AND id = ANY($2)
  AND pago_id IS NULL
  AND estado = 'reservado'
  AND es_ticket_especial = true
```

## Migración de Datos Existentes

### Script de Migración
```sql
-- Marcar tickets existentes como especiales
UPDATE public.tickets 
SET es_ticket_especial = true 
WHERE nombre = 'TICKET RESERVADO' 
  AND cedula = '000000000'
  AND (es_ticket_especial IS NULL OR es_ticket_especial = false);
```

## Utilidades Centralizadas

### Archivo: `lib/utils/ticket-especial.ts`

#### `esTicketEspecial(ticket)`
Determina si un ticket es especial.

#### `crearDatosTicketEspecial()`
Crea los datos por defecto para tickets especiales.

#### `marcarComoEspecial(ticket)`
Marca un ticket como especial.

#### `debeMantenerIdentidadEspecial(ticket)`
Verifica si un ticket debe mantener su identidad especial.

#### `combinarDatosTicketEspecialAsignado(ticketEspecial, datosCliente)`
Combina datos manteniendo la identidad especial.

## Beneficios del Nuevo Sistema

1. **Identificación Clara**: Campo dedicado `es_ticket_especial`
2. **Datos Reales**: Los tickets especiales muestran datos del cliente real cuando están asignados
3. **Identidad Preservada**: Solo `es_ticket_especial` mantiene la identidad especial
4. **Centralización**: Lógica centralizada en utilidades
5. **Rendimiento**: Consultas más eficientes usando solo el campo dedicado
6. **Flexibilidad**: Fácil extensión para futuras funcionalidades
7. **Consistencia**: Datos del cliente siempre actualizados y visibles

## Archivos Modificados

### Base de Datos
- `lib/database/Schemas/tickets` - Campo `es_ticket_especial`
- `lib/database/Schemas/migrar_tickets_especiales_existentes.sql` - Script de migración

### Tipos TypeScript
- `types/supabase.ts` - Tipos de Supabase
- `types/index.d.ts` - Interfaces de la aplicación

### Lógica de Base de Datos
- `lib/database/admin_database/tickets.ts` - Funciones de tickets
- `lib/database/admin_database/pagos.ts` - Función `adminVerifyPago`

### Componentes UI
- `app/admin/components/tables/TicketsTable.tsx`
- `app/admin/components/modals/PagoDetallesModal.tsx`
- `app/admin/components/modals/RifaTicketsModal.tsx`
- `app/admin/components/modals/ReservarTicketModal.tsx`

### Utilidades
- `lib/utils/ticket-especial.ts` - Lógica centralizada
