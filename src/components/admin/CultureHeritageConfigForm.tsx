import React from 'react';
import { HomepageSectionConfig, ArticleCategory } from '../../types';
import { BookOpen } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  categories: ArticleCategory[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const CultureHeritageConfigForm: React.FC<Props> = ({
  section,
  categories,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
        <BookOpen className="w-4 h-4 text-amber-700 shrink-0" />
        <span>
          <strong>Culture, Heritage &amp; Environment Section:</strong> Features 5 cultural stories (1 Primary Story + 4 Compact Sub-Cards) highlighting Sumi traditions, ecology, and indigenous arts.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Category & Details */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Category Content Filter
            </label>
            <select
              value={section.category_slug || 'culture-heritage'}
              onChange={(e) =>
                onUpdate({
                  category_slug: e.target.value,
                  category_filter: e.target.value
                })
              }
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-amber-600"
            >
              <option value="culture-heritage">Culture &amp; Heritage (Default)</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title
            </label>
            <input
              type="text"
              value={section.custom_title || section.title}
              onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
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
              placeholder="e.g. Celebrating ancient Sumi traditions, folklore, indigenous ecology..."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Number of Stories (Default 5)
            </label>
            <div className="flex gap-2">
              {[3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdate({ item_limit: num, count: num })}
                  className={`flex-1 py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.item_limit || 5) === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Posts
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Styling & CTA */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Container Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'warm', label: 'Warm Tint (Default)' },
                { id: 'default', label: 'Clean White' },
                { id: 'slate', label: 'Soft Slate' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'warm') === b.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Display Elements
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border border-slate-200">
              {[
                { key: 'show_author', label: 'Author Byline', val: section.show_author !== false },
                { key: 'show_date', label: 'Publish Date', val: section.show_date !== false },
                { key: 'show_excerpt', label: 'Lead Excerpt', val: section.show_excerpt !== false },
                { key: 'show_category_badge', label: 'Category Badge', val: section.show_category_badge !== false }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={item.val}
                    onChange={(e) => onUpdate({ [item.key]: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-medium text-slate-700">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              CTA Action Label &amp; URL
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'Explore Culture Stories'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
              />
              <input
                type="text"
                value={section.cta_url || '/articles/category/culture-heritage'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
