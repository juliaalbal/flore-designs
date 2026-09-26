<?php
// ============================================================
//  FloreDesigns - Inicio de sesión de clientes
//  Archivo: api/auth/login.php
//  RF-02.3: permite iniciar sesión con correo y contraseña,
//  creando una sesión PHP activa.
//
//  POST { "email": "...", "password": "..." }
// ============================================================

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../lib/validators.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { responder(['error' => 'Método no permitido'], 405); }

$body     = obtenerBodyJSON();
$email    = trim($body['email'] ?? '');
$password = (string)($body['password'] ?? '');

if (!camposObligatoriosCompletos([$email, $password])) {
    responder(['error' => 'Correo y contraseña son obligatorios'], 400);
}

$db = Database::conectar();
$stmt = $db->prepare('SELECT id_usuario, nombre, email, telefono, rol, password_hash FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    responder(['error' => 'Correo o contraseña incorrectos'], 401);
}

$_SESSION['usuario_id'] = $usuario['id_usuario'];
$_SESSION['rol'] = $usuario['rol'];

unset($usuario['password_hash']);
responder(['exito' => true, 'usuario' => $usuario]);
