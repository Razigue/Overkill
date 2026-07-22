<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260721095853 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE offers ALTER latitude TYPE DOUBLE PRECISION');
        $this->addSql('ALTER TABLE offers ALTER longitude TYPE DOUBLE PRECISION');
        $this->addSql('ALTER TABLE offers ALTER starts_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
        $this->addSql('ALTER TABLE offers ALTER ends_at TYPE TIMESTAMP(0) WITHOUT TIME ZONE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE offers ALTER latitude TYPE INT');
        $this->addSql('ALTER TABLE offers ALTER longitude TYPE INT');
        $this->addSql('ALTER TABLE offers ALTER starts_at TYPE DATE');
        $this->addSql('ALTER TABLE offers ALTER ends_at TYPE DATE');
    }
}
