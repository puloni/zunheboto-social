import React, { useState, useEffect } from 'react';
import {
  Mail,
  Users,
  Download,
  Search,
  CheckCircle2,
  Trash2,
  Plus,
  FileSpreadsheet,
  FileCode,
  MapPin,
  Clock,
  RotateCcw,
  Check,
  Copy
} from 'lucide-react';
import {
  getStoredSubscribers,
  captureSubscriberEmail,
  unsubscribeEmail,
  resetMockSubscribers,
  exportSubscribersCSV,
  exportSubscribersJSON
} from '../../data/newsletterStorage';
import { NewsletterSubscriber } from '../../types';

export const AdminNewsletter: React.FC = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterColony, setFilterColony] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newColony, setNewColony] = useState('');
  const [addMsg, setAddMsg] = useState<{ text: string; error?: boolean } | null>(null);

  const [copied, setCopied] = useState(false);

  const refreshList = () => {
    setSubscribers(getStoredSubscribers());
  };

  useEffect(() => {
    refreshList();
  }, []);

  const filteredSubscribers = subscribers.filter((s) => {
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch =
      (s.email || '').toLowerCase().includes(q) ||
      (s.name ? s.name.toLowerCase().includes(q) : false) ||
      (s.colony ? s.colony.toLowerCase().includes(q) : false);

    const matchesColony = !filterColony || s.colony === filterColony;
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesColony && matchesStatus;
  });

  const activeCount = subscribers.filter((s) => s.status === 'active').length;
  const unsubCount = subscribers.filter((s) => s.status === 'unsubscribed').length;

  const coloniesList = Array.from(
    new Set(subscribers.map((s) => s.colony).filter(Boolean) as string[])
  );

  const handleAddSubscriber = (e: React.FormEvent) => {
    e.preventDefault();
    setAddMsg(null);
    try {
      const res = captureSubscriberEmail(newEmail, {
        name: newName.trim() || undefined,
        colony: newColony || undefined,
        source: 'admin_desk'
      });
      refreshList();
      setAddMsg({ text: res.message });
      setNewEmail('');
      setNewName('');
      setNewColony('');
      setTimeout(() => setShowAddModal(false), 1200);
    } catch (err: any) {
      setAddMsg({ text: err.message || 'Failed to add subscriber', error: true });
    }
  };

  const handleUnsubscribe = (email: string) => {
    if (confirm(`Unsubscribe ${email}?`)) {
      unsubscribeEmail(email);
      refreshList();
    }
  };

  const handleDownloadCsv = () => {
    const csv = exportSubscribersCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zunheboto-social-subscribers-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = () => {
    const json = exportSubscribersJSON();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `zunheboto-social-subscribers-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyEmails = () => {
    const activeEmails = subscribers
      .filter((s) => s.status === 'active')
      .map((s) => s.email)
      .join(', ');
    navigator.clipboard.writeText(activeEmails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetData = () => {
    if (confirm('Reset subscriber records to default mock dataset?')) {
      resetMockSubscribers();
      refreshList();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Stats Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Mail className="w-4 h-4" />
            <span>Mock Storage Data Registry</span>
          </div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Community emails captured from website forms, article callouts, and footers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyEmails}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Emails' : 'Copy All Active'}</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download CSV for Excel/Mailchimp"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Download JSON mock file"
          >
            <FileCode className="w-4 h-4 text-amber-600" />
            <span>Export JSON</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subscriber</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Captured</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{subscribers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Stored in mock storage file</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Active Deliverable</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{activeCount}</div>
          <div className="text-[11px] text-emerald-600 mt-1">Ready for weekly digests & alerts</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Unsubscribed</span>
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-600 mt-2">{unsubCount}</div>
          <div className="text-[11px] text-slate-400 mt-1">Opted-out readers</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by email, name, or colony..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterColony}
            onChange={(e) => setFilterColony(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="">All Colonies</option>
            {coloniesList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="unsubscribed">Unsubscribed</option>
          </select>

          <button
            onClick={handleResetData}
            title="Reset to default initial dataset"
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Subscriber</th>
                <th className="py-3.5 px-4">Colony</th>
                <th className="py-3.5 px-4">Topics / Preferences</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Date Added</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No subscribers match your search filter.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{sub.email}</div>
                      {sub.name && <div className="text-[11px] text-slate-500">{sub.name}</div>}
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.colony ? (
                        <span className="inline-flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {sub.colony}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Not specified</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {sub.preferences?.breaking_news && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px]">
                            Breaking
                          </span>
                        )}
                        {sub.preferences?.weekly_digest && (
                          <span className="bg-sky-50 text-sky-700 border border-sky-200 px-1.5 py-0.5 rounded text-[10px]">
                            Digest
                          </span>
                        )}
                        {sub.preferences?.culture_heritage && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded text-[10px]">
                            Culture
                          </span>
                        )}
                        {sub.preferences?.local_directory && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded text-[10px]">
                            Directory
                          </span>
                        )}
                        {sub.preferences?.emergency_alerts && (
                          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-1.5 py-0.5 rounded text-[10px]">
                            Emergency
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500 font-mono">
                      {sub.source || 'web_form'}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(sub.subscribed_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {sub.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Unsubscribed
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {sub.status === 'active' ? (
                        <button
                          onClick={() => handleUnsubscribe(sub.email)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                        >
                          Unsubscribe
                        </button>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Add New Subscriber</h3>
            <p className="text-xs text-slate-500 mb-4">
              Manually capture an email address to the mock storage record.
            </p>

            <form onSubmit={handleAddSubscriber} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="subscriber@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Inoli Sumi"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Colony / Locality
                </label>
                <input
                  type="text"
                  value={newColony}
                  onChange={(e) => setNewColony(e.target.value)}
                  placeholder="e.g. DC Hill"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {addMsg && (
                <div
                  className={`p-2.5 rounded-lg text-xs font-medium ${
                    addMsg.error ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {addMsg.text}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
                >
                  Save Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
