# Talent Sphere

Sistema de gestión de recursos humanos construido con React y Vite.

## Estructura

El proyecto está organizado en carpetas por tipo de archivo. Los componentes reutilizables van en `componentes/comunes`, mientras que los componentes específicos de cada módulo se guardan dentro de su propia carpeta `componentes`.

Los estilos están centralizados en la carpeta `estilos`, separados por tipo: componentes comunes, layout y estilos específicos de cada módulo.

```
src/
├── componentes/
│   ├── comunes/
│   ├── layout/
│   └── index.js
├── modulos/
│   ├── autenticacion/
│   ├── dashboard/
│   ├── empleados/
│   ├── usuarios/
│   └── ...
├── rutas/
├── estilos/
└── App.jsx
```

## Instalación

```bash
npm install
npm run dev
```

## Rutas principales

- `/` - Página de inicio
- `/login` - Inicio de sesión
- `/dashboard` - Panel principal
- `/empleados` - Gestión de empleados
- `/usuarios` - Administración de usuarios
- `/incapacidades` - Control de incapacidades
- `/prestaciones` - Prestaciones sociales

## Convenciones de código

- Componentes en PascalCase
- Variables en camelCase
- Clases CSS en español con guiones
- Archivos de componentes en PascalCase
