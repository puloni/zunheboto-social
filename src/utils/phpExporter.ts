import JSZip from 'jszip';
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
} from '../types';
import { generateCompleteSchemaSql } from './exporter/sqlGenerator';
import { generateFrontendTemplates } from './exporter/templatesGenerator';
import { generateAdminTemplates } from './exporter/adminGenerator';
import { generateAssetsAndCore } from './exporter/assetsGenerator';

export async function generatePhpZipPackage(
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
): Promise<Blob> {
  const zip = new JSZip();

  // 1. Generate schema.sql with all tables and data
  const schemaSql = generateCompleteSchemaSql(
    settings,
    articles,
    listings,
    pages,
    hotlines,
    articleCategories,
    listingCategories,
    menuItems,
    galleryPhotos,
    homepageSections,
    adminUser,
    newsTips,
    mediaItems
  );
  zip.file('schema.sql', schemaSql);

  // 2. Core files & assets
  const coreFiles = generateAssetsAndCore();
  for (const [path, content] of Object.entries(coreFiles)) {
    zip.file(path, content);
  }

  // 3. Public Frontend Templates (/templates/*.php)
  const templateFiles = generateFrontendTemplates();
  for (const [path, content] of Object.entries(templateFiles)) {
    zip.file(path, content);
  }

  // 4. Admin Management CMS (/admin/*.php, /admin/css, /admin/js)
  const adminFiles = generateAdminTemplates();
  for (const [path, content] of Object.entries(adminFiles)) {
    zip.file(path, content);
  }

  // 5. uploads placeholder and sample directory
  zip.file('uploads/index.html', '<!DOCTYPE html><html><head><title>403 Forbidden</title></head><body><h1>Directory access is forbidden.</h1></body></html>');

  // Generate final production zip archive
  return await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9
    }
  });
}

