import React, { useState, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import {
  Clock,
  Eye,
  MapPin,
  Phone,
  ArrowRight,
  ShieldCheck,
  Camera,
  Flame,
  Calendar,
  Building,
  Sparkles,
  BookOpen,
  Send,
  CloudSun,
  ShieldAlert,
  FolderOpen,
  Newspaper,
  Share2,
  Navigation
} from 'lucide-react';
import { WeatherWidget } from '../components/WeatherWidget';
import { EmergencyHotlinesSection } from '../components/EmergencyHotlinesSection';
import { NewsTipSection } from '../components/NewsTipSection';
import { LightboxModal } from '../components/LightboxModal';
import { NewsletterSubscribe } from '../components/NewsletterSubscribe';
import { CommunityCarousel } from '../components/CommunityCarousel';
import { Article, HomepageSectionConfig } from '../types';
import { resolveSectionType } from '../utils/sectionTypes';
import { updateDocumentSeo, buildWebsiteSchema } from '../utils/seo';
import { AdPlacement } from '../components/AdPlacement';

export const HomePage: React.FC = () => {
  const {
    articles,
    listings,
    galleryPhotos,
    homepageSections,
    classifieds,
    navigateTo,
    settings
  } = useCms();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState(0);

  // Dynamic Homepage SEO & JSON-LD
  useEffect(() => {
    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
    updateDocumentSeo(
      {
        title: settings.site_title || `${settings.site_name} | Local News, Community Voice & District Directory`,
        description:
          settings.seo_description ||
          settings.tagline ||
          'The independent digital publication and verified district directory for Zunheboto, Nagaland.',
        canonicalUrl: `${siteUrl}/`,
        type: 'website',
        jsonLd: buildWebsiteSchema(settings)
      },
      settings
    );
  }, [settings]);

  // All published articles sorted by date descending
  const now = new Date();
  const publishedArticles = [...articles]
    .filter((a) => a.status === 'published' || (a.status === 'scheduled' && new Date(a.published_at || a.scheduled_at || 0) <= now))
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());

  // Active listings
  const publishedListings = [...listings]
    .filter((l) => l.status === 'published')
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  // Enabled homepage sections sorted by order
  const activeSections = [...homepageSections]
    .filter((s) => s.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const openLightbox = (index: number) => {
    setSelectedPhotoIdx(index);
    setLightboxOpen(true);
  };

  // Helper to filter articles for a section
  const getSectionArticles = (sec: HomepageSectionConfig, defaultCategory?: string): Article[] => {
    const targetCat = sec.category_slug || sec.category_filter || sec.category_id || defaultCategory;
    let list = publishedArticles;

    if (sec.category_ids && sec.category_ids.length > 0) {
      list = list.filter((a) => sec.category_ids?.includes(a.category_id) || sec.category_ids?.includes(a.category_slug));
    } else if (targetCat && targetCat !== 'all' && targetCat !== '') {
      list = list.filter((a) =>
        a.category_slug?.toLowerCase() === targetCat.toLowerCase() ||
        a.category_name?.toLowerCase().includes(targetCat.toLowerCase()) ||
        a.category_id === targetCat
      );
    }

    // If category filter returned nothing, fall back to published articles
    if (list.length === 0 && publishedArticles.length > 0) {
      list = publishedArticles;
    }

    const limit = sec.item_limit || sec.count || 6;
    return list.slice(0, limit);
  };

  // Helper for background container classes
  const getBgClass = (bgStyle?: string) => {
    switch (bgStyle) {
      case 'slate':
      case 'light':
        return 'bg-slate-50 border-y border-slate-200/80 py-10';
      case 'dark':
      case 'navy':
        return 'bg-[#0B192C] text-white border-y-4 border-amber-600 py-12';
      case 'amber':
      case 'warm':
        return 'bg-amber-50/70 border-y border-amber-200/60 py-10';
      default:
        return 'py-2';
    }
  };

  return (
    <div className="space-y-12 sm:space-y-16 py-6 font-sans">
      {/* Top Native Sponsored Ad Banner */}
      <div className="max-w-7xl mx-auto px-4 -mb-4">
        <AdPlacement placement="home_top" />
      </div>

      {activeSections.map((sec) => {
        const bgClass = getBgClass(sec.background_style);
        const title = sec.custom_title || sec.title;
        const subtitle = sec.subtitle || sec.description;
        const isDarkBg = sec.background_style === 'dark' || sec.background_style === 'navy';
        const sectionType = resolveSectionType(sec);

        switch (sectionType) {
          // ====================================================
          // 1. FEATURED STORY (Hero Single Article)
          // ====================================================
          case 'FEATURED_STORY': {
            const featuredArticle =
              (sec.featured_article_id && publishedArticles.find((a) => a.id === sec.featured_article_id)) ||
              publishedArticles.find((a) => a.is_featured_story || a.featured_lead) ||
              publishedArticles[0];

            if (!featuredArticle) {
              return (
                <section key={sec.id} className="max-w-7xl mx-auto px-4">
                  <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-500">
                    <p className="font-semibold text-slate-800">No Featured Story Assigned</p>
                    <p className="text-xs mt-1">Publish an article and assign it in the Homepage Builder.</p>
                  </div>
                </section>
              );
            }

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all group">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
                    {/* Featured Image */}
                    <div className="lg:col-span-7 relative aspect-[16/10] lg:aspect-auto overflow-hidden bg-slate-950 min-h-[320px] lg:min-h-[460px]">
                      <img
                        src={featuredArticle.featured_image}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 opacity-95 group-hover:opacity-100"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent lg:hidden pointer-events-none"></div>
                    </div>

                    {/* Featured Story Editorial Content */}
                    <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between bg-white border-t lg:border-t-0 lg:border-l border-slate-200/80">
                      <div>
                        {/* Kicker Row: Zero-Pill Unboxed Metadata */}
                        <div className="flex items-center gap-2 text-[11px] font-sans font-bold uppercase tracking-[0.2em] text-amber-700 mb-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          <span>{featuredArticle.category_name || 'Front Page'}</span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-slate-400 font-semibold tracking-wider">Lead Chronicle</span>
                        </div>

                        {/* Stately Serif Headline */}
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black text-[#0B192C] leading-[1.2] hover:text-amber-800 transition-colors cursor-pointer mb-4">
                          <a href={`/article/${featuredArticle.slug}`}>
                            {featuredArticle.title}
                          </a>
                        </h1>

                        {/* Excerpt */}
                        {sec.show_excerpt !== false && (
                          <p className="text-sm sm:text-base text-slate-600 font-serif leading-relaxed line-clamp-4 mb-6">
                            {featuredArticle.excerpt}
                          </p>
                        )}

                        {/* Author & Publication Byline */}
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-sans pt-2 border-t border-slate-100">
                          {sec.show_author !== false && (
                            <span className="font-semibold text-slate-800">
                              By {featuredArticle.author_name}
                            </span>
                          )}
                          {sec.show_author !== false && sec.show_date !== false && (
                            <span className="text-slate-300">&bull;</span>
                          )}
                          {sec.show_date !== false && (
                            <span>
                              {new Date(featuredArticle.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          <span className="text-slate-300">&bull;</span>
                          <span>{featuredArticle.read_time_mins || 3} min read</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-6">
                        <a
                          href={`/article/${featuredArticle.slug}`}
                          className="px-6 py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 group/btn transition-all shadow-xs cursor-pointer inline-flex"
                        >
                          <span>{sec.cta_label || 'Read Chronicle'}</span>
                          <ArrowRight className="w-4 h-4 text-amber-400 group-hover/btn:translate-x-1 transition-transform" />
                        </a>

                        {sec.show_views !== false && (
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                            <span>{(featuredArticle.views || 0).toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          }

          // ====================================================
          // 2. LATEST NEWS (1 Large Left + 2 Stacked Right)
          // ====================================================
          case 'LATEST_NEWS': {
            const newsArticles = getSectionArticles(sec, 'local-news').slice(0, 3);
            const leadNews = newsArticles[0];
            const secondaryNews = newsArticles.slice(1, 3);

            if (!leadNews) {
              return null;
            }

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 pb-3 border-b-2 border-[#0B192C]">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                      {title}
                    </h2>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                  <a
                    href={sec.cta_url || '/articles/category/local-news'}
                    className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sec.cta_label || 'View All News'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* 1 Large Left + 2 Stacked Right Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Leading News Card (Col-span 7) */}
                  <a
                    href={`/article/${leadNews.slug}`}
                    className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer block"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={leadNews.featured_image}
                          alt={leadNews.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6 sm:p-7">
                        {sec.show_category_badge !== false && (
                          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-2">
                            {leadNews.category_name}
                          </div>
                        )}

                        <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#0B192C] group-hover:text-amber-800 transition-colors leading-snug mb-3">
                          {leadNews.title}
                        </h3>

                        {sec.show_excerpt !== false && (
                          <p className="text-sm text-slate-600 font-serif leading-relaxed line-clamp-3 mb-4">
                            {leadNews.excerpt}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          {sec.show_author !== false && (
                            <span className="font-semibold text-slate-800">By {leadNews.author_name}</span>
                          )}
                          {sec.show_author !== false && sec.show_date !== false && <span className="text-slate-300">&bull;</span>}
                          {sec.show_date !== false && (
                            <span>
                              {new Date(leadNews.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          <span className="text-slate-300">&bull;</span>
                          <span>{leadNews.read_time_mins} min read</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Read Story &rarr;
                      </span>
                      {sec.show_views !== false && (
                        <span className="text-slate-400 font-mono flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" /> {(leadNews.views || 0).toLocaleString()} views
                        </span>
                      )}
                    </div>
                  </a>

                  {/* 2 Stacked News Cards (Col-span 5) */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-6">
                    {secondaryNews.map((art) => (
                      <a
                        key={art.id}
                        href={`/article/${art.slug}`}
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col sm:flex-row gap-5 flex-1 block"
                      >
                        <div className="w-full sm:w-36 aspect-[16/10] sm:aspect-square rounded-xl overflow-hidden bg-slate-100 shrink-0">
                          <img
                            src={art.featured_image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            {sec.show_category_badge !== false && (
                              <span
                                style={{ color: art.category_color || '#0284C7' }}
                                className="text-[11px] font-bold uppercase tracking-wider"
                              >
                                {art.category_name}
                              </span>
                            )}
                            <h4 className="text-base font-serif font-bold text-[#0B192C] group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug mt-1">
                              {art.title}
                            </h4>
                            {sec.show_excerpt !== false && (
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1.5 leading-relaxed">
                                {art.excerpt}
                              </p>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-400 mt-3 flex items-center gap-2 pt-2 border-t border-slate-100">
                            {sec.show_date !== false && (
                              <span>
                                {new Date(art.published_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            )}
                            <span>•</span>
                            <span>{art.read_time_mins} min</span>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // ====================================================
          // 3. CULTURE, HERITAGE & ENVIRONMENT (1 Primary + 4 Sub-Cards)
          // ====================================================
          case 'CULTURE_HERITAGE': {
            const cultureArticles = getSectionArticles(sec, 'culture-heritage').slice(0, 5);
            const mainCulture = cultureArticles[0];
            const subCulture = cultureArticles.slice(1, 5);

            if (!mainCulture) return null;

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 pb-3 border-b-2 border-[#0B192C]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                      <BookOpen className="w-4 h-4" /> Sumi Heritage &amp; Traditions
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                      {title}
                    </h2>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                  <a
                    href={sec.cta_url || '/articles/category/culture-heritage'}
                    className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sec.cta_label || 'View All Cultural Stories'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Primary Culture Post (Col-span 6) */}
                  <a
                    href={`/article/${mainCulture.slug}`}
                    className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer block"
                  >
                    <div>
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                        <img
                          src={mainCulture.featured_image}
                          alt={mainCulture.title}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                        />
                      </div>

                      <div className="p-6">
                        <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 mb-1.5">
                          {mainCulture.category_name}
                        </div>

                        <h3 className="text-xl font-serif font-bold text-[#0B192C] group-hover:text-amber-800 transition-colors leading-snug mb-3">
                          {mainCulture.title}
                        </h3>

                        <p className="text-sm text-slate-600 font-serif leading-relaxed line-clamp-3 mb-4">
                          {mainCulture.excerpt}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span>
                            {new Date(mainCulture.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span>{mainCulture.read_time_mins} min read</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 pt-0 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                        Read Story &rarr;
                      </span>
                      {sec.show_author !== false && (
                        <span className="font-semibold text-slate-700">By {mainCulture.author_name}</span>
                      )}
                    </div>
                  </a>

                  {/* 4 Compact Culture Posts Grid (Col-span 6) */}
                  <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {subCulture.map((art) => (
                      <a
                        key={art.id}
                        href={`/article/${art.slug}`}
                        className="bg-white border border-slate-200 rounded-2xl p-4 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between block"
                      >
                        <div>
                          <div className="aspect-[16/10] rounded-xl overflow-hidden bg-slate-100 mb-3">
                            <img
                              src={art.featured_image}
                              alt={art.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <span
                            style={{ color: art.category_color || '#d97706' }}
                            className="text-[10px] font-bold uppercase tracking-wider block mb-1"
                          >
                            {art.category_name}
                          </span>
                          <h4 className="text-sm font-serif font-bold text-[#0B192C] group-hover:text-amber-700 transition-colors line-clamp-2 leading-snug">
                            {art.title}
                          </h4>
                        </div>

                        <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <span>
                            {new Date(art.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                          <span className="font-semibold text-amber-700">Read →</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // ====================================================
          // 4. ZUNHEBOTO IN PICTURES (Visual Photo Chronicle)
          // ====================================================
          case 'PICTURES': {
            const count = sec.item_limit || 8;
            const photos = galleryPhotos.slice(0, count);
            const cols = sec.columns || sec.gallery_columns || 4;
            const gridColsClass =
              cols === 5
                ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5'
                : cols === 3
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                : cols === 2
                ? 'grid-cols-1 sm:grid-cols-2'
                : 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';

            const aspectClass =
              sec.gallery_aspect_ratio === 'landscape'
                ? 'aspect-[16/10]'
                : sec.gallery_aspect_ratio === 'video'
                ? 'aspect-video'
                : 'aspect-square';

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 pb-3 border-b-2 border-[#0B192C]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                      <Camera className="w-4 h-4" /> Visual Chronicle &amp; Photography
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                      {title}
                    </h2>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                  <a
                    href={sec.cta_url || '/gallery'}
                    className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sec.cta_label || 'Open Full Photo Gallery'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className={`grid ${gridColsClass} gap-4`}>
                  {photos.map((photo, index) => (
                    <a
                      key={photo.id}
                      href={photo.image_url}
                      onClick={(e) => {
                        if (sec.gallery_lightbox !== false) {
                          e.preventDefault();
                          openLightbox(index);
                        }
                      }}
                      className={`group relative ${aspectClass} rounded-2xl overflow-hidden cursor-pointer bg-slate-100 border border-slate-200 shadow-2xs block`}
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.title}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                      {sec.gallery_show_captions !== false && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-end text-white">
                          <span className="text-xs font-bold font-serif leading-tight">
                            {photo.title}
                          </span>
                          {photo.location && (
                            <span className="text-[10px] text-amber-300 flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {photo.location}
                            </span>
                          )}
                          {sec.gallery_show_credits !== false && photo.photographer && (
                            <span className="text-[9px] text-slate-300 mt-0.5">
                              Photo: {photo.photographer}
                            </span>
                          )}
                        </div>
                      )}
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          // ====================================================
          // 5. COMMUNITY & SOCIETY (Interactive Carousel)
          // ====================================================
          case 'COMMUNITY_SOCIETY': {
            const communityArticles = getSectionArticles(sec, 'community-society').slice(0, 6);

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-3 border-b-2 border-[#0B192C]">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                      {title}
                    </h2>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                  <a
                    href={sec.cta_url || '/articles/category/community-society'}
                    className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sec.cta_label || 'View All Community Stories'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <CommunityCarousel
                  articles={communityArticles}
                  section={sec}
                  onNavigate={navigateTo}
                  isDarkBg={isDarkBg}
                />
              </section>
            );
          }

          // ====================================================
          // 6. ZUNHEBOTO DISTRICT DIRECTORY (Verified Listings)
          // ====================================================
          case 'DIRECTORY': {
            let filteredListings = publishedListings;

            if (sec.directory_filter_category && sec.directory_filter_category !== 'all') {
              filteredListings = filteredListings.filter(
                (l) => l.category_id === sec.directory_filter_category
              );
            }

            if (sec.directory_filter_verified_only) {
              filteredListings = filteredListings.filter((l) => l.verified);
            }

            if (sec.directory_filter_featured_only) {
              filteredListings = filteredListings.filter((l) => l.featured);
            }

            const count = sec.item_limit || 6;
            const displayedListings = filteredListings.slice(0, count);

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
                        <Building className="w-4 h-4" /> District Commercial &amp; Public Index
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                        {title}
                      </h2>
                      {subtitle && <p className="text-xs sm:text-sm text-slate-600 mt-1">{subtitle}</p>}
                    </div>
                    <a
                      href={sec.cta_url || '/directory'}
                      className="px-5 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors self-start sm:self-auto flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <span>{sec.cta_label || 'Explore District Directory'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedListings.map((listing) => (
                      <div
                        key={listing.id}
                        className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start gap-4 mb-3">
                            {sec.directory_show_image !== false && (
                              <a
                                href={`/listing/${listing.slug}`}
                                className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 block"
                              >
                                <img
                                  src={listing.featured_image}
                                  alt={listing.name}
                                  className="w-full h-full object-cover"
                                />
                              </a>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                                  {listing.category_name}
                                </span>
                                {sec.directory_show_verified !== false && listing.verified && (
                                  <ShieldCheck
                                    className="w-4 h-4 text-emerald-600 shrink-0"
                                    title="Verified by District Desk"
                                  />
                                )}
                              </div>
                              <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                                <a
                                  href={`/listing/${listing.slug}`}
                                  className="hover:text-amber-700 transition-colors"
                                >
                                  {listing.name}
                                </a>
                              </h3>
                              {sec.directory_show_location !== false && (
                                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span>{listing.location_area}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                            {listing.description}
                          </p>
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {sec.directory_show_phone !== false && listing.phone && listing.phone.trim() !== '' && (
                              <a
                                href={`tel:${listing.phone.replace(/\s+/g, '')}`}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                              >
                                <Phone className="w-3.5 h-3.5 text-amber-600" />
                                <span>Call Now</span>
                              </a>
                            )}
                            {listing.map_url && (
                              <a
                                href={listing.map_url}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors"
                                title="Get directions"
                              >
                                <Navigation className="w-3 h-3 text-amber-700" />
                                <span>Directions</span>
                              </a>
                            )}
                          </div>
                          <a
                            href={`/listing/${listing.slug}`}
                            className="text-xs font-bold text-[#0B192C] hover:text-amber-600 transition-colors cursor-pointer ml-auto"
                          >
                            View Details →
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            );
          }

          // ====================================================
          // 7. ZUNHEBOTO WEATHER DESK
          // ====================================================
          case 'WEATHER':
            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <WeatherWidget config={sec} />
              </section>
            );

          // ====================================================
          // 8. SUBMIT A LOCAL NEWS TIP
          // ====================================================
          case 'NEWS_TIP':
            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <NewsTipSection config={sec} />
              </section>
            );

          // ====================================================
          // 9. DISTRICT EMERGENCY HOTLINES
          // ====================================================
          case 'EMERGENCY_HOTLINES':
            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <EmergencyHotlinesSection config={sec} />
              </section>
            );

          // ====================================================
          // 10. MORE STORIES / CATEGORY ARCHIVES
          // ====================================================
          case 'MORE_STORIES': {
            const moreArticles = getSectionArticles(sec).slice(0, sec.item_limit || 6);

            return (
              <section
                key={sec.id}
                id={`section-${sec.section_key}`}
                className={`max-w-7xl mx-auto px-4 ${bgClass}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8 pb-3 border-b-2 border-[#0B192C]">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                      {title}
                    </h2>
                    {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
                  </div>
                  <a
                    href={sec.cta_url || '/articles'}
                    className="text-xs font-bold uppercase tracking-wider text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{sec.cta_label || 'View All Archives'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moreArticles.map((art) => (
                    <a
                      key={art.id}
                      href={`/article/${art.slug}`}
                      className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:shadow-md transition-all group flex flex-col justify-between cursor-pointer block"
                    >
                      <div>
                        <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                          <img
                            src={art.featured_image}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                          />
                        </div>

                        <div className="p-5 sm:p-6">
                          {sec.show_category_badge !== false && (
                            <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 mb-1.5">
                              {art.category_name}
                            </div>
                          )}

                          <h3 className="text-base sm:text-lg font-serif font-bold text-[#0B192C] group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
                            {art.title}
                          </h3>

                          {sec.show_excerpt !== false && (
                            <p className="text-xs sm:text-sm text-slate-600 font-serif mt-2 line-clamp-2 leading-relaxed">
                              {art.excerpt}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="p-5 sm:p-6 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 mt-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                          {sec.show_date !== false && (
                            <span>
                              {new Date(art.published_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          )}
                          {sec.show_date !== false && <span className="text-slate-300">&bull;</span>}
                          <span>{art.read_time_mins || 3} min</span>
                        </div>
                        <span className="text-amber-700 font-bold group-hover:translate-x-1 transition-transform text-xs">
                          Read &rarr;
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </section>
            );
          }

          default:
            return null;
        }
      })}

      {/* Middle Native Sponsored Banner */}
      <div className="max-w-7xl mx-auto px-4">
        <AdPlacement placement="home_mid" />
      </div>

      {/* Local Classifieds & Jobs Spotlight */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-[#0B192C] to-[#1E2A38] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span>Zunheboto Community Noticeboard</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1">
                Local Classifieds &amp; Job Board
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Verified district vacancies, commercial rentals, vehicle sales, trade services, and community notices.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href="/classifieds"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
              >
                Browse All Classifieds
              </a>
              <a
                href="/classifieds?submit=1"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
              >
                + Post Free Listing
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {(classifieds || [])
              .filter((c) => c.status === 'active')
              .slice(0, 4)
              .map((c) => (
                <a
                  key={c.id}
                  href="/classifieds"
                  className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-2xl border border-slate-700/80 hover:border-amber-400/50 transition-all block group cursor-pointer"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-2">
                    <span className="uppercase text-amber-400">{c.category}</span>
                    <span>{c.location || 'Zunheboto'}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {c.title}
                  </h4>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {c.description}
                  </p>
                  <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-amber-400">{c.price_or_salary || 'Contact for info'}</span>
                    <span className="text-slate-400 group-hover:text-white transition-colors">Details &rarr;</span>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </section>

      {/* Lightbox Modal */}
      <LightboxModal
        photos={galleryPhotos}
        currentIndex={selectedPhotoIdx}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={setSelectedPhotoIdx}
      />
    </div>
  );
};
