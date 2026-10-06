import React from 'react';
import { X, Calendar, Clock, Eye, Tag, MapPin, Phone, MessageSquare, Mail, Globe, ShieldCheck, ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react';
import { ContentRenderer } from '../ContentRenderer';
import { Article, Listing, StaticPage } from '../../types';

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'article' | 'page' | 'listing';
  data: Partial<Article> | Partial<StaticPage> | Partial<Listing>;
}

export const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex flex-col p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
      {/* Top sticky action bar */}
      <div className="max-w-5xl w-full mx-auto bg-[#0B192C] text-white px-4 py-3 rounded-t-2xl flex items-center justify-between shadow-lg shrink-0 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider bg-amber-500 text-slate-950 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            Unpublished Draft Preview
          </span>
          <span className="text-xs text-slate-300 hidden sm:inline">
            Viewing exact visitor layout (Markdown, HTML &amp; Embeds rendered)
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
        >
          <span>Close Preview</span>
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main preview body mimicking public layout */}
      <div className="max-w-5xl w-full mx-auto bg-white rounded-b-2xl p-6 sm:p-10 shadow-2xl border border-t-0 border-slate-200 overflow-y-auto min-h-[60vh]">
        {/* Banner notice */}
        <div className="mb-6 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 font-sans">
          <div>
            <span className="font-bold">Draft Mode Active:</span> This content has not been published yet. It is completely invisible to public website visitors.
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
            Status: {data.status || 'draft'}
          </span>
        </div>

        {/* ARTICLE PREVIEW */}
        {type === 'article' && (
          <div className="max-w-4xl mx-auto font-sans">
            <header className="mb-6 pb-6 border-b border-slate-200">
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider rounded mb-3">
                {(data as Partial<Article>).category_name || 'News Report'}
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#0B192C] leading-tight">
                {(data as Partial<Article>).title || 'Untitled Article'}
              </h1>
              {(data as Partial<Article>).excerpt && (
                <p className="text-base sm:text-lg text-slate-600 font-serif italic mt-3 leading-relaxed">
                  {(data as Partial<Article>).excerpt}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2 font-semibold text-slate-700">
                  <span>By {(data as Partial<Article>).author_name || 'Staff Reporter'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {(data as Partial<Article>).read_time_minutes || 3} min read
                  </span>
                </div>
              </div>
            </header>

            {(data as Partial<Article>).featured_image && (
              <figure className="mb-8">
                <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={(data as Partial<Article>).featured_image}
                    alt={(data as Partial<Article>).title}
                    className="w-full h-full object-cover"
                  />
                </div>
                {(data as Partial<Article>).caption && (
                  <figcaption className="text-xs text-slate-500 mt-2 text-center">
                    Photo: {(data as Partial<Article>).caption}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Rendered content */}
            <ContentRenderer
              content={(data as Partial<Article>).content}
              className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-relaxed space-y-4 mb-8"
            />

            {(data as Partial<Article>).tags && (
              <div className="flex flex-wrap items-center gap-2 my-6 pt-4 border-t border-slate-200">
                <span className="text-xs font-bold uppercase text-slate-400 flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Topics:
                </span>
                {(Array.isArray((data as Partial<Article>).tags)
                  ? ((data as Partial<Article>).tags as string[])
                  : ((data as Partial<Article>).tags as string || '').split(',')
                ).map((t, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-medium">
                    #{String(t).trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATIC PAGE PREVIEW */}
        {type === 'page' && (
          <div className="max-w-4xl mx-auto font-sans">
            <header className="mb-8 pb-4 border-b-2 border-[#0B192C]">
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#0B192C]">
                {(data as Partial<StaticPage>).title || 'Untitled Page'}
              </h1>
              <div className="text-xs text-slate-400 mt-2 flex items-center gap-2">
                <span>Updated on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span>Official Notice / Information Page</span>
              </div>
            </header>

            {/* Rendered content */}
            <ContentRenderer
              content={(data as Partial<StaticPage>).content}
              className="prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-relaxed space-y-4 mb-12"
            />
          </div>
        )}

        {/* LISTING PREVIEW */}
        {type === 'listing' && (
          <div className="max-w-5xl mx-auto font-sans">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                          {(data as Partial<Listing>).name || 'Unnamed Organization'}
                        </h1>
                        {(data as Partial<Listing>).verified && (
                          <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          {(data as Partial<Listing>).address} ({(data as Partial<Listing>).location_area})
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Quick action buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-100">
                    {(data as Partial<Listing>).phone ? (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#0B192C] text-white text-xs font-bold">
                        <Phone className="w-3.5 h-3.5 text-amber-400" />
                        <span>Call: {(data as Partial<Listing>).phone}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1 py-2.5 px-3 rounded-lg bg-slate-100 text-slate-400 text-xs font-medium">
                        <span>No Phone Listed</span>
                      </div>
                    )}

                    {(data as Partial<Listing>).whatsapp && (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 text-white text-xs font-bold">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </div>
                    )}

                    {(data as Partial<Listing>).email && (
                      <div className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-600" />
                        <span>Email Desk</span>
                      </div>
                    )}
                  </div>
                </div>

                {(data as Partial<Listing>).featured_image && (
                  <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/9]">
                    <img
                      src={(data as Partial<Listing>).featured_image}
                      alt={(data as Partial<Listing>).name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                  <h3 className="text-lg font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                    Overview &amp; Services
                  </h3>
                  {/* Rendered content */}
                  <ContentRenderer
                    content={(data as Partial<Listing>).description}
                    className="text-sm text-slate-700 leading-relaxed space-y-3"
                  />
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-base font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
                    Contact &amp; Hours
                  </h3>
                  <div className="space-y-3 text-xs text-slate-700">
                    <div>
                      <span className="font-semibold text-slate-500">Colony / Area:</span>{' '}
                      <span className="font-bold text-slate-900">{(data as Partial<Listing>).location_area}</span>
                    </div>
                    {(data as Partial<Listing>).phone && (
                      <div>
                        <span className="font-semibold text-slate-500">Phone:</span>{' '}
                        <span className="font-bold text-slate-900">{(data as Partial<Listing>).phone}</span>
                      </div>
                    )}
                    {(data as Partial<Listing>).opening_hours && (
                      <div>
                        <span className="font-semibold text-slate-500">Hours:</span>{' '}
                        <span className="font-bold text-slate-900">{(data as Partial<Listing>).opening_hours}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
