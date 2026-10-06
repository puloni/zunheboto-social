import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Plus, Edit2, Trash2, Camera, Upload, ArrowUp, ArrowDown } from 'lucide-react';
import { GalleryPhoto } from '../../types';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export const AdminGallery: React.FC = () => {
  const { galleryPhotos, createGalleryPhoto, updateGalleryPhoto, deleteGalleryPhoto } = useCms();

  const [editingPhoto, setEditingPhoto] = useState<GalleryPhoto | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [photographer, setPhotographer] = useState('Zunheboto Media Collective');
  const [location, setLocation] = useState('Zunheboto');

  const startCreate = () => {
    setTitle('');
    setImageUrl('https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1000&q=80');
    setCaption('');
    setPhotographer('Zunheboto Media Collective');
    setLocation('Zunheboto Town');
    setEditingPhoto(null);
    setIsCreating(true);
  };

  const startEdit = (p: GalleryPhoto) => {
    setTitle(p.title);
    setImageUrl(p.image_url);
    setCaption(p.caption);
    setPhotographer(p.photographer);
    setLocation(p.location);
    setEditingPhoto(p);
    setIsCreating(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !imageUrl.trim()) return;

    if (editingPhoto) {
      updateGalleryPhoto(editingPhoto.id, {
        title: title.trim(),
        image_url: imageUrl.trim(),
        caption: caption.trim(),
        photographer: photographer.trim(),
        location: location.trim()
      });
      setEditingPhoto(null);
    } else {
      createGalleryPhoto({
        title: title.trim(),
        image_url: imageUrl.trim(),
        caption: caption.trim(),
        photographer: photographer.trim(),
        location: location.trim()
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            District Photo Gallery
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Curate visual documentation of summits, townscapes, cultural gatherings, and landscapes.
          </p>
        </div>

        <button
          onClick={startCreate}
          className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo to Gallery</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Modal/Sidebar */}
        {(isCreating || editingPhoto) && (
          <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-600" />
              <span>{editingPhoto ? 'Edit Photo Record' : 'Upload Gallery Photo'}</span>
            </h2>

            <form onSubmit={handleSave} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Photo Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Morning Mist at DC Hill"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Photo Image <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="text-[11px] text-amber-700 font-bold hover:underline"
                  >
                    Select Media
                  </button>
                </div>
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border border-slate-200 mb-2"
                  />
                )}
                <input
                  type="url"
                  required
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Caption / Context
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Description of the scene..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Sukhalu Ridge"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Photographer
                  </label>
                  <input
                    type="text"
                    value={photographer}
                    onChange={(e) => setPhotographer(e.target.value)}
                    placeholder="Credit Name"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {editingPhoto ? 'Save Changes' : 'Add Photo'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setEditingPhoto(null);
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Gallery Grid */}
        <div className={`${isCreating || editingPhoto ? 'lg:col-span-8' : 'lg:col-span-12'} grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
          {galleryPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video bg-slate-100 overflow-hidden relative">
                  <img
                    src={photo.image_url}
                    alt={photo.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 truncate">
                    {photo.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {photo.caption}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1 flex items-center justify-between">
                    <span>{photo.location}</span>
                    <span>© {photo.photographer}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-1">
                <button
                  onClick={() => startEdit(photo)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete photo from gallery?')) {
                      deleteGalleryPhoto(photo.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => setImageUrl(url)}
        title="Select Photo for District Gallery"
      />
    </div>
  );
};
