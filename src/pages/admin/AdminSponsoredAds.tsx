import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { SponsoredCampaign, AdPlacement } from '../../types';
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Eye,
  MousePointerClick,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  X
} from 'lucide-react';

export const AdminSponsoredAds: React.FC = () => {
  const { sponsoredAds, createSponsoredAd, updateSponsoredAd, deleteSponsoredAd, toggleSponsoredAd } = useCms();
  const [editingAd, setEditingAd] = useState<SponsoredCampaign | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<SponsoredCampaign>>({
    title: '',
    sponsor_name: '',
    placement: 'leaderboard_top',
    image_url: '',
    destination_url: '',
    badge_text: 'Sponsored',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    active: true
  });

  const handleOpenCreate = () => {
    setEditingAd(null);
    setFormData({
      title: '',
      sponsor_name: '',
      placement: 'leaderboard_top',
      image_url: '',
      destination_url: '',
      badge_text: 'Sponsored',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      active: true
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (ad: SponsoredCampaign) => {
    setEditingAd(ad);
    setFormData(ad);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.image_url) return;

    if (editingAd) {
      await updateSponsoredAd(editingAd.id, formData);
    } else {
      await createSponsoredAd(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this sponsored ad campaign?')) {
      await deleteSponsoredAd(id);
    }
  };

  const getPlacementLabel = (p: AdPlacement) => {
    switch (p) {
      case 'leaderboard_top':
        return 'Top Leaderboard (Homepage)';
      case 'sidebar_rect':
        return 'Sidebar Medium Rectangle';
      case 'article_mid':
        return 'In-Article Mid-Roll';
      case 'footer_banner':
        return 'Footer Banner';
      default:
        return p;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-black text-slate-900 text-xl sm:text-2xl">
              Sponsored Content &amp; Native Banner Engine
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Manage local partner promotions, custom banners, target links, and real-time impression/click metrics.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>New Ad Campaign</span>
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sponsoredAds.map((ad) => {
          const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0';

          return (
            <div
              key={ad.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Banner Thumbnail Preview */}
                <div className="h-36 w-full relative bg-slate-900 overflow-hidden">
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded">
                    {ad.badge_text || 'Sponsored'}
                  </div>
                  <div className="absolute top-2.5 right-2.5">
                    <button
                      onClick={() => toggleSponsoredAd(ad.id)}
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shadow-xs cursor-pointer transition-colors ${
                        ad.active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {ad.active ? 'Active' : 'Paused'}
                    </button>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-0.5">
                      {getPlacementLabel(ad.placement)}
                    </div>
                    <h3 className="font-serif font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {ad.title}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      Sponsor: <span className="text-slate-800 font-semibold">{ad.sponsor_name}</span>
                    </div>
                  </div>

                  {ad.destination_url && (
                    <a
                      href={ad.destination_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-medium truncate max-w-full"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      <span className="truncate">{ad.destination_url}</span>
                    </a>
                  )}

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Impressions</div>
                      <div className="font-bold text-slate-900 text-sm">{ad.impressions.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">Clicks</div>
                      <div className="font-bold text-emerald-700 text-sm">{ad.clicks.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase">CTR</div>
                      <div className="font-bold text-blue-700 text-sm">{ctr}%</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {ad.start_date} to {ad.end_date}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => toggleSponsoredAd(ad.id)}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  {ad.active ? 'Pause Campaign' : 'Resume Campaign'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(ad)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                    title="Edit Campaign"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ad.id)}
                    className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Campaign"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                {editingAd ? 'Edit Ad Campaign' : 'Create New Sponsored Campaign'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Campaign Headline *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Cornerstone Academy Admissions 2026"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Sponsor / Business Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.sponsor_name || ''}
                    onChange={(e) => setFormData({ ...formData, sponsor_name: e.target.value })}
                    placeholder="e.g. Apex Motors Zunheboto"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Placement Slot</label>
                  <select
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="leaderboard_top">Homepage Top Leaderboard</option>
                    <option value="sidebar_rect">Sidebar Medium Rectangle</option>
                    <option value="article_mid">Article Mid-Roll</option>
                    <option value="footer_banner">Footer Banner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Banner Image URL *</label>
                <input
                  type="url"
                  required
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://images.unsplash.com/... or /uploads/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Destination Click URL</label>
                <input
                  type="text"
                  value={formData.destination_url || ''}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  placeholder="https://... or tel:+91... or https://wa.me/..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={formData.badge_text || 'Sponsored'}
                    onChange={(e) => setFormData({ ...formData, badge_text: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date || ''}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date || ''}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active || false}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-bold text-slate-700">Campaign Active &amp; Live</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold cursor-pointer"
                >
                  Save Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
