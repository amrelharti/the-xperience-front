"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, 
  PlayCircle, 
  Calendar, 
  Clock, 
  Video, 
  Users, 
  Key, 
  Save,
  Edit,
  Trash2,
  ExternalLink
} from "lucide-react"
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
import { useUser } from "../../../../hooks/useUser"
import UserDropdown from "../../../../components/UserDropdown"

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
}

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  videoUrl?: string
  durationSeconds: number
  orderIndex: number
  createdAt: string
  updatedAt: string
}

interface LiveSession {
  id: string
  title: string
  startsAt: string
  durationMinutes: number
  instructorName: string
  meetingUrl: string
  meetingPassword?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminModuleDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const moduleId = params.moduleId as string
  const { toast } = useToast()
  const { user } = useUser()

  const [course, setCourse] = useState<Course | null>(null)
  const [module, setModule] = useState<Module | null>(null)
  const [liveSession, setLiveSession] = useState<LiveSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingLiveSession, setLoadingLiveSession] = useState(true)
  const [showLiveSessionDialog, setShowLiveSessionDialog] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const [liveSessionForm, setLiveSessionForm] = useState({
    title: "",
    startsAt: "",
    durationMinutes: 60,
    instructorName: "",
    meetingUrl: "",
    meetingPassword: ""
  })

  useEffect(() => {
    loadData()
  }, [courseId, moduleId])

  const loadData = async () => {
    await Promise.all([
      loadCourse(),
      loadModule(),
      loadLiveSession()
    ])
    setLoading(false)
  }

  const loadCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseId}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
      }
    } catch (error) {
      console.error("Error loading course:", error)
    }
  }

  const loadModule = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseId}/modules`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        const moduleData = data.find((m: Module) => m.id === moduleId)
        setModule(moduleData)
      }
    } catch (error) {
      console.error("Error loading module:", error)
    }
  }

  const loadLiveSession = async () => {
    try {
      setLoadingLiveSession(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setLiveSession(data)
        if (data) {
          setLiveSessionForm({
            title: data.title || "",
            startsAt: data.startsAt ? new Date(data.startsAt).toISOString().slice(0, 16) : "",
            durationMinutes: data.durationMinutes || 60,
            instructorName: data.instructorName || "",
            meetingUrl: data.meetingUrl || "",
            meetingPassword: data.meetingPassword || ""
          })
        }
      }
    } catch (error) {
      console.error("Error loading live session:", error)
    } finally {
      setLoadingLiveSession(false)
    }
  }

  const handleSaveLiveSession = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(liveSessionForm)
      })

      if (res.ok) {
        const data = await res.json()
        setLiveSession(data)
        setShowLiveSessionDialog(false)
        setIsEditing(false)
        toast({
          title: "Success",
          description: liveSession ? "Live session updated successfully" : "Live session created successfully",
        })
      } else {
        throw new Error("Failed to save live session")
      }
    } catch (error) {
      console.error("Error saving live session:", error)
      toast({
        title: "Error",
        description: "Failed to save live session",
        variant: "destructive",
      })
    }
  }

  const handleDeleteLiveSession = async () => {
    if (!confirm("Are you sure you want to delete this live session?")) {
      return
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/live-session`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        setLiveSession(null)
        setLiveSessionForm({
          title: "",
          startsAt: "",
          durationMinutes: 60,
          instructorName: "",
          meetingUrl: "",
          meetingPassword: ""
        })
        toast({
          title: "Success",
          description: "Live session deleted successfully",
        })
      } else {
        throw new Error("Failed to delete live session")
      }
    } catch (error) {
      console.error("Error deleting live session:", error)
      toast({
        title: "Error",
        description: "Failed to delete live session",
        variant: "destructive",
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading module details...</p>
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
              <Link href={`/admin/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
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
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href={`/admin/courses/${courseId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Course Modules
            </Link>
          </Button>

          {/* Module Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
                <PlayCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{module.title}</h1>
                <p className="text-muted-foreground">
                  {course?.title} • Module {module.orderIndex + 1}
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">{module.description}</p>
          </div>

          {/* Module Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Module Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="h-5 w-5" />
                  Module Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(module.durationSeconds)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order</Label>
                  <p className="text-sm text-muted-foreground">
                    Module {module.orderIndex + 1}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(module.createdAt)}
                  </p>
                </div>
                {module.videoUrl && (
                  <div>
                    <Label className="text-sm font-medium">Video URL</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground truncate">
                        {module.videoUrl}
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <a href={module.videoUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Live Session Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Live Session
                  </CardTitle>
                  <div className="flex gap-2">
                    {liveSession ? (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsEditing(true)
                            setShowLiveSessionDialog(true)
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleDeleteLiveSession}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => {
                          setIsEditing(false)
                          setShowLiveSessionDialog(true)
                        }}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Schedule Live Session
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loadingLiveSession ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading live session...</p>
                  </div>
                ) : liveSession ? (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Session Title</Label>
                      <p className="text-sm text-muted-foreground">{liveSession.title}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Scheduled Time</Label>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(liveSession.startsAt)}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Duration</Label>
                      <p className="text-sm text-muted-foreground">
                        {liveSession.durationMinutes} minutes
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Instructor</Label>
                      <p className="text-sm text-muted-foreground">{liveSession.instructorName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Meeting URL</Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-muted-foreground truncate">
                          {liveSession.meetingUrl}
                        </p>
                        <Button size="sm" variant="outline" asChild>
                          <a href={liveSession.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                    {liveSession.meetingPassword && (
                      <div>
                        <Label className="text-sm font-medium">Meeting Password</Label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-muted-foreground font-mono">
                            {liveSession.meetingPassword}
                          </p>
                          <Button size="sm" variant="outline">
                            <Key className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <div>
                      <Badge variant={liveSession.isActive ? "default" : "secondary"}>
                        {liveSession.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Live Session Scheduled</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule a live session for this module
                    </p>
                    <Button
                      onClick={() => {
                        setIsEditing(false)
                        setShowLiveSessionDialog(true)
                      }}
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Schedule Live Session
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Live Session Dialog */}
          <Dialog open={showLiveSessionDialog} onOpenChange={setShowLiveSessionDialog}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isEditing ? "Edit Live Session" : "Schedule Live Session"}
                </DialogTitle>
                <DialogDescription>
                  {isEditing 
                    ? "Update the live session details for this module."
                    : "Schedule a live session for this module. Students will be able to join and mark attendance."
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={liveSessionForm.title}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Week 1 Live Session"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Input
                    id="instructorName"
                    value={liveSessionForm.instructorName}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, instructorName: e.target.value }))}
                    placeholder="e.g., John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startsAt">Start Date & Time</Label>
                  <Input
                    id="startsAt"
                    type="datetime-local"
                    value={liveSessionForm.startsAt}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, startsAt: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={liveSessionForm.durationMinutes}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, durationMinutes: parseInt(e.target.value) || 60 }))}
                    min="15"
                    max="480"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meetingUrl">Meeting URL</Label>
                  <Input
                    id="meetingUrl"
                    value={liveSessionForm.meetingUrl}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, meetingUrl: e.target.value }))}
                    placeholder="https://zoom.us/j/123456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="meetingPassword">Meeting Password (Optional)</Label>
                  <Input
                    id="meetingPassword"
                    value={liveSessionForm.meetingPassword}
                    onChange={(e) => setLiveSessionForm(prev => ({ ...prev, meetingPassword: e.target.value }))}
                    placeholder="e.g., 123456"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowLiveSessionDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveLiveSession}>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? "Update Live Session" : "Schedule Live Session"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RequireAdmin>
  )
}


