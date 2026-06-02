<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Tabla email para bandeja SRM';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE IF NOT EXISTS email (
            id INT AUTO_INCREMENT NOT NULL,
            proveedor_id INT DEFAULT NULL,
            message_id VARCHAR(255) NOT NULL,
            conversation_id VARCHAR(255) DEFAULT NULL,
            sender VARCHAR(255) NOT NULL,
            recipients LONGTEXT DEFAULT NULL,
            subject VARCHAR(500) NOT NULL,
            body LONGTEXT NOT NULL,
            received_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            status VARCHAR(20) NOT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            has_attachments TINYINT(1) DEFAULT 0 NOT NULL,
            attachments JSON DEFAULT NULL,
            INDEX IDX_EMAIL_PROVEEDOR (proveedor_id),
            INDEX idx_email_received_at (received_at),
            INDEX idx_email_status (status),
            UNIQUE INDEX uniq_email_message_id (message_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_PROVEEDOR FOREIGN KEY (proveedor_id) REFERENCES proveedor (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_PROVEEDOR');
        $this->addSql('DROP TABLE email');
    }
}

