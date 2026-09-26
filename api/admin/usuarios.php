<?php
// ============================================================
//  FloreDesigns - Listado de clientes para el panel admin
//  Archivo: api/admin/usuarios.php
//
//  RF-05.1: solo accesible para rol administrador.
//  RF-05.3 (relacionado): el admin necesita ver a los clientes
//  para poder atenderlos, no solo sus citas.
//
//  GET api/admin/usuarios.php
//  -> { usuarios: [ { id_usuario, nombre, email, telefono,
//                     fecha_registro, total_citas }, ... ] }
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
    'SELECT u.id_usuario, u.nombre, u.email, u.telefono, u.fecha_registro,
            COUNT(c.id_cita) AS total_citas
     FROM usuarios u
     LEFT JOIN citas c ON c.id_usuario = u.id_usuario
     WHERE u.rol = "cliente"
     GROUP BY u.id_usuario
     ORDER BY u.fecha_registro DESC'
);
$usuarios = $stmt->fetchAll();

responder(['usuarios' => $usuarios]);