<?php
// ============================================================
//  FloreDesigns - Actualizar o eliminar una cita (panel admin)
//  Archivo: api/admin/citas-actualizar.php
//
//  RF-03.4: el administrador cambia el estado o elimina citas.
//
//  POST api/admin/citas-actualizar.php
//  body: { id_cita, estado }              -> cambia el estado
//  body: { id_cita, eliminar: true }      -> elimina la cita
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$actual = usuarioAutenticado();
if (!$actual) {
    responder(['error' => 'Debes iniciar sesión.'], 401);
}
if ($actual['rol'] !== 'administrador') {
    responder(['error' => 'No autorizado.'], 403);
}

$body = obtenerBodyJSON();
$idCita = (int)($body['id_cita'] ?? 0);
if ($idCita <= 0) {
    responder(['error' => 'id_cita inválido.'], 400);
}

$db = Database::conectar();

if (!empty($body['eliminar'])) {
    $stmt = $db->prepare('DELETE FROM citas WHERE id_cita = ?');
    $stmt->execute([$idCita]);
    if ($stmt->rowCount() === 0) {
        responder(['error' => 'Cita no encontrada.'], 404);
    }
    responder(['success' => true, 'accion' => 'eliminada']);
}

$estadosValidos = ['pendiente', 'confirmada', 'cancelada'];
$estado = trim($body['estado'] ?? '');
if (!in_array($estado, $estadosValidos, true)) {
    responder(['error' => 'Estado no válido.'], 400);
}

$stmt = $db->prepare('UPDATE citas SET estado = ? WHERE id_cita = ?');
$stmt->execute([$estado, $idCita]);

if ($stmt->rowCount() === 0) {
    // No es necesariamente un error: puede que ya tuviera ese mismo estado.
    $verificar = $db->prepare('SELECT id_cita FROM citas WHERE id_cita = ?');
    $verificar->execute([$idCita]);
    if (!$verificar->fetch()) {
        responder(['error' => 'Cita no encontrada.'], 404);
    }
}

responder(['success' => true, 'accion' => 'actualizada', 'estado' => $estado]);
