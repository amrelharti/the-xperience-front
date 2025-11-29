"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { useUser } from "../../hooks/useUser"
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Calendar, 
  CheckCircle, 
  Lock, 
  ArrowLeft,
  BookOpen,
  Star,
  Award,
  MessageSquare,
  Trophy
} from "lucide-react"
import NextImage from "next/image"
import LiveSessionCard from "@/components/LiveSessionCard"
import Navbar from "../../components/Navbar"

interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  modules?: TrainingModule[]
}

interface TrainingModule {
  id: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  hasAccess: boolean
  status: "LOCKED" | "UNLOCKED"
  coursesCount: number
  progress?: number // Add progress percentage
  thumbnailUrl?: string // Add thumbnail URL
}

interface ModuleDetailPageProps {
  params: {
    id: string
  }
}

export default function TrainingDetailPage({ params }: ModuleDetailPageProps) {
  const { user, isLoading: userLoading } = useUser()
  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [showClassSelection, setShowClassSelection] = useState(false)
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loadingClasses, setLoadingClasses] = useState(false)
  const [enrollmentCode, setEnrollmentCode] = useState("")
  const [selectedLockedModule, setSelectedLockedModule] = useState<any | null>(null)
  const [showLockedDialog, setShowLockedDialog] = useState(false)
  const [isManuallySelectingClass, setIsManuallySelectingClass] = useState(false)

  // Check authentication when component mounts
  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/auth/signin"
    }
  }, [user, userLoading])
  
  // Clear stale class selection from different users
  useEffect(() => {
    if (user?.id) {
      const storageKey = `selectedClass_${params.id}`
      const savedClassId = localStorage.getItem(storageKey)
      const userKey = `classUser_${params.id}`
      const savedUserId = localStorage.getItem(userKey)
      
      // If the saved class was selected by a different user, clear it
      if (savedClassId && savedUserId && savedUserId !== user.id) {
        localStorage.removeItem(storageKey)
        localStorage.removeItem(userKey)
      }
    }
  }, [user?.id, params.id])

  const loadModuleProgress = useCallback(async (trainingData: Training, classId?: string) => {
    if (!user || !trainingData?.modules) return

    try {
      // Get user's enrolled classes if classId not provided
      let selectedClassId = classId
      if (!selectedClassId) {
        const enrollmentsResponse = await fetch("/api/classes/my-classes")
        if (enrollmentsResponse.ok) {
          const enrollments = await enrollmentsResponse.json()
          // Find all classes for this training
          const trainingClasses = enrollments.filter((enrollment: any) => 
            enrollment.moduleId === params.id // moduleId is actually trainingId in backend
          )
          
          if (trainingClasses.length === 0) {
            return
          } else if (trainingClasses.length === 1) {
            // Only one class - use it automatically
            selectedClassId = trainingClasses[0].id
          } else {
            // Multiple classes - use the first one for now (class selector can be added later)
            selectedClassId = trainingClasses[0].id
          }
        }
      }

      if (!selectedClassId) {
        return
      }

      // Load progress for each module with class context
      // Load progress for all modules, but we'll hide it for locked modules in the UI
      const progressPromises = trainingData.modules.map(async (module) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${module.id}/training-progress?classId=${selectedClassId}`, {
            credentials: "include"
          })
          if (response.ok) {
            const progressData = await response.json()
            return { moduleId: module.id, progress: progressData.progress || 0 }
          }
        } catch (error) {
          console.error("Error loading progress for module:", module.id, error)
        }
        return { moduleId: module.id, progress: 0 }
      })

      const progressResults = await Promise.all(progressPromises)
      
      // Update training with progress data
      setTraining(prevTraining => {
        if (!prevTraining?.modules) return prevTraining
        
        const updatedModules = prevTraining.modules.map(module => {
          const progressData = progressResults.find(p => p.moduleId === module.id)
          const progressValue = progressData?.progress ?? 0
          // Ensure progress is always a number, even if undefined
          return {
            ...module,
            progress: typeof progressValue === 'number' ? progressValue : 0
          }
        })
        
        
        return {
          ...prevTraining,
          modules: updatedModules
        }
      })
    } catch (error) {
    }
  }, [user, params.id]) // Removed selectedClassId - it's passed as a parameter, so no need to recreate function when it changes

  const loadAvailableClasses = useCallback(async () => {
    try {
      setLoadingClasses(true)
      const response = await fetch(`/api/classes/module/${params.id}`)
      if (response.ok) {
        const newClasses = await response.json()
        // Combine user's existing enrollments with new available classes
        setAvailableClasses(prevClasses => {
          const existingClassIds = prevClasses.map(c => c.id)
          const uniqueNewClasses = newClasses.filter((newClass: any) => !existingClassIds.includes(newClass.id))
          const combined = [...prevClasses, ...uniqueNewClasses]
          return combined
        })
        // Don't set showClassSelection here - let the caller decide
      } else {
        console.error("Failed to load classes")
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoadingClasses(false)
    }
  }, [params.id])

  const load = useCallback(async (overrideClassId?: string) => {
    try {
      setLoading(true)
      setError(null)

      // Priority: overrideClassId > selectedClassId > localStorage
      let classIdToUse = overrideClassId || selectedClassId
      
      // If still no classId, check localStorage directly
      if (!classIdToUse && user?.id) {
        const savedClassId = localStorage.getItem(`selectedClass_${params.id}`)
        const savedUserId = localStorage.getItem(`classUser_${params.id}`)
        if (savedClassId && savedUserId === user.id) {
          classIdToUse = savedClassId
          setSelectedClassId(savedClassId) // Update state immediately
        }
      }
      
      const classIdParam = classIdToUse ? `?classId=${classIdToUse}` : ''
      const trainingResponse = await fetch(`/api/courses/${params.id}${classIdParam}`)
      if (!trainingResponse.ok) {
        throw new Error("Failed to load training")
      }
      const trainingData = await trainingResponse.json()
     
      trainingData.modules?.forEach((module: any) => {
      })
      setTraining(trainingData)

      // Check if user is enrolled in ACTIVE classes only (only if authenticated)
      let enrolled = false
      let availableClasses = []
      if (user && user.id) {
        try {
          const enrollmentsResponse = await fetch("/api/classes/my-classes")
          if (enrollmentsResponse.ok) {
            const enrollments = await enrollmentsResponse.json()
            // Filter for this training and only active classes
            const trainingEnrollments = enrollments.filter((enrollment) => 
              enrollment.moduleId === params.id // moduleId is actually trainingId in backend
            )
            
            // Check if user has any active enrollments for this training
            const activeEnrollments = trainingEnrollments.filter((enrollment) => 
              enrollment.isActive && !enrollment.isArchived
            )
            
            enrolled = activeEnrollments.length > 0
            availableClasses = trainingEnrollments // Store all enrollments for class selection
            setIsEnrolled(enrolled)
            setAvailableClasses(availableClasses)
            
            // Smart class selection logic
            // ONLY auto-select if we're not in manual selection mode AND no override AND no existing selection
            if (!isManuallySelectingClass && !overrideClassId && !classIdToUse) {
              if (trainingEnrollments.length > 1) {
                // Check if student has a saved preference for this training
                const savedClassId = localStorage.getItem(`selectedClass_${params.id}`)
                const savedClass = savedClassId ? trainingEnrollments.find((c) => c.id === savedClassId) : null
                
              if (savedClass && savedClassId) {
                // Student has a saved preference, use it (but we already loaded with it)
                setIsEnrolled(true)
                // Save the user ID who made this selection
                localStorage.setItem(`classUser_${params.id}`, user.id)
                // Load available classes in background for the switch button
                await loadAvailableClasses()
              } else {
                  // No saved preference - auto-select the first active class and save it
                  const firstActiveClass = trainingEnrollments.find((c: any) => c.isActive && !c.isArchived)
                  const classToUse = firstActiveClass || trainingEnrollments[0]
                  
                  setSelectedClassId(classToUse.id)
                  setIsEnrolled(true)
                  // Auto-save the selection so we don't ask again
                  if (classToUse.id) {
                    localStorage.setItem(`selectedClass_${params.id}`, classToUse.id)
                    localStorage.setItem(`classUser_${params.id}`, user.id)
                  }
                  // Load available classes in background for the switch button
                  await loadAvailableClasses()
                }
              } else if (trainingEnrollments.length === 1) {
                // Only one class available, auto-select it
                const singleClass = trainingEnrollments[0]
                setSelectedClassId(singleClass.id)
                setIsEnrolled(true)
                // Save the selection
                localStorage.setItem(`selectedClass_${params.id}`, singleClass.id)
                localStorage.setItem(`classUser_${params.id}`, user.id)
                // Load available classes in background for the switch button
                await loadAvailableClasses()
              }
            } else if (classIdToUse) {
            }
            // Always load available classes for switch button if enrolled (to show all classes, not just enrolled ones)
            if (enrolled && !overrideClassId) {
              await loadAvailableClasses()
            }
          }
        } catch (enrollError) {
        }
      }

      // If user is not enrolled in any classes for this training, load available classes and show modal
      if (!enrolled && user && user.id) {
        setShowClassSelection(true)
        await loadAvailableClasses()
      }

      // Load progress if user is enrolled - pass classId for class-specific progress
      if (enrolled && user && trainingData?.modules) {
        await loadModuleProgress(trainingData, classIdToUse)
      }
    } catch (err) {
      console.error("Error loading training:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [params.id, user?.id, loadModuleProgress, loadAvailableClasses, isManuallySelectingClass]) // Removed selectedClassId to prevent loop - it's handled inside the function


  const handleLockedModule = (module: any) => {
    setSelectedLockedModule(module)
    setShowLockedDialog(true)
  }

  const handleEnroll = async () => {
    if (!selectedClassId) {
      alert("Please select a class")
      return
    }

    const selectedClass = availableClasses.find(c => c.id === selectedClassId)
    
    // Check if this is a new class that requires enrollment
    if (selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled) {
      // This is a new class, enrollment code is required
      if (!enrollmentCode) {
        alert("Please enter an enrollment code")
        return
      }

      try {
        
        const response = await fetch(`/api/classes/${selectedClassId}/enroll-with-code`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code: enrollmentCode }),
        })


        if (response.ok) {
          alert("Successfully enrolled in class!")
          setIsEnrolled(true)
          setShowClassSelection(false)
          // Save the student's choice for this training
          localStorage.setItem(`selectedClass_${params.id}`, selectedClassId)
          if (user?.id) {
            localStorage.setItem(`classUser_${params.id}`, user.id)
          }
          // Reload the training data with the new class context
          setLoading(true)
          await load(selectedClassId) // Pass the classId explicitly
        } else {
          const errorData = await response.json()
          console.error("❌ Enrollment failed:", errorData)
          console.error("❌ Error details:", JSON.stringify(errorData, null, 2))
          alert(`Enrollment failed: ${errorData.error || errorData.message || "Unknown error"}`)
        }
      } catch (error) {
        console.error("Error enrolling:", error)
        alert("Network error. Please try again.")
      }
    } else {
      // This is an already enrolled class, just continue
      setIsEnrolled(true)
      setShowClassSelection(false)
      // Update selectedClassId state before loading
      setSelectedClassId(selectedClassId)
      // Save the student's choice for this training
      localStorage.setItem(`selectedClass_${params.id}`, selectedClassId)
      if (user?.id) {
        localStorage.setItem(`classUser_${params.id}`, user.id)
      }
      // Reload the training data with the new class context
      setLoading(true)
      await load(selectedClassId) // Pass the classId explicitly
    }
  }

  // Only run load on initial mount and when params.id or user changes
  // Do NOT run when selectedClassId changes (that would reset the selection)
  useEffect(() => {
    if (!userLoading && user) {
      load()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id, user?.id, userLoading])


  // Debug: Track selectedClassId changes
  useEffect(() => {
  }, [selectedClassId])

  // Debug: Track modal rendering
  useEffect(() => {
    if (showClassSelection) {
    }
  }, [showClassSelection, availableClasses, selectedClassId])

  // Debug: Track switch button visibility
  useEffect(() => {
  }, [availableClasses, isEnrolled])


  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-muted rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
              <div className="h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Error</h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => load()}>Try again</Button>
          </div>
        </div>
      </div>
    )
  }

  if (!training) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Training not found</h1>
            <p className="text-muted-foreground mb-4">The training you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/courses">Back to trainings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalModules = training.modules?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Button variant="ghost" asChild className="mb-4 sm:mb-6 -ml-2 sm:ml-0">
            <Link href="/" className="flex items-center gap-2 hover:text-[#0476D7] transition-colors text-sm sm:text-base">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back to trainings
            </Link>
          </Button>

          <div className="space-y-4 sm:space-y-6">
            
            {/* Training Info */}
            <div className="w-full rounded-xl sm:rounded-2xl p-4 sm:p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start gap-4">
                {training.thumbnailUrl && (
                  <div className="w-full sm:w-60 md:w-90 h-45 sm:h-45 md:h-52 rounded-lg sm:rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
                    <NextImage
                      src={training.thumbnailUrl}
                      alt={training.title}
                      width={400}
                      height={208}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1 w-full">
                  <div className="mb-3 sm:mb-4">
                    <Badge className="bg-gradient-to-r from-[#0476D7] to-[#0068A7] text-white mb-2 sm:mb-3 text-xs">
                      Training program
                    </Badge>
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3 text-[#0476D7]">{training.title}</h1>
                  <p className="text-[#666] mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">{training.description}</p>
                  
                  {/* Progress Overview */}
                  <div className="flex items-center gap-3 sm:gap-6 mb-4 sm:mb-6 flex-wrap">
                    <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gradient-to-br from-[#0476D7]/10 to-[#0476D7]/5 rounded-lg sm:rounded-xl border border-[#0476D7]/20">
                      <div className="p-1.5 sm:p-2 bg-[#0476D7] rounded-md sm:rounded-lg">
                        <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-[#047690] font-medium">Total modules</div>
                        <div className="text-base sm:text-lg font-bold text-[#0476D7]">{totalModules}</div>
                      </div>
                    </div>
    
                  </div>
                </div>
              </div>
            </div>
            {/* Class-Specific Social Features */}
            {isEnrolled && selectedClassId && (
                    <div className="flex justify-center mt-4 sm:mt-6">
                      <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 rounded-xl sm:rounded-2xl w-full max-w-2xl shadow-lg">
                        <p className="text-xs sm:text-sm font-semibold text-[#0476D7] mb-3 sm:mb-4 flex items-center gap-2 justify-center">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          Class community
                        </p>
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2 sm:gap-3">
                        <Button 
                          asChild
                          size="sm"
                          className="flex items-center justify-center gap-2 text-white rounded-full shadow-sm hover:shadow-md border-0 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                          style={{ background: 'linear-gradient(90deg, #0068A7, #0476D7)' }}
                        >
                          <Link href={`/feed?training=${params.id}&class=${selectedClassId}`}>
                            <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Class feed
                          </Link>
                        </Button>
                        <Button 
                          asChild
                          size="sm"
                          className="flex items-center justify-center gap-2 text-white rounded-full shadow-sm hover:shadow-md border-0 transition-all duration-200 text-xs sm:text-sm w-full sm:w-auto"
                          style={{ background: 'linear-gradient(90deg, #FFBC00, #FFD84D)' }}
                        >
                          <Link href={`/leaderboard?training=${params.id}&class=${selectedClassId}`}>
                            <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Leaderboard
                          </Link>
                        </Button>
                        {availableClasses.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              localStorage.removeItem(`selectedClass_${params.id}`)
                              localStorage.removeItem(`classUser_${params.id}`)
                              setShowClassSelection(true)
                              await loadAvailableClasses()
                            }}
                            className="flex items-center justify-center gap-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border-0 text-xs sm:text-sm w-full sm:w-auto"
                            style={{ background: 'linear-gradient(90deg, #F1F5F9, #E2E8F0)', color: '#334155' }}
                          >
                            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            Switch class
                          </Button>
                        )}
                        </div>
                      </div>
                    </div>
                  )}
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="h-1 w-8 sm:w-12 bg-gradient-to-r from-[#0476D7] to-[#FFBC00] rounded-full"></div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#0476D7]">Training modules</h2>
          </div>
          {training.modules?.map((module, index) => (
            <Card key={module.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 flex-1 w-full">
                    {/* Module Thumbnail */}
                    {module.thumbnailUrl && (
                      <div className="w-full sm:w-20 md:w-23 h-32 sm:h-20 md:h-23 rounded-lg overflow-hidden flex-shrink-0">
                        <NextImage
                          src={module.thumbnailUrl}
                          alt={module.title}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 w-full">
                      <div className="flex items-start sm:items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-base sm:text-lg md:text-xl font-semibold text-[#0476D7]">{module.title}</h3>
                        {module.status === "LOCKED" ? (
                          <Badge variant="outline" className="border-orange-500 text-orange-700 text-xs">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        ) : (
                          <div className="relative inline-flex items-center justify-center">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20"></div>
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 relative" />
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 text-sm sm:text-base">{module.description}</p>
                      
                      {/* Progress Bar - Only show if module is unlocked and has progress */}
                      {(module.status === "UNLOCKED" || (module.status !== "LOCKED" && module.hasAccess)) && 
                       typeof module.progress === 'number' && module.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm mb-1">
                            <span className="font-semibold text-foreground">Progress</span>
                            <span className="font-bold text-[#0476D7]">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-2 sm:h-3 bg-muted" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>{module.coursesCount} courses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          <span>Live session</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {module.status === "LOCKED" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLockedModule(module)}
                        disabled={!isEnrolled}
                        className="w-full sm:w-auto text-xs sm:text-sm border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Lock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                        <span>Locked</span>
                      </Button>
                    ) : (
                      <Button asChild size="sm" className="bg-[#0476D7] hover:bg-[#0068A7] shadow-md hover:shadow-lg w-full sm:w-auto text-xs sm:text-sm">
                        <Link href={`/courses/${params.id}/modules/${module.id}`} className="flex items-center justify-center">
                          <PlayCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                          {module.progress && module.progress > 0 ? "Continue" : "Start"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Locked Module Dialog */}
        {showLockedDialog && selectedLockedModule && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md">
              <CardHeader className="px-4 sm:px-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-full">
                    <Lock className="h-6 w-6 text-red-600" />
                  </div>
                  <CardTitle className="text-lg sm:text-xl">Module locked</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6 pb-6">
                <p className="text-sm sm:text-base text-slate-700">
                  <strong className="text-slate-900">{selectedLockedModule.title}</strong> is currently locked for your class.
                </p>
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Need access ?</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-amber-700 mt-2">
                    Please contact your instructor to unlock this module for your class.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowLockedDialog(false)
                    setSelectedLockedModule(null)
                  }}
                  className="w-full"
                >
                  Close
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Class Selection Modal */}
        {showClassSelection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <Card className="w-full max-w-2xl my-8">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg sm:text-xl">Select a class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 px-4 sm:px-6">
                {availableClasses.length > 0 ? (
                  <>
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        You can access your archived classes or enroll in a new one. Contact the admin for more information.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Archived Classes Section */}
                      {availableClasses.filter((classItem) => !classItem.isActive && classItem.isArchived).length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-blue-600 mb-2">📚 Your previous classes (Archived)</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Continue your training progress in classes you were enrolled in
                          </p>
                          <div className="space-y-2">
                            {availableClasses.filter((classItem) => !classItem.isActive && classItem.isArchived).map((classItem) => (
                              <label
                                key={classItem.id}
                                htmlFor={`class-archived-${classItem.id}`}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors block ${
                                  selectedClassId === classItem.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-blue-200 bg-blue-25 hover:border-blue-300"
                                }`}
                                onClick={(e) => {
                                  setIsManuallySelectingClass(true)
                                  setSelectedClassId(classItem.id)
                                  setTimeout(() => setIsManuallySelectingClass(false), 1000)
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    id={`class-archived-${classItem.id}`}
                                    name="selectedClass"
                                    value={classItem.id}
                                    checked={selectedClassId === classItem.id}
                                    onChange={(e) => {
                                      setSelectedClassId(e.target.value)
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                    className="w-0 h-0 opacity-0 absolute"
                                  />
                                  <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                                    selectedClassId === classItem.id
                                      ? "border-blue-500 bg-blue-500"
                                      : "border-blue-300"
                                  }`}></div>
                                  <div>
                                    <p className="font-medium text-blue-900">{classItem.name}</p>
                                    <p className="text-sm text-blue-700">{classItem.description}</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                                      Archived
                                    </span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Classes Section */}
                      {availableClasses.filter((classItem) => classItem.isActive && !classItem.isArchived).length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-green-600 mb-2">🆕 Available active classes</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Enroll in new active classes for this training
                          </p>
                          <div className="space-y-2">
                            {availableClasses.filter((classItem) => classItem.isActive && !classItem.isArchived).map((classItem) => (
                              <label
                                key={classItem.id}
                                htmlFor={`class-active-${classItem.id}`}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors block ${
                                  selectedClassId === classItem.id
                                    ? "border-green-500 bg-green-50"
                                    : "border-green-200 bg-green-25 hover:border-green-300"
                                }`}
                                onClick={(e) => {
                                  setIsManuallySelectingClass(true)
                                  setSelectedClassId(classItem.id)
                                  setTimeout(() => setIsManuallySelectingClass(false), 1000)
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    id={`class-active-${classItem.id}`}
                                    name="selectedClass"
                                    value={classItem.id}
                                    checked={selectedClassId === classItem.id}
                                    onChange={(e) => {
                                      setSelectedClassId(e.target.value)
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation()
                                    }}
                                    className="w-0 h-0 opacity-0 absolute"
                                  />
                                  <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 ${
                                    selectedClassId === classItem.id
                                      ? "border-green-500 bg-green-500"
                                      : "border-green-300"
                                  }`}></div>
                                  <div>
                                    <p className="font-medium text-green-900">{classItem.name}</p>
                                    <p className="text-sm text-green-700">{classItem.description}</p>
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 mt-1">
                                      Active
                                    </span>
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Classes Available */}
                      {availableClasses.filter((classItem) => classItem.isActive && !classItem.isArchived).length === 0 && 
                       availableClasses.filter((classItem) => !classItem.isActive && classItem.isArchived).length === 0 && (
                        <div className="text-center py-6">
                          <p className="text-gray-600 mb-4">No classes available for this training.</p>
                          <Button onClick={loadAvailableClasses} variant="outline">
                            Load available classes for enrollment
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Show enrollment code only for new active classes that student is NOT enrolled in */}
                    {selectedClassId && (() => {
                      const selectedClass = availableClasses.find(c => c.id === selectedClassId)
                      // Check if this is a new class that requires enrollment (not already enrolled)
                      // We need to check if the class has an enrollment property or if it's a new class
                      const shouldShowEnrollmentCode = selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled
                      
                      return shouldShowEnrollmentCode
                    })() && (
                      <div className="space-y-2">
                        <label htmlFor="enrollmentCode" className="text-sm font-medium">
                          Enrollment code
                        </label>
                        <input
                          id="enrollmentCode"
                          type="text"
                          value={enrollmentCode}
                          onChange={(e) => setEnrollmentCode(e.target.value)}
                          placeholder="Enter enrollment code"
                          className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                    )}

                    <div className="flex gap-3">
                      <Button 
                        onClick={handleEnroll} 
                        disabled={!selectedClassId || (() => {
                          const selectedClass = availableClasses.find(c => c.id === selectedClassId)
                          return selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled && !enrollmentCode
                        })()}
                        className="flex-1"
                      >
                        {(() => {
                          const selectedClass = availableClasses.find(c => c.id === selectedClassId)
                          // Show "Enroll" for new classes, "Continue Training" for enrolled classes
                          const isNewClass = selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled
                          const buttonText = isNewClass ? "Enroll" : "Continue Training"
                          return buttonText
                        })()}
                      </Button>
                      <Button variant="outline" onClick={() => setShowClassSelection(false)}>
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No classes available for this training.</p>
                    <Button variant="outline" onClick={() => setShowClassSelection(false)} className="mt-4">
                      Close
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

      </div>
    </div>
  )
}