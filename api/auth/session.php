<?php
// ============================================================
//  FloreDesigns - Consultar sesión activa
//  Archivo: api/auth/session.php
//  Se llama al cargar cualquier página para saber si hay un
//  usuario autenticado y con qué rol (RF-02.4).
//
//  GET → { "usuario": {...} | null }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

$usuario = usuarioAutenticado();
responder(['usuario' => $usuario]);
