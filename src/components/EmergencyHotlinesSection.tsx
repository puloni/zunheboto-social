import React from 'react';
import { useCms } from '../context/CmsContext';
import { Phone, ShieldAlert, HeartPulse, Flame, AlertTriangle, LifeBuoy } from 'lucide-react';
import { HomepageSectionConfig } from '../types';

interface EmergencyHotlinesProps {
  config?: HomepageSectionConfig;
}

export const EmergencyHotlinesSection: React.FC<EmergencyHotlinesProps> = ({ config }) => {
  const { emergencyHotlines } = useCms();

  let activeHotlines = emergencyHotlines.filter((h) => h.enabled);

  // Category filter
  if (config?.hotlines_category && config.hotlines_category !== 'all') {
    activeHotlines = activeHotlines.filter((h) => h.category === config.hotlines_category);
  }

  // Sort
  if (config?.hotlines_sort === 'alphabetical') {
    activeHotlines = [...activeHotlines].sort((a, b) => a.title.localeCompare(b.title));
  } else {
    activeHotlines = [...activeHotlines].sort((a, b) => a.order - b.order);
  }

  // Limit
  const maxCount = config?.hotlines_max_count || config?.item_limit || 6;
  activeHotlines = activeHotlines.slice(0, maxCount);

  if (activeHotlines.length === 0) return null;

  const showCallButton = config?.hotlines_show_call_button !== false;
  const showIcons = config?.hotlines_show_icons !== false;
  const showPhone = config?.hotlines_show_phone !== false;

  const getIcon = (category: string) => {
    switch (category) {
      case 'police':
        return <ShieldAlert className="w-5 h-5 text-blue-600" />;
      case 'hospital':
        return <HeartPulse className="w-5 h-5 text-rose-600" />;
      case 'fire':
        return <Flame className="w-5 h-5 text-amber-600" />;
      case 'disaster':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default:
        return <LifeBuoy className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block"></span>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#0B192C]">
              {config?.custom_title || config?.title || 'District Emergency Hotlines'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {config?.subtitle ||
              'Direct 24/7 emergency response numbers for Zunheboto town & surrounding blocks'}
          </p>
        </div>
        <span className="text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full self-start sm:self-auto">
          Always Active 24/7
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeHotlines.map((hotline) => (
          <div
            key={hotline.id}
            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                {showIcons && (
                  <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-2xs">
                    {getIcon(hotline.category)}
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {hotline.title}
                  </h3>
                  {showPhone && (
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      {hotline.phone}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-4 line-clamp-2 leading-relaxed">
                {hotline.description}
              </p>
            </div>

            {showCallButton && (
              <a
                href={`tel:${hotline.phone.replace(/\s+/g, '')}`}
                className="mt-auto flex items-center justify-between px-3.5 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white rounded-xl text-xs font-bold transition-colors group cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>{hotline.phone}</span>
                </div>
                <span className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold bg-slate-800 px-2 py-0.5 rounded">
                  Tap to Call
                </span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
