import React, { useState } from 'react';
import { useCms } from '../context/CmsContext';
import { ArrowLeft, Copy, Check, FileCode } from 'lucide-react';

interface SitemapRobotsViewProps {
  type: 'sitemap' | 'robots';
}

export const SitemapRobotsView: React.FC<SitemapRobotsViewProps> = ({ type }) => {
  const { articles, listings, pages, navigateTo } = useCms();
  const [copied, setCopied] = useState(false);

  const baseUrl = 'https://zunheboto.social';
  const today = new Date().toISOString().split('T')[0];

  let content = '';

  if (type === 'sitemap') {
    content = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Static Pages -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/directory</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/classifieds</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>
  <url>
    <loc>${baseUrl}/gallery</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- Published Articles -->
${articles
  .filter((a) => a.status === 'published')
  .map(
    (a) => `  <url>
    <loc>${baseUrl}/article/${a.slug}</loc>
    <lastmod>${a.published_at.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}

  <!-- Directory Listings -->
${listings
  .filter((l) => l.status === 'published')
  .map(
    (l) => `  <url>
    <loc>${baseUrl}/listing/${l.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
  } else {
    content = `# Zunheboto Social Robots.txt Rules
User-agent: *
Allow: /
Allow: /articles
Allow: /directory
Allow: /gallery
Allow: /article/*
Allow: /listing/*
Allow: /about
Allow: /contact

# Disallow CMS Administrative backend from indexing
Disallow: /admin
Disallow: /admin/*
Disallow: /install
Disallow: /install/*
Disallow: /includes/
Disallow: /config.php

Sitemap: ${baseUrl}/sitemap.xml
`;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
        <a
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-[#0B192C] flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </a>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied' : 'Copy Content'}</span>
        </button>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-700 mb-1">
          <FileCode className="w-4 h-4" /> SEO File Viewer
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#0B192C]">
          {type === 'sitemap' ? 'sitemap.xml' : 'robots.txt'}
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {type === 'sitemap'
            ? 'Dynamic XML sitemap auto-indexing all public articles and directory items.'
            : 'Robots.txt crawler instructions ensuring SEO optimization and protecting administrative paths.'}
        </p>
      </div>

      <pre className="bg-slate-900 text-slate-100 p-6 rounded-2xl overflow-x-auto text-xs font-mono border border-slate-800 shadow-inner">
        {content}
      </pre>
    </div>
  );
};
