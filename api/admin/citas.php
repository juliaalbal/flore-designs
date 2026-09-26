<?php
// ============================================================
//  FloreDesigns - Listado de todas las citas (panel admin)
//  Archivo: api/admin/citas.php
//
//  RF-03.4 / RF-05.3: el administrador ve todas las citas.
//
//  GET api/admin/citas.php
//  -> { citas: [ { id_cita, tipo, fecha, hora, comentarios,
//                  estado, fecha_creacion, cliente_nombre,
//                  cliente_email }, ... ] }
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

$db = Database::conectar();
$stmt = $db->query(
    'SELECT c.id_cita, c.tipo, c.fecha, c.hora, c.comentarios, c.estado, c.fecha_creacion,
            u.nombre AS cliente_nombre, u.email AS cliente_email
     FROM citas c
     JOIN usuarios u ON u.id_usuario = c.id_usuario
     ORDER BY c.fecha DESC, c.hora DESC'
);

responder(['citas' => $stmt->fetchAll()]);
