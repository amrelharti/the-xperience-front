"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import Navbar from "../../../../components/Navbar"

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
  const searchParams = useSearchParams()
  const { user, isLoading: userLoading } = useUser()
  const { toast } = useToast()
  const trainingId = params.id as string
  const courseId = params.courseId as string
  const classIdParam = searchParams.get('class')
  
  // State to store the actual classId (may come from URL or user enrollments)
  const [classId, setClassId] = useState<string | null>(classIdParam)

  const [courseProgress, setCourseProgress] = useState<{
    status: string
    watchTimeSeconds: number
    completionPercentage: number
    isCompleted: boolean
    isStarted: boolean
  } | null>(null)
  
  // Video completion tracking
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [allCourses, setAllCourses] = useState<Course[]>([])
  const [currentCourseIndex, setCurrentCourseIndex] = useState(-1)

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
      
      // Set all courses for navigation
      setAllCourses(moduleData.courses || [])
      const courseIndex = moduleData.courses?.findIndex((c: Course) => c.id === courseId) || -1
      setCurrentCourseIndex(courseIndex)

      // Enrollment check removed - not needed on individual course page
    } catch (err) {
      console.error("Error loading course:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [trainingId, courseId])

  const loadCourseProgress = useCallback(async () => {
    if (!classId) {
      console.log("❌ No classId available for progress loading")
      return
    }
    
    try {
      console.log("📊 Loading progress for course:", courseId, "class:", classId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/progress?classId=${classId}`, {
        credentials: "include"
      })
      
      console.log("📊 Progress response status:", response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log("📊 Progress data received:", data)
        setCourseProgress(data)
      } else {
        console.error("❌ Failed to load progress:", response.status)
      }
    } catch (error) {
      console.error("❌ Error loading progress:", error)
    }
  }, [classId, courseId])

  const markCourseAsCompleted = async () => {
    if (!classId) {
      console.error("❌ No classId provided")
      toast({
        title: "Error",
        description: "Class ID is missing. Please go back and select a class.",
        variant: "destructive"
      })
      return
    }
    
    try {
      console.log("✅ Marking course as completed:", courseId, "class:", classId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/courses/${courseId}/complete?classId=${classId}`, {
        method: "POST",
        credentials: "include"
      })
      
      console.log("✅ Complete response status:", response.status)
      
      if (response.ok) {
        const responseData = await response.json()
        console.log("✅ Completion response data:", responseData)
        
        // Reload progress from the API to get the correct state
        console.log("🔄 Reloading progress after completion...")
        await loadCourseProgress()
        
        toast({
          title: "Course Completed!",
          description: "Great job! You've completed this course."
        })
      } else {
        const errorData = await response.json()
        console.error("❌ Completion failed:", errorData)
        toast({
          title: "Error",
          description: errorData.message || "Failed to mark course as completed",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("❌ Error marking course as completed:", error)
      toast({
        title: "Error",
        description: "Failed to mark course as completed",
        variant: "destructive"
      })
    }
  }

  // Navigation functions
  const goToPreviousCourse = () => {
    if (currentCourseIndex > 0) {
      const prevCourse = allCourses[currentCourseIndex - 1]
      router.push(`/courses/${trainingId}/courses/${prevCourse.id}${classId ? `?class=${classId}` : ''}`)
    } else if (currentCourseIndex === -1 && allCourses.length > 0) {
      // If we don't know our position, go to the first course
      const firstCourse = allCourses[0]
      router.push(`/courses/${trainingId}/courses/${firstCourse.id}${classId ? `?class=${classId}` : ''}`)
    }
  }

  const goToNextCourse = () => {
    if (currentCourseIndex >= 0 && currentCourseIndex < allCourses.length - 1) {
      const nextCourse = allCourses[currentCourseIndex + 1]
      router.push(`/courses/${trainingId}/courses/${nextCourse.id}${classId ? `?class=${classId}` : ''}`)
    } else if (currentCourseIndex === -1 && allCourses.length > 1) {
      // If we don't know our position, go to the second course
      const secondCourse = allCourses[1]
      router.push(`/courses/${trainingId}/courses/${secondCourse.id}${classId ? `?class=${classId}` : ''}`)
    }
  }

  // Sync classId from URL params
  useEffect(() => {
    const urlClassId = searchParams.get('class')
    console.log("🔍 URL classId:", urlClassId)
    
    if (urlClassId) {
      setClassId(urlClassId)
    } else if (user) {
      // Try to get classId from user enrollments
      console.log("🔍 No classId in URL, fetching from my-classes...")
      fetch('/api/classes/my-classes')
        .then(res => res.json())
        .then(classesData => {
          console.log("🔍 Full my-classes data:", JSON.stringify(classesData, null, 2))
          
          if (classesData && classesData.length > 0) {
            console.log("📋 Found classes:", classesData)
            
            // Find class for this training
            const matchingClasses = classesData.filter((c: any) => {
              console.log("🔍 Checking class:", c)
              // Check if the class belongs to this training (moduleId matches trainingId)
              const matches = c.moduleId === trainingId
              console.log(`  - moduleId: ${c.moduleId}, trainingId: ${trainingId}, matches: ${matches}`)
              return matches
            })
            
            console.log(`📊 Found ${matchingClasses.length} matching classes`)
            
            // Prefer active classes over archived ones
            let trainingClass = matchingClasses.find((c: any) => c.isActive && !c.isArchived)
            if (!trainingClass) {
              // If no active class, get the first matching one
              trainingClass = matchingClasses[0]
            }
            
            if (trainingClass) {
              const foundClassId = trainingClass.id
              console.log("✅ Found classId from my-classes:", foundClassId)
              if (foundClassId) {
                setClassId(foundClassId)
              }
            } else {
              console.log("⚠️ No class found for training:", trainingId)
            }
          } else {
            console.log("⚠️ No classes found in my-classes data")
          }
        })
        .catch(err => console.error("❌ Error fetching my-classes:", err))
    }
  }, [searchParams, user, trainingId])

  useEffect(() => {
    if (user && courseId) {
      loadData()
    }
  }, [user, courseId, loadData])

  useEffect(() => {
    console.log("🔍 Current classId state:", classId)
    if (classId && courseId) {
      loadCourseProgress()
    }
  }, [classId, courseId, loadCourseProgress])

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      <Navbar />
      <div className="container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-12">
          <Button 
            variant="ghost" 
            asChild 
            className="mb-6 hover:text-[#0476D7] transition-colors"
          >
            <Link href={`/courses/${trainingId}/modules/${module?.id}`} className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Module
            </Link>
          </Button>

          {/* Course Header Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-gray-100">
            <div className="flex flex-col">
              <div className="mb-4">
                <Badge className="bg-gradient-to-r from-[#0476D7] to-[#0068A7] text-white">
                  {module.title}
                </Badge>
              </div>
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-[#0476D7] to-[#005eb8] bg-clip-text text-transparent leading-tight">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed max-w-4xl">
                {course.description}
              </p>

              <div className="flex items-center gap-8 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#0476D7]/10 to-[#0068A7]/5 rounded-xl border border-[#0476D7]/20">
                  <Clock className="h-5 w-5 text-[#0476D7]" />
                  <span className="font-semibold text-[#0476D7]">{durationMinutes} minutes</span>
                </div>
                {courseProgress?.isCompleted && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-700">Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-xl border-0 overflow-hidden">
              <CardHeader className="bg-[#0476D7] text-white px-6 py-4">
                <CardTitle className="flex items-center gap-3 text-white text-lg font-semibold">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    {isLocked ? <Lock className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </div>
                  Course Content
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
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
                      <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
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
                    
                    {/* Manual completion trigger */}
                    <div className="mt-6">
                      <Button 
                        onClick={() => setShowConfirmDialog(true)}
                        variant="default"
                        size="lg"
                        className="w-full bg-gradient-to-r from-[#0476D7] to-[#0068A7] hover:from-[#0068A7] hover:to-[#005eb8] text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        ✅ I Finished Watching This Video
                      </Button>
                    </div>
                    
                    {/* Course Navigation */}
                    {allCourses.length > 1 && (
                      <div className="flex justify-between items-center py-6 border-t border-gray-200">
                        <Button 
                          variant="outline" 
                          onClick={goToPreviousCourse}
                          disabled={currentCourseIndex === -1 ? allCourses.length <= 1 : currentCourseIndex <= 0}
                          className="flex items-center px-6 hover:bg-[#0476D7] hover:text-white transition-all duration-300 border-[#0476D7]"
                        >
                          <ArrowLeft className="h-4 w-4 mr-2" />
                          Previous Course
                        </Button>
                        
                        <div className="px-4 py-2 bg-gradient-to-r from-[#0476D7]/10 to-[#0068A7]/5 rounded-xl border border-[#0476D7]/20 text-sm font-semibold text-[#0476D7]">
                          {currentCourseIndex >= 0 ? currentCourseIndex + 1 : 1} of {allCourses.length}
                        </div>
                        
                        <Button 
                          variant="outline" 
                          onClick={goToNextCourse}
                          disabled={currentCourseIndex === -1 ? allCourses.length <= 1 : currentCourseIndex >= allCourses.length - 1}
                          className="flex items-center px-6 hover:bg-[#0476D7] hover:text-white transition-all duration-300 border-[#0476D7]"
                        >
                          Next Course
                          <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                        </Button>
                      </div>
                    )}
                    
                    
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info */}
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-[#FFBC00]/15 to-[#FFBC00]/8 px-6 py-4">
                <CardTitle className="text-[#0476D7] text-lg font-semibold">Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="p-3 bg-gradient-to-br from-[#0476D7]/5 to-[#0068A7]/5 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Duration</p>
                  <p className="font-semibold text-[#0476D7]">{durationMinutes} minutes</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#0476D7]/5 to-[#0068A7]/5 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Module</p>
                  <p className="font-semibold text-[#0476D7]">{module.title}</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-[#0476D7]/5 to-[#0068A7]/5 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className={isLocked ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-green-100 text-green-700 border-green-300"}>
                    {isLocked ? "Locked" : "Available"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Progress */}
            {!isLocked && (
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-[#FFBC00]/15 to-[#FFBC00]/8 px-6 py-4">
                  <CardTitle className="text-[#0476D7] text-lg font-semibold">Progress</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold text-gray-700">Course Progress</span>
                        <span className="font-bold text-[#0476D7]">{courseProgress?.completionPercentage || 0}%</span>
                      </div>
                      <Progress value={courseProgress?.completionPercentage || 0} className="w-full h-3" />
                      <p className="text-xs text-gray-600">
                        {courseProgress?.isCompleted ? "Course completed!" : 
                         courseProgress?.isStarted ? "Continue watching..." : 
                         "Start watching to track your progress"}
                      </p>
                    </div>
                    
                    {courseProgress?.isCompleted && (
                      <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-semibold text-green-700">Course Completed!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Video Completion</AlertDialogTitle>
            <AlertDialogDescription>
              Did you watch the entire video? Clicking "I Watched It" means you honorably confirm that you have fully watched the course video content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={async () => {
                setShowConfirmDialog(false)
                // Mark course as completed immediately
                await markCourseAsCompleted()
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              ✅ I Watched It
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
