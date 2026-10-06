import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink, Link2 } from 'lucide-react';
import { MenuItem } from '../../types';

export const AdminMenus: React.FC = () => {
  const { menuItems, createMenuItem, updateMenuItem, deleteMenuItem, reorderMenuItems } = useCms();

  const [activeLocation, setActiveLocation] = useState<'header' | 'footer'>('header');
  const [label, setLabel] = useState('');
  const [url, setUrl] = useState('/');
  const [target, setTarget] = useState<'_self' | '_blank'>('_self');

  const filteredItems = menuItems
    .filter((m) => m.location === activeLocation)
    .sort((a, b) => a.order_index - b.order_index);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !url.trim()) return;

    createMenuItem({
      label: label.trim(),
      url: url.trim(),
      location: activeLocation,
      target
    });

    setLabel('');
    setUrl('/');
    setTarget('_self');
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    reorderMenuItems(activeLocation, index, index - 1);
  };

  const handleMoveDown = (index: number) => {
    if (index >= filteredItems.length - 1) return;
    reorderMenuItems(activeLocation, index, index + 1);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          Navigation Menus
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure links appearing in the top masthead and footer columns.
        </p>
      </div>

      {/* Location Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveLocation('header')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeLocation === 'header'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Header Navigation ({menuItems.filter((m) => m.location === 'header').length})
        </button>
        <button
          onClick={() => setActiveLocation('footer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
            activeLocation === 'footer'
              ? 'bg-[#0B192C] text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          Footer Navigation ({menuItems.filter((m) => m.location === 'footer').length})
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form to Add Link */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-600" />
            <span>Add Link to {activeLocation === 'header' ? 'Header' : 'Footer'}</span>
          </h2>

          <form onSubmit={handleAdd} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Menu Label <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Directory"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Destination URL / Path <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="/directory or https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Open In
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-700"
              >
                <option value="_self">Same Tab (_self)</option>
                <option value="_blank">New Tab (_blank)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
            >
              Add Link to Menu
            </button>
          </form>
        </div>

        {/* Existing Links List */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 shadow-2xs overflow-hidden">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {item.label}
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate">
                    {item.url} {item.target === '_blank' && '(New Tab)'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveUp(idx)}
                    className="p-1 hover:bg-slate-200 disabled:opacity-30 text-slate-700 cursor-pointer"
                    title="Move Up"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === filteredItems.length - 1}
                    onClick={() => handleMoveDown(idx)}
                    className="p-1 hover:bg-slate-200 disabled:opacity-30 text-slate-700 border-l border-slate-200 cursor-pointer"
                    title="Move Down"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => deleteMenuItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                  title="Remove Link"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
