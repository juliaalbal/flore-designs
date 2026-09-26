<?php
// ============================================================
//  FloreDesigns - Pronóstico del clima para la fecha de la cita
//  Archivo: api/weather/pronostico.php
//
//  Consume la API de terceros OpenWeatherMap (capa gratuita
//  clásica, sin necesidad de tarjeta: /data/2.5/forecast) para
//  mostrarle al cliente el pronóstico del día de su cita —
//  útil sobre todo para sesiones de fotos al aire libre
//  (bodas, quinceañeras).
//
//  Flujo de integración: frontend (citas.html) -> este endpoint
//  propio -> API de terceros (OpenWeatherMap) -> respuesta
//  simplificada de vuelta al frontend.
//
//  GET api/weather/pronostico.php?fecha=YYYY-MM-DD
//  -> { disponible: bool, temperatura, descripcion, icono, mensaje }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$fecha = $_GET['fecha'] ?? '';
$fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);

if (!$fechaObj || $fechaObj->format('Y-m-d') !== $fecha) {
    responder(['error' => 'Parámetro fecha inválido, usa formato YYYY-MM-DD'], 400);
}

$apiKey = $_ENV['OPENWEATHER_API_KEY'] ?? '';
if (empty($apiKey)) {
    responder([
        'disponible' => false,
        'mensaje' => 'Pronóstico no disponible: falta configurar OPENWEATHER_API_KEY en el archivo .env.',
    ]);
}

// Coordenadas del atelier (Aguascalientes, Ags.) - mismas que en ubicacion.html
$lat = 21.8549581;
$lon = -102.3790467;

// La API gratuita de pronóstico (/data/2.5/forecast) solo cubre ~5 días hacia adelante.
$hoy = new DateTime('today');
$diferenciaDias = (int)$hoy->diff($fechaObj)->format('%r%a');

if ($diferenciaDias < 0) {
    responder(['disponible' => false, 'mensaje' => 'La fecha de la cita ya pasó.']);
}
if ($diferenciaDias > 5) {
    responder([
        'disponible' => false,
        'mensaje' => 'El pronóstico del clima solo está disponible para citas dentro de los próximos 5 días. Vuelve a consultar más cerca de tu cita.',
    ]);
}

$url = sprintf(
    'https://api.openweathermap.org/data/2.5/forecast?lat=%s&lon=%s&appid=%s&units=metric&lang=es',
    $lat, $lon, urlencode($apiKey)
);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 8,
]);
$respuesta = curl_exec($ch);
$codigoHttp = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$errorCurl = curl_error($ch);
curl_close($ch);

if ($errorCurl || $codigoHttp !== 200) {
    responder([
        'disponible' => false,
        'mensaje' => 'No se pudo obtener el pronóstico en este momento. Intenta más tarde.',
    ]);
}

$datos = json_decode($respuesta, true);
if (empty($datos['list'])) {
    responder(['disponible' => false, 'mensaje' => 'No hay datos de pronóstico para esa fecha.']);
}

// La API devuelve datos cada 3 horas; se busca el punto más cercano al mediodía de la fecha pedida.
$objetivo = strtotime($fecha . ' 12:00:00');
$mejor = null;
$menorDiferencia = PHP_INT_MAX;

foreach ($datos['list'] as $punto) {
    $diferencia = abs($punto['dt'] - $objetivo);
    if ($diferencia < $menorDiferencia) {
        $menorDiferencia = $diferencia;
        $mejor = $punto;
    }
}

if (!$mejor) {
    responder(['disponible' => false, 'mensaje' => 'No hay datos de pronóstico para esa fecha.']);
}

responder([
    'disponible' => true,
    'temperatura' => round($mejor['main']['temp']),
    'descripcion' => $mejor['weather'][0]['description'] ?? '',
    'icono' => $mejor['weather'][0]['icon'] ?? '',
    'mensaje' => null,
]);
