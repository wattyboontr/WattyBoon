import React from 'react';

interface FormattedContentProps {
  content: string;
  className?: string;
  paragraphClassName?: string;
  onParagraphContextMenu?: (e: React.MouseEvent, index: number) => void;
  onParagraphMouseUp?: (e: React.MouseEvent, index: number) => void;
}

export const FormattedContent: React.FC<FormattedContentProps> = ({
  content,
  className = '',
  paragraphClassName = '',
  onParagraphContextMenu,
  onParagraphMouseUp,
}) => {
  if (!content || !content.trim()) {
    return null;
  }

  // Split into lines/paragraphs
  const paragraphs = content.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {paragraphs.map((text, idx) => {
        // 1. Check for Markdown Image syntax: ![alt](url)
        const mdImageMatch = text.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
        if (mdImageMatch) {
          const altText = mdImageMatch[1];
          const imgUrl = mdImageMatch[2];
          return (
            <div 
              key={idx} 
              onContextMenu={(e) => onParagraphContextMenu && onParagraphContextMenu(e, idx)}
              onMouseUp={(e) => onParagraphMouseUp && onParagraphMouseUp(e, idx)}
              onTouchEnd={(e) => onParagraphMouseUp && onParagraphMouseUp(e as any, idx)}
              className="my-6 flex flex-col items-center justify-center group"
            >
              <div className="relative max-w-full overflow-hidden rounded-none border-0 p-0 shadow-none bg-transparent">
                <img
                  src={imgUrl}
                  alt={altText || 'Hikaye Görseli'}
                  className="max-h-[550px] w-auto max-w-full object-contain rounded-none border-0 shadow-none transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
              {altText && altText !== 'Görsel' && altText !== 'Görsel Açıklaması' && (
                <span className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium italic text-center">
                  🖼️ {altText}
                </span>
              )}
            </div>
          );
        }

        // 2. Check for standalone Image URL (http... or data:image...)
        const isStandaloneImage = /^https?:\/\/[^\s]+\.(?:jpg|jpeg|png|gif|webp|svg)(\?[^\s]*)?$/i.test(text) ||
          /^data:image\/[a-zA-Z]+;base64,/i.test(text);
        if (isStandaloneImage) {
          return (
            <div 
              key={idx} 
              onContextMenu={(e) => onParagraphContextMenu && onParagraphContextMenu(e, idx)}
              onMouseUp={(e) => onParagraphMouseUp && onParagraphMouseUp(e, idx)}
              onTouchEnd={(e) => onParagraphMouseUp && onParagraphMouseUp(e as any, idx)}
              className="my-6 flex flex-col items-center justify-center group"
            >
              <div className="relative max-w-full overflow-hidden rounded-none border-0 p-0 shadow-none bg-transparent">
                <img
                  src={text}
                  alt="Hikaye Görseli"
                  className="max-h-[550px] w-auto max-w-full object-contain rounded-none border-0 shadow-none transition-transform duration-300 group-hover:scale-[1.01]"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800';
                  }}
                />
              </div>
            </div>
          );
        }

        // 3. Inline image inside paragraph text
        const inlineMdRegex = /!\[([^\]]*)\]\(([^)]+)\)/;
        if (inlineMdRegex.test(text)) {
          const parts: React.ReactNode[] = [];
          let remaining = text;
          let matchKey = 0;

          while (remaining) {
            const match = inlineMdRegex.exec(remaining);
            if (!match) {
              parts.push(remaining);
              break;
            }

            const prefix = remaining.substring(0, match.index);
            if (prefix) parts.push(prefix);

            const alt = match[1];
            const url = match[2];

            parts.push(
              <span key={matchKey++} className="block my-4 text-center">
                <span className="inline-block relative max-w-full overflow-hidden rounded-none border-0 p-0 shadow-none bg-transparent">
                  <img
                    src={url}
                    alt={alt || 'Görsel'}
                    className="max-h-[480px] w-auto max-w-full rounded-none border-0 object-contain shadow-none"
                    loading="lazy"
                  />
                </span>
                {alt && alt !== 'Görsel' && alt !== 'Görsel Açıklaması' && (
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-1 italic">
                    {alt}
                  </span>
                )}
              </span>
            );

            remaining = remaining.substring(match.index + match[0].length);
          }

          return (
            <div
              key={idx}
              onContextMenu={(e) => onParagraphContextMenu && onParagraphContextMenu(e, idx)}
              onMouseUp={(e) => onParagraphMouseUp && onParagraphMouseUp(e, idx)}
              onTouchEnd={(e) => onParagraphMouseUp && onParagraphMouseUp(e as any, idx)}
              className={paragraphClassName}
            >
              <div className="leading-relaxed">{parts}</div>
            </div>
          );
        }

        // 4. Headers
        if (text.startsWith('# ')) {
          return <h2 key={idx} className="text-2xl font-bold font-display my-3 text-purple-700 dark:text-purple-300">{text.replace('# ', '')}</h2>;
        }
        if (text.startsWith('## ')) {
          return <h3 key={idx} className="text-xl font-bold font-display my-2 text-purple-600 dark:text-purple-400">{text.replace('## ', '')}</h3>;
        }

        // 5. Blockquotes
        if (text.startsWith('> ')) {
          return (
            <blockquote key={idx} className="border-l-4 border-purple-500 pl-4 py-2 italic text-slate-700 dark:text-slate-300 bg-purple-500/10 rounded-r-xl my-3">
              {text.replace('> ', '')}
            </blockquote>
          );
        }

        // Standard Paragraph
        return (
          <div
            key={idx}
            onContextMenu={(e) => onParagraphContextMenu && onParagraphContextMenu(e, idx)}
            onMouseUp={(e) => onParagraphMouseUp && onParagraphMouseUp(e, idx)}
            onTouchEnd={(e) => onParagraphMouseUp && onParagraphMouseUp(e as any, idx)}
            className={paragraphClassName}
          >
            <p className="leading-relaxed">{text}</p>
          </div>
        );
      })}
    </div>
  );
};
