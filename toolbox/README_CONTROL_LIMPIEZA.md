# 🎛️ Control del Sistema de Limpieza Automática

## 📋 **Descripción**

Este conjunto de scripts te permite controlar fácilmente el sistema de limpieza automática de reservas expiradas que se ejecuta cada 2 minutos en tu aplicación Eleven Rifas.

## 🚀 **Scripts Disponibles**

### **1. 🎛️ `control-limpieza.js` - Script Principal (RECOMENDADO)**
Script interactivo con menú que te permite controlar todo desde un solo lugar.

```bash
# Ejecutar desde la raíz del proyecto
node toolbox/scripts/control-limpieza.js
```

**Opciones disponibles:**
- 📊 Ver estado actual del sistema
- 🛑 Pausar sistema de limpieza
- 🟢 Reactivar sistema de limpieza
- 📋 Ver instrucciones completas
- 🚪 Salir

### **2. 🛑 `detener-limpieza.js` - Pausar Sistema**
Script directo para pausar el sistema de limpieza.

```bash
node toolbox/scripts/detener-limpieza.js
```

### **3. 🟢 `reactivar-limpieza.js` - Reactivar Sistema**
Script directo para reactivar el sistema de limpieza.

```bash
node toolbox/scripts/reactivar-limpieza.js
```

### **4. 📊 `pausar-limpieza.js` - Ver Estado**
Script para verificar el estado actual del sistema.

```bash
node toolbox/scripts/pausar-limpieza.js
```

## 🛑 **Cómo Pausar el Sistema (Paso a Paso)**

### **Opción 1: Script Interactivo (RECOMENDADO)**
```bash
# 1. Ejecutar el script principal
node toolbox/scripts/control-limpieza.js

# 2. Seleccionar opción 2 (Pausar sistema)
# 3. Seguir las instrucciones en pantalla
```

### **Opción 2: Script Directo**
```bash
# 1. Ejecutar script de pausa
node toolbox/scripts/detener-limpieza.js

# 2. Seguir las instrucciones en pantalla
```

### **Opción 3: Manual**
```bash
# 1. Abrir app/layout.tsx
# 2. Buscar la línea: iniciarLimpiezaAutomatica(2);
# 3. Comentarla: // iniciarLimpiezaAutomatica(2);
# 4. Reiniciar la aplicación
```

## 🟢 **Cómo Reactivar el Sistema**

### **Opción 1: Script Interactivo (RECOMENDADO)**
```bash
# 1. Ejecutar el script principal
node toolbox/scripts/control-limpieza.js

# 2. Seleccionar opción 3 (Reactivar sistema)
# 3. Seguir las instrucciones en pantalla
```

### **Opción 2: Script Directo**
```bash
# 1. Ejecutar script de reactivación
node toolbox/scripts/reactivar-limpieza.js

# 2. Seguir las instrucciones en pantalla
```

## 📁 **Archivos de Configuración**

### **`.limpieza-pausada`**
Archivo que indica que el sistema está pausado:
```json
{
  "pausado": true,
  "pausado_el": "2024-01-15T10:30:00.000Z",
  "motivo": "Pausado por solicitud del usuario",
  "instrucciones": [...]
}
```

### **`app/layout.tsx`**
Archivo principal donde se controla el sistema:
```typescript
// Línea activa (sistema funcionando):
iniciarLimpiezaAutomatica(2); // Cada 2 minutos

// Línea comentada (sistema pausado):
// iniciarLimpiezaAutomatica(2); // PAUSADO TEMPORALMENTE
```

## 🔍 **Verificación del Estado**

### **Ver Estado Actual**
```bash
# Opción 1: Script interactivo
node toolbox/scripts/control-limpieza.js
# Seleccionar opción 1

# Opción 2: Script directo
node toolbox/scripts/pausar-limpieza.js
```

### **Verificar en el Código**
```bash
# Buscar en app/layout.tsx
grep "iniciarLimpiezaAutomatica" app/layout.tsx

# Ver archivo de configuración
cat .limpieza-pausada
```

## ⚠️ **Consideraciones Importantes**

### **🔄 Reinicio Requerido**
- **Después de pausar:** Debes reiniciar la aplicación para que tome efecto
- **Después de reactivar:** Debes reiniciar la aplicación para que tome efecto

### **📝 Cambios en Archivos**
- Los scripts modifican automáticamente `app/layout.tsx`
- Se crea/elimina el archivo `.limpieza-pausada`
- **Hacer commit de los cambios** si quieres mantener el estado

### **🚨 Estado Temporal**
- El sistema se reactivará automáticamente si:
  - Haces un nuevo deploy
  - Clonas el repositorio en otra máquina
  - No haces commit de los cambios

## 🧪 **Pruebas del Sistema**

### **Verificar Funcionamiento**
```bash
# 1. Ejecutar script de estado
node toolbox/scripts/pausar-limpieza.js

# 2. Verificar logs de la aplicación
# Buscar: "🧹 INICIANDO SISTEMA DE LIMPIEZA AUTOMÁTICA"

# 3. Verificar endpoint de administración
curl http://localhost:3000/api/admin/estado-sistema
```

### **Simular Limpieza Manual**
```bash
# Ejecutar limpieza manual
curl -X POST http://localhost:3000/api/limpiar-reservas
```

## 🆘 **Solución de Problemas**

### **Error: "No se puede conectar al servidor"**
- Asegúrate de que la aplicación esté ejecutándose
- Verifica que esté en el puerto 3000

### **Error: "No se puede modificar el archivo"**
- Verifica permisos de escritura
- Asegúrate de que el archivo no esté abierto en otro editor
- Ejecuta el script desde la raíz del proyecto

### **Sistema no se pausa/reactiva**
- Verifica que hayas reiniciado la aplicación
- Revisa los logs de la aplicación
- Usa el script de verificación de estado

## 📚 **Comandos de Referencia Rápida**

```bash
# 🎛️ Control completo (RECOMENDADO)
node toolbox/scripts/control-limpieza.js

# 🛑 Pausar rápidamente
node toolbox/scripts/detener-limpieza.js

# 🟢 Reactivar rápidamente
node toolbox/scripts/reactivar-limpieza.js

# 📊 Ver estado
node toolbox/scripts/pausar-limpieza.js

# 🔍 Verificar en código
grep "iniciarLimpiezaAutomatica" app/layout.tsx
```

## 🎯 **Recomendación**

**Usa siempre `control-limpieza.js`** ya que es el script más completo y te permite:
- Ver el estado actual
- Pausar/reactivar el sistema
- Obtener instrucciones claras
- Evitar errores comunes
