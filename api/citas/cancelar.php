<?php
// ============================================================
//  FloreDesigns - Cancelar una cita propia (cliente)
//  Archivo: api/citas/cancelar.php
//
//  El cliente solo puede cancelar SUS PROPIAS citas (se valida
//  id_usuario, no solo el id_cita, para evitar que un cliente
//  cancele la cita de otra persona adivinando el id).
//
//  POST api/citas/cancelar.php
//  body: { id_cita }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$usuario = usuarioAutenticado();
if (!$usuario) {
    responder(['error' => 'Debes iniciar sesión.'], 401);
}

$body = obtenerBodyJSON();
$idCita = (int)($body['id_cita'] ?? 0);
if ($idCita <= 0) {
    responder(['error' => 'id_cita inválido.'], 400);
}

$db = Database::conectar();
$stmt = $db->prepare('UPDATE citas SET estado = "cancelada" WHERE id_cita = ? AND id_usuario = ?');
$stmt->execute([$idCita, $usuario['id_usuario']]);

if ($stmt->rowCount() === 0) {
    responder(['error' => 'Cita no encontrada o no te pertenece.'], 404);
}

responder(['success' => true]);
