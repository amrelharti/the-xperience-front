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
  const [vimeoPlayerReady, setVimeoPlayerReady] = useState(false)
  const [isPseudoFullscreen, setIsPseudoFullscreen] = useState(false)

  // Handle escape key to exit pseudo-fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPseudoFullscreen) {
        setIsPseudoFullscreen(false)
        document.body.style.overflow = ''
        console.log('❌ Exited pseudo-fullscreen via Escape key')
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isPseudoFullscreen])

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

  // Listen for Vimeo player ready event
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://player.vimeo.com') return
      
      const data = event.data
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data)
          if (parsed.event === 'ready') {
            console.log('✅ Vimeo player is ready')
            setVimeoPlayerReady(true)
          }
        } catch (e) {
          // Ignore non-JSON messages
        }
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

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
  }, [onEnded, onPlayTimeUpdate])

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
      /* Fullscreen container styles */
      #vimeo-container:fullscreen {
        background: black;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      #vimeo-container:-webkit-full-screen {
        background: black;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      #vimeo-container:-moz-full-screen {
        background: black;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      #vimeo-container:-ms-fullscreen {
        background: black;
        width: 100vw !important;
        height: 100vh !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      /* Ensure iframe fills the fullscreen container */
      #vimeo-container:fullscreen iframe,
      #vimeo-container:-webkit-full-screen iframe,
      #vimeo-container:-moz-full-screen iframe,
      #vimeo-container:-ms-fullscreen iframe {
        width: 100% !important;
        height: 100% !important;
        max-width: 100vw !important;
        max-height: 100vh !important;
      }
      
      /* Ensure watermarks stay visible and properly positioned in fullscreen */
      #vimeo-container:fullscreen #security-watermark,
      #vimeo-container:-webkit-full-screen #security-watermark,
      #vimeo-container:-moz-full-screen #security-watermark,
      #vimeo-container:-ms-fullscreen #security-watermark,
      #vimeo-container:fullscreen #email-watermark,
      #vimeo-container:-webkit-full-screen #email-watermark,
      #vimeo-container:-moz-full-screen #email-watermark,
      #vimeo-container:-ms-fullscreen #email-watermark {
        position: absolute !important;
        z-index: 2147483647 !important;
        display: flex !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Make watermarks larger and more visible in fullscreen */
      #vimeo-container:fullscreen #security-watermark,
      #vimeo-container:-webkit-full-screen #security-watermark,
      #vimeo-container:-moz-full-screen #security-watermark,
      #vimeo-container:-ms-fullscreen #security-watermark {
        top: 1rem !important;
        right: 1rem !important;
      }
      
      #vimeo-container:fullscreen #email-watermark,
      #vimeo-container:-webkit-full-screen #email-watermark,
      #vimeo-container:-moz-full-screen #email-watermark,
      #vimeo-container:-ms-fullscreen #email-watermark {
        font-size: 1.5rem !important;
      }
      
      /* Hide the custom fullscreen button when in fullscreen mode */
      #vimeo-container:fullscreen button[title="Fullscreen"],
      #vimeo-container:-webkit-full-screen button[title="Fullscreen"],
      #vimeo-container:-moz-full-screen button[title="Fullscreen"],
      #vimeo-container:-ms-fullscreen button[title="Fullscreen"] {
        display: none !important;
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
        position: isPseudoFullscreen ? 'fixed' : 'relative',
        width: isPseudoFullscreen ? '100vw' : '100%',
        height: isPseudoFullscreen ? '100vh' : '100%',
        top: isPseudoFullscreen ? 0 : 'auto',
        left: isPseudoFullscreen ? 0 : 'auto',
        zIndex: isPseudoFullscreen ? 2147483647 : 'auto',
        backgroundColor: isPseudoFullscreen ? 'black' : 'transparent'
      }}
    >
      {/* Vimeo Player */}
      <iframe
        ref={iframeRef}
        src={signedUrl}
        className="w-full h-full rounded-lg"
        frameBorder="0"
        allow="autoplay; fullscreen; picture-in-picture"
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
        id="security-watermark"
        className="absolute pointer-events-none z-10"
        style={{
          top: isPseudoFullscreen ? '1rem' : '0.5rem',
          right: isPseudoFullscreen ? '1rem' : '0.5rem',
          zIndex: isPseudoFullscreen ? 2147483646 : 10
        }}
      >
        <div className={`bg-red-600 bg-opacity-30 text-white px-2 py-1 sm:px-3 sm:py-2 rounded-md sm:rounded-lg ${
          isPseudoFullscreen ? 'text-sm sm:text-base' : 'text-[9px] sm:text-xs'
        }`}>
          <div className="font-medium">SECURITY WARNING</div>
          <div className={`opacity-90 ${isPseudoFullscreen ? 'block' : 'hidden sm:block'}`}>Content is monitored and logged</div>
        </div>
      </div>

      {/* Email Watermark - Center, visible in fullscreen for anti-piracy */}
      {user && (
        <div 
          id="email-watermark"
          className="absolute pointer-events-none z-20 flex items-center justify-center transition-opacity duration-300"
          style={{ 
            top: '50%', 
            left: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: isPseudoFullscreen ? 1 : emailWatermarkOpacity,
            zIndex: isPseudoFullscreen ? 2147483646 : 20
          }}
        >
          <div className={`bg-black bg-opacity-50 text-white px-4 py-2 sm:px-6 sm:py-4 rounded-lg border-2 border-white max-w-[90%] ${
            isPseudoFullscreen ? 'text-xl sm:text-2xl' : 'text-sm sm:text-lg'
          }`}>
            <div className="font-bold text-center truncate">{user.email}</div>
            <div className={`text-center mt-0.5 sm:mt-1 ${
              isPseudoFullscreen ? 'text-base sm:text-lg' : 'text-xs sm:text-sm'
            }`}>Protected Content - Do Not Record</div>
          </div>
        </div>
      )}

      {/* Fullscreen Button - Bottom-Right, responsive positioning (hidden in pseudo-fullscreen) */}
      {!isPseudoFullscreen && (
        <button
          onClick={async () => {
          const container = document.getElementById('vimeo-container')
          if (!container) return

          // Detect iOS devices
          const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
          const isAndroid = /Android/i.test(navigator.userAgent)
          
          console.log('🔍 Device detected:', { isIOS, isAndroid })

          // iOS Solution: Use pseudo-fullscreen (CSS-based)
          if (isIOS) {
            console.log('📱 iOS detected - using pseudo-fullscreen mode')
            setIsPseudoFullscreen(true)
            // Lock body scroll
            document.body.style.overflow = 'hidden'
            return
          }

          // Android and Desktop: Try native fullscreen API
          console.log('🔍 Attempting native fullscreen...')
          
          try {
            // Try standard fullscreen API
            if (container.requestFullscreen) {
              await container.requestFullscreen()
              console.log('✅ Container fullscreen activated (standard)')
            } 
            // Try webkit (Safari, Chrome)
            else if ((container as any).webkitRequestFullscreen) {
              await (container as any).webkitRequestFullscreen()
              console.log('✅ Container fullscreen activated (webkit)')
            }
            // Try Firefox
            else if ((container as any).mozRequestFullScreen) {
              await (container as any).mozRequestFullScreen()
              console.log('✅ Container fullscreen activated (moz)')
            }
            // Try IE/Edge
            else if ((container as any).msRequestFullscreen) {
              await (container as any).msRequestFullscreen()
              console.log('✅ Container fullscreen activated (ms)')
            }
            else {
              console.log('❌ No fullscreen API available - using pseudo-fullscreen')
              setIsPseudoFullscreen(true)
              document.body.style.overflow = 'hidden'
            }
          } catch (error) {
            console.error('❌ Native fullscreen failed:', error)
            console.log('🔄 Falling back to pseudo-fullscreen')
            setIsPseudoFullscreen(true)
            document.body.style.overflow = 'hidden'
          }
        }}
        className="absolute bg-black bg-opacity-70 text-white p-1.5 sm:p-2 rounded-md sm:rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all z-10 bottom-16 sm:bottom-20 right-2 sm:right-3 touch-manipulation"
        title="Fullscreen"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="sm:w-4 sm:h-4">
          <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>
        </svg>
        </button>
      )}

      {/* Exit Pseudo-Fullscreen Button - Only visible in pseudo-fullscreen mode */}
      {isPseudoFullscreen && (
        <button
          onClick={() => {
            setIsPseudoFullscreen(false)
            document.body.style.overflow = ''
            console.log('❌ Exited pseudo-fullscreen mode')
          }}
          className="absolute bg-black bg-opacity-70 text-white p-2 sm:p-3 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-all z-[2147483648] top-4 right-4 touch-manipulation"
          title="Exit Fullscreen"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      )}
    </div>
  )
}
