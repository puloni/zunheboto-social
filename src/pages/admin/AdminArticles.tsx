import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  Eye,
  CheckCircle2,
  X,
  Upload,
  Flame,
  ArrowLeft,
  Calendar,
  Clock,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Article, ContentStatus } from '../../types';
import { RichTextEditor } from '../../components/RichTextEditor';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { DraftPreviewModal } from '../../components/admin/DraftPreviewModal';

export const AdminArticles: React.FC = () => {
  const {
    articles,
    articleCategories,
    createArticle,
    updateArticle,
    setFeaturedStory,
    trashArticle,
    restoreArticle,
    deleteArticlePermanent,
    adminUser,
    navigateTo
  } = useCms();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'scheduled' | 'pending_review' | 'draft' | 'trash'>('all');

  // Form Editor Mode
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState(articleCategories[0]?.id || '');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [caption, setCaption] = useState('');
  const [authorName, setAuthorName] = useState(adminUser?.name || 'Administrator');
  const [tags, setTags] = useState('');
  const [readTime, setReadTime] = useState(3);
  const [status, setStatus] = useState<ContentStatus>('published');
  const [scheduledDate, setScheduledDate] = useState('');
  const [editorialNotes, setEditorialNotes] = useState('');
  const [featuredLead, setFeaturedLead] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const isPrivilegedEditor = adminUser?.role === 'superadmin' || adminUser?.role === 'editor';

  const cleanContentForEditor = (str?: string): string => {
    if (!str) return '';
    return str.split('\n').map((l) => l.replace(/^[ \t]{2,}/, '')).join('\n').trim();
  };

  const startCreate = () => {
    setTitle('');
    setSlug('');
    setCategoryId(articleCategories[0]?.id || '');
    setExcerpt('');
    setContent('<p>Write your detailed article report here...</p>');
    setFeaturedImage('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80');
    setCaption('Photo from Zunheboto District');
    setAuthorName(adminUser?.name || 'Staff Reporter');
    setTags('Zunheboto, Nagaland, Community');
    setReadTime(3);
    setStatus(isPrivilegedEditor ? 'published' : 'pending_review');
    setScheduledDate('');
    setEditorialNotes('');
    setFeaturedLead(false);
    setEditingArticle(null);
    setIsCreating(true);
    setSaveError(null);
  };

  const startEdit = (art: Article) => {
    setTitle(art.title);
    setSlug(art.slug);
    setCategoryId(art.category_id);
    setExcerpt(art.excerpt);
    setContent(cleanContentForEditor(art.content));
    setFeaturedImage(art.featured_image);
    setCaption(art.caption || '');
    setAuthorName(art.author_name);
    setTags(Array.isArray(art.tags) ? art.tags.join(', ') : art.tags || '');
    setReadTime(art.read_time_mins || 3);
    setStatus(art.status);
    setScheduledDate(art.scheduled_at || (art.status === 'scheduled' ? art.published_at : ''));
    setEditorialNotes(art.editorial_notes || '');
    setFeaturedLead(art.featured_lead);
    setEditingArticle(art);
    setIsCreating(false);
    setSaveError(null);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!editingArticle) {
      const generatedSlug = newTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSave = async (e?: React.FormEvent, overrideStatus?: ContentStatus) => {
    if (e) e.preventDefault();
    if (!title.trim() || isSaving) return;

    let targetStatus = overrideStatus || status;
    if (!isPrivilegedEditor && targetStatus !== 'draft') {
      targetStatus = 'pending_review';
    }

    const cleanSlug =
      slug.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');

    setIsSaving(true);
    setSaveError(null);
    try {
      const pubDate =
        targetStatus === 'scheduled' && scheduledDate
          ? new Date(scheduledDate).toISOString()
          : editingArticle?.published_at || new Date().toISOString();

      if (editingArticle) {
        await updateArticle(editingArticle.id, {
          title: title.trim(),
          slug: cleanSlug,
          category_id: categoryId,
          excerpt: excerpt.trim(),
          content: content.trim(),
          featured_image: featuredImage.trim(),
          caption: caption.trim(),
          author_name: authorName.trim(),
          tags: tags.trim(),
          read_time_mins: Number(readTime) || 3,
          status: targetStatus,
          published_at: pubDate,
          scheduled_at: targetStatus === 'scheduled' ? scheduledDate : undefined,
          editorial_notes: editorialNotes.trim() || undefined,
          editorial_status: targetStatus === 'pending_review' ? 'pending_review' : targetStatus === 'published' ? 'approved' : undefined,
          submitted_by: targetStatus === 'pending_review' ? (adminUser?.name || 'Staff Reporter') : editingArticle.submitted_by,
          submitted_at: targetStatus === 'pending_review' ? new Date().toISOString() : editingArticle.submitted_at,
          featured_lead: featuredLead
        });
        setEditingArticle(null);
      } else {
        await createArticle({
          title: title.trim(),
          slug: cleanSlug,
          category_id: categoryId,
          excerpt: excerpt.trim(),
          content: content.trim(),
          featured_image: featuredImage.trim(),
          caption: caption.trim(),
          author_name: authorName.trim(),
          tags: tags.trim(),
          read_time_minutes: Number(readTime) || 3,
          read_time_mins: Number(readTime) || 3,
          status: targetStatus,
          published_at: pubDate,
          scheduled_at: targetStatus === 'scheduled' ? scheduledDate : undefined,
          editorial_notes: editorialNotes.trim() || undefined,
          editorial_status: targetStatus === 'pending_review' ? 'pending_review' : targetStatus === 'published' ? 'approved' : undefined,
          submitted_by: targetStatus === 'pending_review' ? (adminUser?.name || 'Staff Reporter') : undefined,
          submitted_at: targetStatus === 'pending_review' ? new Date().toISOString() : undefined,
          featured_lead: featuredLead
        });
        setIsCreating(false);
      }
    } catch (err: any) {
      console.error('Failed to save article:', err);
      setSaveError(err?.message || 'Failed to save article to server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter list
  const filteredArticles = articles.filter((art) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (art.title || '').toLowerCase().includes(q) ||
      (art.excerpt || '').toLowerCase().includes(q) ||
      (art.author_name || '').toLowerCase().includes(q);
    const matchesCat = selectedCat === 'all' || art.category_id === selectedCat;
    const matchesStatus =
      selectedStatus === 'all'
        ? art.status !== 'trash'
        : art.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStatus;
  });

  // Render Form Editor
  if (isCreating || editingArticle) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsCreating(false);
              setEditingArticle(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Article List</span>
          </button>
          <h2 className="text-xl font-serif font-bold text-[#0B192C]">
            {editingArticle ? 'Edit Article' : 'Compose New District Story'}
          </h2>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Main Form Column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Title */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Article Headline / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="e.g. Zunheboto Municipal Council Commences Clean Green District Drive"
                    className="w-full px-4 py-3 text-base sm:text-lg font-serif font-bold text-[#0B192C] rounded-xl border border-slate-300 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    URL Slug (Permallink)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">/</span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="clean-url-slug"
                      className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Short Excerpt / Lead Summary <span className="text-slate-400 font-normal">(Displays in article previews)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Brief 1-2 sentence lead summary..."
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Rich Body Content */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Article Body Content <span className="text-rose-500">*</span>
                </label>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Draft full report here..."
                  minHeight="400px"
                />
              </div>
            </div>

            {/* Right Meta Column */}
            <div className="lg:col-span-4 space-y-6">
              {/* Publish Actions Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                  Publishing Controls
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Publication Status &amp; Workflow
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600 bg-white"
                  >
                    {isPrivilegedEditor ? (
                      <>
                        <option value="published">Published (Live on Website)</option>
                        <option value="scheduled">Scheduled for Future Date/Time</option>
                        <option value="pending_review">Pending Editorial Review</option>
                        <option value="draft">Draft (Private in CMS)</option>
                        <option value="trash">Trash</option>
                      </>
                    ) : (
                      <>
                        <option value="pending_review">Submit for Review (Editorial Sign-off)</option>
                        <option value="draft">Draft (Private in CMS)</option>
                      </>
                    )}
                  </select>
                </div>

                {status === 'scheduled' && (
                  <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 space-y-1.5 animate-in fade-in">
                    <label className="block text-xs font-bold text-purple-900">
                      Scheduled Publication Date &amp; Time
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-purple-300 text-xs bg-white text-slate-800 font-mono"
                    />
                    <p className="text-[10px] text-purple-700 leading-tight">
                      This article will automatically go live across the homepage, sitemaps, and RSS feeds once this timestamp arrives.
                    </p>
                  </div>
                )}

                {/* Editorial Notes */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Editorial Notes &amp; Desk Feedback
                  </label>
                  <textarea
                    rows={2}
                    value={editorialNotes}
                    onChange={(e) => setEditorialNotes(e.target.value)}
                    placeholder="Proofreading remarks, revision notes, or reporter feedback..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-800 focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-600"
                  >
                    {articleCategories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-200 bg-amber-50/50 cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={featuredLead}
                      onChange={(e) => setFeaturedLead(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-amber-900">
                        <Flame className="w-4 h-4 text-amber-600" />
                        <span>Set as Homepage Featured Story</span>
                      </div>
                      <p className="text-[11px] text-amber-700/80 font-normal mt-0.5">
                        Only one article is the Featured Story at a time. Selecting this automatically replaces the previous featured story.
                      </p>
                    </div>
                  </label>
                </div>

                {saveError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2 text-xs text-rose-700">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{saveError}</span>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs transition-colors shadow-xs cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : !isPrivilegedEditor ? (
                        <span>Submit for Review</span>
                      ) : status === 'scheduled' ? (
                        <span>Schedule Publication</span>
                      ) : status === 'pending_review' ? (
                        <span>Save Review State</span>
                      ) : (
                        <span>{editingArticle ? 'Save Changes' : 'Publish Article'}</span>
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
                        setEditingArticle(null);
                      }}
                      className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold rounded-xl text-xs transition-colors border border-slate-200 cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              {/* Featured Image Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-serif font-bold text-[#0B192C]">
                    Featured Cover Photo
                  </h3>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Choose Media
                  </button>
                </div>

                {featuredImage ? (
                  <div className="space-y-2">
                    <img
                      src={featuredImage}
                      alt="Featured"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => setFeaturedImage('')}
                      className="text-[11px] text-rose-600 font-semibold hover:underline"
                    >
                      Remove photo
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setMediaPickerOpen(true)}
                    className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-xl p-6 text-center cursor-pointer bg-slate-50 text-slate-500 text-xs"
                  >
                    <Upload className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                    <span>Click to select or upload cover photo</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photo Caption / Credit
                  </label>
                  <input
                    type="text"
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="e.g. Photo: Zunheboto Media Cell"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              {/* Metadata Card */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                  Article Metadata
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Author Byline
                  </label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="Governance, Roads, Youth"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estimated Reading Time (Minutes)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={readTime}
                    onChange={(e) => setReadTime(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Media Picker Modal */}
        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => setFeaturedImage(url)}
          title="Select Cover Photo for Article"
        />

        {/* Draft Preview Modal */}
        <DraftPreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          type="article"
          data={{
            title: title || 'Untitled Article',
            slug: slug || 'preview-article',
            category_name: articleCategories.find((c) => c.id === categoryId)?.name || 'General News',
            excerpt,
            content,
            featured_image: featuredImage,
            caption,
            author_name: authorName,
            tags,
            read_time_minutes: Number(readTime) || 3,
            status
          }}
        />
      </div>
    );
  }

  // Article List View
  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            News Articles &amp; Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage, compose, schedule, and categorize news publications for Zunheboto Social.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Workflow Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'all'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Active ({articles.filter((a) => a.status !== 'trash').length})
        </button>

        <button
          onClick={() => setSelectedStatus('published')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'published'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Published ({articles.filter((a) => a.status === 'published').length})
        </button>

        <button
          onClick={() => setSelectedStatus('scheduled')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'scheduled'
              ? 'bg-purple-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-3 h-3 text-purple-400" />
          <span>Scheduled ({articles.filter((a) => a.status === 'scheduled').length})</span>
        </button>

        <button
          onClick={() => setSelectedStatus('pending_review')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            selectedStatus === 'pending_review'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <span>Review Queue</span>
          {articles.filter((a) => a.status === 'pending_review').length > 0 && (
            <span className="bg-amber-400 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
              {articles.filter((a) => a.status === 'pending_review').length}
            </span>
          )}
        </button>

        <button
          onClick={() => setSelectedStatus('draft')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'draft'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Drafts ({articles.filter((a) => a.status === 'draft').length})
        </button>

        <button
          onClick={() => setSelectedStatus('trash')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            selectedStatus === 'trash'
              ? 'bg-rose-700 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Trash ({articles.filter((a) => a.status === 'trash').length})
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles by title, excerpt, or author..."
            className="w-full px-3.5 py-2 pl-9 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All Categories</option>
            {articleCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="all">All (Active)</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
            <option value="trash">Trash</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Article</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Featured Story</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Views</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No articles found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredArticles.map((art) => {
                  const isFeatured = art.is_featured_story || art.featured_lead;
                  return (
                    <tr key={art.id} className={`transition-colors ${isFeatured ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'}`}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-10 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                            <img src={art.featured_image} alt={art.title} className="w-full h-full object-cover" />
                            {isFeatured && (
                              <div className="absolute top-0 right-0 bg-amber-500 text-white p-0.5 rounded-bl">
                                <Flame className="w-2.5 h-2.5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-sm">
                            <div className="font-bold text-slate-900 truncate hover:text-amber-700 cursor-pointer flex items-center gap-1.5" onClick={() => startEdit(art)}>
                              <span>{art.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono truncate">
                              /{art.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          style={{ backgroundColor: art.category_color ? `${art.category_color}15` : '#f1f5f9', color: art.category_color || '#334155' }}
                          className="px-2 py-0.5 rounded font-bold text-[10px] uppercase"
                        >
                          {art.category_name}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {isFeatured ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] border border-amber-300">
                            <Flame className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Featured Story</span>
                          </span>
                        ) : art.status === 'published' ? (
                          <button
                            type="button"
                            onClick={() => setFeaturedStory(art.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-dashed border-slate-300 hover:border-amber-400 transition-colors cursor-pointer"
                            title="Set as the single Featured Story on Homepage"
                          >
                            <Flame className="w-3 h-3 text-slate-400" />
                            <span>Set Featured</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-600 font-medium">
                        {art.author_name}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-500 font-mono">
                        {art.views}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {art.status === 'published' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-emerald-100 text-emerald-800">
                            Published
                          </span>
                        )}
                        {art.status === 'scheduled' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-purple-100 text-purple-900 border border-purple-200 inline-flex items-center gap-1">
                            <Clock className="w-3 h-3 text-purple-600" />
                            <span>Scheduled</span>
                          </span>
                        )}
                        {art.status === 'pending_review' && (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                              <AlertCircle className="w-3 h-3 text-amber-600" />
                              <span>In Review</span>
                            </span>
                            {art.submitted_by && (
                              <div className="text-[10px] text-slate-500 font-mono">By {art.submitted_by}</div>
                            )}
                          </div>
                        )}
                        {art.status === 'draft' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-slate-100 text-slate-700">
                            Draft
                          </span>
                        )}
                        {art.status === 'trash' && (
                          <span className="px-2 py-0.5 rounded font-bold text-[10px] uppercase bg-rose-100 text-rose-800">
                            Trash
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-slate-400 text-[11px]">
                        {art.status === 'scheduled' && art.published_at ? (
                          <span className="text-purple-700 font-semibold">
                            {new Date(art.published_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })} ({new Date(art.published_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })})
                          </span>
                        ) : (
                          new Date(art.published_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                      {art.status === 'pending_review' && isPrivilegedEditor && (
                        <button
                          onClick={() => updateArticle(art.id, { status: 'published', editorial_status: 'approved', published_at: new Date().toISOString() })}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-[11px] font-bold transition-colors shadow-xs mr-1 cursor-pointer"
                          title="Quick Approve & Publish Immediately"
                        >
                          Approve
                        </button>
                      )}
                      <button
                        onClick={() => startEdit(art)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                        title="Edit Article"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={`/${art.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block p-1.5 text-slate-600 hover:text-amber-700 hover:bg-slate-100 rounded transition-colors"
                        title="View Live Page"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </a>

                      {art.status === 'trash' ? (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await restoreArticle(art.id);
                              } catch (e) {
                                alert('Failed to restore article');
                              }
                            }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                            title="Restore"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Permanently delete this article? This cannot be undone.')) {
                                try {
                                  await deleteArticlePermanent(art.id);
                                } catch (e) {
                                  alert('Failed to delete article');
                                }
                              }
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={async () => {
                              try {
                                await trashArticle(art.id);
                              } catch (e) {
                                alert('Failed to move article to trash');
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors"
                            title="Move to Trash"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm(`Permanently delete "${art.title}"? This cannot be undone.`)) {
                                try {
                                  await deleteArticlePermanent(art.id);
                                } catch (e) {
                                  alert('Failed to delete article');
                                }
                              }
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                            title="Delete Permanently"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
