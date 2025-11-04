"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, PlayCircle, Menu, X, Calendar, Clock, BookOpen, Video, GraduationCap } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import NextImage from "next/image"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"

interface Course {
  id: string
  title: string
  description: string
  videoUrl: string
  durationSeconds: number
  orderIndex: number
  thumbnailUrl?: string
}

interface TrainingModule {
  id: string
  trainingId: string
  title: string
  description: string
  orderIndex: number
}

export default function ModuleCoursesPage() {
  const params = useParams()
  const router = useRouter()
  const moduleId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()

  const [module, setModule] = useState<TrainingModule | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 1
  })

  const [editFormData, setEditFormData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 1
  })

  useEffect(() => {
    if (moduleId) {
      loadModule()
      loadCourses()
      setIsLoading(false)
    }
  }, [moduleId])

  const loadModule = async () => {
    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}`)
      if (res.ok) {
        const data = await res.json()
        setModule(data)
      }
    } catch (error) {
      console.error("Error loading module:", error)
    }
  }

  const loadCourses = async () => {
    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}/courses`)
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error loading courses:", error)
    }
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Course created successfully",
        })
        setFormData({
          title: "",
          description: "",
          videoUrl: "",
          durationSeconds: 0,
          orderIndex: courses.length + 1
        })
        setShowCreateDialog(false)
        loadCourses()
      } else {
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async (courseId: string) => {
    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}/courses/${courseId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
        loadCourses()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course)
    setEditFormData({
      title: course.title,
      description: course.description,
      videoUrl: course.videoUrl,
      durationSeconds: course.durationSeconds,
      orderIndex: course.orderIndex
    })
    setShowEditDialog(true)
  }

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCourse) return

    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editFormData)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        })
        setShowEditDialog(false)
        setEditingCourse(null)
        loadCourses()
      } else {
        toast({
          title: "Error",
          description: "Failed to update course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating course:", error)
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`
    } else {
      return `${remainingSeconds}s`
    }
  }

  if (isLoading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
          <div className="container mx-auto px-6 py-8">
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-16">
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005eb8] mx-auto"></div>
                  <p className="text-slate-600 text-lg">Loading courses...</p>
              </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Modern Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/admin" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
                <Link href="/admin" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/trainings" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Trainings
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/classes" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Classes
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Users
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/feed" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Feed
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/leaderboard" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-slate-100 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-4 sm:px-6 py-4 space-y-2 sm:space-y-3">
                <Link 
                  href="/admin" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/trainings" 
                  className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trainings
                </Link>
                <Link 
                  href="/admin/classes" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Classes
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  href="/admin/feed" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link 
                  href="/admin/leaderboard" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          )}
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Back Button */}
          <Button variant="outline" asChild size="sm" className="hover:bg-slate-100 text-sm sm:text-base -ml-2 sm:ml-0">
              <Link href={module?.trainingId ? `/admin/trainings/${module.trainingId}/modules` : "/admin/trainings"}>
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                {module?.trainingId ? "Back to Training Modules" : "Back to Trainings"}
              </Link>
            </Button>

            {/* Module Info */}
            {module && (
            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg animate-fade-in">
              <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
                <div className="text-center space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-xs sm:text-sm font-medium">
                    <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Module {module.orderIndex}
                  </div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent px-4">
                    {module.title}
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed px-4">
                    {module.description}
                  </p>
                  <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm flex-wrap">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                      <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-medium">Module {module.orderIndex}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                      <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="font-medium">{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-center animate-slide-up px-4">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              size="sm"
              className="h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Add Course
              </Button>
            </div>

            {/* Courses List */}
            {courses.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-16">
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">No courses yet</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                    Add your first course to this module to get started.
                  </p>
                  </div>
                  <Button 
                    onClick={() => setShowCreateDialog(true)}
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add First Course
                  </Button>
                </div>
                </CardContent>
              </Card>
            ) : (
            <div className="grid gap-4 sm:gap-6">
              {courses
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((course, index) => (
                  <Card 
                    key={course.id} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
                        {/* Course Thumbnail */}
                        <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg sm:rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-[#005eb8]/30 transition-colors duration-200 flex-shrink-0">
                          {course.thumbnailUrl ? (
                            <NextImage
                              src={course.thumbnailUrl}
                              alt={course.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                              sizes="80px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#005eb8]/20 to-[#0476D7]/10 group-hover:from-[#005eb8]/30 group-hover:to-[#0476D7]/20 transition-all duration-300">
                              <PlayCircle className="h-8 w-8 text-[#005eb8]/50 group-hover:text-[#005eb8]/70 transition-colors duration-300" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 w-full min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200 mb-1.5 sm:mb-2">
                            {course.title}
                          </h3>
                          <p className="text-slate-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base line-clamp-2">
                            {course.description}
                          </p>
                          <div className="flex items-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm flex-wrap">
                            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                              <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="font-medium">Order: {course.orderIndex}</span>
                            </div>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                              <span className="font-medium">{formatDuration(course.durationSeconds)}</span>
                            </div>
                            {course.videoUrl && (
                              <Badge className="px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white">
                                <Video className="h-3 w-3 mr-1" />
                                Video available
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                            className="hover:bg-[#FFBC00]/10 hover:border-[#FFBC00] hover:text-[#FFBC00] transition-all duration-200 flex-1 sm:flex-initial text-xs sm:text-sm"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden xs:inline">Edit</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200 flex-1 sm:flex-initial text-xs sm:text-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                            <span className="hidden xs:inline">Delete</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Create Course Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="border-0 bg-white/95 backdrop-blur-md shadow-2xl max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleCreateCourse}>
                <DialogHeader className="text-center space-y-2 sm:space-y-3 pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                    Create New Course
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-xs sm:text-sm">
                      Add a new video course to this module
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 px-4 sm:px-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-semibold text-slate-700">Course Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Course description..."
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="videoUrl" className="text-sm font-semibold text-slate-700">Video URL</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="durationSeconds" className="text-sm font-semibold text-slate-700">Duration (seconds)</Label>
                      <Input
                        id="durationSeconds"
                        type="number"
                        value={formData.durationSeconds}
                        onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })}
                        placeholder="1800"
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderIndex" className="text-sm font-semibold text-slate-700">Order *</Label>
                      <Input
                        id="orderIndex"
                        type="number"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                        required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                  </div>
                  </div>

                <DialogFooter className="gap-2 sm:gap-3 pt-3 sm:pt-4 px-4 sm:px-6 flex-col sm:flex-row">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateDialog(false)}
                    className="hover:bg-slate-100 w-full sm:w-auto text-sm sm:text-base"
                  >
                      Cancel
                    </Button>
                  <Button 
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base"
                  >
                      Create Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="border-0 bg-white/95 backdrop-blur-md shadow-2xl max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleUpdateCourse}>
                <DialogHeader className="text-center space-y-2 sm:space-y-3 pb-3 sm:pb-4 px-4 sm:px-6">
                  <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-full flex items-center justify-center">
                    <Edit className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <DialogTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                    Edit Course
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-xs sm:text-sm">
                      Update the course details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-3 sm:space-y-4 py-3 sm:py-4 px-4 sm:px-6">
                  <div className="space-y-2">
                    <Label htmlFor="edit-title" className="text-sm font-semibold text-slate-700">Course Title *</Label>
                      <Input
                        id="edit-title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-description" className="text-sm font-semibold text-slate-700">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Course description..."
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-videoUrl" className="text-sm font-semibold text-slate-700">Video URL</Label>
                      <Input
                        id="edit-videoUrl"
                        value={editFormData.videoUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-durationSeconds" className="text-sm font-semibold text-slate-700">Duration (seconds)</Label>
                      <Input
                        id="edit-durationSeconds"
                        type="number"
                        value={editFormData.durationSeconds}
                        onChange={(e) => setEditFormData({ ...editFormData, durationSeconds: parseInt(e.target.value) || 0 })}
                        placeholder="1800"
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-orderIndex" className="text-sm font-semibold text-slate-700">Order *</Label>
                      <Input
                        id="edit-orderIndex"
                        type="number"
                        value={editFormData.orderIndex}
                        onChange={(e) => setEditFormData({ ...editFormData, orderIndex: parseInt(e.target.value) })}
                        required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                      />
                    </div>
                  </div>

                <DialogFooter className="gap-2 sm:gap-3 pt-3 sm:pt-4 px-4 sm:px-6 flex-col sm:flex-row">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditDialog(false)}
                    className="hover:bg-slate-100 w-full sm:w-auto text-sm sm:text-base"
                  >
                      Cancel
                    </Button>
                  <Button 
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-4 sm:px-6 w-full sm:w-auto text-sm sm:text-base"
                  >
                      Update Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
        </div>
      </div>
    </RequireAdmin>
  )
}
