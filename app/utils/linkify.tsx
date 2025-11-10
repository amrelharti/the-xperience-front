import React from 'react';
import { ExternalLink } from 'lucide-react';
import { LinkPreviewCard } from '@/app/components/LinkPreviewCard';

/**
 * Detects URLs in text and converts them to clickable link preview cards
 * @param text - The text content to process
 * @returns JSX with link preview cards
 */
export function linkifyText(text: string): React.ReactNode {
  if (!text) return text;

  // Regular expression to match URLs
  // Matches http://, https://, www. URLs, and data: URIs
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(data:[^\s]+)/gi;

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

    // Add the link preview card
    parts.push(
      <LinkPreviewCard
        key={startIndex}
        url={url}
        onClick={(e) => e.stopPropagation()}
      />
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

