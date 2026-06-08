<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Clasificación automática: entidades relacionadas, urgencia y categorías base';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("ALTER TABLE email ADD urgency VARCHAR(10) DEFAULT 'normal' NOT NULL, ADD classification_source VARCHAR(10) DEFAULT NULL, ADD classification_reason LONGTEXT DEFAULT NULL, ADD importacion_id INT DEFAULT NULL, ADD muestra_id INT DEFAULT NULL, ADD oferta_id INT DEFAULT NULL, ADD contrato_id INT DEFAULT NULL");
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_IMPORTACION FOREIGN KEY (importacion_id) REFERENCES importacion (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_MUESTRA FOREIGN KEY (muestra_id) REFERENCES muestra (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_OFERTA FOREIGN KEY (oferta_id) REFERENCES oferta (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_CONTRATO FOREIGN KEY (contrato_id) REFERENCES contrato (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_EMAIL_IMPORTACION ON email (importacion_id)');
        $this->addSql('CREATE INDEX IDX_EMAIL_MUESTRA ON email (muestra_id)');
        $this->addSql('CREATE INDEX IDX_EMAIL_OFERTA ON email (oferta_id)');
        $this->addSql('CREATE INDEX IDX_EMAIL_CONTRATO ON email (contrato_id)');
        $this->addSql('CREATE INDEX idx_email_urgency ON email (urgency)');

        $this->addSql("ALTER TABLE calendar_event ADD urgency VARCHAR(10) DEFAULT 'normal' NOT NULL, ADD importacion_id INT DEFAULT NULL, ADD muestra_id INT DEFAULT NULL, ADD oferta_id INT DEFAULT NULL, ADD contrato_id INT DEFAULT NULL");
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_IMPORTACION FOREIGN KEY (importacion_id) REFERENCES importacion (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_MUESTRA FOREIGN KEY (muestra_id) REFERENCES muestra (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_OFERTA FOREIGN KEY (oferta_id) REFERENCES oferta (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_CONTRATO FOREIGN KEY (contrato_id) REFERENCES contrato (id) ON DELETE SET NULL');

        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Proveedores', '#3b82f6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Proveedores')");
        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Importación', '#8b5cf6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Importación')");
        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Muestras', '#14b8a6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Muestras')");
        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Ofertas', '#eab308' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Ofertas')");
        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Contratos', '#f97316' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Contratos')");
        $this->addSql("INSERT INTO email_categoria (nombre, color) SELECT 'Urgente', '#ef4444' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM email_categoria WHERE nombre = 'Urgente')");

        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Proveedores', '#3b82f6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Proveedores')");
        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Importación', '#8b5cf6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Importación')");
        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Muestras', '#14b8a6' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Muestras')");
        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Ofertas', '#eab308' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Ofertas')");
        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Contratos', '#f97316' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Contratos')");
        $this->addSql("INSERT INTO calendario_categoria (nombre, color) SELECT 'Urgente', '#ef4444' FROM DUAL WHERE NOT EXISTS (SELECT 1 FROM calendario_categoria WHERE nombre = 'Urgente')");
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_IMPORTACION');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_MUESTRA');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_OFERTA');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_CONTRATO');
        $this->addSql('ALTER TABLE calendar_event DROP urgency, DROP importacion_id, DROP muestra_id, DROP oferta_id, DROP contrato_id');

        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_IMPORTACION');
        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_MUESTRA');
        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_OFERTA');
        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_CONTRATO');
        $this->addSql('DROP INDEX IDX_EMAIL_IMPORTACION ON email');
        $this->addSql('DROP INDEX IDX_EMAIL_MUESTRA ON email');
        $this->addSql('DROP INDEX IDX_EMAIL_OFERTA ON email');
        $this->addSql('DROP INDEX IDX_EMAIL_CONTRATO ON email');
        $this->addSql('DROP INDEX idx_email_urgency ON email');
        $this->addSql('ALTER TABLE email DROP urgency, DROP classification_source, DROP classification_reason, DROP importacion_id, DROP muestra_id, DROP oferta_id, DROP contrato_id');
    }
}
