import React, { useState } from 'react';
import { Share2, MessageSquare, Facebook, Twitter, Link as LinkIcon, Check, Send } from 'lucide-react';

interface SocialShareProps {
  title: string;
  url: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ title, url }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsapp = `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`;
  const shareFacebook = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const shareTwitter = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
  const shareTelegram = `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`;

  return (
    <div className="my-8 pt-6 pb-6 border-t border-b border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-700">
          <Share2 className="w-4 h-4 text-amber-600" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Share this Article
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* WhatsApp */}
          <a
            href={shareWhatsapp}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-2xs"
            title="Share on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>

          {/* Facebook */}
          <a
            href={shareFacebook}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#1877F2] hover:bg-[#0c63d4] text-white text-xs font-semibold transition-colors shadow-2xs"
            title="Share on Facebook"
          >
            <Facebook className="w-3.5 h-3.5" />
            <span>Facebook</span>
          </a>

          {/* Twitter / X */}
          <a
            href={shareTwitter}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-black hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
            title="Share on X"
          >
            <Twitter className="w-3.5 h-3.5" />
            <span>X (Twitter)</span>
          </a>

          {/* Telegram */}
          <a
            href={shareTelegram}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#229ED9] hover:bg-[#1a85b9] text-white text-xs font-semibold transition-colors shadow-2xs"
            title="Share on Telegram"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram</span>
          </a>

          {/* Copy Link */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors border border-slate-300 cursor-pointer"
            title="Copy URL to Clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
