import React, { useState, useMemo } from 'react';
import { useCms } from '../../context/CmsContext';
import { ClassifiedListing, ClassifiedCategory } from '../../types';
import {
  Briefcase,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  Edit,
  Eye,
  MapPin,
  Phone,
  MessageCircle,
  ExternalLink,
  Sparkles,
  AlertCircle,
  X
} from 'lucide-react';

export const AdminClassifieds: React.FC = () => {
  const { classifieds, updateClassified, deleteClassified, createClassified } = useCms();
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'active' | 'expired'>('pending');
  const [search, setSearch] = useState('');
  const [editingItem, setEditingItem] = useState<ClassifiedListing | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<ClassifiedListing>>({
    title: '',
    category: 'jobs',
    listing_type: 'offered',
    description: '',
    price_or_salary: '',
    location: 'Zunheboto',
    contact_name: '',
    contact_phone: '',
    contact_whatsapp: '',
    contact_email: '',
    image_url: '',
    status: 'active',
    verified: true,
    featured: false
  });

  const pendingCount = classifieds.filter((c) => c.status === 'pending').length;

  const filteredListings = useMemo(() => {
    return classifieds.filter((item) => {
      const matchesTab = activeTab === 'all' || item.status === activeTab;
      const matchesSearch =
        !search ||
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.contact_name.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [classifieds, activeTab, search]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      category: 'jobs',
      listing_type: 'offered',
      description: '',
      price_or_salary: '',
      location: 'Zunheboto',
      contact_name: '',
      contact_phone: '',
      contact_whatsapp: '',
      contact_email: '',
      image_url: '',
      status: 'active',
      verified: true,
      featured: false
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: ClassifiedListing) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.contact_phone) return;

    if (editingItem) {
      await updateClassified(editingItem.id, formData);
    } else {
      await createClassified(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleApprove = async (id: string) => {
    await updateClassified(id, { status: 'active', verified: true });
  };

  const handleReject = async (id: string) => {
    await updateClassified(id, { status: 'rejected' });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this classified listing permanently?')) {
      await deleteClassified(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Briefcase className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-black text-slate-900 text-xl sm:text-2xl">
              Local Classifieds &amp; Job Board Desk
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Review public submissions, moderate community listings, and verify job postings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Add New Classified</span>
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Pending Review</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Listings
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Archive ({classifieds.length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, phone..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Listings Table / Cards */}
      {filteredListings.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <div className="font-bold text-slate-800 text-sm">No classified listings found</div>
          <div className="text-slate-500 text-xs mt-1">There are no listings matching this filter.</div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-black uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-4">Title &amp; Category</th>
                  <th className="py-3 px-4">Compensation / Price</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="capitalize text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200/50">
                          {item.category}
                        </span>
                        <span className="text-[10px] text-slate-500 uppercase font-mono">
                          {item.listing_type}
                        </span>
                        {item.featured && (
                          <span className="bg-amber-400 text-slate-950 text-[9px] font-black uppercase px-1.5 py-0.2 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-emerald-700">
                      {item.price_or_salary || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[140px]">{item.location}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="font-medium text-slate-900">{item.contact_name}</div>
                      <div className="text-[11px] text-slate-500">{item.contact_phone}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {item.status === 'active' && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                      {item.status === 'pending' && (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Pending Review</span>
                        </span>
                      )}
                      {item.status === 'rejected' && (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                      {item.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <span>Expired</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(item.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Approve & Publish"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(item.id)}
                              className="px-2.5 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              title="Reject"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                {editingItem ? 'Edit Classified Listing' : 'Create New Classified'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="jobs">Jobs &amp; Employment</option>
                    <option value="rentals">House Rentals</option>
                    <option value="vehicles">Vehicles &amp; Auto</option>
                    <option value="marketplace">Marketplace</option>
                    <option value="documents">Notices / Documents</option>
                    <option value="services">Local Services</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="active">Active (Visible)</option>
                    <option value="pending">Pending Review</option>
                    <option value="expired">Expired</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Price / Salary</label>
                  <input
                    type="text"
                    value={formData.price_or_salary || ''}
                    onChange={(e) => setFormData({ ...formData, price_or_salary: e.target.value })}
                    placeholder="e.g. ₹25,000/mo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={formData.contact_name || ''}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    required
                    value={formData.contact_phone || ''}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  value={formData.image_url || ''}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured || false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="rounded text-amber-500"
                  />
                  <span className="font-semibold text-slate-700">Feature this listing on top</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.verified || false}
                    onChange={(e) => setFormData({ ...formData, verified: e.target.checked })}
                    className="rounded text-emerald-500"
                  />
                  <span className="font-semibold text-slate-700">Verified Listing</span>
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
                  Save Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
