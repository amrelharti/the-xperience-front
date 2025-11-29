"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Video, Calendar, Clock, Users, MapPin, Key, User } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "@/app/hooks/useUser"
import UserDropdown from "@/app/components/UserDropdown"

interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
}

interface Module {
  id: string
  trainingId: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
}

interface LiveSession {
  id: string
  title: string
  description: string
  startsAt: string
  endsAt: string
  location: string
  meetingUrl: string
  meetingPassword: string
  durationMinutes: number
  instructorName: string
  classId?: string
  className?: string
}

interface Class {
  id: string
  name: string
  description?: string
  isActive: boolean
  isArchived?: boolean
}

export default function AdminModuleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string
  const moduleId = params.moduleId as string
  const { toast } = useToast()
  const { user } = useUser()

  const [training, setTraining] = useState<Training | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [liveSessions, setLiveSessions] = useState<Map<string, LiveSession>>(new Map())
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [liveSessionForm, setLiveSessionForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    location: "",
    meetingUrl: "",
    meetingPassword: "",
    durationMinutes: 60,
    instructorName: "",
    classId: ""
  })

  const loadData = async () => {
    await Promise.all([
      loadTraining(),
      loadModule(),
      loadClasses()
    ])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [trainingId, moduleId])

  const loadTraining = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${trainingId}`, {
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

  const loadModule = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${trainingId}/training-modules`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        const foundModule = data.find((m: Module) => m.id === moduleId)
        setModule(foundModule || null)
      }
    } catch (error) {
      console.error("Error loading module:", error)
    }
  }

  const loadClasses = async () => {
    try {
      const res = await fetch(`/api/courses/${trainingId}/classes`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setClasses(data)
        // Load live sessions for all classes
        await loadAllLiveSessions(data)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }

  const loadAllLiveSessions = async (classesList: Class[]) => {
    const sessionsMap = new Map<string, LiveSession>()
    
    for (const classItem of classesList) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session?classId=${classItem.id}`, {
          credentials: "include"
        })
        if (res.ok) {
          const data = await res.json()
          if (data && !data.message) {
            sessionsMap.set(classItem.id, { ...data, classId: classItem.id, className: classItem.name })
          }
        }
      } catch (error) {
        console.log(`Live session not available for class ${classItem.id}:`, error)
      }
    }
    
    setLiveSessions(sessionsMap)
  }

  const loadLiveSessionForClass = async (classId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session?classId=${classId}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        if (data && !data.message) {
          const classItem = classes.find(c => c.id === classId)
          setLiveSessions(prev => {
            const newMap = new Map(prev)
            newMap.set(classId, { ...data, classId, className: classItem?.name })
            return newMap
          })
        } else {
          setLiveSessions(prev => {
            const newMap = new Map(prev)
            newMap.delete(classId)
            return newMap
          })
        }
      }
    } catch (error) {
      console.log(`Error loading live session for class ${classId}:`, error)
    }
  }

  const handleSaveLiveSession = async () => {
    try {
      // Validate required fields
      if (!liveSessionForm.startsAt) {
        toast({
          title: "Error",
          description: "Please fill in the start date and time",
          variant: "destructive"
        })
        return
      }

      const startsAtDate = new Date(liveSessionForm.startsAt)

      if (isNaN(startsAtDate.getTime())) {
        toast({
          title: "Error",
          description: "Invalid date format. Please check the date and try again.",
          variant: "destructive"
        })
        return
      }

      // Calculate endsAt from startsAt + durationMinutes
      const endsAtDate = new Date(startsAtDate)
      endsAtDate.setMinutes(endsAtDate.getMinutes() + liveSessionForm.durationMinutes)

      if (!liveSessionForm.classId) {
        toast({
          title: "Error",
          description: "Please select a class",
          variant: "destructive"
        })
        return
      }

      const formData = {
        ...liveSessionForm,
        moduleId: moduleId,
        classId: liveSessionForm.classId,
        startsAt: startsAtDate.toISOString(),
        endsAt: endsAtDate.toISOString()
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session${liveSessionForm.classId ? `?classId=${liveSessionForm.classId}` : ''}`
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const data = await res.json()
        await loadLiveSessionForClass(liveSessionForm.classId)
        setShowDialog(false)
        setIsEditing(false)
        toast({
          title: "Success",
          description: "Live session saved successfully"
        })
      } else {
        const errorData = await res.json()
        toast({
          title: "Error",
          description: errorData.error || "Failed to save live session"
        })
      }
    } catch (error) {
      console.error("Error saving live session:", error)
      toast({
        title: "Error",
        description: "Failed to save live session"
      })
    }
  }

  const handleDeleteLiveSession = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this live session?")) return

    try {
      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session?classId=${classId}`
      const res = await fetch(url, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        await loadLiveSessionForClass(classId)
        toast({
          title: "Success",
          description: "Live session deleted successfully"
        })
      }
    } catch (error) {
      console.error("Error deleting live session:", error)
    }
  }

  const openEditDialog = (classId?: string, existingSession?: LiveSession) => {
    if (existingSession) {
      setLiveSessionForm({
        title: existingSession.title,
        description: existingSession.description || "",
        startsAt: new Date(existingSession.startsAt).toISOString().slice(0, 16),
        endsAt: "", // Will be calculated from startsAt + durationMinutes
        location: existingSession.location || "",
        meetingUrl: existingSession.meetingUrl,
        meetingPassword: existingSession.meetingPassword || "",
        durationMinutes: existingSession.durationMinutes,
        instructorName: existingSession.instructorName || "",
        classId: existingSession.classId || classId || ""
      })
      setIsEditing(true)
    } else {
      setLiveSessionForm({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "", // Will be calculated from startsAt + durationMinutes
        location: "",
        meetingUrl: "",
        meetingPassword: "",
        durationMinutes: 60,
        instructorName: "",
        classId: classId || ""
      })
      setIsEditing(false)
    }
    setShowDialog(true)
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  if (!module) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Module Not Found</h1>
            <Button asChild>
              <Link href={`/admin/trainings/${trainingId}/modules`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
              </Link>
            </Button>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href={`/admin/trainings/${trainingId}/modules`}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Modules
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{module.title}</h1>
                <p className="text-muted-foreground">{training?.title}</p>
              </div>
            </div>
            <UserDropdown />
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Module Info */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Module Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Title</Label>
                  <p className="text-sm text-muted-foreground">{module.title}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order Index</Label>
                  <p className="text-sm text-muted-foreground">{module.orderIndex}</p>
                </div>
                <div className="md:col-span-2">
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Session Management */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="h-5 w-5" />
                  Live Session Management (Per Class)
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Classes Found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create classes for this training first, then you can add live sessions per class.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {classes.map((classItem) => {
                    const session = liveSessions.get(classItem.id)
                    return (
                      <Card key={classItem.id} className="border-l-4 border-l-blue-500">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-lg">{classItem.name}</CardTitle>
                              {classItem.description && (
                                <p className="text-sm text-muted-foreground mt-1">{classItem.description}</p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => openEditDialog(classItem.id, session)} 
                                variant="outline"
                                size="sm"
                              >
                                {session ? "Edit Session" : "Create Session"}
                              </Button>
                              {session && (
                                <Button 
                                  onClick={() => handleDeleteLiveSession(classItem.id)} 
                                  variant="destructive"
                                  size="sm"
                                >
                                  Delete
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {session ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Title</Label>
                                  <p className="text-sm text-muted-foreground">{session.title}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Instructor</Label>
                                  <p className="text-sm text-muted-foreground">{session.instructorName || "N/A"}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Start Time</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(session.startsAt).toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Duration</Label>
                                  <p className="text-sm text-muted-foreground">{session.durationMinutes} minutes</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Meeting URL</Label>
                                  <p className="text-sm text-muted-foreground break-all">{session.meetingUrl}</p>
                                </div>
                                {session.meetingPassword && (
                                  <div>
                                    <Label className="text-sm font-medium">Password</Label>
                                    <p className="text-sm text-muted-foreground">{session.meetingPassword}</p>
                                  </div>
                                )}
                              </div>
                              {session.description && (
                                <div>
                                  <Label className="text-sm font-medium">Description</Label>
                                  <p className="text-sm text-muted-foreground">{session.description}</p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center py-4 border-2 border-dashed rounded-lg">
                              <Video className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                              <p className="text-sm text-muted-foreground mb-2">No live session for this class</p>
                              <Button onClick={() => openEditDialog(classItem.id)} variant="outline" size="sm">
                                Create Live Session
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Session Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? "Edit Live Session" : "Create Live Session"}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? "Update the live session details" : "Set up a new live session for this module"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="classId">Class *</Label>
                <Select
                  value={liveSessionForm.classId}
                  onValueChange={(value) => setLiveSessionForm({ ...liveSessionForm, classId: value })}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && (
                  <p className="text-xs text-muted-foreground mt-1">Class cannot be changed when editing</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={liveSessionForm.title}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, title: e.target.value })}
                    placeholder="Live Session Title"
                  />
                </div>
                <div>
                  <Label htmlFor="instructorName">Instructor</Label>
                  <Input
                    id="instructorName"
                    value={liveSessionForm.instructorName}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, instructorName: e.target.value })}
                    placeholder="Instructor Name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={liveSessionForm.description}
                  onChange={(e) => setLiveSessionForm({ ...liveSessionForm, description: e.target.value })}
                  placeholder="Session description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startsAt">Start Date & Time</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={liveSessionForm.startsAt}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, startsAt: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={liveSessionForm.durationMinutes}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, durationMinutes: parseInt(e.target.value) })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="meetingUrl">Meeting URL</Label>
                <Input
                  id="meetingUrl"
                  value={liveSessionForm.meetingUrl}
                  onChange={(e) => setLiveSessionForm({ ...liveSessionForm, meetingUrl: e.target.value })}
                  placeholder="https://zoom.us/j/123456789"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="meetingPassword">Meeting Password</Label>
                  <Input
                    id="meetingPassword"
                    value={liveSessionForm.meetingPassword}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, meetingPassword: e.target.value })}
                    placeholder="Password (optional)"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={liveSessionForm.location}
                    onChange={(e) => setLiveSessionForm({ ...liveSessionForm, location: e.target.value })}
                    placeholder="Physical location (optional)"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLiveSession}>
                {isEditing ? "Update Session" : "Create Session"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}


