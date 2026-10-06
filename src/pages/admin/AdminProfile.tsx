import React, { useState, useRef, useEffect } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  User,
  Lock,
  ShieldCheck,
  CheckCircle2,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { MediaPickerModal } from '../../components/MediaPickerModal';

export const AdminProfile: React.FC = () => {
  const { adminUser, updateAdminProfile } = useCms();

  const [name, setName] = useState(adminUser?.name || 'Khekato Chishi');
  const [displayName, setDisplayName] = useState(adminUser?.display_name || adminUser?.name || 'Khekato Chishi');
  const [email, setEmail] = useState(adminUser?.email || 'admin@zunheboto.social');
  const [bio, setBio] = useState(
    adminUser?.bio ||
      'Editor-in-Chief and community advocate rooted in Zunheboto. Dedicated to empowering local voices and preserving district heritage.'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    adminUser?.avatar_url ||
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  );
  const [role, setRole] = useState<'superadmin' | 'editor'>(adminUser?.role || 'superadmin');

  // Social profiles
  const [twitter, setTwitter] = useState(adminUser?.social_twitter || '');
  const [facebook, setFacebook] = useState(adminUser?.social_facebook || '');
  const [linkedin, setLinkedin] = useState(adminUser?.social_linkedin || '');
  const [website, setWebsite] = useState(adminUser?.social_website || '');

  // Password fields
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever adminUser hydrates or changes
  useEffect(() => {
    if (adminUser) {
      setName(adminUser.name || '');
      setDisplayName(adminUser.display_name || adminUser.name || '');
      setEmail(adminUser.email || '');
      setBio(adminUser.bio || '');
      setAvatarUrl(adminUser.avatar_url || '');
      setRole(adminUser.role || 'superadmin');
      setTwitter(adminUser.social_twitter || '');
      setFacebook(adminUser.social_facebook || '');
      setLinkedin(adminUser.social_linkedin || '');
      setWebsite(adminUser.social_website || '');
    }
  }, [adminUser]);

  // Profile image upload handler with server persistence
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate mime type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid file format. Please upload a JPEG, PNG, WEBP, or GIF image.');
      return;
    }

    // Validate size (max 5MB)
    const MAX_SIZE_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE_BYTES) {
      setError('File is too large. Profile photos must be under 5MB.');
      return;
    }

    setError('');
    setIsUploadingPhoto(true);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload file directly to backend storage (/uploads/ directory)
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name || 'admin_avatar.jpg',
          dataUrl,
          title: `Admin Profile Avatar - ${name || 'Administrator'}`,
          caption: 'Administrator Profile Photo'
        })
      });

      if (res.ok) {
        const json = await res.json();
        const uploadedUrl = json.url || json.item?.url;
        if (uploadedUrl) {
          setAvatarUrl(uploadedUrl);
          setIsUploadingPhoto(false);
          return;
        }
      }

      // Fallback to dataUrl if upload endpoint is unavailable
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      console.warn('Direct media upload failed, fallback to preview:', err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const res = await updateAdminProfile({
        name: name.trim(),
        display_name: displayName.trim() || name.trim(),
        email: email.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl,
        role,
        social_twitter: twitter.trim() || undefined,
        social_facebook: facebook.trim() || undefined,
        social_linkedin: linkedin.trim() || undefined,
        social_website: website.trim() || undefined,
        password: newPassword || undefined
      });

      if (res && res.success === false) {
        throw new Error('Failed to save profile updates to server.');
      }

      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err: any) {
      console.error('Failed to update admin profile:', err);
      setError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 font-sans">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          Administrator &amp; Author Profile
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure editorial byline credentials, author photo, public bio, social channels, and security.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully! Byline changes will reflect across all authored chronicles.</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-100 border border-rose-300 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Photo Section */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-600" />
            <span>Author Portrait &amp; Avatar</span>
          </h2>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <img
                src={avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                alt={name}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-slate-200 shadow-xs group-hover:border-amber-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold cursor-pointer"
              >
                Change Photo
              </button>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Upload a high-resolution square photo
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Supports JPG, PNG, WEBP or GIF under 5MB. Displayed on public story bylines and author archive pages.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploadingPhoto}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingPhoto ? 'Uploading Photo...' : 'Upload File'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold rounded-lg border border-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
                  <span>Select from Media Library</span>
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="px-2.5 py-1.5 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-amber-600" />
            <span>Editorial Identity</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Byline / Display Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Khekato Chishi"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Username (Read-Only)
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={adminUser?.username || 'admin'}
                className="w-full px-3 py-2 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Editorial Role / Title
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              >
                <option value="superadmin">Editor-in-Chief (Super Administrator)</option>
                <option value="editor">Staff Journalist &amp; Contributor</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Contact / Byline Email <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Public Bio &amp; Editorial Mission Statement
            </label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write a brief author biography..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              This bio appears under your story bylines, in author cards, and on your public author archive page.
            </p>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-600" />
            <span>Author Social Channels &amp; Coordinates</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Twitter className="w-3.5 h-3.5 text-slate-500" />
                <span>X / Twitter URL</span>
              </label>
              <input
                type="url"
                value={twitter}
                onChange={(e) => setTwitter(e.target.value)}
                placeholder="https://twitter.com/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Facebook className="w-3.5 h-3.5 text-blue-600" />
                <span>Facebook Profile URL</span>
              </label>
              <input
                type="url"
                value={facebook}
                onChange={(e) => setFacebook(e.target.value)}
                placeholder="https://facebook.com/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Linkedin className="w-3.5 h-3.5 text-blue-700" />
                <span>LinkedIn Profile URL</span>
              </label>
              <input
                type="url"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>Personal Website or Portfolio</span>
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" />
            <span>Change Master Password</span>
          </h2>
          <p className="text-xs text-slate-500">
            Leave blank if you do not wish to update your administrator access credentials.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs transition-colors shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-amber-400" />
                <span>Save Profile &amp; Byline</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <MediaPickerModal
          onSelect={(url) => {
            setAvatarUrl(url);
            setMediaPickerOpen(false);
          }}
          onClose={() => setMediaPickerOpen(false)}
        />
      )}
    </div>
  );
};
