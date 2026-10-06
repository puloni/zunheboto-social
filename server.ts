import express from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { createServer as createViteServer } from 'vite';
import { storageManager } from './server/storage';
import { getRealWeatherData, searchLocations, WeatherProviderType } from './server/weatherService';
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
  INITIAL_NEWS_TIPS
} from './src/data/initialData';

const app = express();
// Configurable Server Port:
// - In production (CyberPanel), defaults to 3001 to prevent conflicts with CyberPanel/nghttpx on 3000.
// - Respects process.env.PORT if explicitly configured (e.g. PORT=3001).
// - In development (AI Studio environment), binds to 3000 as required by the platform reverse proxy.
const PORT = process.env.PORT && process.env.PORT !== '8080'
  ? Number(process.env.PORT)
  : (process.env.NODE_ENV === 'production' ? 3001 : 3000);

// Body parser with 50mb limit for media uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Persistent Storage Directories
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// Serve favicon.ico dynamically resolving to configured favicon or fallback
app.get('/favicon.ico', (req, res) => {
  try {
    const settings = store?.settings || {};
    const iconUrl = settings.favicon_url || settings.site_icon_url;
    if (iconUrl) {
      if (iconUrl.startsWith('http://') || iconUrl.startsWith('https://')) {
        return res.redirect(iconUrl);
      }
      const localUpload = path.join(process.cwd(), iconUrl.replace(/^\//, ''));
      if (fs.existsSync(localUpload)) {
        return res.sendFile(localUpload);
      }
      const localPublic = path.join(process.cwd(), 'public', iconUrl.replace(/^\//, ''));
      if (fs.existsSync(localPublic)) {
        return res.sendFile(localPublic);
      }
      return res.redirect(iconUrl);
    }
    const defaultIcon = path.join(process.cwd(), 'public', 'favicon.ico');
    if (fs.existsSync(defaultIcon)) {
      return res.sendFile(defaultIcon);
    }
    const fallbackIcon = path.join(process.cwd(), 'public', 'favicon.svg');
    if (fs.existsSync(fallbackIcon)) {
      return res.sendFile(fallbackIcon);
    }
    return res.status(404).end();
  } catch (e) {
    return res.status(500).end();
  }
});

// In-Memory CMS Store cache backed by StorageManager
let store: any = {
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
  newsTips: INITIAL_NEWS_TIPS
};

// CMS API Endpoints
app.get('/api/cms/data', async (req, res) => {
  try {
    store = await storageManager.loadStore();
    await checkScheduledArticles();
    // Create safe payload: never leak raw weather API key to public client
    const safeData = { ...store };
    if (safeData.settings) {
      const s = { ...safeData.settings };
      s.weather_api_key_configured = Boolean(s.weather_api_key && String(s.weather_api_key).trim().length > 0);
      delete s.weather_api_key;
      safeData.settings = s;
    }
    res.json({ success: true, data: safeData });
  } catch (err: any) {
    console.error('Failed to load CMS store:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/cms/save', async (req, res) => {
  try {
    const { key, data, fullStore } = req.body;
    let saved = false;

    if (fullStore && typeof fullStore === 'object') {
      // Preserve server-side secrets (such as weather_api_key)
      if (store.settings?.weather_api_key && (!fullStore.settings || !fullStore.settings.weather_api_key)) {
        if (!fullStore.settings) fullStore.settings = {};
        fullStore.settings.weather_api_key = store.settings.weather_api_key;
      }
      saved = await storageManager.saveStore(fullStore);
      store = fullStore;
    } else if (key && data !== undefined) {
      let finalData = data;
      // CRITICAL SERVER-SIDE PROTECTION FOR SECRETS:
      // If client saves settings, never erase weather_api_key because of sanitized frontend payload!
      if (key === 'settings' && typeof data === 'object' && data !== null) {
        finalData = { ...data };
        if (!finalData.weather_api_key && store.settings?.weather_api_key) {
          finalData.weather_api_key = store.settings.weather_api_key;
        }
        // Keep favicon_url and site_icon_url in sync if one was updated
        const activeFavicon = finalData.favicon_url || finalData.site_icon_url;
        if (activeFavicon) {
          finalData.favicon_url = activeFavicon;
          finalData.site_icon_url = activeFavicon;
        }
      } else if (key === 'homepageSections' && Array.isArray(data)) {
        // Ensure boolean normalization for homepage sections
        finalData = data.map((sec: any) => ({
          ...sec,
          enabled: sec.enabled === 1 || sec.enabled === '1' || sec.enabled === true || sec.enabled === 'true'
        }));
      }

      saved = await storageManager.saveKey(key, finalData);
      store[key] = finalData;
    } else {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    if (!saved) {
      return res.status(500).json({ success: false, error: 'Storage write failed' });
    }

    return res.json({ success: true, timestamp: Date.now() });
  } catch (err: any) {
    console.error('Error saving CMS data:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Article Endpoints (RESTful DELETE and POST fallback)
app.delete('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Article ID required' });
    }

    const ok = await storageManager.deleteArticle(id);
    if (!ok) {
      return res.status(500).json({ success: false, error: 'Failed to delete article from storage' });
    }

    if (store && Array.isArray(store.articles)) {
      store.articles = store.articles.filter((a: any) => a.id !== id);
    }

    return res.json({ success: true, id, message: 'Article permanently deleted' });
  } catch (err: any) {
    console.error('Error deleting article:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/articles/:id/delete', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ success: false, error: 'Article ID required' });
    }

    const ok = await storageManager.deleteArticle(id);
    if (!ok) {
      return res.status(500).json({ success: false, error: 'Failed to delete article from storage' });
    }

    if (store && Array.isArray(store.articles)) {
      store.articles = store.articles.filter((a: any) => a.id !== id);
    }

    return res.json({ success: true, id, message: 'Article permanently deleted' });
  } catch (err: any) {
    console.error('Error deleting article:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Storage Administration API Endpoints
app.get('/api/admin/storage/status', async (req, res) => {
  try {
    const status = await storageManager.getStatus();
    res.json({ success: true, status });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/admin/storage/test', async (req, res) => {
  try {
    const { host, port, database, user, password } = req.body || {};
    const customConfig = (host || database || user || password !== undefined) ? {
      host: host || 'localhost',
      port: Number(port) || 3306,
      database: database || '',
      user: user || '',
      password: password || '',
    } : undefined;

    const result = await storageManager.testConnection(customConfig);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/storage/save', async (req, res) => {
  try {
    const { mode, host, port, database, user, password } = req.body || {};
    const result = await storageManager.updateConfiguration({
      mode,
      host,
      port: port ? Number(port) : undefined,
      database,
      user,
      password
    });
    // Reload in-memory store after configuration update
    store = await storageManager.loadStore();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/storage/init-tables', async (req, res) => {
  try {
    const { host, port, database, user, password } = req.body || {};
    const customConfig = (host || database || user || password !== undefined) ? {
      host: host || 'localhost',
      port: Number(port) || 3306,
      database: database || '',
      user: user || '',
      password: password || '',
    } : undefined;

    const result = await storageManager.initTables(customConfig);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/admin/storage/migrate-json-to-db', async (req, res) => {
  try {
    const { host, port, database, user, password } = req.body || {};
    const customConfig = (host || database || user || password !== undefined) ? {
      host: host || 'localhost',
      port: Number(port) || 3306,
      database: database || '',
      user: user || '',
      password: password || '',
    } : undefined;

    const result = await storageManager.migrateJsonToDb(customConfig);
    // Reload in-memory cache
    store = await storageManager.loadStore();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Media Upload Endpoint
app.post('/api/media/upload', async (req, res) => {
  try {
    const { filename, dataUrl, title, caption, alt_text } = req.body;
    if (!dataUrl || !filename) {
      return res.status(400).json({ success: false, error: 'Missing filename or file data' });
    }

    // Format: "data:image/png;base64,....."
    const matches = dataUrl.match(/^data:([A-Za-z0-9+/.-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({ success: false, error: 'Invalid data URL format' });
    }

    const mimeType = matches[1].toLowerCase();
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Validation: 15MB limit
    const MAX_SIZE = 15 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return res.status(400).json({ success: false, error: 'File exceeds 15MB limit' });
    }

    // Determine extension
    let ext = path.extname(filename).toLowerCase().replace(/^\./, '');
    if (!ext) {
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('icon') || mimeType.includes('ico')) ext = 'ico';
      else ext = 'jpg';
    }

    const safeBaseName = path.basename(filename, path.extname(filename))
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, '_');
    const safeFilename = `${Date.now()}_${safeBaseName}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, safeFilename);

    // Automated Photo Watermarking
    let finalBuffer = buffer;
    const isGloballyEnabled = store.settings?.watermark_enabled !== false;
    const shouldWatermark = isGloballyEnabled && req.body.watermark !== false && req.body.watermark !== 'false';
    const isWatermarkableImage =
      mimeType.startsWith('image/') &&
      !mimeType.includes('svg') &&
      !mimeType.includes('gif') &&
      !mimeType.includes('icon') &&
      !mimeType.includes('ico');

    if (isWatermarkableImage && shouldWatermark) {
      try {
        const metadata = await sharp(buffer).metadata();
        const width = metadata.width || 800;
        const height = metadata.height || 600;

        // Apply watermark if image has sufficient resolution
        if (width >= 320 && height >= 200) {
          const wmWidth = Math.min(Math.max(Math.round(width * 0.28), 190), 320);
          const wmHeight = Math.round(wmWidth * 0.22);
          const fontSize = Math.max(Math.round(wmWidth * 0.055), 9);
          const subFontSize = Math.max(Math.round(fontSize * 0.72), 7);
          const dotRadius = Math.max(Math.round(fontSize * 0.38), 3);
          const paddingLeft = Math.round(wmWidth * 0.08);

          const wmBrand = escapeXml((store.settings?.watermark_text || 'ZUNHEBOTO SOCIAL').toUpperCase());

          const watermarkSvg = `
          <svg width="${wmWidth}" height="${wmHeight}" viewBox="0 0 ${wmWidth} ${wmHeight}" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="wmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0B192C" stop-opacity="0.85"/>
                <stop offset="100%" stop-color="#1E293B" stop-opacity="0.92"/>
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="${wmWidth}" height="${wmHeight}" rx="${Math.round(wmHeight * 0.24)}" fill="url(#wmGrad)" stroke="rgba(245,158,11,0.5)" stroke-width="1.2"/>
            <circle cx="${paddingLeft}" cy="${Math.round(wmHeight * 0.5)}" r="${dotRadius}" fill="#F59E0B"/>
            <text x="${paddingLeft + dotRadius * 2 + 5}" y="${Math.round(wmHeight * 0.44)}" font-family="system-ui, -apple-system, sans-serif" font-size="${fontSize}" font-weight="800" fill="#FFFFFF" letter-spacing="1">${wmBrand}</text>
            <text x="${paddingLeft + dotRadius * 2 + 5}" y="${Math.round(wmHeight * 0.78)}" font-family="system-ui, -apple-system, sans-serif" font-size="${subFontSize}" font-weight="600" fill="#FBBF24" letter-spacing="0.5">PRESS &amp; ARCHIVE</text>
          </svg>`;

          finalBuffer = await sharp(buffer)
            .composite([
              {
                input: Buffer.from(watermarkSvg),
                gravity: 'southeast',
                top: undefined,
                left: undefined
              }
            ])
            .toBuffer();
        }
      } catch (wmErr) {
        console.warn('Watermark overlay skipped due to processing error:', wmErr);
        finalBuffer = buffer;
      }
    }

    fs.writeFileSync(filePath, finalBuffer);

    const publicUrl = `/uploads/${safeFilename}`;
    const newItem = {
      id: `med_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: title || safeBaseName.replace(/[_-]/g, ' '),
      caption: caption || '',
      alt_text: alt_text || title || safeBaseName.replace(/[_-]/g, ' '),
      filename: safeFilename,
      file_name: safeFilename,
      url: publicUrl,
      file_url: publicUrl,
      file_type: mimeType,
      file_size: finalBuffer.length,
      created_at: new Date().toISOString()
    };

    const currentStore = await storageManager.loadStore();
    const updatedMedia = [newItem, ...(currentStore.mediaItems || []).filter((m: any) => m.id !== newItem.id)];
    await storageManager.saveKey('mediaItems', updatedMedia);
    store.mediaItems = updatedMedia;

    return res.json({ success: true, item: newItem, url: publicUrl });
  } catch (err: any) {
    console.error('Error uploading file:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload processing failed' });
  }
});

// Update Media Metadata Endpoint
app.put('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const { title, caption, alt_text, description } = req.body;

  const currentStore = await storageManager.loadStore();
  let found = false;
  const updatedMedia = (currentStore.mediaItems || []).map((m: any) => {
    if (m.id === id) {
      found = true;
      return {
        ...m,
        title: title !== undefined ? title : m.title,
        caption: caption !== undefined ? caption : m.caption,
        alt_text: alt_text !== undefined ? alt_text : m.alt_text,
        description: description !== undefined ? description : m.description
      };
    }
    return m;
  });

  if (!found) {
    return res.status(404).json({ success: false, error: 'Media item not found' });
  }

  await storageManager.saveKey('mediaItems', updatedMedia);
  store.mediaItems = updatedMedia;
  return res.json({ success: true, item: updatedMedia.find((m: any) => m.id === id) });
});

// Delete Media Endpoint
app.delete('/api/media/:id', async (req, res) => {
  const { id } = req.params;
  const currentStore = await storageManager.loadStore();
  const item = (currentStore.mediaItems || []).find((m: any) => m.id === id);

  if (item && item.filename) {
    const filePath = path.join(UPLOADS_DIR, item.filename);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.warn('Could not delete physical upload file:', e);
      }
    }
  }

  const updatedMedia = (currentStore.mediaItems || []).filter((m: any) => m.id !== id);
  await storageManager.saveKey('mediaItems', updatedMedia);
  store.mediaItems = updatedMedia;
  return res.json({ success: true });
});

// Helper to escape HTML attributes safely
function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Server-Side Open Graph and HTML Meta Injection
function injectMetaTags(html: string, reqPath: string, currentStore: any): string {
  const settings = currentStore?.settings || {};
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const siteName = settings.site_name || 'Zunheboto Social';
  const defaultImage = settings.default_share_image || settings.logo_url || `${siteUrl}/zunheboto-social-logo.png`;

  const toAbsolute = (img?: string) => {
    if (!img) {
      return defaultImage.startsWith('http')
        ? defaultImage
        : `${siteUrl}${defaultImage.startsWith('/') ? '' : '/'}${defaultImage}`;
    }
    if (img.startsWith('http://') || img.startsWith('https://')) return img;
    return `${siteUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  let title = settings.seo_title || `${siteName} | ${settings.tagline || 'District News, Voice & Directory'}`;
  let description = settings.seo_description || settings.tagline || 'A modern, reliable local publication, community, and directory website for Zunheboto, Nagaland.';
  let image = toAbsolute(settings.social_image_url || defaultImage);
  let ogType = 'website';
  let canonical = `${siteUrl}${reqPath === '/' ? '' : reqPath}`;

  if (reqPath.startsWith('/article/')) {
    const slug = reqPath.replace('/article/', '').split('?')[0];
    const article = (currentStore?.articles || []).find((a: any) => a.slug === slug);
    if (article) {
      title = `${article.seo_title || article.title} | ${siteName}`;
      description = article.meta_description || article.excerpt || description;
      image = toAbsolute(article.social_image || article.featured_image || image);
      ogType = 'article';
      canonical = `${siteUrl}/article/${article.slug}`;
    }
  } else if (reqPath.startsWith('/listing/')) {
    const slug = reqPath.replace('/listing/', '').split('?')[0];
    const listing = (currentStore?.listings || []).find((l: any) => l.slug === slug);
    if (listing) {
      title = `${listing.title || listing.name} — District Directory | ${siteName}`;
      description = listing.meta_description || listing.description || listing.address || description;
      image = toAbsolute(listing.featured_image || image);
      ogType = 'place';
      canonical = `${siteUrl}/listing/${listing.slug}`;
    }
  } else if (reqPath.startsWith('/category/')) {
    const slug = reqPath.replace('/category/', '').split('?')[0];
    const cat = (currentStore?.articleCategories || []).find((c: any) => c.slug === slug);
    if (cat) {
      title = `${cat.name} Chronicles | ${siteName}`;
      description = cat.description || `Read the latest ${cat.name} news and updates from Zunheboto district.`;
      canonical = `${siteUrl}/category/${cat.slug}`;
    }
  } else if (reqPath.startsWith('/author/')) {
    const slug = reqPath.replace('/author/', '').split('?')[0];
    const admin = currentStore?.adminUser;
    const authorName = admin?.display_name || admin?.name || 'Khekato Chishi';
    title = `${authorName} — Editorial Profile | ${siteName}`;
    description = admin?.bio || `Articles, chronicles, and community reports authored by ${authorName} on ${siteName}.`;
    if (admin?.avatar_url) {
      image = toAbsolute(admin.avatar_url);
    }
    canonical = `${siteUrl}/author/${slug}`;
  } else if (reqPath.startsWith('/page/') || ['/about', '/contact', '/privacy', '/terms'].includes(reqPath)) {
    const slug = reqPath.startsWith('/page/') ? reqPath.replace('/page/', '').split('?')[0] : reqPath.replace('/', '');
    const page = (currentStore?.pages || []).find((p: any) => p.slug === slug);
    if (page) {
      title = `${page.title} | ${siteName}`;
      description = page.meta_description || description;
      canonical = `${siteUrl}/${page.slug}`;
    }
  } else if (reqPath === '/directory') {
    title = `District Directory | ${siteName}`;
    description = 'Verified directory for emergency hotlines, administrative offices, healthcare, and schools across Zunheboto.';
    canonical = `${siteUrl}/directory`;
  } else if (reqPath === '/gallery') {
    title = `District Photo Gallery | ${siteName}`;
    description = 'A curated photographic archive celebrating the landscapes, tribal culture, and heritage of Zunheboto.';
    canonical = `${siteUrl}/gallery`;
  }

  // Replace <title>
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);

  // Helper to upsert meta tags
  const upsertMeta = (propName: string, propVal: string, contentVal: string) => {
    const regex = new RegExp(`<meta[^>]*${propName}="${propVal}"[^>]*>`, 'gi');
    const newTag = `<meta ${propName}="${propVal}" content="${escapeHtml(contentVal)}" />`;
    if (regex.test(html)) {
      html = html.replace(regex, newTag);
    } else {
      html = html.replace('</head>', `  ${newTag}\n</head>`);
    }
  };

  upsertMeta('name', 'description', description);
  upsertMeta('property', 'og:title', title);
  upsertMeta('property', 'og:description', description);
  upsertMeta('property', 'og:url', canonical);
  upsertMeta('property', 'og:type', ogType);
  upsertMeta('property', 'og:site_name', siteName);
  upsertMeta('property', 'og:image', image);
  upsertMeta('name', 'twitter:card', 'summary_large_image');
  upsertMeta('name', 'twitter:title', title);
  upsertMeta('name', 'twitter:description', description);
  upsertMeta('name', 'twitter:image', image);

  // Canonical link tag
  const canonTag = `<link rel="canonical" href="${escapeHtml(canonical)}" />`;
  if (/<link[^>]*rel="canonical"[^>]*>/i.test(html)) {
    html = html.replace(/<link[^>]*rel="canonical"[^>]*>/gi, canonTag);
  } else {
    html = html.replace('</head>', `  ${canonTag}\n</head>`);
  }

  // Favicon tags
  const favicon = settings.favicon_url || settings.site_icon_url || '/favicon.svg';
  if (favicon) {
    const escapedFavicon = escapeHtml(favicon);
    if (/<link[^>]*rel="icon"[^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]*rel="icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="icon" id="zs-dynamic-favicon" href="${escapedFavicon}" />`);
    } else {
      html = html.replace('</head>', `  <link rel="icon" id="zs-dynamic-favicon" href="${escapedFavicon}" />\n</head>`);
    }
    if (/<link[^>]*rel="apple-touch-icon"[^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]*rel="apple-touch-icon"[^>]*href="[^"]*"[^>]*>/gi, `<link rel="apple-touch-icon" id="zs-dynamic-apple-icon" href="${escapedFavicon}" />`);
    } else {
      html = html.replace('</head>', `  <link rel="apple-touch-icon" id="zs-dynamic-apple-icon" href="${escapedFavicon}" />\n</head>`);
    }
  }

  return html;
}

// =========================================================================
// Real-Time Weather System (AccuWeather / Open-Meteo / OpenWeatherMap)
// =========================================================================

// Public Weather Endpoint: Real-time observations & genuine forecast
app.get('/api/weather', async (req, res) => {
  try {
    const settings = store?.settings || {};
    const provider: WeatherProviderType = (req.query.provider as WeatherProviderType) || settings.weather_provider || 'open-meteo';
    const locationName = (req.query.location as string) || settings.weather_location_name || 'Zunheboto, Nagaland';
    const latitude = Number(req.query.lat) || Number(settings.weather_latitude) || 25.9667;
    const longitude = Number(req.query.lon) || Number(settings.weather_longitude) || 94.5167;
    const locationKey = (req.query.locationKey as string) || settings.weather_location_key || '';
    const apiKey = (req.query.apiKey as string) || settings.weather_api_key || process.env.WEATHER_API_KEY || '';
    const bypassCache = req.query.refresh === '1' || req.query.bypass === '1';

    const weather = await getRealWeatherData({
      provider,
      locationName,
      latitude,
      longitude,
      locationKey,
      apiKey
    }, bypassCache);

    return res.json(weather);
  } catch (error: any) {
    console.error('Weather retrieval error:', error);
    // STRICT REQUIREMENT: Never return fake or invented numbers on failure
    return res.json({
      available: false,
      error: 'Weather data currently unavailable.',
      location_name: store?.settings?.weather_location_name || 'Zunheboto, Nagaland',
      updated_at: null
    });
  }
});

// Location Search Endpoint for Admin Dashboard
app.get('/api/weather/search-location', async (req, res) => {
  try {
    const query = String(req.query.query || '').trim();
    if (!query || query.length < 2) {
      return res.json({ success: true, locations: [] });
    }

    const settings = store?.settings || {};
    const provider: WeatherProviderType = (req.query.provider as WeatherProviderType) || settings.weather_provider || 'open-meteo';
    const apiKey = (req.query.apiKey as string) || settings.weather_api_key || process.env.WEATHER_API_KEY || '';

    const locations = await searchLocations(query, provider, apiKey);
    return res.json({ success: true, locations });
  } catch (error: any) {
    console.error('Location search error:', error?.message || error);
    return res.status(400).json({ success: false, error: error?.message || 'Failed to search location' });
  }
});

// Admin Weather Configuration Endpoint
app.post('/api/admin/weather/settings', async (req, res) => {
  try {
    const {
      weather_provider,
      weather_location_name,
      weather_latitude,
      weather_longitude,
      weather_location_key,
      weather_api_key,
      weather_unit
    } = req.body;

    if (!store.settings) {
      store.settings = { ...INITIAL_SETTINGS };
    }

    if (weather_provider) store.settings.weather_provider = weather_provider;
    if (weather_location_name) store.settings.weather_location_name = weather_location_name;
    if (weather_latitude !== undefined) store.settings.weather_latitude = Number(weather_latitude);
    if (weather_longitude !== undefined) store.settings.weather_longitude = Number(weather_longitude);
    if (weather_location_key !== undefined) store.settings.weather_location_key = weather_location_key;
    if (weather_unit) store.settings.weather_unit = weather_unit;

    // Only update API key if provided explicitly (avoid wiping if left untouched)
    if (weather_api_key !== undefined && String(weather_api_key).trim().length > 0) {
      store.settings.weather_api_key = String(weather_api_key).trim();
    }

    // Synchronize to homepage sections if weather desk module exists
    if (Array.isArray(store.homepageSections)) {
      store.homepageSections = store.homepageSections.map((sec: any) => {
        if (sec.section_type === 'weather' || sec.section_key === 'weather' || sec.id === 'sec_weather') {
          return {
            ...sec,
            weather_location: store.settings.weather_location_name,
            weather_unit: store.settings.weather_unit || sec.weather_unit
          };
        }
        return sec;
      });
      await storageManager.saveKey('homepageSections', store.homepageSections);
    }

    await storageManager.saveKey('settings', store.settings);

    // Return sanitized settings back to client
    const safeSettings = { ...store.settings };
    safeSettings.weather_api_key_configured = Boolean(safeSettings.weather_api_key && String(safeSettings.weather_api_key).trim().length > 0);
    delete safeSettings.weather_api_key;

    return res.json({
      success: true,
      settings: safeSettings,
      message: 'Weather configuration saved successfully.'
    });
  } catch (error: any) {
    console.error('Failed to save weather settings:', error);
    return res.status(500).json({ success: false, error: error?.message || 'Failed to save settings' });
  }
});

// Admin Weather Live Test Endpoint
app.post('/api/admin/weather/test', async (req, res) => {
  try {
    const settings = store?.settings || {};
    const {
      provider = settings.weather_provider || 'open-meteo',
      locationName = settings.weather_location_name || 'Zunheboto, Nagaland',
      latitude = Number(settings.weather_latitude) || 25.9667,
      longitude = Number(settings.weather_longitude) || 94.5167,
      locationKey = settings.weather_location_key || '',
      apiKey = settings.weather_api_key || process.env.WEATHER_API_KEY || ''
    } = req.body;

    const weather = await getRealWeatherData({
      provider,
      locationName,
      latitude: Number(latitude),
      longitude: Number(longitude),
      locationKey,
      apiKey
    }, true); // bypass cache for testing

    if (!weather.available) {
      return res.status(400).json({
        success: false,
        error: weather.error || 'Weather provider failed to return real meteorological data.'
      });
    }

    return res.json({ success: true, weather });
  } catch (error: any) {
    return res.status(400).json({ success: false, error: error?.message || 'Weather test failed' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// XML Helper
function escapeXml(unsafe: string): string {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /install/\n\nSitemap: https://zunheboto.social/sitemap.xml\nSitemap: https://zunheboto.social/news-sitemap.xml\n`);
});

// Standard XML Sitemap
app.get('/sitemap.xml', (req, res) => {
  res.type('application/xml');
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Only published articles whose scheduled time has arrived
  const articlesXml = (store.articles || [])
    .filter((a: any) => a.status === 'published' || (a.status === 'scheduled' && new Date(a.published_at || a.scheduled_at) <= now))
    .map((a: any) => `  <url><loc>https://zunheboto.social/article/${a.slug}</loc><lastmod>${(a.updated_at || a.published_at || today).split('T')[0]}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`)
    .join('\n');

  const listingsXml = (store.listings || [])
    .filter((l: any) => l.status === 'published')
    .map((l: any) => `  <url><loc>https://zunheboto.social/listing/${l.slug}</loc><lastmod>${(l.updated_at || today).split('T')[0]}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>`)
    .join('\n');

  const categoriesXml = (store?.articleCategories || [])
    .map(
      (c: any) =>
        `  <url><loc>https://zunheboto.social/articles/category/${escapeXml(c.slug)}</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://zunheboto.social/</loc><lastmod>${today}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>
  <url><loc>https://zunheboto.social/articles</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://zunheboto.social/directory</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>
  <url><loc>https://zunheboto.social/classifieds</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>
  <url><loc>https://zunheboto.social/gallery</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://zunheboto.social/about</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://zunheboto.social/contact</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>
  <url><loc>https://zunheboto.social/privacy</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
  <url><loc>https://zunheboto.social/terms</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>0.5</priority></url>
${categoriesXml}
${articlesXml}
${listingsXml}
</urlset>`;
  res.send(xml);
});

// Dedicated Google News XML Sitemap (/news-sitemap.xml)
app.get('/news-sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml; charset=utf-8');
  const now = new Date();
  const siteName = escapeXml(store.settings?.site_name || 'Zunheboto Social');

  // Google News guidelines: recent news articles from last 48-72 hours, or top 50 recent articles
  const publishedArticles = (store.articles || [])
    .filter((a: any) => a.status === 'published' || (a.status === 'scheduled' && new Date(a.published_at || a.scheduled_at) <= now))
    .sort((a: any, b: any) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime())
    .slice(0, 50);

  const itemsXml = publishedArticles
    .map((a: any) => {
      const pubDate = new Date(a.published_at || a.created_at || now).toISOString();
      const title = escapeXml(a.title || 'News Update');
      return `  <url>
    <loc>https://zunheboto.social/article/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>${siteName}</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${itemsXml}
</urlset>`;
  res.send(xml);
});

// RSS 2.0 Syndication Feed (/feed.xml and /rss.xml)
const generateRssFeed = (categoryFilter?: string) => {
  const siteUrl = (store.settings?.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const siteTitle = escapeXml(store.settings?.site_title || 'Zunheboto Social — District News & Community Voice');
  const siteDesc = escapeXml(store.settings?.tagline || 'The heartbeat of Zunheboto town and district — independent, local & trusted.');
  const now = new Date();

  let articles = (store.articles || [])
    .filter((a: any) => a.status === 'published' || (a.status === 'scheduled' && new Date(a.published_at || a.scheduled_at) <= now));

  if (categoryFilter) {
    const cleanCat = categoryFilter.toLowerCase();
    articles = articles.filter((a: any) => 
      (a.category_slug && a.category_slug.toLowerCase() === cleanCat) ||
      (a.category_name && a.category_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === cleanCat)
    );
  }

  articles.sort((a: any, b: any) => new Date(b.published_at || 0).getTime() - new Date(a.published_at || 0).getTime());

  const itemsXml = articles.slice(0, 30).map((a: any) => {
    const title = escapeXml(a.title);
    const link = `${siteUrl}/article/${a.slug}`;
    const pubDate = new Date(a.published_at || a.created_at || now).toUTCString();
    const excerpt = escapeXml(a.excerpt || '');
    const category = escapeXml(a.category_name || 'Local News');
    const author = escapeXml(a.author_name || 'Staff Reporter');
    const imageTag = a.featured_image ? `\n      <enclosure url="${escapeXml(a.featured_image)}" type="image/jpeg" length="0" />` : '';

    return `    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate}</pubDate>
      <category>${category}</category>
      <dc:creator xmlns:dc="http://purl.org/dc/elements/1.1/">${author}</dc:creator>
      <description><![CDATA[${excerpt}]]></description>${imageTag}
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/" 
     xmlns:dc="http://purl.org/dc/elements/1.1/" 
     xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}${categoryFilter ? ` — ${categoryFilter}` : ''}</title>
    <link>${siteUrl}</link>
    <description>${siteDesc}</description>
    <language>en-US</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
};

app.get(['/feed.xml', '/rss.xml', '/feed', '/rss'], (req, res) => {
  res.set('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(generateRssFeed());
});

app.get(['/rss/:category', '/feed/:category'], (req, res) => {
  res.set('Content-Type', 'application/rss+xml; charset=utf-8');
  res.send(generateRssFeed(req.params.category));
});

// Native Banner & Sponsored Ads Endpoints
app.get('/api/ads/:id/click', async (req, res) => {
  try {
    const { id } = req.params;
    const currentStore = await storageManager.loadStore();
    const ads = currentStore.sponsoredAds || [];
    const targetAd = ads.find((a: any) => a.id === id);

    if (targetAd) {
      targetAd.clicks = (targetAd.clicks || 0) + 1;
      await storageManager.saveKey('sponsoredAds', ads);
      store.sponsoredAds = ads;
      if (targetAd.destination_url) {
        return res.redirect(targetAd.destination_url);
      }
    }
    return res.redirect('/');
  } catch (e: any) {
    return res.redirect('/');
  }
});

app.post('/api/ads/:id/impression', async (req, res) => {
  try {
    const { id } = req.params;
    const currentStore = await storageManager.loadStore();
    const ads = currentStore.sponsoredAds || [];
    const targetAd = ads.find((a: any) => a.id === id);

    if (targetAd) {
      targetAd.impressions = (targetAd.impressions || 0) + 1;
      await storageManager.saveKey('sponsoredAds', ads);
      store.sponsoredAds = ads;
    }
    return res.json({ success: true });
  } catch (e: any) {
    return res.status(500).json({ success: false });
  }
});

// Public Self-Service Classified Submission Endpoint
app.post('/api/classifieds/submit', async (req, res) => {
  try {
    const { title, category, listing_type, description, price_or_salary, location, contact_name, contact_phone, contact_whatsapp, contact_email, image_url } = req.body;

    if (!title || !category || !contact_phone) {
      return res.status(400).json({ success: false, error: 'Title, category, and contact phone are required' });
    }

    const newListing = {
      id: `class_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      title: title.trim(),
      category: category || 'jobs',
      listing_type: listing_type || 'offered',
      description: description ? description.trim() : '',
      price_or_salary: price_or_salary ? price_or_salary.trim() : '',
      location: location ? location.trim() : 'Zunheboto',
      contact_name: contact_name ? contact_name.trim() : 'Anonymous',
      contact_phone: contact_phone.trim(),
      contact_whatsapp: contact_whatsapp ? contact_whatsapp.trim() : '',
      contact_email: contact_email ? contact_email.trim() : '',
      image_url: image_url || '',
      status: 'pending', // Requires editorial moderation
      verified: false,
      featured: false,
      views: 0,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // Default 30 days
    };

    const currentStore = await storageManager.loadStore();
    const existing = currentStore.classifieds || [];
    const updated = [newListing, ...existing];
    await storageManager.saveKey('classifieds', updated);
    store.classifieds = updated;

    return res.json({ success: true, listing: newListing, message: 'Classified listing submitted successfully and queued for editorial verification.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

async function checkScheduledArticles() {
  try {
    if (!store || !store.articles) return;
    const now = new Date();
    let hasUpdates = false;
    const updatedArticles = store.articles.map((art: any) => {
      if (art.status === 'scheduled') {
        const scheduledTime = new Date(art.scheduled_at || art.published_at || 0);
        if (scheduledTime.getTime() <= now.getTime()) {
          hasUpdates = true;
          return {
            ...art,
            status: 'published',
            editorial_status: 'approved',
            published_at: art.scheduled_at || art.published_at || now.toISOString()
          };
        }
      }
      return art;
    });

    if (hasUpdates) {
      store.articles = updatedArticles;
      await storageManager.saveKey('articles', updatedArticles);
      console.log(`[Auto-Publish] Automatically transitioned scheduled articles to published at ${now.toISOString()}`);
    }
  } catch (err) {
    console.error('Error during scheduled publishing check:', err);
  }
}

async function startServer() {
  try {
    await storageManager.init();
    store = await storageManager.loadStore();
    await checkScheduledArticles();
    setInterval(checkScheduledArticles, 20000);
  } catch (err) {
    console.error('Failed to initialize storage at startup:', err);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Custom HTML transform middleware to inject SSR OpenGraph tags in development
    app.use(async (req, res, next) => {
      const isHtmlRequest =
        req.headers.accept?.includes('text/html') &&
        !req.path.startsWith('/api') &&
        !req.path.startsWith('/@') &&
        !req.path.startsWith('/src') &&
        !req.path.includes('.');

      if (isHtmlRequest) {
        try {
          const indexPath = path.join(process.cwd(), 'index.html');
          let template = fs.readFileSync(indexPath, 'utf-8');
          template = await vite.transformIndexHtml(req.originalUrl, template);
          const finalHtml = injectMetaTags(template, req.path, store);
          return res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
        } catch (e) {
          return next(e);
        }
      }
      next();
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // In production, inject meta tags for crawlers and initial load
    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          const rawHtml = fs.readFileSync(indexPath, 'utf-8');
          const finalHtml = injectMetaTags(rawHtml, req.path, store);
          return res.send(finalHtml);
        }
        res.sendFile(indexPath);
      } catch (e) {
        res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Zunheboto Social Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
