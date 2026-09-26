# Arquitectura de Software y Patrones de Diseño — Floré Designs

## 1. Arquitectura de software

Se mantiene la arquitectura cliente-servidor de tres capas justificada en el documento **P1 Actividad 4** (sección 6):

- **Presentación:** HTML semántico, CSS propio, JavaScript en el navegador.
- **Lógica de negocio:** endpoints PHP en `api/`, que reciben peticiones, validan datos, gestionan sesión y devuelven JSON.
- **Datos:** MySQL, con esquema normalizado (`api/config/schema.sql`).

Esta decisión se mantiene por las mismas razones documentadas entonces: es un proyecto de alcance acotado, con un equipo de una persona, donde una arquitectura de microservicios introduciría complejidad de orquestación innecesaria (ver P1A4, sección 6.2).

### Framework frontend

Se optó por **no** adoptar un framework de backend pesado (Laravel, Symfony) para no arriesgar la estabilidad de la autenticación y sesiones ya construidas y probadas, a pocos días de la entrega. En su lugar:

- **Backend:** PHP estructurado en capas propias, con un núcleo común reutilizable (`api/config/database.php`) que centraliza conexión a base de datos, manejo de sesión, headers de seguridad y respuestas JSON estandarizadas — un enfoque de "micro-framework" propio y ligero.
- **Frontend:** se integra **Bootstrap 5** (vía CDN) como framework CSS/JS moderno, usado en el componente de ubicación del atelier (`ubicacion.html`: Card y Button de Bootstrap). Se aisló dentro de un `<iframe>` para no interferir con el CSS propio ya construido en el resto del sitio — una decisión deliberada de bajo riesgo, consistente con no modificar interfaces ya terminadas y validadas por el usuario.

---

## 2. Patrones de diseño aplicados

### 2.1 Singleton — conexión a base de datos

**Dónde:** `api/config/database.php`, clase `Database`.

```php
class Database {
    private static ?PDO $conexion = null;
    public static function conectar(): PDO {
        if (self::$conexion !== null) return self::$conexion;
        // ... crea la conexión solo la primera vez
    }
}
```

**Por qué:** cada request PHP es de por sí un proceso de vida corta, pero dentro de ese mismo request pueden llamarse varios endpoints o funciones que necesitan la base de datos (por ejemplo, `usuarioAutenticado()` y el resto de la lógica del endpoint). El patrón Singleton garantiza que solo se abra **una** conexión PDO por request, evitando conexiones redundantes y centralizando la configuración de la conexión en un solo punto.

### 2.2 Module Pattern — cliente de autenticación en el frontend

**Dónde:** `js/auth.api.js`.

```javascript
const auth = (() => {
    let currentUser = null;   // privado, no accesible desde fuera
    let sessionReady = false; // privado

    async function login(email, password) { /* ... */ }
    function isLoggedIn() { /* ... */ }

    return {              // API pública, solo lo que se expone
        login,
        isLoggedIn,
        getCurrentUser,
        // ...
    };
})();
```

**Por qué:** el estado de sesión (`currentUser`, `sessionReady`) no debe ser modificable directamente desde cualquier script del sitio — solo a través de las funciones controladas (`login`, `logout`, `saveUser`). El patrón de módulo (una función auto-invocada que retorna un objeto con la API pública) logra encapsulamiento en JavaScript sin necesidad de clases ni un framework, y es el mismo principio que usan librerías como jQuery internamente.

### 2.3 Capas de responsabilidad (arquitectura en capas / MVC ligero)

Aunque no se usa un framework MVC formal, el proyecto separa responsabilidades de forma equivalente:

| Capa MVC | Equivalente en el proyecto |
|---|---|
| Modelo | Tablas de `schema.sql` + las consultas SQL dentro de cada endpoint |
| Vista | Archivos `.html` + `css/styles.css` |
| Controlador | Endpoints en `api/auth/*.php`, que reciben la petición, validan (`api/lib/validators.php`) y coordinan la respuesta |

Esta separación permite, por ejemplo, cambiar el diseño visual (`css/styles.css`) sin tocar la lógica de negocio, o cambiar una validación (`validators.php`) sin tocar el HTML — la misma ventaja que ya justificaste en P1A4 para la arquitectura en capas, aplicada ahora a nivel de patrón dentro de cada capa.

---

## 3. Por qué no se usaron más patrones formales (ej. Repository, Factory)

Dado el tamaño del proyecto (un equipo de una persona, alcance de un cuatrimestre), añadir patrones adicionales como Repository o Factory hubiera significado una capa de abstracción adicional sin un beneficio real todavía — son patrones que se justifican cuando el número de fuentes de datos o de tipos de objetos a crear crece lo suficiente como para que la indirección pague su costo. Se documenta como posible siguiente paso si el proyecto creciera (por ejemplo, si se agregara otra fuente de datos además de MySQL).
