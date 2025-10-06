"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlayCircle, ChevronLeft, Lock, AlertCircle, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  videoUrl?: string
  durationSeconds: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export default function UnlockModulePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const moduleId = params.moduleId as string
  const [module, setModule] = useState<Module | null>(null)
  const [isLoadingModule, setIsLoadingModule] = useState(true)

  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Load module data
  useEffect(() => {
    const loadModule = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/public/courses/${courseId}/modules/${moduleId}`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setModule(data)
        } else {
          console.error("Failed to load module")
        }
      } catch (error) {
        console.error("Error loading module:", error)
      } finally {
        setIsLoadingModule(false)
      }
    }
    
    if (courseId && moduleId) {
      loadModule()
    }
  }, [courseId, moduleId])

  const handleUnlockModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/codes/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: accessCode })
      })
      setIsLoading(false)
      if (res.ok) {
        toast({ title: "Module Unlocked!", description: "You can now access this module" })
        router.push(`/courses/${courseId}/modules/${moduleId}`)
      } else {
        setError("Invalid or expired access code. Please contact your instructor.")
      }
    } catch (err) {
      setIsLoading(false)
      setError("Network error. Please try again.")
    }
  }

  if (isLoadingModule) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading module...</p>
        </div>
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Module not found</h1>
          <Button asChild>
            <Link href={`/courses/${courseId}`}>Back to Course</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link href={`/courses/${courseId}`}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
        </Button>

        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Unlock Module</h1>
            <p className="text-muted-foreground">Enter the access code provided by your instructor</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              <CardDescription>
                Duration: {Math.floor(module.durationSeconds / 60)} min
                {module.description && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {module.description}
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnlockModule} className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Your instructor will provide you with a unique access code for this module.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="accessCode">Access Code</Label>
                  <Input
                    id="accessCode"
                    type="text"
                    placeholder="Enter access code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    required
                    disabled={isLoading}
                    className="text-center text-xl tracking-wider font-mono"
                  />
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || accessCode.length < 6}>
                  {isLoading ? "Verifying..." : "Unlock Module"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 p-4 bg-card rounded-lg border">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-primary" />
              Need Help?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you don't have an access code, please contact your instructor. Each code is unique and can only be used
              once.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
