"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Plus, Search, BookOpen, ArrowLeft, Edit, MoreVertical, LogOut, ExternalLink, Key, Copy, Trash2, MessageSquare, Video } from "lucide-react"
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

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
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

export default function CourseModulesPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [course, setCourse] = useState<Course | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateModule, setShowCreateModule] = useState(false)
  const [showEditModule, setShowEditModule] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showAccessCodes, setShowAccessCodes] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [accessCodes, setAccessCodes] = useState<any[]>([])
  const [newModule, setNewModule] = useState({
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 0
  })
  
  const [editModule, setEditModule] = useState({
    id: "",
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 0
  })
  
  const { toast } = useToast()

  // Load course details
  const loadCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`)
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
      }
    } catch (error) {
      console.error("Error loading course:", error)
    }
  }, [courseId])

  // Load modules for the course
  const loadModules = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`)
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (error) {
      console.error("Error loading modules:", error)
    }
  }, [courseId])

  useEffect(() => {
    if (courseId) {
      loadCourse()
      loadModules()
      setIsLoading(false)
    }
  }, [courseId, loadCourse, loadModules])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close any open dropdowns
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredModules = useMemo(() => modules.filter(
    module => module.title.toLowerCase().includes(searchTerm.toLowerCase())
  ), [modules, searchTerm])

  const formatDuration = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }, [])

  const handleCreateModule = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newModule)
      })
      
      if (res.ok) {
        setNewModule({
          title: "",
          description: "",
          videoUrl: "",
          durationSeconds: 0,
          orderIndex: 0
        })
        setShowCreateModule(false)
        loadModules()
        toast({
          title: "Success",
          description: "Module created successfully",
        })
      }
    } catch (error) {
      console.error("Error creating module:", error)
    }
  }

  const handleEditModule = (module: Module) => {
    setEditModule({
      id: module.id,
      title: module.title,
      description: module.description,
      videoUrl: module.videoUrl || "",
      durationSeconds: module.durationSeconds,
      orderIndex: module.orderIndex
    })
    setShowEditModule(true)
  }

  const handleUpdateModule = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${editModule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editModule)
      })
      
      if (res.ok) {
        setShowEditModule(false)
        loadModules()
        toast({
          title: "Success",
          description: "Module updated successfully",
        })
      }
    } catch (error) {
      console.error("Error updating module:", error)
    }
  }

  const handleDeleteModule = (moduleId: string) => {
    setModuleToDelete(moduleId)
    setShowDeleteDialog(true)
  }

  const handleAccessCodes = (module: Module) => {
    setSelectedModule(module)
    loadAccessCodes(module.id)
    setShowAccessCodes(true)
  }

  const loadAccessCodes = async (moduleId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleId}/access-codes`)
      if (res.ok) {
        const data = await res.json()
        setAccessCodes(data)
      }
    } catch (error) {
      console.error("Error loading access codes:", error)
    }
  }

  const handleGenerateCodes = async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${selectedModule?.id}/access-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: 5 })
      })
      
      if (res.ok) {
        loadAccessCodes(selectedModule?.id || "")
        toast({
          title: "Success",
          description: "Access codes generated successfully",
        })
      }
    } catch (error) {
      console.error("Error generating codes:", error)
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${selectedModule?.id}/access-codes/${codeId}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        loadAccessCodes(selectedModule?.id || "")
        toast({
          title: "Success",
          description: "Access code deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting code:", error)
    }
  }

  const confirmDelete = async () => {
    if (!moduleToDelete) return
    
    try {
      const res = await fetch(`/api/courses/${courseId}/modules/${moduleToDelete}`, {
        method: "DELETE"
      })
      
      if (res.ok) {
        setShowDeleteDialog(false)
        setModuleToDelete(null)
        loadModules()
        toast({
          title: "Success",
          description: "Module deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting module:", error)
    }
    
    setShowDeleteDialog(false)
  }

  const handleSignOut = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      })
      if (res.ok) {
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Sign out error:", error)
      window.location.href = "/"
    }
  }

  if (isLoading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading modules...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  if (!course) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
            <Button onClick={() => router.push("/admin")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
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
        <header className="border-b bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:h-20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                onClick={() => router.push("/admin")}
                size="sm"
                className="flex items-center gap-2 -ml-2 sm:ml-0 text-sm"
              >
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Back to Admin
              </Button>
              <div className="w-full sm:w-auto">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold">{course.title}</h1>
                <p className="text-muted-foreground text-xs sm:text-sm">Manage course modules</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <Button onClick={handleSignOut} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Course Info */}
          <Card className="mb-6 sm:mb-8">
            <CardHeader className="px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl">{course.title}</CardTitle>
                  <CardDescription className="mt-1.5 sm:mt-2 text-xs sm:text-sm">{course.description}</CardDescription>
                </div>
                <Badge variant={course.isPublished ? "default" : "secondary"} className="text-xs sm:text-sm w-fit">
                  {course.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Modules Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-semibold">Modules</h2>
                <p className="text-muted-foreground text-xs sm:text-sm">Manage your course modules</p>
              </div>
              <Button onClick={() => setShowCreateModule(true)} size="sm" className="w-full sm:w-auto text-sm sm:text-base">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search modules..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-3 sm:space-y-4">
              {filteredModules.map((module) => (
                <Card key={module.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="px-4 sm:px-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-start sm:items-center space-x-3 sm:space-x-4 flex-1 w-full">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg">{module.title}</CardTitle>
                          <CardDescription className="mt-1 text-xs sm:text-sm line-clamp-2">
                            {module.description}
                          </CardDescription>
                          <div className="flex items-center space-x-3 sm:space-x-4 mt-2 text-xs sm:text-sm text-muted-foreground flex-wrap gap-y-1">
                            <span className="flex items-center">
                              <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              {formatDuration(module.durationSeconds)}
                            </span>
                            <span className="flex items-center">
                              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                              Module {module.orderIndex + 1}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAccessCodes(module)}
                          className="text-xs sm:text-sm flex-1 sm:flex-initial"
                        >
                          <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden xs:inline">Access Codes</span>
                          <span className="xs:hidden">Codes</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditModule(module)}
                          className="text-xs sm:text-sm"
                        >
                          <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteModule(module.id)}
                          className="text-xs sm:text-sm"
                        >
                          <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Create Module Dialog */}
        <Dialog open={showCreateModule} onOpenChange={setShowCreateModule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Module</DialogTitle>
              <DialogDescription>
                Add a new module to your course
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  placeholder="Module title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  placeholder="Module description"
                />
              </div>
              <div>
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input
                  id="videoUrl"
                  value={newModule.videoUrl}
                  onChange={(e) => setNewModule({ ...newModule, videoUrl: e.target.value })}
                  placeholder="Video URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newModule.durationSeconds}
                    onChange={(e) => setNewModule({ ...newModule, durationSeconds: parseInt(e.target.value) || 0 })}
                    placeholder="Duration in seconds"
                  />
                </div>
                <div>
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={newModule.orderIndex}
                    onChange={(e) => setNewModule({ ...newModule, orderIndex: parseInt(e.target.value) || 0 })}
                    placeholder="Order index"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateModule(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateModule}>
                Create Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={showEditModule} onOpenChange={setShowEditModule}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>
                Update module information
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editModule.title}
                  onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
                  placeholder="Module title"
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editModule.description}
                  onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
                  placeholder="Module description"
                />
              </div>
              <div>
                <Label htmlFor="edit-videoUrl">Video URL</Label>
                <Input
                  id="edit-videoUrl"
                  value={editModule.videoUrl}
                  onChange={(e) => setEditModule({ ...editModule, videoUrl: e.target.value })}
                  placeholder="Video URL"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-duration">Duration (seconds)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editModule.durationSeconds}
                    onChange={(e) => setEditModule({ ...editModule, durationSeconds: parseInt(e.target.value) || 0 })}
                    placeholder="Duration in seconds"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-orderIndex">Order Index</Label>
                  <Input
                    id="edit-orderIndex"
                    type="number"
                    value={editModule.orderIndex}
                    onChange={(e) => setEditModule({ ...editModule, orderIndex: parseInt(e.target.value) || 0 })}
                    placeholder="Order index"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditModule(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateModule}>
                Update Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Module</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this module? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Access Codes Dialog */}
        <Dialog open={showAccessCodes} onOpenChange={setShowAccessCodes}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Access Codes for {selectedModule?.title}</DialogTitle>
              <DialogDescription>
                Manage access codes for this module
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Access Codes</h3>
                <Button onClick={handleGenerateCodes}>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Codes
                </Button>
              </div>
              <div className="space-y-2">
                {accessCodes.map((code) => (
                  <div key={code.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span className="font-mono">{code.code}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigator.clipboard.writeText(code.code)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAccessCodes(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}