import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Search, FileText, Building, Camera, ArrowRight, ShieldCheck, Calendar } from 'lucide-react';

export const SearchPage: React.FC = () => {
  const { articles, listings, galleryPhotos, navigateTo } = useCms();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'articles' | 'directory' | 'gallery'>('all');

  const cleanQuery = (query || '').trim().toLowerCase();

  const matchedArticles = cleanQuery
    ? articles
        .filter((a) => a.status === 'published')
        .filter(
          (a) =>
            (a.title || '').toLowerCase().includes(cleanQuery) ||
            (a.excerpt || '').toLowerCase().includes(cleanQuery) ||
            (a.content || '').toLowerCase().includes(cleanQuery) ||
            (Array.isArray(a.tags) ? a.tags.join(' ') : (a.tags || '')).toLowerCase().includes(cleanQuery)
        )
    : [];

  const matchedListings = cleanQuery
    ? listings
        .filter((l) => l.status === 'published')
        .filter(
          (l) =>
            (l.name || '').toLowerCase().includes(cleanQuery) ||
            (l.description || '').toLowerCase().includes(cleanQuery) ||
            (l.address || '').toLowerCase().includes(cleanQuery) ||
            (l.location_area || '').toLowerCase().includes(cleanQuery) ||
            (l.phone || '').toLowerCase().includes(cleanQuery)
        )
    : [];

  const matchedGallery = cleanQuery
    ? galleryPhotos.filter(
        (g) =>
          (g.title || '').toLowerCase().includes(cleanQuery) ||
          (g.caption || '').toLowerCase().includes(cleanQuery) ||
          (g.location || '').toLowerCase().includes(cleanQuery) ||
          (g.photographer || '').toLowerCase().includes(cleanQuery)
      )
    : [];

  const totalResults = matchedArticles.length + matchedListings.length + matchedGallery.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <div className="mb-8 pb-6 border-b-2 border-[#0B192C]">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
          Search Zunheboto Social
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Explore published news reports, directory entries, cultural chronicles, and district landmarks.
        </p>
      </div>

      {/* Main Search Input */}
      <div className="relative mb-6">
        <input
          type="text"
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for keywords, colony names, news topics, or local businesses..."
          className="w-full px-5 py-4 pl-12 rounded-xl border-2 border-slate-300 focus:border-amber-600 bg-white text-base text-slate-900 shadow-xs focus:outline-none"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 bg-slate-100 px-2.5 py-1 rounded"
          >
            Clear
          </button>
        )}
      </div>

      {/* Tabs */}
      {query.trim() && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
              filterType === 'all'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Results ({totalResults})
          </button>
          <button
            onClick={() => setFilterType('articles')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'articles'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Articles ({matchedArticles.length})</span>
          </button>
          <button
            onClick={() => setFilterType('directory')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'directory'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Directory ({matchedListings.length})</span>
          </button>
          <button
            onClick={() => setFilterType('gallery')}
            className={`px-3.5 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              filterType === 'gallery'
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photos ({matchedGallery.length})</span>
          </button>
        </div>
      )}

      {/* Results Section */}
      {!query.trim() ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <Search className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-40" />
          <h3 className="text-base font-serif font-bold text-slate-700">
            Type a search keyword above to explore the Zunheboto archive
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Try searching for: <span className="text-amber-700 font-semibold">Ahuna, SBCZ, District Hospital, Project Colony, Coffee</span>
          </p>
        </div>
      ) : totalResults === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <p className="text-base font-serif text-slate-700 mb-1">
            No matches found for "{query}"
          </p>
          <p className="text-xs text-slate-400">
            Check your spelling or try searching with different district keywords.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Articles */}
          {(filterType === 'all' || filterType === 'articles') && matchedArticles.length > 0 && (
            <div>
              <h2 className="text-lg font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-200 mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                <span>Articles &amp; News Stories ({matchedArticles.length})</span>
              </h2>
              <div className="space-y-3">
                {matchedArticles.map((art) => (
                  <a
                    key={art.id}
                    href={`/article/${art.slug}`}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex gap-4 items-center block"
                  >
                    <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={art.featured_image}
                        alt={art.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-bold text-amber-700 uppercase">{art.category_name}</span>
                        <span>•</span>
                        <span>{new Date(art.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {art.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {art.excerpt}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Directory Listings */}
          {(filterType === 'all' || filterType === 'directory') && matchedListings.length > 0 && (
            <div>
              <h2 className="text-lg font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-200 mb-4 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-600" />
                <span>District Directory Listings ({matchedListings.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {matchedListings.map((l) => (
                  <a
                    key={l.id}
                    href={`/listing/${l.slug}`}
                    className="p-4 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer flex gap-3 items-start block"
                  >
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={l.featured_image} alt={l.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase text-amber-700">{l.category_name}</span>
                        {l.verified && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 truncate">{l.name}</h3>
                      <p className="text-xs text-slate-500 truncate">{l.address} ({l.location_area})</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Photos */}
          {(filterType === 'all' || filterType === 'gallery') && matchedGallery.length > 0 && (
            <div>
              <h2 className="text-lg font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-200 mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4 text-amber-600" />
                <span>Gallery Photos ({matchedGallery.length})</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {matchedGallery.map((g) => (
                  <a
                    key={g.id}
                    href="/gallery"
                    className="group border border-slate-200 rounded-xl overflow-hidden cursor-pointer bg-white block"
                  >
                    <div className="aspect-square overflow-hidden bg-slate-100">
                      <img
                        src={g.image_url}
                        alt={g.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2.5">
                      <div className="text-xs font-bold text-slate-900 truncate">{g.title}</div>
                      <div className="text-[10px] text-slate-400 truncate">{g.location}</div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
