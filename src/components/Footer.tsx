import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  MessageSquare,
  ShieldCheck,
  Heart,
  ArrowUpRight,
  ExternalLink,
  Download,
  Package,
  Server
} from 'lucide-react';
import { NewsletterSubscribe } from './NewsletterSubscribe';

export const Footer: React.FC = () => {
  const { settings, menuItems, navigateTo, emergencyHotlines, downloadPhpZip } = useCms();
  const [isDownloading, setIsDownloading] = useState(false);

  const footerMenus = menuItems
    .filter((m) => m.menu_group === 'footer' || m.location === 'footer')
    .sort((a, b) => (a.order || a.order_index || 0) - (b.order || b.order_index || 0));

  const activeHotlines = emergencyHotlines.filter((h) => h.enabled).slice(0, 4);

  // Logo selection: prefer dedicated footer_logo_url, fallback to logo_url
  const footerLogo = settings.footer_logo_url || settings.logo_url;

  // Visibility flags with true default
  const showNewsletter = settings.footer_show_newsletter !== false;
  const showHotlines = settings.footer_show_hotlines !== false && activeHotlines.length > 0;
  const showContact = settings.footer_show_contact !== false;
  const showSocial = settings.footer_show_social !== false;
  const showNav = settings.footer_show_nav !== false;
  const showBranding = settings.footer_show_branding !== false;
  const showCopyright = settings.footer_show_copyright !== false;
  const showLegalLinks = settings.footer_show_legal_links !== false;
  const showZipDownload = settings.footer_show_zip_download !== false;

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    try {
      await downloadPhpZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleLinkClick = (url: string, target?: string) => {
    if (url.startsWith('http://') || url.startsWith('https://') || target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      navigateTo(url);
    }
  };

  return (
    <footer id="site-footer" className="bg-[#0B192C] text-slate-300 border-t-4 border-amber-600 mt-20 pt-12 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter Subscription Strip */}
        {showNewsletter && (
          <div id="footer-newsletter-section" className="mb-12 pb-12 border-b border-slate-800">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-md">
              <div className="max-w-xl text-center lg:text-left">
                <span className="text-amber-400 text-xs font-bold uppercase tracking-wider block mb-1">
                  Community Email Dispatch
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                  Never Miss a Zunheboto Story
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 mt-1.5 leading-relaxed">
                  Join our district mailing list for breaking civic announcements, cultural features, and verified directory additions.
                </p>
              </div>
              <div className="w-full lg:max-w-md">
                <NewsletterSubscribe
                  variant="inline"
                  source="footer_inline"
                  showColonySelector={false}
                  showPreferences={false}
                />
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Grid Columns based on active components */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-slate-800">
          {/* Col 1: Brand & Bio */}
          {showBranding && (
            <div className="lg:col-span-4 space-y-4">
              <a
                id="footer-brand-header"
                href="/"
                className="cursor-pointer group inline-block"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-serif font-black text-base shadow-sm">
                    Z
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-[0.14em] text-white uppercase group-hover:text-amber-400 transition-colors">
                    {settings.site_name || 'ZUNHEBOTO SOCIAL'}
                  </h2>
                </div>
                <p className="text-xs text-amber-400 font-medium tracking-wider uppercase mt-1">
                  {settings.footer_tagline || settings.tagline || 'District Publication & Verified Directory'}
                </p>
              </a>

              <p className="text-sm text-slate-400 leading-relaxed">
                {settings.footer_about_text ||
                  settings.footer_branding_text ||
                  'Zunheboto Social is an independent local publication, community voice, and verified district directory dedicated to authentic reporting across Zunheboto, Nagaland.'}
              </p>

              {/* Social Icons */}
              {showSocial && (
                <div id="footer-social-links" className="flex flex-wrap items-center gap-2.5 pt-2">
                  {settings.social_facebook && (
                    <a
                      href={settings.social_facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Facebook"
                      title="Follow on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </a>
                  )}
                  {settings.social_twitter && (
                    <a
                      href={settings.social_twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Twitter / X"
                      title="Follow on Twitter / X"
                    >
                      <Twitter className="w-4 h-4" />
                    </a>
                  )}
                  {settings.social_instagram && (
                    <a
                      href={settings.social_instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      aria-label="Instagram"
                      title="Follow on Instagram"
                    >
                      <Instagram className="w-4 h-4" />
                    </a>
                  )}
                  {settings.social_youtube && (
                    <a
                      href={settings.social_youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-amber-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      aria-label="YouTube"
                      title="Subscribe on YouTube"
                    >
                      <Youtube className="w-4 h-4" />
                    </a>
                  )}
                  {settings.social_whatsapp && (
                    <a
                      href={settings.social_whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-9 h-9 rounded-full bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-xs"
                      aria-label="WhatsApp"
                      title="Chat on WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Col 2: Navigation Links */}
          {showNav && (
            <div className="lg:col-span-3">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>District Navigation</span>
                <span className="text-[10px] text-slate-500 font-mono">CMS Links</span>
              </h3>
              {footerMenus.length > 0 ? (
                <ul id="footer-nav-list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-y-2.5 text-sm">
                  {footerMenus.map((item) => {
                    const isExternal = item.url.startsWith('http://') || item.url.startsWith('https://') || item.target === '_blank';
                    return (
                      <li key={item.id}>
                        <a
                          href={item.url}
                          target={item.target || (isExternal ? '_blank' : undefined)}
                          rel={isExternal ? 'noopener noreferrer' : undefined}
                          className="text-slate-400 hover:text-amber-400 transition-colors flex items-center gap-1.5 text-left cursor-pointer group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500/60 group-hover:bg-amber-400 transition-colors"></span>
                          <span className="truncate">{item.label}</span>
                          {isExternal && <ExternalLink className="w-3 h-3 opacity-60 ml-0.5" />}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-slate-500 italic">No footer links configured in CMS.</p>
              )}
            </div>
          )}

          {/* Col 3: District Emergency Quick Dial */}
          {showHotlines && (
            <div className="lg:col-span-2">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-800 flex items-center justify-between">
                <span>Hotlines</span>
                <span className="text-amber-400 text-[10px] font-semibold">24/7 Dial</span>
              </h3>
              <div id="footer-hotlines-list" className="space-y-2.5 text-sm">
                {activeHotlines.map((h) => (
                  <div key={h.id} className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="text-[11px] text-slate-400 truncate">{h.title}</div>
                    <a
                      href={`tel:${h.phone || h.number}`}
                      className="text-amber-400 font-bold hover:underline flex items-center gap-1.5 mt-0.5 text-xs font-mono"
                    >
                      <Phone className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{h.phone || h.number}</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Col 4: Contact & Office */}
          {showContact && (
            <div className="lg:col-span-3">
              <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-800">
                Editorial Desk
              </h3>
              <div id="footer-contact-info" className="space-y-3 text-sm text-slate-400">
                {settings.contact_address && (
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    <span className="text-xs sm:text-sm leading-relaxed">{settings.contact_address}</span>
                  </div>
                )}
                {settings.contact_email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href={`mailto:${settings.contact_email}`} className="text-xs sm:text-sm hover:text-white transition-colors truncate">
                      {settings.contact_email}
                    </a>
                  </div>
                )}
                {settings.contact_phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href={`tel:${settings.contact_phone}`} className="text-xs sm:text-sm hover:text-white transition-colors">
                      {settings.contact_phone}
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80">
                <a
                  id="footer-editorial-inquiry-btn"
                  href="/contact"
                  className="w-full text-center py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Editorial Press & Inquiries</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Copyright, Notes, and Legal Links */}
        <div id="footer-bottom-bar" className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="text-center md:text-left space-y-1">
            {showCopyright && (
              <p className="text-slate-400 font-medium">
                {settings.copyright_text || `© ${settings.footer_copyright_year || '2026'} ${settings.site_name}. All rights reserved.`}
              </p>
            )}
            {settings.footer_note && (
              <p className="text-[11px] text-slate-500">{settings.footer_note}</p>
            )}
          </div>

          {showLegalLinks && (
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs">
              <a
                href="/classifieds"
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Classifieds
              </a>
              <span>•</span>
              <a
                href="/privacy"
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Privacy Policy
              </a>
              <span>•</span>
              <a
                href="/terms"
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Terms of Service
              </a>
              <span>•</span>
              <a
                href="/about"
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                About Desk
              </a>
              <span>•</span>
              <a
                href="/contact"
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Contact
              </a>
              <span>•</span>
              <a
                href="/admin"
                className="text-amber-400 hover:text-amber-300 font-bold ml-1 cursor-pointer"
              >
                CMS Admin
              </a>
            </div>
          )}
        </div>

        {/* Ready-to-Deploy ZIP Package Download Banner (Below Copyright) */}
        {showZipDownload && (
          <div id="footer-zip-download-banner" className="mt-8 pt-6 border-t border-slate-800/80">
            <div className="bg-gradient-to-r from-slate-900 via-[#0E2038] to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl">
              <div className="flex items-start sm:items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Download className={`w-6 h-6 ${isDownloading ? 'animate-bounce text-amber-300' : ''}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white tracking-wide">
                      Download Complete Website &amp; CMS Package (.ZIP)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-700/60">
                      CyberPanel &bull; PHP 8.2+ Ready
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                    Standalone production release with built-in web installer, complete MySQL schema (<code className="text-amber-300 font-mono text-[11px]">schema.sql</code>), clean URL routing (<code className="text-amber-300 font-mono text-[11px]">.htaccess</code>), all district articles, and admin portal. No Node.js runtime required on your server.
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
                <button
                  id="homepage-download-zip-btn"
                  type="button"
                  onClick={handleDownloadZip}
                  disabled={isDownloading}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  <Download className={`w-4 h-4 ${isDownloading ? 'animate-spin' : ''}`} />
                  <span>{isDownloading ? 'Preparing ZIP Package...' : 'Download Full Website (.ZIP)'}</span>
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-between mt-2.5 px-2 text-[11px] text-slate-500 gap-1">
              <span>Ready for <strong className="text-slate-400 font-normal">public_html</strong> upload &bull; Extract and visit <code className="text-slate-400 font-mono">/install</code> in your browser.</span>
              <span className="text-slate-400">Can be disabled anytime in <a href="/admin/settings" className="text-amber-400 font-medium cursor-pointer">CMS Admin &rarr; Settings</a></span>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};

