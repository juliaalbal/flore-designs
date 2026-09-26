/* =====================================================
   MODULO DE MAPA - maps.js
   Integra la Google Maps JavaScript API (servicio de
   terceros) para mostrar la ubicación del atelier en
   citas.html, junto al resto de la información de contacto.
===================================================== */

// Coordenadas del atelier. 
const UBICACION_ATELIER = {
    lat: 21.8549581,
    lng: -102.3790467,
    direccion: 'Calle 50 Aniversario, Santa Cruz de la Presa, Aguascalientes, Ags.'
};

async function initAtelierMap() {
    const mapDiv = document.getElementById('atelierMap');
    if (!mapDiv) return; // esta página no tiene el contenedor del mapa

    let apiKey = '';
    try {
        const res = await fetch('api/maps/config.php');
        const data = await res.json();
        apiKey = data.apiKey || '';
    } catch (err) {
        mapDiv.innerHTML = '<p style="padding:1rem; color: var(--text-medium); font-size:0.875rem;">No se pudo conectar con el servidor para cargar el mapa.</p>';
        return;
    }

    if (!apiKey) {
        // Aviso solo visible en desarrollo: falta configurar la key en .env
        mapDiv.innerHTML = '<p style="padding:1rem; color: var(--text-medium); font-size:0.875rem;">Mapa no disponible: falta configurar MAPS_API_KEY en el archivo .env.</p>';
        return;
    }

    // Callback global que Google Maps invoca cuando su script termina de cargar
    window.renderAtelierMap = function () {
        const posicion = { lat: UBICACION_ATELIER.lat, lng: UBICACION_ATELIER.lng };

        const map = new google.maps.Map(mapDiv, {
            zoom: 15,
            center: posicion,
            disableDefaultUI: false,
            zoomControl: true,
        });

        const marker = new google.maps.Marker({
            position: posicion,
            map: map,
            title: 'Floré Designs',
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `<strong>Floré Designs</strong><br>${UBICACION_ATELIER.direccion}`
        });

        marker.addListener('click', () => infoWindow.open(map, marker));
        infoWindow.open(map, marker);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&callback=renderAtelierMap`;
    script.async = true;
    script.onerror = () => {
        mapDiv.innerHTML = '<p style="padding:1rem; color: var(--text-medium); font-size:0.875rem;">No se pudo cargar Google Maps. Verifica tu API key.</p>';
    };
    document.head.appendChild(script);
}

document.addEventListener('DOMContentLoaded', initAtelierMap);
