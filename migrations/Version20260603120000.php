<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260603120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Correos eliminados en app: no reimportar desde Outlook';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE email_exclusion (
            id INT AUTO_INCREMENT NOT NULL,
            message_id VARCHAR(512) NOT NULL,
            excluded_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
            UNIQUE INDEX uniq_email_exclusion_message_id (message_id),
            PRIMARY KEY(id)
        ) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE email_exclusion');
    }
}
