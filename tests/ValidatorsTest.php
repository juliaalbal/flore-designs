<?php
// ============================================================
//  FloreDesigns - Pruebas unitarias de validadores
//  Archivo: tests/ValidatorsTest.php
//
//  Pruebas unitarias reales (no funcionales/manuales) sobre las
//  funciones puras de api/lib/validators.php. No requieren base
//  de datos ni sesión, por lo que corren de forma aislada y rápida.
//
//  Cómo ejecutarlas (sin necesitar Composer):
//    1. Descarga phpunit.phar de https://phar.phpunit.de/
//       (elige la versión compatible con tu PHP; PHPUnit 10 requiere PHP 8.1+)
//    2. Colócalo en la raíz del proyecto.
//    3. Desde la terminal, en la carpeta del proyecto:
//       C:\xampp\php\php.exe phpunit.phar tests/
// ============================================================

use PHPUnit\Framework\TestCase;

require_once __DIR__ . '/../api/lib/validators.php';

final class ValidatorsTest extends TestCase
{
    // --- esCorreoValido() ---

    public function testCorreoValidoDevuelveTrue(): void
    {
        $this->assertTrue(esCorreoValido('cliente@floredesigns.com'));
    }

    public function testCorreoSinArrobaDevuelveFalse(): void
    {
        $this->assertFalse(esCorreoValido('clientefloredesigns.com'));
    }

    public function testCorreoSinDominioDevuelveFalse(): void
    {
        $this->assertFalse(esCorreoValido('cliente@'));
    }

    public function testCorreoVacioDevuelveFalse(): void
    {
        $this->assertFalse(esCorreoValido(''));
    }

    // --- esPasswordValida() ---

    public function testPasswordConSeisCaracteresEsValida(): void
    {
        $this->assertTrue(esPasswordValida('123456'));
    }

    public function testPasswordConMenosDeSeisCaracteresNoEsValida(): void
    {
        $this->assertFalse(esPasswordValida('12345'));
    }

    public function testPasswordVaciaNoEsValida(): void
    {
        $this->assertFalse(esPasswordValida(''));
    }

    public function testPasswordRespetaMinimoPersonalizado(): void
    {
        $this->assertFalse(esPasswordValida('12345678', 10));
        $this->assertTrue(esPasswordValida('1234567890', 10));
    }

    // --- camposObligatoriosCompletos() ---

    public function testTodosLosCamposPresentesDevuelveTrue(): void
    {
        $this->assertTrue(camposObligatoriosCompletos(['Julia', 'julia@correo.com', '123456']));
    }

    public function testUnCampoVacioDevuelveFalse(): void
    {
        $this->assertFalse(camposObligatoriosCompletos(['Julia', '', '123456']));
    }

    public function testCampoConSoloEspaciosCuentaComoVacio(): void
    {
        $this->assertFalse(camposObligatoriosCompletos(['Julia', '   ', '123456']));
    }

    public function testArregloVacioDevuelveTrue(): void
    {
        // No hay campos que revisar, por lo tanto no hay ninguno vacío.
        $this->assertTrue(camposObligatoriosCompletos([]));
    }
}
