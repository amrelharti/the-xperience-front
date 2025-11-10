'use client';

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
  // For data URIs, match everything after 'data:' until whitespace
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(data:[^\s]+)/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  // Reset regex lastIndex
  urlRegex.lastIndex = 0;

  // Debug: Log text being processed
  console.log('🔍 Linkifying text:', text.substring(0, 100) + (text.length > 100 ? '...' : ''));

  while ((match = urlRegex.exec(text)) !== null) {
    const url = match[0];
    const startIndex = match.index;

    // Debug: Log matched URL
    console.log('✅ Found URL:', url.substring(0, 50) + (url.length > 50 ? '...' : ''), 'Type:', url.startsWith('data:') ? 'data URI' : url.startsWith('http') ? 'http' : 'www');

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

  // Debug: Log results
  console.log('📊 Total parts found:', parts.length, '| URLs detected:', parts.filter(p => typeof p === 'object').length);

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

