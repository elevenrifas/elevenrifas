# 🚀 DESPLIEGUE EN VERCEL - ELEVEN RIFAS

## 🎯 **PROBLEMA RESUELTO**

**❌ ANTES:** El sistema usaba `fs/promises` y `writeFile` que NO funcionan en Vercel
**✅ AHORA:** Usa Supabase Storage que funciona perfectamente en entornos serverless

## 🔧 **CAMBIOS IMPLEMENTADOS**

### **1. Nuevo Sistema de Storage**
- ✅ `lib/utils/supabaseStorage.ts` - Utilidades para Supabase Storage
- ✅ `lib/utils/initStorage.ts` - Inicialización automática de buckets
- ✅ `app/api/init-storage/route.ts` - API para configurar storage

### **2. APIs Actualizadas**
- ✅ `app/api/upload-image/route.ts` - Ahora usa Supabase Storage
- ✅ `app/api/upload-comprobante/route.ts` - Ahora usa Supabase Storage

### **3. Componentes Actualizados**
- ✅ `app/admin/components/ui/image-upload.tsx` - Incluye rifaId
- ✅ `app/admin/components/modals/RifaFormModal.tsx` - Pasa rifaId al upload

## 🌐 **VARIABLES DE ENTORNO REQUERIDAS**

### **En Vercel Dashboard:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NODE_ENV=production
```

### **En .env.local (desarrollo):**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# App
NODE_ENV=development
```

## 🗄️ **CONFIGURACIÓN DE SUPABASE**

### **1. Crear Buckets Manualmente (Recomendado)**
En Supabase Dashboard → Storage:

```sql
-- Bucket para imágenes de rifas (público)
Bucket: imagenes-rifas
Public: ✅ Sí
File size limit: 50MB
Allowed MIME types: image/*

-- Bucket para comprobantes (privado)
Bucket: comprobantes-pago
Public: ❌ No
File size limit: 50MB
Allowed MIME types: image/*, application/pdf
```

### **2. O Usar API de Inicialización**
```bash
# POST para crear buckets
curl -X POST https://tu-app.vercel.app/api/init-storage \
  -H "Authorization: Bearer tu-token"

# GET para verificar estado
curl https://tu-app.vercel.app/api/init-storage
```

## 📋 **POLÍTICAS DE STORAGE (RLS)**

### **Bucket: imagenes-rifas (Público)**
```sql
-- Permitir lectura pública
CREATE POLICY "Imágenes públicas" ON storage.objects
FOR SELECT USING (bucket_id = 'imagenes-rifas');

-- Permitir inserción solo a usuarios autenticados
CREATE POLICY "Subir imágenes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'imagenes-rifas' 
  AND auth.role() = 'authenticated'
);
```

### **Bucket: comprobantes-pago (Privado)**
```sql
-- Solo lectura para admins
CREATE POLICY "Leer comprobantes" ON storage.objects
FOR SELECT USING (
  bucket_id = 'comprobantes-pago' 
  AND auth.role() = 'service_role'
);

-- Solo inserción para usuarios autenticados
CREATE POLICY "Subir comprobantes" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'comprobantes-pago' 
  AND auth.role() = 'authenticated'
);
```

## 🚀 **PASOS PARA DESPLEGAR**

### **1. Preparar Supabase**
```bash
# 1. Crear buckets manualmente en Supabase Dashboard
# 2. Configurar políticas RLS
# 3. Verificar permisos de service_role
```

### **2. Configurar Vercel**
```bash
# 1. Conectar repositorio
# 2. Configurar variables de entorno
# 3. Desplegar aplicación
```

### **3. Inicializar Storage**
```bash
# Opción A: Usar API
curl -X POST https://tu-app.vercel.app/api/init-storage

# Opción B: Verificar manualmente en Supabase Dashboard
```

### **4. Probar Funcionalidad**
```bash
# 1. Crear una rifa con imagen
# 2. Subir comprobante de pago
# 3. Verificar archivos en Supabase Storage
```

## 🔍 **VERIFICACIÓN POST-DESPLIEGUE**

### **1. Verificar Buckets**
```bash
# GET /api/init-storage
# Debe retornar: { "status": "ready" }
```

### **2. Verificar Subida de Imágenes**
```bash
# 1. Ir a Admin → Crear Rifa
# 2. Subir imagen
# 3. Verificar en Supabase Storage
```

### **3. Verificar Subida de Comprobantes**
```bash
# 1. Ir a Comprar → Paso 4
# 2. Subir comprobante
# 3. Verificar en Supabase Storage
```

## 🛠️ **TROUBLESHOOTING**

### **Error: "Bucket not found"**
```bash
# Solución: Crear buckets manualmente en Supabase Dashboard
# O usar: POST /api/init-storage
```

### **Error: "Permission denied"**
```bash
# Solución: Verificar SUPABASE_SERVICE_ROLE_KEY
# Y políticas RLS en Supabase
```

### **Error: "File too large"**
```bash
# Solución: Verificar límites en bucket
# Default: 50MB, configurable en Supabase
```

## 📊 **VENTAJAS DE LA NUEVA IMPLEMENTACIÓN**

### **✅ Compatibilidad Vercel**
- Funciona perfectamente en entornos serverless
- No depende del sistema de archivos local

### **✅ Escalabilidad**
- Supabase maneja el almacenamiento
- Sin límites de espacio en Vercel

### **✅ Seguridad**
- URLs seguras y controladas
- Políticas RLS configurables
- Acceso controlado por roles

### **✅ Mantenimiento**
- Código centralizado y reutilizable
- Fácil backup y restauración
- Monitoreo integrado

## 🔮 **PRÓXIMOS PASOS RECOMENDADOS**

### **1. Optimización de Imágenes**
```typescript
// Implementar redimensionamiento automático
// Usar formatos modernos (WebP, AVIF)
// Implementar lazy loading
```

### **2. CDN y Cache**
```typescript
// Configurar Cloudflare o similar
// Implementar cache headers
// Optimizar delivery global
```

### **3. Backup Automático**
```typescript
// Backup automático de archivos
// Sincronización con S3
// Recuperación de desastres
```

---

## 🎉 **RESUMEN**

**Tu aplicación ahora es 100% compatible con Vercel** y usa un sistema de almacenamiento robusto y escalable. Las imágenes y comprobantes se guardarán en Supabase Storage y serán accesibles desde cualquier lugar del mundo.
