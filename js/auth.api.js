/* =====================================================
   MODULO DE AUTENTICACION - auth.api.js
   Cliente que habla con api/auth/*.php (PHP + sesiones +
   MySQL), según RF-02 y la arquitectura definida en 6.1
   del documento de alcance. Expone un objeto global `auth`
   usado por el resto del sitio (main.js, admin.html,
   portfolio.js, citas.html, perfil.html, dashboard.html).
===================================================== */

const auth = (() => {

    const API_BASE = 'api/auth';
    let currentUser = null;
    let sessionReady = false;

    /* --------------------------------------------------
       Helper de fetch con manejo de errores uniforme
    -------------------------------------------------- */
    async function post(endpoint, data) {
        try {
            const res = await fetch(`${API_BASE}/${endpoint}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            const body = await res.json().catch(() => ({}));
            return { ok: res.ok, status: res.status, body };
        } catch (err) {
            return { ok: false, status: 0, body: { error: 'No se pudo conectar con el servidor. Verifica que el backend PHP esté corriendo.' } };
        }
    }

    /* --------------------------------------------------
       Consulta la sesión activa al cargar cualquier página
    -------------------------------------------------- */
    async function cargarSesion() {
        try {
            const res = await fetch(`${API_BASE}/session.php`, { credentials: 'include' });
            const data = await res.json();
            currentUser = data.usuario || null;
        } catch (err) {
            currentUser = null;
        } finally {
            sessionReady = true;
            actualizarUI();
            document.dispatchEvent(new CustomEvent('authStateChange'));
        }
    }

    /* --------------------------------------------------
       Actualiza menú/nav según el estado de sesión
       (misma lógica que tenía el AuthSystem original)
    -------------------------------------------------- */
    function actualizarUI() {
        const perfilMenu       = document.querySelector('.perfil-menu');
        const iniciarSesionBtn = document.querySelector('.iniciar-sesion-btn');
        const registroBtn      = document.querySelector('.registro-btn');

        if (isLoggedIn()) {
            if (perfilMenu)       perfilMenu.style.display = 'block';
            if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'none';
            if (registroBtn)      registroBtn.style.display = 'none';

            const perfilLink   = document.querySelector('.perfil-menu > a');
            const adminItem    = document.querySelector('.admin-menu-item');
            const clienteItems = document.querySelectorAll('.cliente-menu-item');

            if (isAdmin()) {
                clienteItems.forEach(el => el.style.display = 'none');
                if (adminItem) adminItem.style.display = 'block';
                if (perfilLink) perfilLink.textContent = 'Administrador';
            } else {
                clienteItems.forEach(el => el.style.display = 'block');
                if (adminItem) adminItem.style.display = 'none';
                if (perfilLink) perfilLink.textContent = currentUser.nombre;
            }
        } else {
            if (perfilMenu)       perfilMenu.style.display = 'none';
            if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'block';
            if (registroBtn)      registroBtn.style.display = 'block';
        }
    }

    /* --------------------------------------------------
       API pública
    -------------------------------------------------- */
    async function login(email, password) {
        const { ok, body } = await post('login.php', { email, password });
        if (ok && body.usuario) {
            currentUser = body.usuario;
            actualizarUI();
            document.dispatchEvent(new CustomEvent('authStateChange'));
            return { exito: true, usuario: body.usuario };
        }
        return { exito: false, error: body.error || 'Correo o contraseña incorrectos' };
    }

    async function loginAdmin(usuario, password) {
        const { ok, body } = await post('login-admin.php', { usuario, password });
        if (ok && body.usuario) {
            currentUser = body.usuario;
            actualizarUI();
            document.dispatchEvent(new CustomEvent('authStateChange'));
            return true;
        }
        return false;
    }

    async function register(nombre, email, password, telefono) {
        const { ok, body } = await post('register.php', { nombre, email, password, telefono });
        if (ok && body.usuario) {
            currentUser = body.usuario;
            actualizarUI();
            document.dispatchEvent(new CustomEvent('authStateChange'));
            return { exito: true, usuario: body.usuario };
        }
        return { exito: false, error: body.error || 'No se pudo completar el registro' };
    }

    async function logout() {
        await post('logout.php', {});
        currentUser = null;
        actualizarUI();
        window.location.href = 'index.html';
    }

    function isLoggedIn() {
        return currentUser !== null;
    }

    function isAdmin() {
        return currentUser !== null && currentUser.rol === 'administrador';
    }

    function getCurrentUser() {
        return currentUser;
    }

    // Actualiza el usuario en caché local (usado tras editar el perfil).
    // NOTA: esto NO persiste en la base de datos todavía — falta el
    // endpoint api/auth/update-profile.php. Es un pendiente conocido.
    function saveUser(user) {
        currentUser = user;
        actualizarUI();
    }

    function requireAuth() {
        if (!isLoggedIn()) {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'flex';
                const tab = document.getElementById('loginTab');
                if (tab) tab.click();
            }
            return false;
        }
        return true;
    }

    // Espera a que la sesión inicial termine de cargar.
    // Util para paginas que deben decidir algo (ej. admin.html)
    // solo despues de saber si hay sesion.
    function onReady(callback) {
        if (sessionReady) { callback(); return; }
        document.addEventListener('authStateChange', callback, { once: true });
    }

    cargarSesion();

    return {
        login,
        loginAdmin,
        register,
        logout,
        isLoggedIn,
        isAdmin,
        getCurrentUser,
        saveUser,
        requireAuth,
        requerirAuth: requireAuth, // alias usado en dashboard.html
        onReady,
    };
})();
