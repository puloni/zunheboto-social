import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { Send, Trash2, Mail, Phone, MapPin, CheckCircle2, Clock, Archive } from 'lucide-react';
import { NewsTip } from '../../types';

export const AdminNewsTips: React.FC = () => {
  const { newsTips, updateNewsTipStatus, deleteNewsTip } = useCms();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = newsTips.filter((t) =>
    filterStatus === 'all' ? true : t.status === filterStatus
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            Citizen News Tips &amp; Whistleblower Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review community leads, investigative tips, and event updates sent by Zunheboto residents.
          </p>
        </div>

        <div className="flex gap-2">
          {['all', 'unread', 'in_review', 'published', 'archived'].map((statusKey) => (
            <button
              key={statusKey}
              onClick={() => setFilterStatus(statusKey)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                filterStatus === statusKey
                  ? 'bg-[#0B192C] text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {statusKey.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
            No news tips in this queue.
          </div>
        ) : (
          filtered.map((tip) => (
            <div
              key={tip.id}
              className={`p-6 bg-white rounded-2xl border transition-all shadow-2xs space-y-4 ${
                tip.status === 'unread'
                  ? 'border-amber-400/80 bg-amber-50/20'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-slate-900">{tip.sender_name}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      tip.status === 'unread'
                        ? 'bg-amber-100 text-amber-800'
                        : tip.status === 'in_review'
                        ? 'bg-blue-100 text-blue-800'
                        : tip.status === 'published'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tip.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="text-xs text-slate-400">
                  Received on {new Date(tip.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>

              {/* Coordinates info */}
              <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                {tip.sender_contact && (
                  <div className="flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tip.sender_contact}</span>
                  </div>
                )}
                {tip.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{tip.location}</span>
                  </div>
                )}
              </div>

              {/* Message Body */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm text-slate-800 leading-relaxed font-serif">
                "{tip.message}"
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">Status:</span>
                  <select
                    value={tip.status}
                    onChange={(e) => updateNewsTipStatus(tip.id, e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                  >
                    <option value="unread">Unread</option>
                    <option value="in_review">In Review (Investigating)</option>
                    <option value="published">Converted into Story</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (confirm('Delete this tip report?')) {
                      deleteNewsTip(tip.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors flex items-center gap-1 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Tip</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
