import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit2, Trash2, FolderPlus, Palette, Tag, AlertCircle, Loader2 } from 'lucide-react';
import { ArticleCategory } from '../../types';

export const AdminArticleCategories: React.FC = () => {
  const {
    articleCategories,
    createArticleCategory,
    updateArticleCategory,
    deleteArticleCategory,
    articles
  } = useCms();

  const [editingCat, setEditingCat] = useState<ArticleCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#0284C7');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEdit = (cat: ArticleCategory) => {
    setSaveError(null);
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setColor(cat.color);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaveError(null);
    setIsSaving(true);

    const cleanSlug =
      slug.trim() ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    try {
      if (editingCat) {
        await updateArticleCategory(editingCat.id, {
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim(),
          color
        });
        setEditingCat(null);
      } else {
        await createArticleCategory({
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim(),
          color
        });
      }

      setName('');
      setSlug('');
      setDescription('');
      setColor('#0284C7');
    } catch (err: any) {
      console.error('Failed to save article category:', err);
      setSaveError(err.message || 'Failed to save category to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          Article Categories
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Organize district news into distinct editorial categories with custom color identities.
        </p>
      </div>

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
            <FolderPlus className="w-4 h-4 text-amber-600" />
            <span>{editingCat ? 'Edit Category' : 'Add New Category'}</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCat) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                  }
                }}
                placeholder="e.g. Health & Sanitation"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slug (URL Identifier)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. health-sanitation"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Badge Color Identity
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Editorial beat description..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>{editingCat ? 'Update Category' : 'Create Category'}</span>
                )}
              </button>
              {editingCat && (
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setEditingCat(null);
                    setName('');
                    setSlug('');
                    setDescription('');
                    setColor('#0284C7');
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Articles</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {articleCategories.map((cat) => {
                const count = articles.filter((a) => a.category_id === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                        <span className="font-bold text-slate-900">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-mono text-slate-500 text-[11px]">
                      {cat.slug}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-bold text-slate-800">
                      {count}
                    </td>
                    <td className="px-4 py-4 text-slate-500 text-[11px] max-w-xs truncate">
                      {cat.description || '—'}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {articleCategories.length > 1 && (
                        <button
                          onClick={async () => {
                            if (confirm(`Delete category "${cat.name}"? Existing articles will be safely reassigned.`)) {
                              try {
                                await deleteArticleCategory(cat.id);
                              } catch (err) {
                                alert('Failed to delete category');
                              }
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
