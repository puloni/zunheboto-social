import React from 'react';
import { HomepageSectionConfig, EmergencyHotline } from '../../types';
import { ShieldAlert, Phone } from 'lucide-react';

interface Props {
  section: HomepageSectionConfig;
  hotlines: EmergencyHotline[];
  onUpdate: (data: Partial<HomepageSectionConfig>) => void;
}

export const EmergencyHotlinesConfigForm: React.FC<Props> = ({
  section,
  hotlines,
  onUpdate
}) => {
  return (
    <div className="space-y-6 bg-slate-50/70 p-6 rounded-2xl border border-slate-200 text-xs">
      <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 font-medium">
        <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
        <span>
          <strong>District Emergency Hotlines:</strong> Displays 24/7 direct tap-to-call contact numbers for Police, Hospitals, Fire, and Disaster Management.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Filter & Count */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Hotlines Category Filter
            </label>
            <select
              value={section.hotlines_category || 'all'}
              onChange={(e) => onUpdate({ hotlines_category: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:border-rose-600"
            >
              <option value="all">All Emergency Categories ({hotlines.length} Active Hotlines)</option>
              <option value="police">Police &amp; Law Enforcement</option>
              <option value="hospital">Hospitals &amp; Medical Emergency</option>
              <option value="fire">Fire &amp; Rescue Services</option>
              <option value="disaster">Disaster &amp; Landslide Relief</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Max Hotlines to Display
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[3, 6, 9, 12].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => onUpdate({ hotlines_max_count: num, item_limit: num })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.hotlines_max_count || 6) === num
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {num} Hotlines
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-1.5">
              Sort Order
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'priority', label: 'Priority Order' },
                { id: 'alphabetical', label: 'Alphabetical' }
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onUpdate({ hotlines_sort: s.id as any })}
                  className={`py-2 rounded-lg border font-bold text-center cursor-pointer transition-colors ${
                    (section.hotlines_sort || 'priority') === s.id
                      ? 'bg-[#0B192C] text-white border-[#0B192C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {s.label}
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
                { id: 'default', label: 'Clean White' },
                { id: 'slate', label: 'Soft Slate' },
                { id: 'warm', label: 'Warm Tint' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => onUpdate({ background_style: b.id as any })}
                  className={`px-3 py-2 rounded-lg border text-center font-bold cursor-pointer transition-colors ${
                    (section.background_style || 'default') === b.id
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

        {/* Right Column: Title & Features */}
        <div className="space-y-4">
          <div>
            <label className="block font-bold text-slate-800 uppercase tracking-wider mb-2">
              Visible Hotline Controls
            </label>
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.hotlines_show_call_button !== false}
                  onChange={(e) => onUpdate({ hotlines_show_call_button: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-700">Display 1-Tap "Call Now" Action Button</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.hotlines_show_icons !== false}
                  onChange={(e) => onUpdate({ hotlines_show_icons: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-700">Display Service Type Icons (Police / Medical / Fire)</span>
              </label>

              <label className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.hotlines_show_phone !== false}
                  onChange={(e) => onUpdate({ hotlines_show_phone: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="font-bold text-slate-700">Display Clear Phone Number String</span>
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
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold focus:outline-none focus:border-rose-600"
              />
              <input
                type="text"
                value={section.subtitle || ''}
                onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="Direct 24/7 emergency response numbers for Zunheboto town & surrounding blocks"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:border-rose-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
