import React from 'react';
import { HomepageSectionConfig, Article } from '../../types';
import { Flame, Check, Sparkles } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  articles: Article[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
  onSetFeatured: (articleId: string) => void;
}

export const FeaturedStoryConfigForm: React.FC<Props> = ({
  section,
  articles,
  onUpdate,
  onSetFeatured
}) => {
  const publishedArticles = articles.filter((a) => a.status === 'published');
  const currentFeaturedId = section.featured_article_id || publishedArticles[0]?.id;
  const currentArticle = publishedArticles.find((a) => a.id === currentFeaturedId) || publishedArticles[0];

  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      {/* Type Banner */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-medium">
        <Flame className="w-4 h-4 text-amber-600 shrink-0" />
        <span>
          <strong>Featured Story Hero:</strong> Highlights a single high-impact investigative or lead story at the very top of the homepage.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Story Picker */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Select Featured Article <span className="text-rose-500">*</span>
            </label>
            <select
              value={currentFeaturedId || ''}
              onChange={(e) => {
                const newId = e.target.value;
                onUpdate({ featured_article_id: newId });
                onSetFeatured(newId);
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-amber-600 shadow-2xs"
            >
              {publishedArticles.map((art) => (
                <option key={art.id} value={art.id}>
                  {art.title} ({art.category_name})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              The chosen story receives prime front-page hero prominence.
            </p>
          </div>

          {/* Current Article Preview Card */}
          {currentArticle && (
            <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex gap-3">
              <div className="w-20 h-16 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={currentArticle.featured_image}
                  alt={currentArticle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <span
                  style={{ color: currentArticle.category_color || '#d97706' }}
                  className="text-[10px] font-bold uppercase tracking-wider block"
                >
                  {currentArticle.category_name}
                </span>
                <h4 className="font-bold text-slate-900 truncate mt-0.5">
                  {currentArticle.title}
                </h4>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  By {currentArticle.author_name}
                </p>
              </div>
            </div>
          )}

          {/* Background Styling */}
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
                { key: 'show_excerpt', label: 'Lead Excerpt', val: section.show_excerpt !== false },
                { key: 'show_views', label: 'View Counter', val: section.show_views !== false },
                { key: 'show_button', label: 'Read Button', val: section.show_button !== false }
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
              Button Action Label
            </label>
            <input
              type="text"
              value={section.cta_label || 'Read Full Story'}
              onChange={(e) => onUpdate({ cta_label: e.target.value })}
              placeholder="e.g. Read Full Story"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
