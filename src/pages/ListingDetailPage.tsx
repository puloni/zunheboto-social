import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  MessageSquare,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Navigation,
  CheckCircle2,
  Building,
  Share2,
  ShieldAlert
} from 'lucide-react';
import { updateDocumentSeo, buildDirectorySchema, buildBreadcrumbSchema } from '../utils/seo';
import { ContentRenderer } from '../components/ContentRenderer';

interface ListingDetailPageProps {
  slug: string;
}

export const ListingDetailPage: React.FC<ListingDetailPageProps> = ({ slug }) => {
  const { listings, navigateTo, incrementListingViews, settings, adminUser } = useCms();

  const listing = listings.find((l) => l.slug === slug);

  useEffect(() => {
    if (listing) {
      incrementListingViews(slug);
    }
  }, [slug]);

  // Dynamic SEO & Structured Data for Directory Listing
  useEffect(() => {
    if (!listing) return;

    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
    const canonicalUrl = `${siteUrl}/listing/${listing.slug}`;

    const breadcrumbLd = buildBreadcrumbSchema(
      [
        { name: 'Home', url: '/' },
        { name: 'District Directory', url: '/directory' },
        { name: listing.name, url: `/listing/${listing.slug}` }
      ],
      settings
    );

    const directoryLd = buildDirectorySchema(listing, settings);

    updateDocumentSeo(
      {
        title: `${listing.name} | District Directory | ${settings.site_name}`,
        description:
          listing.description ||
          `Official district directory profile, location coordinates, phone numbers, and services for ${listing.name} in Zunheboto, Nagaland.`,
        canonicalUrl,
        image: listing.featured_image,
        type: 'business.business',
        jsonLd: [breadcrumbLd, directoryLd]
      },
      settings
    );
  }, [listing, settings]);

  if (!listing || (listing.status !== 'published' && !adminUser)) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-slate-800 mb-4">
          Listing Not Found
        </h2>
        <p className="text-slate-600 mb-6">
          The requested organization or business record was not found in the district directory.
        </p>
        <a
          href="/directory"
          className="px-6 py-2.5 bg-[#0B192C] text-white font-bold rounded-lg hover:bg-slate-800 transition-colors cursor-pointer inline-block"
        >
          Return to Directory Index
        </a>
      </div>
    );
  }

  const cleanPhone = (listing.phone || '').replace(/\s+/g, '');
  const cleanWhatsapp = (listing.whatsapp || listing.phone || '').replace(/[^\d+]/g, '');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      {/* Draft Mode Notice for Admin */}
      {listing.status !== 'published' && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <span className="font-bold">Draft Mode Active:</span> This directory listing is unpublished and only visible to administrators.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-200 text-amber-950">
            Status: {listing.status || 'draft'}
          </span>
        </div>
      )}

      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <a
          href="/directory"
          className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B192C] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to District Directory</span>
        </a>

        <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-md">
          {listing.category_name}
        </span>
      </div>

      {/* Main Listing Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Details & Description */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                    {listing.name}
                  </h1>
                  {listing.verified && (
                    <span className="flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-600 flex items-center gap-1.5 mt-1.5">
                  <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{listing.address} ({listing.location_area})</span>
                </p>
              </div>

              {listing.featured && (
                <span className="bg-[#0B192C] text-amber-300 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded self-start sm:self-auto">
                  Featured Directory Record
                </span>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
              {cleanPhone && (
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#0B192C] hover:bg-[#1E2A38] text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call Now</span>
                </a>
              )}

              {listing.whatsapp && cleanWhatsapp && (
                <a
                  href={`https://wa.me/${cleanWhatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              )}

              {listing.email && (
                <a
                  href={`mailto:${listing.email}`}
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors border border-slate-300"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>Email Desk</span>
                </a>
              )}

              {listing.map_url && (
                <a
                  href={listing.map_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition-colors border border-amber-300"
                >
                  <Navigation className="w-3.5 h-3.5 text-amber-700" />
                  <span>Directions</span>
                </a>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {listing.featured_image && (
            <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs aspect-[16/9]">
              <img
                src={listing.featured_image}
                alt={listing.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Full Description & Overview */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Overview &amp; Services
            </h3>
            <ContentRenderer
              content={listing.description}
              className="prose prose-slate max-w-none text-sm text-slate-700 leading-relaxed space-y-2"
            />
          </div>
        </div>

        {/* Right Col: Contact & Schedule Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-serif font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              Official Contact &amp; Hours
            </h3>

            <div className="space-y-3.5 text-xs text-slate-700">
              {listing.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-500">Phone Number</div>
                    <a href={`tel:${cleanPhone}`} className="font-bold text-slate-900 hover:text-amber-700">
                      {listing.phone}
                    </a>
                  </div>
                </div>
              )}

              {listing.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-500">WhatsApp Channel</div>
                    <a
                      href={`https://wa.me/${cleanWhatsapp}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-emerald-700 hover:underline"
                    >
                      {listing.whatsapp}
                    </a>
                  </div>
                </div>
              )}

              {listing.email && (
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-500">Email Address</div>
                    <a href={`mailto:${listing.email}`} className="font-bold text-slate-900 hover:text-blue-700 break-all">
                      {listing.email}
                    </a>
                  </div>
                </div>
              )}

              {listing.website && (
                <div className="flex items-start gap-3">
                  <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-500">Official Website</div>
                    <a
                      href={listing.website}
                      target="_blank"
                      rel="noreferrer"
                      className="font-bold text-indigo-700 hover:underline break-all"
                    >
                      {listing.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}

              {listing.opening_hours && (
                <div className="flex items-start gap-3 pt-2 border-t border-slate-100">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-slate-500">Visiting / Working Hours</div>
                    <div className="font-bold text-slate-900 mt-0.5">{listing.opening_hours}</div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-center">
                <div className="text-[11px] text-slate-500">District Location Zone</div>
                <div className="text-xs font-bold text-[#0B192C] mt-0.5">{listing.location_area}, Zunheboto</div>
              </div>
            </div>
          </div>

          {/* Verification Badge Explainer */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900">
            <div className="flex items-center gap-2 font-bold mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Zunheboto Social Directory Guarantee</span>
            </div>
            <p className="text-emerald-800/90 leading-relaxed mt-1">
              This record is verified and periodically updated by the Zunheboto Social editorial directory desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
