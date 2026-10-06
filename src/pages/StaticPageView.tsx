import React from 'react';
import { useCms } from '../context/CmsContext';
import { Calendar, ArrowLeft, Send, ShieldAlert } from 'lucide-react';
import { NewsTipSection } from '../components/NewsTipSection';
import { ContentRenderer } from '../components/ContentRenderer';

interface StaticPageViewProps {
  slug: string;
}

export const StaticPageView: React.FC<StaticPageViewProps> = ({ slug }) => {
  const { pages, navigateTo, settings, adminUser } = useCms();

  const page = pages.find((p) => p.slug === slug);

  if (!page || (page.status !== 'published' && !adminUser)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          The requested page could not be located.
        </p>
        <a
          href="/"
          className="px-6 py-2.5 bg-[#0B192C] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors inline-block"
        >
          Return to Homepage
        </a>
      </div>
    );
  }

  const isContact = slug === 'contact';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      {/* Draft Mode Notice for Admin */}
      {page.status !== 'published' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <span className="font-bold">Draft Mode Active:</span> This page is currently unpublished ({page.status}) and only visible to administrators.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-950">
            Status: {page.status || 'draft'}
          </span>
        </div>
      )}

      <div className="mb-6 pb-4 border-b border-slate-200">
        <a
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B192C] flex items-center gap-1.5 cursor-pointer inline-flex"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>
      </div>

      <header className="mb-8 pb-4 border-b-2 border-[#0B192C]">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
          {page.title}
        </h1>
        <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
          <span>Updated on {new Date(page.updated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          <span>•</span>
          <span>Official Zunheboto Social Notice</span>
        </div>
      </header>

      {/* Main Body */}
      <ContentRenderer
        content={page.content}
        className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-relaxed space-y-4 mb-12"
      />

      {/* If Contact Page, mount News Tip & Contact form section */}
      {isContact && (
        <div className="mt-12 pt-8 border-t-2 border-slate-200">
          <NewsTipSection />
        </div>
      )}
    </div>
  );
};
