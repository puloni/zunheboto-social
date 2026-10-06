import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import {
  Search,
  Building,
  MapPin,
  Phone,
  MessageSquare,
  ShieldCheck,
  Filter,
  CheckCircle2,
  Navigation,
  Globe,
  ExternalLink
} from 'lucide-react';

export const DirectoryArchivePage: React.FC = () => {
  const { listings, listingCategories, navigateTo } = useCms();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const published = listings.filter((l) => l.status === 'published');

  // Extract unique areas
  const areas = Array.from(new Set(published.map((l) => l.location_area))).filter(Boolean);

  const filtered = published
    .filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category_id === selectedCategory || item.category_slug === selectedCategory;
      const matchArea = selectedArea === 'all' || item.location_area === selectedArea;
      const matchVerified = !verifiedOnly || item.verified;
      const q = (searchQuery || '').toLowerCase();
      const matchSearch =
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        (item.address || '').toLowerCase().includes(q) ||
        (item.phone || '').includes(searchQuery) ||
        (item.location_area || '').toLowerCase().includes(q);
      return matchCat && matchArea && matchVerified && matchSearch;
    })
    .sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* Masthead */}
      <div className="mb-8 pb-6 border-b-2 border-[#0B192C]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
          <Building className="w-4 h-4" /> District Services Index
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
          Zunheboto Business, Commercial &amp; Civic Directory
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Verified directory of administrative offices, healthcare facilities, pharmacies, accommodations, cafes, local enterprises, and community institutions across Zunheboto.
        </p>
      </div>

      {/* Filter and Search Panel */}
      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 mb-8 space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Query */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by business name, department, phone, or service..."
              className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-amber-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>

          {/* Area Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-slate-700 focus:outline-none focus:border-amber-600 cursor-pointer"
            >
              <option value="all">All District Areas &amp; Colonies</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          {/* Verified Toggle */}
          <div className="md:col-span-3 flex items-center">
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3.5 py-2.5 rounded-lg border border-slate-300 w-full hover:bg-slate-50 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Verified Only</span>
            </label>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0B192C] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Categories ({published.length})
          </button>
          {listingCategories.map((cat) => {
            const count = published.filter((l) => l.category_id === cat.id).length;
            const isSelected = selectedCategory === cat.id || selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#0B192C] text-white shadow-2xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="text-xs text-slate-500 mb-6 flex items-center justify-between">
        <span>Showing {filtered.length} verified directory records</span>
        {(searchQuery || selectedCategory !== 'all' || selectedArea !== 'all' || verifiedOnly) && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedArea('all');
              setVerifiedOnly(false);
            }}
            className="text-amber-700 hover:underline cursor-pointer"
          >
            Reset All Filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <Building className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-base font-serif text-slate-700 mb-1">No directory listings found</p>
          <p className="text-xs text-slate-400">Try adjusting your colony selection or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => {
            const cleanPhone = (item.phone || '').replace(/\s+/g, '');
            const cleanWhatsapp = (item.whatsapp || item.phone || '').replace(/[^\d+]/g, '');

            return (
              <div
                key={item.id}
                className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-3">
                    <a
                      href={`/listing/${item.slug}`}
                      className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-100 block"
                    >
                      <img
                        src={item.featured_image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </a>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                          {item.category_name}
                        </span>
                        {item.verified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Record" />
                        )}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                        <a
                          href={`/listing/${item.slug}`}
                          className="hover:text-amber-700 transition-colors"
                        >
                          {item.name}
                        </a>
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{item.address}</span>
                      </p>
                      <span className="inline-block mt-1 text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {item.location_area}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {cleanPhone && (
                      <a
                        href={`tel:${cleanPhone}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-md bg-[#0B192C] hover:bg-[#1E2A38] text-white text-xs font-semibold transition-colors shadow-2xs"
                        title="Call directly"
                      >
                        <Phone className="w-3 h-3 text-amber-400" />
                        <span>Call Now</span>
                      </a>
                    )}
                    {item.whatsapp && cleanWhatsapp && (
                      <a
                        href={`https://wa.me/${cleanWhatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span className="hidden xs:inline">WhatsApp</span>
                      </a>
                    )}
                    {item.map_url && (
                      <a
                        href={item.map_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold transition-colors shadow-2xs"
                        title="Get directions"
                      >
                        <Navigation className="w-3 h-3 text-amber-700" />
                        <span>Directions</span>
                      </a>
                    )}
                  </div>

                  <a
                    href={`/listing/${item.slug}`}
                    className="text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors cursor-pointer shrink-0 ml-auto"
                  >
                    Details →
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
