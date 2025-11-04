"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const gsiDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Inject custom styles to prevent hydration issues
    const style = document.createElement('style')
    style.textContent = `
      @keyframes gridMove {
        0% { transform: translate(0, 0); }
        100% { transform: translate(50px, 50px); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(5deg); }
      }
      
      @keyframes float-delayed {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-15px) rotate(-3deg); }
      }
      
      @keyframes float-slow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-25px) rotate(2deg); }
      }
      
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @keyframes fade-in-up {
        0% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      @keyframes fade-in-up-delayed {
        0% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        50% { 
          opacity: 0; 
          transform: translateY(30px); 
        }
        100% { 
          opacity: 1; 
          transform: translateY(0); 
        }
      }
      
      @keyframes pulse-delayed {
        0%, 100% { opacity: 0.3; }
        50% { opacity: 0.8; }
      }
      
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
        20%, 40%, 60%, 80% { transform: translateX(2px); }
      }
      
      .animate-float { animation: float 6s ease-in-out infinite; }
      .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
      .animate-float-slow { animation: float-slow 10s ease-in-out infinite; }
      .animate-spin-slow { animation: spin-slow 8s linear infinite; }
      .animate-fade-in-up { animation: fade-in-up 1s ease-out; }
      .animate-fade-in-up-delayed { animation: fade-in-up-delayed 1.5s ease-out; }
      .animate-pulse-delayed { animation: pulse-delayed 3s ease-in-out infinite; }
      .animate-shake { animation: shake 0.5s ease-in-out; }
      
      .gsi-material-button {
        width: 100% !important;
        height: 56px !important;
        border-radius: 28px !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        background: rgba(255, 255, 255, 0.05) !important;
        backdrop-filter: blur(20px) !important;
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
        transition: all 0.3s ease !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-weight: 400 !important;
        font-size: 15px !important;
        color: rgba(255, 255, 255, 0.9) !important;
        position: relative !important;
        overflow: hidden !important;
        cursor: pointer !important;
      }
      
      .gsi-material-button:hover {
        transform: translateY(-2px) !important;
        border-color: rgba(255, 255, 255, 0.5) !important;
        background: rgba(255, 255, 255, 0.1) !important;
        box-shadow: 
          0 8px 30px rgba(0, 0, 0, 0.15),
          inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
      }
      
      .gsi-material-button:active {
        transform: translateY(0) !important;
        box-shadow: 
          0 2px 10px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1) !important;
      }
      
      .gsi-material-button .gsi-material-button-contents {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 8px !important;
        padding: 0 20px !important;
        position: relative !important;
        z-index: 1 !important;
        height: 100% !important;
      }
      
      .gsi-material-button .gsi-material-button-icon {
        width: 18px !important;
        height: 18px !important;
        margin-right: 0 !important;
      }
      
      .gsi-material-button .gsi-material-button-text {
        font-weight: 400 !important;
        letter-spacing: 0.3px !important;
        font-size: 15px !important;
      }
      
      .gsi-material-button:focus {
        outline: none !important;
        border-color: rgba(0, 94, 184, 0.6) !important;
        box-shadow: 
          0 4px 20px rgba(0, 0, 0, 0.1),
          inset 0 1px 0 rgba(255, 255, 255, 0.1),
          0 0 0 2px rgba(0, 94, 184, 0.2) !important;
      }
    `
    document.head.appendChild(style)

    // Hardcoded Google Client ID for testing
    const clientId = "128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com"
    console.log("Google Client ID:", clientId)
    
    if (!clientId || clientId.includes("YOUR_ACTUAL_GOOGLE_CLIENT_ID")) {
      console.warn("Please replace YOUR_ACTUAL_GOOGLE_CLIENT_ID with your real Google Client ID")
      return
    }

    // Load Google Identity Services script
    const loadGoogleScript = () => {
      return new Promise<void>((resolve, reject) => {
        const existing = document.getElementById("google-identity-services") as HTMLScriptElement | null
        if (existing) {
          resolve()
          return
        }

        const script = document.createElement("script")
        script.src = "https://accounts.google.com/gsi/client"
        script.async = true
        script.defer = true
        script.id = "google-identity-services"
        
        script.onload = () => {
          console.log("Google script loaded successfully")
          resolve()
        }
        
        script.onerror = () => {
          console.error("Failed to load Google script")
          reject(new Error("Failed to load Google script"))
        }
        
        document.body.appendChild(script)
      })
    }

    const initGoogleSignIn = async () => {
      try {
        await loadGoogleScript()
        
        // Wait a bit for the script to initialize
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // @ts-ignore
        if (!window.google?.accounts?.id) {
          console.error("Google Identity Services not available")
          return
        }

        console.log("Initializing Google Sign-In with client ID:", clientId)
        
        // @ts-ignore
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response: any) => {
            console.log("Google sign-in callback triggered")
            const idToken = response?.credential
            if (!idToken) {
              console.error("No ID token received")
              return
            }
            
            setIsLoading(true)
            setError("") // Clear any previous errors
            try {
              console.log("Sending authentication request to /api/auth/google")
              const res = await fetch(`/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
              })
              
              console.log("Response status:", res.status)
              console.log("Response headers:", Array.from(res.headers.entries()))
              
              if (res.ok) {
                const user = await res.json()
                console.log("Google sign-in successful:", user)
                console.log("Redirecting user with role:", user.role)
                // Redirect admins to admin page, others to home (modules page)
                if (user.role === "ADMIN") {
                  window.location.href = "/admin"
                } else {
                  window.location.href = "/"
                }
              } else {
                // Try to parse JSON, but handle empty responses
                let errorData: any = {}
                const text = await res.text()
                try {
                  if (text) {
                    errorData = JSON.parse(text)
                  }
                } catch (e) {
                  console.error("Failed to parse error response:", text)
                }
                console.error("Google sign-in failed:", errorData, "Status:", res.status)
                
                // Handle specific error types
                if (errorData.error === "user_not_found") {
                  setError("Your account is not registered. Please contact an administrator to create an account for you.")
                } else if (errorData.error === "invalid_audience") {
                  setError("Authentication failed. Please try again.")
                } else if (errorData.error === "invalid_id_token") {
                  setError("Invalid authentication token. Please try again.")
                } else {
                  setError("Sign-in failed. Please try again.")
                }
              }
            } catch (e) {
              console.error("Google sign-in error:", e)
              setError("Network error. Please check your connection and try again.")
            } finally {
              setIsLoading(false)
            }
          },
        })
        
        renderGoogleButton()
      } catch (error) {
        console.error("Error initializing Google Sign-In:", error)
      }
    }

    const renderGoogleButton = () => {
      console.log("Rendering Google button")
      if (gsiDivRef.current) {
        // Clear any existing content
        gsiDivRef.current.innerHTML = ""
        
        // @ts-ignore
        if (window.google?.accounts?.id) {
          console.log("Rendering Google button")
          try {
            // @ts-ignore
            window.google.accounts.id.renderButton(gsiDivRef.current, { 
              theme: "outline", 
              size: "large", 
              type: "standard", 
              shape: "pill",
              text: "signin_with",
              width: "100%"
            })
          } catch (error) {
            console.error("Error rendering Google button:", error)
          }
        } else {
          console.log("Google accounts.id not available for button rendering")
        }
      }
    }

    // Initialize Google Sign-In
    initGoogleSignIn()

    // Render button after initialization
    setTimeout(renderGoogleButton, 100)

    // Cleanup function to remove the style element
    return () => {
      if (style && style.parentNode) {
        style.parentNode.removeChild(style)
      }
    }
  }, [])



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Futuristic Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid-pattern" style={{
            backgroundImage: `
              linear-gradient(rgba(0, 94, 184, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 94, 184, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'gridMove 20s linear infinite'
          }}></div>
        </div>
        
        {/* Floating Orbs - Hidden on small screens */}
        <div className="hidden md:block absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-xl animate-float"></div>
        <div className="hidden md:block absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-secondary/30 to-primary/20 rounded-full blur-lg animate-float-delayed"></div>
        <div className="hidden md:block absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-primary/15 to-secondary/25 rounded-full blur-2xl animate-float-slow"></div>
        
        {/* Geometric Shapes - Hidden on small screens */}
        <div className="hidden lg:block absolute top-1/3 right-20 w-16 h-16 border border-primary/30 rotate-45 animate-spin-slow"></div>
        <div className="hidden lg:block absolute bottom-1/4 left-20 w-12 h-12 bg-secondary/20 rotate-12 animate-pulse"></div>
        
        {/* Light Rays */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent animate-pulse"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-secondary/20 to-transparent animate-pulse-delayed"></div>
      </div>
      
      <div className="w-full max-w-lg relative z-10 px-2 sm:px-0">
        {/* Logo Section with Enhanced Animation */}
        <div className="text-center mb-8 sm:mb-12">
          <Link href="/" className="inline-flex items-center justify-center mb-6 sm:mb-8 group hover:scale-105 transition-all duration-500">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <img 
                src="/logos/yellow secondary logo.svg" 
                alt="XPERIENCE Logo" 
                className="relative h-14 sm:h-16 md:h-20 w-auto filter drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          </Link>
          
          <div className="space-y-2 sm:space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent font-[family-name:var(--font-space-grotesk)] animate-fade-in-up">
              Welcome Back
            </h1>
            <p className="text-blue-200/80 text-base sm:text-lg md:text-xl font-light tracking-wide animate-fade-in-up-delayed px-4">
              Continue your learning journey
            </p>
          </div>
        </div>

        {/* Futuristic Sign-in Card */}
        <div className="relative group">
          {/* Card Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-secondary/20 to-primary/30 rounded-2xl sm:rounded-3xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-75 group-hover:opacity-100"></div>
          
          {/* Main Card */}
          <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl">
            {/* Card Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl sm:rounded-2xl mb-3 sm:mb-4">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-2xl md:text-3xl font-bold text-white mb-2">Authentication</h2>
              <p className="text-blue-200/70 text-sm sm:text-base md:text-lg font-light px-2">Secure access to your learning platform</p>
            </div>
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl backdrop-blur-sm animate-shake mb-4">
                <div className="flex items-start sm:items-center">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3 sm:ml-4 flex-1">
                    <p className="font-semibold text-red-200 text-sm sm:text-base">Authentication Error</p>
                    <p className="mt-1 text-red-300/80 text-xs sm:text-sm">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign-in */}
            <div className="w-full space-y-4 sm:space-y-6">
              {isLoading ? (
                <div className="w-full h-14 sm:h-16 bg-gradient-to-r from-white/5 to-white/10 rounded-xl sm:rounded-2xl border border-white/20 flex items-center justify-center backdrop-blur-sm">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <div className="absolute inset-0 w-6 h-6 sm:w-8 sm:h-8 border-2 border-transparent border-t-primary rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                    </div>
                    <span className="text-white font-semibold text-base sm:text-lg">Authenticating...</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div ref={gsiDivRef} className="w-full flex justify-center" />
                </div>
              )}
              
            </div>

            {/* Footer Section */}
            <div className="text-center pt-6 sm:pt-8 border-t border-white/10 mt-6 sm:mt-8">
              <p className="text-blue-200/60 text-xs sm:text-sm leading-relaxed px-2">
                By signing in, you agree to our{" "}
                <Link href="#" className="text-white hover:text-primary transition-colors duration-300 font-medium underline decoration-primary/50 underline-offset-4 hover:decoration-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="text-white hover:text-primary transition-colors duration-300 font-medium underline decoration-primary/50 underline-offset-4 hover:decoration-primary">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-8 sm:mt-12">
          <Link href="/" className="inline-flex items-center gap-2 sm:gap-3 text-blue-200/70 hover:text-white transition-all duration-500 font-medium group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center group-hover:bg-white/10 transition-all duration-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="text-base sm:text-lg">Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
