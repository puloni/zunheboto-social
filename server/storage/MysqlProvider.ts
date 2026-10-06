import mysql from 'mysql2/promise';
import {
  DatabaseConfig,
  IStorageProvider,
  ConnectionTestResult,
  TableInitResult,
  MigrationResult,
  StorageMode
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USER,
  INITIAL_ARTICLE_CATEGORIES,
  INITIAL_ARTICLES,
  INITIAL_LISTING_CATEGORIES,
  INITIAL_LISTINGS,
  INITIAL_STATIC_PAGES,
  INITIAL_MEDIA,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_MENU_ITEMS,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_EMERGENCY_HOTLINES,
  INITIAL_NEWS_TIPS,
  INITIAL_ADMIN_USERS,
  INITIAL_CLASSIFIEDS,
  INITIAL_SPONSORED_ADS
} from '../../src/data/initialData';

export class MysqlStorageProvider implements IStorageProvider {
  private config: DatabaseConfig;
  private pool: mysql.Pool | null = null;
  private tablesInitialized: boolean = false;

  constructor(config: DatabaseConfig) {
    this.config = config;
  }

  getName(): StorageMode {
    return 'database';
  }

  private getDefaultStore(): any {
    return {
      settings: INITIAL_SETTINGS,
      adminUser: INITIAL_ADMIN_USER,
      articleCategories: INITIAL_ARTICLE_CATEGORIES,
      articles: INITIAL_ARTICLES,
      listingCategories: INITIAL_LISTING_CATEGORIES,
      listings: INITIAL_LISTINGS,
      pages: INITIAL_STATIC_PAGES,
      mediaItems: INITIAL_MEDIA,
      galleryPhotos: INITIAL_GALLERY_PHOTOS,
      menuItems: INITIAL_MENU_ITEMS,
      homepageSections: INITIAL_HOMEPAGE_SECTIONS,
      emergencyHotlines: INITIAL_EMERGENCY_HOTLINES,
      newsTips: INITIAL_NEWS_TIPS,
      users: INITIAL_ADMIN_USERS,
      classifieds: INITIAL_CLASSIFIEDS,
      sponsoredAds: INITIAL_SPONSORED_ADS
    };
  }

  /**
   * Lazily creates or returns the connection pool.
   */
  private getPool(): mysql.Pool {
    if (!this.pool) {
      this.pool = mysql.createPool({
        host: this.config.host || 'localhost',
        port: Number(this.config.port) || 3306,
        user: this.config.user || 'root',
        password: this.config.password || '',
        database: this.config.database,
        waitForConnections: true,
        connectionLimit: this.config.connectionLimit || 10,
        queueLimit: 0,
        connectTimeout: 10000,
        charset: 'utf8mb4'
      });
    }
    return this.pool;
  }

  async init(): Promise<void> {
    try {
      await this.initTables();
      this.tablesInitialized = true;
    } catch (e: any) {
      console.warn('MysqlStorageProvider: Automatic table initialization warning (will retry on demand):', e.message);
    }
  }

  /**
   * Performs a live connection check against MySQL/MariaDB.
   */
  async testConnection(): Promise<ConnectionTestResult> {
    const start = Date.now();
    let conn: mysql.PoolConnection | null = null;
    try {
      const pool = this.getPool();
      conn = await pool.getConnection();
      const [rows]: any = await conn.query('SELECT 1 + 1 AS test, VERSION() AS version');
      const latencyMs = Date.now() - start;
      const version = rows?.[0]?.version || 'Unknown';

      return {
        success: true,
        message: `Connected successfully to MySQL/MariaDB (${version}) in ${latencyMs}ms.`,
        version,
        latencyMs
      };
    } catch (err: any) {
      const latencyMs = Date.now() - start;
      let userFriendlyMessage = err.message;

      if (err.code === 'ECONNREFUSED') {
        userFriendlyMessage = `Connection refused at ${this.config.host}:${this.config.port}. Verify that MySQL/MariaDB service is running and accessible.`;
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        userFriendlyMessage = `Access denied for user '${this.config.user}'. Check database username and password.`;
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        userFriendlyMessage = `Database '${this.config.database}' does not exist on host ${this.config.host}. Please create the database in CyberPanel first.`;
      } else if (err.code === 'ENOTFOUND') {
        userFriendlyMessage = `Database host '${this.config.host}' could not be resolved.`;
      }

      return {
        success: false,
        message: userFriendlyMessage,
        latencyMs,
        details: { code: err.code, errno: err.errno }
      };
    } finally {
      if (conn) conn.release();
    }
  }

  /**
   * Creates all required tables with UTF8MB4 charset for clean emoji and multilingual support.
   */
  async initTables(): Promise<TableInitResult> {
    const pool = this.getPool();
    const conn = await pool.getConnection();

    const tableQueries: { name: string; query: string }[] = [
      {
        name: 'zs_settings',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_settings\` (
            \`id\` VARCHAR(50) NOT NULL PRIMARY KEY,
            \`site_name\` VARCHAR(255) DEFAULT NULL,
            \`site_title\` VARCHAR(255) DEFAULT NULL,
            \`tagline\` VARCHAR(255) DEFAULT NULL,
            \`site_url\` VARCHAR(255) DEFAULT NULL,
            \`logo_url\` TEXT DEFAULT NULL,
            \`favicon_url\` TEXT DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_admin_users',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_admin_users\` (
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
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_article_categories',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_article_categories\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`slug\` VARCHAR(255) NOT NULL UNIQUE,
            \`description\` TEXT DEFAULT NULL,
            \`color\` VARCHAR(50) DEFAULT NULL,
            \`order_num\` INT DEFAULT 0,
            \`data_json\` LONGTEXT NOT NULL,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_articles',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_articles\` (
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
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_listing_categories',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_listing_categories\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`name\` VARCHAR(255) NOT NULL,
            \`slug\` VARCHAR(255) NOT NULL UNIQUE,
            \`description\` TEXT DEFAULT NULL,
            \`icon\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL,
            \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_listings',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_listings\` (
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
            \`whatsapp\` VARCHAR(100) DEFAULT NULL,
            \`opening_hours\` VARCHAR(255) DEFAULT NULL,
            \`verified\` TINYINT(1) DEFAULT 0,
            \`featured\` TINYINT(1) DEFAULT 0,
            \`status\` VARCHAR(50) DEFAULT 'published',
            \`views\` INT DEFAULT 0,
            \`created_at\` VARCHAR(100) DEFAULT NULL,
            \`updated_at\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL,
            INDEX \`idx_listings_status\` (\`status\`),
            INDEX \`idx_listings_category\` (\`category_id\`)
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_pages',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_pages\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`title\` VARCHAR(255) NOT NULL,
            \`slug\` VARCHAR(255) NOT NULL UNIQUE,
            \`content\` LONGTEXT DEFAULT NULL,
            \`featured_image\` TEXT DEFAULT NULL,
            \`status\` VARCHAR(50) DEFAULT 'published',
            \`created_at\` VARCHAR(100) DEFAULT NULL,
            \`updated_at\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_media_items',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_media_items\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`title\` VARCHAR(255) DEFAULT NULL,
            \`caption\` TEXT DEFAULT NULL,
            \`alt_text\` TEXT DEFAULT NULL,
            \`filename\` VARCHAR(255) NOT NULL,
            \`url\` TEXT NOT NULL,
            \`file_type\` VARCHAR(100) DEFAULT NULL,
            \`file_size\` BIGINT DEFAULT 0,
            \`created_at\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_gallery_photos',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_gallery_photos\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`title\` VARCHAR(255) DEFAULT NULL,
            \`caption\` TEXT DEFAULT NULL,
            \`image_url\` TEXT NOT NULL,
            \`photographer\` VARCHAR(255) DEFAULT NULL,
            \`location\` VARCHAR(255) DEFAULT NULL,
            \`order_num\` INT DEFAULT 0,
            \`created_at\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_menu_items',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_menu_items\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`label\` VARCHAR(255) NOT NULL,
            \`url\` VARCHAR(500) NOT NULL,
            \`menu_group\` VARCHAR(50) DEFAULT 'main',
            \`order_index\` INT DEFAULT 0,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_homepage_sections',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_homepage_sections\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`title\` VARCHAR(255) DEFAULT NULL,
            \`section_type\` VARCHAR(100) DEFAULT NULL,
            \`enabled\` TINYINT(1) DEFAULT 1,
            \`order_num\` INT DEFAULT 0,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_emergency_hotlines',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_emergency_hotlines\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`title\` VARCHAR(255) NOT NULL,
            \`phone\` VARCHAR(100) DEFAULT NULL,
            \`description\` TEXT DEFAULT NULL,
            \`category\` VARCHAR(100) DEFAULT NULL,
            \`order_num\` INT DEFAULT 0,
            \`enabled\` TINYINT(1) DEFAULT 1,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_news_tips',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_news_tips\` (
            \`id\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`sender_name\` VARCHAR(255) DEFAULT NULL,
            \`sender_contact\` VARCHAR(255) DEFAULT NULL,
            \`message\` LONGTEXT DEFAULT NULL,
            \`location\` VARCHAR(255) DEFAULT NULL,
            \`photo_url\` TEXT DEFAULT NULL,
            \`status\` VARCHAR(50) DEFAULT 'unread',
            \`created_at\` VARCHAR(100) DEFAULT NULL,
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_system_meta',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_system_meta\` (
            \`meta_key\` VARCHAR(100) NOT NULL PRIMARY KEY,
            \`meta_value\` LONGTEXT DEFAULT NULL,
            \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_classifieds',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_classifieds\` (
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
            \`data_json\` LONGTEXT NOT NULL
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      },
      {
        name: 'zs_sponsored_campaigns',
        query: `
          CREATE TABLE IF NOT EXISTS \`zs_sponsored_campaigns\` (
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
          ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `
      }
    ];

    const created: string[] = [];
    try {
      for (const t of tableQueries) {
        await conn.query(t.query);
        created.push(t.name);
      }

      // Ensure avatar_url column supports long data URLs
      try {
        await conn.query("ALTER TABLE `zs_admin_users` MODIFY COLUMN `avatar_url` LONGTEXT DEFAULT NULL");
      } catch (e) {}

      return {
        success: true,
        message: `Successfully verified and initialized ${created.length} database tables.`,
        tablesCreated: created
      };
    } finally {
      conn.release();
    }
  }

  /**
   * Determines if the database has already been initialized.
   * Differentiates between a completely uninitialized database (first run)
   * and an initialized database where specific collections (e.g. articles) have zero rows.
   */
  private async isDatabaseInitialized(conn: any): Promise<boolean> {
    try {
      // 1. Check zs_system_meta for installed marker
      try {
        const [metaRows]: any = await conn.query("SELECT `meta_value` FROM `zs_system_meta` WHERE `meta_key` = 'installed' LIMIT 1");
        if (metaRows && metaRows.length > 0 && metaRows[0].meta_value === '1') {
          return true;
        }
      } catch (e) {
        // Table may not exist yet
      }

      // 2. Check if zs_settings has any rows (existing initialized production database)
      try {
        const [settingsRows]: any = await conn.query("SELECT COUNT(*) AS cnt FROM `zs_settings`");
        if (settingsRows && settingsRows[0] && Number(settingsRows[0].cnt) > 0) {
          try {
            await conn.query("INSERT INTO `zs_system_meta` (`meta_key`, `meta_value`) VALUES ('installed', '1') ON DUPLICATE KEY UPDATE `meta_value` = '1'");
          } catch (e) {}
          return true;
        }
      } catch (e) {}

      // 3. Check if zs_admin_users has any rows
      try {
        const [adminRows]: any = await conn.query("SELECT COUNT(*) AS cnt FROM `zs_admin_users`");
        if (adminRows && adminRows[0] && Number(adminRows[0].cnt) > 0) {
          try {
            await conn.query("INSERT INTO `zs_system_meta` (`meta_key`, `meta_value`) VALUES ('installed', '1') ON DUPLICATE KEY UPDATE `meta_value` = '1'");
          } catch (e) {}
          return true;
        }
      } catch (e) {}

      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * Helper to deserialize records from a table with fallback to full item json.
   */
  private parseRows(rows: any[]): any[] {
    return (rows || []).map((row) => {
      let result: any = {};
      try {
        if (row.data_json) {
          result = JSON.parse(row.data_json);
        }
      } catch (e) {
        // Fallback to row columns if JSON parse failed
      }
      result = { ...result, ...row };
      delete result.data_json;
      delete result.updated_at;

      // Convert common boolean flags that MySQL returns as TINYINT (0 or 1)
      if (result.enabled !== undefined) {
        result.enabled = result.enabled === 1 || result.enabled === '1' || result.enabled === true || result.enabled === 'true';
      }
      if (result.is_active !== undefined) {
        result.is_active = result.is_active === 1 || result.is_active === '1' || result.is_active === true || result.is_active === 'true';
      }
      if (result.verified !== undefined) {
        result.verified = result.verified === 1 || result.verified === '1' || result.verified === true || result.verified === 'true';
      }
      if (result.featured !== undefined) {
        result.featured = result.featured === 1 || result.featured === '1' || result.featured === true || result.featured === 'true';
      }
      if (result.pinned !== undefined) {
        result.pinned = result.pinned === 1 || result.pinned === '1' || result.pinned === true || result.pinned === 'true';
      }
      if (result.breaking !== undefined) {
        result.breaking = result.breaking === 1 || result.breaking === '1' || result.breaking === true || result.breaking === 'true';
      }
      return result;
    });
  }

  async loadStore(): Promise<any> {
    const pool = this.getPool();
    const conn = await pool.getConnection();

    try {
      // Differentiate between first-time uninitialized database and intentionally empty collections
      const isInstalled = await this.isDatabaseInitialized(conn);

      if (!isInstalled) {
        console.log('MysqlStorageProvider: First-time database installation detected. Seeding initial records...');
        conn.release();
        const defaultStore = this.getDefaultStore();
        await this.saveStore(defaultStore);
        const conn2 = await pool.getConnection();
        try {
          await conn2.query("INSERT INTO `zs_system_meta` (`meta_key`, `meta_value`) VALUES ('installed', '1') ON DUPLICATE KEY UPDATE `meta_value` = '1'");
        } catch (e) {} finally {
          conn2.release();
        }
        return defaultStore;
      }

      // 1. Settings
      let settings = INITIAL_SETTINGS;
      try {
        const [settingsRows]: any = await conn.query('SELECT * FROM `zs_settings` LIMIT 1');
        if (settingsRows.length > 0) {
          const row = settingsRows[0];
          if (row.data_json) {
            try {
              settings = { ...INITIAL_SETTINGS, ...JSON.parse(row.data_json) };
            } catch (err) {
              settings = { ...INITIAL_SETTINGS, ...row };
              delete (settings as any).data_json;
            }
          } else {
            settings = { ...INITIAL_SETTINGS, ...row };
            delete (settings as any).data_json;
          }
        }
      } catch (e) {
        console.warn('MysqlStorageProvider: could not load settings table', e);
      }

      // 2. Admin User
      let adminUser = INITIAL_ADMIN_USER;
      try {
        const [adminRows]: any = await conn.query('SELECT * FROM `zs_admin_users` LIMIT 1');
        if (adminRows.length > 0) {
          const row = adminRows[0];
          if (row.data_json) {
            try {
              adminUser = { ...INITIAL_ADMIN_USER, ...JSON.parse(row.data_json) };
            } catch (err) {
              adminUser = { ...INITIAL_ADMIN_USER, ...row };
              delete (adminUser as any).data_json;
            }
          } else {
            adminUser = { ...INITIAL_ADMIN_USER, ...row };
            delete (adminUser as any).data_json;
          }
        }
      } catch (e) {
        console.warn('MysqlStorageProvider: could not load admin table', e);
      }

      // 3. Article Categories (empty array is valid data)
      let articleCategories: any[] = [];
      try {
        const [catRows]: any = await conn.query('SELECT * FROM `zs_article_categories` ORDER BY `order_num` ASC');
        articleCategories = this.parseRows(catRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_article_categories', e);
      }

      // 4. Articles (empty array is valid data)
      let articles: any[] = [];
      try {
        const [artRows]: any = await conn.query('SELECT * FROM `zs_articles` ORDER BY `published_at` DESC');
        articles = this.parseRows(artRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_articles', e);
      }

      // 5. Listing Categories (empty array is valid data)
      let listingCategories: any[] = [];
      try {
        const [lcatRows]: any = await conn.query('SELECT * FROM `zs_listing_categories`');
        listingCategories = this.parseRows(lcatRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_listing_categories', e);
      }

      // 6. Listings (empty array is valid data)
      let listings: any[] = [];
      try {
        const [listRows]: any = await conn.query('SELECT * FROM `zs_listings` ORDER BY `name` ASC');
        listings = this.parseRows(listRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_listings', e);
      }

      // 7. Pages (empty array is valid data)
      let pages: any[] = [];
      try {
        const [pageRows]: any = await conn.query('SELECT * FROM `zs_pages`');
        pages = this.parseRows(pageRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_pages', e);
      }

      // 8. Media Items (empty array is valid data)
      let mediaItems: any[] = [];
      try {
        const [mediaRows]: any = await conn.query('SELECT * FROM `zs_media_items` ORDER BY `created_at` DESC');
        mediaItems = this.parseRows(mediaRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_media_items', e);
      }

      // 9. Gallery Photos (empty array is valid data)
      let galleryPhotos: any[] = [];
      try {
        const [galRows]: any = await conn.query('SELECT * FROM `zs_gallery_photos` ORDER BY `order_num` ASC');
        galleryPhotos = this.parseRows(galRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_gallery_photos', e);
      }

      // 10. Menu Items (empty array is valid data)
      let menuItems: any[] = [];
      try {
        const [menuRows]: any = await conn.query('SELECT * FROM `zs_menu_items` ORDER BY `order_index` ASC');
        menuItems = this.parseRows(menuRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_menu_items', e);
      }

      // 11. Homepage Sections (empty array is valid data)
      let homepageSections: any[] = [];
      try {
        const [secRows]: any = await conn.query('SELECT * FROM `zs_homepage_sections` ORDER BY `order_num` ASC');
        homepageSections = this.parseRows(secRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_homepage_sections', e);
      }

      // 12. Emergency Hotlines (empty array is valid data)
      let emergencyHotlines: any[] = [];
      try {
        const [hotRows]: any = await conn.query('SELECT * FROM `zs_emergency_hotlines` ORDER BY `order_num` ASC');
        emergencyHotlines = this.parseRows(hotRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_emergency_hotlines', e);
      }

      // 13. News Tips (empty array is valid data)
      let newsTips: any[] = [];
      try {
        const [tipRows]: any = await conn.query('SELECT * FROM `zs_news_tips` ORDER BY `created_at` DESC');
        newsTips = this.parseRows(tipRows);
      } catch (e) {
        console.warn('MysqlStorageProvider: error querying zs_news_tips', e);
      }

      // 14. Editorial Users
      let users: any[] = [];
      try {
        const [userRows]: any = await conn.query('SELECT * FROM `zs_admin_users`');
        users = this.parseRows(userRows);
        if (!users || users.length === 0) users = INITIAL_ADMIN_USERS;
      } catch (e) {
        users = INITIAL_ADMIN_USERS;
      }

      // 15. Local Classifieds
      let classifieds: any[] = [];
      try {
        const [classRows]: any = await conn.query('SELECT * FROM `zs_classifieds` ORDER BY `created_at` DESC');
        classifieds = this.parseRows(classRows);
        if (!classifieds || classifieds.length === 0) classifieds = INITIAL_CLASSIFIEDS;
      } catch (e) {
        classifieds = INITIAL_CLASSIFIEDS;
      }

      // 16. Sponsored Campaigns
      let sponsoredAds: any[] = [];
      try {
        const [adRows]: any = await conn.query('SELECT * FROM `zs_sponsored_campaigns`');
        sponsoredAds = this.parseRows(adRows);
        if (!sponsoredAds || sponsoredAds.length === 0) sponsoredAds = INITIAL_SPONSORED_ADS;
      } catch (e) {
        sponsoredAds = INITIAL_SPONSORED_ADS;
      }

      return {
        settings,
        adminUser,
        users,
        articleCategories,
        articles,
        listingCategories,
        listings,
        pages,
        mediaItems,
        galleryPhotos,
        menuItems,
        homepageSections,
        emergencyHotlines,
        newsTips,
        classifieds,
        sponsoredAds
      };
    } finally {
      conn.release();
    }
  }

  async saveKey(key: string, data: any): Promise<boolean> {
    const pool = this.getPool();
    const conn = await pool.getConnection();

    try {
      await conn.beginTransaction();

      switch (key) {
        case 'settings': {
          let settingsToSave = { ...data };
          // If incoming settings data does not have weather_api_key, preserve existing secret from DB
          if (!settingsToSave.weather_api_key) {
            try {
              const [existingRows]: any = await conn.query("SELECT `data_json` FROM `zs_settings` WHERE `id` = 'default'");
              if (existingRows && existingRows[0]?.data_json) {
                const parsedExisting = JSON.parse(existingRows[0].data_json);
                if (parsedExisting.weather_api_key) {
                  settingsToSave.weather_api_key = parsedExisting.weather_api_key;
                }
              }
            } catch (e) {}
          }
          // Ensure favicon_url and site_icon_url are synchronized
          const activeFavicon = settingsToSave.favicon_url || settingsToSave.site_icon_url || '';
          if (activeFavicon) {
            settingsToSave.favicon_url = activeFavicon;
            settingsToSave.site_icon_url = activeFavicon;
          }
          const json = JSON.stringify(settingsToSave);
          await conn.query(
            `REPLACE INTO \`zs_settings\` (\`id\`, \`site_name\`, \`site_title\`, \`tagline\`, \`site_url\`, \`logo_url\`, \`favicon_url\`, \`data_json\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              'default',
              settingsToSave.site_name || '',
              settingsToSave.site_title || '',
              settingsToSave.tagline || '',
              settingsToSave.site_url || '',
              settingsToSave.logo_url || '',
              settingsToSave.favicon_url || '',
              json
            ]
          );
          break;
        }

        case 'adminUser': {
          const json = JSON.stringify(data);
          await conn.query(
            `REPLACE INTO \`zs_admin_users\` (\`id\`, \`username\`, \`name\`, \`display_name\`, \`email\`, \`role\`, \`bio\`, \`avatar_url\`, \`data_json\`, \`created_at\`, \`last_login\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              data.id || 'admin_1',
              data.username || 'admin',
              data.name || '',
              data.display_name || '',
              data.email || '',
              data.role || 'superadmin',
              data.bio || '',
              data.avatar_url || '',
              json,
              data.created_at || '',
              data.last_login || ''
            ]
          );
          break;
        }

        case 'articleCategories': {
          await conn.query('DELETE FROM `zs_article_categories`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_article_categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`color\`, \`order_num\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.name,
                item.slug,
                item.description || '',
                item.color || '',
                item.order || 0,
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'articles': {
          await conn.query('DELETE FROM `zs_articles`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_articles\`
                (\`id\`, \`title\`, \`slug\`, \`excerpt\`, \`content\`, \`featured_image\`, \`category_id\`, \`author_name\`, \`status\`, \`published_at\`, \`created_at\`, \`updated_at\`, \`views\`, \`read_time_minutes\`, \`featured_lead\`, \`tags\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title,
                item.slug,
                item.excerpt || '',
                item.content || '',
                item.featured_image || '',
                item.category_id || '',
                item.author_name || '',
                item.status || 'published',
                item.published_at || '',
                item.created_at || '',
                item.updated_at || '',
                item.views || 0,
                item.read_time_minutes || 3,
                item.featured_lead ? 1 : 0,
                Array.isArray(item.tags) ? item.tags.join(',') : (item.tags || ''),
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'listingCategories': {
          await conn.query('DELETE FROM `zs_listing_categories`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_listing_categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`icon\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.name,
                item.slug,
                item.description || '',
                item.icon || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'listings': {
          await conn.query('DELETE FROM `zs_listings`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_listings\`
                (\`id\`, \`name\`, \`slug\`, \`category_id\`, \`description\`, \`featured_image\`, \`address\`, \`location_area\`, \`phone\`, \`email\`, \`website\`, \`whatsapp\`, \`opening_hours\`, \`verified\`, \`featured\`, \`status\`, \`views\`, \`created_at\`, \`updated_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.name,
                item.slug,
                item.category_id || '',
                item.description || '',
                item.featured_image || '',
                item.address || '',
                item.location_area || '',
                item.phone || '',
                item.email || '',
                item.website || '',
                item.whatsapp || '',
                item.opening_hours || '',
                item.verified ? 1 : 0,
                item.featured ? 1 : 0,
                item.status || 'published',
                item.views || 0,
                item.created_at || '',
                item.updated_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'pages': {
          await conn.query('DELETE FROM `zs_pages`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_pages\` (\`id\`, \`title\`, \`slug\`, \`content\`, \`featured_image\`, \`status\`, \`created_at\`, \`updated_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title,
                item.slug,
                item.content || '',
                item.featured_image || '',
                item.status || 'published',
                item.created_at || '',
                item.updated_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'mediaItems': {
          await conn.query('DELETE FROM `zs_media_items`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_media_items\` (\`id\`, \`title\`, \`caption\`, \`alt_text\`, \`filename\`, \`url\`, \`file_type\`, \`file_size\`, \`created_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title || '',
                item.caption || '',
                item.alt_text || '',
                item.filename || '',
                item.url || '',
                item.file_type || '',
                item.file_size || 0,
                item.created_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'galleryPhotos': {
          await conn.query('DELETE FROM `zs_gallery_photos`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_gallery_photos\` (\`id\`, \`title\`, \`caption\`, \`image_url\`, \`photographer\`, \`location\`, \`order_num\`, \`created_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title || '',
                item.caption || '',
                item.image_url || '',
                item.photographer || '',
                item.location || '',
                item.order || 0,
                item.created_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'menuItems': {
          await conn.query('DELETE FROM `zs_menu_items`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_menu_items\` (\`id\`, \`label\`, \`url\`, \`menu_group\`, \`order_index\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.label,
                item.url,
                item.menu_group || 'main',
                item.order_index || 0,
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'homepageSections': {
          await conn.query('DELETE FROM `zs_homepage_sections`');
          for (const item of data || []) {
            const isEnabled = item.enabled === 1 || item.enabled === '1' || item.enabled === true || item.enabled === 'true';
            const itemToSave = { ...item, enabled: isEnabled };
            await conn.query(
              `INSERT INTO \`zs_homepage_sections\` (\`id\`, \`title\`, \`section_type\`, \`enabled\`, \`order_num\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title || '',
                item.section_type || '',
                isEnabled ? 1 : 0,
                item.order || 0,
                JSON.stringify(itemToSave)
              ]
            );
          }
          break;
        }

        case 'emergencyHotlines': {
          await conn.query('DELETE FROM `zs_emergency_hotlines`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_emergency_hotlines\` (\`id\`, \`title\`, \`phone\`, \`description\`, \`category\`, \`order_num\`, \`enabled\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title,
                item.phone || item.number || '',
                item.description || '',
                item.category || '',
                item.order || 0,
                item.enabled !== false ? 1 : 0,
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'newsTips': {
          await conn.query('DELETE FROM `zs_news_tips`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_news_tips\` (\`id\`, \`sender_name\`, \`sender_contact\`, \`message\`, \`location\`, \`photo_url\`, \`status\`, \`created_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.sender_name || '',
                item.sender_contact || '',
                item.message || '',
                item.location || '',
                item.photo_url || '',
                item.status || 'unread',
                item.created_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'users': {
          await conn.query('DELETE FROM `zs_admin_users`');
          for (const user of data || []) {
            await conn.query(
              `INSERT INTO \`zs_admin_users\` (\`id\`, \`name\`, \`display_name\`, \`username\`, \`email\`, \`bio\`, \`avatar_url\`, \`role\`, \`created_at\`, \`last_login\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                user.id,
                user.name || '',
                user.display_name || user.name || '',
                user.username || '',
                user.email || '',
                user.bio || '',
                user.avatar_url || '',
                user.role || 'author',
                user.created_at || '',
                user.last_login || '',
                JSON.stringify(user)
              ]
            );
          }
          break;
        }

        case 'classifieds': {
          await conn.query('DELETE FROM \`zs_classifieds\`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_classifieds\` (\`id\`, \`title\`, \`category\`, \`listing_type\`, \`location\`, \`price_or_salary\`, \`contact_name\`, \`contact_phone\`, \`status\`, \`created_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title || '',
                item.category || 'jobs',
                item.listing_type || 'offered',
                item.location || '',
                item.price_or_salary || '',
                item.contact_name || '',
                item.contact_phone || '',
                item.status || 'active',
                item.created_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        case 'sponsoredAds': {
          await conn.query('DELETE FROM \`zs_sponsored_campaigns\`');
          for (const item of data || []) {
            await conn.query(
              `INSERT INTO \`zs_sponsored_campaigns\` (\`id\`, \`title\`, \`sponsor_name\`, \`placement\`, \`destination_url\`, \`active\`, \`impressions\`, \`clicks\`, \`created_at\`, \`data_json\`)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                item.id,
                item.title || '',
                item.sponsor_name || '',
                item.placement || 'leaderboard_top',
                item.destination_url || '',
                item.active !== false ? 1 : 0,
                item.impressions || 0,
                item.clicks || 0,
                item.created_at || '',
                JSON.stringify(item)
              ]
            );
          }
          break;
        }

        default:
          console.warn(`MysqlStorageProvider: Unknown key ${key}`);
          break;
      }

      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.error(`MysqlStorageProvider: Failed to save key ${key}:`, err);
      return false;
    } finally {
      conn.release();
    }
  }

  async deleteArticle(id: string): Promise<boolean> {
    const pool = this.getPool();
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.query('DELETE FROM `zs_articles` WHERE `id` = ?', [id]);
      await conn.commit();
      return true;
    } catch (err) {
      await conn.rollback();
      console.error('MysqlStorageProvider: Failed to delete article:', err);
      return false;
    } finally {
      conn.release();
    }
  }

  async saveStore(store: any): Promise<boolean> {
    const keys = [
      'settings',
      'adminUser',
      'articleCategories',
      'articles',
      'listingCategories',
      'listings',
      'pages',
      'mediaItems',
      'galleryPhotos',
      'menuItems',
      'homepageSections',
      'emergencyHotlines',
      'newsTips'
    ];

    for (const key of keys) {
      if (store[key] !== undefined) {
        const ok = await this.saveKey(key, store[key]);
        if (!ok) return false;
      }
    }
    return true;
  }

  /**
   * Imports all entities from JSON store into MySQL database tables.
   */
  async migrateFromJson(jsonStore: any): Promise<MigrationResult> {
    // 1. Ensure tables exist
    await this.initTables();

    // 2. Perform save
    const counts: Record<string, number> = {
      articles: jsonStore.articles?.length || 0,
      articleCategories: jsonStore.articleCategories?.length || 0,
      listings: jsonStore.listings?.length || 0,
      listingCategories: jsonStore.listingCategories?.length || 0,
      pages: jsonStore.pages?.length || 0,
      mediaItems: jsonStore.mediaItems?.length || 0,
      galleryPhotos: jsonStore.galleryPhotos?.length || 0,
      menuItems: jsonStore.menuItems?.length || 0,
      homepageSections: jsonStore.homepageSections?.length || 0,
      emergencyHotlines: jsonStore.emergencyHotlines?.length || 0,
      newsTips: jsonStore.newsTips?.length || 0
    };

    const ok = await this.saveStore(jsonStore);
    if (!ok) {
      throw new Error('Database migration failed during bulk insert.');
    }

    return {
      success: true,
      message: `Successfully migrated all content into MySQL/MariaDB database tables.`,
      counts,
      timestamp: new Date().toISOString()
    };
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}
