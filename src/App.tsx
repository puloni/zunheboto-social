import React, { useEffect } from 'react';
import { CmsProvider, useCms } from './context/CmsContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { ArticleArchivePage } from './pages/ArticleArchivePage';
import { AuthorProfilePage } from './pages/AuthorProfilePage';
import { ListingDetailPage } from './pages/ListingDetailPage';
import { DirectoryArchivePage } from './pages/DirectoryArchivePage';
import { GalleryPage } from './pages/GalleryPage';
import { StaticPageView } from './pages/StaticPageView';
import { SearchPage } from './pages/SearchPage';
import { InstallerPage } from './pages/InstallerPage';
import { SitemapRobotsView } from './pages/SitemapRobotsView';
import { ClassifiedsPage } from './pages/ClassifiedsPage';
import { AdminHub } from './pages/admin/AdminHub';
import { updateDocumentSeo, buildBreadcrumbSchema } from './utils/seo';

const AppContent: React.FC = () => {
  const {
    currentRoute,
    settings,
    navigateTo,
    articles,
    pages,
    articleCategories,
    listings
  } = useCms();

  // Extract clean pathname without query strings or hash for robust route matching
  const cleanPath = currentRoute.split('?')[0].split('#')[0] || '/';

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [cleanPath]);

  // Global anchor interception: ensures standard <a href="/path"> triggers SPA navigation
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        href &&
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !target.getAttribute('target') &&
        !target.getAttribute('download') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.defaultPrevented
      ) {
        e.preventDefault();
        navigateTo(href);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [navigateTo]);

  // Fallback / standard route dynamic SEO meta handling
  useEffect(() => {
    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');

    if (cleanPath === '/directory') {
      const breadcrumb = buildBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: 'District Directory', url: '/directory' }
        ],
        settings
      );
      updateDocumentSeo(
        {
          title: `District Directory | ${settings.site_name}`,
          description:
            'Verified district directory for emergency hotlines, administrative offices, healthcare facilities, schools, and local businesses across Zunheboto.',
          canonicalUrl: `${siteUrl}/directory`,
          type: 'website',
          jsonLd: breadcrumb
        },
        settings
      );
    } else if (cleanPath === '/gallery') {
      const breadcrumb = buildBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: 'District Photo Gallery', url: '/gallery' }
        ],
        settings
      );
      updateDocumentSeo(
        {
          title: `District Photo Gallery | ${settings.site_name}`,
          description:
            'A curated photographic archive celebrating the landscapes, tribal culture, heritage, and everyday moments of Zunheboto district.',
          canonicalUrl: `${siteUrl}/gallery`,
          type: 'website',
          jsonLd: breadcrumb
        },
        settings
      );
    } else if (cleanPath === '/search') {
      updateDocumentSeo(
        {
          title: `Search Archive | ${settings.site_name}`,
          description: `Search across all news reports, district listings, and stories on ${settings.site_name}.`,
          canonicalUrl: `${siteUrl}/search`,
          noindex: true
        },
        settings
      );
    } else if (cleanPath === '/classifieds') {
      const breadcrumb = buildBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: 'Local Classifieds & Job Board', url: '/classifieds' }
        ],
        settings
      );
      updateDocumentSeo(
        {
          title: `Local Classifieds & Job Board | ${settings.site_name}`,
          description:
            'Browse verified local job openings, property rentals, vehicle sales, trade services, and community notices in Zunheboto.',
          canonicalUrl: `${siteUrl}/classifieds`,
          type: 'website',
          jsonLd: breadcrumb
        },
        settings
      );
    } else if (cleanPath.startsWith('/admin')) {
      updateDocumentSeo(
        {
          title: `Admin Desk | ${settings.site_name} CMS`,
          description: 'Editorial administration and content management desk.',
          canonicalUrl: `${siteUrl}/admin`,
          noindex: true
        },
        settings
      );
    } else if (cleanPath === '/install') {
      updateDocumentSeo(
        {
          title: `Installation Wizard | ${settings.site_name}`,
          canonicalUrl: `${siteUrl}/install`,
          noindex: true
        },
        settings
      );
    }
  }, [cleanPath, settings]);

  // Standalone administrative & system routes (matched using cleanPath)
  if (cleanPath.startsWith('/admin')) {
    return <AdminHub />;
  }

  if (cleanPath === '/install') {
    return <InstallerPage />;
  }

  if (cleanPath === '/sitemap.xml') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <SitemapRobotsView type="sitemap" />
        </main>
        <Footer />
      </div>
    );
  }

  if (cleanPath === '/robots.txt') {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <main className="flex-1">
          <SitemapRobotsView type="robots" />
        </main>
        <Footer />
      </div>
    );
  }

  // Parse public routes with clean URLs (HTML5 History API)
  let pageComponent: React.ReactNode = null;

  if (cleanPath === '/' || cleanPath === '') {
    pageComponent = <HomePage />;
  } else if (cleanPath === '/articles') {
    pageComponent = <ArticleArchivePage />;
  } else if (cleanPath.startsWith('/articles/category/')) {
    const categorySlug = cleanPath.replace('/articles/category/', '').replace(/\/+$/, '');
    pageComponent = <ArticleArchivePage initialCategory={categorySlug} />;
  } else if (cleanPath.startsWith('/category/')) {
    const categorySlug = cleanPath.replace('/category/', '').replace(/\/+$/, '');
    pageComponent = <ArticleArchivePage initialCategory={categorySlug} />;
  } else if (cleanPath.startsWith('/author/')) {
    const authorSlug = cleanPath.replace('/author/', '').replace(/\/+$/, '');
    pageComponent = <AuthorProfilePage slug={authorSlug} />;
  } else if (cleanPath.startsWith('/article/')) {
    const slug = cleanPath.replace('/article/', '').replace(/\/+$/, '');
    pageComponent = <ArticleDetailPage slug={slug} />;
  } else if (cleanPath === '/directory') {
    pageComponent = <DirectoryArchivePage />;
  } else if (cleanPath.startsWith('/listing/')) {
    const slug = cleanPath.replace('/listing/', '').replace(/\/+$/, '');
    pageComponent = <ListingDetailPage slug={slug} />;
  } else if (cleanPath === '/gallery') {
    pageComponent = <GalleryPage />;
  } else if (cleanPath === '/search') {
    pageComponent = <SearchPage />;
  } else if (cleanPath === '/about') {
    pageComponent = <StaticPageView slug="about" />;
  } else if (cleanPath === '/contact') {
    pageComponent = <StaticPageView slug="contact" />;
  } else if (cleanPath === '/privacy') {
    pageComponent = <StaticPageView slug="privacy" />;
  } else if (cleanPath === '/terms') {
    pageComponent = <StaticPageView slug="terms" />;
  } else if (cleanPath.startsWith('/page/')) {
    const slug = cleanPath.replace('/page/', '').replace(/\/+$/, '');
    pageComponent = <StaticPageView slug={slug} />;
  } else if (cleanPath === '/classifieds') {
    pageComponent = <ClassifiedsPage />;
  } else {
    // Dynamic top-level permalink resolution: /slug (e.g. /my-article-title or /category-slug)
    const rawSlug = cleanPath.replace(/^\/+/, '').replace(/\/+$/, '');
    const matchedArticle = articles.find((a) => a.slug === rawSlug);
    const matchedPage = pages.find((p) => p.slug === rawSlug);
    const matchedCategory = articleCategories.find((c) => c.slug === rawSlug);
    const matchedListing = listings.find((l) => l.slug === rawSlug);

    if (matchedArticle) {
      pageComponent = <ArticleDetailPage slug={rawSlug} />;
    } else if (matchedPage) {
      pageComponent = <StaticPageView slug={rawSlug} />;
    } else if (matchedCategory) {
      pageComponent = <ArticleArchivePage initialCategory={rawSlug} />;
    } else if (matchedListing) {
      pageComponent = <ListingDetailPage slug={rawSlug} />;
    } else {
      // 404 Fallback
      pageComponent = (
        <div className="max-w-4xl mx-auto px-4 py-24 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-serif text-2xl font-bold border border-rose-100">
            404
          </div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">
            Chronicle Not Found
          </h1>
          <p className="text-sm text-slate-500 mb-6">
            The requested chronicle, author profile, or directory item does not exist or has been relocated.
          </p>
          <a
            href="/"
            className="px-6 py-2.5 bg-[#0B192C] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors text-xs uppercase tracking-wider cursor-pointer inline-block"
          >
            Return to District Homepage
          </a>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 selection:bg-amber-100 selection:text-slate-950">
      <Header />
      <main className="flex-1">{pageComponent}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <CmsProvider>
      <AppContent />
    </CmsProvider>
  );
}
