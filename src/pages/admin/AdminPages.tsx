import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit2, Trash2, Eye, ArrowLeft, FileCode, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Page } from '../../types';
import { RichTextEditor } from '../../components/RichTextEditor';
import { DraftPreviewModal } from '../../components/admin/DraftPreviewModal';

export const AdminPages: React.FC = () => {
  const { pages, createPage, updatePage, deletePage, navigateTo } = useCms();

  const [editingPage, setEditingPage] = useState<Page | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'published' | 'draft'>('published');

  const cleanContentForEditor = (str?: string): string => {
    if (!str) return '';
    return str.split('\n').map((l) => l.replace(/^[ \t]{2,}/, '')).join('\n').trim();
  };

  const startCreate = () => {
    setSaveError(null);
    setTitle('');
    setSlug('');
    setContent('<p>Enter page details and body content here...</p>');
    setStatus('published');
    setEditingPage(null);
    setIsCreating(true);
  };

  const startEdit = (page: Page) => {
    setSaveError(null);
    setTitle(page.title);
    setSlug(page.slug);
    setContent(cleanContentForEditor(page.content));
    setStatus(page.status);
    setEditingPage(page);
    setIsCreating(false);
  };

  const handleSave = async (e?: React.FormEvent, overrideStatus?: 'published' | 'draft') => {
    if (e) e.preventDefault();
    if (!title.trim()) return;

    const targetStatus = overrideStatus || status;

    setSaveError(null);
    setIsSaving(true);

    const cleanSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    try {
      if (editingPage) {
        await updatePage(editingPage.id, {
          title: title.trim(),
          slug: cleanSlug,
          content: content.trim(),
          status: targetStatus
        });
        setEditingPage(null);
      } else {
        await createPage({
          title: title.trim(),
          slug: cleanSlug,
          content: content.trim(),
          status: targetStatus
        });
        setIsCreating(false);
      }
    } catch (err: any) {
      console.error('Failed to save page:', err);
      setSaveError(err.message || 'Failed to save page to server.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCreating || editingPage) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setEditingPage(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pages List</span>
          </button>
          <h2 className="text-xl font-serif font-bold text-[#0B192C]">
            {editingPage ? 'Edit Page' : 'Create New Static Page'}
          </h2>
        </div>

        {saveError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{saveError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Page Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!editingPage) {
                        setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
                      }
                    }}
                    placeholder="e.g. Terms & Privacy Policy"
                    className="w-full px-4 py-2.5 text-base font-bold text-[#0B192C] rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">/page/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Page Content <span className="text-rose-500">*</span>
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Draft page content..."
                  minHeight="400px"
                />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                  Page Settings
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                          <span>Saving Page...</span>
                        </>
                      ) : (
                        <span>{editingPage ? 'Update Page' : 'Save Page'}</span>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleSave(undefined, 'draft')}
                      className="px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                      title="Save as an unpublished draft"
                    >
                      Save as Draft
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewModalOpen(true)}
                      className="flex-1 py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition-colors border border-amber-200 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-amber-600" />
                      <span>Preview Draft</span>
                    </button>
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => {
                        setIsCreating(false);
                        setEditingPage(null);
                      }}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Draft Preview Modal */}
        <DraftPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          type="page"
          data={{
            title: title || 'Untitled Page',
            slug: slug || 'preview-page',
            content,
            status
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            Static Pages
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage legal, contact, editorial standards, and civic about pages.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Page</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-3">Page Title</th>
              <th className="px-4 py-3">Slug / Path</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Last Updated</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pages.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4 font-bold text-slate-900">
                  {p.title}
                </td>
                <td className="px-4 py-4 font-mono text-slate-500 text-[11px]">
                  /{p.slug}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`px-2 py-0.5 rounded font-bold text-[10px] uppercase ${
                      p.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-4 text-slate-400 text-[11px]">
                  {new Date(p.updated_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </td>
                <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                  <button
                    onClick={() => startEdit(p)}
                    className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                    title="Edit Page"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <a
                    href={`/${p.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded transition-colors"
                    title="View Page"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </a>
                  {p.slug !== 'about' && p.slug !== 'contact' && (
                    <button
                      onClick={async () => {
                        if (confirm(`Delete page "${p.title}"?`)) {
                          try {
                            await deletePage(p.id);
                          } catch (err) {
                            alert('Failed to delete page from server.');
                          }
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete Page"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
