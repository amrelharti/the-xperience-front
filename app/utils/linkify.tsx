import React from 'react';
import { ExternalLink } from 'lucide-react';

/**
 * Detects URLs in text and converts them to clickable links
 * @param text - The text content to process
 * @returns JSX with clickable links
 */
export function linkifyText(text: string): React.ReactNode {
  if (!text) return text;

  // Regular expression to match URLs
  // Matches http://, https://, and www. URLs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  urlRegex.lastIndex = 0;

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const startIndex = match.index;

    // Add text before the URL
    if (startIndex > lastIndex) {
      parts.push(text.substring(lastIndex, startIndex));
    }

    // Create the href (add https:// if it starts with www.)
    let href = url;
    if (url.startsWith('www.')) {
      href = `https://${url}`;
    }

    // Add the clickable link
    parts.push(
      <a
        key={startIndex}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
        className="text-[#0476D7] hover:text-[#0068A7] underline decoration-2 underline-offset-2 hover:decoration-[#FFBC00] transition-all inline-flex items-center gap-1 font-medium break-all"
      >
        {url}
        <ExternalLink className="h-3 w-3 inline-block flex-shrink-0" />
      </a>
    );

    lastIndex = startIndex + url.length;
  }

  // Add remaining text after the last URL
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no URLs were found, return the original text
  return parts.length > 0 ? parts : text;
}

/**
 * Component wrapper for linkified text with whitespace preservation
 */
export const LinkifiedText: React.FC<{ 
  text: string; 
  className?: string;
}> = ({ text, className = '' }) => {
  return (
    <span className={className}>
      {linkifyText(text)}
    </span>
  );
};

