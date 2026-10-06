import React from 'react';
import { HomepageSectionConfig, ArticleCategory } from '../../types';
import { FolderOpen, Grid } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  categories: ArticleCategory[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const MoreStoriesConfigForm: React.FC<Props> = ({
  section,
  categories,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 font-medium">
        <FolderOpen className="w-4 h-4 text-indigo-600 shrink-0" />
        <span>
          <strong>More Stories / Category Archives:</strong> 3-column magazine grid featuring 6 articles across diverse district news and cultural desks.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Category & Layout */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Category Desk Filter
            </label>
            <select
              value={section.category_slug || 'all'}
              onChange={(e) =>
                onUpdate({
                  category_slug: e.target.value,
                  category_filter: e.target.value
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-indigo-600"
            >
              <option value="all">All Desks &amp; Categories (Recommended)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Articles Count (Default 6)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[6, 9, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdate({ item_limit: num, count: num })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.item_limit || 6) === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Articles
                </button>
              ))}
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

        {/* Right Column: Meta & CTA */}
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
                { key: 'show_excerpt', label: 'Lead Excerpt', val: section.show_excerpt !== false }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title &amp; Subtitle
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={section.custom_title || section.title}
                onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Dispatches, profiles, and analytical coverage across Nagaland..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Archive Action Button
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'View All Archives'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-indigo-600"
              />
              <input
                type="text"
                value={section.cta_url || '/articles'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
