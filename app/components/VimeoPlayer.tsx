"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "../hooks/useUser"

interface VimeoPlayerProps {
  videoId: string
  title: string
  className?: string
  onLoad?: () => void
  onError?: (error: string) => void
}

export default function VimeoPlayer({ 
  videoId, 
  title, 
  className = "", 
  onLoad,
  onError 
}: VimeoPlayerProps) {
  const { user } = useUser()
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`vimeo-terms-${videoId}`)
      return stored === 'true'
    }
    return false
  })
  const [showTerms, setShowTerms] = useState(false)
  const [emailWatermarkOpacity, setEmailWatermarkOpacity] = useState(0) // Start at 0% opacity (hidden)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const loadSignedUrl = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/videos/vimeo/${videoId}/signed-url`, {
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setSignedUrl(data.signedUrl)
        setShowTerms(true)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to load video")
        onError?.(errorData.error || "Failed to load video")
      }
    } catch (err) {
      const errorMessage = "Network error loading video"
      setError(errorMessage)
      onError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [videoId, onError])

  useEffect(() => {
    if (user?.id && videoId) {
      loadSignedUrl()
    }
  }, [user?.id, videoId, loadSignedUrl])

  // Flash email watermark to 100% opacity for 7 seconds every 2 minutes
  useEffect(() => {
    if (signedUrl && termsAccepted) {
      const flashWatermark = () => {
        setEmailWatermarkOpacity(1.0) // Flash to 100% opacity
        setTimeout(() => {
          setEmailWatermarkOpacity(0) // Return to 0% opacity (hidden)
        }, 7000) // Flash for 7 seconds
      }
      
      // Flash immediately
      flashWatermark()
      
      // Then flash every 2 minutes (120,000 ms)
      const interval = setInterval(flashWatermark, 120000)
      
      return () => clearInterval(interval)
    }
  }, [signedUrl, termsAccepted])

  // Add CSS for fullscreen state - only run once
  useEffect(() => {
    // Check if styles are already added to avoid duplicates
    if (document.getElementById('vimeo-player-styles')) {
      return
    }
    
    const style = document.createElement('style')
    style.id = 'vimeo-player-styles'
    style.textContent = `
      #vimeo-container:fullscreen {
        background: black;
      }
      
      #vimeo-container:-webkit-full-screen {
        background: black;
      }
      
      #vimeo-container:-moz-full-screen {
        background: black;
      }
      
      #vimeo-container:-ms-fullscreen {
        background: black;
      }
      
      /* Ensure watermarks stay visible in fullscreen */
      #vimeo-container:fullscreen .absolute {
        position: absolute !important;
        z-index: 1000 !important;
      }
      
      #vimeo-container:-webkit-full-screen .absolute {
        position: absolute !important;
        z-index: 1000 !important;
      }
      
      #vimeo-container:-moz-full-screen .absolute {
        position: absolute !important;
        z-index: 1000 !important;
      }
      
      #vimeo-container:-ms-fullscreen .absolute {
        position: absolute !important;
        z-index: 1000 !important;
      }
      
    `
    document.head.appendChild(style)
    
    return () => {
      const existingStyle = document.getElementById('vimeo-player-styles')
      if (existingStyle) {
        document.head.removeChild(existingStyle)
      }
    }
  }, [])

  const acceptTerms = async () => {
    try {
      const response = await fetch(`/api/videos/vimeo/${videoId}/accept-terms`, {
        method: "POST",
        credentials: "include"
      })

      if (response.ok) {
        setTermsAccepted(true)
        setShowTerms(false)
        // Store in localStorage so it persists across page refreshes
        localStorage.setItem(`vimeo-terms-${videoId}`, 'true')
        onLoad?.()
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to accept terms")
      }
    } catch (err) {
      setError("Network error accepting terms")
    }
  }

  if (loading) {
    return (
      <div className={`aspect-video bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`aspect-video bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={loadSignedUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (showTerms && !termsAccepted) {
    return (
      <div className={`aspect-video bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white max-w-md mx-auto p-6">
          <h3 className="text-xl font-semibold mb-4">Terms of Service</h3>
          <div className="text-sm text-gray-300 mb-6 text-left space-y-2">
            <p>By accessing this video content, you agree to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Not share, download, or redistribute this content</li>
              <li>Use this content only for educational purposes</li>
              <li>Respect intellectual property rights</li>
              <li>Not attempt to bypass security measures</li>
            </ul>
            <p className="text-xs text-gray-400 mt-4">
              Your access is logged and monitored for security purposes.
            </p>
          </div>
          <button
            onClick={acceptTerms}
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            I Accept Terms
          </button>
        </div>
      </div>
    )
  }

  if (!signedUrl) {
    return (
      <div className={`aspect-video bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <p>Video not available</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative ${className}`}
      id="vimeo-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%'
      }}
    >
      {/* Vimeo Player */}
      <iframe
        ref={iframeRef}
        src={signedUrl}
        className="w-full h-full rounded-lg"
        frameBorder="0"
        allow="autoplay; picture-in-picture"
        title={title}
        onLoad={() => onLoad?.()}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
      
      {/* Security Warning Watermark - Top-right, slightly up */}
      <div 
        className="absolute pointer-events-none z-10"
        style={{ 
          top: 'calc(1 / 4 * 5%)', 
          right: 'calc(1 / 4 * 5%)' 
        }}
      >
        <div className="bg-red-600 bg-opacity-30 text-white text-xs px-3 py-2 rounded-lg">
          <div className="font-medium">SECURITY WARNING</div>
          <div className="opacity-90">Content is monitored and logged</div>
        </div>
      </div>

      {/* Email Watermark - Center, always visible with opacity flashing */}
      {user && (
        <div 
          className="absolute pointer-events-none z-20 flex items-center justify-center transition-opacity duration-300"
          style={{ 
            top: '50%', 
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: emailWatermarkOpacity
          }}
        >
          <div className="bg-black bg-opacity-50 text-white text-lg px-6 py-4 rounded-lg border-2 border-white">
            <div className="font-bold text-center">{user.email}</div>
            <div className="text-sm text-center mt-1">Protected Content - Do Not Record</div>
          </div>
        </div>
      )}

      {/* Fullscreen Button - Bottom-Right with calc positioning, moved up */}
      <button
        onClick={() => {
          const container = document.getElementById('vimeo-container')
          if (container) {
            if (container.requestFullscreen) {
              container.requestFullscreen()
            } else if ((container as any).webkitRequestFullscreen) {
              (container as any).webkitRequestFullscreen()
            } else if ((container as any).mozRequestFullScreen) {
              (container as any).mozRequestFullScreen()
            } else if ((container as any).msRequestFullscreen) {
              (container as any).msRequestFullscreen()
            }
          }
        }}
        className="absolute bg-black text-white p-2 rounded-lg hover:bg-gray-800 transition-all z-10"
        style={{ 
          bottom: 'calc(var(--spacing) * 15)', 
          right: 'calc(var(--spacing) * 2)' 
        }}
        title="Fullscreen"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </button>
    </div>
  )
}
