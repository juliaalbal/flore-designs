<?php
// ============================================================
//  FloreDesigns - Inicio de sesión de administrador
//  Archivo: api/auth/login-admin.php
//  RF-05.1: el panel es accesible únicamente para usuarios con
//  rol administrador.
//
//  Usa la misma tabla usuarios: un administrador es un usuario
//  con rol = 'administrador' (ver schema.sql para promover una
//  cuenta). El formulario de acceso admin pide "usuario", que
//  aquí se trata como el correo de esa cuenta.
//
//  POST { "usuario": "correo@ejemplo.com", "password": "..." }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { responder(['error' => 'Método no permitido'], 405); }

$body     = obtenerBodyJSON();
$usuarioInput = trim($body['usuario'] ?? '');
$password     = (string)($body['password'] ?? '');

if ($usuarioInput === '' || $password === '') {
    responder(['error' => 'Usuario y contraseña son obligatorios'], 400);
}

$db = Database::conectar();
$stmt = $db->prepare('SELECT id_usuario, nombre, email, telefono, rol, password_hash FROM usuarios WHERE email = ? AND rol = "administrador"');
$stmt->execute([$usuarioInput]);
$usuario = $stmt->fetch();

if (!$usuario || !password_verify($password, $usuario['password_hash'])) {
    // Mensaje genérico: no revela si el usuario existe o si no es admin.
    responder(['error' => 'Usuario o contraseña de administrador incorrectos'], 401);
}

$_SESSION['usuario_id'] = $usuario['id_usuario'];
$_SESSION['rol'] = 'administrador';

unset($usuario['password_hash']);
responder(['exito' => true, 'usuario' => $usuario]);
