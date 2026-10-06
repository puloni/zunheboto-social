import React, { useState } from 'react';
import { useCms } from '../../context/CmsContext';
import {
  LayoutDashboard,
  FileText,
  Building,
  FileCode,
  Image as ImageIcon,
  Camera,
  Layers,
  PanelBottom,
  Menu as MenuIcon,
  PhoneCall,
  Send,
  Mail,
  Settings,
  User,
  LogOut,
  Globe,
  Download,
  Database,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FolderOpen,
  Tag,
  Megaphone,
  Users
} from 'lucide-react';

interface AdminLayoutProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  children
}) => {
  const { adminUser, logout, navigateTo, settings, newsTips, classifieds, downloadPhpZip } = useCms();
  const [downloading, setDownloading] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const unreadTipsCount = newsTips.filter((t) => t.status === 'unread').length;
  const pendingClassifiedsCount = (classifieds || []).filter((c) => c.status === 'pending').length;

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'articles', label: 'Articles & News', icon: FileText },
    { id: 'article_categories', label: 'Article Categories', icon: FolderOpen },
    {
      id: 'classifieds',
      label: 'Local Classifieds',
      icon: Tag,
      badge: pendingClassifiedsCount > 0 ? pendingClassifiedsCount : undefined
    },
    { id: 'sponsored_ads', label: 'Sponsored Ads & Banners', icon: Megaphone },
    { id: 'users', label: 'Editorial Roles & Team', icon: Users },
    { id: 'listings', label: 'Directory Listings', icon: Building },
    { id: 'listing_categories', label: 'Directory Categories', icon: FolderOpen },
    { id: 'pages', label: 'Static Pages', icon: FileCode },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'gallery', label: 'District Gallery', icon: Camera },
    { id: 'homepage_builder', label: 'Homepage Builder', icon: Layers },
    { id: 'footer', label: 'Footer Settings', icon: PanelBottom },
    { id: 'menus', label: 'Navigation Menus', icon: MenuIcon },
    { id: 'hotlines', label: 'Emergency Hotlines', icon: PhoneCall },
    {
      id: 'news_tips',
      label: 'Citizen News Tips',
      icon: Send,
      badge: unreadTipsCount > 0 ? unreadTipsCount : undefined
    },
    { id: 'newsletter', label: 'Newsletter Subscribers', icon: Mail },
    { id: 'settings', label: 'Site Settings & Branding', icon: Settings },
    { id: 'storage', label: 'Database & Storage', icon: Database },
    { id: 'profile', label: 'Admin Profile & Security', icon: User }
  ];

  const handleDownloadZip = async () => {
    setDownloading(true);
    await downloadPhpZip();
    setDownloading(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Admin Top Header */}
      <header className="bg-[#0B192C] text-white px-4 sm:px-6 py-3 flex items-center justify-between border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="lg:hidden p-1.5 rounded bg-slate-800 text-slate-300 hover:text-white"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer"
          >
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-serif font-black text-xs shadow-xs">
              Z
            </div>
            <span className="font-serif font-bold text-base sm:text-lg tracking-wider">
              {settings.site_name} CMS
            </span>
            <span className="hidden sm:inline-block text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold uppercase">
              Admin Desk
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Direct Download ZIP button */}
          <button
            onClick={handleDownloadZip}
            disabled={downloading}
            className="hidden sm:flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            title="Download full standalone PHP project"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Exporting...' : 'Download PHP ZIP'}</span>
          </button>

          {/* Visit Live Website */}
          <a
            href="/"
            className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden xs:inline">Visit Site</span>
          </a>

          {/* Sign Out */}
          <button
            onClick={logout}
            className="flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200 bg-rose-950/40 hover:bg-rose-900/60 px-3 py-1.5 rounded-lg transition-colors border border-rose-900/50 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Admin Workspace */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
            <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
              Content &amp; Directory
            </div>

            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#0B192C] text-white shadow-xs font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Sidebar Footer User Info */}
          <div className="p-4 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {adminUser?.name || 'Administrator'}
                </div>
                <div className="text-[10px] text-slate-500 truncate">
                  {adminUser?.email || 'admin@zunheboto.social'}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
};
