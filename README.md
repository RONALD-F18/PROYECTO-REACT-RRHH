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

## API y datos canónicos

Tras reset de BD en el backend, los selects y payloads deben alinearse con `GET /api/v1/catalogos`. Reglas resumidas en **[docs/DATOS-CANONICOS-SEEDERS.md](docs/DATOS-CANONICOS-SEEDERS.md)**.

## Instalación

```bash
npm install
npm run dev
```

## Docker

Solo el front (Vite).

```bash
docker compose up --build
```

Abre http://localhost:5173. Si cambias dependencias en `package.json` / `package-lock.json`, el volumen `app_node_modules` puede quedar desactualizado y Vite fallará al resolver paquetes nuevos (p. ej. `axios`). Actualiza el volumen con:

```bash
docker compose run --rm app npm ci
```

(o borra el volumen y reconstruye: `docker compose down -v` y luego `docker compose up --build`).

Si solo quieres forzar imagen nueva: `docker compose build --no-cache app`

**Si no carga la página:** el contenedor ya ejecuta `npm run dev`. No vuelvas a lanzar `npm run dev` con `docker exec` (un segundo Vite pasaría al puerto 5174 *dentro* del contenedor y el mapa `5173:5173` dejaría de coincidir). Reinicia el contenedor: `docker compose restart` o `docker compose down` y `docker compose up`. Si en Windows el puerto 5173 del PC está ocupado, cambia en `docker-compose.yml` a `"5175:5173"` y entra en http://localhost:5175.

## Peticiones en desarrollo

Con **`React.StrictMode`**, en desarrollo algunos efectos se ejecutan dos veces (puedes ver llamadas duplicadas en la pestaña Red). En **producción** no aplica.

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
