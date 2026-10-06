import { SiteSettings, Article, AdminUser, Listing } from '../types';

export interface SeoOptions {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  image?: string;
  type?: 'website' | 'article' | 'profile' | 'place' | 'business' | 'business.business';
  publishedTime?: string;
  modifiedTime?: string;
  authorName?: string;
  author?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

/**
 * Sets or creates a meta tag in document.head
 */
function setMetaTag(attributeName: 'name' | 'property', attributeValue: string, content: string | undefined | null) {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  
  if (!content) {
    if (element) {
      element.remove();
    }
    return;
  }

  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

/**
 * Sets or updates the canonical link tag in document.head
 */
function setCanonicalTag(url: string | undefined | null) {
  if (typeof document === 'undefined') return;

  let element = document.head.querySelector('link[rel="canonical"]');
  if (!url) {
    if (element) element.remove();
    return;
  }

  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', url);
}

/**
 * Sets or updates the favicon and apple-touch-icon links in document.head
 * Removes stale or conflicting link elements to prevent browser caching issues.
 */
export function updateFavicon(faviconUrl?: string, forceBustCache = false) {
  if (typeof document === 'undefined') return;

  const rawUrl = (faviconUrl && faviconUrl.trim()) ? faviconUrl.trim() : '/favicon.svg';

  // Remove existing static or dynamic icon links to ensure clean replacement
  const oldIcons = document.head.querySelectorAll(
    'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]'
  );
  oldIcons.forEach((el) => el.remove());

  // Determine MIME type
  let mimeType = 'image/svg+xml';
  const cleanUrl = rawUrl.split('?')[0].toLowerCase();
  if (cleanUrl.endsWith('.png')) {
    mimeType = 'image/png';
  } else if (cleanUrl.endsWith('.ico')) {
    mimeType = 'image/x-icon';
  } else if (cleanUrl.endsWith('.jpg') || cleanUrl.endsWith('.jpeg')) {
    mimeType = 'image/jpeg';
  } else if (cleanUrl.endsWith('.webp')) {
    mimeType = 'image/webp';
  } else if (cleanUrl.endsWith('.svg')) {
    mimeType = 'image/svg+xml';
  }

  // Construct href with optional cache busting
  const finalHref = forceBustCache
    ? `${rawUrl}${rawUrl.includes('?') ? '&' : '?'}v=${Date.now()}`
    : rawUrl;

  // Create fresh <link rel="icon">
  const iconLink = document.createElement('link');
  iconLink.setAttribute('rel', 'icon');
  iconLink.setAttribute('id', 'zs-dynamic-favicon');
  iconLink.setAttribute('type', mimeType);
  iconLink.setAttribute('href', finalHref);
  document.head.appendChild(iconLink);

  // Also update or create <link rel="apple-touch-icon">
  const touchLink = document.createElement('link');
  touchLink.setAttribute('rel', 'apple-touch-icon');
  touchLink.setAttribute('id', 'zs-dynamic-apple-icon');
  touchLink.setAttribute('href', finalHref);
  document.head.appendChild(touchLink);
}

/**
 * Injects or replaces the application/ld+json script tag for structured data
 */
function setJsonLd(schema?: Record<string, any> | Array<Record<string, any>>) {
  if (typeof document === 'undefined') return;

  const SCRIPT_ID = 'zs-dynamic-jsonld';
  let script = document.getElementById(SCRIPT_ID);

  if (!schema) {
    if (script) script.remove();
    return;
  }

  if (!script) {
    script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.setAttribute('type', 'application/ld+json');
    document.head.appendChild(script);
  }

  script.textContent = JSON.stringify(schema, null, 2);
}

/**
 * Central function to update all dynamic SEO metadata, Open Graph, Twitter Cards,
 * canonical link, and JSON-LD schema on route change.
 */
export function updateDocumentSeo(options: SeoOptions, settings: SiteSettings) {
  if (typeof document === 'undefined') return;

  const baseSiteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const siteTitle = settings.site_name || 'Zunheboto Social';

  // 1. Document Title
  const finalTitle = options.title || settings.default_seo_title || `${siteTitle} | ${settings.tagline}`;
  document.title = finalTitle;

  // 2. Meta Description
  const finalDescription =
    options.description ||
    settings.default_meta_description ||
    settings.tagline ||
    'Zunheboto Social is an independent community publication and verified district directory in Nagaland.';
  setMetaTag('name', 'description', finalDescription);

  // 3. Canonical URL
  const currentPath = window.location.pathname + (window.location.search || '');
  const finalCanonical = options.canonicalUrl || `${baseSiteUrl}${currentPath === '/' ? '' : currentPath}`;
  setCanonicalTag(finalCanonical);

  // 4. Social Sharing Image
  const finalImage =
    options.image ||
    settings.default_share_image ||
    settings.logo_url ||
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80';

  // 5. Open Graph Meta Tags
  setMetaTag('property', 'og:site_name', siteTitle);
  setMetaTag('property', 'og:title', finalTitle);
  setMetaTag('property', 'og:description', finalDescription);
  setMetaTag('property', 'og:url', finalCanonical);
  setMetaTag('property', 'og:image', finalImage);
  setMetaTag('property', 'og:type', options.type || 'website');

  if (options.publishedTime) {
    setMetaTag('property', 'article:published_time', options.publishedTime);
  } else {
    setMetaTag('property', 'article:published_time', null);
  }

  if (options.modifiedTime) {
    setMetaTag('property', 'article:modified_time', options.modifiedTime);
  } else {
    setMetaTag('property', 'article:modified_time', null);
  }

  const authorVal = options.author || options.authorName;
  if (authorVal) {
    setMetaTag('property', 'article:author', authorVal);
  } else {
    setMetaTag('property', 'article:author', null);
  }

  if (options.section) {
    setMetaTag('property', 'article:section', options.section);
  } else {
    setMetaTag('property', 'article:section', null);
  }

  if (options.noindex) {
    setMetaTag('name', 'robots', 'noindex, nofollow');
  } else {
    setMetaTag('name', 'robots', 'index, follow');
  }

  if (options.tags && options.tags.length > 0) {
    setMetaTag('property', 'article:tag', options.tags.join(', '));
  } else {
    setMetaTag('property', 'article:tag', null);
  }

  // 6. Twitter Card Meta Tags
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', finalTitle);
  setMetaTag('name', 'twitter:description', finalDescription);
  setMetaTag('name', 'twitter:image', finalImage);

  // 7. Structured Data JSON-LD
  if (options.jsonLd) {
    setJsonLd(options.jsonLd);
  } else {
    setJsonLd(buildWebsiteSchema(settings));
  }

  // 8. Favicon
  updateFavicon(settings.favicon_url || settings.site_icon_url);
}

/**
 * Build Schema.org WebSite & Organization structured data
 */
export function buildWebsiteSchema(settings: SiteSettings) {
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: settings.site_name || 'Zunheboto Social',
        description: settings.tagline,
        publisher: {
          '@id': `${siteUrl}/#organization`
        },
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${siteUrl}/search?q={search_term_string}`
          },
          'query-input': 'required name=search_term_string'
        },
        inLanguage: 'en-IN'
      },
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: settings.site_name || 'Zunheboto Social',
        url: siteUrl,
        logo: {
          '@type': 'ImageObject',
          url: settings.logo_url || `${siteUrl}/favicon.svg`
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: settings.contact_phone || '+91 3867 220 102',
          contactType: 'editorial desk',
          areaServed: 'IN',
          availableLanguage: ['English', 'Sumi']
        }
      }
    ]
  };
}

/**
 * Build Schema.org NewsArticle structured data
 */
export function buildArticleSchema(article: Article, settings: SiteSettings) {
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const articleUrl = article.canonical_url || `${siteUrl}/article/${article.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl
    },
    headline: article.seo_title || article.title,
    description: article.meta_description || article.excerpt,
    image: [
      article.social_image ||
      article.featured_image ||
      settings.default_share_image ||
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'
    ],
    datePublished: article.published_at || article.created_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Person',
      name: article.author_name || 'Zunheboto Social Editorial Staff',
      url: `${siteUrl}/author/${article.author_name ? encodeURIComponent(article.author_name.toLowerCase().replace(/\s+/g, '-')) : 'editor'}`
    },
    publisher: {
      '@type': 'Organization',
      name: settings.site_name || 'Zunheboto Social',
      logo: {
        '@type': 'ImageObject',
        url: settings.logo_url || `${siteUrl}/favicon.svg`
      }
    },
    articleSection: article.category_name || 'District News'
  };
}

/**
 * Build Schema.org Person structured data for Author profile page
 */
export function buildAuthorSchema(author: AdminUser, settings: SiteSettings) {
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const authorSlug = encodeURIComponent((author.display_name || author.name || author.username).toLowerCase().replace(/\s+/g, '-'));
  const authorUrl = `${siteUrl}/author/${authorSlug}`;

  const sameAs: string[] = [];
  if (author.social_twitter) sameAs.push(author.social_twitter);
  if (author.social_facebook) sameAs.push(author.social_facebook);
  if (author.social_linkedin) sameAs.push(author.social_linkedin);
  if (author.social_website) sameAs.push(author.social_website);

  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.display_name || author.name,
    url: authorUrl,
    image: author.avatar_url,
    jobTitle: author.role === 'superadmin' ? 'Editor-in-Chief' : 'Staff Journalist',
    worksFor: {
      '@type': 'Organization',
      name: settings.site_name || 'Zunheboto Social',
      url: siteUrl
    },
    description: author.bio,
    ...(sameAs.length > 0 ? { sameAs } : {})
  };
}

/**
 * Build Schema.org LocalBusiness / Place structured data for directory listings
 */
export function buildListingSchema(listing: Listing, settings: SiteSettings) {
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const listingUrl = `${siteUrl}/listing/${listing.slug}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: listing.name,
    description: listing.description,
    image: listing.featured_image,
    url: listingUrl,
    telephone: listing.phone,
    email: listing.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: listing.address,
      addressLocality: 'Zunheboto',
      addressRegion: 'Nagaland',
      postalCode: '798620',
      addressCountry: 'IN'
    },
    ...(listing.latitude && listing.longitude
      ? {
          geo: {
            '@type': 'GeoCoordinates',
            latitude: listing.latitude,
            longitude: listing.longitude
          }
        }
      : {})
  };
}

export const buildDirectorySchema = buildListingSchema;

/**
 * Build BreadcrumbList schema
 */
export function buildBreadcrumbSchema(items: Array<{ name: string; url: string }>, settings: SiteSettings) {
  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url}`
    }))
  };
}
