# Planificación Ágil (Scrum) — Floré Designs

## Metodología seleccionada: Scrum

Se eligió Scrum sobre Kanban porque el desarrollo del proyecto ya estaba naturalmente dividido en entregas con un objetivo claro y una fecha límite por cada una (equivalente a un Sprint con su Sprint Goal), en vez de un flujo continuo sin cortes — que es donde Kanban brilla más.

### Roles (equipo de una persona)

En un proyecto académico individual, los tres roles de Scrum recaen en la misma persona, con sombreros distintos:

| Rol | Responsable |
|---|---|
| Product Owner | Julia Alba López (representando también al cliente ficticio: el atelier Floré Designs) |
| Scrum Master | Julia Alba López |
| Equipo de desarrollo | Julia Alba López |

---

## Product Backlog

Historias de usuario derivadas de los requerimientos funcionales definidos en **P1 Actividad 4**, priorizadas por valor para el caso de estudio (el atelier necesita, en orden: mostrarse, recibir citas, gestionar todo desde un panel, y dar confianza con reseñas).

| ID | Historia de usuario | RF relacionado | Prioridad |
|---|---|---|---|
| HU-01 | Como visitante, quiero ver el portafolio de vestidos con imágenes reales y filtrarlo por categoría, para decidir si el atelier me interesa | RF-01 | Alta |
| HU-02 | Como visitante, quiero registrarme e iniciar sesión, para poder agendar una cita | RF-02 | Alta |
| HU-03 | Como cliente, quiero agendar una cita indicando tipo de consulta y fecha, para coordinar con el atelier sin mensajes informales | RF-03 | Alta |
| HU-04 | Como cliente, quiero dejar un comentario sobre mi experiencia, para ayudar a otras futuras clientas a confiar en el atelier | RF-04 | Media |
| HU-05 | Como administrador, quiero un panel protegido donde gestionar vestidos, citas y comentarios, sin depender de herramientas externas | RF-05 | Alta |
| HU-06 | Como cliente, quiero ver el pronóstico del clima para la fecha de mi cita, para planear si será apta para fotos al aire libre | (mejora, fuera de P1A4 original) | Media |
| HU-07 | Como desarrolladora, quiero pruebas automatizadas sobre la lógica crítica, para detectar errores antes de que lleguen a producción | (no funcional) | Media |

---

## Sprints (mapeados al historial real de Git)

Cada sprint corresponde a un bloque real de trabajo, visible en las ramas y commits del repositorio.

### Sprint 0 — Especificación y control de versiones
**Objetivo del sprint:** definir qué se va a construir y cómo se va a versionar, antes de escribir código de más funcionalidades.
**Entregables:** P1 Actividad 4 (RF/RNF, arquitectura, diagramas UML, prototipo) y P1 Actividad 5 (Git + GitHub, Feature Branch Workflow).
**Estado:** ✅ Completado.

### Sprint 1 — Núcleo funcional: portafolio, citas y comentarios
**Objetivo del sprint:** que un visitante pueda ver el portafolio real, entender qué piezas puede encargar, y dejar/ver comentarios.
**Historias cubiertas:** HU-01, HU-04.
**Tareas (rama → commit):**
- `feature/portafolio` → Conectar imágenes reales, etiquetar disponibilidad, corregir CTA del modal.
- `feature/comentarios` → Mostrar imágenes reales en el inicio, conectar comentarios a la sesión real.
- `feature/citas` → Prellenar formulario de cita desde el botón "Quiero algo similar".
**Estado:** ✅ Completado.

### Sprint 2 — Autenticación y seguridad de acceso
**Objetivo del sprint:** que el login, registro y control de roles funcionen de extremo a extremo, de forma segura.
**Historias cubiertas:** HU-02, HU-05 (parcial).
**Tareas (rama → commit):**
- `feature/autenticacion` → Reconstruir autenticación con sesiones PHP + MySQL, sin JWT ni MFA.
- `feature/admin-seguro` → Eliminar login público de administrador; el acceso se decide por rol de sesión.
**Estado:** ✅ Completado.

### Sprint 3 — Estabilización (corrección de bugs encontrados en pruebas)
**Objetivo del sprint:** corregir errores reales encontrados al probar el sistema con datos y sesiones reales.
**Historias cubiertas:** HU-02 (correcciones), HU-07 (inicio).
**Tareas (rama → commit):**
- `fix/conexion-bd-host-puerto` → Corregir bug de conexión PDO cuando `DB_HOST` incluye puerto.
- `fix/carrera-sesion-perfil` → Corregir condición de carrera que bloqueaba "Mis datos" a usuarios ya logueados.
**Estado:** ✅ Completado.

### Sprint 4 — Servicios web, framework frontend y documentación final
**Objetivo del sprint:** integrar un servicio de terceros, sumar un framework frontend de bajo riesgo, y dejar documentado el proyecto para la entrega.
**Historias cubiertas:** HU-06, HU-07.
**Tareas (rama → commit):**
- `feature/clima-openweather` → Integrar OpenWeatherMap para mostrar el pronóstico del clima en la fecha de la cita (se descartó Google Maps por requerir tarjeta de crédito incluso en su capa gratuita).
- `feature/bootstrap-ubicacion` → Integrar Bootstrap 5 de forma aislada en la tarjeta de Ubicación.
- `feature/pruebas` → Pruebas unitarias con PHPUnit + documentación del esquema de pruebas.
- `docs/arquitectura-patrones`, `docs/planificacion-agil` → Documentación técnica final.
**Estado:** 🔄 En curso (esta misma entrega).

---

## Tablero (equivalente Kanban del estado actual)

| To Do | In Progress | Done |
|---|---|---|
| Manual de usuario | Documentación técnica consolidada | Sprint 0, 1, 2, 3 completos |
| Despliegue en hosting público | Video en inglés (API propia + terceros) | Sprint 4 (servicios web + Bootstrap + pruebas) |
| Ejecutar pruebas funcionales pendientes (ver `docs/PRUEBAS.md`) | | |
