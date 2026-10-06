import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { DatabaseConfig, MaskedStorageConfig, StorageConfig, StorageMode } from './types';

// Attempt to load .env on startup
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const DATA_DIR = path.join(process.cwd(), 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'storage_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    // Directory might already exist
  }
}

/**
 * Parses and returns the current storage configuration from environment and persistent file.
 */
export function getStorageConfig(): StorageConfig {
  let fileConfig: Partial<StorageConfig> = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      fileConfig = JSON.parse(raw);
    } catch (e) {
      console.warn('Failed to parse storage_config.json:', e);
    }
  }

  const rawMode = process.env.DATA_STORAGE || fileConfig.mode || 'json';
  const mode: StorageMode =
    rawMode.toLowerCase() === 'database' ||
    rawMode.toLowerCase() === 'mysql' ||
    rawMode.toLowerCase() === 'mariadb'
      ? 'database'
      : 'json';

  const host = process.env.DB_HOST || fileConfig.database?.host || 'localhost';
  const port = parseInt(process.env.DB_PORT || String(fileConfig.database?.port || 3306), 10) || 3306;
  const database = process.env.DB_NAME || fileConfig.database?.database || '';
  const user = process.env.DB_USER || fileConfig.database?.user || '';
  const password = process.env.DB_PASSWORD !== undefined
    ? process.env.DB_PASSWORD
    : (fileConfig.database?.password || '');

  return {
    mode,
    database: {
      host,
      port,
      database,
      user,
      password,
    }
  };
}

/**
 * Returns configuration with masked password for secure client display.
 */
export function getMaskedConfig(config: StorageConfig): MaskedStorageConfig {
  const hasPassword = Boolean(config.database.password && config.database.password.length > 0);
  return {
    mode: config.mode,
    database: {
      host: config.database.host,
      port: config.database.port,
      database: config.database.database,
      user: config.database.user,
      hasPassword,
      passwordMasked: hasPassword ? '••••••••' : ''
    }
  };
}

/**
 * Updates both the persistent storage_config.json and .env file.
 */
export function saveStorageConfig(updates: {
  mode?: StorageMode;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
}): StorageConfig {
  const current = getStorageConfig();

  const newMode: StorageMode = updates.mode !== undefined ? updates.mode : current.mode;
  const newHost = updates.host !== undefined ? updates.host : current.database.host;
  const newPort = updates.port !== undefined ? Number(updates.port) : current.database.port;
  const newDatabase = updates.database !== undefined ? updates.database : current.database.database;
  const newUser = updates.user !== undefined ? updates.user : current.database.user;
  // If password was omitted or empty string with existing password, retain current password
  const newPassword = updates.password !== undefined && updates.password !== ''
    ? updates.password
    : current.database.password;

  const newConfig: StorageConfig = {
    mode: newMode,
    database: {
      host: newHost,
      port: newPort,
      database: newDatabase,
      user: newUser,
      password: newPassword
    }
  };

  // 1. Update runtime process.env
  process.env.DATA_STORAGE = newMode;
  process.env.DB_HOST = newHost;
  process.env.DB_PORT = String(newPort);
  process.env.DB_NAME = newDatabase;
  process.env.DB_USER = newUser;
  process.env.DB_PASSWORD = newPassword;

  // 2. Persist to storage_config.json
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write storage_config.json:', err);
  }

  // 3. Persist to .env file preserving existing keys
  try {
    updateEnvFile({
      DATA_STORAGE: newMode,
      DB_HOST: newHost,
      DB_PORT: String(newPort),
      DB_NAME: newDatabase,
      DB_USER: newUser,
      DB_PASSWORD: newPassword
    });
  } catch (err) {
    console.error('Failed to update .env file:', err);
  }

  return newConfig;
}

/**
 * Updates or adds keys to .env without corrupting existing variables or comments.
 */
export function updateEnvFile(keyValues: Record<string, string>): void {
  const envFilePath = path.join(process.cwd(), '.env');
  let content = '';

  if (fs.existsSync(envFilePath)) {
    content = fs.readFileSync(envFilePath, 'utf-8');
  } else {
    // If .env does not exist, copy from .env.example or create basic structure
    const examplePath = path.join(process.cwd(), '.env.example');
    if (fs.existsSync(examplePath)) {
      content = fs.readFileSync(examplePath, 'utf-8');
    }
  }

  const lines = content.split('\n');
  const modifiedKeys = new Set<string>();

  const newLines = lines.map((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      return line;
    }
    const match = line.match(/^([A-Za-z0-9_]+)\s*=/);
    if (match) {
      const key = match[1];
      if (key in keyValues) {
        modifiedKeys.add(key);
        const val = keyValues[key];
        // quote if contains spaces or special characters
        const formatted = /[#\s"']/.test(val) ? `"${val.replace(/"/g, '\\"')}"` : val;
        return `${key}=${formatted}`;
      }
    }
    return line;
  });

  // Append any keys that weren't already present in .env
  for (const [key, val] of Object.entries(keyValues)) {
    if (!modifiedKeys.has(key)) {
      const formatted = /[#\s"']/.test(val) ? `"${val.replace(/"/g, '\\"')}"` : val;
      newLines.push(`${key}=${formatted}`);
    }
  }

  fs.writeFileSync(envFilePath, newLines.join('\n'), 'utf-8');
}
