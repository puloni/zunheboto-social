import React, { useEffect } from 'react';
import { useCms } from '../context/CmsContext';
import {
  User,
  Calendar,
  Clock,
  ArrowRight,
  ArrowLeft,
  Mail,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { updateDocumentSeo, buildAuthorSchema } from '../utils/seo';

interface AuthorProfilePageProps {
  slug: string;
}

export const AuthorProfilePage: React.FC<AuthorProfilePageProps> = ({ slug }) => {
  const { adminUser, articles, settings, navigateTo } = useCms();

  // Find author: either from adminUser or by matching author_name on articles
  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  const authorNameMatch = adminUser
    ? (adminUser.display_name || adminUser.name || adminUser.username)
        .toLowerCase()
        .replace(/\s+/g, '-')
    : '';

  // Author details fallback
  const isMainAdmin =
    cleanSlug === 'admin' ||
    cleanSlug === 'administrator' ||
    cleanSlug === authorNameMatch ||
    cleanSlug === (adminUser?.username || '').toLowerCase();

  const author = isMainAdmin && adminUser
    ? adminUser
    : {
        id: 'author_' + cleanSlug,
        name: decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        display_name: decodeURIComponent(slug).replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        username: cleanSlug,
        email: settings.contact_email || 'editor@zunheboto.social',
        bio: 'Contributing journalist and community correspondent for Zunheboto Social.',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        role: 'editor' as const,
        social_twitter: settings.twitter_url || settings.social_twitter,
        social_facebook: settings.facebook_url || settings.social_facebook,
        created_at: '2026-08-01T08:00:00Z',
        last_login: ''
      };

  const authorDisplayName = author.display_name || author.name;

  // Filter published articles written by this author
  const authorArticles = articles.filter(
    (a) =>
      a.status === 'published' &&
      (a.author_name?.toLowerCase().includes(author.name.toLowerCase()) ||
        a.author_name?.toLowerCase().includes(authorDisplayName.toLowerCase()) ||
        isMainAdmin)
  );

  // Dynamic SEO & Structured Data
  useEffect(() => {
    const siteUrl = (settings.site_url || 'https://zunheboto.social').replace(/\/+$/, '');
    const canonicalUrl = `${siteUrl}/author/${encodeURIComponent(cleanSlug)}`;

    updateDocumentSeo(
      {
        title: `${authorDisplayName} | Editorial Staff | ${settings.site_name}`,
        description:
          author.bio ||
          `${authorDisplayName} is an editorial contributor and district reporter at ${settings.site_name}.`,
        canonicalUrl,
        image: author.avatar_url,
        type: 'profile',
        jsonLd: buildAuthorSchema(author, settings)
      },
      settings
    );
  }, [cleanSlug, authorDisplayName, author, settings]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 font-sans space-y-10">
      {/* Navigation Breadcrumb */}
      <div>
        <a
          href="/articles"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-[#0B192C] flex items-center gap-1.5 transition-colors cursor-pointer inline-flex"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Chronicles</span>
        </a>
      </div>

      {/* Author Bio Masthead Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8">
          <div className="relative">
            <img
              src={author.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
              alt={authorDisplayName}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover border-2 border-amber-500/40 shadow-md"
            />
            <div className="absolute -bottom-2 -right-2 bg-[#0B192C] text-amber-400 p-1.5 rounded-lg border border-slate-700 shadow-xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B192C]">
                {authorDisplayName}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
                {author.role === 'superadmin' ? 'Editor-in-Chief' : 'Staff Journalist'}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
              {author.bio || 'District news correspondent, cultural documentarian, and verified editorial voice for Zunheboto Social.'}
            </p>

            {/* Author Social & Contact Links */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              {author.email && (
                <a
                  href={`mailto:${author.email}`}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0B192C] hover:text-white transition-colors"
                >
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>{author.email}</span>
                </a>
              )}
              {author.social_twitter && (
                <a
                  href={author.social_twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-black hover:text-white transition-colors"
                  aria-label="Author Twitter Profile"
                >
                  <Twitter className="w-3.5 h-3.5" />
                </a>
              )}
              {author.social_facebook && (
                <a
                  href={author.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#1877F2] hover:text-white transition-colors"
                  aria-label="Author Facebook Profile"
                >
                  <Facebook className="w-3.5 h-3.5" />
                </a>
              )}
              {author.social_linkedin && (
                <a
                  href={author.social_linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-[#0A66C2] hover:text-white transition-colors"
                  aria-label="Author LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                </a>
              )}
              {author.social_website && (
                <a
                  href={author.social_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white transition-colors"
                  aria-label="Author Website"
                >
                  <Globe className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Author's Published Stories Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-serif font-bold text-[#0B192C]">
              Stories by {authorDisplayName}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {authorArticles.length} {authorArticles.length === 1 ? 'Article' : 'Articles'}
          </span>
        </div>

        {authorArticles.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-sm">
            No published articles found under this author profile yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authorArticles.map((art) => (
              <a
                key={art.id}
                href={`/${art.slug}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group cursor-pointer flex flex-col block"
              >
                <div className="relative aspect-video overflow-hidden bg-slate-100">
                  <img
                    src={art.featured_image}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    style={{ backgroundColor: art.category_color || '#0284C7' }}
                    className="absolute top-3 left-3 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs"
                  >
                    {art.category_name}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <h3 className="font-serif font-bold text-base text-[#0B192C] group-hover:text-amber-700 transition-colors line-clamp-2">
                      {art.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(art.published_at).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{art.read_time_minutes || art.read_time_mins || 3} min read</span>
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
