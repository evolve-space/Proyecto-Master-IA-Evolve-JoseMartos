<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260608140000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Categorías de calendario y relación con eventos';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE calendario_categoria (
            id INT AUTO_INCREMENT NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            color VARCHAR(7) NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE calendar_event ADD categoria_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE calendar_event ADD CONSTRAINT FK_CALENDAR_CATEGORIA FOREIGN KEY (categoria_id) REFERENCES calendario_categoria (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_CALENDAR_CATEGORIA ON calendar_event (categoria_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE calendar_event DROP FOREIGN KEY FK_CALENDAR_CATEGORIA');
        $this->addSql('DROP INDEX IDX_CALENDAR_CATEGORIA ON calendar_event');
        $this->addSql('ALTER TABLE calendar_event DROP categoria_id');
        $this->addSql('DROP TABLE calendario_categoria');
    }
}
