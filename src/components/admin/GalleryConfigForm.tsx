import React from 'react';
import { HomepageSectionConfig, GalleryPhoto } from '../../types';
import { Camera, Image as ImageIcon, Sparkles } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  photos: GalleryPhoto[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const GalleryConfigForm: React.FC<Props> = ({
  section,
  photos,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 font-medium">
        <Camera className="w-4 h-4 text-purple-600 shrink-0" />
        <span>
          <strong>Zunheboto in Pictures Gallery:</strong> Displays visual photography highlights from the district media gallery with full lightbox popup support.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Grid Layout & Count */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Number of Images to Display ({photos.length} Available in Media)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[4, 6, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdate({ item_limit: num, count: num })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.item_limit || 8) === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Photos
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Grid Desktop Columns
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[2, 3, 4, 5].map((cols) => (
                <button
                  key={cols}
                  type="button"
                  onClick={() => onUpdate({ columns: cols, gallery_columns: cols })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.columns || section.gallery_columns || 4) === cols
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cols} Columns
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Photo Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'square', label: '1:1 Square' },
                { id: 'landscape', label: '16:10 Landscape' },
                { id: 'video', label: '16:9 Wide' }
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onUpdate({ gallery_aspect_ratio: r.id as any })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.gallery_aspect_ratio || 'square') === r.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Container Background
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'slate', label: 'Soft Slate (Default)' },
                { id: 'default', label: 'Clean White' },
                { id: 'dark', label: 'Deep Navy' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'slate') === b.id
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

        {/* Right Column: Lightbox, Captions & CTA */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Interactive Gallery Features
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.gallery_lightbox !== false}
                  onChange={(e) => onUpdate({ gallery_lightbox: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-bold text-slate-800">Fullscreen Lightbox Viewer</div>
                  <div className="text-[11px] text-slate-500">Opens high-res photo modal on thumbnail tap</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.gallery_show_captions !== false}
                  onChange={(e) => onUpdate({ gallery_show_captions: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-bold text-slate-800">Show Titles &amp; Location on Hover</div>
                  <div className="text-[11px] text-slate-500">Displays hill/town location pin overlay</div>
                </div>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.gallery_show_credits !== false}
                  onChange={(e) => onUpdate({ gallery_show_credits: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <div>
                  <div className="font-bold text-slate-800">Photographer Credits</div>
                  <div className="text-[11px] text-slate-500">Credits local photojournalists</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Header &amp; Subtitle
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={section.custom_title || section.title}
                onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Visual moments captured across town colonies..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Gallery Archive Button
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'View Complete Gallery'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-purple-600"
              />
              <input
                type="text"
                value={section.cta_url || '/gallery'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
