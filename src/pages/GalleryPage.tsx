import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { Camera, MapPin, User, Search, Eye } from 'lucide-react';
import { LightboxModal } from '../components/LightboxModal';

export const GalleryPage: React.FC = () => {
  const { galleryPhotos } = useCms();
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [selectedPhotoIdx, setSelectedPhotoIdx] = useState<number>(0);

  const locations = Array.from(new Set(galleryPhotos.map((p) => p.location))).filter(Boolean);

  const filtered = galleryPhotos.filter((photo) => {
    const matchLoc = selectedLocation === 'all' || photo.location === selectedLocation;
    const q = (searchQuery || '').toLowerCase();
    const matchSearch =
      (photo.title || '').toLowerCase().includes(q) ||
      (photo.caption || '').toLowerCase().includes(q) ||
      (photo.location || '').toLowerCase().includes(q) ||
      (photo.photographer || '').toLowerCase().includes(q);
    return matchLoc && matchSearch;
  });

  const openPhoto = (photoId: string) => {
    const idx = galleryPhotos.findIndex((p) => p.id === photoId);
    if (idx !== -1) {
      setSelectedPhotoIdx(idx);
      setLightboxOpen(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans">
      {/* Masthead */}
      <div className="mb-8 pb-6 border-b-2 border-[#0B192C]">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
          <Camera className="w-4 h-4" /> Visual Chronicle
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
          District Photo Gallery &amp; Cultural Archive
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          High-definition photojournalism, majestic hill vistas, Sümi cultural events, and architectural landmarks across Zunheboto District.
        </p>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search photos by landmark, caption, or credits..."
            className="w-full px-4 py-2 pl-10 rounded-lg border border-slate-300 bg-white text-xs focus:outline-none focus:border-amber-600"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Location Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setSelectedLocation('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
              selectedLocation === 'all'
                ? 'bg-[#0B192C] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            All Locations
          </button>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => setSelectedLocation(loc)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                selectedLocation === loc
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {loc}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500">
          <Camera className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No photos found matching your query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((photo) => (
            <a
              key={photo.id}
              href={photo.image_url}
              onClick={(e) => {
                e.preventDefault();
                openPhoto(photo.id);
              }}
              className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all cursor-pointer flex flex-col justify-between block"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-xs">
                    <Eye className="w-3.5 h-3.5" /> View Photo
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] group-hover:text-amber-700 transition-colors leading-snug">
                  {photo.title}
                </h3>
                {photo.caption && (
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {photo.caption}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  {photo.location && (
                    <span className="flex items-center gap-1 text-amber-700 font-medium">
                      <MapPin className="w-3 h-3" /> {photo.location}
                    </span>
                  )}
                  {photo.photographer && (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" /> {photo.photographer}
                    </span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

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
