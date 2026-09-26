// ========================================
// SISTEMA DE AUTENTICACIÓN
// El objeto global `auth` (login, registro, sesión, roles)
// lo define js/auth.api.js, que debe cargarse ANTES que este
// archivo en cada página. Ver ese archivo para la implementación.
// ========================================

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
    const loginTab     = document.getElementById('loginTab');
    const registerTab  = document.getElementById('registerTab');

    // Oculta todos los formularios
    [loginForm, registerForm].forEach(f => {
        if (f) { f.classList.remove('active'); f.style.display = 'none'; }
    });
    [loginTab, registerTab].forEach(t => {
        if (t) t.classList.remove('active');
    });

    if (tab === 'login') {
        if (loginForm) { loginForm.classList.add('active'); loginForm.style.display = 'block'; }
        if (loginTab)  loginTab.classList.add('active');

    } else if (tab === 'register') {
        if (registerForm) { registerForm.classList.add('active'); registerForm.style.display = 'block'; }
        if (registerTab)  registerTab.classList.add('active');
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
    } else {
        showNotification(result.error || 'Email o contraseña incorrectos', 'error');
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
        showNotification('¡Cuenta creada! Ya iniciaste sesión.', 'success');
        closeAuthModal();
        event.target.reset();
        if (typeof CaptchaModule !== "undefined") CaptchaModule.resetear();
        window.location.reload();
    } else {
        showNotification(result.error || 'Error al registrar', 'error');
    }
}

async function handleAppointment(event) {
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

    try {
        const res = await fetch('api/citas/crear.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(appointmentData)
        });
        const data = await res.json();

        if (res.ok && data.success) {
            showNotification('Cita agendada exitosamente', 'success');
            event.target.reset();
            if (typeof displayUserAppointments === 'function') displayUserAppointments();
        } else {
            showNotification(data.error || 'Error al agendar la cita', 'error');
        }
    } catch (err) {
        showNotification('No se pudo conectar con el servidor.', 'error');
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
    if (!dateString) return '';
    // Si es una fecha simple 'YYYY-MM-DD' (como las que vienen de MySQL para
    // citas), se construye en hora local para evitar que el desfase UTC la
    // muestre un día antes de la fecha real.
    const esFechaSimple = /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    const date = esFechaSimple ? new Date(dateString + 'T00:00:00') : new Date(dateString);
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