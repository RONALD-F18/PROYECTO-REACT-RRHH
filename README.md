# Talent Sphere - Sistema de Gestión de RRHH

Sistema de gestión de recursos humanos desarrollado con React + Vite.

## 📁 Estructura del Proyecto

```
src/
├── componentes/              # Componentes reutilizables
│   ├── comunes/             # Componentes genéricos (toda la app)
│   │   ├── TablaDatos.jsx
│   │   ├── CampoFormulario.jsx
│   │   ├── TarjetaInfo.jsx
│   │   ├── EncabezadoModulo.jsx
│   │   └── index.js
│   ├── layout/              # Estructura general
│   │   ├── BarraLateral.jsx
│   │   ├── ContenedorPrincipal.jsx
│   │   └── index.js
│   └── index.js
│
├── modulos/                  # Módulos/páginas de la aplicación
│   ├── autenticacion/       # Login, Registro
│   │   ├── componentes/     # Componentes SOLO de este módulo
│   │   ├── InicioSesion.jsx
│   │   ├── Registro.jsx
│   │   └── index.js
│   ├── dashboard/
│   │   ├── componentes/     # Componentes SOLO del dashboard
│   │   ├── Panel.jsx
│   │   └── index.js
│   ├── empleados/
│   ├── usuarios/
│   ├── prestaciones/
│   ├── inicio/              # Landing page
│   └── index.js
│
├── rutas/                    # Configuración de rutas
│   ├── EnrutadorPrincipal.jsx
│   └── index.js
│
├── estilos/                  # TODOS los CSS van aquí
│   ├── variables.css        # Variables CSS globales
│   ├── base.css             # Reset y estilos base
│   ├── componentes/         # Estilos de componentes comunes
│   │   ├── botones.css
│   │   ├── etiquetas.css
│   │   ├── filtros.css
│   │   ├── tarjetas.css
│   │   ├── tabla-datos.css
│   │   ├── campo-formulario.css
│   │   ├── tarjeta-info.css
│   │   └── encabezado-modulo.css
│   ├── layout/              # Estilos de layout
│   │   ├── barra-lateral.css
│   │   └── contenedor.css
│   ├── modulos/             # Estilos específicos por módulo
│   │   ├── autenticacion.css
│   │   ├── dashboard.css
│   │   └── inicio.css
│   └── index.css            # Importa todos los estilos
│
├── recursos/                 # Assets (imágenes, íconos)
├── App.jsx
└── main.jsx
```

## 🎯 Organización

### Componentes Comunes (`/componentes/comunes`)
Componentes reutilizables en TODA la aplicación:
- `TablaDatos` - Tabla genérica con acciones
- `CampoFormulario` - Inputs, selects, textareas
- `TarjetaInfo` - Tarjetas de información
- `EncabezadoModulo` - Header de cada módulo

### Componentes de Módulo (`/modulos/*/componentes`)
Componentes que SOLO se usan en un módulo específico.

### Estilos (`/estilos`)
TODOS los CSS están centralizados aquí:
- `variables.css` - Colores, espaciados, fuentes
- `componentes/` - CSS de componentes comunes
- `layout/` - CSS de sidebar, contenedor
- `modulos/` - CSS específico de cada página

## 🚀 Instalación

```bash
npm install
npm run dev
```

## 📋 Rutas

| Ruta | Módulo |
|------|--------|
| `/` | Landing page |
| `/login` | Inicio de sesión |
| `/registro` | Registro de usuario |
| `/dashboard` | Panel principal |
| `/empleados` | Gestión de empleados |
| `/usuarios` | Gestión de usuarios |
| `/prestaciones` | Prestaciones sociales |

## 🎨 Convenciones

- **Componentes**: PascalCase en español
- **Variables**: camelCase en español
- **CSS**: Clases en español con guiones
- **Archivos**: PascalCase para componentes
