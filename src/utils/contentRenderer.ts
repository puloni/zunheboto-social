import { marked } from 'marked';

// Configure marked with GFM and line breaks
marked.setOptions({
  gfm: true,
  breaks: true
});

// Disable CommonMark indented code blocks (so 4+ leading spaces never convert articles/paragraphs into <pre><code>)
marked.use({
  tokenizer: {
    code() {
      // Returning undefined disables indented code blocks while preserving fenced (```) code blocks
      return undefined;
    }
  }
});

/**
 * Strips leading indentation from multiline template strings or indented HTML,
 * while strictly preserving indentation inside fenced code blocks (``` ... ```).
 */
function cleanIndentation(content: string): string {
  if (!content) return '';
  const lines = content.split('\n');
  let inFencedBlock = false;
  return lines
    .map((line) => {
      if (line.trim().startsWith('```')) {
        inFencedBlock = !inFencedBlock;
        return line;
      }
      if (inFencedBlock) {
        return line;
      }
      // Strip common leading whitespace from template literals and indented HTML tags
      return line.replace(/^[ \t]{2,}/, '');
    })
    .join('\n')
    .trim();
}

/**
 * Transforms raw text containing plain text, Markdown, HTML, and/or media embeds
 * into a safe, valid, beautifully rendered HTML string for display.
 */
export function formatContent(rawContent?: string): string {
  if (!rawContent || typeof rawContent !== 'string') return '';

  let text = cleanIndentation(rawContent);

  // Auto-embed YouTube URLs (watch, shorts, embed, youtu.be), including when wrapped in <p> or <p><a...>
  const youtubeRegex = /(?:<p>(?:<a[^>]*>)?\s*)?(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S*)?(?:\s*(?:<\/a>)?<\/p>)?/gi;
  text = text.replace(youtubeRegex, (_match, videoId) => {
    return `<div class="aspect-video w-full my-6 rounded-xl overflow-hidden bg-slate-900 shadow-sm"><iframe src="https://www.youtube.com/embed/${videoId}" class="w-full h-full" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
  });

  // Auto-embed Vimeo URLs
  const vimeoRegex = /(?:<p>(?:<a[^>]*>)?\s*)?(?:https?:\/\/)?(?:www\.)?vimeo\.com\/([0-9]+)(?:\S*)?(?:\s*(?:<\/a>)?<\/p>)?/gi;
  text = text.replace(vimeoRegex, (_match, videoId) => {
    return `<div class="aspect-video w-full my-6 rounded-xl overflow-hidden bg-slate-900 shadow-sm"><iframe src="https://player.vimeo.com/video/${videoId}" class="w-full h-full" title="Vimeo video player" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div>`;
  });

  try {
    const parsed = marked.parse(text, { async: false }) as string;
    return parsed;
  } catch (err) {
    console.error('Failed to parse markdown content:', err);
    // Fallback: return cleaned content
    return text;
  }
}

