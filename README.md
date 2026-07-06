# Floré Designs

Sistema web para el atelier de alta costura Floré Designs. Desarrollado como
proyecto de la materia Desarrollo Web Integral — IDGS 9-C.

## Descripción

Plataforma que permite al atelier mostrar su portafolio de vestidos, recibir
solicitudes de citas y gestionar clientes mediante un panel de administración.

## Tecnologías

- Frontend: HTML, CSS, JavaScript
- Backend: PHP (sesiones nativas, sin JWT ni MFA — ver `docs/`)
- Base de datos: MySQL (ver `api/config/schema.sql`)
- Control de versiones: Git + GitHub

## Flujo de trabajo (Feature Branch Workflow)

- `main`: código estable listo para producción.
- `develop`: rama de integración y pruebas.
- `feature/portafolio`: catálogo de vestidos con filtros por categoría.
- `feature/citas`: formulario y gestión de citas.
- `feature/admin`: panel de administración.
- `feature/comentarios`: sección de comentarios con moderación.
- `feature/autenticacion`: registro, login, sesiones PHP y roles.
- `feature/admin-seguro`: elimina el login público de administrador; el acceso al panel se decide por el rol de la sesión, no por un formulario separado.

## Cómo funciona el acceso de administrador

No existe un formulario de login separado para administradores. Cualquier
persona con una cuenta cuyo `rol` sea `administrador` en la base de datos
inicia sesión con el mismo formulario que un cliente. El sistema detecta el
rol automáticamente y muestra la opción "Panel Admin" en el menú.

Para convertir una cuenta en administrador:
```sql
UPDATE usuarios SET rol = 'administrador' WHERE email = 'tu_correo@ejemplo.com';
```

## Servicios web integrados

### API propia (REST)
Endpoints en `api/auth/` para autenticación, con sesiones PHP nativas:

| Endpoint | Método | Descripción |
|---|---|---|
| `api/auth/register.php` | POST | Registra un nuevo cliente (RF-02.1, RF-02.2) |
| `api/auth/login.php` | POST | Inicia sesión y valida el rol activo (RF-02.3, RF-02.4) |
| `api/auth/logout.php` | POST | Cierra la sesión activa (RF-02.5) |
| `api/auth/session.php` | GET | Devuelve el usuario autenticado en la sesión actual |
| `api/maps/config.php` | GET | Expone la API key de Google Maps de forma centralizada |

### API de terceros
**Google Maps JavaScript API** — muestra la ubicación real del atelier con un mapa interactivo y botón de direcciones en `citas.html`. Ver `js/maps.js`.

## Cómo correr el proyecto localmente

1. Instala XAMPP (o equivalente) con PHP 8+ y MySQL.
2. Crea la base de datos y ejecuta `api/config/schema.sql`.
3. Copia `.env.example` a `.env` y ajusta `DB_HOST`, `DB_USER`, `DB_PASS` a tu MySQL local.
4. Para el mapa de ubicación en `citas.html`, agrega tu propia `MAPS_API_KEY` en `.env` (consíguela en https://console.cloud.google.com/google/maps-apis y restríngela por dominio).
5. Coloca el proyecto en `htdocs/` (o la carpeta pública de tu servidor).
6. Regístrate desde el sitio; para volverte administrador ejecuta:
   `UPDATE usuarios SET rol='administrador' WHERE email='tu_correo@ejemplo.com';`
