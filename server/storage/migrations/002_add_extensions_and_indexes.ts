import { PoolConnection } from 'mysql2/promise';
import { Migration } from './types';

export const migration002ExtensionsAndIndexes: Migration = {
  name: '002_add_extensions_and_indexes',
  description: 'Ensures long avatar support, additional performance indexes, and system metadata structure',
  up: async (conn: PoolConnection) => {
    // 1. Ensure avatar_url is LONGTEXT in zs_admin_users
    try {
      await conn.query("ALTER TABLE `zs_admin_users` MODIFY COLUMN `avatar_url` LONGTEXT DEFAULT NULL");
    } catch (e) {
      // Ignore if already LONGTEXT
    }

    // 2. Safe helper to add indexes if not already present
    const ensureIndex = async (table: string, indexName: string, columnDef: string) => {
      try {
        const [rows]: any = await conn.query(
          `SELECT COUNT(1) AS cnt FROM information_schema.statistics 
           WHERE table_schema = DATABASE() AND table_name = ? AND index_name = ?`,
          [table, indexName]
        );
        if (!rows || rows[0]?.cnt === 0) {
          await conn.query(`ALTER TABLE \`${table}\` ADD INDEX \`${indexName}\` (${columnDef})`);
        }
      } catch (e) {
        // Table or index may vary across MariaDB versions; continue safely
      }
    };

    await ensureIndex('zs_articles', 'idx_articles_author', '`author_name`');
    await ensureIndex('zs_media_items', 'idx_media_category', '`category`');
    await ensureIndex('zs_news_tips', 'idx_news_tips_status', '`status`');
    await ensureIndex('zs_classifieds', 'idx_classifieds_created', '`created_at`');
  }
};
