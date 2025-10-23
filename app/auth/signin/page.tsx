"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlayCircle, Mail, Lock } from "lucide-react"

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [signInMethod, setSignInMethod] = useState<"google" | "email">("google")
  const [error, setError] = useState("")
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: ""
  })
  const gsiDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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
              const res = await fetch(`http://localhost:8080/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken }),
              })
              
              if (res.ok) {
                const user = await res.json()
                console.log("Google sign-in successful:", user)
                // Redirect admins to admin page, others to home (modules page)
                if (user.role === "ADMIN") {
                  window.location.href = "/admin"
                } else {
                  window.location.href = "/"
                }
              } else {
                const errorData = await res.json()
                console.error("Google sign-in failed:", errorData)
                
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
      console.log("Rendering Google button, signInMethod:", signInMethod)
      if (gsiDivRef.current && signInMethod === "google") {
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

    // Re-render button when sign-in method changes
    if (signInMethod === "google") {
      // Small delay to ensure the method change has been processed
      setTimeout(renderGoogleButton, 100)
    }
  }, [signInMethod])


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("") // Clear any previous errors
    
    try {
      const res = await fetch(`http://localhost:8080/api/auth/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(emailForm),
      })
      
      if (res.ok) {
        const user = await res.json()
        console.log("Email sign-in successful, user data:", user)
        console.log("User role:", user.role)
        // Redirect admins to admin page, others to home (modules page)
        if (user.role === "ADMIN") {
          console.log("Redirecting admin to /admin")
          window.location.href = "/admin"
        } else {
          console.log("Redirecting user to /")
          window.location.href = "/"
        }
      } else {
        const errorData = await res.json()
        console.error("Email sign-in failed:", errorData)
        setError("Invalid credentials. Please check your email and password.")
      }
    } catch (error) {
      console.error("Email sign-in error:", error)
      setError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-2xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue your learning journey</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Choose your preferred sign-in method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Sign-in Method Toggle */}
            <div className="flex rounded-lg border p-1">
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  signInMethod === "google"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSignInMethod("google")}
              >
                Google
              </button>
              <button
                type="button"
                className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  signInMethod === "email"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setSignInMethod("email")}
              >
                Email
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-4 w-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium">Sign-in Failed</p>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Google Sign-in */}
            {signInMethod === "google" && (
              <div ref={gsiDivRef} className="w-full flex justify-center" />
            )}

            {/* Email Sign-in */}
            {signInMethod === "email" && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={emailForm.email}
                      onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={emailForm.password}
                      onChange={(e) => setEmailForm({ ...emailForm, password: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign In with Email"}
                </Button>
              </form>
            )}

            <div className="text-center text-sm text-muted-foreground">
              <p>
                By signing in, you agree to our{" "}
                <Link href="#" className="underline hover:text-foreground">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="#" className="underline hover:text-foreground">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
