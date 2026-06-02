# Floré Designs

Sistema web para el atelier de alta costura Floré Designs.
Desarrollado como proyecto de la materia Desarrollo Web Integral — IDGS 9-C.

## Descripción

Plataforma web que permite al atelier mostrar su portafolio de vestidos,
recibir solicitudes de citas y gestionar clientes mediante un panel de administración.

## Tecnologías

- Frontend: HTML, CSS, JavaScript
- Backend: PHP
- Base de datos: MySQL
- Control de versiones: Git + GitHub

## Flujo de trabajo — Feature Branch Workflow

El proyecto usa el modelo Feature Branch Workflow con las siguientes ramas:

- `main` — código estable listo para producción
- `develop` — rama de integración donde se prueban los cambios
- `feature/portafolio` — desarrollo del catálogo y filtros de vestidos
- `feature/citas` — formulario y gestión de citas
- `feature/admin` — panel de administración
- `feature/comentarios` — sección de comentarios con moderación

## Flujo de cambios

1. Se crea una rama feature a partir de develop
2. Se desarrolla y se hacen commits en esa rama
3. Se hace merge de la feature hacia develop
4. Cuando develop está estable, se hace merge hacia main

## Estructura del proyecto

flore-designs/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── api/
│   ├── login.php
│   └── citas.php
├── admin/
│   └── panel.php
├── uploads/
└── .gitignore