// ========================================
// SISTEMA DE AUTENTICACIÓN (Simulado)
// NOTA: La clase AuthSystem ya no se usa para login/registro.
// Esas funciones ahora las maneja auth.api.js con PHP + MySQL.
// Esta clase se mantiene solo para compatibilidad con el resto
// del código que usa auth.isLoggedIn(), auth.isAdmin(), etc.
// ========================================

class AuthSystem {
    constructor() {
        this.currentUser = this.loadUser();
        this.updateUI();
    }

    loadUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    }

    saveUser(user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    login(email, password) {
        // Simulacion - en produccion esto se valida con el backend
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            this.saveUser({
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                telefono: user.telefono,
                isAdmin: user.isAdmin || false
            });
            this.updateUI();
            return true;
        }
        return false;
    }

    // Inicio de sesion exclusivo para administrador.
    // Credenciales: usuario "admin" / contrasena "admin123"
    loginAdmin(usuario, password) {
        if (usuario === 'admin' && password === 'admin123') {
            this.saveUser({
                id: 0,
                nombre: 'Administrador',
                email: 'admin@floredesigns.com',
                telefono: '',
                isAdmin: true
            });
            this.updateUI();
            return true;
        }
        return false;
    }

    isAdmin() {
        return this.currentUser !== null && this.currentUser.isAdmin === true;
    }

    register(userData) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Verificar si el email ya existe
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Este email ya está registrado' };
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now(),
            ...userData,
            fechaRegistro: new Date().toISOString()
        };

        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        return { success: true, message: 'Usuario registrado exitosamente' };
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateUI();
        window.location.href = 'index.html';
    }

    updateUI() {
        const perfilMenu       = document.querySelector('.perfil-menu');
        const iniciarSesionBtn = document.querySelector('.iniciar-sesion-btn');
        const registroBtn      = document.querySelector('.registro-btn');

        if (this.isLoggedIn()) {
            if (perfilMenu)       perfilMenu.style.display = 'block';
            if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'none';
            if (registroBtn)      registroBtn.style.display = 'none';

            const perfilLink   = document.querySelector('.perfil-menu > a');
            const subMenu      = document.querySelector('.perfil-menu .menu-secundario');
            const adminItem    = document.querySelector('.admin-menu-item');
            const clienteItems = document.querySelectorAll('.cliente-menu-item');

            if (this.isAdmin()) {
                // Administrador: solo ve "Panel Admin" y "Cerrar sesion"
                // Oculta los items de cliente
                clienteItems.forEach(el => el.style.display = 'none');
                if (adminItem) adminItem.style.display = 'block';
                if (perfilLink) perfilLink.textContent = 'Administrador';
            } else {
                // Usuario normal: ve "Mis datos", "Mis pedidos", "Cerrar sesion"
                clienteItems.forEach(el => el.style.display = 'block');
                if (adminItem) adminItem.style.display = 'none';
                if (perfilLink) perfilLink.textContent = this.currentUser.nombre;
            }
        } else {
            if (perfilMenu)       perfilMenu.style.display = 'none';
            if (iniciarSesionBtn) iniciarSesionBtn.style.display = 'block';
            if (registroBtn)      registroBtn.style.display = 'block';
        }
    }

    getCurrentUser() {
        return this.currentUser;
    }

    requireAuth() {
        if (!this.isLoggedIn()) {
            const modal = document.getElementById('authModal');
            if (modal) {
                modal.style.display = 'flex';
                document.getElementById('loginTab').click();
            }
            return false;
        }
        return true;
    }
}

// ========================================
// SISTEMA DE GESTIÓN DE CITAS
// ========================================

class AppointmentSystem {
    constructor() {
        this.appointments = this.loadAppointments();
    }

    loadAppointments() {
        return JSON.parse(localStorage.getItem('appointments') || '[]');
    }

    saveAppointments() {
        localStorage.setItem('appointments', JSON.stringify(this.appointments));
    }

    createAppointment(data) {
        if (!auth.isLoggedIn()) {
            return { success: false, message: 'Debes iniciar sesión para agendar una cita' };
        }

        const appointment = {
            id: Date.now(),
            userId: auth.getCurrentUser().id,
            ...data,
            estado: 'Pendiente',
            fechaCreacion: new Date().toISOString()
        };

        this.appointments.push(appointment);
        this.saveAppointments();

        return { success: true, message: 'Cita agendada exitosamente', appointment };
    }

    getUserAppointments(userId) {
        return this.appointments.filter(apt => apt.userId === userId);
    }

    cancelAppointment(id) {
        const index = this.appointments.findIndex(apt => apt.id === id);
        if (index !== -1) {
            this.appointments[index].estado = 'Cancelada';
            this.saveAppointments();
            return true;
        }
        return false;
    }
}

const appointmentSystem = new AppointmentSystem();

// ========================================
// SISTEMA DE PEDIDOS (Simulado)
// ========================================

class OrderSystem {
    constructor() {
        this.orders = this.loadOrders();
    }

    loadOrders() {
        return JSON.parse(localStorage.getItem('orders') || '[]');
    }

    saveOrders() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
    }

    createOrder(data) {
        if (!auth.isLoggedIn()) {
            return { success: false, message: 'Debes iniciar sesión para crear un pedido' };
        }

        const order = {
            id: Date.now(),
            userId: auth.getCurrentUser().id,
            ...data,
            estado: 'En proceso',
            fechaPedido: new Date().toISOString()
        };

        this.orders.push(order);
        this.saveOrders();

        return { success: true, message: 'Pedido creado exitosamente', order };
    }

    getUserOrders(userId) {
        return this.orders.filter(order => order.userId === userId);
    }
}

const orderSystem = new OrderSystem();

// ========================================
// MANEJO DE MODALES
// ========================================

function openAuthModal(tab = 'login') {
    const modal = document.getElementById('authModal');
    modal.style.display = 'flex';
    
    if (tab === 'register') {
        document.getElementById('registerTab').click();
    } else {
        document.getElementById('loginTab').click();
    }
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

function switchAuthTab(tab) {
    const loginForm    = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const adminForm    = document.getElementById('adminForm');
    const loginTab     = document.getElementById('loginTab');
    const registerTab  = document.getElementById('registerTab');
    const adminTab     = document.getElementById('adminTab');

    // Oculta todos los formularios
    [loginForm, registerForm, adminForm].forEach(f => {
        if (f) { f.classList.remove('active'); f.style.display = 'none'; }
    });
    [loginTab, registerTab, adminTab].forEach(t => {
        if (t) t.classList.remove('active');
    });

    if (tab === 'login') {
        if (loginForm) { loginForm.classList.add('active'); loginForm.style.display = 'block'; }
        if (loginTab)  loginTab.classList.add('active');

    } else if (tab === 'register') {
        if (registerForm) { registerForm.classList.add('active'); registerForm.style.display = 'block'; }
        if (registerTab)  registerTab.classList.add('active');

    } else if (tab === 'admin') {
        if (adminForm) { adminForm.classList.add('active'); adminForm.style.display = 'block'; }
        if (adminTab)  adminTab.classList.add('active');
    }
}

// ========================================
// MANEJO DE FORMULARIOS
// ========================================

// ----------------------------------------
// LOGIN — ahora usa auth.api.js (PHP + MySQL)
// ----------------------------------------
async function handleLogin(event) {
    event.preventDefault();
    const email    = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const btn = event.target.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Verificando...'; }

    const result = await auth.login(email, password);

    if (btn) { btn.disabled = false; btn.textContent = 'Iniciar sesión'; }

    if (result.exito) {
        showNotification('¡Bienvenida de nuevo!', 'success');
        closeAuthModal();
        event.target.reset();
        window.location.reload();
    } else if (result.mfa) {
        // auth.api.js ya muestra el panel MFA automáticamente
    } else {
        showNotification(result.error || 'Email o contraseña incorrectos', 'error');
    }
}

// Manejo del formulario de inicio de sesion como administrador
function handleLoginAdmin(event) {
    event.preventDefault();
    const usuario  = document.getElementById('adminUsuario').value;
    const password = document.getElementById('adminPassword').value;

    if (auth.loginAdmin(usuario, password)) {
        showNotification('Bienvenido, Administrador.', 'success');
        closeAuthModal();
        event.target.reset();
        // Redirige directo al panel de administracion
        window.location.href = 'admin.html';
    } else {
        showNotification('Usuario o contrasena de administrador incorrectos', 'error');
    }
}

// ----------------------------------------
// REGISTRO — ahora usa auth.api.js (PHP + MySQL)
// ----------------------------------------
async function handleRegister(event) {
    event.preventDefault();

    /* --------------------------------------------------
       ACTIVIDAD 5: Validacion FrontEnd con regex
    -------------------------------------------------- */
    const formularioValido = typeof ValidacionesModule !== "undefined"
        ? ValidacionesModule.validarFormularioRegistro()
        : true;

    if (!formularioValido) {
        showNotification("Por favor corrige los errores del formulario.", "error");
        return;
    }

    /* --------------------------------------------------
       ACTIVIDAD 7: Verificacion Humana (CAPTCHA)
    -------------------------------------------------- */
    if (typeof CaptchaModule !== "undefined") {
        const captchaOk = CaptchaModule.verificar();
        if (!captchaOk) {
            showNotification("Verifica que no eres un robot respondiendo la pregunta.", "error");
            return;
        }
    }

    const password        = document.getElementById("registerPassword").value;
    const confirmPassword = document.getElementById("registerConfirmPassword").value;
    const email           = document.getElementById("registerEmail").value;
    const nombre          = document.getElementById("registerNombre").value;
    const telefono        = document.getElementById("registerTelefono")?.value || "";

    /* --------------------------------------------------
       ACTIVIDAD 6: Validacion BackEnd simulada
    -------------------------------------------------- */
    if (typeof ValidacionesModule !== "undefined") {
        const resultBackend = ValidacionesModule.validacionBackend({
            email:        email,
            password:     password,
            confirmacion: confirmPassword
        });

        if (!resultBackend.valido) {
            showNotification(resultBackend.errores[0], "error");
            return;
        }
    }

    const btn = event.target.querySelector('button[type=submit]');
    if (btn) { btn.disabled = true; btn.textContent = 'Registrando...'; }

    // Llamada al backend PHP real
    const result = await auth.register(nombre, email, password, telefono);

    if (btn) { btn.disabled = false; btn.textContent = 'Crear cuenta'; }

    if (result.exito) {
        showNotification(result.mensaje || 'Cuenta creada correctamente', 'success');
        event.target.reset();
        if (typeof CaptchaModule !== "undefined") CaptchaModule.resetear();
        // Cambiar al tab de login para que inicie sesion
        switchAuthTab('login');
    } else {
        showNotification(result.error || 'Error al registrar', 'error');
    }
}

function handleAppointment(event) {
    event.preventDefault();

    if (!auth.requireAuth()) {
        return;
    }

    const appointmentData = {
        tipo: document.getElementById('tipoCita').value,
        fecha: document.getElementById('fechaCita').value,
        hora: document.getElementById('horaCita').value,
        comentarios: document.getElementById('comentariosCita').value
    };

    const result = appointmentSystem.createAppointment(appointmentData);
    
    if (result.success) {
        showNotification(result.message, 'success');
        event.target.reset();
    } else {
        showNotification(result.message, 'error');
    }
}

// ========================================
// SISTEMA DE NOTIFICACIONES
// ========================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">×</button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// MEJORA DEL MENÚ (Submenú persistente)
// ========================================

document.addEventListener('DOMContentLoaded', function() {
    const submenuItems = document.querySelectorAll('.submenu');
    
    submenuItems.forEach(item => {
        let timeout;
        
        item.addEventListener('mouseenter', function() {
            clearTimeout(timeout);
            this.classList.add('open');
        });
        
        item.addEventListener('mouseleave', function() {
            const submenuElement = this;
            timeout = setTimeout(() => {
                submenuElement.classList.remove('open');
            }, 300);
        });
    });

    // Click fuera del modal para cerrarlo
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeAuthModal();
            }
        });
    }

    // Cerrar notificaciones con ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeAuthModal();
        }
    });
});

// ========================================
// UTILIDADES
// ========================================

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-MX', { 
        style: 'currency', 
        currency: 'MXN' 
    }).format(amount);
}

// ========================================
// DATOS DE EJEMPLO (Para demostración)
// ========================================

function initializeSampleData() {
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
        const sampleUser = {
            id: 1,
            nombre: 'María García',
            email: 'demo@floredesigns.com',
            telefono: '449-123-4567',
            password: 'demo123',
            fechaRegistro: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify([sampleUser]));
    }

    if (auth.isLoggedIn()) {
        const orders = orderSystem.getUserOrders(auth.getCurrentUser().id);
        if (orders.length === 0) {
            orderSystem.createOrder({
                titulo: 'Vestido de Novia Clásico',
                descripcion: 'Vestido estilo princesa con cola larga',
                precio: 15000,
                fechaEvento: '2026-06-15'
            });

            orderSystem.createOrder({
                titulo: 'Vestido de Quinceañera',
                descripcion: 'Vestido en tono rosa pastel con detalles bordados',
                precio: 12000,
                fechaEvento: '2026-08-20'
            });
        }
    }
}

// Inicializar datos de ejemplo al cargar
// initializeSampleData(); // Descomentar si quieres datos de ejemplo