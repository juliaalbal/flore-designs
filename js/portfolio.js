/* =====================================================
   MODULO DE PORTAFOLIO - portfolio.js
   Fuente unica de datos de los vestidos (RNF-05).
   Cada vestido define si esta disponible para encargar
   (RF-01.3 / RF-01.4) o si es unicamente una pieza ya
   realizada para una clienta (solo portafolio).
===================================================== */

// Datos de los vestidos
const dressesData = {
    1: {
        category: 'novias',
        title: 'Elegancia Clásica',
        imagen: 'img/vestidos/novia1.jpg',
        description: 'Vestido de novia en corte princesa con encaje francés importado y cola de 3 metros. Delicados detalles de pedrería Swarovski en el corpiño.',
        materials: ['Encaje francés', 'Tul de seda', 'Pedrería Swarovski', 'Satén italiano'],
        details: 'Este diseño combina la elegancia atemporal con detalles modernos. El corpiño estructurado en encaje francés está adornado con pedrería Swarovski aplicada a mano, mientras que la falda en capas de tul de seda crea un volumen romántico.',
        tiempo: '3-4 meses',
        disponibleEncargar: false
    },
    2: {
        category: 'quinceaneras',
        title: 'Sueño de Princesa',
        imagen: 'img/vestidos/quince1.jpg',
        description: 'Vestido de quinceañera en tono rosa champagne con bordados a mano en hilo de seda. Falda con 7 capas de tul para máximo volumen.',
        materials: ['Tul premium', 'Bordado de seda', 'Cristales Preciosa', 'Organza'],
        details: 'Diseñado para hacer realidad el sueño de toda quinceañera. Los bordados florales hechos a mano con hilo de seda crean un efecto tridimensional único. La falda multicapa garantiza un volumen espectacular.',
        tiempo: '2-3 meses',
        disponibleEncargar: true
    },
    3: {
        category: 'gala',
        title: 'Noche de Estrellas',
        imagen: 'img/vestidos/gala1.jpg',
        description: 'Vestido de gala en corte sirena con lentejuelas bordadas en degradado. Escote asimétrico y abertura lateral dramática.',
        materials: ['Lentejuelas premium', 'Crepé de seda', 'Tul bordado', 'Forro de satén'],
        details: 'Un diseño espectacular para brillar en cualquier evento de gala. Las lentejuelas están aplicadas en un patrón degradado que crea un efecto de movimiento hipnótico. El corte sirena realza la silueta.',
        tiempo: '6-8 semanas',
        disponibleEncargar: false
    },
    4: {
        category: 'graduacion',
        title: 'Sofisticación Urbana',
        imagen: 'img/vestidos/grad1.jpg',
        description: 'Vestido midi estructurado con detalles arquitectónicos, ideal para graduación. Diseño con espalda descubierta y caída fluida.',
        materials: ['Mikado japonés', 'Forro de seda', 'Detalles metálicos'],
        details: 'La fusión perfecta entre elegancia y practicidad. Confeccionado en mikado japonés de alta calidad con estructura interna que mantiene la forma perfecta, pensado para quienes buscan un look sofisticado y cómodo.',
        tiempo: '4-6 semanas',
        disponibleEncargar: true
    },
    5: {
        category: 'novias',
        title: 'Romance Moderno',
        imagen: 'img/vestidos/novia2.jpg',
        description: 'Vestido de novia minimalista en línea A con escote en V profundo. Confeccionado en crepé italiano con botones cubiertos en toda la espalda.',
        materials: ['Crepé italiano', 'Satén duquesa', 'Botones forrados'],
        details: 'Para la novia que busca elegancia sin excesos. Las líneas limpias del crepé italiano crean una silueta sofisticada, mientras que los botones forrados a mano en la espalda añaden un toque de romanticismo clásico.',
        tiempo: '3-4 meses',
        disponibleEncargar: true
    },
    6: {
        category: 'gala',
        title: 'Alta Distinción',
        imagen: 'img/vestidos/gala2.jpg',
        description: 'Vestido midi en tono rosa con falda en capas y silueta favorecedora. Corte limpio con escote corazón.',
        materials: ['Mikado de seda', 'Organza', 'Forro de satén'],
        details: 'Un diseño versátil para quien busca elegancia sin perder comodidad. La falda en capas aporta movimiento y la silueta entallada favorece la figura. Ideal para eventos donde quieras destacar con sutileza.',
        tiempo: '4-5 semanas',
        disponibleEncargar: true
    },
    7: {
        category: 'novias',
        title: 'Velo de Ensueño',
        imagen: 'img/vestidos/novia3.jpg',
        description: 'Vestido de novia de corte recto en satén fluido, ideal para bodas en recintos históricos. Silueta limpia que acompaña el movimiento.',
        materials: ['Satén fluido', 'Forro de seda'],
        details: 'Pensado para la novia que prefiere la sobriedad antes que el exceso de adornos. El satén fluido cae con naturalidad y permite que el velo y el entorno sean protagonistas.',
        tiempo: '3 meses',
        disponibleEncargar: true
    },
    8: {
        category: 'quinceaneras',
        title: 'Tul y Color',
        imagen: 'img/vestidos/quince2.jpg',
        description: 'Vestido de quinceañera en tono celeste con cuerpo bordado de flores y falda amplia de tul, fotografiado en exteriores.',
        materials: ['Tul', 'Bordado floral', 'Organza'],
        details: 'Una pieza pensada para quinceañeras que sueñan con un vestido de cuento, con un cuerpo bordado a mano y una falda de gran volumen que se mueve con cada paso.',
        tiempo: '2-3 meses',
        disponibleEncargar: false
    },
    9: {
        category: 'graduacion',
        title: 'Brillo Nocturno',
        imagen: 'img/vestidos/grad2.jpg',
        description: 'Vestido con pedrería en tono plata de manga larga, perfecto para una graduación o evento nocturno.',
        materials: ['Tela con pedrería', 'Forro interno', 'Mangas en malla bordada'],
        details: 'Confeccionado para captar la luz en cada movimiento. El bordado de pedrería cubre toda la pieza y las mangas en malla bordada aportan un toque elegante sin perder comodidad.',
        tiempo: '5-6 semanas',
        disponibleEncargar: false
    }
};

/* --------------------------------------------------
   RENDERIZADO DEL GRID DE PORTAFOLIO (RF-01.1, RF-01.3)
   Se construye dinamicamente desde dressesData para
   evitar tarjetas hardcodeadas que se desincronizan
   de los datos reales (causa de inconsistencias previas).
-------------------------------------------------- */
function renderPortfolioGrid() {
    const grid = document.getElementById('portfolioGrid');
    if (!grid) return;

    grid.innerHTML = Object.keys(dressesData).map(id => {
        const dress = dressesData[id];
        const tagLabel = dress.disponibleEncargar ? 'Disponible para encargar' : 'Pieza de portafolio';
        const tagClass = dress.disponibleEncargar ? 'tag-disponible' : 'tag-portafolio';

        return `
            <div class="portfolio-item" data-category="${dress.category}" onclick="openModal(${id})">
                <div class="portfolio-item-media">
                    <img src="${dress.imagen}" alt="${dress.title} - ${getCategoryName(dress.category)}" loading="lazy">
                    <span class="portfolio-tag ${tagClass}">${tagLabel}</span>
                    <div class="portfolio-item-overlay">
                        <p class="portfolio-item-category">${getCategoryName(dress.category)}</p>
                        <h3 class="portfolio-item-title">${dress.title}</h3>
                        <p class="portfolio-item-cta">Ver detalles</p>
                    </div>
                </div>
                <div class="portfolio-item-footer">
                    <p class="portfolio-item-category-small">${getCategoryName(dress.category)}</p>
                    <h3 class="portfolio-item-title-small">${dress.title}</h3>
                </div>
            </div>
        `;
    }).join('');
}

// Función para filtrar colección
function filterCollection(category) {
    const items = document.querySelectorAll('.portfolio-item');
    const buttons = document.querySelectorAll('.filter-btn');

    // Actualizar botones activos
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filtrar items
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            item.style.animation = 'fadeInUp 0.5s ease forwards';
        } else {
            item.style.display = 'none';
        }
    });
}

// Función para abrir modal con detalles
function openModal(dressId) {
    const dress = dressesData[dressId];
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('modalContent');

    // RF-01.3 / RF-01.4: la llamada a la accion solo existe para
    // piezas marcadas como disponibles para encargar. Las piezas
    // que son unicamente portafolio no ofrecen cotizacion.
    const ctaBlock = dress.disponibleEncargar ? `
        <div class="modal-cta-box modal-cta-available">
            <p class="modal-cta-label">Disponible para encargar</p>
            <p class="modal-cta-text">¿Te gustaría un diseño similar a la medida?</p>
        </div>
        <div class="modal-actions">
            <button onclick="requestQuote(${dressId})" class="btn" style="flex: 1;">
                Quiero algo similar
            </button>
            <button onclick="closeDetailModal()" class="btn btn-secondary" style="flex: 1;">
                Cerrar
            </button>
        </div>
    ` : `
        <div class="modal-cta-box modal-cta-portfolio">
            <p class="modal-cta-label">Pieza de portafolio</p>
            <p class="modal-cta-text">Esta pieza fue confeccionada en exclusiva para una clienta y no está disponible para encargar tal cual.</p>
        </div>
        <div class="modal-actions">
            <button onclick="closeDetailModal()" class="btn btn-secondary" style="flex: 1;">
                Cerrar
            </button>
        </div>
    `;

    content.innerHTML = `
        <div class="modal-dress-grid">
            <!-- Imagen del vestido -->
            <div>
                <img src="${dress.imagen}" alt="${dress.title}" class="modal-dress-image">
            </div>

            <!-- Detalles -->
            <div>
                <p class="modal-dress-category">${getCategoryName(dress.category)}</p>
                <h2 class="modal-dress-title">${dress.title}</h2>

                <span class="portfolio-tag ${dress.disponibleEncargar ? 'tag-disponible' : 'tag-portafolio'}" style="position: static; display: inline-block; margin-bottom: 1.25rem;">
                    ${dress.disponibleEncargar ? 'Disponible para encargar' : 'Pieza de portafolio'}
                </span>

                <p class="modal-dress-description">
                    ${dress.description}
                </p>

                <div class="modal-materials-box">
                    <h4 class="modal-materials-title">Materiales</h4>
                    <ul class="modal-materials-list">
                        ${dress.materials.map(material => `<li>${material}</li>`).join('')}
                    </ul>
                </div>

                <div class="modal-tiempo-box">
                    <p class="modal-tiempo-label">Tiempo de confección estimado</p>
                    <p class="modal-tiempo-value">${dress.tiempo}</p>
                </div>

                ${ctaBlock}

                <p class="modal-dress-details">
                    ${dress.details}
                </p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Función para cerrar modal de detalles
function closeDetailModal() {
    const modal = document.getElementById('detailModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Función para solicitar cotización
// RF-01.4: dirige al formulario de cita, no solo muestra un aviso.
function requestQuote(dressId) {
    if (typeof auth === 'undefined' || !auth.isLoggedIn || !auth.isLoggedIn()) {
        closeDetailModal();
        openAuthModal('login');
        if (typeof showNotification === 'function') {
            showNotification('Inicia sesión para agendar una cita', 'info');
        }
        return;
    }

    const dress = dressesData[dressId];
    const params = new URLSearchParams({
        tipo: 'cotizacion',
        prenda: dress.title
    });
    window.location.href = `citas.html?${params.toString()}`;
}

// Función auxiliar para obtener nombre de categoría
function getCategoryName(category) {
    const names = {
        'novias': 'Novias',
        'quinceaneras': 'Quinceañeras',
        'gala': 'Gala',
        'graduacion': 'Graduación'
    };
    return names[category] || category;
}

document.addEventListener('DOMContentLoaded', renderPortfolioGrid);

// Cerrar modal con ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});
