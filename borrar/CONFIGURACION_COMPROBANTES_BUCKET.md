# 📎 CONFIGURACIÓN COMPROBANTES - BUCKET "Comprobantes"

## 🎯 **TU CONFIGURACIÓN ACTUAL**

✅ **Bucket creado:** `Comprobantes` (público)
✅ **Campo en BD:** `comprobante_url` en tabla `pagos`
✅ **Variables de entorno:** Configuradas en `.env.local`

## 🔧 **CÓMO FUNCIONA EL SISTEMA**

### **1. Flujo de Subida de Comprobante**
```
Usuario sube archivo → API /api/upload-comprobante → Supabase Storage → URL guardada en BD
```

### **2. Estructura de Archivos en Storage**
```
Bucket: Comprobantes
├── rifas/
│   ├── {rifa-id-1}/
│   │   ├── pago-{pago-id}_timestamp_random.pdf
│   │   └── comprobante_timestamp_random.jpg
│   └── {rifa-id-2}/
│       └── pago-{pago-id}_timestamp_random.png
```

### **3. URL Generada**
```
https://tu-proyecto.supabase.co/storage/v1/object/public/Comprobantes/rifas/{rifa-id}/pago-{pago-id}_{timestamp}_{random}.{extension}
```

## 📋 **CONFIGURACIÓN EN SUPABASE DASHBOARD**

### **1. Verificar Bucket "Comprobantes"**
- Ir a **Storage** → **Buckets**
- Verificar que existe `Comprobantes`
- Estado: **Public** ✅

### **2. Configurar Políticas RLS (Recomendado)**
En **Storage** → **Policies** → **Comprobantes**:

```sql
-- Permitir subir comprobantes (usuarios autenticados)
CREATE POLICY "Subir comprobantes" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'authenticated'
);

-- Permitir leer comprobantes (solo admins)
CREATE POLICY "Leer comprobantes" ON storage.objects
FOR SELECT USING (
    bucket_id = 'Comprobantes' 
    AND auth.role() = 'service_role'
);
```

## 🚀 **PRUEBA DEL SISTEMA**

### **1. Verificar API de Inicialización**
```bash
# GET /api/init-storage
curl https://tu-app.vercel.app/api/init-storage
```

**Respuesta esperada:**
```json
{
  "success": true,
  "status": "ready",
  "message": "Storage listo para usar"
}
```

### **2. Probar Subida de Comprobante**
1. Ir a **Comprar** → **Paso 4**
2. Seleccionar archivo (PNG, JPG, PDF)
3. Subir comprobante
4. Verificar en Supabase Storage

### **3. Verificar en Base de Datos**
```sql
-- Ver último pago con comprobante
SELECT 
    id,
    tipo_pago,
    monto_usd,
    comprobante_url,
    estado,
    fecha_pago
FROM pagos 
WHERE comprobante_url IS NOT NULL 
ORDER BY fecha_pago DESC 
LIMIT 1;
```

## 🔍 **VERIFICACIÓN DE ARCHIVOS**

### **1. En Supabase Dashboard**
- **Storage** → **Comprobantes** → **Explorer**
- Ver archivos organizados por rifa
- Verificar URLs públicas

### **2. En tu Aplicación**
- **Admin** → **Pagos** → Ver campo `comprobante_url`
- **Comprar** → Ver comprobante subido

## 🛠️ **TROUBLESHOOTING**

### **Error: "Bucket not found"**
```bash
# Solución: Verificar nombre exacto del bucket
# Debe ser: "Comprobantes" (con C mayúscula)
```

### **Error: "Permission denied"**
```bash
# Solución: Verificar SUPABASE_SERVICE_ROLE_KEY en .env.local
# Y políticas RLS en Supabase
```

### **Error: "File too large"**
```bash
# Solución: Verificar límite en bucket (default: 50MB)
# Configurable en Supabase Dashboard
```

## 📊 **MONITOREO Y MANTENIMIENTO**

### **1. Verificar Uso de Storage**
```sql
-- Contar archivos por rifa
SELECT 
    r.titulo as rifa_titulo,
    COUNT(p.comprobante_url) as comprobantes
FROM rifas r
LEFT JOIN pagos p ON r.id = p.rifa_id
GROUP BY r.id, r.titulo
ORDER BY comprobantes DESC;
```

### **2. Limpiar Archivos Antiguos**
```sql
-- Ver pagos sin comprobantes (opcional)
SELECT 
    id,
    tipo_pago,
    fecha_pago,
    estado
FROM pagos 
WHERE comprobante_url IS NULL 
AND fecha_pago < NOW() - INTERVAL '30 days';
```

## 🎉 **RESULTADO FINAL**

**Tu sistema ahora:**
- ✅ **Sube comprobantes** al bucket "Comprobantes"
- ✅ **Guarda URLs** en `pagos.comprobante_url`
- ✅ **Funciona en Vercel** (sin archivos locales)
- ✅ **Organiza archivos** por rifa
- ✅ **Genera URLs públicas** accesibles

## 🔮 **PRÓXIMOS PASOS RECOMENDADOS**

### **1. Panel de Administración**
- Vista de comprobantes subidos
- Descarga directa de archivos
- Verificación visual de comprobantes

### **2. Notificaciones**
- Email al admin con nuevo comprobante
- WhatsApp/Telegram para pagos urgentes

### **3. Validación Automática**
- Verificación de tipos de archivo
- Escaneo de virus (opcional)
- Compresión automática de imágenes

---

## 📝 **RESUMEN DE CONFIGURACIÓN**

1. **Bucket "Comprobantes"** ✅ Creado y configurado
2. **Campo `comprobante_url`** ✅ Existe en tabla `pagos`
3. **Variables de entorno** ✅ Configuradas en `.env.local`
4. **Código actualizado** ✅ Usa tu bucket específico
5. **Sistema funcional** ✅ Listo para usar en Vercel

**¡Tu sistema de comprobantes está 100% configurado y funcionando!** 🎉
