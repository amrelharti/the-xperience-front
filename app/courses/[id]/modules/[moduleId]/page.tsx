"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PlayCircle, Clock, CheckCircle, BookOpen, Sparkles, Trophy, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/app/hooks/useUser"
import NextImage from "next/image"
import LiveSessionCard from "@/components/LiveSessionCard"
import { motion, useInView } from "framer-motion"
import Navbar from "@/app/components/Navbar"

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

  const progressRef = useRef(null)
  const coursesRef = useRef(null)
  const progressInView = useInView(progressRef, { once: true, margin: "-100px" })
  const coursesInView = useInView(coursesRef, { once: true, margin: "-50px" })

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-blue-100 rounded-xl w-1/4"></div>
            <div className="h-48 bg-gradient-to-r from-blue-50 to-yellow-50 rounded-2xl"></div>
            <div className="space-y-4">
              <div className="h-24 bg-white rounded-xl shadow-sm"></div>
              <div className="h-24 bg-white rounded-xl shadow-sm"></div>
            </div>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block p-4 rounded-full bg-red-100 mb-4"
            >
              <Sparkles className="h-12 w-12 text-red-500" />
            </motion.div>
            <h1 className="text-3xl font-medium mb-4 text-gray-900">Module Not Found</h1>
            <p className="text-gray-600 mb-6">{error || "This module doesn't exist."}</p>
            <Button asChild size="lg" className="bg-[#0476D7] hover:bg-[#005eb8] text-white rounded-xl px-8">
              <Link href={`/courses/${trainingId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 max-w-7xl">
        {/* Compact Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap mb-3 sm:mb-4">
            <Button 
              variant="ghost" 
              asChild 
              size="sm"
              className="text-gray-600 hover:text-[#0476D7] hover:bg-blue-50 rounded-lg transition-all text-sm sm:text-base -ml-2 sm:ml-0"
            >
              <Link href={`/courses/${trainingId}`}>
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Back to Training
              </Link>
            </Button>
            
            

          </div>
          
          <div className="bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Badge className="bg-white/20 text-white border-yellow-400 rounded-full px-2.5 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm w-fit">
                <BookOpen className="h-3 w-3 mr-1" />
                Module {module.orderIndex}
              </Badge>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium text-white">{module.title}</h1>
            </div>
            <p className="text-blue-100 text-sm sm:text-base md:text-lg mb-4 sm:mb-6">{module.description}</p>
            
            {/* Module Info */}
            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                </div>
                <span className="text-white font-medium text-sm sm:text-base">{module.courses?.length || 0} Lessons</span>
              </div>
              {moduleProgress > 0 && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-yellow-300" />
                  </div>
                  <span className="text-white font-medium text-sm sm:text-base">{moduleProgress}% Complete</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Courses List */}
            {module.courses && module.courses.length > 0 && (
              <div ref={coursesRef}>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <div>
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 mb-1 sm:mb-2 flex items-center gap-2 sm:gap-3">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center">
                          <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                        </div>
                        Video Lessons
                      </h2>
                      <p className="text-xs sm:text-sm text-gray-600">Explore and learn at your own pace</p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:gap-4">
              {module.courses
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                  >
                    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-lg border border-gray-200 hover:border-[#0476D7]/30">
                      {/* Gradient accent line */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#0476D7] via-[#005eb8] to-[#FFBC00] group-hover:w-2 transition-all duration-300" />
                      
                      <div className="p-6 pl-8">
                        <div className="flex flex-col md:flex-row md:items-center gap-6">
                          {/* Number Badge */}
                          <div className="flex-shrink-0">
                            <div className="relative">
                              <div className="absolute inset-0 bg-gradient-to-br from-[#0476D7] to-[#005eb8] rounded-2xl blur-md opacity-20 group-hover:opacity-30 transition-opacity" />
                              <div className="relative h-16 w-16 rounded-xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center text-white font-bold text-xl shadow-md group-hover:scale-105 transition-transform">
                                {index + 1}
                              </div>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-medium text-gray-900 group-hover:text-[#0476D7] transition-colors line-clamp-1 mb-2">
                              {course.title}
                            </h3>
                            <p className="text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-100">
                                <Clock className="h-4 w-4 text-[#0476D7]" />
                                <span className="text-sm font-medium text-gray-700">{Math.round(course.durationSeconds / 60)} minutes</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Button */}
                          <div className="flex-shrink-0">
                            <Link href={`/courses/${trainingId}/courses/${course.id}${classId ? `?class=${classId}` : ''}`}>
                              <Button 
                                size="lg"
                                className="bg-gradient-to-r from-[#0476D7] to-[#005eb8] hover:from-[#005eb8] hover:to-[#0476D7] text-white rounded-lg px-7 shadow-md hover:shadow-lg transition-all font-semibold border-0"
                              >
                                <PlayCircle className="h-5 w-5 mr-2" />
                                Watch Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
            </div>
              </div>
            )}

            {/* Module Progress - After Courses */}
            {moduleProgress > 0 && (
              <motion.div
                ref={progressRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-[#FFBC00]" />
                        Module Progress
                      </h3>
                      <span className="text-2xl font-medium text-[#0476D7]">{moduleProgress}%</span>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${moduleProgress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#0476D7] via-[#005eb8] to-[#0068A7] rounded-full"
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-3">
                      Keep up the great work! {module.courses?.length || 0} lessons available to complete this module.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Live Session */}
        {liveSession && !loadingLiveSession && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="border-0 shadow-md  rounded-xl overflow-hidden sticky top-6">
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Live Session</h3>
                    <p className="text-xs text-gray-500">Upcoming</p>
                  </div>
                </div>
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
              </CardContent>
            </Card>
          </motion.div>
        )}

          </div>
        </div>
      </div>
    </div>
  )
}

