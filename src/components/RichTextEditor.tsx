import React, { useState, useRef, useMemo } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Eye,
  Minus,
  Film,
  X,
  PenLine,
  Columns,
  Sparkles
} from 'lucide-react';
import { MediaPickerModal } from './MediaPickerModal';
import { formatContent } from '../utils/contentRenderer';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
  minHeight?: string;
  id?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your article or page content here (supports formatting, Markdown, HTML, and media embeds)...',
  minHeight = '380px',
  id = 'rich-text-textarea'
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [useMonoFont, setUseMonoFont] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const [embedInput, setEmbedInput] = useState('');
  const [embedCaption, setEmbedCaption] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Statistics
  const { wordCount, charCount, readTime } = useMemo(() => {
    const textOnly = (value || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/[#*_~`>[\]()]/g, ' ')
      .trim();
    const words = textOnly ? textOnly.split(/\s+/).filter(Boolean).length : 0;
    const chars = value ? value.length : 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return { wordCount: words, charCount: chars, readTime: minutes };
  }, [value]);

  const insertTag = (openTag: string, closeTag = '') => {
    const textarea = textareaRef.current || (document.getElementById(id) as HTMLTextAreaElement);
    if (!textarea) {
      onChange(value + openTag + (closeTag ? 'Text' + closeTag : ''));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const replacement = `${openTag}${selectedText || 'Text'}${closeTag}`;
    const newValue = value.substring(0, start) + replacement + value.substring(end);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + openTag.length,
        start + openTag.length + (selectedText ? selectedText.length : 4)
      );
    }, 50);
  };

  const handleInsertLink = () => {
    const url = prompt('Enter link URL (e.g. https://zunheboto.social/directory):');
    if (url) {
      insertTag(`[`, `](${url})`);
    }
  };

  const handleImageSelected = (url: string) => {
    const imgHtml = `\n<figure class="my-6">\n  <img src="${url}" alt="Photo" class="rounded-xl shadow-sm w-full object-cover" />\n  <figcaption class="text-xs text-slate-500 mt-2 text-center">Photo caption here</figcaption>\n</figure>\n`;
    onChange(value + imgHtml);
  };

  const handleInsertEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = embedInput.trim();
    if (!raw) return;

    let finalEmbed = '';
    const youtubeMatch = raw.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);

    if (youtubeMatch && youtubeMatch[1]) {
      const videoId = youtubeMatch[1];
      finalEmbed = `\n<div class="aspect-video w-full my-6 rounded-xl overflow-hidden bg-slate-900 shadow-sm">\n  <iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>\n</div>\n`;
    } else if (raw.includes('<iframe')) {
      finalEmbed = `\n<div class="my-6 rounded-xl overflow-hidden shadow-sm max-w-full">\n  ${raw}\n</div>\n`;
    } else {
      finalEmbed = `\n<div class="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50">\n  ${raw}\n</div>\n`;
    }

    if (embedCaption.trim()) {
      finalEmbed += `<p class="text-xs text-slate-500 mt-1 text-center font-sans">${embedCaption.trim()}</p>\n`;
    }

    onChange(value + finalEmbed);
    setEmbedInput('');
    setEmbedCaption('');
    setEmbedModalOpen(false);
  };

  return (
    <div className="border border-slate-300 rounded-2xl overflow-hidden bg-white shadow-xs transition-all">
      {/* Editorial Toolbar */}
      <div className="bg-slate-50/90 border-b border-slate-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Formatting actions */}
        <div className="flex flex-wrap items-center gap-1">
          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => insertTag('## ', '')}
              title="Heading 2 (## Title)"
              className="px-2 py-1 rounded text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-0.5 text-xs font-bold cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5 text-slate-700" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('### ', '')}
              title="Heading 3 (### Subtitle)"
              className="px-2 py-1 rounded text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-0.5 text-xs font-bold cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5 text-slate-700" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => insertTag('**', '**')}
              title="Bold (**text**)"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('*', '*')}
              title="Italic (*text*)"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200/80 shadow-2xs">
            <button
              type="button"
              onClick={() => insertTag('> ', '')}
              title="Blockquote (> text)"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('- ', '')}
              title="Bullet List (- item)"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertTag('1. ', '')}
              title="Numbered List (1. item)"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onChange(value + '\n\n---\n\n')}
              title="Horizontal Divider"
              className="p-1.5 rounded text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleInsertLink}
              title="Insert Hyperlink"
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setMediaPickerOpen(true)}
              title="Insert Photo from Media Library"
              className="px-2.5 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>Add Photo</span>
            </button>
            <button
              type="button"
              onClick={() => setEmbedModalOpen(true)}
              title="Insert Video Embed (YouTube, Vimeo, iframe)"
              className="px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 hover:bg-indigo-100 transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            >
              <Film className="w-3.5 h-3.5 text-indigo-600" />
              <span>Embed</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 ml-auto">
          <button
            type="button"
            onClick={() => setUseMonoFont(!useMonoFont)}
            title={useMonoFont ? 'Switch to Sans Font' : 'Switch to Code / Monospace Font'}
            className={`p-1.5 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              useMonoFont
                ? 'bg-slate-800 text-white border-slate-800'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 text-xs font-semibold shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`hidden md:inline-flex px-3 py-1.5 rounded-md transition-colors items-center gap-1.5 cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-[#0B192C] text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor Body */}
      {viewMode === 'edit' && (
        <div className="relative">
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className={`w-full p-4 sm:p-6 text-slate-800 focus:outline-none bg-white leading-relaxed resize-y ${
              useMonoFont ? 'font-mono text-xs sm:text-sm' : 'font-sans text-sm sm:text-base'
            }`}
          />
        </div>
      )}

      {viewMode === 'preview' && (
        <div style={{ minHeight }} className="p-4 sm:p-8 bg-white overflow-y-auto">
          <div className="mb-4 pb-2 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              Live Formatted Preview
            </span>
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className="text-amber-700 hover:underline font-semibold cursor-pointer"
            >
              Back to Editor
            </button>
          </div>
          {value ? (
            <div
              className="content-rendered prose prose-slate prose-base sm:prose-lg max-w-none font-serif leading-relaxed text-slate-800 space-y-4"
              dangerouslySetInnerHTML={{ __html: formatContent(value) }}
            />
          ) : (
            <p className="text-slate-400 italic text-sm">Nothing to preview yet. Switch to "Write" to start typing.</p>
          )}
        </div>
      )}

      {viewMode === 'split' && (
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          <textarea
            id={id}
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            style={{ minHeight }}
            className={`w-full p-4 font-mono text-xs sm:text-sm text-slate-800 focus:outline-none bg-white resize-y ${
              useMonoFont ? 'font-mono text-xs' : 'font-sans text-sm'
            }`}
          />
          <div
            style={{ minHeight }}
            className="p-4 sm:p-6 bg-slate-50/40 overflow-y-auto max-w-none text-sm text-slate-800 leading-relaxed font-sans"
          >
            <div className="text-[10px] uppercase font-bold text-slate-400 mb-3 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Formatted Output</span>
              <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Live
              </span>
            </div>
            {value ? (
              <div
                className="content-rendered prose prose-slate prose-sm max-w-none font-serif leading-relaxed text-slate-800 space-y-3"
                dangerouslySetInnerHTML={{ __html: formatContent(value) }}
              />
            ) : (
              <p className="text-slate-400 italic text-xs">Preview will appear here as you type...</p>
            )}
          </div>
        </div>
      )}

      {/* Editorial Status Footer */}
      <div className="bg-slate-50 border-t border-slate-200 px-3.5 py-2 flex flex-wrap items-center justify-between text-xs text-slate-500 font-sans gap-2">
        <div className="flex items-center gap-3 text-slate-600">
          <span className="font-semibold text-slate-700">{wordCount} words</span>
          <span className="text-slate-300">•</span>
          <span>{charCount.toLocaleString()} characters</span>
          <span className="text-slate-300">•</span>
          <span className="text-amber-700 font-medium">~{readTime} min read</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-400">
          <span>Formatting, Markdown &amp; HTML supported</span>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleImageSelected}
        title="Insert Media into Content"
      />

      {/* Embed Modal */}
      {embedModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-indigo-600" />
                <h3 className="font-serif font-bold text-slate-900 text-base">Insert Media Embed</h3>
              </div>
              <button
                type="button"
                onClick={() => setEmbedModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInsertEmbed} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Embed Code or Video URL <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={embedInput}
                  onChange={(e) => setEmbedInput(e.target.value)}
                  placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=...) or Vimeo link or iframe code..."
                  className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Auto-formats YouTube and Vimeo links into responsive players.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Optional Caption / Credit
                </label>
                <input
                  type="text"
                  value={embedCaption}
                  onChange={(e) => setEmbedCaption(e.target.value)}
                  placeholder="e.g. Video coverage by Sumi Media"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEmbedModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs cursor-pointer"
                >
                  Insert Embed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
