<?php
//  FloreDesigns - Agendar una cita (cliente autenticado)
//  solo usuarios autenticados pueden agendar.
//  tipo de consulta, fecha, hora y comentarios opcionales.


require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/validators.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$usuario = usuarioAutenticado();
if (!$usuario) {
    // si no ha iniciado sesión, el frontend debe redirigir al login.
    responder(['error' => 'Debes iniciar sesión para agendar una cita.'], 401);
}

$body = obtenerBodyJSON();
$tipo = trim($body['tipo'] ?? '');
$fecha = trim($body['fecha'] ?? '');
$hora = trim($body['hora'] ?? '');
$comentarios = trim($body['comentarios'] ?? '');

$tiposValidos = ['cotizacion', 'medidas', 'prueba1', 'prueba2', 'entrega'];

if (!camposObligatoriosCompletos([$tipo, $fecha, $hora])) {
    responder(['error' => 'Tipo de consulta, fecha y hora son obligatorios.'], 400);
}
if (!in_array($tipo, $tiposValidos, true)) {
    responder(['error' => 'Tipo de consulta no válido.'], 400);
}
$fechaObj = DateTime::createFromFormat('Y-m-d', $fecha);
if (!$fechaObj || $fechaObj->format('Y-m-d') !== $fecha) {
    responder(['error' => 'Formato de fecha inválido, usa YYYY-MM-DD.'], 400);
}
if (!preg_match('/^\d{2}:\d{2}$/', $hora)) {
    responder(['error' => 'Formato de hora inválido, usa HH:MM.'], 400);
}

$db = Database::conectar();
$stmt = $db->prepare(
    'INSERT INTO citas (id_usuario, tipo, fecha, hora, comentarios, estado)
     VALUES (?, ?, ?, ?, ?, "pendiente")'
);
$stmt->execute([$usuario['id_usuario'], $tipo, $fecha, $hora, $comentarios ?: null]);

$idCita = $db->lastInsertId();
$stmt = $db->prepare('SELECT * FROM citas WHERE id_cita = ?');
$stmt->execute([$idCita]);

responder(['success' => true, 'cita' => $stmt->fetch()], 201);
