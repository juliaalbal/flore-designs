<?php
// ============================================================
//  FloreDesigns - Configuración pública de Google Maps
//  Archivo: api/maps/config.php
//
//  Expone la API key de Google Maps JavaScript API al frontend,
//  leyéndola desde .env en un solo lugar. Esta key es del tipo
//  "cliente" (se usa en el navegador) — su seguridad NO depende
//  de ocultarla, sino de restringirla por dominio (HTTP referrers)
//  desde Google Cloud Console. Exponerla por este endpoint en vez
//  de hardcodearla en cada página facilita rotarla sin tocar HTML.
//
//  GET → { "apiKey": "..." }
// ============================================================

require_once __DIR__ . '/../config/database.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { responder(['ok' => true]); }

responder(['apiKey' => $_ENV['MAPS_API_KEY'] ?? '']);
