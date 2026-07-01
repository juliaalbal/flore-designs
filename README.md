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

## Cómo correr el proyecto localmente

1. Instala XAMPP (o equivalente) con PHP 8+ y MySQL.
2. Crea la base de datos y ejecuta `api/config/schema.sql`.
3. Copia `.env.example` a `.env` y ajusta `DB_HOST`, `DB_USER`, `DB_PASS` a tu MySQL local.
4. Coloca el proyecto en `htdocs/` (o la carpeta pública de tu servidor).
5. Regístrate desde el sitio; para volverte administrador ejecuta:
   `UPDATE usuarios SET rol='administrador' WHERE email='tu_correo@ejemplo.com';`
