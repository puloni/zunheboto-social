export type ContentStatus = 'published' | 'draft' | 'pending_review' | 'scheduled' | 'unpublished' | 'trash';
export type AdminUserRole = 'superadmin' | 'editor' | 'reporter' | 'author';

export interface SiteSettings {
  site_name: string;
  site_title: string;
  tagline: string;
  site_url: string;
  logo_url: string;
  footer_logo_url?: string;
  site_icon_url: string;
  favicon_url: string;
  primary_color?: string;
  accent_color?: string;
  header_branding_text: string;
  footer_branding_text: string;
  footer_tagline?: string;
  footer_about_text?: string;
  copyright_text: string;
  footer_copyright_year?: string;
  footer_note?: string;
  contact_email: string;
  contact_phone: string;
  contact_address: string;
  timezone: string;
  date_format: string;
  social_facebook?: string;
  social_twitter?: string;
  social_instagram?: string;
  social_youtube?: string;
  social_whatsapp?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  whatsapp_url?: string;
  default_seo_title?: string;
  default_meta_description?: string;
  default_share_image?: string;
  seo_title?: string;
  seo_description?: string;
  google_analytics_id?: string;
  custom_head_scripts?: string;
  description?: string;
  logo_height_desktop?: number;
  logo_height_mobile?: number;
  // Footer Visibility Controls
  footer_show_newsletter?: boolean;
  footer_show_hotlines?: boolean;
  footer_show_contact?: boolean;
  footer_show_social?: boolean;
  footer_show_nav?: boolean;
  footer_show_branding?: boolean;
  footer_show_copyright?: boolean;
  footer_show_legal_links?: boolean;
  footer_show_zip_download?: boolean;
  // Weather Desk Configuration
  weather_provider?: 'open-meteo' | 'accuweather' | 'openweathermap';
  weather_location_name?: string;
  weather_latitude?: number;
  weather_longitude?: number;
  weather_location_key?: string;
  weather_api_key?: string;
  weather_api_key_configured?: boolean;
  weather_unit?: 'celsius' | 'fahrenheit';
  // Photo Watermarking
  watermark_enabled?: boolean;
  watermark_text?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  display_name?: string;
  username: string;
  email: string;
  bio: string;
  avatar_url: string;
  role: AdminUserRole;
  social_twitter?: string;
  social_facebook?: string;
  social_linkedin?: string;
  social_website?: string;
  created_at: string;
  last_login: string;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  order?: number;
  article_count?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string;
  social_image?: string;
  caption?: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  category_color?: string;
  author_id?: string;
  author_name: string;
  author_avatar?: string;
  status: ContentStatus;
  published_at: string;
  scheduled_at?: string;
  editorial_status?: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'changes_requested';
  editorial_notes?: string;
  submitted_by?: string;
  submitted_at?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at?: string;
  updated_at?: string;
  views: number;
  read_time_minutes: number;
  read_time_mins?: number;
  featured_lead?: boolean;
  is_featured_story?: boolean;
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  tags: string[] | string;
}

export interface ListingCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description: string;
  listing_count?: number;
}

export interface Listing {
  id: string;
  name: string;
  slug: string;
  category_id: string;
  category_name?: string;
  category_slug?: string;
  description: string;
  featured_image: string;
  gallery_images?: string[];
  address: string;
  location_area: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email: string;
  website: string;
  whatsapp: string;
  social_links?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
  opening_hours: string;
  verified: boolean;
  featured?: boolean;
  map_url?: string;
  status: ContentStatus;
  created_at?: string;
  updated_at?: string;
  views: number;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  featured_image?: string;
  status: ContentStatus;
  seo_title?: string;
  meta_description?: string;
  canonical_url?: string;
  created_at: string;
  updated_at: string;
}

export type Page = StaticPage;

export interface MediaItem {
  id: string;
  title: string;
  caption?: string;
  alt_text?: string;
  description?: string;
  filename: string;
  file_name?: string;
  url: string;
  file_url?: string;
  file_type?: string;
  file_size: number; // in bytes
  width?: number;
  height?: number;
  created_at: string;
}

export interface GalleryPhoto {
  id: string;
  title: string;
  caption: string;
  media_id?: string;
  image_url: string;
  photographer: string;
  location: string;
  order?: number;
  created_at?: string;
}

export interface MenuItem {
  id: string;
  menu_group?: 'main' | 'footer';
  location?: 'header' | 'footer';
  label: string;
  url: string;
  type?: 'page' | 'category' | 'directory' | 'custom';
  target?: '_self' | '_blank';
  order?: number;
  order_index?: number;
}

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

export type SectionType =
  | PredefinedSectionType
  | 'hero'
  | 'latest_updates'
  | 'article_section'
  | 'directory'
  | 'gallery'
  | 'weather'
  | 'news_tip'
  | 'emergency_hotlines'
  | 'newsletter'
  | 'lead_stories'
  | 'grid_articles'
  | 'directory_highlights'
  | 'hotlines'
  | 'gallery_strip'
  | 'newsletter_banner';

export type SectionLayout = 'grid' | 'list' | 'hero_grid' | 'carousel' | 'single_hero' | 'multi_card';
export type ContentSource = 'latest' | 'category' | 'multiple_categories' | 'manual' | 'tags';

export interface HomepageSectionConfig {
  id: string;
  section_type?: SectionType;
  section_key?: string;
  title: string;
  custom_title?: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  cta_label?: string;
  cta_url?: string;
  show_button?: boolean;
  enabled: boolean;
  order: number;
  featured_article_id?: string;
  content_source?: ContentSource;
  category_id?: string;
  category_ids?: string[];
  category_slug?: string;
  category_filter?: string;
  manual_article_ids?: string[];
  tags?: string[];
  item_count?: number;
  item_limit?: number;
  count?: number;
  columns?: number;
  layout?: SectionLayout;
  layout_type?: string;
  background_style?: 'default' | 'slate' | 'dark' | 'amber' | 'light' | 'navy' | 'warm';
  sort_by?: 'newest' | 'oldest' | 'views' | 'title';

  // Hero specific
  hero_layout?: 'single_large' | 'featured_supporting' | 'multi_card';

  // Grid & List options
  columns_desktop?: number;
  columns_tablet?: number;
  list_image_position?: 'left' | 'right' | 'none';

  // Carousel options
  carousel_items_per_view?: number;
  carousel_autoplay?: boolean;
  carousel_autoplay_speed?: number;
  carousel_show_arrows?: boolean;
  carousel_show_dots?: boolean;

  // Metadata display toggles
  show_featured_image?: boolean;
  show_excerpt?: boolean;
  show_author?: boolean;
  show_date?: boolean;
  show_category?: boolean;
  show_category_badge?: boolean;
  show_views?: boolean;
  show_read_time?: boolean;

  // Directory section specific
  directory_layout?: 'grid' | 'list';
  directory_columns?: number;
  directory_show_phone?: boolean;
  directory_show_location?: boolean;
  directory_show_verified?: boolean;
  directory_show_image?: boolean;
  directory_show_hours?: boolean;
  directory_filter_category?: string;
  directory_filter_featured_only?: boolean;
  directory_filter_verified_only?: boolean;
  directory_sort?: 'featured' | 'newest' | 'alphabetical';

  // Gallery section specific
  gallery_columns?: number;
  gallery_aspect_ratio?: 'square' | 'landscape' | 'video';
  gallery_lightbox?: boolean;
  gallery_show_captions?: boolean;
  gallery_show_credits?: boolean;
  gallery_source?: 'all' | 'category';
  gallery_sort?: 'newest' | 'featured' | 'random';

  // Weather section specific
  weather_location?: string;
  weather_api_provider?: string;
  weather_show_forecast?: boolean;
  weather_show_details?: boolean;
  weather_show_current?: boolean;
  weather_days?: number;
  weather_unit?: 'celsius' | 'fahrenheit';
  weather_show_feels_like?: boolean;
  weather_show_humidity?: boolean;
  weather_show_wind?: boolean;
  weather_show_precipitation?: boolean;
  weather_show_air_quality?: boolean;
  weather_show_sunrise_sunset?: boolean;
  weather_layout?: 'dashboard' | 'card' | 'strip';

  // News Tip section specific
  news_tip_instructions?: string;
  news_tip_show_location?: boolean;
  news_tip_show_name?: boolean;
  news_tip_show_contact?: boolean;
  news_tip_show_photo?: boolean;
  news_tip_success_message?: string;
  news_tip_privacy_note?: string;

  // Emergency Hotlines section specific
  hotlines_max_count?: number;
  hotlines_category?: string;
  hotlines_sort?: 'priority' | 'alphabetical';
  hotlines_show_icons?: boolean;
  hotlines_show_phone?: boolean;
  hotlines_show_call_button?: boolean;

  // More stories specific
  more_stories_layout?: 'grid' | 'lead_grid' | 'magazine';

  // Newsletter section specific
  newsletter_show_colony?: boolean;
  newsletter_show_preferences?: boolean;
}

export interface EmergencyHotline {
  id: string;
  title: string;
  phone?: string;
  number?: string;
  description: string;
  category: 'police' | 'hospital' | 'fire' | 'disaster' | 'helpline' | 'admin' | string;
  order?: number;
  enabled?: boolean;
  available?: string;
  icon?: string;
}

export interface NewsTip {
  id: string;
  sender_name: string;
  sender_contact: string;
  message: string;
  location: string;
  photo_url?: string;
  created_at: string;
  status: 'unread' | 'reviewed' | 'archived' | 'in_review' | 'published';
}

export interface WeatherData {
  available?: boolean;
  error?: string;
  city?: string;
  district?: string;
  state?: string;
  location?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
  provider?: string;
  provider_name?: string;
  temperature_c: number;
  condition: string;
  icon?: string;
  humidity: number;
  wind_kmh: number;
  high_c: number;
  low_c: number;
  precipitation_chance: number;
  air_quality?: string;
  pressure_hpa?: number;
  uv_index?: number;
  sunrise?: string;
  sunset?: string;
  source?: string;
  updated_at: string;
  forecast: Array<{
    day: string;
    condition: string;
    high_c: number;
    low_c: number;
    icon?: string;
    rain_chance?: number;
    date?: string;
  }>;
}

export interface DatabaseInstallConfig {
  is_installed: boolean;
  installed_at: string;
  db_host: string;
  db_name: string;
  db_user: string;
  db_prefix: string;
  site_url: string;
  admin_username: string;
}

export interface NewsletterPreferences {
  breaking_news: boolean;
  weekly_digest: boolean;
  culture_heritage: boolean;
  local_directory: boolean;
  emergency_alerts: boolean;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  colony?: string;
  subscribed_at: string;
  status: 'active' | 'unsubscribed';
  source: string;
  preferences: NewsletterPreferences;
}

// Local Classifieds & Jobs
export type ClassifiedCategory =
  | 'jobs'
  | 'rentals'
  | 'vehicles'
  | 'marketplace'
  | 'documents'
  | 'services';

export interface ClassifiedListing {
  id: string;
  title: string;
  category: ClassifiedCategory;
  listing_type: 'offered' | 'wanted';
  description: string;
  price_or_salary?: string;
  location: string;
  contact_name: string;
  contact_phone: string;
  contact_whatsapp?: string;
  contact_email?: string;
  image_url?: string;
  status: 'active' | 'pending' | 'expired' | 'rejected';
  verified?: boolean;
  featured?: boolean;
  views?: number;
  created_at: string;
  expires_at?: string;
}

// Sponsored Content & Native Banners
export type AdPlacement = 'leaderboard_top' | 'sidebar_rect' | 'article_mid' | 'footer_banner';

export interface SponsoredCampaign {
  id: string;
  title: string;
  sponsor_name: string;
  placement: AdPlacement;
  image_url: string;
  destination_url: string;
  badge_text?: string;
  start_date: string;
  end_date: string;
  active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
}

