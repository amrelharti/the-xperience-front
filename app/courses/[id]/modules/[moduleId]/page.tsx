"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PlayCircle, Clock, CheckCircle, BookOpen } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/app/hooks/useUser"
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
  const classIdParam = searchParams.get('class')
  
  // State to store the actual classId (may come from URL or user enrollments)
  const [classId, setClassId] = useState<string | null>(classIdParam)
  
  const [module, setModule] = useState<TrainingModule | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liveSession, setLiveSession] = useState<any>(null)
  const [isAttended, setIsAttended] = useState(false)
  const [loadingLiveSession, setLoadingLiveSession] = useState(true)
  const [moduleProgress, setModuleProgress] = useState(0)

  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/auth/signin"
    }
  }, [user, userLoading])

  // Load classId from my-classes if not in URL
  useEffect(() => {
    const urlClassId = searchParams.get('class')
    console.log("🔍 Module page - URL classId:", urlClassId)
    
    if (urlClassId) {
      setClassId(urlClassId)
    } else if (user) {
      // Try to get classId from my-classes
      console.log("🔍 Module page - No classId in URL, fetching from my-classes...")
      fetch('/api/classes/my-classes')
        .then(res => res.json())
        .then(classesData => {
          if (classesData && classesData.length > 0) {
            // Find class for this training
            const matchingClasses = classesData.filter((c: any) => {
              return c.moduleId === trainingId
            })
            
            if (matchingClasses.length > 0) {
              // Prefer active classes over archived ones
              let trainingClass = matchingClasses.find((c: any) => c.isActive && !c.isArchived)
              if (!trainingClass) {
                trainingClass = matchingClasses[0]
              }
              
              if (trainingClass) {
                console.log("✅ Module page - Found classId from my-classes:", trainingClass.id)
                setClassId(trainingClass.id)
              }
            }
          }
        })
        .catch(err => console.error("❌ Module page - Error fetching my-classes:", err))
    }
  }, [searchParams, user, trainingId])

  useEffect(() => {
    if (user && moduleId) {
      loadModuleData()
    }
  }, [moduleId, user])

  useEffect(() => {
    if (moduleId && classId) {
      loadLiveSession()
      loadModuleProgress()
    }
  }, [classId, moduleId])

  const loadModuleData = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading module:", moduleId)
      
      const response = await fetch(`/api/training-modules/${moduleId}`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("✅ Module data:", data)
        console.log("✅ Courses in module:", data.courses)
        console.log("✅ Courses count:", data.courses?.length || 0)
        setModule(data)
      } else {
        const errorText = await response.text()
        console.error("❌ Failed to load module:", errorText)
        setError("Failed to load module")
      }
    } catch (err) {
      console.error("❌ Error loading module:", err)
      setError("An error occurred")
      } finally {
      setLoading(false)
    }
  }

  const loadLiveSession = async () => {
    try {
      setLoadingLiveSession(true)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/live-session`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.message === "No live session found for this training module") {
          setLiveSession(null)
        } else {
          setLiveSession(data)
          
          // Check attendance only if classId is available
          if (classId) {
            const attendanceResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/live-session/attend?classId=${classId}`, {
              credentials: "include"
            })
            
            if (attendanceResponse.ok) {
              const attendanceData = await attendanceResponse.json()
              setIsAttended(attendanceData.attended || false)
            }
          }
        }
      } else {
        setLiveSession(null)
      }
    } catch (error) {
      console.log("Live session not available:", error)
      setLiveSession(null)
    } finally {
      setLoadingLiveSession(false)
    }
  }

  const loadModuleProgress = async () => {
    if (!classId) {
      console.log("❌ No classId for loading progress")
      return
    }
    
    try {
      console.log("📊 Loading module progress for classId:", classId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${moduleId}/training-progress?classId=${classId}`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log("📊 Module progress data:", data)
        setModuleProgress(data.progress || 0)
      }
    } catch (error) {
      console.error("❌ Error loading module progress:", error)
    }
  }

  const handleAttendanceToggle = async (attended: boolean) => {
    try {
      if (!classId) {
        toast({
          title: "Error",
          description: "Class ID is missing. Please go back and select a class.",
          variant: "destructive"
        })
        return
      }

      if (attended) {
        if (!liveSession?.id) {
          toast({
            title: "Error",
            description: "Live session not found",
            variant: "destructive"
          })
          return
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/${liveSession.id}/attend?classId=${classId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        })
        
        if (response.ok) {
          setIsAttended(true)
          toast({
            title: "Attendance Recorded",
            description: "Your attendance has been marked"
          })
          // Reload progress after marking attendance
          await loadModuleProgress()
        }
      } else {
        if (!liveSession?.id) {
          toast({
            title: "Error",
            description: "Live session not found",
            variant: "destructive"
          })
          return
        }
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/sessions/${liveSession.id}/attend?classId=${classId}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include"
        })
        
        if (response.ok) {
          setIsAttended(false)
          toast({
            title: "Attendance Removed",
            description: "Your attendance has been unmarked"
          })
          // Reload progress after unmarking attendance
          await loadModuleProgress()
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
            <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
            <p className="text-muted-foreground mb-4">{error || "This module doesn't exist."}</p>
          <Button asChild>
              <Link href={`/courses/${trainingId}`}>Back to Training</Link>
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
              Back to Training
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
                <span>{module.courses?.length || 0} courses</span>
                  </div>
                </div>
              </div>
            </div>

        {/* Courses List */}
        {module.courses && module.courses.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Video Lessons</h2>
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
        )}


        {/* Live Session */}
        {liveSession && !loadingLiveSession && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">Live Session</h2>
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
              currentProgress={moduleProgress}
              classId={classId}
            />
          </div>
        )}
      </div>
    </div>
  )
}

