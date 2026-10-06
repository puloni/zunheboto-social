import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit2, Trash2, FolderPlus, AlertCircle, Loader2 } from 'lucide-react';
import { ListingCategory } from '../../types';

export const AdminListingCategories: React.FC = () => {
  const {
    listingCategories,
    createListingCategory,
    updateListingCategory,
    deleteListingCategory,
    listings
  } = useCms();

  const [editingCat, setEditingCat] = useState<ListingCategory | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const startEdit = (cat: ListingCategory) => {
    setSaveError(null);
    setEditingCat(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
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
        await updateListingCategory(editingCat.id, {
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim()
        });
        setEditingCat(null);
      } else {
        await createListingCategory({
          name: name.trim(),
          slug: cleanSlug,
          description: description.trim()
        });
      }

      setName('');
      setSlug('');
      setDescription('');
    } catch (err: any) {
      console.error('Failed to save listing category:', err);
      setSaveError(err.message || 'Failed to save category to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          Directory Categories
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Define commercial, administrative, and civic business categories.
        </p>
      </div>

      {saveError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                placeholder="e.g. Legal Services & Notary"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slug (URL Key)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. legal-services"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description of directory sector..."
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
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Listings Count</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {listingCategories.map((cat) => {
                const count = listings.filter((l) => l.category_id === cat.id).length;
                return (
                  <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900">
                      {cat.name}
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
                      {listingCategories.length > 1 && (
                        <button
                          onClick={async () => {
                            if (confirm(`Delete category "${cat.name}"? Existing listings will be safely reassigned.`)) {
                              try {
                                await deleteListingCategory(cat.id);
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
