"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useUser } from "../hooks/useUser"

interface VimeoPlayerProps {
  videoId: string
  title: string
  className?: string
  onLoad?: () => void
  onError?: (error: string) => void
  onEnded?: () => void
  onPlayTimeUpdate?: (playTimeSeconds: number) => void
}

export default function VimeoPlayer({ 
  videoId, 
  title, 
  className = "", 
  onLoad,
  onError,
  onEnded,
  onPlayTimeUpdate
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

  // Listen for Vimeo player events and track play time
  const [totalPlayTime, setTotalPlayTime] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [lastPlaySecond, setLastPlaySecond] = useState(0)
  
  useEffect(() => {
    if (!onEnded) return
    
    let videoDuration = 0
    let hasTriggeredEnded = false // Prevent multiple calls
    let playTimeAccumulated = 0
    let lastKnownSecond = 0
    
    const handleMessage = (event: MessageEvent) => {
      console.log("📬 Vimeo message received from:", event.origin, "data:", event.data)
      if (event.origin !== 'https://player.vimeo.com') return
      
      const data = event.data
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          console.log("📺 Parsed Vimeo event:", parsed.event)
          
          if (parsed.event === 'finish') {
            console.log("✅ Video finished! Calling onEnded callback")
            if (!hasTriggeredEnded) {
              hasTriggeredEnded = true
              onEnded()
            }
          } else if (parsed.event === 'ended') {
            console.log("🏁 Video ended! Calling onEnded callback")
            if (!hasTriggeredEnded) {
              hasTriggeredEnded = true
              onEnded()
            }
          } else if (parsed.event === 'playProgress' && parsed.data) {
            // Track play progress and trigger onEnded when we reach the end
            const { seconds, duration, percent } = parsed.data
            videoDuration = duration || 0
            
            console.log("📊 playProgress data:", parsed.data)
            
            // Track play time
            if (seconds > lastKnownSecond) {
              playTimeAccumulated += (seconds - lastKnownSecond)
              lastKnownSecond = seconds
              
              console.log("⏱️ Updating play time:", playTimeAccumulated, "onPlayTimeUpdate exists:", !!onPlayTimeUpdate)
              
              // Notify parent of play time
              if (onPlayTimeUpdate) {
                onPlayTimeUpdate(playTimeAccumulated)
              }
            }
            
            console.log("▶️ Play progress:", { seconds, duration, playTime: playTimeAccumulated })
            
            // If we're within 2 seconds of the end OR at 95%+, consider it finished
            if (duration > 0) {
              const secondsRemaining = duration - seconds
              const hasReachedEnd = secondsRemaining <= 2 || percent >= 0.95
              
              if (hasReachedEnd && !hasTriggeredEnded) {
                console.log("⏰ Video reached end! Calling onEnded callback", { seconds, duration, percent, secondsRemaining })
                hasTriggeredEnded = true
                onEnded()
              }
            }
          } else if (parsed.event === 'pause') {
            console.log("⏸️ Video paused")
          } else if (parsed.event === 'play') {
            console.log("▶️ Video playing")
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onEnded])

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
        <div className="text-center text-white px-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3 sm:mb-4"></div>
          <p className="text-sm sm:text-base">Loading video...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`aspect-video bg-black rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-white px-4">
          <p className="text-red-400 mb-3 sm:mb-4 text-sm sm:text-base">{error}</p>
          <button 
            onClick={loadSignedUrl}
            className="px-4 py-2 bg-blue-600 text-white text-sm sm:text-base rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (showTerms && !termsAccepted) {
    return (
      <div className={`bg-black rounded-lg flex items-center justify-center p-3 sm:p-6 ${className}`}>
        <div className="text-center text-white w-full max-w-lg">
          <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">Usage Rules</h3>
          <div className="text-xs sm:text-sm text-gray-300 mb-3 sm:mb-4 text-left space-y-1 sm:space-y-2">
            <p className="font-medium text-center sm:text-left">By accessing this video content, you agree to:</p>
            <ul className="list-disc list-inside space-y-0.5 sm:space-y-1 pl-1 sm:pl-2">
              <li className="leading-snug sm:leading-relaxed">Not share, download, or redistribute this content</li>
              <li className="leading-snug sm:leading-relaxed">Use this content only for educational purposes</li>
            </ul>
          </div>
          <button
            onClick={acceptTerms}
            className="w-full px-4 sm:px-6 py-2.5 sm:py-3 bg-green-600 text-white text-xs sm:text-base rounded-lg hover:bg-green-700 active:bg-green-800 font-medium transition-colors shadow-lg touch-manipulation"
          >
            ✓ I Accept Terms
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
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title={title}
        onLoad={() => onLoad?.()}
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
      />
      
      {/* Security Warning Watermark - Top-right, responsive */}
      <div 
        className="absolute pointer-events-none z-10 top-2 right-2 sm:top-3 sm:right-3"
      >
        <div className="bg-red-600 bg-opacity-30 text-white text-[9px] sm:text-xs px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg">
          <div className="font-medium">SECURITY WARNING</div>
          <div className="opacity-90 hidden sm:block">Content is monitored and logged</div>
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
          <div className="bg-black bg-opacity-50 text-white text-sm sm:text-lg px-4 py-2 sm:px-6 sm:py-4 rounded-lg border-2 border-white max-w-[90%]">
            <div className="font-bold text-center truncate">{user.email}</div>
            <div className="text-xs sm:text-sm text-center mt-0.5 sm:mt-1">Protected Content - Do Not Record</div>
          </div>
        </div>
      )}

      {/* Fullscreen Button - Bottom-Right, responsive positioning */}
      <button
        onClick={() => {
          // Try iframe first (works better on mobile)
          const iframe = iframeRef.current
          if (iframe) {
            // Try standard fullscreen on iframe
            if (iframe.requestFullscreen) {
              iframe.requestFullscreen().catch(() => {
                // Fallback to container
                tryContainerFullscreen()
              })
            } else if ((iframe as any).webkitRequestFullscreen) {
              (iframe as any).webkitRequestFullscreen()
            } else if ((iframe as any).webkitEnterFullscreen) {
              // iOS Safari specific
              (iframe as any).webkitEnterFullscreen()
            } else if ((iframe as any).mozRequestFullScreen) {
              (iframe as any).mozRequestFullScreen()
            } else if ((iframe as any).msRequestFullscreen) {
              (iframe as any).msRequestFullscreen()
            } else {
              // Fallback to container
              tryContainerFullscreen()
            }
          }

          function tryContainerFullscreen() {
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
          }
        }}
        className="absolute bg-black bg-opacity-70 text-white p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all z-10 bottom-16 sm:bottom-20 right-2 sm:right-3 touch-manipulation"
        title="Fullscreen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:w-4 sm:h-4">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
      </button>
    </div>
  )
}
