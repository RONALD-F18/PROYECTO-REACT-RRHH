# Datos canónicos (BD reseteada + seeders)

Aviso del backend tras reset de base de datos con seeders alineados. El frontend **no debe hardcodear enums** salvo fallbacks mínimos en `src/services/catalogos.js` si falla `GET /catalogos`.

## Fuente única de selects

```
GET /api/v1/catalogos
```

Autenticado (`Authorization: Bearer {token}`). Cargar post-login vía `CatalogosProvider` (`src/contextos/CatalogosContext.jsx`).

## Valores canónicos por dominio

| Dominio | Campo / lista | Valores canónicos (enviar tal cual) |
|---------|----------------|-------------------------------------|
| Empleados | `sexo` | `Masculino`, `Femenino`, `Otro` (Pascal case). **No** `MASCULINO`. |
| Empleados | PATCH | Solo campos que cambian. Ej.: `{ "sexo": "Femenino" }` es válido solo. |
| Afiliaciones | `estado_afiliacion` | `Activa`, `Inactiva`, `Suspendida`. **No** `ACTIVA`. |
| Afiliaciones | `tipo_regimen` | `Contributivo` (único en seeders actuales). |
| Incapacidades | `estado_incapacidad` | `Activa`, `Finalizada`, `Cancelada` |
| Incapacidades | clasificación | Solo `cod_clasificacion_enfermedad` del catálogo (`clasificaciones_enfermedad`) |
| Comunicaciones | `tipo_comunicacion` | Solo `Memorando` |

## Implementación en este repo

| Regla | Dónde |
|-------|--------|
| Catálogos globales | `src/services/catalogos.js`, `CATALOGOS_FALLBACK` |
| Sexo Pascal + PATCH parcial | `src/services/catalogos.js` (`normalizarSexoEmpleadoCanonico`), `ModalEmpleado.jsx` |
| Afiliaciones payload | `src/utils/afiliacionEstado.js`, `ModalAfiliacion.jsx` |
| Incapacidades | `src/modulos/incapacidades/componentes/ModalIncapacidad.jsx` (`cod_clasificacion_enfermedad`) |
| Comunicaciones | `src/modulos/comunicacionesDisciplinarias/disciplinariasConstants.js` |

## Detalle completo (backend)

Ver en el repositorio Laravel: `docs/DATOS-CANONICOS-SEEDERS.md`.

## Checklist tras deploy backend

1. Cerrar sesión y volver a entrar (recarga catálogos).
2. Verificar selects de sexo: Masculino / Femenino / Otro.
3. Editar empleado cambiando solo sexo → PATCH con un solo campo.
4. Afiliación nueva → `estado_afiliacion: "Activa"`, `tipo_regimen: "Contributivo"`.
5. Incapacidad → clasificación por ID del catálogo, no texto libre.
6. Comunicación → solo tipo Memorando.
