import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import { AdminUser, AdminUserRole } from '../../types';
import {
  Users,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Edit,
  Trash2,
  CheckCircle2,
  Lock,
  Mail,
  FileText,
  UserCheck2,
  X
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { users, adminUser, switchUser, createUser, updateUser, deleteUser, articles } = useCms();
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    username: '',
    email: '',
    role: 'reporter',
    bio: '',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  });

  const handleOpenCreate = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      username: '',
      email: '',
      role: 'reporter',
      bio: '',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user: AdminUser) => {
    setEditingUser(user);
    setFormData(user);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username) return;

    if (editingUser) {
      await updateUser(editingUser.id, formData);
    } else {
      await createUser(formData as any);
    }
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (users.length <= 1) {
      alert('Cannot delete the last remaining administrator account.');
      return;
    }
    if (window.confirm('Remove this staff member from editorial team?')) {
      await deleteUser(id);
    }
  };

  const getRoleBadge = (role: AdminUserRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 border border-purple-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-purple-600" />
            Super Admin
          </span>
        );
      case 'editor':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            <Shield className="w-3 h-3 text-amber-600" />
            Newsroom Editor
          </span>
        );
      case 'reporter':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 border border-blue-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            <UserCheck className="w-3 h-3 text-blue-600" />
            Staff Reporter
          </span>
        );
      case 'author':
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-200 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
            <FileText className="w-3 h-3 text-emerald-600" />
            Contributor
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
              <Users className="w-5 h-5" />
            </span>
            <h1 className="font-serif font-black text-slate-900 text-xl sm:text-2xl">
              Editorial Staff &amp; Contributor Roles
            </h1>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm">
            Manage your newsroom team with defined responsibilities across reporting, drafting, and editorial review.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4 text-amber-400" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Role Switching Quick Bar */}
      <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
            {adminUser?.name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Active Logged-In User:</span>
              <span className="text-amber-900 font-extrabold">{adminUser?.name}</span>
              {adminUser?.role && getRoleBadge(adminUser.role)}
            </div>
            <div className="text-[11px] text-slate-600 mt-0.5">
              Quickly switch personas below to test contributor permissions and editorial review queues:
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {users.map((u) => {
            const isCurrent = adminUser?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  isCurrent
                    ? 'bg-[#0B192C] text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-amber-100 border border-amber-200'
                }`}
              >
                <span>{u.name.split(' ')[0]}</span>
                <span className="text-[10px] opacity-75 font-mono">({u.role})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users.map((u) => {
          const userArticlesCount = articles.filter(
            (a) => a.author_id === u.id || a.author_name === u.name
          ).length;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 transition-shadow hover:shadow-md flex flex-col justify-between ${
                adminUser?.id === u.id ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar_url}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    />
                    <div>
                      <div className="font-serif font-bold text-slate-900 text-base">{u.name}</div>
                      <div className="text-[11px] text-slate-500 font-mono">@{u.username}</div>
                    </div>
                  </div>

                  {getRoleBadge(u.role)}
                </div>

                <p className="text-slate-600 text-xs line-clamp-3 mb-4 leading-relaxed">
                  {u.bio || 'Newsroom staff member contributing to Zunheboto Social.'}
                </p>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{userArticlesCount} Published Dispatches</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => switchUser(u.id)}
                  disabled={adminUser?.id === u.id}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                    adminUser?.id === u.id
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                  }`}
                >
                  {adminUser?.id === u.id ? 'Current User' : 'Switch To This User'}
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(u)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  {users.length > 1 && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove Staff Member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Create Staff Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-serif font-bold text-slate-900 text-base sm:text-lg">
                {editingUser ? 'Edit Staff Member' : 'Add New Editorial Staff Member'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Inato Yeptho"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username *</label>
                  <input
                    type="text"
                    required
                    value={formData.username || ''}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                    placeholder="e.g. inato_editor"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. inato@zunheboto.social"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Editorial Role *</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as AdminUserRole })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white"
                  >
                    <option value="superadmin">Super Administrator (Full System Control)</option>
                    <option value="editor">Newsroom Editor (Approve &amp; Schedule)</option>
                    <option value="reporter">Staff Reporter (Draft &amp; Submit)</option>
                    <option value="author">Contributing Author (Draft &amp; Submit)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Avatar Photo URL</label>
                <input
                  type="url"
                  value={formData.avatar_url || ''}
                  onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Bio / Beat Description</label>
                <textarea
                  rows={3}
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Reporter beat, journalistic background, or community focus..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs"
                />
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
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
