<?php
// ============================================================
//  FloreDesigns - Registro de clientes
//  Archivo: api/auth/register.php
//  RF-02.1: registra nombre, correo y contraseña.
//  RF-02.2: valida que el correo no esté ya registrado.
//  RNF-02: password_hash() y sanitización de entradas.
//
//  POST { "nombre": "...", "email": "...", "password": "...", "telefono": "..." }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }
if ($_SERVER['REQUEST_METHOD'] !== 'POST')    { responder(['error' => 'Método no permitido'], 405); }

$body     = obtenerBodyJSON();
$nombre   = trim($body['nombre']   ?? '');
$email    = trim($body['email']    ?? '');
$password = (string)($body['password'] ?? '');
$telefono = trim($body['telefono'] ?? '');

if ($nombre === '' || $email === '' || $password === '') {
    responder(['error' => 'Nombre, correo y contraseña son obligatorios'], 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(['error' => 'El correo electrónico no es válido'], 400);
}

if (strlen($password) < 6) {
    responder(['error' => 'La contraseña debe tener al menos 6 caracteres'], 400);
}

$db = Database::conectar();

// RF-02.2: validar que el correo no esté registrado antes de crear la cuenta.
$stmt = $db->prepare('SELECT id_usuario FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    responder(['error' => 'Este correo ya está registrado'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $db->prepare('INSERT INTO usuarios (nombre, email, password_hash, telefono, rol) VALUES (?, ?, ?, ?, "cliente")');
$stmt->execute([$nombre, $email, $hash, $telefono]);

$idUsuario = (int)$db->lastInsertId();

// RF-02.3: crea una sesión PHP activa apenas se registra.
$_SESSION['usuario_id'] = $idUsuario;
$_SESSION['rol'] = 'cliente';

responder([
    'exito' => true,
    'usuario' => [
        'id_usuario' => $idUsuario,
        'nombre' => $nombre,
        'email' => $email,
        'telefono' => $telefono,
        'rol' => 'cliente',
    ],
]);
