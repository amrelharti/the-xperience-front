"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, BookOpen } from "lucide-react"
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

interface Class {
  id: string
  name: string
  description: string
  module: {
    id: string
    title: string
  }
}

interface TrainingModule {
  id: string
  classId: string
  title: string
  description: string
  orderIndex: number
  hasAccessCode: boolean
  isActive: boolean
  coursesCount: number
  createdAt: string
  updatedAt: string
}

export default function ClassModulesPage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string
  const { toast } = useToast()

  const [classData, setClassData] = useState<Class | null>(null)
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderIndex: 0,
    accessCode: ""
  })

  useEffect(() => {
    loadClassData()
    loadModules()
  }, [classId])

  const loadClassData = async () => {
    try {
      const res = await fetch(`/api/admin/classes/${classId}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setClassData(data)
      }
    } catch (error) {
      console.error("Error loading class:", error)
    }
  }

  const loadModules = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading training modules for class:", classId)
      
      const res = await fetch(`/api/admin/classes/${classId}/training-modules`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log("✅ Loaded modules:", data)
        setModules(data)
      } else {
        const error = await res.text()
        console.error("❌ Failed to load modules:", error)
        toast({
          title: "Error",
          description: "Failed to load modules",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading modules:", error)
      toast({
        title: "Error",
        description: "Failed to load modules",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      console.log("🔥 Creating module:", formData)
      
      const res = await fetch(`/api/admin/classes/${classId}/training-modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        const newModule = await res.json()
        console.log("✅ Module created:", newModule)
        
        toast({
          title: "Success",
          description: "Module created successfully"
        })
        
        setShowCreateDialog(false)
        setFormData({ title: "", description: "", orderIndex: 0, accessCode: "" })
        loadModules()
      } else {
        const error = await res.text()
        console.error("❌ Failed to create module:", error)
        toast({
          title: "Error",
          description: "Failed to create module",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error creating module:", error)
      toast({
        title: "Error",
        description: "Failed to create module",
        variant: "destructive"
      })
    }
  }

  const handleUpdateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModule) return

    try {
      const res = await fetch(`/api/admin/training-modules/${selectedModule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Module updated successfully"
        })
        setShowEditDialog(false)
        setSelectedModule(null)
        loadModules()
      } else {
        toast({
          title: "Error",
          description: "Failed to update module",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating module:", error)
      toast({
        title: "Error",
        description: "Failed to update module",
        variant: "destructive"
      })
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm("Are you sure you want to delete this module?")) return

    try {
      const res = await fetch(`/api/admin/training-modules/${moduleId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Module deleted successfully"
        })
        loadModules()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete module",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting module:", error)
      toast({
        title: "Error",
        description: "Failed to delete module",
        variant: "destructive"
      })
    }
  }

  const openCreateDialog = () => {
    setFormData({
      title: "",
      description: "",
      orderIndex: modules.length + 1,
      accessCode: ""
    })
    setShowCreateDialog(true)
  }

  const openEditDialog = (module: TrainingModule) => {
    setSelectedModule(module)
    setFormData({
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      accessCode: ""
    })
    setShowEditDialog(true)
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/admin/classes">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Classes
              </Link>
            </Button>

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Manage Modules
                </h1>
                {classData && (
                  <p className="text-muted-foreground">
                    Class: {classData.name} | Training: {classData.module.title}
                  </p>
                )}
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Create Module
              </Button>
            </div>
          </div>

          {/* Modules List */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading modules...</p>
            </div>
          ) : modules.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No modules yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first module to get started
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Module
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((module) => (
                  <Card key={module.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary">
                              {module.orderIndex}
                            </span>
                          </div>
                          <div>
                            <CardTitle>{module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">{module.coursesCount}</span> courses
                        </div>
                        {module.hasAccessCode && (
                          <div className="text-green-600">
                            🔒 Access code required
                          </div>
                        )}
                        <div className="ml-auto">
                          <Button asChild size="sm">
                            <Link href={`/admin/training-modules/${module.id}/courses`}>
                              Manage Courses
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Create Module Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent>
              <form onSubmit={handleCreateModule}>
                <DialogHeader>
                  <DialogTitle>Create New Module</DialogTitle>
                  <DialogDescription>
                    Add a new module/week to this class
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Module Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Module 1: Introduction"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Module description..."
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

                  <div>
                    <Label htmlFor="accessCode">Access Code (optional)</Label>
                    <Input
                      id="accessCode"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      placeholder="e.g., MOD1-2025"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Students will need this code to unlock the module
                    </p>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Module</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Module Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent>
              <form onSubmit={handleUpdateModule}>
                <DialogHeader>
                  <DialogTitle>Edit Module</DialogTitle>
                  <DialogDescription>
                    Update module details
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-title">Module Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-orderIndex">Order *</Label>
                    <Input
                      id="edit-orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-accessCode">New Access Code (optional)</Label>
                    <Input
                      id="edit-accessCode"
                      value={formData.accessCode}
                      onChange={(e) => setFormData({ ...formData, accessCode: e.target.value })}
                      placeholder="Leave empty to keep current code"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Update Module</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RequireAdmin>
  )
}



