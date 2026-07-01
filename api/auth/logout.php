<?php
// ============================================================
//  FloreDesigns - Cerrar sesión
//  Archivo: api/auth/logout.php
//  RF-02.5: el sistema permite cerrar sesión activa del usuario.
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params['path'], $params['domain'], $params['secure'], $params['httponly']);
}
session_destroy();

responder(['exito' => true]);
