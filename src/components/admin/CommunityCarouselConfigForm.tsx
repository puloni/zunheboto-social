import React from 'react';
import { HomepageSectionConfig, ArticleCategory } from '../../types';
import { Share2, Sliders } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  categories: ArticleCategory[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const CommunityCarouselConfigForm: React.FC<Props> = ({
  section,
  categories,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium">
        <Share2 className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          <strong>Community &amp; Society Carousel:</strong> Horizontal scrolling slider featuring youth initiatives, church life, and collective civic action.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Carousel Options */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Category Filter
            </label>
            <select
              value={section.category_slug || 'community-society'}
              onChange={(e) =>
                onUpdate({
                  category_slug: e.target.value,
                  category_filter: e.target.value
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-emerald-600"
            >
              <option value="community-society">Community &amp; Society (Default)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Carousel Motion &amp; Navigation Controls
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.carousel_autoplay || false}
                  onChange={(e) => onUpdate({ carousel_autoplay: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div>
                  <div className="font-bold text-slate-800">Auto-Rotate Carousel</div>
                  <div className="text-[11px] text-slate-500">Automatically transitions between cards</div>
                </div>
              </label>

              {section.carousel_autoplay && (
                <div className="pl-6 pt-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transition Interval (Milliseconds)
                  </label>
                  <select
                    value={section.carousel_autoplay_speed || 4000}
                    onChange={(e) => onUpdate({ carousel_autoplay_speed: parseInt(e.target.value) })}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                  >
                    <option value={3000}>3 Seconds (Fast)</option>
                    <option value={4000}>4 Seconds (Standard)</option>
                    <option value={6000}>6 Seconds (Relaxed)</option>
                  </select>
                </div>
              )}

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.carousel_show_arrows !== false}
                  onChange={(e) => onUpdate({ carousel_show_arrows: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700">Display Previous/Next Navigation Arrows</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.carousel_show_dots !== false}
                  onChange={(e) => onUpdate({ carousel_show_dots: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700">Display Pagination Dot Indicators</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Container Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'default', label: 'Clean White' },
                { id: 'slate', label: 'Soft Slate' },
                { id: 'warm', label: 'Warm Tint' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'default') === b.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Titles & Meta */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title &amp; Subtitle
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={section.custom_title || section.title}
                onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Stories of youth excellence, church life, and collective civic action"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Card Meta Displays
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border border-slate-200">
              {[
                { key: 'show_author', label: 'Author Byline', val: section.show_author !== false },
                { key: 'show_date', label: 'Publish Date', val: section.show_date !== false },
                { key: 'show_excerpt', label: 'Lead Excerpt', val: section.show_excerpt !== false },
                { key: 'show_views', label: 'View Count', val: section.show_views !== false }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Action Button
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'View Community Feed'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-emerald-600"
              />
              <input
                type="text"
                value={section.cta_url || '/articles/category/community-society'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
