"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PlayCircle, Clock, CheckCircle, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "../../../hooks/useUser"
import NextImage from "next/image"
import LiveSessionCard from "@/components/LiveSessionCard"

interface TrainingModule {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  courses: Course[]
}

interface Course {
  id: string
  title: string
  description: string
  videoUrl: string
  durationSeconds: number
  orderIndex: number
}

export default function ModuleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useUser()
  
  const trainingId = params.id as string
  const moduleId = params.moduleId as string
  const classId = searchParams.get('class')
  
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveSession, setLiveSession] = useState<any>(null)
  const [isAttended, setIsAttended] = useState(false)
  const [loadingLiveSession, setLoadingLiveSession] = useState(true)

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/auth/signin"
    }
  }, [user, userLoading])

  useEffect(() => {
    if (user && moduleId) {
      loadModuleData()
      loadLiveSession()
    }
  }, [moduleId, user])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/training-modules/${moduleId}`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("Module data:", data)
        setModule(data)
      } else {
        setError("Failed to load module")
      }
    } catch (err) {
      console.error("Error loading module:", err)
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const loadLiveSession = async () => {
    try {
      setLoadingLiveSession(true)
      const response = await fetch(`/api/modules/${moduleId}/live-session`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setLiveSession(data)
        
        // Check attendance
        const attendanceResponse = await fetch(`/api/modules/${moduleId}/live-session/attend`, {
          credentials: "include"
        })
        
        if (attendanceResponse.ok) {
          const attendanceData = await attendanceResponse.json()
          setIsAttended(attendanceData.attended || false)
        }
      }
    } catch (error) {
      console.log("Live session not available:", error)
    } finally {
      setLoadingLiveSession(false)
    }
  }

  const handleAttendanceToggle = async (attended: boolean) => {
    try {
      if (attended) {
        const response = await fetch(`/api/modules/${moduleId}/live-session/attend`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({})
        })
        
        if (response.ok) {
          setIsAttended(true)
          toast({
            title: "Attendance Recorded",
            description: "Your attendance has been marked"
          })
        }
      }
    } catch (error) {
      console.error("Error toggling attendance:", error)
    }
  }

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (error || !module) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Module not found</h1>
            <p className="text-muted-foreground mb-4">{error || "This module doesn't exist."}</p>
            <Button asChild>
              <Link href={`/courses/${trainingId}`}>Back to training</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/courses/${trainingId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to training
            </Link>
          </Button>

          <div>
            <h1 className="text-4xl font-bold mb-2">
              Module {module.orderIndex}: {module.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-4">
              {module.description}
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{module.courses.length} courses</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courses List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Video lessons</h2>
          <div className="space-y-4">
            {module.courses
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((course, index) => (
                <Card key={course.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                        <span className="font-medium">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{course.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.round(course.durationSeconds / 60)} min</span>
                          </div>
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/courses/${trainingId}/courses/${course.id}${classId ? `?class=${classId}` : ''}`}>
                          <PlayCircle className="h-4 w-4 mr-2" />
                          Watch
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Live Session */}
        {liveSession && !loadingLiveSession && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Live session</h2>
            <LiveSessionCard
              liveSession={{
                id: liveSession.id,
                title: liveSession.title,
                scheduledDate: liveSession.startsAt,
                instructorName: liveSession.instructorName,
                meetingUrl: liveSession.meetingUrl,
                meetingPassword: liveSession.meetingPassword,
                durationMinutes: liveSession.durationMinutes
              }}
              isAttended={isAttended}
              onAttendanceToggle={handleAttendanceToggle}
              currentProgress={0}
            />
          </div>
        )}
      </div>
    </div>
  )
}



