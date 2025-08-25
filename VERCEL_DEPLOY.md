# 🚀 Deploy en Vercel - Eleven Rifas

## Configuración Mínima

Este proyecto está configurado para hacer build en Vercel con la mínima configuración necesaria.

## Pasos para Deploy

### 1. Conectar con Vercel
- Ve a [vercel.com](https://vercel.com)
- Conecta tu repositorio de GitHub
- Selecciona este proyecto

### 2. Configurar Variables de Entorno
En tu proyecto de Vercel, agrega estas variables:

```bash
SUPABASE_URL=tu_url_de_supabase
SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

### 3. Deploy Automático
- Vercel detectará automáticamente que es un proyecto Next.js
- Usará el comando `npm run build` por defecto
- El build se ejecutará sin linting ni mangling para mayor velocidad

## Configuración del Proyecto

### Build Command
```bash
npm run build
```

### Output Directory
```
.next
```

### Framework
```
nextjs
```

## Características del Build

- ✅ **Sin linting**: Build más rápido
- ✅ **Sin mangling**: Mejor debugging
- ✅ **Logger mínimo**: Sin dependencias de toolbox
- ✅ **Imágenes no optimizadas**: Build más rápido
- ✅ **Output standalone**: Mejor para Vercel

## Solución de Problemas

### Error: Module not found
Si aparece "Can't resolve '@/toolbox/utils/logger'":
- El logger ya está migrado a `@/lib/utils/logger`
- No hay imports problemáticos en el código principal

### Build lento
- El build está optimizado para velocidad
- Se ignoran errores de TypeScript y ESLint
- Solo se incluyen archivos necesarios

## Archivos Excluidos del Build

- `toolbox/` - Solo para desarrollo local
- `scripts/` - Scripts de administración
- `docs/` - Documentación
- `*.md` - Archivos de markdown

## Soporte

Si tienes problemas con el build:
1. Verifica que las variables de entorno estén configuradas
2. Asegúrate de que Supabase esté funcionando
3. Revisa los logs de build en Vercel
