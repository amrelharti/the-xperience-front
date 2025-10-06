"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Plus, Search, BookOpen, ArrowLeft, Edit, MoreVertical, LogOut, ExternalLink, Key, Copy, Trash2 } from "lucide-react"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [createModuleOpen, setCreateModuleOpen] = useState(false)
  const [editModuleOpen, setEditModuleOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [moduleToDelete, setModuleToDelete] = useState<string | null>(null)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [accessCodesOpen, setAccessCodesOpen] = useState(false)
  const [accessCodes, setAccessCodes] = useState<any[]>([])
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [generateCount, setGenerateCount] = useState(1)
  
  // Form state
  const [newModule, setNewModule] = useState({
    courseId: "",
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 0
  })
  
  const [editModule, setEditModule] = useState({
    title: "",
    description: "",
    videoUrl: "",
    durationSeconds: 0,
    orderIndex: 0
  })
  
  const { toast } = useToast()

  // Load course details
  const loadCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseId}`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setCourse(data)
      } else {
        console.error("Failed to load course")
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading course:", error)
      toast({
        title: "Error",
        description: "Failed to load course",
        variant: "destructive",
      })
    }
  }

  // Load modules for the course
  const loadModules = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseId}/modules`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      } else {
        console.error("Failed to load modules")
        toast({
          title: "Error",
          description: "Failed to load modules",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading modules:", error)
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourse()
      loadModules()
      setIsLoading(false)
    }
  }, [courseId])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[id^="module-menu-"]')) {
        // Close all dropdowns
        document.querySelectorAll('[id^="module-menu-"]').forEach(menu => {
          menu.classList.add('hidden')
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredModules = modules.filter(
    (module) =>
      module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      module.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateModule = async () => {
    try {
      const moduleData = {
        ...newModule,
        courseId: courseId
      }
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(moduleData),
      })
      
      if (res.ok) {
        toast({
          title: "Module Created",
          description: "The module has been successfully created",
        })
        setCreateModuleOpen(false)
        setNewModule({ courseId: "", title: "", description: "", videoUrl: "", durationSeconds: 0, orderIndex: 0 })
        loadModules()
      } else {
        const error = await res.text()
        console.error("Failed to create module:", error)
        toast({
          title: "Error",
          description: "Failed to create module",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating module:", error)
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive",
      })
    }
  }

  const handleEditModule = (module: Module) => {
    setSelectedModule(module)
    setEditModule({
      title: module.title,
      description: module.description,
      videoUrl: module.videoUrl || "",
      durationSeconds: module.durationSeconds,
      orderIndex: module.orderIndex
    })
    setEditModuleOpen(true)
  }

  const handleUpdateModule = async () => {
    if (!selectedModule) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${selectedModule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editModule),
      })
      
      if (res.ok) {
        toast({
          title: "Module Updated",
          description: "The module has been successfully updated",
        })
        setEditModuleOpen(false)
        setSelectedModule(null)
        loadModules()
      } else {
        const error = await res.text()
        console.error("Failed to update module:", error)
        toast({
          title: "Error",
          description: "Failed to update module",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating module:", error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive",
      })
    }
  }

  const handleDeleteModule = (moduleId: string) => {
    setModuleToDelete(moduleId)
    setDeleteDialogOpen(true)
  }

  const handleAccessCodes = (module: Module) => {
    setSelectedModule(module)
    loadAccessCodes(module.id)
    setAccessCodesOpen(true)
  }

  const loadAccessCodes = async (moduleId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleId}/codes`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        setAccessCodes(data)
      } else {
        console.error("Failed to load access codes")
      }
    } catch (error) {
      console.error("Error loading access codes:", error)
    }
  }

  const handleGenerateCodes = async () => {
    if (!selectedModule) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${selectedModule.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ count: generateCount }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setGeneratedCodes(data.codes)
        toast({
          title: "Access Codes Generated",
          description: `Generated ${data.codes.length} access codes`,
        })
        loadAccessCodes(selectedModule.id)
      } else {
        const error = await res.text()
        console.error("Failed to generate codes:", error)
        toast({
          title: "Error",
          description: "Failed to generate access codes",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating codes:", error)
      toast({
        title: "Error",
        description: "Failed to generate access codes",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/codes/${codeId}`, {
        method: "DELETE",
        credentials: "include",
      })
      
      if (res.ok) {
        toast({
          title: "Code Deleted",
          description: "Access code has been deleted",
        })
        if (selectedModule) {
          loadAccessCodes(selectedModule.id)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete access code",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting code:", error)
      toast({
        title: "Error",
        description: "Failed to delete access code",
        variant: "destructive",
      })
    }
  }

  const confirmDelete = async () => {
    if (moduleToDelete) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/modules/${moduleToDelete}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (res.ok) {
          toast({
            title: "Module Deleted",
            description: "The module has been successfully deleted",
          })
          loadModules()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete module",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting module:", error)
        toast({
          title: "Error",
          description: "Failed to delete module",
          variant: "destructive",
        })
      }
      setModuleToDelete(null)
    }
    
    setDeleteDialogOpen(false)
  }

  const handleSignOut = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      
      if (res.ok || res.status === 204) {
        window.location.href = "/"
      } else {
        console.error("Sign out failed:", res.status, res.statusText)
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Sign out error:", error)
      window.location.href = "/"
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
          <div className="container mx-auto px-4 h-20 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => router.push("/admin")}
                className="hover:bg-white/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Admin
              </Button>
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {course.title}
                </h1>
                <p className="text-sm text-muted-foreground">Manage course modules and videos</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleSignOut} className="hover:bg-red-50 hover:border-red-200">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Course Info Card */}
          <Card className="mb-8 border-l-4 border-l-blue-500">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <Badge variant={course.isPublished ? "default" : "secondary"}>
                      {course.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground mb-4">{course.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{modules.length} modules</span>
                  </div>
                </div>
                {course.thumbnailUrl && (
                  <div className="ml-6">
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={() => setCreateModuleOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          {/* Modules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((module) => (
              <Card key={module.id} className="hover:shadow-lg transition-shadow duration-200 group">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg line-clamp-2">{module.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      <div className="relative ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                          onClick={() => {
                            console.log("Dropdown trigger clicked for module:", module.id)
                            const menu = document.getElementById(`module-menu-${module.id}`)
                            if (menu) {
                              menu.classList.toggle('hidden')
                            }
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <div 
                          id={`module-menu-${module.id}`}
                          className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                        >
                            <div 
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100"
                              onClick={() => {
                                console.log("Edit Module clicked for module:", module.id)
                                handleEditModule(module)
                                document.getElementById(`module-menu-${module.id}`)?.classList.add('hidden')
                              }}
                            >
                              <Edit className="h-4 w-4 mr-3 text-blue-600" />
                              <span className="font-medium">Edit Module</span>
                            </div>
                            <div 
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100"
                              onClick={() => {
                                console.log("Access Codes clicked for module:", module.id)
                                handleAccessCodes(module)
                                document.getElementById(`module-menu-${module.id}`)?.classList.add('hidden')
                              }}
                            >
                              <Key className="h-4 w-4 mr-3 text-green-600" />
                              <span className="font-medium">Access Codes</span>
                            </div>
                          <div 
                            className="px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center text-red-600"
                            onClick={() => {
                              console.log("Delete Module clicked for module:", module.id)
                              handleDeleteModule(module.id)
                              document.getElementById(`module-menu-${module.id}`)?.classList.add('hidden')
                            }}
                          >
                            <div className="h-4 w-4 mr-3 rounded-full bg-red-100 flex items-center justify-center">
                              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                            </div>
                            <span className="font-medium">Delete Module</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center space-x-4">
                        <span>Duration: {formatDuration(module.durationSeconds)}</span>
                        <span>Order: {module.orderIndex}</span>
                      </div>
                      {module.videoUrl && (
                        <a 
                          href={module.videoUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline text-sm flex items-center"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Video
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No modules found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first module"}
              </p>
              <Button onClick={() => setCreateModuleOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          )}
        </div>

        {/* Create Module Dialog */}
        <Dialog open={createModuleOpen} onOpenChange={setCreateModuleOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Module & Video</DialogTitle>
              <DialogDescription>
                Add a new module with video content to "{course.title}".
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="moduleTitle">Module Title</Label>
                <Input
                  id="moduleTitle"
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  placeholder="e.g., Introduction to HTML, CSS Basics, JavaScript Fundamentals"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="moduleDescription">Module Description</Label>
                <Textarea
                  id="moduleDescription"
                  value={newModule.description}
                  onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                  placeholder="Describe what students will learn in this module..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="videoUrl">Video URL *</Label>
                <Input
                  id="videoUrl"
                  value={newModule.videoUrl}
                  onChange={(e) => setNewModule({ ...newModule, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct video file URL"
                />
                <p className="text-xs text-muted-foreground">
                  You can use YouTube, Vimeo, or direct video file URLs. Students will watch this video to complete the module.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="duration">Video Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={Math.floor(newModule.durationSeconds / 60)}
                    onChange={(e) => setNewModule({ ...newModule, durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">Enter duration in minutes</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="orderIndex">Module Order</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    value={newModule.orderIndex}
                    onChange={(e) => setNewModule({ ...newModule, orderIndex: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">Order in which this module appears (1, 2, 3...)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateModuleOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreateModule} 
                disabled={!newModule.title || !newModule.description || !newModule.videoUrl}
              >
                Add Module & Video
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Module Dialog */}
        <Dialog open={editModuleOpen} onOpenChange={setEditModuleOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Module</DialogTitle>
              <DialogDescription>
                Update the module information and video content.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editModuleTitle">Module Title</Label>
                <Input
                  id="editModuleTitle"
                  value={editModule.title}
                  onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
                  placeholder="e.g., Introduction to HTML, CSS Basics, JavaScript Fundamentals"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editModuleDescription">Module Description</Label>
                <Textarea
                  id="editModuleDescription"
                  value={editModule.description}
                  onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
                  placeholder="Describe what students will learn in this module..."
                  rows={3}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editVideoUrl">Video URL *</Label>
                <Input
                  id="editVideoUrl"
                  value={editModule.videoUrl}
                  onChange={(e) => setEditModule({ ...editModule, videoUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or https://vimeo.com/... or direct video file URL"
                />
                <p className="text-xs text-muted-foreground">
                  You can use YouTube, Vimeo, or direct video file URLs. Students will watch this video to complete the module.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="editDuration">Video Duration (minutes)</Label>
                  <Input
                    id="editDuration"
                    type="number"
                    value={Math.floor(editModule.durationSeconds / 60)}
                    onChange={(e) => setEditModule({ ...editModule, durationSeconds: (parseInt(e.target.value) || 0) * 60 })}
                    placeholder="30"
                  />
                  <p className="text-xs text-muted-foreground">Enter duration in minutes</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="editOrderIndex">Module Order</Label>
                  <Input
                    id="editOrderIndex"
                    type="number"
                    value={editModule.orderIndex}
                    onChange={(e) => setEditModule({ ...editModule, orderIndex: parseInt(e.target.value) || 0 })}
                    placeholder="1"
                  />
                  <p className="text-xs text-muted-foreground">Order in which this module appears (1, 2, 3...)</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditModuleOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateModule} 
                disabled={!editModule.title || !editModule.description || !editModule.videoUrl}
              >
                Update Module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Access Codes Dialog */}
        <Dialog open={accessCodesOpen} onOpenChange={setAccessCodesOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Access Codes for "{selectedModule?.title}"</DialogTitle>
              <DialogDescription>
                Generate and manage access codes for this module. Students will use these codes to unlock the module.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Generate New Codes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Label htmlFor="generateCount">Number of codes to generate</Label>
                    <Input
                      id="generateCount"
                      type="number"
                      min="1"
                      max="50"
                      value={generateCount}
                      onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                      className="mt-1"
                    />
                  </div>
                  <Button onClick={handleGenerateCodes} className="mt-6">
                    <Key className="h-4 w-4 mr-2" />
                    Generate Codes
                  </Button>
                </div>
              </div>

              {/* Generated Codes */}
              {generatedCodes.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-green-600">Newly Generated Codes:</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    {generatedCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded border p-2">
                        <code className="font-mono text-lg font-bold text-green-700">{code}</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(code)
                            toast({
                              title: "Copied!",
                              description: "Access code copied to clipboard",
                            })
                          }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Codes */}
              <div className="space-y-2">
                <h4 className="font-semibold">Existing Access Codes:</h4>
                {accessCodes.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No access codes generated yet.</p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {accessCodes.map((code) => (
                      <div key={code.id} className="flex items-center justify-between bg-gray-50 rounded border p-3">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 rounded-full ${code.used ? 'bg-red-500' : 'bg-green-500'}`}></div>
                          <div>
                            <div className="text-sm font-medium">
                              {code.used ? 'Used' : 'Available'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Created: {new Date(code.createdAt).toLocaleString()}
                              {code.consumedAt && (
                                <span> • Used: {new Date(code.consumedAt).toLocaleString()}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        {!code.used && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCode(code.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAccessCodesOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Module</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this module? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}