import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import { AdPlacement as AdPlacementType } from '../types';
import { ExternalLink, Sparkles } from 'lucide-react';

interface AdPlacementProps {
  placement: AdPlacementType;
  className?: string;
}

export const AdPlacement: React.FC<AdPlacementProps> = ({ placement, className = '' }) => {
  const { sponsoredAds, trackAdImpression } = useCms();

  // Find active ad for this slot
  const now = new Date();
  const eligibleAds = sponsoredAds.filter((ad) => {
    if (!ad.active || ad.placement !== placement) return false;
    if (ad.start_date && new Date(ad.start_date) > now) return false;
    if (ad.end_date && new Date(ad.end_date) < now) return false;
    return true;
  });

  const ad = eligibleAds.length > 0 ? eligibleAds[0] : null;

  useEffect(() => {
    if (ad) {
      trackAdImpression(ad.id);
    }
  }, [ad?.id]);

  if (!ad) return null;

  const isLeaderboard = placement === 'leaderboard_top';
  const isSidebar = placement === 'sidebar_rect';

  return (
    <div
      className={`relative group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all hover:shadow-md ${
        isLeaderboard ? 'my-4 max-w-5xl mx-auto' : isSidebar ? 'my-4 w-full' : 'my-6'
      } ${className}`}
    >
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 border-b border-slate-100 text-[10px] text-slate-500 font-medium">
        <span className="flex items-center gap-1 text-amber-700 font-semibold tracking-wider uppercase">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {ad.badge_text || 'Sponsored'}
        </span>
        <span className="truncate max-w-[180px]">{ad.sponsor_name}</span>
      </div>

      <a
        href={`/api/ads/${ad.id}/click`}
        target="_blank"
        rel="noopener noreferrer"
        className="block relative overflow-hidden"
      >
        <img
          src={ad.image_url}
          alt={ad.title}
          className={`w-full object-cover transition-transform duration-300 group-hover:scale-[1.01] ${
            isLeaderboard
              ? 'max-h-[140px] sm:max-h-[180px]'
              : isSidebar
              ? 'max-h-[260px]'
              : 'max-h-[200px]'
          }`}
          loading="lazy"
        />

        <div className="p-3 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent absolute inset-0 flex flex-col justify-end text-white">
          <div className="text-xs sm:text-sm font-bold leading-tight group-hover:text-amber-300 transition-colors line-clamp-2">
            {ad.title}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-amber-200/90 mt-1 font-medium">
            <span>Learn more</span>
            <ExternalLink className="w-3 h-3" />
          </div>
        </div>
      </a>
    </div>
  );
};
