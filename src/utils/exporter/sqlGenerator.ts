import {
  SiteSettings,
  Article,
  Listing,
  StaticPage,
  EmergencyHotline,
  ArticleCategory,
  ListingCategory,
  MenuItem,
  GalleryPhoto,
  HomepageSectionConfig,
  AdminUser,
  NewsTip,
  MediaItem
} from '../../types';

export function generateCompleteSchemaSql(
  settings: SiteSettings,
  articles: Article[],
  listings: Listing[],
  pages: StaticPage[],
  hotlines: EmergencyHotline[],
  articleCategories: ArticleCategory[],
  listingCategories: ListingCategory[],
  menuItems: MenuItem[],
  galleryPhotos: GalleryPhoto[] = [],
  homepageSections: HomepageSectionConfig[] = [],
  adminUser?: AdminUser | null,
  newsTips: NewsTip[] = [],
  mediaItems: MediaItem[] = []
): string {
  let sql = `-- ==========================================================
-- Zunheboto Social — Complete Relational Database Schema & Data
-- PHP 8.2+ / MySQL 8.0+ / MariaDB 10.5+
-- Production URL: https://zunheboto.social
-- Generated: ` + new Date().toISOString() + `
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS \`zs_settings\` (
  \`setting_key\` VARCHAR(100) PRIMARY KEY,
  \`setting_value\` LONGTEXT,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Administrators & Authors Table
CREATE TABLE IF NOT EXISTS \`zs_users\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(150) NOT NULL,
  \`username\` VARCHAR(80) NOT NULL UNIQUE,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`bio\` TEXT,
  \`avatar_url\` VARCHAR(500),
  \`role\` VARCHAR(30) DEFAULT 'superadmin',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`last_login\` DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Article Categories Table
CREATE TABLE IF NOT EXISTS \`zs_article_categories\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`description\` TEXT,
  \`color\` VARCHAR(20) DEFAULT '#0284C7',
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Articles & News Table
CREATE TABLE IF NOT EXISTS \`zs_articles\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(255) NOT NULL,
  \`slug\` VARCHAR(255) NOT NULL UNIQUE,
  \`excerpt\` TEXT,
  \`content\` LONGTEXT NOT NULL,
  \`featured_image\` VARCHAR(500),
  \`category_id\` VARCHAR(64),
  \`author_id\` VARCHAR(64),
  \`author_name\` VARCHAR(150),
  \`status\` ENUM('published','draft','unpublished','trash') DEFAULT 'published',
  \`is_featured\` TINYINT(1) DEFAULT 0,
  \`published_at\` DATETIME,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`views\` INT DEFAULT 0,
  \`read_time_minutes\` INT DEFAULT 3,
  \`seo_title\` VARCHAR(255),
  \`meta_description\` TEXT,
  \`canonical_url\` VARCHAR(500),
  \`tags\` VARCHAR(500),
  INDEX (\`slug\`),
  INDEX (\`category_id\`),
  INDEX (\`status\`),
  INDEX (\`published_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Directory Categories Table
CREATE TABLE IF NOT EXISTS \`zs_listing_categories\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`slug\` VARCHAR(120) NOT NULL UNIQUE,
  \`icon\` VARCHAR(50) DEFAULT 'Building2',
  \`description\` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Directory Listings Table
CREATE TABLE IF NOT EXISTS \`zs_listings\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`name\` VARCHAR(200) NOT NULL,
  \`slug\` VARCHAR(220) NOT NULL UNIQUE,
  \`category_id\` VARCHAR(64),
  \`description\` LONGTEXT,
  \`featured_image\` VARCHAR(500),
  \`gallery_images\` LONGTEXT,
  \`address\` VARCHAR(300),
  \`location_area\` VARCHAR(150),
  \`latitude\` DECIMAL(10, 8),
  \`longitude\` DECIMAL(11, 8),
  \`phone\` VARCHAR(80),
  \`email\` VARCHAR(150),
  \`website\` VARCHAR(300),
  \`whatsapp\` VARCHAR(50),
  \`social_links\` TEXT,
  \`opening_hours\` VARCHAR(200),
  \`verified\` TINYINT(1) DEFAULT 1,
  \`status\` ENUM('published','draft','trash') DEFAULT 'published',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`views\` INT DEFAULT 0,
  INDEX (\`slug\`),
  INDEX (\`category_id\`),
  INDEX (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Static Pages Table
CREATE TABLE IF NOT EXISTS \`zs_pages\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`slug\` VARCHAR(200) NOT NULL UNIQUE,
  \`content\` LONGTEXT,
  \`featured_image\` VARCHAR(500),
  \`status\` ENUM('published','draft','trash') DEFAULT 'published',
  \`seo_title\` VARCHAR(255),
  \`meta_description\` TEXT,
  \`canonical_url\` VARCHAR(500),
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX (\`slug\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Media Library Table
CREATE TABLE IF NOT EXISTS \`zs_media\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(255),
  \`caption\` TEXT,
  \`alt_text\` VARCHAR(255),
  \`filename\` VARCHAR(255) NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`file_type\` VARCHAR(100),
  \`file_size\` BIGINT,
  \`width\` INT,
  \`height\` INT,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. District Photo Gallery Table
CREATE TABLE IF NOT EXISTS \`zs_gallery\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(200),
  \`caption\` TEXT,
  \`image_url\` VARCHAR(500) NOT NULL,
  \`photographer\` VARCHAR(150),
  \`location\` VARCHAR(150),
  \`sort_order\` INT DEFAULT 0,
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Navigation Menus Table
CREATE TABLE IF NOT EXISTS \`zs_menus\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`menu_group\` VARCHAR(50) NOT NULL DEFAULT 'main',
  \`label\` VARCHAR(100) NOT NULL,
  \`url\` VARCHAR(500) NOT NULL,
  \`type\` VARCHAR(50) DEFAULT 'custom',
  \`target\` VARCHAR(20) DEFAULT '_self',
  \`sort_order\` INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Homepage Sections Table
CREATE TABLE IF NOT EXISTS \`zs_homepage_sections\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`section_type\` VARCHAR(50) NOT NULL,
  \`title\` VARCHAR(200),
  \`subtitle\` VARCHAR(300),
  \`button_text\` VARCHAR(100),
  \`button_url\` VARCHAR(300),
  \`enabled\` TINYINT(1) DEFAULT 1,
  \`sort_order\` INT DEFAULT 0,
  \`content_source\` VARCHAR(50) DEFAULT 'latest',
  \`category_id\` VARCHAR(64),
  \`manual_article_ids\` TEXT,
  \`item_count\` INT DEFAULT 3,
  \`layout\` VARCHAR(50) DEFAULT 'grid'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Emergency Hotlines Table
CREATE TABLE IF NOT EXISTS \`zs_emergency_hotlines\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`title\` VARCHAR(200) NOT NULL,
  \`phone\` VARCHAR(80) NOT NULL,
  \`description\` TEXT,
  \`category\` VARCHAR(50) DEFAULT 'helpline',
  \`sort_order\` INT DEFAULT 0,
  \`enabled\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Citizen News Tips Table
CREATE TABLE IF NOT EXISTS \`zs_news_tips\` (
  \`id\` VARCHAR(64) PRIMARY KEY,
  \`sender_name\` VARCHAR(150),
  \`sender_contact\` VARCHAR(200),
  \`message\` LONGTEXT NOT NULL,
  \`location\` VARCHAR(200),
  \`photo_url\` VARCHAR(500),
  \`status\` ENUM('unread','reviewed','archived') DEFAULT 'unread',
  \`created_at\` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================================
-- SEED DATA INITIALIZATION
-- ==========================================================

`;

  const esc = (val: any): string => {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? '1' : '0';
    if (typeof val === 'number') return String(val);
    const str = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${str}'`;
  };

  // Seed Settings
  sql += `-- Settings\n`;
  Object.entries(settings).forEach(([k, v]) => {
    const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
    sql += `INSERT INTO \`zs_settings\` (\`setting_key\`, \`setting_value\`) VALUES (${esc(k)}, ${esc(valStr)}) ON DUPLICATE KEY UPDATE \`setting_value\` = VALUES(\`setting_value\`);\n`;
  });

  // Seed Admin User (default password hash: admin123 or bcrypt)
  const defaultHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'; // password
  const uName = adminUser?.name || 'Administrator';
  const uUser = adminUser?.username || 'administrator';
  const uEmail = adminUser?.email || 'admin@zunheboto.social';
  const uBio = adminUser?.bio || 'Chief Editor & Lead Journalist at Zunheboto Social';
  const uAvatar = adminUser?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300';
  sql += `\n-- Admin User\nINSERT INTO \`zs_users\` (\`id\`, \`name\`, \`username\`, \`email\`, \`password_hash\`, \`bio\`, \`avatar_url\`, \`role\`) VALUES (1, ${esc(uName)}, ${esc(uUser)}, ${esc(uEmail)}, ${esc(defaultHash)}, ${esc(uBio)}, ${esc(uAvatar)}, 'superadmin') ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;

  // Seed Article Categories
  sql += `\n-- Article Categories\n`;
  articleCategories.forEach((cat, idx) => {
    sql += `INSERT INTO \`zs_article_categories\` (\`id\`, \`name\`, \`slug\`, \`description\`, \`color\`, \`sort_order\`) VALUES (${esc(cat.id)}, ${esc(cat.name)}, ${esc(cat.slug)}, ${esc(cat.description || '')}, ${esc(cat.color || '#0284C7')}, ${idx}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;
  });

  // Seed Articles
  sql += `\n-- Articles\n`;
  articles.forEach((a) => {
    const isFeat = (a.is_featured_story || a.featured_lead) ? 1 : 0;
    const tags = Array.isArray(a.tags) ? a.tags.join(',') : (a.tags || '');
    sql += `INSERT INTO \`zs_articles\` (\`id\`, \`title\`,\`slug\`,\`excerpt\`,\`content\`,\`featured_image\`,\`category_id\`,\`author_id\`,\`author_name\`,\`status\`,\`is_featured\`,\`published_at\`,\`created_at\`,\`updated_at\`,\`views\`,\`read_time_minutes\`,\`seo_title\`,\`meta_description\`,\`canonical_url\`,\`tags\`) VALUES (${esc(a.id)}, ${esc(a.title)}, ${esc(a.slug)}, ${esc(a.excerpt)}, ${esc(a.content)}, ${esc(a.featured_image)}, ${esc(a.category_id)}, ${esc(a.author_id || '1')}, ${esc(a.author_name || 'Staff Reporter')}, ${esc(a.status)}, ${isFeat}, ${esc(a.published_at || new Date().toISOString())}, ${esc(a.created_at || new Date().toISOString())}, ${esc(a.updated_at || new Date().toISOString())}, ${a.views || 0}, ${a.read_time_minutes || 3}, ${esc(a.seo_title || a.title)}, ${esc(a.meta_description || a.excerpt)}, ${esc(a.canonical_url || '')}, ${esc(tags)}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
  });

  // Seed Listing Categories
  sql += `\n-- Listing Categories\n`;
  listingCategories.forEach((lc) => {
    sql += `INSERT INTO \`zs_listing_categories\` (\`id\`, \`name\`, \`slug\`, \`icon\`, \`description\`) VALUES (${esc(lc.id)}, ${esc(lc.name)}, ${esc(lc.slug)}, ${esc(lc.icon || 'Building2')}, ${esc(lc.description || '')}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;
  });

  // Seed Listings
  sql += `\n-- Directory Listings\n`;
  listings.forEach((l) => {
    const galleryStr = Array.isArray(l.gallery_images) ? JSON.stringify(l.gallery_images) : (l.gallery_images || '[]');
    const socialStr = typeof l.social_links === 'object' ? JSON.stringify(l.social_links) : (l.social_links || '{}');
    sql += `INSERT INTO \`zs_listings\` (\`id\`,\`name\`,\`slug\`,\`category_id\`,\`description\`,\`featured_image\`,\`gallery_images\`,\`address\`,\`location_area\`,\`latitude\`,\`longitude\`,\`phone\`,\`email\`,\`website\`,\`whatsapp\`,\`social_links\`,\`opening_hours\`,\`verified\`,\`status\`,\`created_at\`,\`updated_at\`,\`views\`) VALUES (${esc(l.id)}, ${esc(l.name)}, ${esc(l.slug)}, ${esc(l.category_id)}, ${esc(l.description)}, ${esc(l.featured_image)}, ${esc(galleryStr)}, ${esc(l.address)}, ${esc(l.location_area)}, ${l.latitude || 'NULL'}, ${l.longitude || 'NULL'}, ${esc(l.phone)}, ${esc(l.email || '')}, ${esc(l.website || '')}, ${esc(l.whatsapp || '')}, ${esc(socialStr)}, ${esc(l.opening_hours || '')}, ${l.verified ? 1 : 0}, ${esc(l.status || 'published')}, ${esc(l.created_at || new Date().toISOString())}, ${esc(l.updated_at || new Date().toISOString())}, ${l.views || 0}) ON DUPLICATE KEY UPDATE \`name\`=VALUES(\`name\`);\n`;
  });

  // Seed Static Pages
  sql += `\n-- Static Pages\n`;
  pages.forEach((p) => {
    sql += `INSERT INTO \`zs_pages\` (\`id\`,\`title\`,\`slug\`,\`content\`,\`featured_image\`,\`status\`,\`seo_title\`,\`meta_description\`,\`canonical_url\`) VALUES (${esc(p.id)}, ${esc(p.title)}, ${esc(p.slug)}, ${esc(p.content)}, ${esc(p.featured_image || '')}, ${esc(p.status || 'published')}, ${esc(p.seo_title || p.title)}, ${esc(p.meta_description || '')}, ${esc(p.canonical_url || '')}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
  });

  // Seed Gallery Photos
  sql += `\n-- Gallery Photos\n`;
  galleryPhotos.forEach((gp, idx) => {
    sql += `INSERT INTO \`zs_gallery\` (\`id\`,\`title\`,\`caption\`,\`image_url\`,\`photographer\`,\`location\`,\`sort_order\`) VALUES (${esc(gp.id)}, ${esc(gp.title)}, ${esc(gp.caption || '')}, ${esc(gp.image_url)}, ${esc(gp.photographer || 'Zunheboto Social Staff')}, ${esc(gp.location || 'Zunheboto Town')}, ${gp.order ?? idx}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
  });

  // Seed Menus
  sql += `\n-- Navigation Menus\n`;
  menuItems.forEach((m, idx) => {
    sql += `INSERT INTO \`zs_menus\` (\`id\`,\`menu_group\`,\`label\`,\`url\`,\`type\`,\`target\`,\`sort_order\`) VALUES (${esc(m.id)}, ${esc(m.menu_group || m.location || 'main')}, ${esc(m.label)}, ${esc(m.url)}, ${esc(m.type || 'custom')}, ${esc(m.target || '_self')}, ${m.order ?? idx}) ON DUPLICATE KEY UPDATE \`label\`=VALUES(\`label\`);\n`;
  });

  // Seed Homepage Sections
  sql += `\n-- Homepage Sections\n`;
  homepageSections.forEach((hs, idx) => {
    const manualIds = Array.isArray(hs.manual_article_ids) ? hs.manual_article_ids.join(',') : (hs.manual_article_ids || '');
    sql += `INSERT INTO \`zs_homepage_sections\` (\`id\`,\`section_type\`,\`title\`,\`subtitle\`,\`button_text\`,\`button_url\`,\`enabled\`,\`sort_order\`,\`content_source\`,\`category_id\`,\`manual_article_ids\`,\`item_count\`,\`layout\`) VALUES (${esc(hs.id)}, ${esc(hs.section_type || hs.section_key || 'articles_grid')}, ${esc(hs.title)}, ${esc(hs.subtitle || '')}, ${esc(hs.button_text || '')}, ${esc(hs.button_url || '')}, ${hs.enabled !== false ? 1 : 0}, ${hs.order ?? idx}, ${esc(hs.content_source || 'latest')}, ${esc(hs.category_id || '')}, ${esc(manualIds)}, ${hs.item_count || 4}, ${esc(hs.layout || 'grid')}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
  });

  // Seed Emergency Hotlines
  sql += `\n-- Emergency Hotlines\n`;
  hotlines.forEach((h, idx) => {
    sql += `INSERT INTO \`zs_emergency_hotlines\` (\`id\`,\`title\`,\`phone\`,\`description\`,\`category\`,\`sort_order\`,\`enabled\`) VALUES (${esc(h.id)}, ${esc(h.title)}, ${esc(h.phone)}, ${esc(h.description || '')}, ${esc(h.category || 'helpline')}, ${h.order ?? idx}, ${h.enabled !== false ? 1 : 0}) ON DUPLICATE KEY UPDATE \`title\`=VALUES(\`title\`);\n`;
  });

  sql += `\nSET FOREIGN_KEY_CHECKS = 1;\n`;
  return sql;
}
