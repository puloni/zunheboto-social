import fs from 'fs';
import path from 'path';
import {
  ConnectionTestResult,
  DatabaseConfig,
  IStorageProvider,
  MigrationResult,
  StorageConfig,
  StorageMode,
  StorageStatus,
  TableInitResult
} from './types';
import { getMaskedConfig, getStorageConfig, saveStorageConfig } from './config';
import { JsonStorageProvider } from './JsonProvider';
import { MysqlStorageProvider } from './MysqlProvider';

export class StorageManager {
  private config: StorageConfig;
  private activeProvider: IStorageProvider;
  private jsonFallbackProvider: JsonStorageProvider;
  private inMemoryCache: any = null;
  private lastStatusMessage: string = '';
  private isDbConnected: boolean = false;

  constructor() {
    this.config = getStorageConfig();
    this.jsonFallbackProvider = new JsonStorageProvider();

    if (this.config.mode === 'database') {
      this.activeProvider = new MysqlStorageProvider(this.config.database);
    } else {
      this.activeProvider = this.jsonFallbackProvider;
    }
  }

  async init(): Promise<void> {
    console.log(`[StorageManager] Initializing storage with mode: '${this.config.mode}'`);
    await this.jsonFallbackProvider.init();

    if (this.config.mode === 'database') {
      try {
        const testRes = await this.activeProvider.testConnection();
        if (testRes.success) {
          this.isDbConnected = true;
          this.lastStatusMessage = `Connected to MySQL/MariaDB (${testRes.version || 'Active'})`;
          await this.activeProvider.init();
          console.log(`[StorageManager] ${this.lastStatusMessage}`);
        } else {
          this.isDbConnected = false;
          this.lastStatusMessage = `Database connection warning: ${testRes.message}. Falling back to JSON storage until configured.`;
          console.warn(`[StorageManager] ${this.lastStatusMessage}`);
        }
      } catch (err: any) {
        this.isDbConnected = false;
        this.lastStatusMessage = `Database connection error: ${err.message}. Using JSON storage.`;
        console.warn(`[StorageManager] ${this.lastStatusMessage}`);
      }
    } else {
      this.isDbConnected = false;
      this.lastStatusMessage = 'Running on local JSON file storage (data/cms_store.json)';
      console.log(`[StorageManager] ${this.lastStatusMessage}`);
    }
  }

  getMode(): StorageMode {
    return this.config.mode;
  }

  getActiveProviderName(): StorageMode {
    if (this.config.mode === 'database' && this.isDbConnected) {
      return 'database';
    }
    return 'json';
  }

  async loadStore(): Promise<any> {
    if (this.config.mode === 'database') {
      if (!this.isDbConnected) {
        // Attempt a live reconnection check
        try {
          const testRes = await this.activeProvider.testConnection();
          if (testRes.success) {
            this.isDbConnected = true;
            await this.activeProvider.init();
          }
        } catch (e) {}
      }

      if (this.isDbConnected) {
        this.inMemoryCache = await this.activeProvider.loadStore();
        return this.inMemoryCache;
      }

      // If database is configured but unreachable, serve from existing in-memory cache if available,
      // but NEVER fall back to empty/default store to avoid corrupting or overwriting production data!
      if (this.inMemoryCache && Object.keys(this.inMemoryCache).length > 0) {
        console.warn('[StorageManager] Database unreachable; serving from in-memory cache without overwriting.');
        return this.inMemoryCache;
      }

      throw new Error(`MariaDB is configured but currently unreachable (${this.lastStatusMessage}). Refusing to fall back to empty default data.`);
    }

    this.inMemoryCache = await this.jsonFallbackProvider.loadStore();
    return this.inMemoryCache;
  }

  async saveKey(key: string, data: any): Promise<boolean> {
    if (this.config.mode === 'database') {
      if (!this.isDbConnected) {
        console.error(`[StorageManager] Cannot saveKey('${key}'): MariaDB is disconnected. Refusing write to prevent data corruption.`);
        return false;
      }
      let saved = false;
      try {
        saved = await this.activeProvider.saveKey(key, data);
      } catch (e: any) {
        console.error('[StorageManager] Database saveKey error:', e.message);
      }
      if (saved && this.inMemoryCache) {
        this.inMemoryCache[key] = data;
      }
      return saved;
    }

    // In JSON mode
    const jsonSaved = await this.jsonFallbackProvider.saveKey(key, data);
    if (this.inMemoryCache) {
      this.inMemoryCache[key] = data;
    }
    return jsonSaved;
  }

  async deleteArticle(id: string): Promise<boolean> {
    if (this.config.mode === 'database') {
      if (!this.isDbConnected) {
        console.error('[StorageManager] Cannot deleteArticle: MariaDB is disconnected.');
        return false;
      }
      let dbSuccess = false;
      try {
        dbSuccess = await (this.activeProvider as MysqlStorageProvider).deleteArticle(id);
      } catch (e: any) {
        console.error('[StorageManager] Database deleteArticle error:', e.message);
      }
      if (this.inMemoryCache && Array.isArray(this.inMemoryCache.articles)) {
        this.inMemoryCache.articles = this.inMemoryCache.articles.filter((a: any) => a.id !== id);
      }
      return dbSuccess;
    }

    const jsonSuccess = await this.jsonFallbackProvider.deleteArticle(id);
    if (this.inMemoryCache && Array.isArray(this.inMemoryCache.articles)) {
      this.inMemoryCache.articles = this.inMemoryCache.articles.filter((a: any) => a.id !== id);
    }
    return jsonSuccess;
  }

  async saveStore(store: any): Promise<boolean> {
    if (this.config.mode === 'database') {
      if (!this.isDbConnected) {
        console.error('[StorageManager] Cannot saveStore: MariaDB is disconnected. Aborting write.');
        return false;
      }
      let saved = false;
      try {
        saved = await this.activeProvider.saveStore(store);
      } catch (e: any) {
        console.error('[StorageManager] Database saveStore error:', e.message);
      }
      if (saved) {
        this.inMemoryCache = store;
      }
      return saved;
    }

    const jsonSaved = await this.jsonFallbackProvider.saveStore(store);
    this.inMemoryCache = store;
    return jsonSaved;
  }

  /**
   * Tests a MySQL/MariaDB database connection with specific or current credentials.
   */
  async testConnection(customConfig?: DatabaseConfig): Promise<ConnectionTestResult> {
    const configToTest = customConfig || this.config.database;
    const testProvider = new MysqlStorageProvider(configToTest);
    try {
      const res = await testProvider.testConnection();
      return res;
    } finally {
      await testProvider.close();
    }
  }

  /**
   * Initializes tables on the MySQL/MariaDB database.
   */
  async initTables(customConfig?: DatabaseConfig): Promise<TableInitResult> {
    const configToUse = customConfig || this.config.database;
    const provider = new MysqlStorageProvider(configToUse);
    try {
      const res = await provider.initTables();
      if (this.config.mode === 'database') {
        this.isDbConnected = true;
      }
      return res;
    } finally {
      await provider.close();
    }
  }

  /**
   * Imports all contents of data/cms_store.json into the MySQL/MariaDB database.
   */
  async migrateJsonToDb(customConfig?: DatabaseConfig): Promise<MigrationResult> {
    const jsonStore = await this.jsonFallbackProvider.loadStore();
    const configToUse = customConfig || this.config.database;
    const provider = new MysqlStorageProvider(configToUse);

    try {
      const result = await provider.migrateFromJson(jsonStore);
      if (this.config.mode === 'database') {
        this.isDbConnected = true;
        // Reload in-memory cache from database
        this.inMemoryCache = await provider.loadStore();
      }
      return result;
    } finally {
      await provider.close();
    }
  }

  /**
   * Updates configuration and dynamically switches active provider without server reboot.
   */
  async updateConfiguration(updates: {
    mode?: StorageMode;
    host?: string;
    port?: number;
    database?: string;
    user?: string;
    password?: string;
  }): Promise<{ success: boolean; message: string; status: StorageStatus }> {
    const newConfig = saveStorageConfig(updates);
    this.config = newConfig;

    if (newConfig.mode === 'database') {
      const newProvider = new MysqlStorageProvider(newConfig.database);
      const test = await newProvider.testConnection();
      if (test.success) {
        if (this.activeProvider && this.activeProvider !== this.jsonFallbackProvider) {
          await this.activeProvider.close();
        }
        this.activeProvider = newProvider;
        this.isDbConnected = true;
        this.lastStatusMessage = `Switched to MySQL/MariaDB (${test.version || 'Connected'})`;
        console.log(`[StorageManager] ${this.lastStatusMessage}`);
      } else {
        this.isDbConnected = false;
        this.lastStatusMessage = `Configuration saved, but database connection failed: ${test.message}. Using JSON fallback.`;
        console.warn(`[StorageManager] ${this.lastStatusMessage}`);
      }
    } else {
      if (this.activeProvider && this.activeProvider !== this.jsonFallbackProvider) {
        await this.activeProvider.close();
      }
      this.activeProvider = this.jsonFallbackProvider;
      this.isDbConnected = false;
      this.lastStatusMessage = 'Active storage mode switched to JSON file storage.';
      console.log(`[StorageManager] ${this.lastStatusMessage}`);
    }

    const status = await this.getStatus();
    return {
      success: true,
      message: this.lastStatusMessage,
      status
    };
  }

  /**
   * Retrieves current status for the admin UI.
   */
  async getStatus(): Promise<StorageStatus> {
    const jsonPath = this.jsonFallbackProvider.getFilePath();
    let jsonFileSize = 0;
    if (fs.existsSync(jsonPath)) {
      try {
        jsonFileSize = fs.statSync(jsonPath).size;
      } catch (e) {}
    }

    const currentJsonStore = await this.jsonFallbackProvider.loadStore();
    const jsonRecordCounts: Record<string, number> = {
      articles: currentJsonStore.articles?.length || 0,
      articleCategories: currentJsonStore.articleCategories?.length || 0,
      listings: currentJsonStore.listings?.length || 0,
      listingCategories: currentJsonStore.listingCategories?.length || 0,
      pages: currentJsonStore.pages?.length || 0,
      mediaItems: currentJsonStore.mediaItems?.length || 0,
      galleryPhotos: currentJsonStore.galleryPhotos?.length || 0,
      menuItems: currentJsonStore.menuItems?.length || 0,
      homepageSections: currentJsonStore.homepageSections?.length || 0,
      emergencyHotlines: currentJsonStore.emergencyHotlines?.length || 0,
      newsTips: currentJsonStore.newsTips?.length || 0
    };

    let dbRecordCounts: Record<string, number> | undefined = undefined;
    if (this.isDbConnected && this.config.mode === 'database') {
      try {
        const dbStore = await this.activeProvider.loadStore();
        dbRecordCounts = {
          articles: dbStore.articles?.length || 0,
          articleCategories: dbStore.articleCategories?.length || 0,
          listings: dbStore.listings?.length || 0,
          listingCategories: dbStore.listingCategories?.length || 0,
          pages: dbStore.pages?.length || 0,
          mediaItems: dbStore.mediaItems?.length || 0,
          galleryPhotos: dbStore.galleryPhotos?.length || 0,
          menuItems: dbStore.menuItems?.length || 0,
          homepageSections: dbStore.homepageSections?.length || 0,
          emergencyHotlines: dbStore.emergencyHotlines?.length || 0,
          newsTips: dbStore.newsTips?.length || 0
        };
      } catch (e) {}
    }

    return {
      mode: this.config.mode,
      isConnected: this.config.mode === 'database' ? this.isDbConnected : true,
      message: this.lastStatusMessage,
      config: getMaskedConfig(this.config),
      jsonFileSize,
      jsonRecordCounts,
      dbRecordCounts,
      lastUpdated: new Date().toISOString()
    };
  }
}

// Global Singleton Instance
export const storageManager = new StorageManager();
