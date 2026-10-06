import React from 'react';
import { HomepageSectionConfig, ArticleCategory } from '../../types';
import { Newspaper, LayoutGrid } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  categories: ArticleCategory[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const LatestNewsConfigForm: React.FC<Props> = ({
  section,
  categories,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 font-medium">
        <Newspaper className="w-4 h-4 text-blue-600 shrink-0" />
        <span>
          <strong>Latest News Section:</strong> Renders 3 latest breaking headlines in a dynamic 1 Large Lead (Left) + 2 Stacked Cards (Right) layout.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Source & Filter */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Category Filter
            </label>
            <select
              value={section.category_slug || 'local-news'}
              onChange={(e) =>
                onUpdate({
                  category_slug: e.target.value,
                  category_filter: e.target.value
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-blue-600"
            >
              <option value="all">All Published News</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              Pull reports from Local News or across all categories.
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={section.custom_title || section.title}
              onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Subtitle / Description
            </label>
            <input
              type="text"
              value={section.subtitle || ''}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="e.g. Breaking headlines and municipal reports from around the hills"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-blue-600"
            />
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

        {/* Right Column: Display Elements & CTA */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Visible Meta Elements
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border border-slate-200">
              {[
                { key: 'show_category_badge', label: 'Category Badge', val: section.show_category_badge !== false },
                { key: 'show_author', label: 'Author Byline', val: section.show_author !== false },
                { key: 'show_date', label: 'Publish Date', val: section.show_date !== false },
                { key: 'show_excerpt', label: 'Article Excerpt', val: section.show_excerpt !== false },
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
                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              CTA Button Text &amp; URL
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'View All News'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                placeholder="View All News"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-blue-600"
              />
              <input
                type="text"
                value={section.cta_url || '/articles/category/local-news'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                placeholder="/articles/category/local-news"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
