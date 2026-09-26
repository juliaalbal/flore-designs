<?php
// ============================================================
//  FloreDesigns - Historial de citas del cliente autenticado
//  Archivo: api/citas/mis-citas.php
//
//  RF-03.3: el cliente ve el historial y estado de sus citas.
//
//  GET api/citas/mis-citas.php
//  -> { citas: [ { id_cita, tipo, fecha, hora, comentarios,
//                  estado, fecha_creacion }, ... ] }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$usuario = usuarioAutenticado();
if (!$usuario) {
    responder(['error' => 'Debes iniciar sesión.'], 401);
}

$db = Database::conectar();
$stmt = $db->prepare(
    'SELECT id_cita, tipo, fecha, hora, comentarios, estado, fecha_creacion
     FROM citas
     WHERE id_usuario = ?
     ORDER BY fecha DESC, hora DESC'
);
$stmt->execute([$usuario['id_usuario']]);

responder(['citas' => $stmt->fetchAll()]);
