import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  PanelBottom,
  Image as ImageIcon,
  Upload,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  CheckCircle2,
  Globe,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageSquare,
  Sparkles,
  Link as LinkIcon,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { MediaPickerModal } from '../../components/MediaPickerModal';
import { Footer } from '../../components/Footer';
import { MenuItem } from '../../types';

export const AdminFooter: React.FC = () => {
  const {
    settings,
    updateSettings,
    menuItems,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    reorderMenuItems,
    pages,
    articleCategories,
    navigateTo
  } = useCms();

  const [activeTab, setActiveTab] = useState<'branding' | 'contact' | 'social' | 'navigation' | 'copyright' | 'visibility' | 'preview'>('branding');
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Form local state for settings
  const [formData, setFormData] = useState({
    site_name: settings.site_name || '',
    footer_logo_url: settings.footer_logo_url || '',
    footer_tagline: settings.footer_tagline || settings.tagline || '',
    footer_about_text: settings.footer_about_text || settings.footer_branding_text || '',
    contact_email: settings.contact_email || '',
    contact_phone: settings.contact_phone || '',
    contact_address: settings.contact_address || '',
    social_facebook: settings.social_facebook || '',
    social_twitter: settings.social_twitter || '',
    social_instagram: settings.social_instagram || '',
    social_youtube: settings.social_youtube || '',
    social_whatsapp: settings.social_whatsapp || '',
    copyright_text: settings.copyright_text || '',
    footer_copyright_year: settings.footer_copyright_year || '2026',
    footer_note: settings.footer_note || '',
    footer_show_newsletter: settings.footer_show_newsletter !== false,
    footer_show_hotlines: settings.footer_show_hotlines !== false,
    footer_show_contact: settings.footer_show_contact !== false,
    footer_show_social: settings.footer_show_social !== false,
    footer_show_nav: settings.footer_show_nav !== false,
    footer_show_branding: settings.footer_show_branding !== false,
    footer_show_copyright: settings.footer_show_copyright !== false,
    footer_show_legal_links: settings.footer_show_legal_links !== false,
    footer_show_zip_download: settings.footer_show_zip_download !== false
  });

  // Footer menu items from CMS
  const footerMenus = menuItems
    .filter((m) => m.menu_group === 'footer' || m.location === 'footer')
    .sort((a, b) => (a.order || a.order_index || 0) - (b.order || b.order_index || 0));

  // State for new footer menu item form
  const [newMenuLabel, setNewMenuLabel] = useState('');
  const [newMenuUrlType, setNewMenuUrlType] = useState<'page' | 'category' | 'directory' | 'custom'>('page');
  const [newMenuSelectedPage, setNewMenuSelectedPage] = useState('/about');
  const [newMenuSelectedCat, setNewMenuSelectedCat] = useState('local-news');
  const [newMenuCustomUrl, setNewMenuCustomUrl] = useState('');
  const [newMenuTarget, setNewMenuTarget] = useState<'_self' | '_blank'>('_self');
  const [isAddingMenu, setIsAddingMenu] = useState(false);

  // Editing existing menu item state
  const [editingMenuId, setEditingMenuId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateSettings({
      ...formData,
      footer_branding_text: formData.footer_about_text
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleAddFooterMenu = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMenuLabel.trim()) return;

    let targetUrl = '/';
    if (newMenuUrlType === 'page') {
      targetUrl = newMenuSelectedPage;
    } else if (newMenuUrlType === 'category') {
      targetUrl = `/category/${newMenuSelectedCat}`;
    } else if (newMenuUrlType === 'directory') {
      targetUrl = '/directory';
    } else {
      targetUrl = newMenuCustomUrl.trim() || '/';
    }

    addMenuItem({
      menu_group: 'footer',
      location: 'footer',
      label: newMenuLabel.trim(),
      url: targetUrl,
      type: newMenuUrlType,
      target: newMenuTarget,
      order: footerMenus.length + 1,
      order_index: footerMenus.length + 1
    });

    setNewMenuLabel('');
    setNewMenuCustomUrl('');
    setIsAddingMenu(false);
  };

  const handleStartEditMenu = (item: MenuItem) => {
    setEditingMenuId(item.id);
    setEditLabel(item.label);
    setEditUrl(item.url);
  };

  const handleSaveEditMenu = (id: string) => {
    if (!editLabel.trim()) return;
    updateMenuItem(id, {
      label: editLabel.trim(),
      url: editUrl.trim()
    });
    setEditingMenuId(null);
  };

  const handleMoveMenuUp = (idx: number) => {
    if (idx <= 0) return;
    reorderMenuItems('footer', idx, idx - 1);
  };

  const handleMoveMenuDown = (idx: number) => {
    if (idx >= footerMenus.length - 1) return;
    reorderMenuItems('footer', idx, idx + 1);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
              Footer Settings &amp; Manager
            </h1>
            <span className="text-[10px] bg-amber-500/10 text-amber-800 font-bold uppercase px-2 py-0.5 rounded-full">
              CMS Controlled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage footer branding, logo, bio, contact details, social channels, navigation links, and copyright text.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold animate-fade-in shadow-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Footer Saved!</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => handleSave()}
            className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save All Footer Changes</span>
          </button>
        </div>
      </div>

      {/* Info Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong>No Code Changes Required:</strong> The public site footer dynamically adapts to all branding, menu link additions, and visibility toggles configured here.
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'branding', label: '1. Footer Branding & Logo' },
          { id: 'contact', label: '2. Contact & Office Desk' },
          { id: 'social', label: '3. Social Networks' },
          { id: 'navigation', label: `4. Footer Menu Links (${footerMenus.length})` },
          { id: 'copyright', label: '5. Copyright & Notes' },
          { id: 'visibility', label: '6. Visibility Toggles' },
          { id: 'preview', label: '👁️ Live Footer Preview' }
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

      {/* Main Settings Tabs Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
        {/* Tab 1: Branding */}
        {activeTab === 'branding' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Footer Branding &amp; Identity</span>
              <span className="text-xs font-normal text-slate-400">Media Library Connected</span>
            </h2>

            {/* Footer Logo Picker */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800">
                Footer Logo Image
              </label>
              <p className="text-xs text-slate-500">
                Choose a high-contrast logo or emblem for the dark footer canvas. If empty, the site title will be displayed in elegant typography.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
                <div className="w-48 h-20 bg-[#0B192C] border-2 border-dashed border-slate-600 rounded-xl flex items-center justify-center p-2 overflow-hidden shrink-0">
                  {formData.footer_logo_url ? (
                    <img
                      src={formData.footer_logo_url}
                      alt="Footer Logo Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-slate-400">
                      <ImageIcon className="w-6 h-6 mx-auto opacity-50 mb-1" />
                      <span className="text-[10px]">No Logo Selected</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setMediaPickerOpen(true)}
                    className="px-3.5 py-2 bg-[#0B192C] hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Choose from Media Library</span>
                  </button>

                  {formData.footer_logo_url && (
                    <button
                      type="button"
                      onClick={() => handleChange('footer_logo_url', '')}
                      className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Logo</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Site Name & Tagline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Footer Brand Heading / Title
                </label>
                <input
                  type="text"
                  value={formData.site_name}
                  onChange={(e) => handleChange('site_name', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  placeholder="e.g. Zunheboto Social"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Footer Tagline / Subtitle
                </label>
                <input
                  type="text"
                  value={formData.footer_tagline}
                  onChange={(e) => handleChange('footer_tagline', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  placeholder="e.g. Independent, local & community-driven district journalism"
                />
              </div>
            </div>

            {/* About / Bio Text */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Footer Publication Bio / About Text
              </label>
              <textarea
                rows={4}
                value={formData.footer_about_text}
                onChange={(e) => handleChange('footer_about_text', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 leading-relaxed"
                placeholder="Brief summary of the publication's mission in Zunheboto district..."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Displayed in the main branding column of the footer.
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Contact Info */}
        {activeTab === 'contact' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Editorial Desk &amp; Office Coordinates
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleChange('contact_email', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  placeholder="editor@zunheboto.social"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Telephone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={formData.contact_phone}
                  onChange={(e) => handleChange('contact_phone', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  placeholder="+91 3867 220 102"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Physical Office Address
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <textarea
                  rows={2}
                  value={formData.contact_address}
                  onChange={(e) => handleChange('contact_address', e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 leading-relaxed"
                  placeholder="DC Hill Main Road, Near Town Council Building, Zunheboto, Nagaland 798620"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social Media */}
        {activeTab === 'social' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Social Media Channels &amp; Community Links
            </h2>
            <p className="text-xs text-slate-500">
              Provide URLs for your official social channels. Leave blank to hide a specific network icon.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 text-blue-600" />
                  <span>Facebook URL</span>
                </label>
                <input
                  type="url"
                  value={formData.social_facebook}
                  onChange={(e) => handleChange('social_facebook', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="https://facebook.com/zunhebotosocial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  <span>Twitter / X URL</span>
                </label>
                <input
                  type="url"
                  value={formData.social_twitter}
                  onChange={(e) => handleChange('social_twitter', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="https://twitter.com/zunhebotosocial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Instagram className="w-3.5 h-3.5 text-pink-600" />
                  <span>Instagram URL</span>
                </label>
                <input
                  type="url"
                  value={formData.social_instagram}
                  onChange={(e) => handleChange('social_instagram', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="https://instagram.com/zunhebotosocial"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Youtube className="w-3.5 h-3.5 text-red-600" />
                  <span>YouTube Channel URL</span>
                </label>
                <input
                  type="url"
                  value={formData.social_youtube}
                  onChange={(e) => handleChange('social_youtube', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="https://youtube.com/@zunhebotosocial"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp Community / Direct Chat Link</span>
                </label>
                <input
                  type="text"
                  value={formData.social_whatsapp}
                  onChange={(e) => handleChange('social_whatsapp', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  placeholder="https://wa.me/913867220102"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Navigation Links Builder */}
        {activeTab === 'navigation' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-serif font-bold text-[#0B192C]">
                  Footer Navigation Menu
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage the navigation links displayed in the Quick Navigation column of the footer.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingMenu(true)}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Footer Link</span>
              </button>
            </div>

            {/* Add Menu Item Form Modal / Drawer */}
            {isAddingMenu && (
              <div className="bg-slate-50 border border-amber-300 rounded-xl p-4 space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                    <span>Add New Footer Link</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingMenu(false)}
                    className="text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Link Label
                    </label>
                    <input
                      type="text"
                      value={newMenuLabel}
                      onChange={(e) => setNewMenuLabel(e.target.value)}
                      placeholder="e.g. Cultural Stories"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Link Destination Type
                    </label>
                    <select
                      value={newMenuUrlType}
                      onChange={(e) => setNewMenuUrlType(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-600"
                    >
                      <option value="page">Static CMS Page</option>
                      <option value="category">Article Category</option>
                      <option value="directory">Directory Hub</option>
                      <option value="custom">Custom URL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Target Destination
                    </label>
                    {newMenuUrlType === 'page' && (
                      <select
                        value={newMenuSelectedPage}
                        onChange={(e) => setNewMenuSelectedPage(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-600"
                      >
                        <option value="/">Homepage (/)</option>
                        <option value="/articles">All Articles (/articles)</option>
                        <option value="/directory">District Directory (/directory)</option>
                        <option value="/gallery">Photo Gallery (/gallery)</option>
                        {pages.map((p) => (
                          <option key={p.id} value={`/${p.slug}`}>
                            {p.title} (/{p.slug})
                          </option>
                        ))}
                      </select>
                    )}

                    {newMenuUrlType === 'category' && (
                      <select
                        value={newMenuSelectedCat}
                        onChange={(e) => setNewMenuSelectedCat(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white focus:outline-none focus:border-amber-600"
                      >
                        {articleCategories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}

                    {newMenuUrlType === 'directory' && (
                      <input
                        type="text"
                        disabled
                        value="/directory"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-100 text-xs text-slate-600 font-mono"
                      />
                    )}

                    {newMenuUrlType === 'custom' && (
                      <input
                        type="text"
                        value={newMenuCustomUrl}
                        onChange={(e) => setNewMenuCustomUrl(e.target.value)}
                        placeholder="https://... or /custom-path"
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newMenuTarget === '_blank'}
                      onChange={(e) => setNewMenuTarget(e.target.checked ? '_blank' : '_self')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                    <span>Open in new browser tab</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleAddFooterMenu}
                    disabled={!newMenuLabel.trim()}
                    className="px-4 py-1.5 bg-[#0B192C] hover:bg-slate-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add to Footer Menu
                  </button>
                </div>
              </div>
            )}

            {/* List of Footer Links */}
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {footerMenus.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No footer navigation links added yet. Click &ldquo;Add Footer Link&rdquo; to build your menu.
                </div>
              ) : (
                footerMenus.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>

                      {editingMenuId === item.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="text"
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs font-semibold w-36"
                          />
                          <input
                            type="text"
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="px-2 py-1 rounded border border-slate-300 text-xs font-mono w-44"
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEditMenu(item.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingMenuId(null)}
                            className="px-2 py-1 text-slate-500 hover:text-slate-700 text-xs font-bold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {item.label}
                            </span>
                            {item.target === '_blank' && (
                              <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                new tab
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] font-mono text-slate-400 truncate block">
                            {item.url}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                      {/* Edit Button */}
                      {editingMenuId !== item.id && (
                        <button
                          type="button"
                          onClick={() => handleStartEditMenu(item)}
                          className="px-2.5 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                        >
                          Edit
                        </button>
                      )}

                      {/* Reorder Buttons */}
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveMenuUp(idx)}
                          className="p-1.5 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === footerMenus.length - 1}
                          onClick={() => handleMoveMenuDown(idx)}
                          className="p-1.5 hover:bg-slate-200 disabled:opacity-30 text-slate-700 transition-colors border-l border-slate-200 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Delete Button */}
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Footer Link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 5: Copyright & Notes */}
        {activeTab === 'copyright' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Copyright Notice &amp; Disclaimer Notes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Copyright Statement Text
                </label>
                <input
                  type="text"
                  value={formData.copyright_text}
                  onChange={(e) => handleChange('copyright_text', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600"
                  placeholder="© 2026 Zunheboto Social. All rights reserved."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Copyright Year
                </label>
                <input
                  type="text"
                  value={formData.footer_copyright_year}
                  onChange={(e) => handleChange('footer_copyright_year', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-amber-600"
                  placeholder="2026"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Small Footer Note / Pride Statement
              </label>
              <textarea
                rows={2}
                value={formData.footer_note}
                onChange={(e) => handleChange('footer_note', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-amber-600 leading-relaxed"
                placeholder="Built with pride for the community of Zunheboto district, Nagaland."
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Appears beneath the copyright statement on the public footer bar.
              </p>
            </div>
          </div>
        )}

        {/* Tab 6: Visibility Toggles */}
        {activeTab === 'visibility' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Footer Component Visibility Controls
            </h2>
            <p className="text-xs text-slate-500">
              Enable or disable specific sections of the footer across the public website.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                {
                  key: 'footer_show_newsletter',
                  label: 'Newsletter Dispatch Strip',
                  desc: 'Top email subscription call-to-action banner'
                },
                {
                  key: 'footer_show_branding',
                  label: 'Branding & Publication Bio Column',
                  desc: 'Left column with logo, site name, and about summary'
                },
                {
                  key: 'footer_show_nav',
                  label: 'Quick Navigation Links Column',
                  desc: 'CMS-managed footer page and directory links'
                },
                {
                  key: 'footer_show_hotlines',
                  label: '24/7 District Hotlines Column',
                  desc: 'Direct emergency telephone buttons'
                },
                {
                  key: 'footer_show_contact',
                  label: 'Editorial Desk Contact Column',
                  desc: 'Address, official email, and phone coordinates'
                },
                {
                  key: 'footer_show_social',
                  label: 'Social Media Icons',
                  desc: 'Facebook, Twitter/X, Instagram, YouTube, and WhatsApp'
                },
                {
                  key: 'footer_show_copyright',
                  label: 'Copyright Bar',
                  desc: 'Bottom copyright statement and footer note'
                },
                {
                  key: 'footer_show_legal_links',
                  label: 'Legal & Policy Links',
                  desc: 'Privacy Policy, Terms of Service, and CMS Admin shortcut'
                },
                {
                  key: 'footer_show_zip_download',
                  label: 'Deployable ZIP Download Banner',
                  desc: 'Homepage ZIP download package box below the copyright line'
                }
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{item.label}</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      handleChange(item.key, !(formData as any)[item.key])
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                      (formData as any)[item.key]
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {(formData as any)[item.key] ? (
                      <>
                        <Eye className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Visible</span>
                      </>
                    ) : (
                      <>
                        <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                        <span>Hidden</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 7: Live Preview */}
        {activeTab === 'preview' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Interactive Public Footer Preview</span>
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Below is the exact public footer rendered with your current CMS data. Click &ldquo;Save All Footer Changes&rdquo; to persist modifications.
                </p>
              </div>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#0B192C] font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Published Homepage</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-slate-900 overflow-x-auto">
              <Footer />
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <div className="text-xs text-slate-500">
            Ensure you click <strong>Save All Footer Changes</strong> to store your updates in the CMS.
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save All Footer Changes</span>
          </button>
        </div>
      </form>

      {/* Media Picker Modal for Footer Logo */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => {
          handleChange('footer_logo_url', url);
          setMediaPickerOpen(false);
        }}
        title="Select Footer Logo Image"
      />
    </div>
  );
};
