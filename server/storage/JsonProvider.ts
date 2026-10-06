import fs from 'fs';
import path from 'path';
import {
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

export class JsonStorageProvider implements IStorageProvider {
  private dataDir: string;
  private storeFile: string;
  private cachedStore: any = null;

  constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.storeFile = path.join(this.dataDir, 'cms_store.json');
  }

  getName(): StorageMode {
    return 'json';
  }

  async init(): Promise<void> {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.storeFile)) {
      const initialStore = this.getDefaultStore();
      await this.saveStore(initialStore);
    }
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
      sponsoredAds: INITIAL_SPONSORED_ADS,
      _installed: true
    };
  }

  async loadStore(): Promise<any> {
    if (fs.existsSync(this.storeFile)) {
      try {
        const raw = fs.readFileSync(this.storeFile, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          const isInstalled = Boolean(parsed._installed || parsed.settings || parsed.adminUser);
          this.cachedStore = {
            settings: parsed.settings ? { ...INITIAL_SETTINGS, ...parsed.settings } : INITIAL_SETTINGS,
            adminUser: parsed.adminUser || null,
            users: Array.isArray(parsed.users) ? parsed.users : (parsed.adminUser ? [parsed.adminUser] : (isInstalled ? [] : INITIAL_ADMIN_USERS)),
            articleCategories: Array.isArray(parsed.articleCategories) ? parsed.articleCategories : (isInstalled ? [] : INITIAL_ARTICLE_CATEGORIES),
            articles: Array.isArray(parsed.articles) ? parsed.articles : (isInstalled ? [] : INITIAL_ARTICLES),
            listingCategories: Array.isArray(parsed.listingCategories) ? parsed.listingCategories : (isInstalled ? [] : INITIAL_LISTING_CATEGORIES),
            listings: Array.isArray(parsed.listings) ? parsed.listings : (isInstalled ? [] : INITIAL_LISTINGS),
            pages: Array.isArray(parsed.pages) ? parsed.pages : (isInstalled ? [] : INITIAL_STATIC_PAGES),
            mediaItems: Array.isArray(parsed.mediaItems) ? parsed.mediaItems : (isInstalled ? [] : INITIAL_MEDIA),
            galleryPhotos: Array.isArray(parsed.galleryPhotos) ? parsed.galleryPhotos : (isInstalled ? [] : INITIAL_GALLERY_PHOTOS),
            menuItems: Array.isArray(parsed.menuItems) ? parsed.menuItems : (isInstalled ? [] : INITIAL_MENU_ITEMS),
            homepageSections: Array.isArray(parsed.homepageSections) ? parsed.homepageSections : (isInstalled ? [] : INITIAL_HOMEPAGE_SECTIONS),
            emergencyHotlines: Array.isArray(parsed.emergencyHotlines) ? parsed.emergencyHotlines : (isInstalled ? [] : INITIAL_EMERGENCY_HOTLINES),
            newsTips: Array.isArray(parsed.newsTips) ? parsed.newsTips : (isInstalled ? [] : INITIAL_NEWS_TIPS),
            classifieds: Array.isArray(parsed.classifieds) ? parsed.classifieds : (isInstalled ? [] : INITIAL_CLASSIFIEDS),
            sponsoredAds: Array.isArray(parsed.sponsoredAds) ? parsed.sponsoredAds : (isInstalled ? [] : INITIAL_SPONSORED_ADS),
            _installed: true
          };
          return this.cachedStore;
        }
      } catch (err) {
        console.error('JsonStorageProvider: Failed to parse cms_store.json, creating clean store:', err);
      }
    }

    const initialStore = this.getDefaultStore();
    await this.saveStore(initialStore);
    this.cachedStore = initialStore;
    return initialStore;
  }

  async saveStore(store: any): Promise<boolean> {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const tempFile = `${this.storeFile}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf-8');
      fs.renameSync(tempFile, this.storeFile);
      this.cachedStore = store;
      return true;
    } catch (err) {
      console.error('JsonStorageProvider: Error writing to disk:', err);
      return false;
    }
  }

  async saveKey(key: string, data: any): Promise<boolean> {
    const current = this.cachedStore || (await this.loadStore());
    current[key] = data;
    return this.saveStore(current);
  }

  async deleteArticle(id: string): Promise<boolean> {
    const current = this.cachedStore || (await this.loadStore());
    if (Array.isArray(current.articles)) {
      current.articles = current.articles.filter((a: any) => a.id !== id);
      return this.saveStore(current);
    }
    return true;
  }

  async testConnection(): Promise<ConnectionTestResult> {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      const testFile = path.join(this.dataDir, `.write_test_${Date.now()}`);
      fs.writeFileSync(testFile, 'ok', 'utf-8');
      fs.unlinkSync(testFile);

      const stats = fs.existsSync(this.storeFile) ? fs.statSync(this.storeFile) : null;
      return {
        success: true,
        message: `JSON storage active and healthy at data/cms_store.json (${stats ? Math.round(stats.size / 1024) + ' KB' : 'new'})`,
        latencyMs: 1
      };
    } catch (e: any) {
      return {
        success: false,
        message: `JSON storage permission error: ${e.message}`
      };
    }
  }

  async initTables(): Promise<TableInitResult> {
    await this.init();
    return {
      success: true,
      message: 'JSON file storage is initialized and ready.',
      tablesCreated: ['data/cms_store.json']
    };
  }

  async migrateFromJson(jsonStore: any): Promise<MigrationResult> {
    const success = await this.saveStore(jsonStore);
    return {
      success,
      message: 'Saved to JSON storage.',
      counts: {
        articles: jsonStore.articles?.length || 0,
        listings: jsonStore.listings?.length || 0,
        categories: (jsonStore.articleCategories?.length || 0) + (jsonStore.listingCategories?.length || 0)
      },
      timestamp: new Date().toISOString()
    };
  }

  async close(): Promise<void> {
    // No-op for JSON storage
  }

  getFilePath(): string {
    return this.storeFile;
  }
}
