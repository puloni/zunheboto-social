import { PoolConnection } from 'mysql2/promise';
import { Migration } from './types';

export const migration001CoreSchema: Migration = {
  name: '001_core_schema',
  description: 'Creates all foundational Zunheboto Social tables with utf8mb4 collation and indexes',
  up: async (conn: PoolConnection) => {
    const tableQueries = [
      `CREATE TABLE IF NOT EXISTS \`zs_settings\` (
        \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
        \`site_name\` VARCHAR(255) DEFAULT NULL,
        \`site_title\` VARCHAR(255) DEFAULT NULL,
        \`tagline\` VARCHAR(255) DEFAULT NULL,
        \`site_url\` VARCHAR(255) DEFAULT NULL,
        \`logo_url\` TEXT DEFAULT NULL,
        \`favicon_url\` TEXT DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_admin_users\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`username\` VARCHAR(100) NOT NULL UNIQUE,
        \`name\` VARCHAR(255) DEFAULT NULL,
        \`display_name\` VARCHAR(255) DEFAULT NULL,
        \`email\` VARCHAR(255) DEFAULT NULL,
        \`role\` VARCHAR(50) DEFAULT 'superadmin',
        \`bio\` TEXT DEFAULT NULL,
        \`avatar_url\` LONGTEXT DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`last_login\` VARCHAR(100) DEFAULT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_article_categories\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`description\` TEXT DEFAULT NULL,
        \`color\` VARCHAR(50) DEFAULT NULL,
        \`order_num\` INT DEFAULT 0,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_articles\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(500) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`excerpt\` TEXT DEFAULT NULL,
        \`content\` LONGTEXT DEFAULT NULL,
        \`featured_image\` TEXT DEFAULT NULL,
        \`category_id\` VARCHAR(100) DEFAULT NULL,
        \`author_name\` VARCHAR(255) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'published',
        \`published_at\` VARCHAR(100) DEFAULT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`updated_at\` VARCHAR(100) DEFAULT NULL,
        \`views\` INT DEFAULT 0,
        \`read_time_minutes\` INT DEFAULT 3,
        \`featured_lead\` TINYINT(1) DEFAULT 0,
        \`tags\` TEXT DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        INDEX \`idx_articles_status\` (\`status\`),
        INDEX \`idx_articles_category\` (\`category_id\`),
        INDEX \`idx_articles_published\` (\`published_at\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_listing_categories\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`description\` TEXT DEFAULT NULL,
        \`icon\` VARCHAR(100) DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_listings\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`category_id\` VARCHAR(100) DEFAULT NULL,
        \`description\` LONGTEXT DEFAULT NULL,
        \`featured_image\` TEXT DEFAULT NULL,
        \`address\` TEXT DEFAULT NULL,
        \`location_area\` VARCHAR(100) DEFAULT NULL,
        \`phone\` VARCHAR(100) DEFAULT NULL,
        \`email\` VARCHAR(255) DEFAULT NULL,
        \`website\` VARCHAR(500) DEFAULT NULL,
        \`opening_hours\` VARCHAR(255) DEFAULT NULL,
        \`verified\` TINYINT(1) DEFAULT 1,
        \`featured\` TINYINT(1) DEFAULT 0,
        \`status\` VARCHAR(50) DEFAULT 'published',
        \`views\` INT DEFAULT 0,
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`updated_at\` VARCHAR(100) DEFAULT NULL,
        INDEX \`idx_listings_category\` (\`category_id\`),
        INDEX \`idx_listings_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_pages\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`slug\` VARCHAR(255) NOT NULL UNIQUE,
        \`content\` LONGTEXT DEFAULT NULL,
        \`featured_image\` TEXT DEFAULT NULL,
        \`is_published\` TINYINT(1) DEFAULT 1,
        \`order_index\` INT DEFAULT 0,
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`updated_at\` VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_media_items\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) NOT NULL,
        \`url\` TEXT NOT NULL,
        \`type\` VARCHAR(50) DEFAULT 'image',
        \`size\` INT DEFAULT 0,
        \`alt_text\` VARCHAR(255) DEFAULT NULL,
        \`category\` VARCHAR(100) DEFAULT 'general',
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_gallery_photos\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`url\` TEXT NOT NULL,
        \`caption\` TEXT DEFAULT NULL,
        \`credit\` VARCHAR(255) DEFAULT NULL,
        \`location\` VARCHAR(255) DEFAULT NULL,
        \`order_num\` INT DEFAULT 0,
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_menu_items\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`label\` VARCHAR(100) NOT NULL,
        \`url\` VARCHAR(500) NOT NULL,
        \`menu_group\` VARCHAR(50) DEFAULT 'primary',
        \`order_index\` INT DEFAULT 0,
        \`parent_id\` VARCHAR(100) DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_homepage_sections\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`section_key\` VARCHAR(100) NOT NULL UNIQUE,
        \`section_type\` VARCHAR(100) NOT NULL,
        \`title\` VARCHAR(255) NOT NULL,
        \`order_num\` INT DEFAULT 0,
        \`enabled\` TINYINT(1) DEFAULT 1,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_emergency_hotlines\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`phone\` VARCHAR(100) NOT NULL,
        \`category\` VARCHAR(100) DEFAULT 'General',
        \`order_num\` INT DEFAULT 0,
        \`enabled\` TINYINT(1) DEFAULT 1,
        \`data_json\` LONGTEXT NOT NULL,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_news_tips\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`name\` VARCHAR(255) DEFAULT NULL,
        \`contact\` VARCHAR(255) DEFAULT NULL,
        \`message\` LONGTEXT NOT NULL,
        \`status\` VARCHAR(50) DEFAULT 'unread',
        \`data_json\` LONGTEXT NOT NULL,
        \`created_at\` VARCHAR(100) DEFAULT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_classifieds\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`category\` VARCHAR(100) NOT NULL,
        \`listing_type\` VARCHAR(50) DEFAULT 'offered',
        \`location\` VARCHAR(255) DEFAULT NULL,
        \`price_or_salary\` VARCHAR(100) DEFAULT NULL,
        \`contact_name\` VARCHAR(255) DEFAULT NULL,
        \`contact_phone\` VARCHAR(100) DEFAULT NULL,
        \`status\` VARCHAR(50) DEFAULT 'active',
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL,
        INDEX \`idx_classifieds_cat\` (\`category\`),
        INDEX \`idx_classifieds_status\` (\`status\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_sponsored_campaigns\` (
        \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`title\` VARCHAR(255) NOT NULL,
        \`sponsor_name\` VARCHAR(255) DEFAULT NULL,
        \`placement\` VARCHAR(100) DEFAULT 'leaderboard_top',
        \`destination_url\` TEXT DEFAULT NULL,
        \`active\` TINYINT(1) DEFAULT 1,
        \`impressions\` INT DEFAULT 0,
        \`clicks\` INT DEFAULT 0,
        \`created_at\` VARCHAR(100) DEFAULT NULL,
        \`data_json\` LONGTEXT NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,

      `CREATE TABLE IF NOT EXISTS \`zs_system_meta\` (
        \`meta_key\` VARCHAR(100) NOT NULL PRIMARY KEY,
        \`meta_value\` LONGTEXT DEFAULT NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
    ];

    for (const q of tableQueries) {
      await conn.query(q);
    }
  }
};
