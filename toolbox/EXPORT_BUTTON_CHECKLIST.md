# ✅ CHECKLIST: Botón Exportar Funcionando

## 🎯 Objetivo
Verificar que el botón de exportar esté **siempre disponible** y funcione correctamente en todas las tablas estandarizadas.

## 📋 Checklist de Verificación

### 1. Props del Componente
- [ ] **NO** usar `exportDisabled: selectedRows.length === 0`
- [ ] **NO** usar `exportDisabled: true`
- [ ] ✅ Usar `exportDisabled: false` o simplemente omitir la prop

### 2. Configuración de headerActions
- [ ] **NO** usar `showWhen: { hasSelection: true }`
- [ ] **NO** usar `disabled: selectedRows.length === 0`
- [ ] ✅ Label dinámico: `selectedRows.length > 0 ? "Exportar (N)" : "Exportar Todo"`
- [ ] ✅ Acción siempre visible y habilitada

### 3. Función handleExport
- [ ] ✅ Verificar si hay selección: `selectedRows.length > 0`
- [ ] ✅ Exportar seleccionados si los hay: `selectedRows`
- [ ] ✅ Exportar todos si no hay selección: `data`
- [ ] ✅ Manejo de errores con try-catch
- [ ] ✅ Logging para debugging

### 4. Comportamiento Esperado
- [ ] ✅ Botón visible siempre (con o sin selección)
- [ ] ✅ Botón habilitado siempre
- [ ] ✅ Label cambia según contexto
- [ ] ✅ Exporta datos correctos según selección

## 🔍 Verificación por Tabla

### RifasTable ✅
- [x] Props correctas
- [x] headerActions correcto
- [x] handleExport funcional
- [x] Comportamiento esperado

### CategoriasRifasTable ✅
- [x] Props correctas
- [x] headerActions correcto
- [x] handleExport funcional
- [x] Comportamiento esperado

### TicketsTable ⏳
- [ ] Migrar a DataTableEnhanced
- [ ] Verificar configuración del botón exportar
- [ ] Implementar handleExport correcto

### PagosTable ⏳
- [ ] Migrar a DataTableEnhanced
- [ ] Verificar configuración del botón exportar
- [ ] Implementar handleExport correcto

### ProfilesTable ⏳
- [ ] Migrar a DataTableEnhanced
- [ ] Verificar configuración del botón exportar
- [ ] Implementar handleExport correcto

### UsuariosTable ⏳
- [ ] Migrar a DataTableEnhanced
- [ ] Verificar configuración del botón exportar
- [ ] Implementar handleExport correcto

## 🚨 Problemas Comunes

### 1. Botón Bloqueado
**Síntoma**: El botón exportar no se puede hacer clic
**Causa**: `exportDisabled: selectedRows.length === 0`
**Solución**: Remover la prop o usar `exportDisabled: false`

### 2. Botón Invisible
**Síntoma**: El botón exportar no aparece
**Causa**: `showWhen: { hasSelection: true }`
**Solución**: Remover la condición o usar `showWhen: { always: true }`

### 3. Botón Deshabilitado
**Síntoma**: El botón exportar aparece pero está gris
**Causa**: `disabled: selectedRows.length === 0`
**Solución**: Remover la condición disabled

### 4. Exportación Incorrecta
**Síntoma**: Solo exporta datos seleccionados
**Causa**: Lógica incorrecta en handleExport
**Solución**: Implementar lógica condicional correcta

## 📝 Código de Referencia

### Configuración Correcta
```tsx
// ✅ CORRECTO
<DataTableEnhanced
  // ... otras props
  onExport={handleExport}
  // NO usar exportDisabled
/>

// ✅ CORRECTO en headerActions
{
  key: "export",
  label: selectedRows.length > 0 ? `Exportar (${selectedRows.length})` : "Exportar Todo",
  icon: () => <div className="h-4 w-4 mr-2">↓</div>,
  variant: "outline",
  onClick: handleExport
  // NO usar showWhen ni disabled
}

// ✅ CORRECTO en handleExport
const handleExport = () => {
  try {
    if (onExport) {
      const dataToExport = selectedRows.length > 0 ? selectedRows : data
      onExport(dataToExport)
      console.log(`🔄 Exportando ${dataToExport.length} elementos`)
    }
  } catch (error) {
    console.error('Error al exportar:', error)
  }
}
```

## 🎯 Próximos Pasos

1. **Completar migración** de tablas restantes
2. **Verificar** configuración del botón exportar en cada tabla
3. **Implementar** handleExport correcto en todas las tablas
4. **Testear** funcionalidad de exportación
5. **Documentar** cualquier problema encontrado

---

**Última actualización**: $(date)
**Estado**: En progreso
**Responsable**: Equipo de desarrollo

