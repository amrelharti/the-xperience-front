import React from 'react';
import { ExternalLink, FileText, Youtube, Image as ImageIcon, File, Link as LinkIcon, Music, Video } from 'lucide-react';

interface LinkPreviewCardProps {
  url: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface LinkMetadata {
  title: string;
  icon: React.ReactNode;
  domain: string;
  color: string;
  bgColor: string;
  borderColor: string;
  thumbnail?: string;
}

/**
 * Detects the type of link and returns appropriate metadata
 */
function getLinkMetadata(url: string): LinkMetadata {
  const urlLower = url.toLowerCase();
  
  // Google Drive
  if (urlLower.includes('drive.google.com') || urlLower.includes('docs.google.com')) {
    const isDoc = urlLower.includes('/document/');
    const isSheet = urlLower.includes('/spreadsheets/');
    const isSlides = urlLower.includes('/presentation/');
    
    let title = 'Google Drive File';
    if (isDoc) title = 'Google Doc';
    else if (isSheet) title = 'Google Sheet';
    else if (isSlides) title = 'Google Slides';
    
    return {
      title,
      icon: <FileText className="h-5 w-5" />,
      domain: 'drive.google.com',
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      thumbnail: '📄'
    };
  }
  
  // YouTube
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return {
      title: 'YouTube Video',
      icon: <Youtube className="h-5 w-5" />,
      domain: 'youtube.com',
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      thumbnail: '🎥'
    };
  }
  
  // GitHub
  if (urlLower.includes('github.com')) {
    return {
      title: 'GitHub Repository',
      icon: <File className="h-5 w-5" />,
      domain: 'github.com',
      color: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
      thumbnail: '💻'
    };
  }
  
  // Dropbox
  if (urlLower.includes('dropbox.com')) {
    return {
      title: 'Dropbox File',
      icon: <FileText className="h-5 w-5" />,
      domain: 'dropbox.com',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      thumbnail: '📦'
    };
  }
  
  // OneDrive
  if (urlLower.includes('onedrive.live.com') || urlLower.includes('1drv.ms')) {
    return {
      title: 'OneDrive File',
      icon: <FileText className="h-5 w-5" />,
      domain: 'onedrive.com',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      thumbnail: '☁️'
    };
  }
  
  // Image files
  if (urlLower.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) {
    return {
      title: 'Image File',
      icon: <ImageIcon className="h-5 w-5" />,
      domain: new URL(url).hostname,
      color: 'text-purple-700',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      thumbnail: '🖼️'
    };
  }
  
  // Video files
  if (urlLower.match(/\.(mp4|webm|mov|avi|mkv)(\?|$)/)) {
    return {
      title: 'Video File',
      icon: <Video className="h-5 w-5" />,
      domain: new URL(url).hostname,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      thumbnail: '🎬'
    };
  }
  
  // Audio files
  if (urlLower.match(/\.(mp3|wav|ogg|m4a)(\?|$)/)) {
    return {
      title: 'Audio File',
      icon: <Music className="h-5 w-5" />,
      domain: new URL(url).hostname,
      color: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      thumbnail: '🎵'
    };
  }
  
  // PDF files
  if (urlLower.match(/\.pdf(\?|$)/)) {
    return {
      title: 'PDF Document',
      icon: <FileText className="h-5 w-5" />,
      domain: new URL(url).hostname,
      color: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      thumbnail: '📕'
    };
  }
  
  // Default/Generic link
  try {
    const domain = new URL(url).hostname;
    return {
      title: 'External Link',
      icon: <LinkIcon className="h-5 w-5" />,
      domain,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      thumbnail: '🔗'
    };
  } catch {
    return {
      title: 'Link',
      icon: <LinkIcon className="h-5 w-5" />,
      domain: url,
      color: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      thumbnail: '🔗'
    };
  }
}

export const LinkPreviewCard: React.FC<LinkPreviewCardProps> = ({ url, onClick }) => {
  const metadata = getLinkMetadata(url);
  
  // Create the href (add https:// if it starts with www.)
  let href = url;
  if (url.startsWith('www.')) {
    href = `https://${url}`;
  }
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`
        my-3 block max-w-xl transition-all duration-300 
        rounded-xl border-2 ${metadata.borderColor} ${metadata.bgColor}
        hover:shadow-lg hover:shadow-${metadata.color}/20 hover:-translate-y-0.5
        overflow-hidden group
      `}
    >
      <div className="p-4">
        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-3">
          {/* Thumbnail/Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-lg ${metadata.bgColor} border ${metadata.borderColor} flex items-center justify-center text-2xl shadow-sm`}>
            {metadata.thumbnail}
          </div>
          
          {/* Title and domain */}
          <div className="flex-1 min-w-0">
            <h4 className={`font-semibold text-base ${metadata.color} mb-1 group-hover:underline transition-all flex items-center gap-2`}>
              {metadata.title}
              <ExternalLink className="h-4 w-4 opacity-70" />
            </h4>
            <p className="text-xs text-gray-600 truncate font-mono bg-white/50 px-2 py-0.5 rounded">
              {metadata.domain}
            </p>
          </div>
        </div>
        
        {/* URL preview (truncated) */}
        <div className="mt-2 pt-3 border-t border-gray-200/50">
          <p className="text-xs text-gray-500 truncate font-medium">
            {url}
          </p>
        </div>
      </div>
    </a>
  );
};

