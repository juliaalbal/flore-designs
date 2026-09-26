// Admin Panel JavaScript

let citasCache = []; // guarda la última respuesta de api/admin/citas.php para viewCita()/guardarCita()/eliminarCita()

document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    loadAllData();
});

function showSection(sectionName, clickedEl) {
    // Ocultar todas las secciones
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => section.style.display = 'none');

    // Mostrar la seccion seleccionada
    const target = document.getElementById(sectionName + '-section');
    if (target) target.style.display = 'block';

    // Actualizar navegacion activa
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    // clickedEl viene del onclick del enlace del sidebar
    if (clickedEl) {
        const navItem = clickedEl.closest('.admin-nav-item');
        if (navItem) navItem.classList.add('active');
    }
    
    // Cargar datos según la sección
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'citas':
            loadCitasData();
            break;
        case 'pedidos':
            loadPedidosData();
            break;
        case 'clientes':
            loadClientesData();
            break;
        case 'disenos':
            // El CRUD de disenos se maneja en app.js / data.js / ui.data.js
            // No necesita carga especial, ya se inicializo en DOMContentLoaded
            break;
    }
}

async function loadDashboardData() {
    // Cargar estadísticas
    const allOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');

    // Citas pendientes (dato real, desde la base de datos)
    try {
        const res = await fetch('api/admin/citas.php', { credentials: 'include' });
        const data = await res.json();
        const citasReales = res.ok ? (data.citas || []) : [];
        citasCache = citasReales;
        const citasPendientes = citasReales.filter(c => c.estado === 'pendiente').length;
        document.getElementById('citasPendientes').textContent = citasPendientes;
    } catch (err) {
        document.getElementById('citasPendientes').textContent = '—';
    }
    
    // Pedidos activos
    const pedidosActivos = allOrders.filter(order => order.estado !== 'Entregado').length;
    document.getElementById('pedidosActivos').textContent = pedidosActivos;
    
    // Nuevos clientes (último mes)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const nuevosClientes = allUsers.filter(user => {
        const fechaRegistro = new Date(user.fechaRegistro || new Date());
        return fechaRegistro > oneMonthAgo;
    }).length;
    document.getElementById('nuevosClientes').textContent = nuevosClientes;
    
    // Actividad reciente
    loadActividadReciente();
}

function loadActividadReciente() {
    const actividadDiv = document.getElementById('actividadReciente');
    const appointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Combinar y ordenar por fecha
    let actividades = [];
    
    appointments.slice(0, 3).forEach(apt => {
        actividades.push({
            tipo: 'cita',
            fecha: new Date(apt.fechaCreacion),
            texto: `Nueva cita agendada: ${getTipoCitaLabel(apt.tipo)}`,
        });
    });
    
    orders.slice(0, 3).forEach(order => {
        actividades.push({
            tipo: 'pedido',
            fecha: new Date(order.fechaPedido),
            texto: `Nuevo pedido: ${order.titulo}`,
        });
    });
    
    users.slice(0, 2).forEach(user => {
        actividades.push({
            tipo: 'cliente',
            fecha: new Date(user.fechaRegistro || new Date()),
            texto: `Nuevo cliente: ${user.nombre}`,
        });
    });
    
    // Ordenar por fecha
    actividades.sort((a, b) => b.fecha - a.fecha);
    
    actividadDiv.innerHTML = actividades.slice(0, 5).map(act => `
        <div style="padding: 1rem 0; border-bottom: 1px solid var(--border-light); display: flex; gap: 1rem; align-items: start;">
            <div style="width: 32px; height: 32px; background: var(--bg-accent); border-radius: 8px; flex-shrink: 0;">
            </div>
            <div style="flex: 1;">
                <p style="font-size: 0.875rem; color: var(--text-dark); margin-bottom: 0.25rem;">${act.texto}</p>
                <p style="font-size: 0.75rem; color: var(--text-light);">${formatTimeAgo(act.fecha)}</p>
            </div>
        </div>
    `).join('');
}

async function loadCitasData() {
    const citasDiv = document.getElementById('citasLista');
    citasDiv.innerHTML = `<div style="text-align: center; padding: 4rem; color: var(--text-medium);"><p>Cargando citas...</p></div>`;

    let citas = [];
    try {
        const res = await fetch('api/admin/citas.php', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener citas');
        citas = data.citas || [];
        citasCache = citas;
    } catch (err) {
        citasDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-medium);">
                <p>No se pudieron cargar las citas (${err.message})</p>
            </div>
        `;
        return;
    }

    if (citas.length === 0) {
        citasDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-medium);">
                <p>No hay citas registradas</p>
            </div>
        `;
        return;
    }

    const colorEstado = { pendiente: '#ff9800', confirmada: '#4caf50', cancelada: '#dc3545' };

    citasDiv.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Cliente</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Tipo</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Fecha</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Hora</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Estado</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${citas.map(cita => `
                    <tr style="border-bottom: 1px solid var(--border-light);">
                        <td style="padding: 1rem;">${cita.cliente_nombre} <span style="color:var(--text-light);font-size:0.8125rem;">(${cita.cliente_email})</span></td>
                        <td style="padding: 1rem;">${getTipoCitaLabel(cita.tipo)}</td>
                        <td style="padding: 1rem;">${formatDate(cita.fecha)}</td>
                        <td style="padding: 1rem;">${cita.hora}</td>
                        <td style="padding: 1rem;">
                            <span style="padding: 0.375rem 0.875rem; background: ${colorEstado[cita.estado] || '#999'}; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;">
                                ${cita.estado}
                            </span>
                        </td>
                        <td style="padding: 1rem;">
                            <button onclick="viewCita(${cita.id_cita})" style="padding: 0.5rem 1rem; background: var(--secondary-color); color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.875rem; font-weight: 600;">
                                Ver / Editar
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadPedidosData() {
    const pedidosDiv = document.getElementById('pedidosLista');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (orders.length === 0) {
        pedidosDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-medium);">
                <p>No hay pedidos registrados</p>
            </div>
        `;
        return;
    }
    
    pedidosDiv.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Cliente</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Vestido</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Fecha Pedido</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Fecha Evento</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Precio</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Estado</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map(order => {
                    const user = users.find(u => u.id === order.userId);
                    return `
                        <tr style="border-bottom: 1px solid var(--border-light);">
                            <td style="padding: 1rem;">${user ? user.nombre : 'Cliente Desconocido'}</td>
                            <td style="padding: 1rem;">${order.titulo}</td>
                            <td style="padding: 1rem;">${formatDate(order.fechaPedido)}</td>
                            <td style="padding: 1rem;">${formatDate(order.fechaEvento)}</td>
                            <td style="padding: 1rem; font-weight: 600; color: var(--secondary-color);">${formatCurrency(order.precio)}</td>
                            <td style="padding: 1rem;">
                                <span style="padding: 0.375rem 0.875rem; background: #2196f3; color: white; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                    ${order.estado}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

async function loadClientesData() {
    const clientesDiv = document.getElementById('clientesLista');
    clientesDiv.innerHTML = `<div style="text-align: center; padding: 4rem; color: var(--text-medium);"><p>Cargando clientes...</p></div>`;

    let users = [];
    try {
        const res = await fetch('api/admin/usuarios.php', { credentials: 'include' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener clientes');
        users = data.usuarios || [];
    } catch (err) {
        clientesDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-medium);">
                <p>No se pudo cargar la lista de clientes (${err.message})</p>
            </div>
        `;
        return;
    }

    if (users.length === 0) {
        clientesDiv.innerHTML = `
            <div style="text-align: center; padding: 4rem; color: var(--text-medium);">
                <p>No hay clientes registrados</p>
            </div>
        `;
        return;
    }

    clientesDiv.innerHTML = `
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="border-bottom: 2px solid var(--border-color);">
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Nombre</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Email</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Teléfono</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Fecha Registro</th>
                    <th style="text-align: left; padding: 1rem; font-family: var(--font-accent); font-weight: 600; color: var(--primary-color);">Citas</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr style="border-bottom: 1px solid var(--border-light);">
                        <td style="padding: 1rem; font-weight: 500;">${user.nombre}</td>
                        <td style="padding: 1rem; color: var(--text-medium);">${user.email}</td>
                        <td style="padding: 1rem; color: var(--text-medium);">${user.telefono}</td>
                        <td style="padding: 1rem; color: var(--text-medium);">${formatDate(user.fecha_registro)}</td>
                        <td style="padding: 1rem;">
                            <span style="padding: 0.375rem 0.875rem; background: var(--bg-accent); color: var(--primary-color); border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                ${user.total_citas} ${user.total_citas == 1 ? 'cita' : 'citas'}
                            </span>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadAllData() {
    loadCitasData();
    loadPedidosData();
    loadClientesData();
}

function getTipoCitaLabel(tipo) {
    const labels = {
        'cotizacion': 'Cotización',
        'medidas': 'Toma de medidas',
        'prueba1': 'Primera prueba',
        'prueba2': 'Segunda prueba',
        'entrega': 'Entrega final'
    };
    return labels[tipo] || tipo;
}

function formatTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `Hace ${minutes} min`;
    if (hours < 24) return `Hace ${hours}h`;
    if (days === 1) return 'Ayer';
    if (days < 7) return `Hace ${days} días`;
    return formatDate(date.toISOString());
}

// =====================================================
//   CRUD DE CITAS - Ver, Editar, Eliminar
// =====================================================

function viewCita(id) {
    const cita = citasCache.find(c => c.id_cita === id);
    if (!cita) return;

    // Modal inline de detalle/edición
    const existingModal = document.getElementById('citaModal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'citaModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:1rem;';
    modal.innerHTML = `
        <div style="background:#fff;border-radius:12px;padding:2rem;max-width:520px;width:100%;position:relative;max-height:90vh;overflow-y:auto;">
            <button onclick="document.getElementById('citaModal').remove()" style="position:absolute;top:1rem;right:1rem;background:none;border:none;font-size:1.5rem;cursor:pointer;color:#666;">&times;</button>
            <h3 style="font-family:var(--font-heading);font-size:1.5rem;color:var(--primary-color);margin-bottom:1.5rem;">Detalle de Cita #${cita.id_cita}</h3>
            
            <div style="margin-bottom:1.5rem;padding:1rem;background:#f9f9f9;border-radius:8px;border-left:4px solid var(--secondary-color);">
                <p><strong>Cliente:</strong> ${cita.cliente_nombre} (${cita.cliente_email})</p>
                <p style="margin-top:0.5rem;"><strong>Tipo:</strong> ${getTipoCitaLabel(cita.tipo)}</p>
                <p style="margin-top:0.5rem;"><strong>Comentarios:</strong> ${cita.comentarios || 'Sin comentarios'}</p>
            </div>

            <div style="margin-bottom:1.5rem;">
                <label style="display:block;font-weight:600;margin-bottom:0.4rem;font-size:0.875rem;color:var(--text-medium);">Estado</label>
                <select id="editEstado" style="width:100%;padding:0.75rem;border:1px solid #ddd;border-radius:6px;">
                    <option value="pendiente" ${cita.estado==='pendiente'?'selected':''}>Pendiente</option>
                    <option value="confirmada" ${cita.estado==='confirmada'?'selected':''}>Confirmada</option>
                    <option value="cancelada" ${cita.estado==='cancelada'?'selected':''}>Cancelada</option>
                </select>
            </div>

            <div style="display:flex;gap:1rem;justify-content:flex-end;">
                <button onclick="eliminarCita(${cita.id_cita})" style="padding:0.75rem 1.5rem;background:#dc3545;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
                    Eliminar
                </button>
                <button onclick="guardarCita(${cita.id_cita})" style="padding:0.75rem 1.5rem;background:var(--secondary-color);color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">
                    Guardar cambios
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
}

async function guardarCita(id) {
    const estado = document.getElementById('editEstado').value;
    try {
        const res = await fetch('api/admin/citas-actualizar.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: id, estado })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al actualizar');

        document.getElementById('citaModal').remove();
        await loadCitasData();
        mostrarNotificacion('Cita actualizada correctamente', 'success');
    } catch (err) {
        mostrarNotificacion(err.message, 'warning');
    }
}

async function eliminarCita(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta cita? Esta acción no se puede deshacer.')) return;

    try {
        const res = await fetch('api/admin/citas-actualizar.php', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cita: id, eliminar: true })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al eliminar');

        const modalActual = document.getElementById('citaModal');
        if (modalActual) modalActual.remove();
        await loadCitasData();
        mostrarNotificacion('Cita eliminada', 'warning');
    } catch (err) {
        mostrarNotificacion(err.message, 'warning');
    }
}

function mostrarNotificacion(msg, tipo = 'success') {
    const n = document.createElement('div');
    n.style.cssText = `position:fixed;bottom:2rem;right:2rem;padding:1rem 1.5rem;border-radius:8px;font-weight:600;z-index:99999;color:white;background:${tipo==='success'?'#4caf50':tipo==='warning'?'#ff9800':'#dc3545'};box-shadow:0 4px 16px rgba(0,0,0,0.2);transition:opacity 0.4s;`;
    n.textContent = msg;
    document.body.appendChild(n);
    setTimeout(() => { n.style.opacity = '0'; setTimeout(() => n.remove(), 400); }, 2500);
}
/* =====================================================
   CRUD DE DISEÑOS (Módulo independiente del panel)
   ===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    // Verifica si estamos en la sección de diseños
    const lista = document.getElementById("listaDisenos");
    if (!lista) return; // Si no existe, no ejecuta nada

    const form = document.getElementById("formDiseno");
    const busqueda = document.getElementById("busqueda");
    const filtro = document.getElementById("filtroCategoria");
    const ordenar = document.getElementById("ordenar");
    const mensaje = document.getElementById("mensaje");

    // Obtener datos guardados o iniciar vacío
    let disenos = JSON.parse(localStorage.getItem("disenosFlore")) || [];

    // Guardar en LocalStorage
    function guardar() {
        localStorage.setItem("disenosFlore", JSON.stringify(disenos));
    }

    // Renderizar lista
    function render(listaDatos) {

        lista.innerHTML = "";

        if (listaDatos.length === 0) {
            mensaje.textContent = "No hay resultados.";
            return;
        }

        mensaje.textContent = "";

        listaDatos.forEach(d => {

            const li = document.createElement("li");

            li.innerHTML = `
                ${d.nombre} - ${d.categoria}
                <button data-id="${d.id}">Eliminar</button>
            `;

            lista.appendChild(li);
        });
    }

    // Actualizar categorías
    function actualizarCategorias() {

        const categoriasUnicas = [...new Set(disenos.map(d => d.categoria))];

        filtro.innerHTML = `<option value="">Todas</option>`;

        categoriasUnicas.forEach(cat => {

            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat;

            filtro.appendChild(option);
        });
    }

    // Inicializar
    render(disenos);
    actualizarCategorias();

    // AGREGAR
    form.addEventListener("submit", function (e) {

        e.preventDefault();

        const nombre = document.getElementById("nombre").value;
        const categoria = document.getElementById("categoria").value;

        const nuevo = {
            id: Date.now(),
            nombre,
            categoria
        };

        disenos.push(nuevo);
        guardar();
        render(disenos);
        actualizarCategorias();
        form.reset();

        mensaje.textContent = "Diseño agregado correctamente.";
    });

    // ELIMINAR (delegación)
    lista.addEventListener("click", function (e) {

        if (e.target.tagName === "BUTTON") {

            const confirmar = confirm("¿Seguro que deseas eliminar?");
            if (!confirmar) return;

            const id = Number(e.target.dataset.id);

            disenos = disenos.filter(d => d.id !== id);

            guardar();
            render(disenos);
            actualizarCategorias();

            mensaje.textContent = "Diseño eliminado.";
        }
    });

    // BUSCAR
    busqueda.addEventListener("input", function () {

        const texto = busqueda.value.toLowerCase();

        const resultados = disenos.filter(d =>
            d.nombre.toLowerCase().includes(texto)
        );

        render(resultados);
    });

    // FILTRAR
    filtro.addEventListener("change", function () {

        const categoria = filtro.value;

        const filtrados = categoria
            ? disenos.filter(d => d.categoria === categoria)
            : disenos;

        render(filtrados);
    });

    // ORDENAR
    ordenar.addEventListener("change", function () {

        let copia = [...disenos];

        if (ordenar.value === "asc") {
            copia.sort((a, b) => a.nombre.localeCompare(b.nombre));
        } else if (ordenar.value === "desc") {
            copia.sort((a, b) => b.nombre.localeCompare(a.nombre));
        }

        render(copia);
    });

});
