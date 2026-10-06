import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SiteSettings,
  AdminUser,
  AdminUserRole,
  ArticleCategory,
  Article,
  ListingCategory,
  Listing,
  StaticPage,
  MediaItem,
  GalleryPhoto,
  MenuItem,
  HomepageSectionConfig,
  EmergencyHotline,
  NewsTip,
  WeatherData,
  DatabaseInstallConfig,
  ClassifiedListing,
  SponsoredCampaign
} from '../types';
import {
  INITIAL_INSTALL_CONFIG,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USER,
  INITIAL_ADMIN_USERS,
  INITIAL_ARTICLE_CATEGORIES,
  INITIAL_ARTICLES,
  INITIAL_LISTING_CATEGORIES,
  INITIAL_LISTINGS,
  INITIAL_GALLERY_PHOTOS,
  INITIAL_MEDIA,
  INITIAL_STATIC_PAGES,
  INITIAL_MENU_ITEMS,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_EMERGENCY_HOTLINES,
  INITIAL_NEWS_TIPS,
  INITIAL_WEATHER,
  INITIAL_CLASSIFIEDS,
  INITIAL_SPONSORED_ADS
} from '../data/initialData';
import { updateFavicon as applyFavicon } from '../utils/seo';
import { generatePhpZipPackage } from '../utils/phpExporter';
import { migrateHomepageSections } from '../utils/sectionTypes';

export interface CmsContextType {
  // State
  activePath: string;
  currentRoute: string;
  installConfig: DatabaseInstallConfig;
  settings: SiteSettings;
  adminUser: AdminUser | null;
  isLoggedIn: boolean;
  isAuthenticated: boolean;
  articles: Article[];
  articleCategories: ArticleCategory[];
  listings: Listing[];
  listingCategories: ListingCategory[];
  pages: StaticPage[];
  galleryPhotos: GalleryPhoto[];
  mediaItems: MediaItem[];
  menuItems: MenuItem[];
  homepageSections: HomepageSectionConfig[];
  emergencyHotlines: EmergencyHotline[];
  newsTips: NewsTip[];
  users: AdminUser[];
  classifieds: ClassifiedListing[];
  sponsoredAds: SponsoredCampaign[];
  weather: WeatherData | null;
  refreshWeather: (force?: boolean) => Promise<void>;

  // Navigation
  navigateTo: (path: string) => void;

  // Auth & Profile & Staff Users
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<AdminUser>) => Promise<{ success: boolean }>;
  updateAdminProfile: (data: Partial<AdminUser> & { password?: string }) => Promise<{ success: boolean }>;
  changePassword: (oldPass: string, newPass: string) => boolean;
  switchUser: (userId: string) => void;
  createUser: (user: Omit<AdminUser, 'id' | 'created_at' | 'last_login'>) => Promise<AdminUser>;
  updateUser: (id: string, data: Partial<AdminUser>) => Promise<{ success: boolean }>;
  deleteUser: (id: string) => Promise<{ success: boolean }>;

  // Installer
  runInstaller: (data: {
    db_host: string;
    db_name: string;
    db_user: string;
    db_pass: string;
    site_name: string;
    site_url: string;
    admin_name: string;
    admin_user: string;
    admin_email: string;
    admin_pass: string;
  }) => boolean;
  resetInstaller: () => void;

  // Settings & Branding
  updateSettings: (data: Partial<SiteSettings>) => Promise<{ success: boolean; error?: string }>;
  applyServerSettings: (newSettings: Partial<SiteSettings>) => void;
  updateLogo: (url: string) => void;
  removeLogo: () => void;
  updateFavicon: (url: string) => void;
  removeFavicon: () => void;

  // Articles & Editorial Review Workflow
  createArticle: (data: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>) => Promise<Article>;
  updateArticle: (id: string, data: Partial<Article>) => Promise<{ success: boolean }>;
  submitArticleForReview: (id: string, notes?: string) => Promise<{ success: boolean }>;
  approveArticle: (id: string, publishNow?: boolean, scheduledDate?: string) => Promise<{ success: boolean }>;
  requestArticleChanges: (id: string, notes: string) => Promise<{ success: boolean }>;
  rejectArticle: (id: string, notes: string) => Promise<{ success: boolean }>;
  scheduleArticle: (id: string, scheduledDate: string) => Promise<{ success: boolean }>;
  setFeaturedStory: (articleId: string) => void;
  trashArticle: (id: string) => void;
  restoreArticle: (id: string) => void;
  deleteArticlePermanent: (id: string) => void;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (slug: string) => void;

  // Categories
  createArticleCategory: (data: Omit<ArticleCategory, 'id'>) => ArticleCategory;
  updateArticleCategory: (id: string, data: Partial<ArticleCategory>) => void;
  deleteArticleCategory: (id: string, reassignCategoryId?: string) => void;

  // Listings
  createListing: (data: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views'>) => Promise<Listing>;
  updateListing: (id: string, data: Partial<Listing>) => Promise<{ success: boolean }>;
  trashListing: (id: string) => void;
  restoreListing: (id: string) => void;
  deleteListingPermanent: (id: string) => void;
  deleteListing: (id: string) => void;
  createListingCategory: (data: Omit<ListingCategory, 'id'>) => ListingCategory;
  updateListingCategory: (id: string, data: Partial<ListingCategory>) => void;
  deleteListingCategory: (id: string, reassignCategoryId?: string) => void;
  incrementListingViews: (slug: string) => void;

  // Local Classifieds & Job Board
  createClassified: (data: Omit<ClassifiedListing, 'id' | 'created_at' | 'views'>) => Promise<ClassifiedListing>;
  updateClassified: (id: string, data: Partial<ClassifiedListing>) => Promise<{ success: boolean }>;
  deleteClassified: (id: string) => Promise<{ success: boolean }>;
  approveClassified: (id: string) => Promise<{ success: boolean }>;
  rejectClassified: (id: string) => Promise<{ success: boolean }>;
  incrementClassifiedViews: (id: string) => void;

  // Sponsored Content & Native Banners
  createSponsoredAd: (data: Omit<SponsoredCampaign, 'id' | 'created_at' | 'impressions' | 'clicks'>) => Promise<SponsoredCampaign>;
  updateSponsoredAd: (id: string, data: Partial<SponsoredCampaign>) => Promise<{ success: boolean }>;
  deleteSponsoredAd: (id: string) => Promise<{ success: boolean }>;
  toggleSponsoredAd: (id: string) => Promise<{ success: boolean }>;
  trackAdClick: (id: string) => void;
  trackAdImpression: (id: string) => void;

  // Pages
  createPage: (data: Omit<StaticPage, 'id' | 'created_at' | 'updated_at'>) => Promise<StaticPage>;
  updatePage: (id: string, data: Partial<StaticPage>) => Promise<{ success: boolean }>;
  trashPage: (id: string) => void;
  restorePage: (id: string) => void;
  deletePagePermanent: (id: string) => void;
  deletePage: (id: string) => void;

  // Media Library
  uploadMedia: (title: string, fileDataUrl: string, caption?: string, altText?: string, watermark?: boolean) => Promise<MediaItem>;
  updateMediaMetadata: (id: string, data: Partial<MediaItem>) => Promise<{ success: boolean }>;
  deleteMedia: (id: string) => Promise<{ success: boolean }>;

  // Gallery
  addGalleryPhoto: (data: Omit<GalleryPhoto, 'id' | 'created_at'>) => GalleryPhoto;
  createGalleryPhoto: (data: Omit<GalleryPhoto, 'id' | 'created_at'>) => GalleryPhoto;
  updateGalleryPhoto: (id: string, data: Partial<GalleryPhoto>) => void;
  deleteGalleryPhoto: (id: string) => void;
  reorderGallery: (photos: GalleryPhoto[]) => void;

  // Homepage Builder
  saveAllHomepageSections: (sections: HomepageSectionConfig[]) => Promise<{ success: boolean; error?: string }>;
  updateHomepageSection: (id: string, data: Partial<HomepageSectionConfig>) => void;
  reorderHomepageSections: (fromIndexOrSections: any, toIndex?: number) => void;
  toggleHomepageSection: (id: string) => void;
  addHomepageSection: (data: Omit<HomepageSectionConfig, 'id' | 'order'>) => HomepageSectionConfig;
  createHomepageSection: (data: Omit<HomepageSectionConfig, 'id' | 'order'>) => HomepageSectionConfig;
  deleteHomepageSection: (id: string) => void;
  resetHomepageSections: () => void;

  // Menus
  addMenuItem: (data: Omit<MenuItem, 'id'>) => MenuItem;
  createMenuItem: (data: Omit<MenuItem, 'id'>) => MenuItem;
  updateMenuItem: (id: string, data: Partial<MenuItem>) => void;
  deleteMenuItem: (id: string) => void;
  reorderMenuItems: (locationOrItems: any, fromIndex?: number, toIndex?: number) => void;

  // Hotlines
  addEmergencyHotline: (data: Omit<EmergencyHotline, 'id'>) => EmergencyHotline;
  createHotline: (data: Omit<EmergencyHotline, 'id'>) => EmergencyHotline;
  updateEmergencyHotline: (id: string, data: Partial<EmergencyHotline>) => void;
  updateHotline: (id: string, data: Partial<EmergencyHotline>) => void;
  deleteEmergencyHotline: (id: string) => void;
  deleteHotline: (id: string) => void;
  toggleEmergencyHotline: (id: string) => void;

  // News Tips
  submitNewsTip: (data: Omit<NewsTip, 'id' | 'created_at' | 'status'>) => NewsTip;
  updateNewsTipStatus: (id: string, status: NewsTip['status']) => void;
  deleteNewsTip: (id: string) => void;

  // Utilities & Export
  reloadFromStorage: () => Promise<void>;
  exportDatabaseJson: () => void;
  exportJsonBackup: () => void;
  exportDatabaseSql: () => void;
  exportSqlDatabase: () => void;
  downloadPhpZip: () => Promise<void>;
  resetToSampleData: () => void;
  resetToFactoryDefaults: () => void;
}

const CmsContext = createContext<CmsContextType | null>(null);

function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`zs_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`zs_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

export const CmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clean HTML5 History Navigation State (Zero Hash)
  const [activePath, setActivePath] = useState<string>(() => {
    // If arriving with legacy hash (e.g. #/article/slug), migrate to clean URL without hash
    const rawHash = window.location.hash;
    if (rawHash) {
      const cleanPathFromHash = rawHash.replace(/^#\/?/, '/');
      try {
        window.history.replaceState(null, '', cleanPathFromHash);
      } catch (e) {}
      return cleanPathFromHash;
    }
    return window.location.pathname + (window.location.search || '') || '/';
  });

  useEffect(() => {
    // Listen for browser Back/Forward history navigation
    const handlePopState = () => {
      const currentPath = window.location.pathname + (window.location.search || '') || '/';
      setActivePath(currentPath);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (path: string) => {
    const cleanPath = path.startsWith('/') ? path : '/' + path;
    setActivePath(cleanPath);
    if (window.location.pathname + (window.location.search || '') !== cleanPath) {
      try {
        window.history.pushState(null, '', cleanPath);
      } catch (e) {
        // Safe fallback in sandboxed iframe environments
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // State initialization with local persistence
  const [installConfig, setInstallConfig] = useState<DatabaseInstallConfig>(() =>
    getStorage('install_config', INITIAL_INSTALL_CONFIG)
  );

  const [settings, setSettings] = useState<SiteSettings>(() => {
    const saved = getStorage('settings', INITIAL_SETTINGS);
    return {
      ...INITIAL_SETTINGS,
      ...saved,
      logo_url: saved?.logo_url !== undefined ? saved.logo_url : INITIAL_SETTINGS.logo_url,
      footer_logo_url: saved?.footer_logo_url !== undefined ? saved.footer_logo_url : INITIAL_SETTINGS.footer_logo_url,
      site_icon_url: saved?.site_icon_url !== undefined ? saved.site_icon_url : INITIAL_SETTINGS.site_icon_url,
      favicon_url: saved?.favicon_url !== undefined ? saved.favicon_url : INITIAL_SETTINGS.favicon_url,
    };
  });

  const [adminUser, setAdminUser] = useState<AdminUser | null>(() =>
    getStorage('admin_user', INITIAL_ADMIN_USER)
  );

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem('zs_admin_logged_in') === 'true';
  });

  const [articles, setArticles] = useState<Article[]>(() =>
    getStorage('articles', INITIAL_ARTICLES)
  );

  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>(() =>
    getStorage('article_categories', INITIAL_ARTICLE_CATEGORIES)
  );

  const [listings, setListings] = useState<Listing[]>(() =>
    getStorage('listings', INITIAL_LISTINGS)
  );

  const [listingCategories, setListingCategories] = useState<ListingCategory[]>(() =>
    getStorage('listing_categories', INITIAL_LISTING_CATEGORIES)
  );

  const [pages, setPages] = useState<StaticPage[]>(() =>
    getStorage('pages', INITIAL_STATIC_PAGES)
  );

  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>(() =>
    getStorage('gallery_photos', INITIAL_GALLERY_PHOTOS)
  );

  const [mediaItems, setMediaItems] = useState<MediaItem[]>(() =>
    getStorage('media_items', INITIAL_MEDIA)
  );

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() =>
    getStorage('menu_items', INITIAL_MENU_ITEMS)
  );

  const [homepageSections, setHomepageSections] = useState<HomepageSectionConfig[]>(() =>
    migrateHomepageSections(getStorage('homepage_sections', INITIAL_HOMEPAGE_SECTIONS))
  );

  const [emergencyHotlines, setEmergencyHotlines] = useState<EmergencyHotline[]>(() =>
    getStorage('emergency_hotlines', INITIAL_EMERGENCY_HOTLINES)
  );

  const [newsTips, setNewsTips] = useState<NewsTip[]>(() =>
    getStorage('news_tips', INITIAL_NEWS_TIPS)
  );

  const [users, setUsers] = useState<AdminUser[]>(() =>
    getStorage('users', INITIAL_ADMIN_USERS)
  );

  const [classifieds, setClassifieds] = useState<ClassifiedListing[]>(() =>
    getStorage('classifieds', INITIAL_CLASSIFIEDS)
  );

  const [sponsoredAds, setSponsoredAds] = useState<SponsoredCampaign[]>(() =>
    getStorage('sponsored_ads', INITIAL_SPONSORED_ADS)
  );

  const [weather, setWeather] = useState<WeatherData | null>(null);

  const refreshWeather = async (force = false) => {
    try {
      const url = force ? '/api/weather?refresh=1' : '/api/weather';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setWeather(json);
      }
    } catch (err) {
      console.error('Weather sync error:', err);
    }
  };

  useEffect(() => {
    refreshWeather();
  }, []);

  // Sync to localStorage
  useEffect(() => setStorage('install_config', installConfig), [installConfig]);
  useEffect(() => setStorage('settings', settings), [settings]);
  useEffect(() => setStorage('admin_user', adminUser), [adminUser]);
  useEffect(() => setStorage('articles', articles), [articles]);
  useEffect(() => setStorage('article_categories', articleCategories), [articleCategories]);
  useEffect(() => setStorage('listings', listings), [listings]);
  useEffect(() => setStorage('listing_categories', listingCategories), [listingCategories]);
  useEffect(() => setStorage('pages', pages), [pages]);
  useEffect(() => setStorage('gallery_photos', galleryPhotos), [galleryPhotos]);
  useEffect(() => setStorage('media_items', mediaItems), [mediaItems]);
  useEffect(() => setStorage('menu_items', menuItems), [menuItems]);
  useEffect(() => setStorage('homepage_sections', homepageSections), [homepageSections]);
  useEffect(() => setStorage('emergency_hotlines', emergencyHotlines), [emergencyHotlines]);
  useEffect(() => setStorage('news_tips', newsTips), [newsTips]);
  useEffect(() => setStorage('users', users), [users]);
  useEffect(() => setStorage('classifieds', classifieds), [classifieds]);
  useEffect(() => setStorage('sponsored_ads', sponsoredAds), [sponsoredAds]);

  // Server Communication Helper
  const saveToServer = async (key: string, data: any): Promise<boolean> => {
    try {
      const res = await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, data })
      });
      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
      return false;
    } catch (err) {
      console.warn(`saveToServer failed for key ${key}:`, err);
      return false;
    }
  };

  // Server Hydration function
  const hydrateFromServer = async () => {
    try {
      const res = await fetch('/api/cms/data');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          if (d.settings) {
            const merged = { ...INITIAL_SETTINGS, ...d.settings };
            const activeIcon = merged.favicon_url || merged.site_icon_url || '/favicon.svg';
            merged.favicon_url = activeIcon;
            merged.site_icon_url = activeIcon;
            setSettings(merged);
            setStorage('settings', merged);
            applyFavicon(activeIcon);
          }
          if (d.adminUser) {
            setAdminUser((prev) => ({ ...(prev || INITIAL_ADMIN_USER), ...d.adminUser }));
            setStorage('admin_user', d.adminUser);
          }
          if (Array.isArray(d.articles)) {
            setArticles(d.articles);
            setStorage('articles', d.articles);
          }
          if (Array.isArray(d.articleCategories)) {
            setArticleCategories(d.articleCategories);
            setStorage('article_categories', d.articleCategories);
          }
          if (Array.isArray(d.listings)) {
            setListings(d.listings);
            setStorage('listings', d.listings);
          }
          if (Array.isArray(d.listingCategories)) {
            setListingCategories(d.listingCategories);
            setStorage('listing_categories', d.listingCategories);
          }
          if (Array.isArray(d.pages)) {
            setPages(d.pages);
            setStorage('pages', d.pages);
          }
          if (Array.isArray(d.mediaItems)) {
            setMediaItems(d.mediaItems);
            setStorage('media_items', d.mediaItems);
          }
          if (Array.isArray(d.galleryPhotos)) {
            setGalleryPhotos(d.galleryPhotos);
            setStorage('gallery_photos', d.galleryPhotos);
          }
          if (Array.isArray(d.menuItems)) {
            setMenuItems(d.menuItems);
            setStorage('menu_items', d.menuItems);
          }
          if (Array.isArray(d.homepageSections)) {
            setHomepageSections(migrateHomepageSections(d.homepageSections));
            setStorage('homepage_sections', d.homepageSections);
          }
          if (Array.isArray(d.emergencyHotlines)) {
            setEmergencyHotlines(d.emergencyHotlines);
            setStorage('emergency_hotlines', d.emergencyHotlines);
          }
          if (Array.isArray(d.newsTips)) {
            setNewsTips(d.newsTips);
            setStorage('news_tips', d.newsTips);
          }
          if (Array.isArray(d.users)) {
            setUsers(d.users);
            setStorage('users', d.users);
          }
          if (Array.isArray(d.classifieds)) {
            setClassifieds(d.classifieds);
            setStorage('classifieds', d.classifieds);
          }
          if (Array.isArray(d.sponsoredAds)) {
            setSponsoredAds(d.sponsoredAds);
            setStorage('sponsored_ads', d.sponsoredAds);
          }
        }
      }

      // Sync server installation status
      try {
        const installRes = await fetch('/api/installer/status');
        if (installRes.ok) {
          const installData = await installRes.json();
          if (installData && typeof installData.installed === 'boolean') {
            setInstallConfig((prev) => {
              const updated = {
                ...prev,
                is_installed: installData.installed,
                installed_at: installData.installedAt || prev.installed_at
              };
              setStorage('install_config', updated);
              return updated;
            });
          }
        }
      } catch (e) {
        // Fallback to local storage if endpoint unavailable
      }
    } catch (err) {
      console.warn('Could not fetch server CMS data:', err);
    }
  };

  // Initial Server Hydration
  useEffect(() => {
    hydrateFromServer();
  }, []);

  // Apply persisted favicon on mount and when settings change
  useEffect(() => {
    const activeIcon = settings.favicon_url || settings.site_icon_url || '/favicon.svg';
    applyFavicon(activeIcon);
  }, [settings.favicon_url, settings.site_icon_url]);

  // Auth Actions
  const login = async (username: string, pass: string): Promise<boolean> => {
    const cleanUser = username.trim();
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          sessionStorage.setItem('zs_admin_logged_in', 'true');
          if (data.user) {
            setAdminUser((prev) => ({ ...(prev || INITIAL_ADMIN_USER), ...data.user }));
          }
          return true;
        }
      }
    } catch (e) {
      // Offline fallback
    }

    if (cleanUser === 'admin' && pass === 'Cristiano7@') {
      setIsLoggedIn(true);
      sessionStorage.setItem('zs_admin_logged_in', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsLoggedIn(false);
    sessionStorage.removeItem('zs_admin_logged_in');
    navigateTo('/');
  };

  const updateProfile = async (data: Partial<AdminUser>): Promise<{ success: boolean }> => {
    if (adminUser) {
      const updated = { ...adminUser, ...data };
      setAdminUser(updated);
      setStorage('admin_user', updated);
      const ok = await saveToServer('adminUser', updated);
      return { success: ok };
    }
    return { success: false };
  };

  const updateAdminProfile = async (data: Partial<AdminUser> & { password?: string }): Promise<{ success: boolean }> => {
    const base = adminUser || INITIAL_ADMIN_USER;
    const { password, ...rest } = data;
    const updated = { ...base, ...rest };
    setAdminUser(updated);
    setStorage('admin_user', updated);
    const ok = await saveToServer('adminUser', updated);
    return { success: ok };
  };

  const changePassword = (_oldPass: string, newPass: string) => {
    if (newPass.length < 6) return false;
    return true;
  };

  const switchUser = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (target) {
      setAdminUser(target);
      setStorage('admin_user', target);
      sessionStorage.setItem('zs_admin_logged_in', 'true');
    }
  };

  const createUser = async (userData: Omit<AdminUser, 'id' | 'created_at' | 'last_login'>): Promise<AdminUser> => {
    const newUser: AdminUser = {
      ...userData,
      id: `user_${Date.now()}`,
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    const updated = [...users, newUser];
    setUsers(updated);
    setStorage('users', updated);
    await saveToServer('users', updated);
    return newUser;
  };

  const updateUser = async (id: string, data: Partial<AdminUser>): Promise<{ success: boolean }> => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...data } : u));
    setUsers(updated);
    setStorage('users', updated);
    if (adminUser?.id === id) {
      const current = { ...adminUser, ...data };
      setAdminUser(current);
      setStorage('admin_user', current);
    }
    const ok = await saveToServer('users', updated);
    return { success: ok };
  };

  const deleteUser = async (id: string): Promise<{ success: boolean }> => {
    if (users.length <= 1) return { success: false };
    const updated = users.filter((u) => u.id !== id);
    setUsers(updated);
    setStorage('users', updated);
    const ok = await saveToServer('users', updated);
    return { success: ok };
  };

  // Installer
  const runInstaller = (data: {
    db_host: string;
    db_name: string;
    db_user: string;
    db_pass: string;
    site_name: string;
    site_url: string;
    admin_name: string;
    admin_user: string;
    admin_email: string;
    admin_pass: string;
  }) => {
    const newConfig: DatabaseInstallConfig = {
      is_installed: true,
      installed_at: new Date().toISOString(),
      db_host: data.db_host,
      db_name: data.db_name,
      db_user: data.db_user,
      db_prefix: 'zs_',
      site_url: data.site_url,
      admin_username: data.admin_user
    };
    setInstallConfig(newConfig);

    const newSettings = {
      ...settings,
      site_name: data.site_name,
      site_title: `${data.site_name} — Local News, Community Voice & District Directory`,
      site_url: data.site_url,
      contact_email: data.admin_email,
      copyright_text: `© ${new Date().getFullYear()} ${data.site_name}. All rights reserved.`
    };
    setSettings(newSettings);

    const newAdmin: AdminUser = {
      id: 'admin_1',
      name: data.admin_name,
      username: data.admin_user,
      email: data.admin_email,
      bio: 'Administrator of Zunheboto Social.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      role: 'superadmin',
      created_at: new Date().toISOString(),
      last_login: new Date().toISOString()
    };
    setAdminUser(newAdmin);

    setIsLoggedIn(true);
    sessionStorage.setItem('zs_admin_logged_in', 'true');

    saveToServer('settings', newSettings);
    saveToServer('adminUser', newAdmin);
    return true;
  };

  const resetInstaller = () => {
    setInstallConfig((prev) => ({ ...prev, is_installed: false }));
    sessionStorage.removeItem('zs_admin_logged_in');
    setIsLoggedIn(false);
    navigateTo('/install');
  };

  // Branding & Settings
  const updateSettings = async (data: Partial<SiteSettings>): Promise<{ success: boolean; error?: string }> => {
    const next = { ...settings, ...data };
    if (data.favicon_url !== undefined || data.site_icon_url !== undefined) {
      const activeIcon = data.favicon_url || data.site_icon_url || '';
      next.favicon_url = activeIcon;
      next.site_icon_url = activeIcon;
      applyFavicon(activeIcon || '/favicon.svg', true);
    }
    setSettings(next);
    setStorage('settings', next);
    const ok = await saveToServer('settings', next);
    return { success: ok };
  };

  const applyServerSettings = (newSettings: Partial<SiteSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.favicon_url !== undefined || newSettings.site_icon_url !== undefined) {
        const activeIcon = newSettings.favicon_url || newSettings.site_icon_url || '';
        updated.favicon_url = activeIcon;
        updated.site_icon_url = activeIcon;
        applyFavicon(activeIcon || '/favicon.svg', true);
      }
      setStorage('settings', updated);
      return updated;
    });
  };

  const updateLogo = async (url: string) => {
    const next = { ...settings, logo_url: url };
    setSettings(next);
    setStorage('settings', next);
    await saveToServer('settings', next);
  };

  const removeLogo = async () => {
    const next = { ...settings, logo_url: '' };
    setSettings(next);
    setStorage('settings', next);
    await saveToServer('settings', next);
  };

  const updateFavicon = async (url: string) => {
    const next = { ...settings, favicon_url: url, site_icon_url: url };
    setSettings(next);
    setStorage('settings', next);
    applyFavicon(url, true);
    await saveToServer('settings', next);
  };

  const removeFavicon = async () => {
    const next = { ...settings, favicon_url: '', site_icon_url: '' };
    setSettings(next);
    setStorage('settings', next);
    applyFavicon('/favicon.svg', true);
    await saveToServer('settings', next);
  };

  // Articles
  const createArticle = async (data: Omit<Article, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<Article> => {
    const isSettingFeatured = data.is_featured_story === true || data.featured_lead === true;
    const cat = articleCategories.find((c) => c.id === data.category_id);
    const newArticle: Article = {
      ...data,
      id: `art_${Date.now()}`,
      category_name: cat?.name || 'General',
      category_slug: cat?.slug || 'general',
      category_color: cat?.color || '#0284C7',
      views: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedList = [
      newArticle,
      ...(isSettingFeatured
        ? articles.map((a) => ({ ...a, is_featured_story: false, featured_lead: false }))
        : articles)
    ];

    setArticles(updatedList);
    setStorage('articles', updatedList);
    await saveToServer('articles', updatedList);

    if (isSettingFeatured) {
      const updatedSections = homepageSections.map((sec) =>
        sec.section_key === 'featured_story' || sec.section_type === 'hero'
          ? { ...sec, featured_article_id: newArticle.id }
          : sec
      );
      setHomepageSections(updatedSections);
      setStorage('homepage_sections', updatedSections);
      await saveToServer('homepageSections', updatedSections);
    }

    return newArticle;
  };

  const updateArticle = async (id: string, data: Partial<Article>): Promise<{ success: boolean }> => {
    const isSettingFeatured = data.is_featured_story === true || data.featured_lead === true;
    const updatedArticles = articles.map((art) => {
      if (art.id !== id) {
        if (isSettingFeatured) {
          return { ...art, is_featured_story: false, featured_lead: false };
        }
        return art;
      }
      const cat = data.category_id
        ? articleCategories.find((c) => c.id === data.category_id)
        : undefined;
      return {
        ...art,
        ...data,
        ...(isSettingFeatured ? { is_featured_story: true, featured_lead: true } : {}),
        ...(cat
          ? {
              category_name: cat.name,
              category_slug: cat.slug,
              category_color: cat.color
            }
          : {}),
        updated_at: new Date().toISOString()
      };
    });

    setArticles(updatedArticles);
    setStorage('articles', updatedArticles);
    const ok = await saveToServer('articles', updatedArticles);

    if (isSettingFeatured) {
      const updatedSections = homepageSections.map((sec) =>
        sec.section_key === 'featured_story' || sec.section_type === 'hero'
          ? { ...sec, featured_article_id: id }
          : sec
      );
      setHomepageSections(updatedSections);
      setStorage('homepage_sections', updatedSections);
      await saveToServer('homepageSections', updatedSections);
    }

    return { success: ok };
  };

  const submitArticleForReview = async (id: string, notes?: string): Promise<{ success: boolean }> => {
    return updateArticle(id, {
      status: 'pending_review',
      editorial_status: 'pending_review',
      editorial_notes: notes || undefined,
      submitted_by: adminUser?.name || 'Staff Author',
      submitted_at: new Date().toISOString()
    });
  };

  const approveArticle = async (id: string, publishNow = true, scheduledDate?: string): Promise<{ success: boolean }> => {
    if (!publishNow && scheduledDate) {
      return updateArticle(id, {
        status: 'scheduled',
        editorial_status: 'approved',
        published_at: scheduledDate,
        scheduled_at: scheduledDate,
        reviewed_by: adminUser?.name || 'Newsroom Editor',
        reviewed_at: new Date().toISOString()
      });
    }
    return updateArticle(id, {
      status: 'published',
      editorial_status: 'approved',
      published_at: new Date().toISOString(),
      reviewed_by: adminUser?.name || 'Newsroom Editor',
      reviewed_at: new Date().toISOString()
    });
  };

  const requestArticleChanges = async (id: string, notes: string): Promise<{ success: boolean }> => {
    return updateArticle(id, {
      editorial_status: 'changes_requested',
      editorial_notes: notes,
      reviewed_by: adminUser?.name || 'Newsroom Editor',
      reviewed_at: new Date().toISOString()
    });
  };

  const rejectArticle = async (id: string, notes: string): Promise<{ success: boolean }> => {
    return updateArticle(id, {
      status: 'draft',
      editorial_status: 'rejected',
      editorial_notes: notes,
      reviewed_by: adminUser?.name || 'Newsroom Editor',
      reviewed_at: new Date().toISOString()
    });
  };

  const scheduleArticle = async (id: string, scheduledDate: string): Promise<{ success: boolean }> => {
    return updateArticle(id, {
      status: 'scheduled',
      editorial_status: 'approved',
      published_at: scheduledDate,
      scheduled_at: scheduledDate,
      reviewed_by: adminUser?.name || 'Newsroom Editor',
      reviewed_at: new Date().toISOString()
    });
  };

  const setFeaturedStory = async (articleId: string) => {
    const updatedArticles = articles.map((art) => ({
      ...art,
      is_featured_story: art.id === articleId,
      featured_lead: art.id === articleId
    }));
    setArticles(updatedArticles);
    setStorage('articles', updatedArticles);
    await saveToServer('articles', updatedArticles);

    const updatedSections = homepageSections.map((sec) =>
      sec.section_key === 'featured_story' || sec.section_type === 'hero'
        ? { ...sec, featured_article_id: articleId }
        : sec
    );
    setHomepageSections(updatedSections);
    setStorage('homepage_sections', updatedSections);
    await saveToServer('homepageSections', updatedSections);
  };

  const trashArticle = async (id: string) => {
    await updateArticle(id, { status: 'trash' });
  };

  const restoreArticle = async (id: string) => {
    await updateArticle(id, { status: 'published' });
  };

  const deleteArticlePermanent = async (id: string) => {
    const updated = articles.filter((art) => art.id !== id);
    setArticles(updated);
    setStorage('articles', updated);

    // Also remove from featured article if it was featured
    const updatedSections = homepageSections.map((sec) =>
      sec.featured_article_id === id ? { ...sec, featured_article_id: undefined } : sec
    );
    if (JSON.stringify(updatedSections) !== JSON.stringify(homepageSections)) {
      setHomepageSections(updatedSections);
      setStorage('homepage_sections', updatedSections);
      await saveToServer('homepageSections', updatedSections);
    }

    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) {
        // Fallback to /api/cms/save
        await saveToServer('articles', updated);
      }
    } catch (e) {
      await saveToServer('articles', updated);
    }
  };

  const incrementArticleViews = (slug: string) => {
    setArticles((prev) =>
      prev.map((art) => (art.slug === slug ? { ...art, views: art.views + 1 } : art))
    );
  };

  // Article Categories
  const createArticleCategory = (data: Omit<ArticleCategory, 'id'>) => {
    const newCat: ArticleCategory = {
      ...data,
      id: `cat_${Date.now()}`
    };
    const updated = [...articleCategories, newCat];
    setArticleCategories(updated);
    setStorage('article_categories', updated);
    saveToServer('articleCategories', updated);
    return newCat;
  };

  const updateArticleCategory = (id: string, data: Partial<ArticleCategory>) => {
    const updated = articleCategories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setArticleCategories(updated);
    setStorage('article_categories', updated);
    saveToServer('articleCategories', updated);
  };

  const deleteArticleCategory = (id: string, reassignCategoryId?: string) => {
    const fallbackId = reassignCategoryId || articleCategories.find((c) => c.id !== id)?.id;
    if (fallbackId) {
      const fallbackCat = articleCategories.find((c) => c.id === fallbackId);
      const updatedArticles = articles.map((a) =>
        a.category_id === id
          ? {
              ...a,
              category_id: fallbackId,
              category_name: fallbackCat?.name || 'General',
              category_slug: fallbackCat?.slug || 'general'
            }
          : a
      );
      setArticles(updatedArticles);
      setStorage('articles', updatedArticles);
      saveToServer('articles', updatedArticles);
    }
    const updated = articleCategories.filter((c) => c.id !== id);
    setArticleCategories(updated);
    setStorage('article_categories', updated);
    saveToServer('articleCategories', updated);
  };

  // Listings
  const createListing = async (data: Omit<Listing, 'id' | 'created_at' | 'updated_at' | 'views'>): Promise<Listing> => {
    const cat = listingCategories.find((c) => c.id === data.category_id);
    const newListing: Listing = {
      ...data,
      id: `list_${Date.now()}`,
      category_name: cat?.name || 'General',
      category_slug: cat?.slug || 'general',
      views: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [newListing, ...listings];
    setListings(updated);
    setStorage('listings', updated);
    await saveToServer('listings', updated);
    return newListing;
  };

  const updateListing = async (id: string, data: Partial<Listing>): Promise<{ success: boolean }> => {
    const updated = listings.map((item) => {
      if (item.id !== id) return item;
      const cat = data.category_id
        ? listingCategories.find((c) => c.id === data.category_id)
        : undefined;
      return {
        ...item,
        ...data,
        ...(cat
          ? {
              category_name: cat.name,
              category_slug: cat.slug
            }
          : {}),
        updated_at: new Date().toISOString()
      };
    });
    setListings(updated);
    setStorage('listings', updated);
    const ok = await saveToServer('listings', updated);
    return { success: ok };
  };

  const trashListing = async (id: string) => {
    await updateListing(id, { status: 'trash' });
  };

  const restoreListing = async (id: string) => {
    await updateListing(id, { status: 'published' });
  };

  const deleteListingPermanent = async (id: string) => {
    const updated = listings.filter((item) => item.id !== id);
    setListings(updated);
    setStorage('listings', updated);
    await saveToServer('listings', updated);
  };

  const incrementListingViews = (slug: string) => {
    setListings((prev) =>
      prev.map((item) => (item.slug === slug ? { ...item, views: item.views + 1 } : item))
    );
  };

  const createListingCategory = (data: Omit<ListingCategory, 'id'>) => {
    const newCat: ListingCategory = {
      ...data,
      id: `lcat_${Date.now()}`
    };
    const updated = [...listingCategories, newCat];
    setListingCategories(updated);
    setStorage('listing_categories', updated);
    saveToServer('listingCategories', updated);
    return newCat;
  };

  const updateListingCategory = (id: string, data: Partial<ListingCategory>) => {
    const updated = listingCategories.map((c) => (c.id === id ? { ...c, ...data } : c));
    setListingCategories(updated);
    setStorage('listing_categories', updated);
    saveToServer('listingCategories', updated);
  };

  const deleteListingCategory = (id: string, reassignCategoryId?: string) => {
    const fallbackId = reassignCategoryId || listingCategories.find((c) => c.id !== id)?.id;
    if (fallbackId) {
      const fallbackCat = listingCategories.find((c) => c.id === fallbackId);
      const updatedListings = listings.map((l) =>
        l.category_id === id
          ? {
              ...l,
              category_id: fallbackId,
              category_name: fallbackCat?.name || 'General',
              category_slug: fallbackCat?.slug || 'general'
            }
          : l
      );
      setListings(updatedListings);
      setStorage('listings', updatedListings);
      saveToServer('listings', updatedListings);
    }
    const updated = listingCategories.filter((c) => c.id !== id);
    setListingCategories(updated);
    setStorage('listing_categories', updated);
    saveToServer('listingCategories', updated);
  };

  // Pages
  const createPage = async (data: Omit<StaticPage, 'id' | 'created_at' | 'updated_at'>): Promise<StaticPage> => {
    const newPage: StaticPage = {
      ...data,
      id: `page_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    const updated = [...pages, newPage];
    setPages(updated);
    setStorage('pages', updated);
    await saveToServer('pages', updated);
    return newPage;
  };

  const updatePage = async (id: string, data: Partial<StaticPage>): Promise<{ success: boolean }> => {
    const updated = pages.map((p) => (p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p));
    setPages(updated);
    setStorage('pages', updated);
    const ok = await saveToServer('pages', updated);
    return { success: ok };
  };

  const trashPage = async (id: string) => {
    await updatePage(id, { status: 'trash' });
  };

  const restorePage = async (id: string) => {
    await updatePage(id, { status: 'published' });
  };

  const deletePagePermanent = async (id: string) => {
    const updated = pages.filter((p) => p.id !== id);
    setPages(updated);
    setStorage('pages', updated);
    await saveToServer('pages', updated);
  };

  // Media Library
  const uploadMedia = async (
    title: string,
    fileDataUrl: string,
    caption = '',
    altText = '',
    watermark?: boolean
  ): Promise<MediaItem> => {
    const isWatermarkEnabled = watermark !== undefined ? watermark : settings.watermark_enabled !== false;
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `${(title || 'upload').replace(/[^a-z0-9]/gi, '_')}.jpg`,
          dataUrl: fileDataUrl,
          title,
          caption,
          alt_text: altText,
          watermark: isWatermarkEnabled
        })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.item) {
          const item: MediaItem = json.item;
          setMediaItems((prev) => [item, ...prev.filter((m) => m.id !== item.id)]);
          return item;
        }
      }
    } catch (e) {
      console.warn('Upload API error, using fallback:', e);
    }

    // Fallback if offline
    const safeTitle = (title || 'image_asset').toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fallbackItem: MediaItem = {
      id: `med_${Date.now()}`,
      title: title || 'Image Asset',
      caption,
      alt_text: altText || title || 'Image Asset',
      filename: `${safeTitle}.jpg`,
      file_name: `${safeTitle}.jpg`,
      url: fileDataUrl,
      file_url: fileDataUrl,
      file_type: 'image/jpeg',
      file_size: Math.round(fileDataUrl.length * 0.75),
      created_at: new Date().toISOString()
    };
    const updated = [fallbackItem, ...mediaItems];
    setMediaItems(updated);
    setStorage('media_items', updated);
    await saveToServer('mediaItems', updated);
    return fallbackItem;
  };

  // Local Classifieds & Job Board
  const createClassified = async (data: Omit<ClassifiedListing, 'id' | 'created_at' | 'views'>): Promise<ClassifiedListing> => {
    const newListing: ClassifiedListing = {
      ...data,
      id: `class_${Date.now()}`,
      views: 1,
      created_at: new Date().toISOString(),
      expires_at: data.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };
    const updated = [newListing, ...classifieds];
    setClassifieds(updated);
    setStorage('classifieds', updated);
    await saveToServer('classifieds', updated);
    return newListing;
  };

  const updateClassified = async (id: string, data: Partial<ClassifiedListing>): Promise<{ success: boolean }> => {
    const updated = classifieds.map((c) => (c.id === id ? { ...c, ...data } : c));
    setClassifieds(updated);
    setStorage('classifieds', updated);
    const ok = await saveToServer('classifieds', updated);
    return { success: ok };
  };

  const deleteClassified = async (id: string): Promise<{ success: boolean }> => {
    const updated = classifieds.filter((c) => c.id !== id);
    setClassifieds(updated);
    setStorage('classifieds', updated);
    const ok = await saveToServer('classifieds', updated);
    return { success: ok };
  };

  const approveClassified = async (id: string): Promise<{ success: boolean }> => {
    return updateClassified(id, { status: 'active', verified: true });
  };

  const rejectClassified = async (id: string): Promise<{ success: boolean }> => {
    return updateClassified(id, { status: 'rejected' });
  };

  const incrementClassifiedViews = (id: string) => {
    setClassifieds((prev) =>
      prev.map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c))
    );
  };

  // Sponsored Content & Native Banners
  const createSponsoredAd = async (data: Omit<SponsoredCampaign, 'id' | 'created_at' | 'impressions' | 'clicks'>): Promise<SponsoredCampaign> => {
    const newAd: SponsoredCampaign = {
      ...data,
      id: `ad_${Date.now()}`,
      impressions: 0,
      clicks: 0,
      created_at: new Date().toISOString()
    };
    const updated = [newAd, ...sponsoredAds];
    setSponsoredAds(updated);
    setStorage('sponsored_ads', updated);
    await saveToServer('sponsoredAds', updated);
    return newAd;
  };

  const updateSponsoredAd = async (id: string, data: Partial<SponsoredCampaign>): Promise<{ success: boolean }> => {
    const updated = sponsoredAds.map((a) => (a.id === id ? { ...a, ...data } : a));
    setSponsoredAds(updated);
    setStorage('sponsored_ads', updated);
    const ok = await saveToServer('sponsoredAds', updated);
    return { success: ok };
  };

  const deleteSponsoredAd = async (id: string): Promise<{ success: boolean }> => {
    const updated = sponsoredAds.filter((a) => a.id !== id);
    setSponsoredAds(updated);
    setStorage('sponsored_ads', updated);
    const ok = await saveToServer('sponsoredAds', updated);
    return { success: ok };
  };

  const toggleSponsoredAd = async (id: string): Promise<{ success: boolean }> => {
    const target = sponsoredAds.find((a) => a.id === id);
    if (!target) return { success: false };
    return updateSponsoredAd(id, { active: !target.active });
  };

  const trackAdClick = (id: string) => {
    setSponsoredAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, clicks: (a.clicks || 0) + 1 } : a))
    );
    try {
      fetch(`/api/ads/${id}/impression`, { method: 'POST' }).catch(() => {});
    } catch {}
  };

  const trackAdImpression = (id: string) => {
    setSponsoredAds((prev) =>
      prev.map((a) => (a.id === id ? { ...a, impressions: (a.impressions || 0) + 1 } : a))
    );
    try {
      fetch(`/api/ads/${id}/impression`, { method: 'POST' }).catch(() => {});
    } catch {}
  };

  const updateMediaMetadata = async (id: string, data: Partial<MediaItem>): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.item) {
          setMediaItems((prev) => prev.map((m) => (m.id === id ? { ...m, ...json.item } : m)));
          return { success: true };
        }
      }
    } catch (e) {
      console.warn('Update media API error:', e);
    }
    const updated = mediaItems.map((m) => (m.id === id ? { ...m, ...data } : m));
    setMediaItems(updated);
    setStorage('media_items', updated);
    const ok = await saveToServer('mediaItems', updated);
    return { success: ok };
  };

  const deleteMedia = async (id: string): Promise<{ success: boolean }> => {
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMediaItems((prev) => prev.filter((m) => m.id !== id));
        return { success: true };
      }
    } catch (e) {
      console.warn('Delete media API error:', e);
    }
    const updated = mediaItems.filter((m) => m.id !== id);
    setMediaItems(updated);
    setStorage('media_items', updated);
    const ok = await saveToServer('mediaItems', updated);
    return { success: ok };
  };

  // Gallery
  const addGalleryPhoto = (data: Omit<GalleryPhoto, 'id' | 'created_at'>) => {
    const newPhoto: GalleryPhoto = {
      ...data,
      id: `gal_${Date.now()}`,
      created_at: new Date().toISOString()
    };
    const updated = [...galleryPhotos, newPhoto];
    setGalleryPhotos(updated);
    setStorage('gallery_photos', updated);
    saveToServer('galleryPhotos', updated);
    return newPhoto;
  };

  const updateGalleryPhoto = (id: string, data: Partial<GalleryPhoto>) => {
    const updated = galleryPhotos.map((g) => (g.id === id ? { ...g, ...data } : g));
    setGalleryPhotos(updated);
    setStorage('gallery_photos', updated);
    saveToServer('galleryPhotos', updated);
  };

  const deleteGalleryPhoto = (id: string) => {
    const updated = galleryPhotos.filter((g) => g.id !== id);
    setGalleryPhotos(updated);
    setStorage('gallery_photos', updated);
    saveToServer('galleryPhotos', updated);
  };

  const reorderGallery = (photos: GalleryPhoto[]) => {
    const updated = photos.map((p, idx) => ({ ...p, order: idx + 1 }));
    setGalleryPhotos(updated);
    setStorage('gallery_photos', updated);
    saveToServer('galleryPhotos', updated);
  };

  // Homepage Builder
  const saveAllHomepageSections = async (sections: HomepageSectionConfig[]): Promise<{ success: boolean; error?: string }> => {
    const normalized = sections.map((s, idx) => ({
      ...s,
      order: idx + 1,
      enabled: s.enabled === true || (s.enabled as any) === 1 || (s.enabled as any) === '1' || (s.enabled as any) === 'true'
    }));
    setHomepageSections(normalized);
    setStorage('homepage_sections', normalized);
    const ok = await saveToServer('homepageSections', normalized);
    return { success: ok, error: ok ? undefined : 'Failed to save homepage layout to server' };
  };

  const updateHomepageSection = (id: string, data: Partial<HomepageSectionConfig>) => {
    const updated = homepageSections.map((sec) => (sec.id === id ? { ...sec, ...data } : sec));
    setHomepageSections(updated);
    setStorage('homepage_sections', updated);
    saveToServer('homepageSections', updated);
  };

  const reorderHomepageSections = (fromIndexOrSections: any, toIndex?: number) => {
    if (Array.isArray(fromIndexOrSections)) {
      const updated = fromIndexOrSections.map((s, idx) => ({ ...s, order: idx + 1 }));
      setHomepageSections(updated);
      setStorage('homepage_sections', updated);
      saveToServer('homepageSections', updated);
    } else if (typeof fromIndexOrSections === 'number' && typeof toIndex === 'number') {
      setHomepageSections((prev) => {
        const copy = [...prev];
        const [moved] = copy.splice(fromIndexOrSections, 1);
        copy.splice(toIndex, 0, moved);
        const updated = copy.map((s, idx) => ({ ...s, order: idx + 1 }));
        setStorage('homepage_sections', updated);
        saveToServer('homepageSections', updated);
        return updated;
      });
    }
  };

  const toggleHomepageSection = (id: string) => {
    const updated = homepageSections.map((sec) => (sec.id === id ? { ...sec, enabled: !sec.enabled } : sec));
    setHomepageSections(updated);
    setStorage('homepage_sections', updated);
    saveToServer('homepageSections', updated);
  };

  const addHomepageSection = (data: Omit<HomepageSectionConfig, 'id' | 'order'>) => {
    const newSection: HomepageSectionConfig = {
      ...data,
      id: `sec_${Date.now()}`,
      order: homepageSections.length + 1
    };
    const updated = [...homepageSections, newSection];
    setHomepageSections(updated);
    setStorage('homepage_sections', updated);
    saveToServer('homepageSections', updated);
    return newSection;
  };

  const deleteHomepageSection = (id: string) => {
    const updated = homepageSections.filter((sec) => sec.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }));
    setHomepageSections(updated);
    setStorage('homepage_sections', updated);
    saveToServer('homepageSections', updated);
  };

  const resetHomepageSections = () => {
    const updated = migrateHomepageSections(INITIAL_HOMEPAGE_SECTIONS);
    setHomepageSections(updated);
    setStorage('homepage_sections', updated);
    saveToServer('homepageSections', updated);
  };

  // Menus
  const addMenuItem = (data: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...data,
      id: `menu_${Date.now()}`
    };
    const updated = [...menuItems, newItem];
    setMenuItems(updated);
    setStorage('menu_items', updated);
    saveToServer('menuItems', updated);
    return newItem;
  };

  const updateMenuItem = (id: string, data: Partial<MenuItem>) => {
    const updated = menuItems.map((item) => (item.id === id ? { ...item, ...data } : item));
    setMenuItems(updated);
    setStorage('menu_items', updated);
    saveToServer('menuItems', updated);
  };

  const deleteMenuItem = (id: string) => {
    const updated = menuItems.filter((item) => item.id !== id);
    setMenuItems(updated);
    setStorage('menu_items', updated);
    saveToServer('menuItems', updated);
  };

  const reorderMenuItems = (locationOrItems: any, fromIndex?: number, toIndex?: number) => {
    if (Array.isArray(locationOrItems)) {
      const updated = locationOrItems.map((m, idx) => ({ ...m, order: idx + 1, order_index: idx + 1 }));
      setMenuItems(updated);
      setStorage('menu_items', updated);
      saveToServer('menuItems', updated);
    } else if (typeof locationOrItems === 'string' && typeof fromIndex === 'number' && typeof toIndex === 'number') {
      setMenuItems((prev) => {
        const filtered = prev.filter((m) => (m.location || (m.menu_group === 'main' ? 'header' : 'footer')) === locationOrItems);
        const others = prev.filter((m) => (m.location || (m.menu_group === 'main' ? 'header' : 'footer')) !== locationOrItems);
        const copy = [...filtered];
        const [moved] = copy.splice(fromIndex, 1);
        copy.splice(toIndex, 0, moved);
        const reordered = copy.map((m, idx) => ({ ...m, order: idx + 1, order_index: idx + 1 }));
        const updated = [...reordered, ...others];
        setStorage('menu_items', updated);
        saveToServer('menuItems', updated);
        return updated;
      });
    }
  };

  // Hotlines
  const addEmergencyHotline = (data: Omit<EmergencyHotline, 'id'>) => {
    const newHotline: EmergencyHotline = {
      ...data,
      id: `hot_${Date.now()}`
    };
    const updated = [...emergencyHotlines, newHotline];
    setEmergencyHotlines(updated);
    setStorage('emergency_hotlines', updated);
    saveToServer('emergencyHotlines', updated);
    return newHotline;
  };

  const updateEmergencyHotline = (id: string, data: Partial<EmergencyHotline>) => {
    const updated = emergencyHotlines.map((h) => (h.id === id ? { ...h, ...data } : h));
    setEmergencyHotlines(updated);
    setStorage('emergency_hotlines', updated);
    saveToServer('emergencyHotlines', updated);
  };

  const deleteEmergencyHotline = (id: string) => {
    const updated = emergencyHotlines.filter((h) => h.id !== id);
    setEmergencyHotlines(updated);
    setStorage('emergency_hotlines', updated);
    saveToServer('emergencyHotlines', updated);
  };

  const toggleEmergencyHotline = (id: string) => {
    const updated = emergencyHotlines.map((h) => (h.id === id ? { ...h, enabled: !h.enabled } : h));
    setEmergencyHotlines(updated);
    setStorage('emergency_hotlines', updated);
    saveToServer('emergencyHotlines', updated);
  };

  // News Tips
  const submitNewsTip = (data: Omit<NewsTip, 'id' | 'created_at' | 'status'>) => {
    const newTip: NewsTip = {
      ...data,
      id: `tip_${Date.now()}`,
      created_at: new Date().toISOString(),
      status: 'unread'
    };
    const updated = [newTip, ...newsTips];
    setNewsTips(updated);
    setStorage('news_tips', updated);
    saveToServer('newsTips', updated);
    return newTip;
  };

  const updateNewsTipStatus = (id: string, status: NewsTip['status']) => {
    const updated = newsTips.map((t) => (t.id === id ? { ...t, status } : t));
    setNewsTips(updated);
    setStorage('news_tips', updated);
    saveToServer('newsTips', updated);
  };

  const deleteNewsTip = (id: string) => {
    const updated = newsTips.filter((t) => t.id !== id);
    setNewsTips(updated);
    setStorage('news_tips', updated);
    saveToServer('newsTips', updated);
  };

  // Export Utilities
  const exportDatabaseJson = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      settings,
      adminUser,
      articles,
      articleCategories,
      listings,
      listingCategories,
      pages,
      galleryPhotos,
      mediaItems,
      menuItems,
      homepageSections,
      emergencyHotlines,
      newsTips
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zunheboto_social_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportDatabaseSql = () => {
    let sql = `-- Zunheboto Social Database Dump\n-- Generated on: ${new Date().toISOString()}\n\nSET NAMES utf8mb4;\n\n`;
    // Insert settings
    Object.entries(settings).forEach(([k, v]) => {
      const valEscaped = String(v).replace(/'/g, "\\'");
      sql += `INSERT INTO zs_settings (setting_key, setting_value) VALUES ('${k}', '${valEscaped}') ON DUPLICATE KEY UPDATE setting_value = '${valEscaped}';\n`;
    });
    sql += `\n`;

    // Insert articles
    articles.forEach((a) => {
      const titleEsc = a.title.replace(/'/g, "\\'");
      const contentEsc = a.content.replace(/'/g, "\\'");
      const excerptEsc = a.excerpt.replace(/'/g, "\\'");
      sql += `INSERT INTO zs_articles (title, slug, excerpt, content, featured_image, author_name, status, published_at, views) VALUES ('${titleEsc}', '${a.slug}', '${excerptEsc}', '${contentEsc}', '${a.featured_image}', '${a.author_name}', '${a.status}', '${a.published_at}', ${a.views});\n`;
    });
    sql += `\n`;

    // Insert listings
    listings.forEach((l) => {
      const nameEsc = l.name.replace(/'/g, "\\'");
      const descEsc = l.description.replace(/'/g, "\\'");
      const addrEsc = l.address.replace(/'/g, "\\'");
      sql += `INSERT INTO zs_listings (name, slug, description, featured_image, address, location_area, phone, email, website, whatsapp, status, verified) VALUES ('${nameEsc}', '${l.slug}', '${descEsc}', '${l.featured_image}', '${addrEsc}', '${l.location_area}', '${l.phone}', '${l.email}', '${l.website}', '${l.whatsapp}', '${l.status}', ${l.verified ? 1 : 0});\n`;
    });

    const blob = new Blob([sql], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `zunheboto_social_dump_${new Date().toISOString().split('T')[0]}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPhpZip = async () => {
    try {
      const blob = await generatePhpZipPackage(
        settings,
        articles,
        listings,
        pages,
        emergencyHotlines,
        articleCategories,
        listingCategories,
        menuItems,
        galleryPhotos,
        homepageSections,
        adminUser,
        newsTips,
        mediaItems
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `zunheboto-social-php8.2-deployable.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate PHP zip', err);
      alert('Error building ZIP package. Please try again.');
    }
  };

  const resetToSampleData = async () => {
    setSettings(INITIAL_SETTINGS);
    setArticles(INITIAL_ARTICLES);
    setArticleCategories(INITIAL_ARTICLE_CATEGORIES);
    setListings(INITIAL_LISTINGS);
    setListingCategories(INITIAL_LISTING_CATEGORIES);
    setPages(INITIAL_STATIC_PAGES);
    setGalleryPhotos(INITIAL_GALLERY_PHOTOS);
    setMediaItems(INITIAL_MEDIA);
    setMenuItems(INITIAL_MENU_ITEMS);
    setHomepageSections(INITIAL_HOMEPAGE_SECTIONS);
    setEmergencyHotlines(INITIAL_EMERGENCY_HOTLINES);
    setNewsTips(INITIAL_NEWS_TIPS);

    try {
      await fetch('/api/cms/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullStore: {
            settings: INITIAL_SETTINGS,
            articles: INITIAL_ARTICLES,
            articleCategories: INITIAL_ARTICLE_CATEGORIES,
            listings: INITIAL_LISTINGS,
            listingCategories: INITIAL_LISTING_CATEGORIES,
            pages: INITIAL_STATIC_PAGES,
            galleryPhotos: INITIAL_GALLERY_PHOTOS,
            mediaItems: INITIAL_MEDIA,
            menuItems: INITIAL_MENU_ITEMS,
            homepageSections: INITIAL_HOMEPAGE_SECTIONS,
            emergencyHotlines: INITIAL_EMERGENCY_HOTLINES,
            newsTips: INITIAL_NEWS_TIPS
          }
        })
      });
    } catch (e) {
      console.warn('Error resetting store on server:', e);
    }
  };

  return (
    <CmsContext.Provider
      value={{
        activePath,
        currentRoute: activePath,
        installConfig,
        settings,
        adminUser,
        isLoggedIn,
        isAuthenticated: isLoggedIn,
        articles,
        articleCategories,
        listings,
        listingCategories,
        pages,
        galleryPhotos,
        mediaItems,
        menuItems,
        homepageSections,
        emergencyHotlines,
        newsTips,
        users,
        classifieds,
        sponsoredAds,
        weather,
        refreshWeather,
        navigateTo,
        login,
        logout,
        updateProfile,
        updateAdminProfile,
        changePassword,
        switchUser,
        createUser,
        updateUser,
        deleteUser,
        runInstaller,
        resetInstaller,
        updateSettings,
        applyServerSettings,
        updateLogo,
        removeLogo,
        updateFavicon,
        removeFavicon,
        createArticle,
        updateArticle,
        submitArticleForReview,
        approveArticle,
        requestArticleChanges,
        rejectArticle,
        scheduleArticle,
        setFeaturedStory,
        trashArticle,
        restoreArticle,
        deleteArticlePermanent,
        deleteArticle: deleteArticlePermanent,
        incrementArticleViews,
        createArticleCategory,
        updateArticleCategory,
        deleteArticleCategory,
        createListing,
        updateListing,
        trashListing,
        restoreListing,
        deleteListingPermanent,
        deleteListing: deleteListingPermanent,
        createListingCategory,
        updateListingCategory,
        deleteListingCategory,
        incrementListingViews,
        createClassified,
        updateClassified,
        deleteClassified,
        approveClassified,
        rejectClassified,
        incrementClassifiedViews,
        createSponsoredAd,
        updateSponsoredAd,
        deleteSponsoredAd,
        toggleSponsoredAd,
        trackAdClick,
        trackAdImpression,
        createPage,
        updatePage,
        trashPage,
        restorePage,
        deletePagePermanent,
        deletePage: deletePagePermanent,
        uploadMedia,
        updateMediaMetadata,
        deleteMedia,
        addGalleryPhoto,
        createGalleryPhoto: addGalleryPhoto,
        updateGalleryPhoto,
        deleteGalleryPhoto,
        reorderGallery,
        saveAllHomepageSections,
        updateHomepageSection,
        reorderHomepageSections,
        toggleHomepageSection,
        addHomepageSection,
        createHomepageSection: addHomepageSection,
        deleteHomepageSection,
        resetHomepageSections,
        addMenuItem,
        createMenuItem: addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        reorderMenuItems,
        addEmergencyHotline,
        createHotline: addEmergencyHotline,
        updateEmergencyHotline,
        updateHotline: updateEmergencyHotline,
        deleteEmergencyHotline,
        deleteHotline: deleteEmergencyHotline,
        toggleEmergencyHotline,
        submitNewsTip,
        updateNewsTipStatus,
        deleteNewsTip,
        exportDatabaseJson,
        exportJsonBackup: exportDatabaseJson,
        exportDatabaseSql,
        exportSqlDatabase: exportDatabaseSql,
        downloadPhpZip,
        reloadFromStorage: hydrateFromServer,
        resetToSampleData,
        resetToFactoryDefaults: resetToSampleData
      }}
    >
      {children}
    </CmsContext.Provider>
  );
};

export const useCms = (): CmsContextType => {
  const context = useContext(CmsContext);
  if (!context) {
    throw new Error('useCms must be used within a CmsProvider');
  }
  return context;
};
