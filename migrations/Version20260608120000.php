<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Calendario: eventos locales y sincronizados con Outlook';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE calendar_event (
            id INT AUTO_INCREMENT NOT NULL,
            email_id INT DEFAULT NULL,
            proveedor_id INT DEFAULT NULL,
            graph_event_id VARCHAR(255) DEFAULT NULL,
            subject VARCHAR(500) NOT NULL,
            description LONGTEXT DEFAULT NULL,
            location VARCHAR(255) DEFAULT NULL,
            start_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            end_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            all_day TINYINT(1) DEFAULT 0 NOT NULL,
            organizer VARCHAR(255) DEFAULT NULL,
            attendees JSON DEFAULT NULL,
            source VARCHAR(20) DEFAULT \'local\' NOT NULL,
            web_link VARCHAR(1024) DEFAULT NULL,
            created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            updated_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX UNIQ_CALENDAR_GRAPH_EVENT (graph_event_id),
            INDEX idx_calendar_event_start (start_at),
            INDEX idx_calendar_event_graph_id (graph_event_id),
            INDEX IDX_CALENDAR_EMAIL (email_id),
            INDEX IDX_CALENDAR_PROVEEDOR (proveedor_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_EMAIL FOREIGN KEY (email_id) REFERENCES email (id) ON DELETE SET NULL');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_PROVEEDOR FOREIGN KEY (proveedor_id) REFERENCES proveedor (id) ON DELETE SET NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_EMAIL');
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_PROVEEDOR');
        $this->addSql('DROP TABLE calendar_event');
    }
}
