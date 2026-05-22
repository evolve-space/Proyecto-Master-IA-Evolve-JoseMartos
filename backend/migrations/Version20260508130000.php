<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260508130000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Actualiza la tabla proveedor para que coincida con la entidad actual';
    }

    public function up(Schema $schema): void
    {
        // Renombrar cif -> cif_nif y añadir columnas que faltan
        $this->addSql('ALTER TABLE proveedor
            CHANGE cif cif_nif VARCHAR(20) DEFAULT NULL,
            MODIFY nombre VARCHAR(255) DEFAULT NULL,
            MODIFY telefono VARCHAR(20) DEFAULT NULL,
            MODIFY email VARCHAR(255) DEFAULT NULL,
            ADD web VARCHAR(255) DEFAULT NULL,
            ADD actividad VARCHAR(255) DEFAULT NULL,
            ADD direccion_facturacion VARCHAR(500) DEFAULT NULL,
            ADD tipo VARCHAR(20) DEFAULT NULL,
            ADD certificaciones LONGTEXT DEFAULT NULL,
            ADD contacto_principal VARCHAR(255) DEFAULT NULL,
            ADD forma_pago INT DEFAULT NULL,
            ADD movil VARCHAR(20) DEFAULT NULL,
            ADD incoterm VARCHAR(10) DEFAULT NULL,
            ADD documentacion TINYINT(1) DEFAULT NULL,
            ADD observaciones LONGTEXT DEFAULT NULL
        ');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE proveedor
            CHANGE cif_nif cif VARCHAR(255) DEFAULT NULL,
            DROP web,
            DROP actividad,
            DROP direccion_facturacion,
            DROP tipo,
            DROP certificaciones,
            DROP contacto_principal,
            DROP forma_pago,
            DROP movil,
            DROP incoterm,
            DROP documentacion,
            DROP observaciones
        ');
    }
}
