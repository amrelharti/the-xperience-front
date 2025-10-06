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
  const [emailForm, setEmailForm] = useState({
    email: "",
    password: ""
  })
  const gsiDivRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      console.error("Google Client ID not configured. Please set NEXT_PUBLIC_GOOGLE_CLIENT_ID in .env.local")
      // Show a message to the user
      alert("Google Client ID not configured. Please check the console for instructions.")
      return
    }

    // Load Google Identity Services script and render the One Tap/Button
    const existing = document.getElementById("google-identity-services") as HTMLScriptElement | null
    if (!existing) {
      const s = document.createElement("script")
      s.src = "https://accounts.google.com/gsi/client"
      s.async = true
      s.defer = true
      s.id = "google-identity-services"
      s.onload = initGSI
      document.body.appendChild(s)
    } else {
      initGSI()
    }

    function initGSI() {
      // @ts-ignore
      if (!window.google) return
      // @ts-ignore
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          const idToken = response?.credential
          if (!idToken) return
          setIsLoading(true)
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/google`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ idToken }),
            })
            setIsLoading(false)
            if (res.ok) {
              const user = await res.json()
              // Redirect admins to admin page, others to courses
              if (user.role === "ADMIN") {
                window.location.href = "/admin"
              } else {
                window.location.href = "/courses"
              }
            } else {
              console.error("Google sign-in failed")
              alert("Sign-in failed. Please try again.")
            }
          } catch (e) {
            setIsLoading(false)
            alert("Network error. Please try again.")
          }
        },
      })
      renderGoogleButton()
    }

    function renderGoogleButton() {
      if (gsiDivRef.current && signInMethod === "google") {
        // Clear any existing content
        gsiDivRef.current.innerHTML = ""
        // @ts-ignore
        if (window.google?.accounts?.id) {
          // @ts-ignore
          window.google.accounts.id.renderButton(gsiDivRef.current, { theme: "filled_blue", size: "large", type: "standard", shape: "pill" })
        }
      }
    }

    // Re-render Google button when sign-in method changes
    renderGoogleButton()
  }, [signInMethod])


  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(emailForm),
      })
      
            if (res.ok) {
              const user = await res.json()
              console.log("Email sign-in successful, user data:", user)
              console.log("User role:", user.role)
              // Redirect admins to admin page, others to courses
              if (user.role === "ADMIN") {
                console.log("Redirecting admin to /admin")
                window.location.href = "/admin"
              } else {
                console.log("Redirecting user to /courses")
                window.location.href = "/courses"
              }
            } else {
              const error = await res.text()
              console.error("Email sign-in failed:", error)
              alert("Sign-in failed. Please check your credentials.")
            }
    } catch (error) {
      console.error("Email sign-in error:", error)
      alert("Network error. Please try again.")
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
