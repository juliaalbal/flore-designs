<?php
// ============================================================
//  FloreDesigns - Validadores puros
//  Archivo: api/lib/validators.php
//
//  Funciones de validación sin efectos secundarios (no tocan
//  $_SESSION, $_ENV, ni la base de datos). Se extrajeron de
//  api/auth/register.php y login.php para poder probarlas con
//  PHPUnit de forma aislada y rápida (pruebas unitarias reales,
//  no solo funcionales).
// ============================================================

/**
 * Verifica que un correo electrónico tenga un formato válido.
 */
function esCorreoValido(string $email): bool
{
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Verifica que una contraseña cumpla la longitud mínima (RNF-02).
 */
function esPasswordValida(string $password, int $minimoCaracteres = 6): bool
{
    return strlen($password) >= $minimoCaracteres;
}

/**
 * Verifica que ninguno de los campos obligatorios llegue vacío,
 * después de quitar espacios en blanco.
 */
function camposObligatoriosCompletos(array $campos): bool
{
    foreach ($campos as $campo) {
        if (trim((string)$campo) === '') {
            return false;
        }
    }
    return true;
}
