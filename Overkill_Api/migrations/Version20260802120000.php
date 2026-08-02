<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260802120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add global session revocation and GDPR deletion request tracking';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD session_version INT DEFAULT 0 NOT NULL');
        $this->addSql('ALTER TABLE users ADD data_deletion_requested_at TIMESTAMP(0) WITHOUT TIME ZONE DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users DROP session_version');
        $this->addSql('ALTER TABLE users DROP data_deletion_requested_at');
    }
}
