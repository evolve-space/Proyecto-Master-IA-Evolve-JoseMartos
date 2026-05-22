<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260511170231 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        $table = $schema->getTable('usuario');

        if (!$table->hasColumn('email')) {
            $this->addSql('ALTER TABLE usuario ADD email VARCHAR(180) DEFAULT NULL');
        }
        if (!$table->hasColumn('password')) {
            $this->addSql('ALTER TABLE usuario ADD password VARCHAR(255) DEFAULT NULL');
        }

        $this->addSql('UPDATE usuario SET email = CONCAT(\'usuario_\', id, \'@pendiente.local\') WHERE email IS NULL OR email = \'\'');
        $this->addSql('UPDATE usuario SET password = \'\' WHERE password IS NULL');
        $this->addSql('ALTER TABLE usuario MODIFY email VARCHAR(180) NOT NULL, MODIFY password VARCHAR(255) NOT NULL');

        $indexNames = array_map(fn($i) => $i->getName(), $table->getIndexes());
        if (!in_array('UNIQ_EMAIL', $indexNames, true)) {
            $this->addSql('CREATE UNIQUE INDEX UNIQ_EMAIL ON usuario (email)');
        }
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP INDEX UNIQ_EMAIL ON usuario');
        $this->addSql('ALTER TABLE usuario DROP email, DROP password');
    }
}
