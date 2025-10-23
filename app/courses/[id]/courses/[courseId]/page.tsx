"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useUser } from "../../../../hooks/useUser"
import { useToast } from "@/hooks/use-toast"
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Lock,
  CheckCircle
} from "lucide-react"
import VimeoPlayer from "../../../../components/VimeoPlayer"

interface Course {
  id: string
  title: string
  description: string
  videoUrl: string
  durationSeconds: number
  orderIndex: number
  status?: "LOCKED" | "IN_PROGRESS" | "COMPLETED"
}

interface Module {
  id: string
  title: string
  description: string
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: userLoading } = useUser()
  const { toast } = useToast()
  const trainingId = params.id as string
  const courseId = params.courseId as string

  const [courseProgress, setCourseProgress] = useState<{
    status: string
    watchTimeSeconds: number
    completionPercentage: number
    isCompleted: boolean
    isStarted: boolean
  } | null>(null)

  // Function to convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    const videoId = (match && match[2].length === 11) ? match[2] : null
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url
  }

  // Function to extract Vimeo video ID
  const getVimeoVideoId = (url: string) => {
    const regExp = /vimeo\.com\/(?:.*#|.*\/videos\/)?(\d+)/
    const match = url.match(regExp)
    return match ? match[1] : null
  }

  // Function to check if URL is Vimeo
  const isVimeoUrl = (url: string) => {
    return url.includes('vimeo.com')
  }
  
  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // First, get the training data to find which module contains this course
      const trainingResponse = await fetch(`/api/courses/${trainingId}`, {
        credentials: "include"
      })
      if (!trainingResponse.ok) {
        throw new Error("Failed to load training data")
      }
      const trainingData = await trainingResponse.json()

      // Find the module that contains this course
      let courseData = null
      let moduleData = null
      
      for (const moduleItem of trainingData.modules || []) {
        // Get the module details to find the course
        const moduleResponse = await fetch(`/api/training-modules/${moduleItem.id}`, {
          credentials: "include"
        })
        if (moduleResponse.ok) {
          const moduleDetails = await moduleResponse.json()
          const foundCourse = moduleDetails.courses?.find((c: Course) => c.id === courseId)
          if (foundCourse) {
            courseData = foundCourse
            moduleData = moduleDetails
            break
          }
        }
      }

      if (!courseData || !moduleData) {
        throw new Error("Course not found")
      }

      setCourse(courseData)
      setModule({
        id: moduleData.id,
        title: moduleData.title,
        description: moduleData.description
      })

      // Enrollment check removed - not needed on individual course page
    } catch (err) {
      console.error("Error loading course:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [trainingId, courseId])

  const loadCourseProgress = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/progress`, {
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourseProgress(data)
      }
    } catch (error) {
      console.log("Course progress not available:", error)
    }
  }

  const markCourseAsStarted = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/start`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourseProgress(data)
      }
    } catch (error) {
      console.error("Error marking course as started:", error)
    }
  }

  const markCourseAsCompleted = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/complete`, {
        method: "POST",
        credentials: "include"
      })
      
      if (response.ok) {
        const data = await response.json()
        setCourseProgress({
          status: "COMPLETED",
          watchTimeSeconds: courseProgress?.watchTimeSeconds || 0,
          completionPercentage: 100,
          isCompleted: true,
          isStarted: true
        })
        toast({
          title: "Course Completed!",
          description: "Great job! You've completed this course."
        })
      }
    } catch (error) {
      console.error("Error marking course as completed:", error)
      toast({
        title: "Error",
        description: "Failed to mark course as completed"
      })
    }
  }

  useEffect(() => {
    if (user && courseId) {
      loadData()
      loadCourseProgress()
    }
  }, [user, courseId])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading course...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !course || !module) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {error || "Course not found"}
            </h1>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const isLocked = course.status === "LOCKED"
  const durationMinutes = Math.round(course.durationSeconds / 60)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/courses/${trainingId}/modules/${module?.id}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Module
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{durationMinutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>Module: {module.title}</span>
                </div>
              </div>
            </div>

            {/* Enrollment status removed - belongs on module page, not course page */}
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isLocked ? <Lock className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLocked ? (
                  <div className="text-center py-12">
                    <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Course Locked</h3>
                    <p className="text-muted-foreground mb-4">
                    </p>
                    <Button asChild>
                      <Link href={`/courses/${trainingId}/modules/${module?.id}`}>
                        Enter Access Code
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {course.videoUrl ? (
                      <div className="aspect-video bg-black rounded-lg overflow-hidden">
                        {isVimeoUrl(course.videoUrl) ? (
                          <VimeoPlayer
                            videoId={getVimeoVideoId(course.videoUrl) || ""}
                            title={course.title}
                            className="w-full h-full"
                            onLoad={() => console.log("Vimeo video loaded")}
                            onError={(error) => console.error("Vimeo video error:", error)}
                          />
                        ) : course.videoUrl.includes('youtube.com') || course.videoUrl.includes('youtu.be') ? (
                          <iframe
                            src={getYouTubeEmbedUrl(course.videoUrl)}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={course.title}
                          />
                        ) : course.videoUrl.includes('.mp4') || course.videoUrl.includes('.webm') || course.videoUrl.includes('.mov') ? (
                          <video
                            controls
                            className="w-full h-full"
                            src={course.videoUrl}
                            title={course.title}
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-white">
                              <Play className="h-16 w-16 mx-auto mb-4" />
                              <p className="text-lg">Video Content</p>
                              <a 
                                href={course.videoUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm text-blue-300 hover:text-blue-100 mt-2 underline"
                              >
                                Open Video Link
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Play className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                          <p className="text-lg text-muted-foreground">No video content</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Course Description</h3>
                      <p className="text-muted-foreground">
                        {course.description}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{durationMinutes} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Module</p>
                  <p className="font-medium">{module.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge variant={isLocked ? "secondary" : "default"}>
                    {isLocked ? "Locked" : "Available"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {!isLocked && (
              <Card>
                <CardHeader>
                  <CardTitle>Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Course Progress</span>
                        <span>{courseProgress?.completionPercentage || 0}%</span>
                      </div>
                      <Progress value={courseProgress?.completionPercentage || 0} className="w-full" />
                      <p className="text-xs text-muted-foreground">
                        {courseProgress?.isCompleted ? "Course completed!" : 
                         courseProgress?.isStarted ? "Continue watching..." : 
                         "Start watching to track your progress"}
                      </p>
                    </div>
                    
                    {courseProgress && !courseProgress.isCompleted && (
                      <div className="space-y-2">
                        <Button 
                          onClick={markCourseAsStarted}
                          variant="outline" 
                          size="sm" 
                          className="w-full"
                        >
                          Mark as Started
                        </Button>
                        <Button 
                          onClick={markCourseAsCompleted}
                          variant="default" 
                          size="sm" 
                          className="w-full"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Mark as Completed
                        </Button>
                      </div>
                    )}
                    
                    {courseProgress?.isCompleted && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">Course Completed!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
