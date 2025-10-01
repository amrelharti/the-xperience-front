"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlayCircle, ChevronLeft, Lock, AlertCircle, Key } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Mock module data
const mockModules = {
  6: { id: 6, title: "JavaScript Basics", duration: "60 min" },
  7: { id: 7, title: "DOM Manipulation", duration: "50 min" },
}

export default function UnlockModulePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const courseId = params.id as string
  const moduleId = Number.parseInt(params.moduleId as string)
  const module = mockModules[moduleId as keyof typeof mockModules]

  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleUnlockModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // TODO: Call Spring Boot backend: POST /api/modules/unlock
    // Body: { accessCode, courseId, moduleId }
    // Backend should verify:
    // 1. Code exists and is valid
    // 2. Code is for this specific module
    // 3. Code hasn't been used yet
    // 4. Mark code as used and associate with current user
    console.log("[v0] Unlocking module with access code:", accessCode)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)

      // Simulate success (in real app, check response from backend)
      if (accessCode.length >= 6) {
        toast({
          title: "Module Unlocked!",
          description: "You can now access this module",
        })
        // Redirect to module video page
        router.push(`/courses/${courseId}/modules/${moduleId}`)
      } else {
        setError("Invalid or expired access code. Please contact your instructor.")
      }
    }, 1000)
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
              <CardDescription>Duration: {module.duration}</CardDescription>
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
