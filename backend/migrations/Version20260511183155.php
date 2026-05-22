<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260511183155 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // Añadir como nullable para no romper filas existentes
        $this->addSql('ALTER TABLE usuario ADD username VARCHAR(180) DEFAULT NULL, CHANGE email email VARCHAR(180) DEFAULT NULL');
        // Rellenar filas existentes con un username provisional
        $this->addSql("UPDATE usuario SET username = CONCAT('user_', id) WHERE username IS NULL");
        // Ahora sí hacer NOT NULL y crear índice único
        $this->addSql('ALTER TABLE usuario MODIFY username VARCHAR(180) NOT NULL');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_USERNAME ON usuario (username)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_USERNAME ON usuario');
        $this->addSql('ALTER TABLE usuario DROP username, CHANGE email email VARCHAR(180) NOT NULL');
    }
}
