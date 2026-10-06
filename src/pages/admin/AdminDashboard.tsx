import React from 'react';
import { useCms } from '../../context/CmsContext';
import {
  FileText,
  Building,
  Eye,
  Send,
  PlusCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Download,
  Flame,
  CheckCircle2,
  Mail
} from 'lucide-react';
import { getStoredSubscribers } from '../../data/newsletterStorage';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const {
    articles,
    listings,
    newsTips,
    galleryPhotos,
    settings,
    navigateTo,
    downloadPhpZip
  } = useCms();

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0) +
    listings.reduce((acc, l) => acc + (l.views || 0), 0);
  const unreadTips = newsTips.filter((t) => t.status === 'unread');
  const verifiedListings = listings.filter((l) => l.verified);
  const subscribers = getStoredSubscribers();
  const activeSubscribers = subscribers.filter((s) => s.status === 'active');

  return (
    <div className="space-y-8 font-sans">
      {/* Masthead Banner */}
      <div className="bg-gradient-to-r from-[#0B192C] to-[#1E2A38] text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            District Administration Suite
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
            Welcome to {settings.site_name} CMS
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Manage local news stories, district directory records, citizen leads, photo chronicles, and site branding without touching source code.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => onNavigateTab('articles')}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Write New Article</span>
          </button>
          <button
            onClick={() => onNavigateTab('listings')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Directory Listing</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Articles</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B192C]">
            {articles.length}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="text-emerald-600 font-semibold">{publishedArticles.length} published</span>
            <span>•</span>
            <span className="text-amber-600 font-semibold">{draftArticles.length} drafts</span>
          </div>
        </div>

        {/* Directory Listings */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Directory Listings</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B192C]">
            {listings.length}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
            <span className="text-emerald-600 font-semibold">{verifiedListings.length} verified</span>
            <span>•</span>
            <span>Across 10 district zones</span>
          </div>
        </div>

        {/* Cumulative Views */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Readership</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B192C]">
            {totalViews.toLocaleString()}
          </div>
          <div className="text-xs text-slate-500 mt-2 flex items-center gap-1">
            <span className="text-emerald-600 font-semibold">+14.2%</span>
            <span>growth this month</span>
          </div>
        </div>

        {/* News Tips */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Citizen News Leads</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#0B192C]">
            {newsTips.length}
          </div>
          <div className="text-xs text-slate-500 mt-2">
            {unreadTips.length > 0 ? (
              <span className="text-rose-600 font-bold">{unreadTips.length} unread leads pending review</span>
            ) : (
              <span className="text-emerald-600 font-semibold">All leads reviewed</span>
            )}
          </div>
        </div>

        {/* Newsletter Subscribers */}
        <div
          onClick={() => onNavigateTab('newsletter')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs cursor-pointer hover:border-amber-300 transition-colors sm:col-span-2 lg:col-span-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Community Newsletter Subscribers
              </div>
              <div className="text-lg font-bold text-slate-900 mt-0.5">
                {activeSubscribers.length} active readers ({subscribers.length} total captured)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 hover:text-amber-800">
            <span>Manage Subscribers &amp; Export</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Articles & Citizen Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h3 className="text-base font-serif font-bold text-[#0B192C]">
              Recent News Articles &amp; Reports
            </h3>
            <button
              onClick={() => onNavigateTab('articles')}
              className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {articles.slice(0, 5).map((art) => (
              <div
                key={art.id}
                className="p-3 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/60 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-10 rounded overflow-hidden bg-slate-100 shrink-0">
                    <img src={art.featured_image} alt={art.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-amber-700">{art.category_name}</span>
                      {art.featured_lead && <Flame className="w-3 h-3 text-amber-500" />}
                    </div>
                    <div className="text-xs font-bold text-slate-900 truncate mt-0.5">{art.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{art.author_name}</span>
                      <span>•</span>
                      <span>{art.views} views</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    art.status === 'published'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {art.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Citizen Leads & Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Leads */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-base font-serif font-bold text-[#0B192C] flex items-center gap-2">
                <span>Citizen Reports</span>
                {unreadTips.length > 0 && (
                  <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadTips.length} New
                  </span>
                )}
              </h3>
              <button
                onClick={() => onNavigateTab('news_tips')}
                className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {newsTips.slice(0, 3).map((tip) => (
                <div
                  key={tip.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{tip.sender_name}</span>
                    <span className="text-[10px] text-slate-500">{tip.location}</span>
                  </div>
                  <p className="text-slate-600 line-clamp-2 leading-relaxed">
                    "{tip.message}"
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Standalone Deployment Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider">
              Deployment &amp; Packaging
            </div>
            <h4 className="text-base font-serif font-bold text-slate-950">
              Export Complete PHP Project ZIP
            </h4>
            <p className="text-xs text-slate-900 leading-relaxed">
              Generates clean PHP 8.2+ source code, PDO database connections, .htaccess, and install wizard ready for shared hosting.
            </p>
            <button
              onClick={() => downloadPhpZip()}
              className="w-full py-2.5 bg-[#0B192C] hover:bg-[#1E2A38] text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Deployable ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
