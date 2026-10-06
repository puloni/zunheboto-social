import { HomepageSectionConfig } from '../types';
import { INITIAL_HOMEPAGE_SECTIONS } from '../data/initialData';

export type PredefinedSectionType =
  | 'FEATURED_STORY'
  | 'LATEST_NEWS'
  | 'CULTURE_HERITAGE'
  | 'PICTURES'
  | 'COMMUNITY_SOCIETY'
  | 'DIRECTORY'
  | 'WEATHER'
  | 'NEWS_TIP'
  | 'EMERGENCY_HOTLINES'
  | 'MORE_STORIES';

export interface SectionMeta {
  type: PredefinedSectionType;
  label: string;
  defaultTitle: string;
  defaultSubtitle: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  badgeClass: string;
  categoryHint: string;
}

export const SECTION_TYPE_METADATA: Record<PredefinedSectionType, SectionMeta> = {
  FEATURED_STORY: {
    type: 'FEATURED_STORY',
    label: 'Hero Lead Story',
    defaultTitle: 'Featured Story',
    defaultSubtitle: 'Lead story and investigative spotlight from Zunheboto district',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-300',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    categoryHint: 'Hero Single Article'
  },
  LATEST_NEWS: {
    type: 'LATEST_NEWS',
    label: 'Breaking News Feed',
    defaultTitle: 'Latest News',
    defaultSubtitle: 'Breaking headlines and municipal reports from around the hills',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    badgeClass: 'bg-blue-100 text-blue-950 border-blue-300',
    categoryHint: '1 Lead + 2 Stacked Cards'
  },
  CULTURE_HERITAGE: {
    type: 'CULTURE_HERITAGE',
    label: 'Culture & Heritage',
    defaultTitle: 'Culture, Heritage & Environment',
    defaultSubtitle: 'Celebrating ancient Sumi traditions, folklore, indigenous ecology, and artisan craftsmanship',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-950',
    badgeBorder: 'border-amber-300',
    badgeClass: 'bg-amber-100 text-amber-950 border-amber-300',
    categoryHint: '1 Primary + 4 Sub-Grid'
  },
  PICTURES: {
    type: 'PICTURES',
    label: 'Visual Photo Gallery',
    defaultTitle: 'Zunheboto in Pictures',
    defaultSubtitle: 'Visual moments captured across town colonies, mountain ridges, and festivals',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-950',
    badgeBorder: 'border-purple-300',
    badgeClass: 'bg-purple-100 text-purple-950 border-purple-300',
    categoryHint: 'Lightbox Photo Grid'
  },
  COMMUNITY_SOCIETY: {
    type: 'COMMUNITY_SOCIETY',
    label: 'Community Carousel',
    defaultTitle: 'Community & Society',
    defaultSubtitle: 'Stories of youth excellence, church life, and collective civic action',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-950',
    badgeBorder: 'border-emerald-300',
    badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
    categoryHint: 'Interactive Slider'
  },
  DIRECTORY: {
    type: 'DIRECTORY',
    label: 'District Directory Index',
    defaultTitle: 'Zunheboto District Directory',
    defaultSubtitle: 'Verified local businesses, hospitals, guest houses, and public services',
    badgeBg: 'bg-teal-100',
    badgeText: 'text-teal-950',
    badgeBorder: 'border-teal-300',
    badgeClass: 'bg-teal-100 text-teal-950 border-teal-300',
    categoryHint: 'Verified Listings'
  },
  WEATHER: {
    type: 'WEATHER',
    label: 'Meteorological Desk',
    defaultTitle: 'Zunheboto Weather Desk',
    defaultSubtitle: 'Live altitude meteorological readings, hill forecasts, and seasonal rainfall monitoring',
    badgeBg: 'bg-sky-100',
    badgeText: 'text-sky-950',
    badgeBorder: 'border-sky-300',
    badgeClass: 'bg-sky-100 text-sky-950 border-sky-300',
    categoryHint: 'Live Altitude Forecast'
  },
  NEWS_TIP: {
    type: 'NEWS_TIP',
    label: 'Citizen News Lead Form',
    defaultTitle: 'Submit a Local News Tip',
    defaultSubtitle: 'Help report grassroots developments, colony announcements, and civic stories across Zunheboto',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-950',
    badgeBorder: 'border-orange-300',
    badgeClass: 'bg-orange-100 text-orange-950 border-orange-300',
    categoryHint: 'Citizen Tip Desk'
  },
  EMERGENCY_HOTLINES: {
    type: 'EMERGENCY_HOTLINES',
    label: 'District Emergency Hotlines',
    defaultTitle: 'District Emergency Hotlines',
    defaultSubtitle: 'Direct 24/7 emergency response numbers for Zunheboto town & surrounding blocks',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-950',
    badgeBorder: 'border-rose-300',
    badgeClass: 'bg-rose-100 text-rose-950 border-rose-300',
    categoryHint: '24/7 Response Desk'
  },
  MORE_STORIES: {
    type: 'MORE_STORIES',
    label: 'Magazine Archives Grid',
    defaultTitle: 'More Stories',
    defaultSubtitle: 'Deep dives in agriculture, ecology, sports, education, and human interest',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-950',
    badgeBorder: 'border-indigo-300',
    badgeClass: 'bg-indigo-100 text-indigo-950 border-indigo-300',
    categoryHint: 'Multi-Category Archive'
  }
};

/**
 * Robust section type resolver that accurately maps any section object
 * (whether by section_type, section_key, id, or title) to the canonical PredefinedSectionType.
 */
export function resolveSectionType(sec: any): PredefinedSectionType {
  if (!sec) return 'FEATURED_STORY';

  const typeStr = String(sec.section_type || sec.type || '').toUpperCase();
  const keyStr = String(sec.section_key || sec.key || '').toLowerCase();
  const idStr = String(sec.id || '').toLowerCase();
  const titleStr = String(sec.title || sec.custom_title || '').toLowerCase();

  // 1. Featured Story
  if (
    typeStr === 'FEATURED_STORY' ||
    typeStr === 'HERO' ||
    keyStr === 'featured_story' ||
    keyStr === 'hero' ||
    keyStr === 'hero_lead' ||
    keyStr === 'lead_stories' ||
    idStr.includes('featured') ||
    titleStr.includes('featured story') ||
    titleStr.includes('lead story')
  ) {
    return 'FEATURED_STORY';
  }

  // 2. Latest News
  if (
    typeStr === 'LATEST_NEWS' ||
    typeStr === 'LATEST_UPDATES' ||
    keyStr === 'latest_news' ||
    keyStr === 'latest_updates' ||
    idStr.includes('latest_news') ||
    idStr.includes('latest_updates') ||
    titleStr.includes('latest news') ||
    titleStr.includes('latest updates') ||
    titleStr.includes('breaking news')
  ) {
    return 'LATEST_NEWS';
  }

  // 3. Culture & Heritage
  if (
    typeStr === 'CULTURE_HERITAGE' ||
    typeStr === 'CULTURE_SPOTLIGHT' ||
    keyStr === 'culture_heritage' ||
    keyStr === 'culture_spotlight' ||
    idStr.includes('culture') ||
    idStr.includes('heritage') ||
    titleStr.includes('culture') ||
    titleStr.includes('heritage') ||
    titleStr.includes('environment') ||
    titleStr.includes('sumi traditions')
  ) {
    return 'CULTURE_HERITAGE';
  }

  // 4. Pictures
  if (
    typeStr === 'PICTURES' ||
    typeStr === 'GALLERY' ||
    typeStr === 'PHOTO_GALLERY' ||
    typeStr === 'GALLERY_STRIP' ||
    keyStr === 'zunheboto_pictures' ||
    keyStr === 'photo_gallery' ||
    keyStr === 'gallery_strip' ||
    keyStr === 'gallery' ||
    idStr.includes('picture') ||
    idStr.includes('gallery') ||
    titleStr.includes('picture') ||
    titleStr.includes('photo') ||
    titleStr.includes('visual chronicle')
  ) {
    return 'PICTURES';
  }

  // 5. Community & Society
  if (
    typeStr === 'COMMUNITY_SOCIETY' ||
    typeStr === 'COMMUNITY' ||
    keyStr === 'community_society' ||
    keyStr === 'community' ||
    idStr.includes('community') ||
    titleStr.includes('community') ||
    titleStr.includes('society')
  ) {
    return 'COMMUNITY_SOCIETY';
  }

  // 6. Directory
  if (
    typeStr === 'DIRECTORY' ||
    typeStr === 'DISTRICT_DIRECTORY' ||
    typeStr === 'DIRECTORY_HIGHLIGHTS' ||
    keyStr === 'district_directory' ||
    keyStr === 'directory_highlights' ||
    keyStr === 'directory' ||
    idStr.includes('directory') ||
    titleStr.includes('directory') ||
    titleStr.includes('listing')
  ) {
    return 'DIRECTORY';
  }

  // 7. Weather
  if (
    typeStr === 'WEATHER' ||
    typeStr === 'WEATHER_DESK' ||
    keyStr === 'weather_desk' ||
    keyStr === 'weather' ||
    idStr.includes('weather') ||
    titleStr.includes('weather') ||
    titleStr.includes('meteorological')
  ) {
    return 'WEATHER';
  }

  // 8. News Tip
  if (
    typeStr === 'NEWS_TIP' ||
    typeStr === 'NEWS_TIP_BOX' ||
    keyStr === 'news_tip' ||
    keyStr === 'news_tip_box' ||
    idStr.includes('news_tip') ||
    idStr.includes('tip') ||
    titleStr.includes('news tip') ||
    titleStr.includes('submit a local news') ||
    titleStr.includes('citizen news')
  ) {
    return 'NEWS_TIP';
  }

  // 9. Emergency Hotlines
  if (
    typeStr === 'EMERGENCY_HOTLINES' ||
    typeStr === 'HOTLINES' ||
    keyStr === 'emergency_hotlines' ||
    keyStr === 'hotlines' ||
    idStr.includes('hotline') ||
    idStr.includes('emergency') ||
    titleStr.includes('hotline') ||
    titleStr.includes('emergency') ||
    titleStr.includes('helpline')
  ) {
    return 'EMERGENCY_HOTLINES';
  }

  // 10. More Stories
  if (
    typeStr === 'MORE_STORIES' ||
    typeStr === 'GRID_ARTICLES' ||
    typeStr === 'CATEGORY_ARTICLES' ||
    keyStr === 'more_stories' ||
    keyStr === 'grid_articles' ||
    keyStr === 'category_articles' ||
    idStr.includes('more_stories') ||
    titleStr.includes('more stories') ||
    titleStr.includes('archive') ||
    titleStr.includes('deep dives')
  ) {
    return 'MORE_STORIES';
  }

  // Fallback check based on order or id
  if (idStr.includes('sec_1') || idStr.includes('sec_featured')) return 'FEATURED_STORY';
  if (idStr.includes('sec_2') || idStr.includes('sec_latest')) return 'LATEST_NEWS';
  if (idStr.includes('sec_3') || idStr.includes('sec_culture')) return 'CULTURE_HERITAGE';
  if (idStr.includes('sec_4') || idStr.includes('sec_pictures')) return 'PICTURES';
  if (idStr.includes('sec_5') || idStr.includes('sec_community')) return 'COMMUNITY_SOCIETY';
  if (idStr.includes('sec_6') || idStr.includes('sec_directory')) return 'DIRECTORY';
  if (idStr.includes('sec_7') || idStr.includes('sec_weather')) return 'WEATHER';
  if (idStr.includes('sec_8') || idStr.includes('sec_news_tip')) return 'NEWS_TIP';
  if (idStr.includes('sec_9') || idStr.includes('sec_hotlines')) return 'EMERGENCY_HOTLINES';
  if (idStr.includes('sec_10') || idStr.includes('sec_more')) return 'MORE_STORIES';

  return 'FEATURED_STORY';
}

/**
 * Normalizes boolean values from database/API, handling MySQL 0/1, string booleans, and nulls.
 */
export function normalizeBoolean(val: any, defaultVal = true): boolean {
  if (val === undefined || val === null) return defaultVal;
  if (typeof val === 'boolean') return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return Boolean(val);
}

/**
 * Maps and migrates existing/saved homepage sections from localStorage or state
 * ensuring all 10 predefined types are active and configured with their proper defaults and order.
 */
export function migrateHomepageSections(existingSections?: any[]): HomepageSectionConfig[] {
  const canonicalOrder: PredefinedSectionType[] = [
    'FEATURED_STORY',
    'LATEST_NEWS',
    'CULTURE_HERITAGE',
    'PICTURES',
    'COMMUNITY_SOCIETY',
    'DIRECTORY',
    'WEATHER',
    'NEWS_TIP',
    'EMERGENCY_HOTLINES',
    'MORE_STORIES'
  ];

  const defaultTemplates: Record<PredefinedSectionType, HomepageSectionConfig> = {
    FEATURED_STORY: { ...INITIAL_HOMEPAGE_SECTIONS[0], order: 1 },
    LATEST_NEWS: { ...INITIAL_HOMEPAGE_SECTIONS[1], order: 2 },
    CULTURE_HERITAGE: { ...INITIAL_HOMEPAGE_SECTIONS[2], order: 3 },
    PICTURES: { ...INITIAL_HOMEPAGE_SECTIONS[3], order: 4 },
    COMMUNITY_SOCIETY: { ...INITIAL_HOMEPAGE_SECTIONS[4], order: 5 },
    DIRECTORY: { ...INITIAL_HOMEPAGE_SECTIONS[5], order: 6 },
    WEATHER: { ...INITIAL_HOMEPAGE_SECTIONS[6], order: 7 },
    NEWS_TIP: { ...INITIAL_HOMEPAGE_SECTIONS[7], order: 8 },
    EMERGENCY_HOTLINES: { ...INITIAL_HOMEPAGE_SECTIONS[8], order: 9 },
    MORE_STORIES: { ...INITIAL_HOMEPAGE_SECTIONS[9], order: 10 }
  };

  if (!existingSections || !Array.isArray(existingSections) || existingSections.length === 0) {
    return canonicalOrder.map((type, idx) => ({
      ...defaultTemplates[type],
      order: idx + 1
    }));
  }

  // Map each existing section to its canonical type
  const mappedExisting = new Map<PredefinedSectionType, any>();

  existingSections.forEach((sec) => {
    const resolvedType = resolveSectionType(sec);
    if (!mappedExisting.has(resolvedType)) {
      mappedExisting.set(resolvedType, sec);
    }
  });

  // Rebuild the 10 sections preserving existing customizations
  const result: HomepageSectionConfig[] = canonicalOrder.map((type, index) => {
    const defaultSec = defaultTemplates[type];
    const existing = mappedExisting.get(type);

    if (!existing) {
      return {
        ...defaultSec,
        order: index + 1
      };
    }

    // Merge: default structure first, then existing customized properties
    return {
      ...defaultSec,
      ...existing,
      // Normalize critical identifiers so neither Homepage nor Builder falls back to generic custom
      id: defaultSec.id,
      section_key: defaultSec.section_key,
      section_type: type as any,
      order: typeof existing.order === 'number' ? existing.order : index + 1,
      enabled: normalizeBoolean(existing.enabled, true),
      title: defaultSec.title, // keep clean default title reference
      custom_title: existing.custom_title || existing.title || defaultSec.title,
      subtitle: existing.subtitle !== undefined ? existing.subtitle : defaultSec.subtitle
    };
  });

  // Sort by order
  result.sort((a, b) => (a.order || 0) - (b.order || 0));

  // Ensure consecutive order indices 1..10
  result.forEach((sec, idx) => {
    sec.order = idx + 1;
  });

  return result;
}
