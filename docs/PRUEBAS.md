# Esquema de Pruebas — Floré Designs

## Esquema seleccionado

Se aplican dos niveles de prueba, elegidos según lo que cada uno puede cubrir de forma realista en este proyecto:

1. **Pruebas unitarias** (PHPUnit) sobre la lógica de validación pura del backend (`api/lib/validators.php`) — funciones sin dependencia de base de datos ni sesión, ideales para probarse de forma aislada y rápida.
2. **Pruebas funcionales manuales** sobre los flujos completos de usuario (registro, login, citas, panel admin, pronóstico del clima) — porque estos flujos dependen de sesión PHP, base de datos y del navegador, y una prueba manual estructurada es más representativa del uso real que un mock complejo.

No se usaron pruebas de integración automatizadas (ej. contra una base de datos de prueba) por el tiempo disponible del proyecto; queda documentado como una mejora futura.

---

## 1. Pruebas unitarias (PHPUnit)

**Archivo:** `tests/ValidatorsTest.php`
**Cubre:** `api/lib/validators.php` (`esCorreoValido`, `esPasswordValida`, `camposObligatoriosCompletos`), usadas por `api/auth/register.php` y `api/auth/login.php`.

### Cómo ejecutarlas

No requieren Composer, solo el `.phar` de PHPUnit:

1. Descarga `phpunit.phar` desde https://phar.phpunit.de/ (versión compatible con tu PHP; PHPUnit 10 requiere PHP 8.1+, XAMPP moderno ya lo trae).
2. Colócalo en la raíz del proyecto (junto a `phpunit.xml`).
3. Desde la terminal, en la carpeta del proyecto:
   ```
   C:\xampp\php\php.exe phpunit.phar
   ```
   (usa `phpunit.xml`, que ya apunta a la carpeta `tests/`, así que no hace falta ningún argumento extra).

### Casos de prueba incluidos

| Caso | Función probada | Entrada | Resultado esperado |
|---|---|---|---|
| `testCorreoValidoDevuelveTrue` | `esCorreoValido` | `cliente@floredesigns.com` | `true` |
| `testCorreoSinArrobaDevuelveFalse` | `esCorreoValido` | `clientefloredesigns.com` | `false` |
| `testCorreoSinDominioDevuelveFalse` | `esCorreoValido` | `cliente@` | `false` |
| `testCorreoVacioDevuelveFalse` | `esCorreoValido` | `''` | `false` |
| `testPasswordConSeisCaracteresEsValida` | `esPasswordValida` | `123456` | `true` |
| `testPasswordConMenosDeSeisCaracteresNoEsValida` | `esPasswordValida` | `12345` | `false` |
| `testPasswordVaciaNoEsValida` | `esPasswordValida` | `''` | `false` |
| `testPasswordRespetaMinimoPersonalizado` | `esPasswordValida` | `12345678` / `1234567890`, mínimo 10 | `false` / `true` |
| `testTodosLosCamposPresentesDevuelveTrue` | `camposObligatoriosCompletos` | `['Julia','julia@correo.com','123456']` | `true` |
| `testUnCampoVacioDevuelveFalse` | `camposObligatoriosCompletos` | `['Julia','','123456']` | `false` |
| `testCampoConSoloEspaciosCuentaComoVacio` | `camposObligatoriosCompletos` | `['Julia','   ','123456']` | `false` |
| `testArregloVacioDevuelveTrue` | `camposObligatoriosCompletos` | `[]` | `true` |

**⚠️ Importante:** estas 12 pruebas se verificaron lógicamente contra la implementación de `validators.php` (trazadas a mano), pero **debes ejecutarlas tú misma con `phpunit.phar` antes de entregar** y pegar aquí la salida real de la terminal (ej. `OK (12 tests, 12 assertions)`), ya que este entorno no tiene PHP disponible para correrlas y confirmar el resultado real.

**Resultado de la ejecución real:** _(pega aquí la salida de tu terminal después de correr `phpunit.phar`)_

```
[PENDIENTE - ejecutar y pegar aquí]
```

---

## 2. Pruebas funcionales manuales

Cada prueba describe un flujo completo tal como lo usaría una persona real. El estado refleja lo verificado hasta ahora durante el desarrollo.

| ID | Flujo probado | Pasos | Resultado esperado | Estado |
|---|---|---|---|---|
| FT-01 | Registro de cliente nuevo | Ir a "Registrarse", llenar formulario, enviar | Cuenta creada, sesión iniciada automáticamente | ✅ Confirmado |
| FT-02 | Login con credenciales correctas | Iniciar sesión con correo/contraseña ya registrados | Sesión iniciada, menú actualizado | ✅ Confirmado |
| FT-03 | Login con credenciales incorrectas | Iniciar sesión con contraseña equivocada | Mensaje de error, sesión NO se inicia | ⏳ Pendiente de ejecutar |
| FT-04 | Acceso a "Mis datos" como cliente logueado | Iniciar sesión como cliente, ir a perfil.html | Debe mostrar el perfil, NO "Acceso Restringido" | 🔧 Falló inicialmente (condición de carrera), corregido — pendiente de reconfirmar |
| FT-05 | Acceso a admin.html sin sesión | Sin iniciar sesión, entrar directo a la URL admin.html | Redirige a index.html con aviso | ⏳ Pendiente de ejecutar |
| FT-06 | Acceso a admin.html como administrador real | Login con cuenta rol=administrador, entrar a admin.html | Panel visible | ⏳ Pendiente de ejecutar |
| FT-07 | Acceso a admin.html como cliente normal | Login como cliente, intentar entrar a admin.html por URL | Redirige a index.html, NO muestra el panel | ⏳ Pendiente de ejecutar |
| FT-08 | Filtro de portafolio por categoría | En portafolio.html, hacer clic en "Novias" | Solo se muestran vestidos de esa categoría | ⏳ Pendiente de ejecutar |
| FT-09 | Botón "Quiero algo similar" | Abrir un vestido disponible, hacer clic en el botón | Redirige a citas.html con tipo y prenda prellenados | ⏳ Pendiente de ejecutar |
| FT-10 | Pronóstico del clima en citas.html | Ir a citas.html, elegir una fecha dentro de los próximos 5 días | Se muestra temperatura y descripción del clima para esa fecha | ⏳ Pendiente (requiere configurar OPENWEATHER_API_KEY) |
| FT-11 | Cierre de sesión | Estando logueado, hacer clic en "Cerrar sesión" | Sesión termina, menú vuelve al estado de visitante | ⏳ Pendiente de ejecutar |

### Notas sobre bugs encontrados durante las pruebas

- **FT-04** reveló un bug real: `perfil.html` y `mis-pedidos.html` verificaban la sesión antes de que terminara de confirmarse con el servidor (condición de carrera), mostrando "Acceso Restringido" a usuarios que sí tenían sesión activa. Se corrigió envolviendo la verificación en `auth.onReady()`. Este hallazgo es evidencia de que el proceso de pruebas manuales sí detectó errores reales, no solo confirmó lo esperado.
- Se encontró y corrigió un bug de conexión a base de datos (`DB_HOST` con puerto combinado causaba rechazo de credenciales válidas) durante las pruebas de FT-01/FT-02.

---

## Cómo completar esta documentación antes de entregar

1. Ejecuta `phpunit.phar` y pega el resultado real en la sección 1.
2. Ejecuta cada prueba pendiente (⏳) de la tabla de la sección 2, en orden, y cambia su estado a ✅ (pasó) o ❌ (falló, describe qué pasó).
3. Si alguna falla, corrígela antes de entregar o documenta honestamente que quedó como limitación conocida.
