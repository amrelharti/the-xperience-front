"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, PlayCircle } from "lucide-react"
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

  const [module, setModule] = useState<TrainingModule | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  
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
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-4">
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="sm" asChild>
              <Link href={module?.trainingId ? `/admin/trainings/${module.trainingId}/modules` : "/admin/trainings"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {module?.trainingId ? "Back to Training Modules" : "Back to Trainings"}
              </Link>
            </Button>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Module Info */}
            {module && (
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">{module.title}</h1>
                <p className="text-muted-foreground mb-4">{module.description}</p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Module {module.orderIndex}</span>
                  <span>•</span>
                  <span>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Courses</h2>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>

            {/* Courses List */}
            {courses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <PlayCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Add your first course to this module to get started.
                  </p>
                  <Button onClick={() => setShowCreateDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Course
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-15 bg-muted rounded-lg flex items-center justify-center">
                          <PlayCircle className="h-8 w-8 text-muted-foreground" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{course.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{course.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>Order: {course.orderIndex}</span>
                            <span>•</span>
                            <span>{formatDuration(course.durationSeconds)}</span>
                            {course.videoUrl && (
                              <>
                                <span>•</span>
                                <span>Video available</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditCourse(course)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
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
              <DialogContent>
                <form onSubmit={handleCreateCourse}>
                  <DialogHeader>
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogDescription>
                      Add a new video course to this module
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="title">Course Title *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Course description..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="videoUrl">Video URL</Label>
                      <Input
                        id="videoUrl"
                        value={formData.videoUrl}
                        onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="durationSeconds">Duration (seconds)</Label>
                      <Input
                        id="durationSeconds"
                        type="number"
                        value={formData.durationSeconds}
                        onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })}
                        placeholder="1800"
                      />
                    </div>

                    <div>
                      <Label htmlFor="orderIndex">Order *</Label>
                      <Input
                        id="orderIndex"
                        type="number"
                        value={formData.orderIndex}
                        onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                        required
                      />
                    </div>

                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Create Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Course Dialog */}
            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
              <DialogContent>
                <form onSubmit={handleUpdateCourse}>
                  <DialogHeader>
                    <DialogTitle>Edit Course</DialogTitle>
                    <DialogDescription>
                      Update the course details
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="edit-title">Course Title *</Label>
                      <Input
                        id="edit-title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        placeholder="e.g., Introduction to React"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea
                        id="edit-description"
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                        placeholder="Course description..."
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-videoUrl">Video URL</Label>
                      <Input
                        id="edit-videoUrl"
                        value={editFormData.videoUrl}
                        onChange={(e) => setEditFormData({ ...editFormData, videoUrl: e.target.value })}
                        placeholder="https://example.com/video.mp4"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-durationSeconds">Duration (seconds)</Label>
                      <Input
                        id="edit-durationSeconds"
                        type="number"
                        value={editFormData.durationSeconds}
                        onChange={(e) => setEditFormData({ ...editFormData, durationSeconds: parseInt(e.target.value) || 0 })}
                        placeholder="1800"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-orderIndex">Order *</Label>
                      <Input
                        id="edit-orderIndex"
                        type="number"
                        value={editFormData.orderIndex}
                        onChange={(e) => setEditFormData({ ...editFormData, orderIndex: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Update Course
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </RequireAdmin>
  )
}
