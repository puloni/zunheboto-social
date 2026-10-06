import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  Settings,
  Globe,
  Upload,
  Image as ImageIcon,
  Save,
  Download,
  Database,
  FileCode,
  Shield,
  RefreshCw,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { AdminStorageSettings } from './AdminStorageSettings';
import { AdminWeatherSettings } from '../../components/admin/AdminWeatherSettings';

interface AdminSettingsProps {
  initialTab?: 'general' | 'branding' | 'contact' | 'social' | 'seo' | 'backup' | 'storage' | 'weather';
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ initialTab = 'general' }) => {
  const {
    settings,
    updateSettings,
    downloadPhpZip,
    exportSqlDatabase,
    exportJsonBackup,
    resetToFactoryDefaults
  } = useCms();

  const [activeTab, setActiveTab] = useState<'general' | 'branding' | 'contact' | 'social' | 'seo' | 'backup' | 'storage' | 'weather'>(initialTab);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<'logo' | 'favicon' | 'og_image' | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form local state
  const [formData, setFormData] = useState({ ...settings });

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    try {
      await updateSettings(formData);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error('Failed to save settings:', err);
      setSaveError(err?.message || 'Failed to save settings to server. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    await downloadPhpZip();
    setDownloadingZip(false);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
            Site Settings &amp; Configuration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Branding, logos, contact channels, SEO tags, and database backup exports.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'general', label: 'General Info' },
          { id: 'branding', label: 'Logo & Identity' },
          { id: 'weather', label: 'Weather Desk & Location' },
          { id: 'contact', label: 'Contact Coordinates' },
          { id: 'social', label: 'Social Networks' },
          { id: 'seo', label: 'SEO & Meta Tags' },
          { id: 'storage', label: 'Database & Storage' },
          { id: 'backup', label: 'Deployment & Export' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#0B192C] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'storage' && (
        <AdminStorageSettings />
      )}

      {activeTab === 'weather' && (
        <AdminWeatherSettings />
      )}

      <form onSubmit={handleSave} className={`space-y-6 ${activeTab === 'storage' || activeTab === 'weather' ? 'hidden' : ''}`}>
        {/* General Tab */}
        {activeTab === 'general' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              General Publication Settings
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website Name / Title
              </label>
              <input
                type="text"
                value={formData.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tagline / Motto
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Site Description / Bio
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Production Site URL
              </label>
              <input
                type="url"
                value={formData.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        )}

        {/* Branding Tab */}
        {activeTab === 'branding' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Logo, Favicon &amp; Color Scheme
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Logo */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Header Logo Image
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget('logo')}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Select Media
                  </button>
                </div>

                {formData.logo_url ? (
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                      <img
                        src={formData.logo_url}
                        alt="Logo"
                        className="max-h-16 object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('logo_url', '')}
                      className="text-[11px] text-rose-600 font-semibold"
                    >
                      Remove Logo (Use text title instead)
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setMediaPickerTarget('logo')}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-400 cursor-pointer"
                  >
                    Click to select logo file
                  </div>
                )}
              </div>

              {/* Favicon */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Browser Favicon URL
                  </label>
                  <button
                    type="button"
                    onClick={() => setMediaPickerTarget('favicon')}
                    className="text-xs text-amber-700 font-bold hover:underline"
                  >
                    Select Media
                  </button>
                </div>

                {formData.favicon_url ? (
                  <div className="space-y-2">
                    <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-center">
                      <img
                        src={formData.favicon_url}
                        alt="Favicon"
                        className="w-8 h-8 object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('favicon_url', '');
                        handleChange('site_icon_url', '');
                      }}
                      className="text-[11px] text-rose-600 font-semibold"
                    >
                      Remove Favicon
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => setMediaPickerTarget('favicon')}
                    className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-xs text-slate-400 cursor-pointer"
                  >
                    Click to select favicon file
                  </div>
                )}
              </div>
            </div>

            {/* Responsive Logo Sizing Controls */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="pb-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-slate-800">
                  Responsive Logo Display Sizing
                </h3>
                <p className="text-[11px] text-slate-500">
                  Configure maximum rendered logo height for desktop screens and mobile devices. Aspect ratio is preserved automatically.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Desktop Max Height
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {formData.logo_height_desktop || 60}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={28}
                    max={96}
                    step={2}
                    value={formData.logo_height_desktop || 60}
                    onChange={(e) => handleChange('logo_height_desktop', parseInt(e.target.value, 10))}
                    className="w-full accent-[#0B192C] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>28px (Compact)</span>
                    <span>Default: 60px</span>
                    <span>96px (Prominent)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      Mobile &amp; Small Tablet Max Height
                    </label>
                    <span className="text-xs font-mono font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                      {formData.logo_height_mobile || 44}px
                    </span>
                  </div>
                  <input
                    type="range"
                    min={20}
                    max={64}
                    step={2}
                    value={formData.logo_height_mobile || 44}
                    onChange={(e) => handleChange('logo_height_mobile', parseInt(e.target.value, 10))}
                    className="w-full accent-[#0B192C] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>20px (Compact)</span>
                    <span>Default: 44px</span>
                    <span>64px (Large)</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Primary Theme Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => handleChange('primary_color', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Accent Highlights Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="w-8 h-8 rounded border border-slate-300 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => handleChange('accent_color', e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Automated Photo Watermarking */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-800">
                    Automated Photo Watermarking
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Safeguard community photography from unauthorized scraping with an automatic subtle watermark overlay on media uploads.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.watermark_enabled !== false}
                    onChange={(e) => handleChange('watermark_enabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0B192C]"></div>
                </label>
              </div>

              {formData.watermark_enabled !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Watermark Brand Name
                    </label>
                    <input
                      type="text"
                      value={formData.watermark_text || 'Zunheboto Social'}
                      onChange={(e) => handleChange('watermark_text', e.target.value)}
                      placeholder="e.g. Zunheboto Social"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Watermark Subtitle
                    </label>
                    <input
                      type="text"
                      value={formData.watermark_subtext || 'Press & Archive'}
                      onChange={(e) => handleChange('watermark_subtext', e.target.value)}
                      placeholder="e.g. Press & Archive"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Coordinates Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              District Editorial Contact Info
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Email Address
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Editorial Phone Number
                </label>
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                District Office Address
              </label>
              <textarea
                rows={2}
                value={formData.contact_address}
                onChange={(e) => handleChange('contact_address', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        )}

        {/* Social Networks Tab */}
        {activeTab === 'social' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Official Social Media &amp; Community Channels
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Facebook Page URL
                </label>
                <input
                  type="url"
                  value={formData.facebook_url}
                  onChange={(e) => handleChange('facebook_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Twitter / X Profile URL
                </label>
                <input
                  type="url"
                  value={formData.twitter_url}
                  onChange={(e) => handleChange('twitter_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instagram Handle URL
                </label>
                <input
                  type="url"
                  value={formData.instagram_url}
                  onChange={(e) => handleChange('instagram_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  YouTube Channel URL
                </label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => handleChange('youtube_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Community / Channel Link
                </label>
                <input
                  type="url"
                  value={formData.whatsapp_url}
                  onChange={(e) => handleChange('whatsapp_url', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
              </div>
            </div>
          </div>
        )}

        {/* SEO & Meta Tags Tab */}
        {activeTab === 'seo' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Search Engine Optimization (SEO) &amp; OpenGraph
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Global SEO Title
              </label>
              <input
                type="text"
                value={formData.seo_title}
                onChange={(e) => handleChange('seo_title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Global Meta Description
              </label>
              <textarea
                rows={2}
                value={formData.seo_description}
                onChange={(e) => handleChange('seo_description', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Canonical Production Site URL
              </label>
              <input
                type="url"
                value={formData.site_url}
                onChange={(e) => handleChange('site_url', e.target.value)}
                placeholder="https://zunheboto.social"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
              <p className="text-[11px] text-slate-400 mt-0.5">
                Used to construct absolute canonical link tags and Open Graph og:url metadata across all pages.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Social Share Image (og:image) URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={formData.social_image_url || ''}
                  onChange={(e) => handleChange('social_image_url', e.target.value)}
                  placeholder="https://.../og-banner.jpg"
                  className="flex-1 px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                />
                <button
                  type="button"
                  onClick={() => setMediaPickerTarget('og_image')}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors shrink-0 cursor-pointer"
                >
                  Media Library
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Default fallback banner displayed when pages or categories without featured images are shared on social platforms.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Analytics / Tracking Measurement ID (e.g. G-XXXXXX)
              </label>
              <input
                type="text"
                value={formData.google_analytics_id}
                onChange={(e) => handleChange('google_analytics_id', e.target.value)}
                placeholder="G-..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Custom Head Scripts <span className="text-slate-400 font-normal">(Injected into &lt;head&gt;)</span>
              </label>
              <textarea
                rows={3}
                value={formData.custom_head_scripts}
                onChange={(e) => handleChange('custom_head_scripts', e.target.value)}
                placeholder="<!-- Custom verification tags or scripts -->"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
              />
            </div>
          </div>
        )}

        {/* Deployment & Export Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                Production Deployment &amp; Complete Source Archive
              </h2>

              <div className="p-4 bg-gradient-to-r from-[#0B192C] to-[#1E2A38] text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-amber-400">
                    Standalone PHP 8.2+ Project ZIP
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Self-contained package with clean PHP, PDO, installer wizard, htaccess, public pages and admin CMS.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingZip ? 'Generating ZIP...' : 'Download Full ZIP'}</span>
                </button>
              </div>

              {/* Homepage ZIP Download Toggle Control */}
              <div className="p-4 rounded-xl border border-amber-300/80 bg-amber-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Download className="w-4 h-4 text-amber-600" />
                    <span>Public Homepage ZIP Download Option</span>
                    {formData.footer_show_zip_download !== false ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Visible on Homepage
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 max-w-xl leading-relaxed">
                    Shows a ready-to-deploy ZIP package download button below the copyright notice on the public website. Turn this off after your server installation is completed.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.footer_show_zip_download !== false}
                    onChange={(e) => {
                      const val = e.target.checked;
                      handleChange('footer_show_zip_download', val);
                      updateSettings({ footer_show_zip_download: val });
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2000);
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      <span>Export SQL Database Dump</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Download complete MySQL schema and pre-populated district records table inserts.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportSqlDatabase}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Download schema.sql
                  </button>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-blue-600" />
                      <span>Export JSON Content Snapshot</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Backup entire CMS dataset (articles, directory, settings, menus) as clean JSON.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={exportJsonBackup}
                    className="w-full py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                  >
                    Download backup.json
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-rose-700">
                    Reset to Factory Seed Data
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Restores default sample articles and directory records for Zunheboto.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Are you sure you want to reset all CMS data to default factory seed records?')) {
                      resetToFactoryDefaults();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset Defaults
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global Save Button */}
        {activeTab !== 'backup' && activeTab !== 'storage' && (
          <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-3">
            {saveError ? (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{saveError}</span>
              </div>
            ) : <div />}
            <button
              type="submit"
              disabled={isSaving}
              className="px-8 py-3 bg-[#0B192C] hover:bg-[#1E2A38] text-white font-bold rounded-xl text-xs transition-colors shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Save Configuration</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>

      {/* Media Picker Modal for Logo / Favicon / Social Image */}
      <MediaPickerModal
        isOpen={mediaPickerTarget !== null}
        onClose={() => setMediaPickerTarget(null)}
        onSelect={(url) => {
          if (mediaPickerTarget === 'logo') handleChange('logo_url', url);
          if (mediaPickerTarget === 'favicon') {
            handleChange('favicon_url', url);
            handleChange('site_icon_url', url);
          }
          if (mediaPickerTarget === 'og_image') handleChange('social_image_url', url);
        }}
        title={`Select ${mediaPickerTarget === 'logo' ? 'Logo' : mediaPickerTarget === 'favicon' ? 'Favicon' : 'Social Share Image'} File`}
      />
    </div>
  );
};
