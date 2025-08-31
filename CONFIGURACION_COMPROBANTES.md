# 📎 Configuración de Comprobantes de Pago

## 🎯 **Tipos de Archivo Permitidos**

### **✅ Formatos Aceptados:**
- **PNG** - Imágenes PNG
- **JPG/JPEG** - Imágenes JPEG
- **PDF** - Documentos PDF

### **❌ Formatos NO Aceptados:**
- GIF
- WebP
- Word (.doc, .docx)
- Excel (.xls, .xlsx)
- PowerPoint (.ppt, .pptx)
- Cualquier otro formato

## 📏 **Límites de Tamaño**

### **📊 Tamaño Máximo:**
- **35 MB** por archivo

### **📋 Validaciones:**
- ✅ Archivos menores a 35 MB
- ❌ Archivos mayores a 35 MB (rechazados)

## 🔧 **Configuración Técnica**

### **📁 Archivo de Configuración:**
```typescript
// app/api/upload-comprobante/route.ts

const tiposPermitidos = [
  'image/jpeg',    // JPG/JPEG
  'image/jpg',     // JPG
  'image/png',     // PNG
  'application/pdf' // PDF
];

const tamañoMaximo = 35 * 1024 * 1024; // 35 MB
```

### **🔄 Validaciones Implementadas:**
1. **Tipo de archivo** - Solo los 4 formatos permitidos
2. **Tamaño** - Máximo 35 MB
3. **Carpeta de rifa** - Obligatoria
4. **Logs de debugging** - Para monitoreo

## 🚨 **Mensajes de Error**

### **❌ Tipo de Archivo:**
```
"Tipo de archivo no permitido. Solo se aceptan: PNG, JPG, JPEG y PDF"
```

### **❌ Tamaño Excesivo:**
```
"Archivo demasiado grande (máximo 35MB)"
```

### **❌ Sin Archivo:**
```
"No se proporcionó archivo"
```

### **❌ Sin Carpeta:**
```
"No se proporcionó carpeta de rifa"
```

## 📝 **Uso en la Aplicación**

### **🖼️ Input de Archivo:**
```tsx
<input
  type="file"
  accept=".png,.jpg,.jpeg,.pdf"
  onChange={handleArchivoChange}
  className="..."
/>
```

### **📋 Validación en Frontend:**
```tsx
const handleArchivoChange = (event) => {
  const file = event.target.files?.[0];
  
  if (file) {
    // Validar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(file.type)) {
      toast.error('Solo se aceptan PNG, JPG, JPEG y PDF');
      return;
    }
    
    // Validar tamaño (35MB)
    if (file.size > 35 * 1024 * 1024) {
      toast.error('Archivo demasiado grande (máximo 35MB)');
      return;
    }
    
    // Archivo válido
    setComprobante(file);
  }
};
```

## 🔍 **Monitoreo y Debugging**

### **📊 Logs del Servidor:**
```
📤 ARCHIVO RECIBIDO: {
  nombre: "comprobante.pdf",
  tipo: "application/pdf",
  tamaño: "2.45 MB"
}
```

### **📁 Estructura de Carpetas:**
```
public/
  comprobantes/
    nombre_rifa_1/
      timestamp_comprobante1.pdf
      timestamp_comprobante2.png
    nombre_rifa_2/
      timestamp_comprobante3.jpg
```

## ⚠️ **Consideraciones Importantes**

### **🔄 Reinicio Requerido:**
- Los cambios en la API requieren reiniciar la aplicación
- Ejecutar `npm run dev` después de modificar

### **📱 Compatibilidad:**
- Los formatos PNG, JPG y PDF son universalmente compatibles
- Evita problemas de visualización en diferentes dispositivos

### **💾 Almacenamiento:**
- 35 MB es suficiente para la mayoría de comprobantes
- Considerar limpieza periódica de archivos antiguos

## 🎯 **Resumen de Cambios**

1. **✅ Tipos permitidos:** PNG, JPG, JPEG, PDF
2. **✅ Tamaño máximo:** 35 MB
3. **✅ Validaciones mejoradas**
4. **✅ Logs de debugging**
5. **✅ Mensajes de error claros**

---

**📅 Última actualización:** 2024-01-15  
**🔧 Modificado por:** Sistema de configuración de comprobantes  
**📋 Estado:** Activo y funcionando
