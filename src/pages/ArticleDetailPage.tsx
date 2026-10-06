import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import {
  Calendar,
  Clock,
  Eye,
  ArrowLeft,
  Share2,
  Tag,
  User,
  MapPin,
  Flame,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { SocialShare } from '../components/SocialShare';
import { NewsletterSubscribe } from '../components/NewsletterSubscribe';
import { updateDocumentSeo, buildArticleSchema, buildBreadcrumbSchema } from '../utils/seo';
import { slugify } from '../utils/slugify';
import { ContentRenderer } from '../components/ContentRenderer';
import { AdPlacement } from '../components/AdPlacement';

interface ArticleDetailPageProps {
  slug: string;
}

export const ArticleDetailPage: React.FC<ArticleDetailPageProps> = ({ slug }) => {
  const { articles, navigateTo, incrementArticleViews, settings, adminUser } = useCms();

  const article = articles.find((a) => a.slug === slug);

  // Track article views
  useEffect(() => {
    if (article) {
      incrementArticleViews(slug);
    }
  }, [slug]);

  // Dynamic SEO & Structured Data
  useEffect(() => {
    if (!article) return;

    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
    const canonicalUrl = `${siteUrl}/${article.slug}`;

    const breadcrumbLd = buildBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: article.category_name || 'News', url: `/category/${article.category_slug || 'news'}` },
        { name: article.title, url: `/${article.slug}` }
      ],
      settings
    );

    const articleLd = buildArticleSchema(article, settings);

    updateDocumentSeo(
      {
        title: `${article.seo_title || article.title} | ${settings.site_name}`,
        description: article.meta_description || article.excerpt || article.title,
        canonicalUrl,
        image: article.social_image || article.featured_image,
        type: 'article',
        publishedTime: article.published_at,
        modifiedTime: article.updated_at,
        author: article.author_name,
        section: article.category_name,
        jsonLd: [breadcrumbLd, articleLd]
      },
      settings
    );
  }, [article, settings]);

  const isPubliclyAvailable =
    article?.status === 'published' ||
    (article?.status === 'scheduled' && new Date(article.published_at || article.scheduled_at || 0) <= new Date());

  if (!article || (!isPubliclyAvailable && !adminUser)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
          Article Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          The requested news story could not be located or may have been relocated.
        </p>
        <a
          href="/articles"
          className="px-6 py-2.5 bg-[#0B192C] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors inline-block"
        >
          Return to Article Archive
        </a>
      </div>
    );
  }

  const relatedArticles = articles
    .filter((a) => a.id !== article.id && a.category_id === article.category_id && a.status === 'published')
    .slice(0, 3);

  const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
  const currentUrl = `${siteUrl}/${article.slug}`;
  const authorSlug = slugify(article.author_name);

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 font-sans">
      {/* Draft Mode Notice for Admin */}
      {article.status !== 'published' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <span className="font-bold">Draft Mode Active:</span> This article is currently unpublished ({article.status}) and only visible to administrators.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-950">
            Status: {article.status || 'draft'}
          </span>
        </div>
      )}

      {/* Breadcrumb & Kicker */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <a
          href="/articles"
          className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B192C] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Articles Archive</span>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={`/category/${article.category_slug || 'news'}`}
            className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-700 hover:text-amber-800 cursor-pointer transition-colors"
          >
            {article.category_name}
          </a>
          {article.featured_lead && (
            <>
              <span className="text-slate-300">&bull;</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-600 fill-amber-600" /> Featured Story
              </span>
            </>
          )}
        </div>
      </div>

      {/* Headline & Subhead */}
      <header className="mb-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black text-[#0B192C] leading-[1.18] mb-5 tracking-tight">
          {article.title}
        </h1>
        {article.excerpt && (
          <p className="text-lg sm:text-xl text-slate-700 font-serif leading-relaxed italic border-l-2 border-amber-600 pl-5 py-1 mb-8">
            {article.excerpt}
          </p>
        )}
      </header>

      {/* Meta Byline Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-3.5 border-y border-slate-200 mb-8 text-xs text-slate-600">
        <a
          href={`/author/${encodeURIComponent(authorSlug)}`}
          className="flex items-center gap-3 cursor-pointer group"
          title={`View all articles by ${article.author_name}`}
        >
          <div className="w-9 h-9 rounded-full bg-slate-900 text-amber-300 border border-slate-800 overflow-hidden flex items-center justify-center font-serif font-bold text-sm shadow-2xs">
            {article.author_name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
              {article.author_name}
            </div>
            <div className="text-[11px] text-slate-500">Zunheboto District Bureau</div>
          </div>
        </a>

        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span>
            {new Date(article.published_at).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </span>
          <span className="text-slate-300">&bull;</span>
          <span>{article.read_time_minutes || article.read_time_mins || 3} min read</span>
          <span className="text-slate-300">&bull;</span>
          <span className="font-mono text-slate-400">{(article.views || 0).toLocaleString()} views</span>
        </div>
      </div>

      {/* Hero Featured Image */}
      {article.featured_image && (
        <figure className="mb-8">
          <div className="aspect-[16/10] sm:aspect-[21/10] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs">
            <img
              src={article.featured_image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
          {article.caption && (
            <figcaption className="text-xs text-slate-500 mt-2.5 text-center font-sans">
              Photo: {article.caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Main Body Content */}
      <ContentRenderer
        content={article.content}
        className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-relaxed space-y-4 mb-8"
      />

      {/* Tags if available */}
      {article.tags && (
        <div className="flex flex-wrap items-center gap-2 my-6 pt-4 border-t border-slate-200">
          <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Topics:
          </span>
          {(Array.isArray(article.tags) ? article.tags : (article.tags || '').split(',')).map((tag, idx) => (
            <span
              key={idx}
              className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-full transition-colors font-medium"
            >
              #{String(tag).trim()}
            </span>
          ))}
        </div>
      )}

      {/* Social Sharing - STRICTLY AFTER CONTENT */}
      <SocialShare title={article.title} url={currentUrl} />

      {/* Native Sponsored Placement */}
      <div className="my-6">
        <AdPlacement placement="article_bottom" />
      </div>

      {/* Author Bio Card */}
      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start gap-4 my-8">
        <a
          href={`/author/${encodeURIComponent(authorSlug)}`}
          className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-200 flex items-center justify-center font-serif text-xl font-bold text-slate-700 shrink-0 uppercase border border-slate-300 cursor-pointer block"
        >
          {article.author_name.charAt(0)}
        </a>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-serif font-bold text-slate-900 leading-tight">
              <a
                href={`/author/${encodeURIComponent(authorSlug)}`}
                className="hover:text-amber-700 transition-colors"
              >
                About {article.author_name}
              </a>
            </h4>
            <a
              href={`/author/${encodeURIComponent(authorSlug)}`}
              className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
            >
              View Author Archive →
            </a>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
            Staff reporter &amp; community correspondent covering district governance, cultural developments, municipal news, and local events across Zunheboto, Nagaland.
          </p>
        </div>
      </div>

      {/* Newsletter Community Subscription Callout */}
      <div className="my-10">
        <NewsletterSubscribe
          variant="card"
          source={`article_${article.slug}`}
          title="Stay Updated on Zunheboto Stories"
          subtitle="Subscribe to receive fresh editorial reports, cultural essays, and community alerts directly in your inbox."
        />
      </div>

      {/* Related Stories */}
      {relatedArticles.length > 0 && (
        <section className="mt-12 pt-8 border-t-2 border-slate-200">
          <h3 className="text-xl font-serif font-bold text-[#0B192C] mb-6">
            Related News in {article.category_name}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((rel) => (
              <a
                key={rel.id}
                href={`/${rel.slug}`}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow group cursor-pointer flex flex-col block"
              >
                <div className="aspect-video relative overflow-hidden bg-slate-100">
                  <img
                    src={rel.featured_image}
                    alt={rel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    style={{ backgroundColor: rel.category_color || '#0284C7' }}
                    className="absolute top-2 left-2 text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded shadow-xs"
                  >
                    {rel.category_name}
                  </span>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <h4 className="font-serif font-bold text-sm text-[#0B192C] group-hover:text-amber-700 transition-colors line-clamp-2 mb-2">
                    {rel.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100">
                    <span>{new Date(rel.published_at).toLocaleDateString()}</span>
                    <span>{rel.read_time_minutes || rel.read_time_mins || 3} min read</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
