<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Platforms\PostgreSQLPlatform;
use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260802170000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Deduplicate offers, preserve relations, enforce source/URL uniqueness, and throttle ingestion triggers.';
    }

    public function up(Schema $schema): void
    {
        $this->abortIf(!$this->connection->getDatabasePlatform() instanceof PostgreSQLPlatform, 'This migration is PostgreSQL-only.');

        $this->addSql("UPDATE offers SET external_url = RTRIM(BTRIM(external_url), '/')");

        $duplicateMap = <<<'SQL'
            SELECT id AS duplicate_id,
                   MIN(id) OVER (PARTITION BY source_id_id, external_url) AS canonical_id
            FROM offers
        SQL;

        $this->addSql(<<<SQL
            INSERT INTO offers_categories (offers_id, categories_id)
            SELECT DISTINCT duplicates.canonical_id, categories.categories_id
            FROM ($duplicateMap) duplicates
            INNER JOIN offers_categories categories ON categories.offers_id = duplicates.duplicate_id
            WHERE duplicates.duplicate_id <> duplicates.canonical_id
            ON CONFLICT (offers_id, categories_id) DO NOTHING
        SQL);

        $this->addSql(<<<SQL
            UPDATE user_favorites favorites
            SET offer_id_id = duplicates.canonical_id
            FROM ($duplicateMap) duplicates
            WHERE favorites.offer_id_id = duplicates.duplicate_id
              AND duplicates.duplicate_id <> duplicates.canonical_id
        SQL);
        $this->addSql(<<<'SQL'
            DELETE FROM user_favorites favorites
            USING user_favorites kept
            WHERE favorites.user_id_id = kept.user_id_id
              AND favorites.offer_id_id = kept.offer_id_id
              AND favorites.id > kept.id
        SQL);

        $this->addSql(<<<SQL
            INSERT INTO application (user_id, offer_id, created_at)
            SELECT applications.user_id, duplicates.canonical_id, MIN(applications.created_at)
            FROM application applications
            INNER JOIN ($duplicateMap) duplicates ON duplicates.duplicate_id = applications.offer_id
            WHERE duplicates.duplicate_id <> duplicates.canonical_id
            GROUP BY applications.user_id, duplicates.canonical_id
            ON CONFLICT (user_id, offer_id) DO NOTHING
        SQL);
        $this->addSql(<<<SQL
            DELETE FROM application applications
            USING ($duplicateMap) duplicates
            WHERE applications.offer_id = duplicates.duplicate_id
              AND duplicates.duplicate_id <> duplicates.canonical_id
        SQL);

        $this->addSql(<<<'SQL'
            WITH totals AS (
                SELECT source_id_id, external_url, MIN(id) AS canonical_id, SUM(views_count) AS views_count
                FROM offers
                GROUP BY source_id_id, external_url
            )
            UPDATE offers canonical
            SET views_count = totals.views_count,
                is_duplicate = FALSE
            FROM totals
            WHERE canonical.id = totals.canonical_id
        SQL);
        $this->addSql(<<<SQL
            DELETE FROM offers offers_to_delete
            USING ($duplicateMap) duplicates
            WHERE offers_to_delete.id = duplicates.duplicate_id
              AND duplicates.duplicate_id <> duplicates.canonical_id
        SQL);

        $this->addSql('CREATE UNIQUE INDEX uniq_offer_source_external_url ON offers (source_id_id, external_url)');
        $this->addSql('CREATE TABLE ingestion_trigger_state (workflow VARCHAR(100) NOT NULL, triggered_at TIMESTAMP(0) WITHOUT TIME ZONE NOT NULL, PRIMARY KEY (workflow))');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE ingestion_trigger_state');
        $this->addSql('DROP INDEX uniq_offer_source_external_url');
    }
}
