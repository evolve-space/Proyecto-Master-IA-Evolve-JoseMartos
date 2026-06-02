<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260602160000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Tabla email_categoria y relacion con email';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE IF NOT EXISTS email_categoria (
            id INT AUTO_INCREMENT NOT NULL,
            nombre VARCHAR(100) NOT NULL,
            color VARCHAR(7) NOT NULL,
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');

        $this->addSql('ALTER TABLE email ADD categoria_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE email ADD CONSTRAINT FK_EMAIL_CATEGORIA FOREIGN KEY (categoria_id) REFERENCES email_categoria (id) ON DELETE SET NULL');
        $this->addSql('CREATE INDEX IDX_EMAIL_CATEGORIA ON email (categoria_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE email DROP FOREIGN KEY FK_EMAIL_CATEGORIA');
        $this->addSql('DROP INDEX IDX_EMAIL_CATEGORIA ON email');
        $this->addSql('ALTER TABLE email DROP categoria_id');
        $this->addSql('DROP TABLE email_categoria');
    }
}
