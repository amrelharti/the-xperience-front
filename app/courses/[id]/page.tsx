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
  Award
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

  const loadModuleProgress = useCallback(async (trainingData: Training) => {
    if (!user || !trainingData?.modules) return

    try {
      // Load progress for each module
      const progressPromises = trainingData.modules.map(async (module) => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/modules/${module.id}/training-progress`, {
            credentials: "include"
          })
          if (response.ok) {
            const progressData = await response.json()
            return { moduleId: module.id, progress: progressData.progress || 0 }
          }
        } catch (error) {
          console.log(`Failed to load progress for module ${module.id}:`, error)
        }
        return { moduleId: module.id, progress: 0 }
      })

      const progressResults = await Promise.all(progressPromises)
      
      // Update training with progress data
      setTraining(prevTraining => {
        if (!prevTraining?.modules) return prevTraining
        
        const updatedModules = prevTraining.modules.map(module => {
          const progressData = progressResults.find(p => p.moduleId === module.id)
          return {
            ...module,
            progress: progressData?.progress || 0
          }
        })
        
        return {
          ...prevTraining,
          modules: updatedModules
        }
      })
    } catch (error) {
      console.log("Error loading module progress:", error)
    }
  }, [user])

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load training details with modules
      const trainingResponse = await fetch(`/api/courses/${params.id}`)
      if (!trainingResponse.ok) {
        throw new Error("Failed to load training")
      }
      const trainingData = await trainingResponse.json()
      console.log("Training data from API:", trainingData)
      setTraining(trainingData)

      // Check if user is enrolled (only if authenticated)
      let enrolled = false
      if (user && user.id) {
        try {
          const enrollmentsResponse = await fetch("/api/classes/my-classes")
          if (enrollmentsResponse.ok) {
            const enrollments = await enrollmentsResponse.json()
            enrolled = enrollments.some((enrollment: any) => 
              enrollment.moduleId === params.id // moduleId is actually trainingId in backend
            )
            setIsEnrolled(enrolled)
          }
        } catch (enrollError) {
          console.log("Error loading enrolled classes:", enrollError)
        }
      }

      // Load progress if user is enrolled
      if (enrolled && user && trainingData?.modules) {
        await loadModuleProgress(trainingData)
      }
    } catch (err) {
      console.error("Error loading training:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, [params.id, user?.id])

  const handleUnlockModule = async (moduleId: string) => {
    setUnlockingModule(moduleId)
    setShowUnlockDialog(true)
  }

  const submitUnlockCode = async () => {
    if (!unlockingModule || !moduleAccessCode) {
      alert("Please enter an access code")
      return
    }

    try {
      const response = await fetch(`/api/training-modules/${unlockingModule}/unlock`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code: moduleAccessCode }),
      })

      if (response.ok) {
        alert("Module unlocked successfully!")
        setShowUnlockDialog(false)
        setModuleAccessCode("")
        setUnlockingModule(null)
        // Reload to update module access status
        load()
      } else {
        const errorData = await response.json()
        alert(`Unlock failed: ${errorData.error || "Invalid or used code"}`)
      }
    } catch (error) {
      console.error("Error unlocking module:", error)
      alert("Network error. Please try again.")
    }
  }

  const loadAvailableClasses = async () => {
    try {
      setLoadingClasses(true)
      const response = await fetch(`/api/classes/module/${params.id}`)
      if (response.ok) {
        const classes = await response.json()
        setAvailableClasses(classes)
        setShowClassSelection(true)
      } else {
        console.error("Failed to load classes")
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    } finally {
      setLoadingClasses(false)
    }
  }

  const handleEnroll = async () => {
    if (!selectedClassId || !enrollmentCode) {
      alert("Please select a class and enter an enrollment code")
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
        // Reload the page to update the UI
        window.location.reload()
      } else {
        const errorData = await response.json()
        alert(`Enrollment failed: ${errorData.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error enrolling:", error)
      alert("Network error. Please try again.")
    }
  }


  useEffect(() => {
    load()
  }, [load])


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
            <Button onClick={load}>Try Again</Button>
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Trainings
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* Training Thumbnail */}
              {training.thumbnailUrl && (
                <div className="relative h-48 w-full max-w-2xl rounded-lg overflow-hidden mb-6 bg-muted">
                  <NextImage
                    src={training.thumbnailUrl}
                    alt={training.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 672px"
                  />
                </div>
              )}
              
              <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">
                {training.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-4">
                {training.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{totalModules} modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Sequential learning</span>
                </div>
              </div>
            </div>

            <div className="ml-8">
              {isEnrolled ? (
                <div className="text-center">
                  <Badge variant="secondary" className="mb-2">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Enrolled
                  </Badge>
                  <p className="text-sm text-muted-foreground">You're enrolled in this training</p>
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={loadAvailableClasses}
                  disabled={loadingClasses}
                  className="min-w-[200px]"
                >
                  {loadingClasses ? "Loading..." : "Enroll in Training"}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Enrollment Status */}
        {isEnrolled && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Enrollment Status
              </CardTitle>
            </CardHeader>
              <CardContent>
              <p className="text-muted-foreground">
                You are currently enrolled in this training. You can access all modules and track your progress.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Training Modules */}
        {isEnrolled && training.modules && training.modules.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 font-[family-name:var(--font-space-grotesk)]">
              Training Modules (Sequential Access)
            </h2>
            <div className="space-y-4">
              {training.modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((module, index) => {
                const isLocked = module.status === "LOCKED"
                const isUnlocked = module.status === "UNLOCKED" || module.hasAccess
                
                // Check if previous module is unlocked (for modules after Module 1)
                const previousModuleUnlocked = index === 0 || training.modules!
                  .sort((a, b) => a.orderIndex - b.orderIndex)[index - 1]?.hasAccess
                
                const canUnlock = index === 0 || previousModuleUnlocked // Module 1 is always unlockable
                const showLockMessage = isLocked && !canUnlock
                
                return (
                  <Card key={module.id} className={`hover:shadow-md transition-shadow ${isLocked && !canUnlock ? 'opacity-60' : ''}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {/* Module Number/Status */}
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isUnlocked ? 'bg-green-100 text-green-600' :
                          canUnlock ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {isUnlocked ? (
                            <CheckCircle className="h-6 w-6" />
                          ) : isLocked ? (
                            <Lock className="h-6 w-6" />
                          ) : (
                            <span className="font-bold text-lg">{module.orderIndex}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">Module {module.orderIndex}: {module.title}</h3>
                            {isUnlocked && <Badge className="bg-green-100 text-green-800">Unlocked</Badge>}
                            {isLocked && canUnlock && <Badge className="bg-blue-100 text-blue-800">Ready to Unlock</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{module.description}</p>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <PlayCircle className="h-4 w-4" />
                              <span>{module.coursesCount} courses</span>
                            </div>
                            {!module.isActive && (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </div>
                          
                          {/* Progress Bar */}
                          {isUnlocked && module.progress !== undefined && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span className="font-medium">{module.progress}%</span>
                              </div>
                              <Progress value={module.progress} className="h-2" />
                            </div>
                          )}
                        </div>
                        
                        {isLocked ? (
                          <div className="flex flex-col items-end gap-2">
                            {showLockMessage ? (
                              <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                                <div className="flex items-center gap-2">
                                  <Lock className="h-4 w-4" />
                                  <span>Complete Module {index} first</span>
                                </div>
                              </div>
                            ) : (
                              <Button
                                onClick={() => handleUnlockModule(module.id)}
                                disabled={!canUnlock}
                                size="sm"
                                variant="outline"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Unlock Module
                              </Button>
                            )}
                          </div>
                        ) : (
                          <Button asChild>
                            <Link href={`/courses/${params.id}/modules/${module.id}`}>
                              <PlayCircle className="h-4 w-4 mr-2" />
                              View Module
                            </Link>
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        {/* Unlock Module Dialog */}
        {showUnlockDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle>Unlock Module</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enter the access code to unlock this module and access its courses.
                </p>
                <div className="space-y-2">
                  <label htmlFor="moduleAccessCode" className="text-sm font-medium">
                    Access Code
                  </label>
                  <Input
                    id="moduleAccessCode"
                    type="text"
                    value={moduleAccessCode}
                    onChange={(e) => setModuleAccessCode(e.target.value)}
                    placeholder="Enter module access code"
                  />
                </div>
                <div className="flex gap-3">
                  <Button onClick={submitUnlockCode} disabled={!moduleAccessCode}>
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
                    <div className="space-y-3">
                      {availableClasses.map((classItem) => (
                        <div
                          key={classItem.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedClassId === classItem.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                          onClick={() => setSelectedClassId(classItem.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-4 w-4 rounded-full border-2 ${
                              selectedClassId === classItem.id
                                ? "border-primary bg-primary"
                                : "border-muted-foreground"
                            }`} />
                            <div className="flex-1">
                              <h3 className="font-medium">{classItem.name}</h3>
                              <p className="text-sm text-muted-foreground">{classItem.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{new Date(classItem.startDate).toLocaleDateString()} - {new Date(classItem.endDate).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="h-4 w-4" />
                                  <span>{classItem.currentEnrollments}/{classItem.maxStudents || "∞"} students</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

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

                    <div className="flex gap-3">
                      <Button onClick={handleEnroll} disabled={!selectedClassId || !enrollmentCode}>
                        Enroll
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