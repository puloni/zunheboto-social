import React, { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Camera, User } from 'lucide-react';
import { GalleryPhoto } from '../types';

interface LightboxModalProps {
  photos: GalleryPhoto[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  photos,
  currentIndex,
  isOpen,
  onClose,
  onNavigate
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onNavigate((currentIndex - 1 + photos.length) % photos.length);
      if (e.key === 'ArrowRight') onNavigate((currentIndex + 1) % photos.length);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, photos.length, onClose, onNavigate]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="flex items-center justify-between text-white z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold tracking-wide">
            Photo {currentIndex + 1} of {photos.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          aria-label="Close Lightbox"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Center Image with Prev / Next */}
      <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex - 1 + photos.length) % photos.length)}
            className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
            aria-label="Previous Photo"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <img
          src={currentPhoto.image_url}
          alt={currentPhoto.title}
          className="max-h-[70vh] sm:max-h-[76vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-all"
        />

        {photos.length > 1 && (
          <button
            onClick={() => onNavigate((currentIndex + 1) % photos.length)}
            className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all cursor-pointer hover:scale-105"
            aria-label="Next Photo"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Bottom Metadata Bar */}
      <div className="max-w-3xl mx-auto w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-white">
        <div>
          <h3 className="text-base font-serif font-bold text-amber-400">
            {currentPhoto.title}
          </h3>
          {currentPhoto.caption && (
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              {currentPhoto.caption}
            </p>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-4 text-xs text-slate-400 shrink-0">
          {currentPhoto.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              {currentPhoto.location}
            </span>
          )}
          {currentPhoto.photographer && (
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-slate-400" />
              {currentPhoto.photographer}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
