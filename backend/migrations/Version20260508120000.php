<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Borra y recrea las tablas usuario, contrato, importacion, oferta y muestra';
    }

    public function up(Schema $schema): void
    {
        // Borrar tablas en orden correcto (primero las que tienen FK hacia otras)
        $this->addSql('SET FOREIGN_KEY_CHECKS = 0');
        $this->addSql('DROP TABLE IF EXISTS muestra');
        $this->addSql('DROP TABLE IF EXISTS oferta');
        $this->addSql('DROP TABLE IF EXISTS contrato');
        $this->addSql('DROP TABLE IF EXISTS importacion');
        $this->addSql('DROP TABLE IF EXISTS usuario');
        $this->addSql('SET FOREIGN_KEY_CHECKS = 1');

        // Recrear usuario
        $this->addSql('
            CREATE TABLE usuario (
                id INT AUTO_INCREMENT NOT NULL,
                nombre VARCHAR(255) NOT NULL,
                tipo VARCHAR(15) NOT NULL,
                PRIMARY KEY (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
        ');

        // Recrear contrato
        $this->addSql('
            CREATE TABLE contrato (
                id INT AUTO_INCREMENT NOT NULL,
                proveedor_id INT NOT NULL,
                fecha DATE DEFAULT NULL,
                numero_contrato VARCHAR(100) DEFAULT NULL,
                producto VARCHAR(255) DEFAULT NULL,
                precio DECIMAL(15, 4) DEFAULT NULL,
                grado VARCHAR(10) DEFAULT NULL,
                cantidad DECIMAL(15, 3) DEFAULT NULL,
                cantidad_pedida DECIMAL(15, 3) DEFAULT NULL,
                cantidad_pendiente DECIMAL(15, 3) DEFAULT NULL,
                fecha_caducidad DATE DEFAULT NULL,
                documentacion TINYINT(1) DEFAULT NULL,
                observaciones LONGTEXT DEFAULT NULL,
                INDEX idx_contrato_proveedor (proveedor_id),
                PRIMARY KEY (id),
                CONSTRAINT fk_contrato_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
        ');

        // Recrear importacion
        $this->addSql('
            CREATE TABLE importacion (
                id INT AUTO_INCREMENT NOT NULL,
                proveedor_id INT NOT NULL,
                fecha_dua_albaran DATE DEFAULT NULL,
                fecha_factura DATE DEFAULT NULL,
                producto VARCHAR(255) DEFAULT NULL,
                cantidad DECIMAL(15, 3) DEFAULT NULL,
                importe_eur DECIMAL(15, 2) DEFAULT NULL,
                aranceles DECIMAL(5, 2) DEFAULT NULL,
                coste_despacho DECIMAL(15, 2) DEFAULT NULL,
                gasto_imp_kg DECIMAL(10, 4) DEFAULT NULL,
                coste_kg DECIMAL(10, 4) DEFAULT NULL,
                importe_usd DECIMAL(15, 2) DEFAULT NULL,
                tipo_cambio DECIMAL(10, 4) DEFAULT NULL,
                forwarderer VARCHAR(255) DEFAULT NULL,
                incoterm VARCHAR(10) DEFAULT NULL,
                documentacion TINYINT(1) DEFAULT NULL,
                observaciones LONGTEXT DEFAULT NULL,
                INDEX idx_importacion_proveedor (proveedor_id),
                PRIMARY KEY (id),
                CONSTRAINT fk_importacion_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
        ');

        // Recrear oferta
        $this->addSql('
            CREATE TABLE oferta (
                id INT AUTO_INCREMENT NOT NULL,
                proveedor_id INT NOT NULL,
                fecha DATE DEFAULT NULL,
                producto VARCHAR(255) DEFAULT NULL,
                grado VARCHAR(20) DEFAULT NULL,
                cantidad DECIMAL(15, 3) DEFAULT NULL,
                precio DECIMAL(15, 4) DEFAULT NULL,
                moneda VARCHAR(10) DEFAULT NULL,
                incoterm VARCHAR(10) DEFAULT NULL,
                muestra TINYINT(1) DEFAULT NULL,
                tipo VARCHAR(10) DEFAULT NULL,
                documentacion TINYINT(1) DEFAULT NULL,
                observaciones LONGTEXT DEFAULT NULL,
                INDEX idx_oferta_proveedor (proveedor_id),
                PRIMARY KEY (id),
                CONSTRAINT fk_oferta_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
        ');

        // Recrear muestra (FK a proveedor y usuario)
        $this->addSql('
            CREATE TABLE muestra (
                id INT AUTO_INCREMENT NOT NULL,
                proveedor_id INT NOT NULL,
                usuario_id INT DEFAULT NULL,
                fecha DATE DEFAULT NULL,
                estado VARCHAR(20) DEFAULT NULL,
                id_lote VARCHAR(100) DEFAULT NULL,
                producto VARCHAR(255) DEFAULT NULL,
                grado VARCHAR(10) DEFAULT NULL,
                documentacion TINYINT(1) DEFAULT NULL,
                observaciones LONGTEXT DEFAULT NULL,
                INDEX idx_muestra_proveedor (proveedor_id),
                INDEX idx_muestra_usuario (usuario_id),
                PRIMARY KEY (id),
                CONSTRAINT fk_muestra_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedor (id),
                CONSTRAINT fk_muestra_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
            ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('SET FOREIGN_KEY_CHECKS = 0');
        $this->addSql('DROP TABLE IF EXISTS muestra');
        $this->addSql('DROP TABLE IF EXISTS oferta');
        $this->addSql('DROP TABLE IF EXISTS contrato');
        $this->addSql('DROP TABLE IF EXISTS importacion');
        $this->addSql('DROP TABLE IF EXISTS usuario');
        $this->addSql('SET FOREIGN_KEY_CHECKS = 1');
    }
}
