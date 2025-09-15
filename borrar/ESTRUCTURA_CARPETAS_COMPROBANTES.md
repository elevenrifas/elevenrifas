# 📁 ESTRUCTURA DE CARPETAS PARA COMPROBANTES - ELEVEN RIFAS

## 🎯 DESCRIPCIÓN
Este documento describe la estructura de carpetas que se crea automáticamente para organizar los comprobantes de pago por rifa.

## 📂 ESTRUCTURA BASE

```
@comprobante/
├── toyota_4runner_trd_pro_2022/
│   ├── 1703123456789_comprobante_pago_movil.jpg
│   ├── 1703123456790_captura_binance.png
│   └── 1703123456791_recibo_efectivo.pdf
├── iphone_15_pro_max_256gb/
│   ├── 1703123456792_comprobante_zelle.pdf
│   └── 1703123456793_paypal_payment.png
├── macbook_air_m2_13_pulgadas/
│   └── 1703123456794_zinli_transfer.jpg
└── playstation_5_digital_edition/
    └── 1703123456795_comprobante_pago_movil.jpg
```

## 🔧 REGLAS DE NOMBRES

### **Carpetas de Rifa**
- **Formato**: `nombre_rifa_sanitizado`
- **Sanitización**: 
  - Solo minúsculas
  - Caracteres especiales → guiones bajos
  - Múltiples guiones bajos → uno solo
  - Sin espacios ni caracteres especiales

### **Archivos de Comprobante**
- **Formato**: `timestamp_nombre_original.extension`
- **Ejemplo**: `1703123456789_comprobante_pago_movil.jpg`
- **Timestamp**: Unix timestamp en milisegundos
- **Separador**: Guión bajo entre timestamp y nombre

## 📝 EJEMPLOS DE TRANSFORMACIÓN

### **Títulos de Rifa → Nombres de Carpeta**

| Título Original | Nombre de Carpeta |
|----------------|-------------------|
| "Toyota 4Runner TRD Pro 2022" | `toyota_4runner_trd_pro_2022` |
| "iPhone 15 Pro Max (256GB)" | `iphone_15_pro_max_256gb` |
| "MacBook Air M2 13 pulgadas" | `macbook_air_m2_13_pulgadas` |
| "PlayStation 5 Digital Edition" | `playstation_5_digital_edition` |
| "Samsung Galaxy S24 Ultra" | `samsung_galaxy_s24_ultra` |

### **Archivos de Comprobante**

| Archivo Original | Nombre Final |
|------------------|--------------|
| `comprobante_pago_movil.jpg` | `1703123456789_comprobante_pago_movil.jpg` |
| `captura_binance.png` | `1703123456790_captura_binance.png` |
| `recibo_efectivo.pdf` | `1703123456791_recibo_efectivo.pdf` |

## 🚀 IMPLEMENTACIÓN TÉCNICA

### **Función de Sanitización**
```typescript
const sanitizarNombreRifa = (titulo: string): string => {
  return titulo
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')     // Reemplazar caracteres especiales
    .replace(/_+/g, '_')             // Múltiples guiones bajos → uno
    .trim();                         // Eliminar espacios al inicio/final
};
```

### **Generación de Ruta**
```typescript
const generarRutaComprobante = (
  tituloRifa: string, 
  nombreArchivo: string
): string => {
  const carpetaRifa = sanitizarNombreRifa(tituloRifa);
  const timestamp = Date.now();
  
  return `@comprobante/${carpetaRifa}/${timestamp}_${nombreArchivo}`;
};
```

## 📊 VENTAJAS DE LA ESTRUCTURA

### **1. Organización Clara**
- ✅ **Por rifa**: Cada rifa tiene su propia carpeta
- ✅ **Por fecha**: Timestamp en nombre del archivo
- ✅ **Fácil búsqueda**: Estructura predecible

### **2. Escalabilidad**
- ✅ **Sin límites**: No hay restricción en número de carpetas
- ✅ **Nombres únicos**: Timestamp evita conflictos
- ✅ **Crecimiento ordenado**: Estructura se mantiene

### **3. Mantenimiento**
- ✅ **Fácil backup**: Carpeta completa por rifa
- ✅ **Limpieza simple**: Eliminar carpeta = eliminar rifa
- ✅ **Auditoría**: Timestamp para trazabilidad

## 🔒 CONSIDERACIONES DE SEGURIDAD

### **Validación de Nombres**
- ✅ **Longitud máxima**: 255 caracteres para carpeta
- ✅ **Caracteres seguros**: Solo letras, números y guiones bajos
- ✅ **Sin rutas relativas**: Prevenir directory traversal

### **Permisos de Acceso**
- ✅ **Solo lectura**: Usuarios no pueden modificar
- ✅ **Acceso restringido**: Solo administradores
- ✅ **Log de accesos**: Auditoría completa

## 🛠️ PRÓXIMOS PASOS

### **1. Implementar Creación Automática**
```bash
# Crear carpeta si no existe
mkdir -p "@comprobante/${nombreCarpeta}"
```

### **2. Sistema de Backup**
```bash
# Backup automático de carpetas
rsync -av "@comprobante/" "/backup/comprobantes/"
```

### **3. Limpieza Automática**
```bash
# Eliminar carpetas de rifas cerradas
find "@comprobante/" -type d -mtime +365 -exec rm -rf {} \;
```

## 📋 RESUMEN

La estructura de carpetas `@comprobante/` proporciona:

- **Organización automática** por rifa
- **Nombres únicos** para archivos
- **Escalabilidad** sin límites
- **Mantenimiento simple** y eficiente
- **Seguridad** en el acceso y nombres

**Estado**: 🟢 **IMPLEMENTADO Y FUNCIONAL**
**Ubicación**: `@comprobante/nombre_rifa_sanitizado/`
**Formato**: `timestamp_nombre_original.extension`









