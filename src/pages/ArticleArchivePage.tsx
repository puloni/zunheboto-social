import React, { useState, useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { Search, Filter, Calendar, Clock, Eye, ArrowRight, Tag } from 'lucide-react';
import { updateDocumentSeo, buildBreadcrumbSchema } from '../utils/seo';
import { AdPlacement } from '../components/AdPlacement';

interface ArticleArchivePageProps {
  initialCategory?: string;
}

export const ArticleArchivePage: React.FC<ArticleArchivePageProps> = ({ initialCategory }) => {
  const { articles, articleCategories, navigateTo, settings, currentRoute } = useCms();

  const getInitialCat = () => {
    if (initialCategory) return initialCategory;
    if (typeof window !== 'undefined') {
      const q = new URLSearchParams(window.location.search).get('category');
      if (q) return q;
    }
    const routeQ = new URLSearchParams(currentRoute.split('?')[1] || '').get('category');
    if (routeQ) return routeQ;
    return 'all';
  };

  const [selectedCategory, setSelectedCategory] = useState<string>(getInitialCat);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'latest' | 'views' | 'oldest'>('latest');

  useEffect(() => {
    const cat = getInitialCat();
    setSelectedCategory(cat);
  }, [initialCategory, currentRoute]);

  const activeCategoryObj = articleCategories.find(
    (c) => c.id === selectedCategory || c.slug === selectedCategory
  );

  // Dynamic SEO metadata
  useEffect(() => {
    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');

    if (activeCategoryObj) {
      const canonicalUrl = `${siteUrl}/articles/category/${activeCategoryObj.slug}`;
      const breadcrumbLd = buildBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: 'News Archive', url: '/articles' },
          { name: activeCategoryObj.name, url: `/articles/category/${activeCategoryObj.slug}` }
        ],
        settings
      );

      updateDocumentSeo(
        {
          title: `${activeCategoryObj.name} News & Chronicles | ${settings.site_name}`,
          description:
            activeCategoryObj.description ||
            `Read verified ${activeCategoryObj.name.toLowerCase()} reports, community essays, and district developments from Zunheboto, Nagaland.`,
          canonicalUrl,
          type: 'website',
          jsonLd: breadcrumbLd
        },
        settings
      );
    } else {
      const canonicalUrl = `${siteUrl}/articles`;
      const breadcrumbLd = buildBreadcrumbSchema(
        [
          { name: 'Home', url: '/' },
          { name: 'News & Publication Archive', url: '/articles' }
        ],
        settings
      );

      updateDocumentSeo(
        {
          title: `District News & Publication Archive | ${settings.site_name}`,
          description:
            'Comprehensive chronicle archives, investigative journalism, and community records from Zunheboto, Nagaland.',
          canonicalUrl,
          type: 'website',
          jsonLd: breadcrumbLd
        },
        settings
      );
    }
  }, [activeCategoryObj, settings]);

  const now = new Date();
  const published = articles.filter(
    (a) => a.status === 'published' || (a.status === 'scheduled' && new Date(a.published_at || a.scheduled_at || 0) <= now)
  );

  const filtered = published
    .filter((a) => {
      const matchesCat = selectedCategory === 'all' || a.category_id === selectedCategory || a.category_slug === selectedCategory;
      const q = (searchQuery || '').toLowerCase();
      const matchesSearch =
        (a.title || '').toLowerCase().includes(q) ||
        (a.excerpt || '').toLowerCase().includes(q) ||
        (a.content || '').toLowerCase().includes(q) ||
        (Array.isArray(a.tags) ? a.tags.join(' ') : (a.tags || '')).toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'oldest') return new Date(a.published_at).getTime() - new Date(b.published_at).getTime();
      return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* Masthead */}
      <div className="mb-8 pb-6 border-b-2 border-[#0B192C]">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
          District News &amp; Publication Archive
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Complete chronological records, in-depth reports, investigative features, and community developments from Zunheboto, Nagaland.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by title, topic, or keyword..."
              className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer"
            >
              <option value="latest">Newest Published</option>
              <option value="views">Most Read / Popular</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/80">
          <a
            href="/articles"
            onClick={(e) => {
              e.preventDefault();
              setSelectedCategory('all');
              navigateTo('/articles');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B192C] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Categories ({published.length})
          </a>
          {articleCategories.map((cat) => {
            const count = published.filter((a) => a.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
            return (
              <a
                key={cat.id}
                href={`/articles/category/${cat.slug}`}
                onClick={(e) => {
                  e.preventDefault();
                  setSelectedCategory(cat.slug);
                  navigateTo(`/articles/category/${cat.slug}`);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B192C] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }}></span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </a>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs text-slate-500 mb-6 flex items-center justify-between">
        <span>Showing {filtered.length} stories</span>
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-amber-700 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-base font-serif text-slate-700 mb-2">No articles matched your criteria</p>
          <p className="text-xs text-slate-400">Try adjusting your search query or selected category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((art) => (
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
                  <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-700 mb-1.5">
                    {art.category_name}
                  </div>

                  <h3 className="text-base sm:text-lg font-serif font-bold text-[#0B192C] group-hover:text-amber-800 transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-serif mt-2 line-clamp-2 leading-relaxed">
                    {art.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 sm:p-6 pt-0 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span>
                    {new Date(art.published_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span>{art.read_time_mins || 3} min</span>
                </div>
                <span className="text-amber-700 font-bold group-hover:translate-x-1 transition-transform text-xs">
                  Read &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Sponsored Ad Placement */}
      <div className="mt-12">
        <AdPlacement placement="home_mid" />
      </div>
    </div>
  );
};
