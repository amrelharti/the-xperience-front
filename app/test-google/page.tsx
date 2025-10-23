"use client"

import { useEffect, useRef } from "react"

export default function TestGooglePage() {
  const gsiDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clientId = "128297296458-8nj8i8ej0mcrq5drskb2iargscjl3s59.apps.googleusercontent.com"
    console.log("Testing Google Client ID:", clientId)

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
            console.log("Response:", response)
            const idToken = response?.credential
            if (!idToken) {
              console.error("No ID token received")
              return
            }
            
            console.log("ID Token received:", idToken)
            alert("Google Sign-In successful! Check console for details.")
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
              theme: "filled_blue", 
              size: "large", 
              type: "standard", 
              shape: "pill" 
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
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Test Google Sign-In
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            This page tests the Google Sign-In functionality
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div ref={gsiDivRef} className="w-full flex justify-center" />
          <div className="text-center">
            <p className="text-sm text-gray-500">
              Check the browser console for detailed logs
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


