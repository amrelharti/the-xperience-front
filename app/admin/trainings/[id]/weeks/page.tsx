"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Plus, Edit, Trash2, ArrowLeft, PlayCircle, Key, Copy, Calendar, Video, Clock, GripVertical } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import Navbar from "@/app/components/Navbar"

interface Training {
  id: string
  title: string
  description: string
}

interface Week {
  id: string
  trainingId: string
  title: string
  description: string
  orderIndex: number
  courses?: Course[]
}

interface Course {
  id: string
  weekId: string
  title: string
  description: string
  videoUrl?: string
  durationSeconds: number
  orderIndex: number
}

export default function WeeksManagementPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const trainingId = params.id as string

  const [training, setTraining] = useState<Training | null>(null)
  const [weeks, setWeeks] = useState<Week[]>([])
  const [loading, setLoading] = useState(true)
  
  // Dialogs
  const [showCreateWeek, setShowCreateWeek] = useState(false)
  const [showEditWeek, setShowEditWeek] = useState(false)
  const [selectedWeek, setSelectedWeek] = useState<Week | null>(null)
  
  // Week form
  const [weekForm, setWeekForm] = useState({
    title: "",
    description: "",
    orderIndex: 0
  })

  // Course management
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [selectedWeekForCourse, setSelectedWeekForCourse] = useState<string | null>(null)
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 0
  })

  useEffect(() => {
    loadTraining()
    loadWeeks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingId])

  const loadTraining = async () => {
    try {
      // Using existing courses API (courses = trainings)
      const res = await fetch(`/api/admin/courses/${trainingId}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setTraining(data)
      }
    } catch (error) {
      console.error("Error loading training:", error)
    }
  }

  const loadWeeks = async () => {
    try {
      setLoading(true)
      // Using existing modules API (modules = weeks)
      const res = await fetch(`/api/admin/courses/${trainingId}/modules`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setWeeks(data.sort((a, b) => a.orderIndex - b.orderIndex))
      }
    } catch (error) {
      console.error("Error loading weeks:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateWeek = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId: trainingId,
          ...weekForm
        })
      })

      if (res.ok) {
        toast({
          title: "Week Created",
          description: "New week added successfully",
        })
        setShowCreateWeek(false)
        setWeekForm({ title: "", description: "", orderIndex: 0 })
        loadWeeks()
      } else {
        toast({
          title: "Error",
          description: "Failed to create week",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating week:", error)
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      })
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWeekForCourse) return

    try {
      // Note: This would need a new backend endpoint
      // For now, using the existing module creation which creates one "course" (video)
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          courseId: trainingId,
          ...courseForm,
          // Mark this as belonging to a specific week
          parentModuleId: selectedWeekForCourse
        })
      })

      if (res.ok) {
        toast({
          title: "Course Added",
          description: "New course added to week successfully",
        })
        setShowAddCourse(false)
        setCourseForm({ title: "", description: "", videoUrl: "", durationSeconds: 0, orderIndex: 0 })
        loadWeeks()
      } else {
        toast({
          title: "Error",
          description: "Failed to add course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error adding course:", error)
      toast({
        title: "Error",
        description: "Network error",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p>Loading weeks...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        <Navbar />

        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/admin/trainings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {training?.title} - Week Management
                </h1>
                <p className="text-muted-foreground">
                  Add and manage weeks for this training. Each week can contain multiple courses.
                </p>
              </div>
              <Button onClick={() => setShowCreateWeek(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Week
              </Button>
            </div>
          </div>

          {/* Weeks List */}
          {weeks.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No weeks yet</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first week
                </p>
                <Button onClick={() => setShowCreateWeek(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Week
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {weeks.map((week, index) => (
                <AccordionItem key={week.id} value={week.id} className="border rounded-lg">
                  <Card>
                    <AccordionTrigger className="px-6 hover:no-underline">
                      <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-5 w-5 text-muted-foreground" />
                          <Badge variant="outline">Week {index + 1}</Badge>
                        </div>
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold">{week.title}</h3>
                          <p className="text-sm text-muted-foreground">{week.description}</p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <PlayCircle className="h-4 w-4" />
                          <span>{week.courses?.length || 0} courses</span>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="px-6 pb-4 space-y-4">
                        {/* Courses in this week */}
                        {week.courses && week.courses.length > 0 ? (
                          <div className="space-y-2">
                            {week.courses.map((course, courseIndex) => (
                              <Card key={course.id} className="border-l-4 border-l-primary">
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Badge variant="secondary">{courseIndex + 1}</Badge>
                                      <div>
                                        <h4 className="font-medium">{course.title}</h4>
                                        <p className="text-sm text-muted-foreground">
                                          {course.description}
                                        </p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{Math.round(course.durationSeconds / 60)} min</span>
                                          </div>
                                          {course.videoUrl && (
                                            <div className="flex items-center gap-1">
                                              <Video className="h-3 w-3" />
                                              <span>Video</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button variant="ghost" size="sm">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 bg-muted/30 rounded-lg">
                            <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">No courses in this week yet</p>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedWeekForCourse(week.id)
                              setShowAddCourse(true)
                            }}
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Course
                          </Button>
                          <Button variant="outline" size="sm">
                            <Key className="h-4 w-4 mr-2" />
                            Access Codes
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/modules/${week.id}`}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Week
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </Card>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>

        {/* Create Week Dialog */}
        <Dialog open={showCreateWeek} onOpenChange={setShowCreateWeek}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Week</DialogTitle>
              <DialogDescription>
                Add a new week to this training program
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateWeek}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Week Title</Label>
                  <Input
                    id="title"
                    value={weekForm.title}
                    onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
                    placeholder="e.g., Introduction to React"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={weekForm.description}
                    onChange={(e) => setWeekForm({ ...weekForm, description: e.target.value })}
                    placeholder="What will students learn this week?"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="orderIndex">Week Number</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={weekForm.orderIndex}
                    onChange={(e) => setWeekForm({ ...weekForm, orderIndex: parseInt(e.target.value) })}
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    0 = Week 1, 1 = Week 2, etc.
                  </p>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowCreateWeek(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Week</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Add Course Dialog */}
        <Dialog open={showAddCourse} onOpenChange={setShowAddCourse}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Course to Week</DialogTitle>
              <DialogDescription>
                Add a new video course to this week
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddCourse}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="courseTitle">Course Title</Label>
                  <Input
                    id="courseTitle"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                    placeholder="e.g., Setting Up Your Environment"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="courseDescription">Description</Label>
                  <Textarea
                    id="courseDescription"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                    placeholder="What will this course cover?"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="videoUrl">Video URL</Label>
                  <Input
                    id="videoUrl"
                    value={courseForm.videoUrl}
                    onChange={(e) => setCourseForm({ ...courseForm, videoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={Math.round(courseForm.durationSeconds / 60)}
                    onChange={(e) => setCourseForm({ ...courseForm, durationSeconds: parseInt(e.target.value) * 60 })}
                    min="0"
                  />
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button type="button" variant="outline" onClick={() => setShowAddCourse(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Course</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}
