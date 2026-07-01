-- ============================================================
--  FloreDesigns - Esquema de base de datos
--  Basado en el diagrama de clases (Figura 2, P1 Actividad 4)
--  y en los requerimientos funcionales RF-01 a RF-06.
--
--  Cómo usarlo (con XAMPP / phpMyAdmin o consola mysql):
--    1. Crea la base de datos:  CREATE DATABASE floredesigns;
--    2. Selecciónala:           USE floredesigns;
--    3. Ejecuta este archivo completo.
-- ============================================================

SET NAMES utf8mb4;

-- ── Tabla: usuarios (RF-02) ─────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario      INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    telefono        VARCHAR(20)  DEFAULT NULL,
    rol             ENUM('cliente', 'administrador') NOT NULL DEFAULT 'cliente',
    fecha_registro  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: categorias (RF-01.2) ──────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
    id_categoria    INT AUTO_INCREMENT PRIMARY KEY,
    nombre          VARCHAR(80) NOT NULL UNIQUE,
    clave           VARCHAR(40) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: vestidos (RF-01) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS vestidos (
    id_vestido           INT AUTO_INCREMENT PRIMARY KEY,
    nombre               VARCHAR(150) NOT NULL,
    descripcion          TEXT,
    detalles             TEXT,
    id_categoria         INT NOT NULL,
    imagen               VARCHAR(255) NOT NULL,
    materiales           TEXT COMMENT 'Lista separada por comas',
    tiempo_confeccion    VARCHAR(60),
    disponible_encargar  TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'RF-01.3 / RF-01.4',
    fecha_creacion       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: citas (RF-03) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS citas (
    id_cita         INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    tipo            ENUM('cotizacion','medidas','prueba1','prueba2','entrega') NOT NULL,
    fecha           DATE NOT NULL,
    hora            TIME NOT NULL,
    comentarios     TEXT,
    estado          ENUM('pendiente','confirmada','cancelada') NOT NULL DEFAULT 'pendiente',
    fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Tabla: comentarios (RF-04) ────────────────────────────────
CREATE TABLE IF NOT EXISTS comentarios (
    id_comentario   INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario      INT NOT NULL,
    texto           TEXT NOT NULL,
    rating          TINYINT NOT NULL,
    aprobado        TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'RF-04.2: visible solo tras aprobación',
    fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
--  DATOS INICIALES (seed)
-- ============================================================

INSERT INTO categorias (nombre, clave) VALUES
    ('Novias', 'novias'),
    ('Quinceañeras', 'quinceaneras'),
    ('Gala', 'gala'),
    ('Graduación', 'graduacion')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO vestidos (nombre, descripcion, detalles, id_categoria, imagen, materiales, tiempo_confeccion, disponible_encargar) VALUES
('Elegancia Clásica',
 'Vestido de novia en corte princesa con encaje francés importado y cola de 3 metros. Delicados detalles de pedrería Swarovski en el corpiño.',
 'Este diseño combina la elegancia atemporal con detalles modernos. El corpiño estructurado en encaje francés está adornado con pedrería Swarovski aplicada a mano, mientras que la falda en capas de tul de seda crea un volumen romántico.',
 (SELECT id_categoria FROM categorias WHERE clave='novias'), 'img/vestidos/novia1.jpg',
 'Encaje francés,Tul de seda,Pedrería Swarovski,Satén italiano', '3-4 meses', 0),

('Sueño de Princesa',
 'Vestido de quinceañera en tono rosa champagne con bordados a mano en hilo de seda. Falda con 7 capas de tul para máximo volumen.',
 'Diseñado para hacer realidad el sueño de toda quinceañera. Los bordados florales hechos a mano con hilo de seda crean un efecto tridimensional único. La falda multicapa garantiza un volumen espectacular.',
 (SELECT id_categoria FROM categorias WHERE clave='quinceaneras'), 'img/vestidos/quince1.jpg',
 'Tul premium,Bordado de seda,Cristales Preciosa,Organza', '2-3 meses', 1),

('Noche de Estrellas',
 'Vestido de gala en corte sirena con lentejuelas bordadas en degradado. Escote asimétrico y abertura lateral dramática.',
 'Un diseño espectacular para brillar en cualquier evento de gala. Las lentejuelas están aplicadas en un patrón degradado que crea un efecto de movimiento hipnótico. El corte sirena realza la silueta.',
 (SELECT id_categoria FROM categorias WHERE clave='gala'), 'img/vestidos/gala1.jpg',
 'Lentejuelas premium,Crepé de seda,Tul bordado,Forro de satén', '6-8 semanas', 0),

('Sofisticación Urbana',
 'Vestido midi estructurado con detalles arquitectónicos, ideal para graduación. Diseño con espalda descubierta y caída fluida.',
 'La fusión perfecta entre elegancia y practicidad. Confeccionado en mikado japonés de alta calidad con estructura interna que mantiene la forma perfecta, pensado para quienes buscan un look sofisticado y cómodo.',
 (SELECT id_categoria FROM categorias WHERE clave='graduacion'), 'img/vestidos/grad1.jpg',
 'Mikado japonés,Forro de seda,Detalles metálicos', '4-6 semanas', 1),

('Romance Moderno',
 'Vestido de novia minimalista en línea A con escote en V profundo. Confeccionado en crepé italiano con botones cubiertos en toda la espalda.',
 'Para la novia que busca elegancia sin excesos. Las líneas limpias del crepé italiano crean una silueta sofisticada, mientras que los botones forrados a mano en la espalda añaden un toque de romanticismo clásico.',
 (SELECT id_categoria FROM categorias WHERE clave='novias'), 'img/vestidos/novia2.jpg',
 'Crepé italiano,Satén duquesa,Botones forrados', '3-4 meses', 1),

('Alta Distinción',
 'Vestido midi en tono rosa con falda en capas y silueta favorecedora. Corte limpio con escote corazón.',
 'Un diseño versátil para quien busca elegancia sin perder comodidad. La falda en capas aporta movimiento y la silueta entallada favorece la figura. Ideal para eventos donde quieras destacar con sutileza.',
 (SELECT id_categoria FROM categorias WHERE clave='gala'), 'img/vestidos/gala2.jpg',
 'Mikado de seda,Organza,Forro de satén', '4-5 semanas', 1),

('Velo de Ensueño',
 'Vestido de novia de corte recto en satén fluido, ideal para bodas en recintos históricos. Silueta limpia que acompaña el movimiento.',
 'Pensado para la novia que prefiere la sobriedad antes que el exceso de adornos. El satén fluido cae con naturalidad y permite que el velo y el entorno sean protagonistas.',
 (SELECT id_categoria FROM categorias WHERE clave='novias'), 'img/vestidos/novia3.jpg',
 'Satén fluido,Forro de seda', '3 meses', 1),

('Tul y Color',
 'Vestido de quinceañera en tono celeste con cuerpo bordado de flores y falda amplia de tul, fotografiado en exteriores.',
 'Una pieza pensada para quinceañeras que sueñan con un vestido de cuento, con un cuerpo bordado a mano y una falda de gran volumen que se mueve con cada paso.',
 (SELECT id_categoria FROM categorias WHERE clave='quinceaneras'), 'img/vestidos/quince2.jpg',
 'Tul,Bordado floral,Organza', '2-3 meses', 0),

('Brillo Nocturno',
 'Vestido con pedrería en tono plata de manga larga, perfecto para una graduación o evento nocturno.',
 'Confeccionado para captar la luz en cada movimiento. El bordado de pedrería cubre toda la pieza y las mangas en malla bordada aportan un toque elegante sin perder comodidad.',
 (SELECT id_categoria FROM categorias WHERE clave='graduacion'), 'img/vestidos/grad2.jpg',
 'Tela con pedrería,Forro interno,Mangas en malla bordada', '5-6 semanas', 0);

-- ============================================================
--  Cómo crear tu cuenta de administrador
--  (no se hardcodea ninguna contraseña por seguridad)
--
--  1. Regístrate normalmente desde el sitio con tu correo.
--  2. Ejecuta este UPDATE reemplazando el correo:
--
--     UPDATE usuarios SET rol = 'administrador' WHERE email = 'tu_correo@ejemplo.com';
--
--  3. Vuelve a iniciar sesión (o entra por "Acceso Administrador"
--     usando ese mismo correo como "Usuario").
-- ============================================================
