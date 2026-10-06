import fs from 'fs';
import path from 'path';
import { getStorageConfig } from './config';
import { MysqlStorageProvider } from './MysqlProvider';

const DATA_DIR = path.join(process.cwd(), 'data');
const INSTALLED_FILE = path.join(DATA_DIR, 'installed.json');

export interface InstallationStatus {
  installed: boolean;
  mode: string;
  installedAt?: string;
  hasDbConfig: boolean;
}

/**
 * Checks whether the CMS has been installed and permanently configured.
 * Does NOT rely on in-memory variables.
 * Checks both the local persistent filesystem marker and the database system meta.
 */
export async function isCmsInstalled(): Promise<boolean> {
  // 1. Check local persistent file marker in data/installed.json
  if (fs.existsSync(INSTALLED_FILE)) {
    try {
      const raw = fs.readFileSync(INSTALLED_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && parsed.installed === true) {
        return true;
      }
    } catch (e) {
      // Corrupt file, continue to secondary checks
    }
  }

  // 2. Check storage mode
  const config = getStorageConfig();

  if (config.mode === 'database') {
    // Check if database is configured
    if (config.database.database && config.database.user) {
      const provider = new MysqlStorageProvider(config.database);
      try {
        const test = await provider.testConnection();
        if (test.success) {
          const pool = (provider as any).getPool();
          const conn = await pool.getConnection();
          try {
            // Check zs_system_meta for installed marker
            try {
              const [rows]: any = await conn.query(
                "SELECT `meta_value` FROM `zs_system_meta` WHERE `meta_key` = 'installed' LIMIT 1"
              );
              if (rows && rows.length > 0 && rows[0].meta_value === '1') {
                // Sync local file marker
                await markCmsInstalled({ mode: 'database' });
                return true;
              }
            } catch (e) {}

            // Check if zs_settings and zs_admin_users have rows (existing pre-installed database)
            try {
              const [setRows]: any = await conn.query("SELECT COUNT(*) AS cnt FROM `zs_settings`");
              const [usrRows]: any = await conn.query("SELECT COUNT(*) AS cnt FROM `zs_admin_users`");
              if (setRows?.[0]?.cnt > 0 && usrRows?.[0]?.cnt > 0) {
                await markCmsInstalled({ mode: 'database' });
                return true;
              }
            } catch (e) {}
          } finally {
            conn.release();
          }
        }
      } catch (e) {
        // DB unreachable
      } finally {
        await provider.close();
      }
    }
  } else {
    // Mode is JSON
    const jsonPath = path.join(DATA_DIR, 'cms_store.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && (parsed._installed === true || (parsed.settings && parsed.adminUser))) {
          await markCmsInstalled({ mode: 'json' });
          return true;
        }
      } catch (e) {}
    }
  }

  return false;
}

/**
 * Permanently marks the CMS as installed across both filesystem and database.
 */
export async function markCmsInstalled(details: {
  mode: string;
  adminUsername?: string;
  dbName?: string;
}): Promise<void> {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const payload = {
    installed: true,
    installed_at: new Date().toISOString(),
    mode: details.mode,
    admin_user: details.adminUsername || undefined,
    database_name: details.dbName || undefined,
    version: '1.0.0'
  };

  try {
    fs.writeFileSync(INSTALLED_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write installed.json:', err);
  }

  // Also record in database if configured
  const config = getStorageConfig();
  if (config.mode === 'database' && config.database.database) {
    const provider = new MysqlStorageProvider(config.database);
    try {
      const pool = (provider as any).getPool();
      const conn = await pool.getConnection();
      try {
        await conn.query(
          "INSERT INTO `zs_system_meta` (`meta_key`, `meta_value`) VALUES ('installed', '1') ON DUPLICATE KEY UPDATE `meta_value` = '1'"
        );
      } finally {
        conn.release();
      }
    } catch (e) {
      // Non-fatal if DB not yet reachable
    } finally {
      await provider.close();
    }
  }
}

/**
 * Returns installation details for status queries.
 */
export async function getInstallationStatus(): Promise<InstallationStatus> {
  const installed = await isCmsInstalled();
  const config = getStorageConfig();
  let installedAt: string | undefined;

  if (fs.existsSync(INSTALLED_FILE)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(INSTALLED_FILE, 'utf-8'));
      installedAt = parsed.installed_at;
    } catch (e) {}
  }

  return {
    installed,
    mode: config.mode,
    installedAt,
    hasDbConfig: Boolean(config.database.database && config.database.user)
  };
}
