# 🚀 Panel de Administración - ElevenRifas

## 📋 Descripción

Este es el panel de administración completo para ElevenRifas, diseñado para gestionar todas las operaciones del sistema de rifas. El panel incluye gestión de usuarios, rifas, tickets, pagos, categorías y perfiles.

## 🏗️ Estructura del Proyecto

```
app/admin/
├── components/           # Componentes reutilizables
│   ├── tables/          # Tablas de datos
│   ├── data-table/      # Sistema de tablas avanzado
│   ├── app-sidebar.tsx  # Barra lateral de navegación
│   ├── site-header.tsx  # Encabezado del sitio
│   └── login-form.tsx   # Formulario de login
├── dashboard/           # Dashboard principal
├── rifas/              # Gestión de rifas
├── usuarios/           # Gestión de usuarios
├── tickets/            # Gestión de tickets
├── categorias/         # Gestión de categorías
├── perfiles/           # Gestión de perfiles
├── pagos/              # Gestión de pagos
└── layout.tsx          # Layout principal del admin
```

## 🚀 Características Principales

### ✨ Dashboard
- Estadísticas en tiempo real
- Resumen de actividades
- Navegación rápida a todas las secciones
- Métricas clave del sistema

### 🎛️ Gestión de Datos
- **Rifas**: Crear, editar, activar/desactivar rifas
- **Usuarios**: Administrar usuarios registrados
- **Tickets**: Gestionar venta y estado de tickets
- **Categorías**: Organizar rifas por categorías
- **Perfiles**: Gestionar roles y permisos
- **Pagos**: Verificar y aprobar pagos

### 🔐 Sistema de Autenticación
- Login seguro con Supabase
- Verificación de roles de administrador
- Protección de rutas con middleware
- Sesiones persistentes

### 📊 Tablas Avanzadas
- Búsqueda y filtrado
- Paginación
- Selección múltiple
- Exportación de datos
- Personalización de columnas

## 🛠️ Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` con las siguientes variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Base de datos
DATABASE_URL=your_database_url
```

### 2. Instalación de Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configuración de Base de Datos

Asegúrate de que tu base de datos Supabase tenga las siguientes tablas:

- `rifas` - Información de las rifas
- `usuarios` - Datos de usuarios
- `tickets` - Tickets vendidos
- `categorias` - Categorías de rifas
- `profiles` - Perfiles de usuarios
- `pagos` - Registro de pagos

### 4. Ejecutar el Proyecto

```bash
npm run dev
# o
yarn dev
```

## 🔑 Acceso al Panel

1. Navega a `/admin/login`
2. Ingresa las credenciales de administrador
3. Serás redirigido al dashboard principal

## 📱 Uso del Sistema

### Dashboard Principal
- **Estadísticas**: Visualiza métricas clave del sistema
- **Acciones Rápidas**: Acceso directo a funciones principales
- **Navegación**: Enlaces a todas las secciones

### Gestión de Rifas
- Crear nuevas rifas con título, descripción y precio
- Configurar número total de tickets
- Activar/desactivar rifas
- Monitorear ventas y estado

### Gestión de Usuarios
- Ver lista de usuarios registrados
- Editar información de usuarios
- Gestionar estados (activo/inactivo)
- Ver historial de compras

### Gestión de Tickets
- Ver todos los tickets vendidos
- Verificar estado de pagos
- Marcar tickets como usados
- Cancelar tickets si es necesario

### Gestión de Categorías
- Crear categorías para organizar rifas
- Asignar iconos y colores
- Activar/desactivar categorías
- Ver estadísticas de uso

### Gestión de Perfiles
- Administrar roles de usuario
- Configurar permisos
- Crear nuevos perfiles
- Gestionar accesos

### Gestión de Pagos
- Verificar pagos pendientes
- Aprobar o rechazar pagos
- Ver historial de transacciones
- Exportar reportes

## 🔧 Personalización

### Agregar Nuevas Tablas
1. Crea el componente de tabla en `components/tables/`
2. Agrega las funciones de base de datos en `lib/database/admin_database/`
3. Crea la página en `app/admin/`
4. Actualiza el sidebar y las exportaciones

### Modificar Estilos
- Los estilos están en archivos CSS separados
- Usa Tailwind CSS para modificaciones rápidas
- Los componentes UI están en `components/ui/`

### Agregar Funcionalidades
- Crea nuevos hooks en `hooks/`
- Agrega utilidades en `lib/utils.ts`
- Implementa validaciones en `lib/validations.ts`

## 🚨 Solución de Problemas

### Error de Autenticación
- Verifica las variables de entorno de Supabase
- Asegúrate de que el usuario tenga rol de administrador
- Revisa la consola del navegador para errores

### Error de Base de Datos
- Verifica la conexión a Supabase
- Revisa los permisos de las tablas
- Consulta los logs de la consola

### Error de Componentes
- Verifica que todas las dependencias estén instaladas
- Revisa la consola del navegador
- Asegúrate de que los imports sean correctos

## 📚 Recursos Adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Tailwind CSS](https://tailwindcss.com/docs)
- [Documentación de React Table](https://tanstack.com/table/v8)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para ElevenRifas**
