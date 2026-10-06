import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  AlertCircle,
  Edit3,
  X,
  FileText
} from 'lucide-react';
import { MediaItem } from '../../types';

export const AdminMedia: React.FC = () => {
  const { mediaItems, uploadMedia, updateMediaMetadata, deleteMedia } = useCms();
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Media Details Modal State
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const [editCaption, setEditCaption] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingMetadata, setIsSavingMetadata] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [modalCopied, setModalCopied] = useState(false);

  const getPublicUrl = (url?: string): string => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
    }
    return url;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // 15MB limit check
        if (file.size > 15 * 1024 * 1024) {
          throw new Error(`"${file.name}" exceeds the 15MB maximum file size limit.`);
        }

        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        if (dataUrl) {
          await uploadMedia(file.name, dataUrl);
        }
      }
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Failed to upload image.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim() || isUploading) return;
    const name = urlInput.split('/').pop()?.split('?')[0] || 'remote-image.jpg';
    setUploadError(null);
    setIsUploading(true);
    try {
      await uploadMedia(name, urlInput.trim());
      setUrlInput('');
    } catch (err: any) {
      console.error('Remote URL error:', err);
      setUploadError(err.message || 'Failed to import image from URL.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopy = async (id: string, rawUrl: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const fullUrl = getPublicUrl(rawUrl);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const handleCopyModalUrl = async (rawUrl: string) => {
    const fullUrl = getPublicUrl(rawUrl);
    try {
      await navigator.clipboard.writeText(fullUrl);
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const openDetailsModal = (item: MediaItem) => {
    setSelectedItem(item);
    setEditTitle(item.title || item.filename || (item as any).file_name || '');
    setEditAlt(item.alt_text || '');
    setEditCaption(item.caption || '');
    setEditDescription(item.description || '');
    setSaveError(null);
    setSaveSuccess(false);
    setModalCopied(false);
  };

  const closeDetailsModal = () => {
    setSelectedItem(null);
    setSaveError(null);
    setSaveSuccess(false);
    setModalCopied(false);
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || isSavingMetadata) return;

    setIsSavingMetadata(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const res = await updateMediaMetadata(selectedItem.id, {
        title: editTitle.trim(),
        alt_text: editAlt.trim(),
        caption: editCaption.trim(),
        description: editDescription.trim()
      });

      if (res && res.success === false) {
        throw new Error('Server returned failure while updating media.');
      }

      setSelectedItem((prev) =>
        prev
          ? {
              ...prev,
              title: editTitle.trim(),
              alt_text: editAlt.trim(),
              caption: editCaption.trim(),
              description: editDescription.trim()
            }
          : null
      );
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save media metadata:', err);
      setSaveError(err.message || 'Failed to save media metadata.');
    } finally {
      setIsSavingMetadata(false);
    }
  };

  const handleDeleteFromModal = async () => {
    if (!selectedItem) return;
    const name = selectedItem.title || selectedItem.filename || (selectedItem as any).file_name;
    if (confirm(`Delete media item "${name}" permanently?`)) {
      try {
        await deleteMedia(selectedItem.id);
        closeDetailsModal();
      } catch (err) {
        alert('Failed to delete media item.');
      }
    }
  };

  const q = (search || '').toLowerCase();
  const filteredMedia = mediaItems.filter((m) => {
    const fn = ((m as any).file_name || (m as any).filename || '').toLowerCase();
    const title = (m.title || '').toLowerCase();
    const caption = (m.caption || '').toLowerCase();
    const alt = (m.alt_text || '').toLowerCase();
    return fn.includes(q) || title.includes(q) || caption.includes(q) || alt.includes(q);
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            Media Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload, inspect, and manage photos, illustrations, captions, and metadata. (Max 15MB per file)
          </p>
        </div>
        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg self-start sm:self-auto">
          Total Items: <span className="text-[#0B192C] font-bold">{mediaItems.length}</span>
        </div>
      </div>

      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Box & External URL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-amber-500 transition-colors text-center relative flex flex-col items-center justify-center">
          {isUploading ? (
            <div className="flex flex-col items-center py-2">
              <Loader2 className="w-8 h-8 text-amber-600 animate-spin mb-2" />
              <p className="text-xs font-bold text-slate-800">Uploading media to server...</p>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-amber-600 mb-2" />
              <p className="text-xs font-bold text-slate-800">
                Upload from your device
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                PNG, JPG, WEBP, SVG up to 15MB
              </p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full disabled:cursor-not-allowed"
              />
            </>
          )}
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-center">
          <p className="text-xs font-bold text-slate-800 mb-2">
            Import Image via Remote URL
          </p>
          <form onSubmit={handleAddUrl} className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              disabled={isUploading}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isUploading}
              className="px-4 py-2 bg-[#0B192C] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Add
            </button>
          </form>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter media by title, filename, caption or alt text..."
          className="flex-1 text-xs outline-none"
        />
      </div>

      {/* Media Grid */}
      {filteredMedia.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
          <p className="text-sm font-semibold text-slate-600">No media items found</p>
          <p className="text-xs text-slate-400 mt-1">Try a different search keyword or upload a new photo above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredMedia.map((item) => {
            const rawUrl = item.url || (item as any).file_url || '';
            const displayName = item.title || (item as any).file_name || (item as any).filename || 'Untitled Media';
            return (
              <div
                key={item.id}
                onClick={() => openDetailsModal(item)}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden group hover:border-amber-500 hover:shadow-sm transition-all flex flex-col cursor-pointer"
              >
                <div className="aspect-square bg-slate-100 overflow-hidden relative">
                  <img
                    src={rawUrl}
                    alt={item.alt_text || displayName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/95 text-slate-900 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1">
                      <Edit3 className="w-3 h-3 text-amber-600" /> Details
                    </span>
                  </div>
                </div>
                <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate" title={displayName}>
                      {displayName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {item.file_size ? `${(item.file_size / 1024).toFixed(0)} KB` : 'Media Asset'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => handleCopy(item.id, rawUrl, e)}
                      className="p-1 text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      title="Copy Public Media URL"
                    >
                      {copiedId === item.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (confirm(`Delete media file "${displayName}"?`)) {
                          try {
                            await deleteMedia(item.id);
                          } catch (err) {
                            alert('Failed to delete media file from server.');
                          }
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Media Details / Attachment Management Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#0B192C]">
                    Media Details
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate max-w-md">
                    {selectedItem.filename || (selectedItem as any).file_name || selectedItem.title}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeDetailsModal}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                {/* Left Column: Image Preview & File Meta */}
                <div className="md:col-span-5 space-y-4">
                  <div className="w-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center p-2 min-h-[220px] max-h-[300px]">
                    <img
                      src={selectedItem.url || (selectedItem as any).file_url}
                      alt={selectedItem.alt_text || selectedItem.title}
                      className="max-h-[280px] w-auto max-w-full object-contain rounded-lg"
                    />
                  </div>

                  {/* File Metadata Info */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">File Name:</span>
                      <span className="font-semibold text-slate-800 truncate max-w-[180px]" title={selectedItem.filename || (selectedItem as any).file_name}>
                        {selectedItem.filename || (selectedItem as any).file_name || 'image.jpg'}
                      </span>
                    </div>
                    {selectedItem.file_type && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">File Type:</span>
                        <span className="font-mono text-slate-700">{selectedItem.file_type}</span>
                      </div>
                    )}
                    {selectedItem.file_size ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">File Size:</span>
                        <span className="font-mono text-slate-700">{(selectedItem.file_size / 1024).toFixed(1)} KB</span>
                      </div>
                    ) : null}
                    {selectedItem.created_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Uploaded:</span>
                        <span className="text-slate-700">
                          {new Date(selectedItem.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Copy Media URL Block */}
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700">
                      Public Media URL
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        readOnly
                        value={getPublicUrl(selectedItem.url || (selectedItem as any).file_url)}
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                        className="flex-1 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyModalUrl(selectedItem.url || (selectedItem as any).file_url)}
                        className="px-3 py-1.5 bg-[#0B192C] hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {modalCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>URL Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Media URL</span>
                          </>
                        )}
                      </button>

                      <a
                        href={getPublicUrl(selectedItem.url || (selectedItem as any).file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
                      >
                        <span>Open In New Tab</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column: Editable Metadata Form */}
                <div className="md:col-span-7 space-y-4">
                  {saveSuccess && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-800 animate-in fade-in">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Media metadata saved successfully.</span>
                    </div>
                  )}

                  {saveError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveMetadata} className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Title <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="e.g. Zunheboto Municipal Council Headquarters"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Display title identifying this photo across the media manager and picker.
                      </p>
                    </div>

                    {/* Alternative Text */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Alternative Text (Alt Text)
                      </label>
                      <input
                        type="text"
                        value={editAlt}
                        onChange={(e) => setEditAlt(e.target.value)}
                        placeholder="Describe the image content and setting"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Used by screen readers for accessibility and search engine image indexing.
                      </p>
                    </div>

                    {/* Caption */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Caption
                      </label>
                      <textarea
                        rows={2}
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        placeholder="e.g. Photo courtesy of District Information Office, Zunheboto"
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Appears directly beneath the photo when inserted into news stories or features.
                      </p>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        placeholder="Optional internal notes, context, or story background..."
                        className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-amber-600"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Internal context or extended description of this asset.
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="submit"
                          disabled={isSavingMetadata}
                          className="px-5 py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSavingMetadata ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                              <span>Saving Metadata...</span>
                            </>
                          ) : (
                            <span>Save Metadata</span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={closeDetailsModal}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={handleDeleteFromModal}
                        className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Permanently</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

