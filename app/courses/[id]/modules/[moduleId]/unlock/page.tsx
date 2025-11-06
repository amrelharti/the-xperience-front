"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PlayCircle, ChevronLeft, Lock, AlertCircle, Key, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TrainingModule {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
}

export default function UnlockModulePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  
  const trainingId = params.id as string
  const moduleId = params.moduleId as string
  const classIdParam = searchParams.get('class')
  
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [isLoadingModule, setIsLoadingModule] = useState(true)
  const [classId, setClassId] = useState<string | null>(classIdParam)
  const [className, setClassName] = useState<string>("")

  const [accessCode, setAccessCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Load classId from localStorage if not in URL
  useEffect(() => {
    if (!classId) {
      const savedClassId = localStorage.getItem(`selectedClass_${trainingId}`)
      if (savedClassId) {
        setClassId(savedClassId)
      }
    }
  }, [trainingId, classId])

  // Load module data
  useEffect(() => {
    const loadModule = async () => {
      try {
        const res = await fetch(`/api/training-modules/${moduleId}`, {
          credentials: "include",
        })
        if (res.ok) {
          const data = await res.json()
          setModule(data)
        } else {
          console.error("Failed to load training module")
        }
      } catch (error) {
        console.error("Error loading training module:", error)
      } finally {
        setIsLoadingModule(false)
      }
    }
    
    if (moduleId) {
      loadModule()
    }
  }, [moduleId])

  // Load class info
  useEffect(() => {
    const loadClassInfo = async () => {
      if (!classId) return
      
      try {
        const res = await fetch(`/api/classes/${classId}`, {
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          setClassName(data.className)
        }
      } catch (error) {
        console.error("Error loading class info:", error)
      }
    }
    
    loadClassInfo()
  }, [classId])

  const handleUnlockModule = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!classId) {
      setError("Class information is missing. Please go back and select your class.")
      return
    }
    
    setIsLoading(true)

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/training-modules/${moduleId}/codes/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ code: accessCode, classId: classId })
      })
      
      setIsLoading(false)
      
      if (res.ok) {
        toast({ title: "Module Unlocked!", description: "You can now access this training module" })
        router.push(`/courses/${trainingId}/modules/${moduleId}${classId ? `?class=${classId}` : ''}`)
      } else {
        const errorData = await res.json()
        setError(errorData.error || "Invalid access code. Please check with your instructor.")
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
            <h1 className="text-3xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Unlock Training Module</h1>
            <p className="text-muted-foreground">Enter the access code provided by your instructor</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{module.title}</CardTitle>
              {className && (
                <div className="flex items-center gap-2 mt-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{className}</span>
                </div>
              )}
              {module.description && (
                <CardDescription className="mt-2">
                  {module.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUnlockModule} className="space-y-4">
                <Alert>
                  <Key className="h-4 w-4" />
                  <AlertDescription>
                    Your instructor provides a class-specific access code for this training module. All students in your class use the same code.
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
                    disabled={isLoading || !classId}
                    className="text-center text-xl tracking-wider font-mono"
                  />
                  {!classId && (
                    <p className="text-xs text-amber-600">
                      ⚠️ Class information is missing. Please go back and select your class.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isLoading || accessCode.length < 6 || !classId}>
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
              If you don't have an access code, please contact your instructor. The code is shared with all students in your class and can be used multiple times.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
