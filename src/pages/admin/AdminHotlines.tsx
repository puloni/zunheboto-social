import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { PhoneCall, Plus, Edit2, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { EmergencyHotline } from '../../types';

export const AdminHotlines: React.FC = () => {
  const { emergencyHotlines, createHotline, updateHotline, deleteHotline } = useCms();

  const [editingHotline, setEditingHotline] = useState<EmergencyHotline | null>(null);
  const [title, setTitle] = useState('');
  const [number, setNumber] = useState('');
  const [category, setCategory] = useState('Medical');
  const [description, setDescription] = useState('24/7 District Emergency Contact');
  const [available, setAvailable] = useState('24/7');

  const startEdit = (h: EmergencyHotline) => {
    setEditingHotline(h);
    setTitle(h.title);
    setNumber(h.number);
    setCategory(h.category);
    setDescription(h.description);
    setAvailable(h.available);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !number.trim()) return;

    if (editingHotline) {
      updateHotline(editingHotline.id, {
        title: title.trim(),
        number: number.trim(),
        category: category.trim(),
        description: description.trim(),
        available: available.trim()
      });
      setEditingHotline(null);
    } else {
      createHotline({
        title: title.trim(),
        number: number.trim(),
        category: category.trim(),
        description: description.trim(),
        available: available.trim(),
        icon: 'PhoneCall'
      });
    }

    setTitle('');
    setNumber('');
    setCategory('Medical');
    setDescription('24/7 District Emergency Contact');
    setAvailable('24/7');
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          Emergency Hotlines &amp; Helplines
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Maintain verified 24/7 emergency response numbers for the public front page.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-amber-600" />
            <span>{editingHotline ? 'Edit Emergency Hotline' : 'Add New Hotline'}</span>
          </h2>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Agency / Service Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. District Hospital Emergency"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dialing Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="108 or +91 3867..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-800"
                >
                  <option value="Medical">Medical</option>
                  <option value="Police">Police</option>
                  <option value="Fire">Fire</option>
                  <option value="Disaster">Disaster</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Availability
                </label>
                <input
                  type="text"
                  value={available}
                  onChange={(e) => setAvailable(e.target.value)}
                  placeholder="24/7 Active"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Sub-note
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief instruction..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                className="flex-1 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                {editingHotline ? 'Update Hotline' : 'Save Hotline'}
              </button>
              {editingHotline && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingHotline(null);
                    setTitle('');
                    setNumber('');
                  }}
                  className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-3">Agency</th>
                <th className="px-4 py-3">Emergency Dial Number</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Availability</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {emergencyHotlines.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-slate-900">{h.title}</div>
                    <div className="text-[11px] text-slate-400">{h.description}</div>
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-rose-700 text-sm">
                    {h.number}
                  </td>
                  <td className="px-4 py-4">
                    <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded text-[10px] uppercase">
                      {h.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-emerald-700 font-bold text-[11px]">
                    {h.available}
                  </td>
                  <td className="px-5 py-4 whitespace-nowrap text-right space-x-1">
                    <button
                      onClick={() => startEdit(h)}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove hotline for ${h.title}?`)) {
                          deleteHotline(h.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
