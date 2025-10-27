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
  const [unlockingModule, setUnlockingModule] = useState<string | null>(null)
  const [moduleAccessCode, setModuleAccessCode] = useState("")
  const [showUnlockDialog, setShowUnlockDialog] = useState(false)

  // Check authentication when component mounts
  useEffect(() => {
    if (!userLoading && !user) {
      window.location.href = "/auth/signin"
    }
  }, [user, userLoading])

  const loadModuleProgress = useCallback(async (trainingData: Training, classId?: string) => {
    if (!user || !trainingData?.modules) return

    try {
      // Get user's enrolled classes if classId not provided
      let selectedClassId = classId
      console.log("📊 loadModuleProgress called with classId:", classId)
      if (!selectedClassId) {
        const enrollmentsResponse = await fetch("/api/classes/my-classes")
        if (enrollmentsResponse.ok) {
          const enrollments = await enrollmentsResponse.json()
          // Find all classes for this training
          const trainingClasses = enrollments.filter((enrollment: any) => 
            enrollment.moduleId === params.id // moduleId is actually trainingId in backend
          )
          
          if (trainingClasses.length === 0) {
            console.log("No classes found for this training")
            return
          } else if (trainingClasses.length === 1) {
            // Only one class - use it automatically
            selectedClassId = trainingClasses[0].id
          } else {
            // Multiple classes - use the first one for now (class selector can be added later)
            selectedClassId = trainingClasses[0].id
            console.log(`Multiple classes found for training, using: ${selectedClassId}`)
          }
        }
      }

      if (!selectedClassId) {
        console.log("No class ID found for progress tracking")
        return
      }

      // Load progress for each module with class context
      console.log("📊 Loading progress for classId:", selectedClassId)
      const progressPromises = trainingData.modules.map(async (module) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${module.id}/training-progress?classId=${selectedClassId}`, {
            credentials: "include"
          })
          if (response.ok) {
            const progressData = await response.json()
            console.log(`📊 ${module.title} progress: ${progressData.progress || 0}% for class: ${selectedClassId}`)
            return { moduleId: module.id, progress: progressData.progress || 0 }
          }
        } catch (error) {
          console.log(`Failed to load progress for module ${module.id}:`, error)
        }
        return { moduleId: module.id, progress: 0 }
      })

      const progressResults = await Promise.all(progressPromises)
      console.log("📊 Progress results for all modules:", progressResults)
      
      // Update training with progress data
      setTraining(prevTraining => {
        if (!prevTraining?.modules) return prevTraining
        
        const updatedModules = prevTraining.modules.map(module => {
          const progressData = progressResults.find(p => p.moduleId === module.id)
          console.log(`📊 Updating ${module.title} progress to: ${progressData?.progress || 0}%`)
          return {
            ...module,
            progress: progressData?.progress || 0
          }
        })
        
        console.log("📊 Updated modules with progress:", updatedModules.map(m => ({ title: m.title, progress: m.progress })))
        
        return {
          ...prevTraining,
          modules: updatedModules
        }
      })
    } catch (error) {
      console.log("Error loading module progress:", error)
    }
  }, [user, params.id, selectedClassId])

  const loadAvailableClasses = useCallback(async () => {
    try {
      setLoadingClasses(true)
      console.log("🔍 Loading available classes for training:", params.id)
      const response = await fetch(`/api/classes/module/${params.id}`)
      if (response.ok) {
        const newClasses = await response.json()
        console.log("📚 Available classes from API:", newClasses)
        // Combine user's existing enrollments with new available classes
        setAvailableClasses(prevClasses => {
          const existingClassIds = prevClasses.map(c => c.id)
          const uniqueNewClasses = newClasses.filter((newClass: any) => !existingClassIds.includes(newClass.id))
          console.log("🔄 Combining classes - existing:", prevClasses.length, "new:", uniqueNewClasses.length)
          const combined = [...prevClasses, ...uniqueNewClasses]
          console.log("📋 Final combined classes:", combined)
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

      // Use overrideClassId if provided, otherwise use selectedClassId
      const classIdToUse = overrideClassId || selectedClassId
      const classIdParam = classIdToUse ? `?classId=${classIdToUse}` : ''
      console.log("🔄 Loading training with classId:", classIdToUse, "param:", classIdParam)
      const trainingResponse = await fetch(`/api/courses/${params.id}${classIdParam}`)
      if (!trainingResponse.ok) {
        throw new Error("Failed to load training")
      }
      const trainingData = await trainingResponse.json()
      console.log("Training data from API:", trainingData)
      console.log("📦 All module statuses for classId:", classIdToUse)
      trainingData.modules?.forEach((module: any) => {
        console.log(`  - ${module.title}: ${module.status}`)
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
            if (trainingEnrollments.length > 1) {
              // Check if student has a saved preference for this training
              const savedClassId = localStorage.getItem(`selectedClass_${params.id}`)
              const savedClass = savedClassId ? trainingEnrollments.find((c) => c.id === savedClassId) : null
              
              if (savedClass && savedClassId) {
                // Student has a saved preference, use it
                setSelectedClassId(savedClassId!)
                setIsEnrolled(true)
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
              // Load available classes in background for the switch button
              await loadAvailableClasses()
            }
          }
        } catch (enrollError) {
          console.log("Error loading enrolled classes:", enrollError)
        }
      }

      // If user is not enrolled in any classes for this training, load available classes and show modal
      if (!enrolled && user && user.id) {
        console.log("🔍 User not enrolled, loading available classes")
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
  }, [params.id, user?.id, loadModuleProgress, loadAvailableClasses])

  const handleUnlockModule = async (moduleId: string) => {
    setUnlockingModule(moduleId)
    setShowUnlockDialog(true)
  }

  const submitUnlockCode = async () => {
    if (!unlockingModule || !moduleAccessCode) {
      alert("Please enter an access code")
      return
    }

    // CRITICAL: Log the module ID being unlocked for debugging
    console.log("🔓 Unlocking module:", unlockingModule)
    console.log("🔑 Access code:", moduleAccessCode)
    
    // Validate we have a valid module ID
    const moduleToUnlock = training?.modules?.find(m => m.id === unlockingModule)
    if (!moduleToUnlock) {
      alert("Error: Module not found")
      return
    }
    console.log("📚 Target module:", moduleToUnlock.title)

    try {
      const response = await fetch(`/api/training-modules/${unlockingModule}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ 
          code: moduleAccessCode,
          // Explicitly include the module ID in the request body as a safeguard
          moduleId: unlockingModule,
          // CRITICAL: Pass classId for class-specific access
          classId: selectedClassId
        }),
      })

      if (response.ok) {
        alert("Module unlocked successfully!")
        setShowUnlockDialog(false)
        setModuleAccessCode("")
        setUnlockingModule(null)
        
        // Reload to update module access status
        await load()
        
        // Verify that ONLY the specific module was unlocked (backend bug check)
        setTimeout(() => {
          const updatedModules = training?.modules?.filter(m => m.status === "UNLOCKED")
          if (updatedModules && updatedModules.length > 1) {
            const expectedModule = updatedModules.find(m => m.id === unlockingModule)
            if (expectedModule) {
              console.warn("⚠️ WARNING: Multiple modules unlocked. Expected only:", moduleToUnlock.title)
              console.warn("⚠️ This indicates a backend issue - access codes should unlock only ONE module")
              console.warn("📊 Currently unlocked:", updatedModules.map(m => m.title))
            }
          }
        }, 1000)
      } else {
        const errorData = await response.json()
        alert(`Unlock failed: ${errorData.error || "Invalid or used code"}`)
      }
    } catch (error) {
      console.error("Error unlocking module:", error)
      alert("Network error. Please try again.")
    }
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
          // Reload the training data with the new class context
          setLoading(true)
          await load(selectedClassId) // Pass the classId explicitly
        } else {
          const errorData = await response.json()
          alert(`Enrollment failed: ${errorData.error || "Unknown error"}`)
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
      // Reload the training data with the new class context
      setLoading(true)
      await load(selectedClassId) // Pass the classId explicitly
    }
  }

  useEffect(() => {
    load()
  }, [load])

  // Debug: Track selectedClassId changes
  useEffect(() => {
    console.log("🎯 selectedClassId changed to:", selectedClassId)
  }, [selectedClassId])

  // Debug: Track modal rendering
  useEffect(() => {
    if (showClassSelection) {
      console.log("🎨 Modal opened - available classes:", availableClasses, "selectedClassId:", selectedClassId)
    }
  }, [showClassSelection, availableClasses, selectedClassId])

  // Debug: Track switch button visibility
  useEffect(() => {
    console.log("🔍 Switch button check - availableClasses.length:", availableClasses.length, "isEnrolled:", isEnrolled, "should show:", availableClasses.length > 1 && isEnrolled)
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
            <Button onClick={() => load()}>Try Again</Button>
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
            <h1 className="text-2xl font-bold mb-4">Training Not Found</h1>
            <p className="text-muted-foreground mb-4">The training you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/courses">Back to Trainings</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const totalModules = training.modules?.length || 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/" className="flex items-center gap-2 hover:text-[#0476D7] transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Trainings
            </Link>
          </Button>

          <div className="space-y-6">
            
            {/* Training Info */}
            <div className="w-full">
              <div className="flex items-start gap-4 mb-4">
                {training.thumbnailUrl && (
                  <div className="w-52 h-52 rounded-2xl overflow-hidden flex-shrink-0 shadow-xl">
                    <NextImage
                      src={training.thumbnailUrl}
                      alt={training.title}
                      width={208}
                      height={208}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <div className="mb-4">
                    <Badge className="bg-gradient-to-r from-[#0476D7] to-[#0068A7] text-white mb-3">
                      Training Program
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-semibold mb-3 text-[#0476D7]">{training.title}</h1>
                  <p className="text-[#666] mb-6 leading-relaxed text-base">{training.description}</p>
                  
                  {/* Progress Overview */}
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-br from-[#0476D7]/10 to-[#0476D7]/5 rounded-xl border border-[#0476D7]/20">
                      <div className="p-2 bg-[#0476D7] rounded-lg">
                        <BookOpen className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-[#047690] font-medium">Total Modules</div>
                        <div className="text-lg font-bold text-[#0476D7]">{totalModules}</div>
                      </div>
                    </div>
    
                  </div>
                  
                  
                </div>
                
              </div>
            </div>
            {/* Class-Specific Social Features */}
            {isEnrolled && selectedClassId && (
                    <div className="flex justify-center mt-6">
                      <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 rounded-2xl border-2 border-purple-100 w-full max-w-4xl">
                        <p className="text-sm font-semibold text-purple-700 mb-4 flex items-center gap-2 justify-center">
                          <Users className="h-4 w-4" />
                          Class Community
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button 
                          asChild
                          className="flex items-center gap-2 text-white rounded-full shadow-sm hover:shadow-md border-0 transition-all duration-200"
                          style={{ background: 'linear-gradient(90deg, #0068A7, #0476D7)' }}
                        >
                          <Link href={`/feed?training=${params.id}&class=${selectedClassId}`}>
                            <MessageSquare className="h-4 w-4" />
                            Class Feed
                          </Link>
                        </Button>
                        <Button 
                          asChild
                          className="flex items-center gap-2 text-white rounded-full shadow-sm hover:shadow-md border-0 transition-all duration-200"
                          style={{ background: 'linear-gradient(90deg, #FFBC00, #FFD84D)' }}
                        >
                          <Link href={`/leaderboard?training=${params.id}&class=${selectedClassId}`}>
                            <Trophy className="h-4 w-4" />
                            Leaderboard
                          </Link>
                        </Button>
                        {availableClasses.length > 1 && (
                          <Button 
                            variant="outline" 
                            onClick={async () => {
                              localStorage.removeItem(`selectedClass_${params.id}`)
                              setShowClassSelection(true)
                              await loadAvailableClasses()
                            }}
                            className="flex items-center gap-2 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border-0"
                            style={{ background: 'linear-gradient(90deg, #F1F5F9, #E2E8F0)', color: '#334155' }}
                          >
                            <Users className="h-4 w-4" />
                            Switch Class
                          </Button>
                        )}
                        </div>
                      </div>
                    </div>
                  )}
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-1 w-12 bg-gradient-to-r from-[#0476D7] to-[#FFBC00] rounded-full"></div>
            <h2 className="text-2xl font-semibold text-[#0476D7]">Training Modules</h2>
          </div>
          {training.modules?.map((module, index) => (
            <Card key={module.id} className="hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Module Thumbnail */}
                    {module.thumbnailUrl && (
                      <div className="w-23 h-23 rounded-lg overflow-hidden flex-shrink-0">
                        <NextImage
                          src={module.thumbnailUrl}
                          alt={module.title}
                          width={160}
                          height={160}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-[#0476D7]">{module.title}</h3>
                        {module.status === "LOCKED" ? (
                          <Badge variant="outline" className="border-orange-500 text-orange-700">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        ) : (
                          <div className="relative inline-flex items-center justify-center">
                            <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20"></div>
                            <CheckCircle className="h-6 w-6 text-green-600 relative" />
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3">{module.description}</p>
                      
                      {/* Progress Bar */}
                      {module.progress !== undefined && module.progress > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="font-semibold text-foreground">Progress</span>
                            <span className="font-bold text-[#0476D7]">{module.progress}%</span>
                          </div>
                          <Progress value={module.progress} className="h-3 bg-muted" />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{module.coursesCount} courses</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>Live sessions</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {module.status === "LOCKED" ? (
                      <Button
                        variant="outline"
                        onClick={() => handleUnlockModule(module.id)}
                        disabled={!isEnrolled}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Unlock Module
                      </Button>
                    ) : (
                      <Button asChild className="bg-[#0476D7] hover:bg-[#0068A7] shadow-md hover:shadow-lg">
                        <Link href={`/courses/${params.id}/modules/${module.id}`}>
                          <PlayCircle className="h-5 w-5 mr-2" />
                          {module.progress && module.progress > 0 ? "Continue" : "Start Module"}
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Unlock Dialog */}
        {showUnlockDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Unlock Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label htmlFor="accessCode" className="text-sm font-medium">
                    Access Code
                  </label>
                  <Input
                    id="accessCode"
                    type="text"
                    value={moduleAccessCode}
                    onChange={(e) => setModuleAccessCode(e.target.value)}
                    placeholder="Enter access code"
                    className="mt-1"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={submitUnlockCode} className="flex-1">
                    Unlock
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUnlockDialog(false)
                      setModuleAccessCode("")
                      setUnlockingModule(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Class Selection Modal */}
        {showClassSelection && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4">
              <CardHeader>
                <CardTitle>Select a Class</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                          <h3 className="text-sm font-medium text-blue-600 mb-2">📚 Your Previous Classes (Archived)</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Continue your training progress in classes you were enrolled in
                          </p>
                          <div className="space-y-2">
                            {availableClasses.filter((classItem) => !classItem.isActive && classItem.isArchived).map((classItem) => (
                              <div
                                key={classItem.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedClassId === classItem.id
                                    ? "border-blue-500 bg-blue-50"
                                    : "border-blue-200 bg-blue-25 hover:border-blue-300"
                                }`}
                                onClick={() => {
                                  console.log("🖱️ Clicked on ARCHIVED class:", classItem.name, "id:", classItem.id)
                                  console.log("🔍 Current selectedClassId before:", selectedClassId)
                                  setSelectedClassId(classItem.id)
                                  console.log("✅ Set selectedClassId to:", classItem.id)
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-4 w-4 rounded-full border-2 ${
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
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Active Classes Section */}
                      {availableClasses.filter((classItem) => classItem.isActive && !classItem.isArchived).length > 0 && (
                        <div>
                          <h3 className="text-sm font-medium text-green-600 mb-2">🆕 Available Active Classes</h3>
                          <p className="text-xs text-muted-foreground mb-3">
                            Enroll in new active classes for this training
                          </p>
                          <div className="space-y-2">
                            {availableClasses.filter((classItem) => classItem.isActive && !classItem.isArchived).map((classItem) => (
                              <div
                                key={classItem.id}
                                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                  selectedClassId === classItem.id
                                    ? "border-green-500 bg-green-50"
                                    : "border-green-200 bg-green-25 hover:border-green-300"
                                }`}
                                onClick={() => {
                                  console.log("🖱️ Clicked on ACTIVE class:", classItem.name, "id:", classItem.id)
                                  console.log("🔍 Current selectedClassId before:", selectedClassId)
                                  setSelectedClassId(classItem.id)
                                  console.log("✅ Set selectedClassId to:", classItem.id)
                                }}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`h-4 w-4 rounded-full border-2 ${
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
                              </div>
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
                            Load Available Classes for Enrollment
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Show enrollment code only for new active classes that student is NOT enrolled in */}
                    {selectedClassId && (() => {
                      const selectedClass = availableClasses.find(c => c.id === selectedClassId)
                      console.log("🔍 Selected class for enrollment check:", selectedClass)
                      console.log("🔍 Class properties - isActive:", selectedClass?.isActive, "isArchived:", selectedClass?.isArchived, "isEnrolled:", selectedClass?.isEnrolled)
                      // Check if this is a new class that requires enrollment (not already enrolled)
                      // We need to check if the class has an enrollment property or if it's a new class
                      const shouldShowEnrollmentCode = selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled
                      console.log("🔍 Should show enrollment code:", shouldShowEnrollmentCode)
                      return shouldShowEnrollmentCode
                    })() && (
                      <div className="space-y-2">
                        <label htmlFor="enrollmentCode" className="text-sm font-medium">
                          Enrollment Code
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
                          console.log("🔍 Button text logic - selectedClass:", selectedClass)
                          console.log("🔍 Button text logic - isActive:", selectedClass?.isActive, "isArchived:", selectedClass?.isArchived, "isEnrolled:", selectedClass?.isEnrolled)
                          // Show "Enroll" for new classes, "Continue Training" for enrolled classes
                          const isNewClass = selectedClass && selectedClass.isActive && !selectedClass.isArchived && !selectedClass.isEnrolled
                          const buttonText = isNewClass ? "Enroll" : "Continue Training"
                          console.log("🔍 Button text result:", buttonText)
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