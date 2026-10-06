import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Clock, ArrowRight, Eye } from 'lucide-react';
import { Article, HomepageSectionConfig } from '../types';

interface CommunityCarouselProps {
  articles: Article[];
  section: HomepageSectionConfig;
  onNavigate: (path: string) => void;
  isDarkBg?: boolean;
}

export const CommunityCarousel: React.FC<CommunityCarouselProps> = ({
  articles,
  section,
  onNavigate,
  isDarkBg = false
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // If 4 articles, on desktop show 3 cards per view or 2 cards per view, slide smoothly
  const total = articles.length;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, total - 1) : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= total - 1 ? 0 : prev + 1));
  };

  // Optional subtle autoplay when not hovered
  useEffect(() => {
    if (isPaused || total <= 1) return;
    const timer = setInterval(() => {
      handleNext();
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused, total, currentIndex]);

  if (total === 0) {
    return (
      <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
        No community articles published yet.
      </div>
    );
  }

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Navigation Top Header Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {articles.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                currentIndex === idx
                  ? isDarkBg
                    ? 'w-7 bg-amber-400'
                    : 'w-7 bg-amber-600'
                  : isDarkBg
                  ? 'w-2 bg-slate-700 hover:bg-slate-600'
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              isDarkBg
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            } shadow-xs`}
            aria-label="Previous story"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border ${
              isDarkBg
                ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800 hover:text-white'
                : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            } shadow-xs`}
            aria-label="Next story"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sliding Cards Container */}
      <div className="overflow-hidden rounded-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((art, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <a
                key={art.id}
                href={`/${art.slug}`}
                className={`rounded-2xl overflow-hidden transition-all duration-300 group flex flex-col justify-between cursor-pointer border block ${
                  isDarkBg
                    ? 'bg-slate-900/90 border-slate-800 hover:border-amber-500/50'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
                } ${isCurrent ? 'ring-2 ring-amber-500/40' : ''}`}
              >
                <div>
                  <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                    <img
                      src={art.featured_image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {section.show_category_badge !== false && (
                      <span
                        style={{ backgroundColor: art.category_color || '#059669' }}
                        className="absolute bottom-3 left-3 text-white text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs"
                      >
                        {art.category_name}
                      </span>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      {section.show_date !== false && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(art.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                      {section.show_date !== false && <span>•</span>}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {art.read_time_mins} min
                      </span>
                    </div>

                    <h3
                      className={`text-base font-serif font-bold leading-snug line-clamp-2 group-hover:text-amber-600 transition-colors ${
                        isDarkBg ? 'text-white' : 'text-[#0B192C]'
                      }`}
                    >
                      {art.title}
                    </h3>

                    {section.show_excerpt !== false && (
                      <p
                        className={`text-xs mt-2 line-clamp-2 leading-relaxed ${
                          isDarkBg ? 'text-slate-400' : 'text-slate-600'
                        }`}
                      >
                        {art.excerpt}
                      </p>
                    )}
                  </div>
                </div>

                <div
                  className={`p-5 pt-0 flex items-center justify-between text-xs border-t mt-2 ${
                    isDarkBg ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-500'
                  }`}
                >
                  {section.show_author !== false && (
                    <span className="font-semibold truncate max-w-[120px]">
                      By {art.author_name}
                    </span>
                  )}
                  <span className="text-amber-600 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 ml-auto">
                    Read Story →
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
};
