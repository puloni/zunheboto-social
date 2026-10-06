import React, { useState, useRef } from 'react';
import { useCms } from '../context/CmsContext';
import { X, Upload, Search, Check, Image as ImageIcon, Camera, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, mediaItem?: MediaItem) => void;
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = 'Select or Upload Media'
}) => {
  const { mediaItems, uploadMedia } = useCms();
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [searchQuery, setSearchQuery] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCaption, setUploadCaption] = useState('');
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const q = (searchQuery || '').toLowerCase();
  const filteredMedia = mediaItems.filter((m) =>
    (m.title || (m as any).file_name || (m as any).name || '').toLowerCase().includes(q) ||
    (m.caption || '').toLowerCase().includes(q)
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setUploadError(null);
    if (file) {
      // 15MB file size validation limit
      if (file.size > 15 * 1024 * 1024) {
        setUploadError(`Selected file is ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maximum allowed size is 15MB.`);
        setPreviewDataUrl(null);
        e.target.value = '';
        return;
      }
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '));
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewDataUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewDataUrl || isUploading) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const item = await uploadMedia(
        uploadTitle || 'Uploaded Image',
        previewDataUrl,
        uploadCaption,
        uploadTitle
      );
      onSelect(item.url, item);
      onClose();
    } catch (err: any) {
      console.error('Upload error in MediaPickerModal:', err);
      setUploadError(err?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onSelect(customUrl.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-serif font-bold text-[#0B192C]">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 pt-3 border-b border-slate-200 flex items-center gap-4 bg-white text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-amber-600 text-[#0B192C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Media Library ({mediaItems.length})
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-amber-600 text-[#0B192C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Upload New Photo
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-3 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-amber-600 text-[#0B192C]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Direct Web URL
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media files by title or caption..."
                  className="w-full px-4 py-2.5 pl-10 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-amber-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {filteredMedia.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No images found. Try uploading a photo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelect(item.url, item);
                        onClose();
                      }}
                      className="group relative border border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-amber-600 hover:shadow-md transition-all bg-slate-50 aspect-video sm:aspect-square flex flex-col"
                    >
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white">
                        <div className="text-xs font-bold truncate">{item.title}</div>
                        {item.caption && (
                          <div className="text-[10px] text-slate-300 truncate">{item.caption}</div>
                        )}
                        <span className="text-[10px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Select Photo
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <form onSubmit={handleUploadSubmit} className="max-w-xl mx-auto space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer bg-slate-50 hover:bg-amber-50/20 transition-all"
              >
                {previewDataUrl ? (
                  <div className="space-y-3">
                    <img
                      src={previewDataUrl}
                      alt="Upload Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain border border-slate-200 shadow-sm"
                    />
                    <p className="text-xs text-amber-700 font-semibold">
                      Click to choose a different photo
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">
                      Tap or Click to Select Photo from Device / Camera
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP, GIF (Mobile camera upload supported)
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo Title / Headline
                </label>
                <input
                  type="text"
                  required
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  placeholder="e.g. SBCZ Church Evening Twilight"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Caption / Description <span className="text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={uploadCaption}
                  onChange={(e) => setUploadCaption(e.target.value)}
                  placeholder="e.g. Captured from DC Hill viewpoint"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-xs text-red-700">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{uploadError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={!previewDataUrl || isUploading}
                className="w-full py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-sm transition-colors disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                    <span>Uploading photo...</span>
                  </>
                ) : (
                  <span>Upload &amp; Use Photo</span>
                )}
              </button>
            </form>
          )}

          {activeTab === 'url' && (
            <form onSubmit={handleUrlSubmit} className="max-w-xl mx-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Direct Image Web URL
                </label>
                <input
                  type="url"
                  required
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:border-amber-600"
                />
              </div>

              {customUrl && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                  <div className="text-xs font-semibold text-slate-500 mb-1">Preview:</div>
                  <img
                    src={customUrl}
                    alt="URL Preview"
                    onError={(e) => ((e.target as HTMLElement).style.display = 'none')}
                    className="max-h-40 mx-auto rounded object-cover"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-sm transition-colors cursor-pointer"
              >
                Set Image URL
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
