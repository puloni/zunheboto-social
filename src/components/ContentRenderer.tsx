import React, { useMemo } from 'react';
import { formatContent } from '../utils/contentRenderer';

interface ContentRendererProps {
  content?: string;
  className?: string;
}

export const ContentRenderer: React.FC<ContentRendererProps> = ({
  content,
  className = 'prose prose-slate prose-lg max-w-none font-serif text-slate-800 leading-relaxed space-y-4'
}) => {
  const html = useMemo(() => formatContent(content || ''), [content]);

  if (!html) return null;

  return (
    <div
      className={`content-rendered ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
