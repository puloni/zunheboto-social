import React from 'react';
import { HomepageSectionConfig, ListingCategory } from '../../types';
import { Building, ShieldCheck, Phone, MapPin } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  listingCategories: ListingCategory[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const DirectoryConfigForm: React.FC<Props> = ({
  section,
  listingCategories,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 font-medium">
        <Building className="w-4 h-4 text-teal-700 shrink-0" />
        <span>
          <strong>District Directory Index:</strong> Showcases verified local businesses, guest houses, medical services, crafts, and public utilities.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Filter & Layout */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Directory Category Filter
            </label>
            <select
              value={section.directory_filter_category || 'all'}
              onChange={(e) => onUpdate({ directory_filter_category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-teal-600"
            >
              <option value="all">All Directory Categories</option>
              {listingCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Listing Filter Criteria
            </label>
            <div className="grid grid-cols-2 gap-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_filter_verified_only || false}
                  onChange={(e) => onUpdate({ directory_filter_verified_only: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Verified Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_filter_featured_only || false}
                  onChange={(e) => onUpdate({ directory_filter_featured_only: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Featured Only</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Max Listings Count
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 8, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdate({ item_limit: num, count: num })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.item_limit || 6) === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Listings
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
                { id: 'warm', label: 'Warm Tint' }
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

        {/* Right Column: Listing Card Elements & CTA */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Visible Listing Details
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_show_phone !== false}
                  onChange={(e) => onUpdate({ directory_show_phone: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Show Phone &amp; Direct Call Button</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_show_location !== false}
                  onChange={(e) => onUpdate({ directory_show_location: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Show Colony / Location Area</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_show_verified !== false}
                  onChange={(e) => onUpdate({ directory_show_verified: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Show Official Verified Badge</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.directory_show_image !== false}
                  onChange={(e) => onUpdate({ directory_show_image: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                />
                <span className="font-bold text-slate-700">Show Business Photo / Logo</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Section Title &amp; Subtitle
            </label>
            <div className="space-y-2">
              <input
                type="text"
                value={section.custom_title || section.title}
                onChange={(e) => onUpdate({ custom_title: e.target.value, title: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-teal-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Verified local businesses, hospitals, guest houses, and public services"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Directory CTA Button
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={section.cta_label || 'Show More in Directory'}
                onChange={(e) => onUpdate({ cta_label: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-teal-600"
              />
              <input
                type="text"
                value={section.cta_url || '/directory'}
                onChange={(e) => onUpdate({ cta_url: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-mono focus:outline-none focus:border-teal-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
