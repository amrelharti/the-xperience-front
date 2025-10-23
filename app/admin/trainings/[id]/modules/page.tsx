"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Key, Copy, Video } from "lucide-react"
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

interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
}

interface TrainingModule {
  id: string
  trainingId: string
  title: string
  description: string
  orderIndex: number
  isActive: boolean
  coursesCount: number
  createdAt: string
  updatedAt: string
}

export default function TrainingModulesPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string
  const { toast } = useToast()

  const [training, setTraining] = useState<Training | null>(null)
  const [modules, setModules] = useState<TrainingModule[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showCodesDialog, setShowCodesDialog] = useState(false)
  const [selectedModule, setSelectedModule] = useState<TrainingModule | null>(null)
  const [moduleAccessCodes, setModuleAccessCodes] = useState<any[]>([])
  const [codeCount, setCodeCount] = useState(5)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [loadingCodes, setLoadingCodes] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderIndex: 0
  })

  useEffect(() => {
    loadTrainingData()
    loadModules()
  }, [trainingId])

  const loadTrainingData = async () => {
    try {
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

  const loadModules = async () => {
    try {
      setLoading(true)
      console.log("🔍 Loading training modules for training:", trainingId)
      
      const res = await fetch(`/api/admin/courses/${trainingId}/training-modules`, {
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
      
      const res = await fetch(`/api/admin/courses/${trainingId}/training-modules`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          trainingId: trainingId
        })
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
          orderIndex: modules.length + 1
        })
    setShowCreateDialog(true)
  }

  const openEditDialog = (module: TrainingModule) => {
    setSelectedModule(module)
    setFormData({
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex
    })
    setShowEditDialog(true)
  }

  const openCodesDialog = async (module: TrainingModule) => {
    setSelectedModule(module)
    setShowCodesDialog(true)
    await loadAccessCodes(module.id)
  }

  const loadAccessCodes = async (moduleId: string) => {
    try {
      setLoadingCodes(true)
      const res = await fetch(`/api/admin/training-modules/${moduleId}/access-codes`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        setModuleAccessCodes(data)
      }
    } catch (error) {
      console.error("Error loading access codes:", error)
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleGenerateCodes = async () => {
    if (!selectedModule) return
    
    try {
      const res = await fetch(`/api/admin/training-modules/${selectedModule.id}/access-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ count: codeCount })
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedCodes(data.codes || [])
        toast({
          title: "Access Codes Generated",
          description: `Generated ${data.codes?.length || 0} access codes`
        })
        await loadAccessCodes(selectedModule.id)
      } else {
        toast({
          title: "Error",
          description: "Failed to generate access codes",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error generating codes:", error)
      toast({
        title: "Error",
        description: "Failed to generate access codes",
        variant: "destructive"
      })
    }
  }

  const handleDeleteCode = async (codeId: string) => {
    if (!confirm("Are you sure you want to delete this access code?")) return

    try {
      const res = await fetch(`/api/admin/access-codes/${codeId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        toast({
          title: "Code Deleted",
          description: "Access code has been deleted"
        })
        if (selectedModule) {
          await loadAccessCodes(selectedModule.id)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to delete access code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting code:", error)
      toast({
        title: "Error",
        description: "Failed to delete access code",
        variant: "destructive"
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: "Access code copied to clipboard"
    })
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
                <h1 className="text-4xl font-bold mb-2">
                  Manage Training Modules
                </h1>
                {training && (
                  <p className="text-muted-foreground">
                    Training: {training.title}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Modules are the curriculum content shared by all classes in this training
                </p>
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
                  Create your first module to define the training curriculum
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
                            <CardTitle>Module {module.orderIndex}: {module.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {module.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCodesDialog(module)}
                            title="Manage Access Codes"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
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
                        <div className="ml-auto flex items-center gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            onClick={() => router.push(`/admin/trainings/${trainingId}/modules/${module.id}`)}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Live Session Management
                          </Button>
                          <Button asChild size="sm">
                            <Link href={`/admin/training-modules/${module.id}/courses`}>
                              <BookOpen className="h-4 w-4 mr-2" />
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
                    Add a new module/week to this training's curriculum
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="title">Module Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Module 1: Introduction to Programming"
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

          {/* Access Codes Dialog */}
          <Dialog open={showCodesDialog} onOpenChange={setShowCodesDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Module Access Codes</DialogTitle>
                <DialogDescription>
                  Generate and manage access codes for {selectedModule?.title}. 
                  Students will use these codes to unlock this module.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Generate New Codes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Generate New Codes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="codeCount">Number of codes to generate</Label>
                      <Input
                        id="codeCount"
                        type="number"
                        min="1"
                        max="100"
                        value={codeCount}
                        onChange={(e) => setCodeCount(parseInt(e.target.value))}
                        className="mt-1"
                      />
                    </div>
                    <Button onClick={handleGenerateCodes} className="w-full">
                      <Key className="h-4 w-4 mr-2" />
                      Generate Codes
                    </Button>
                  </CardContent>
                </Card>

                {/* Newly Generated Codes */}
                {generatedCodes.length > 0 && (
                  <Card className="border-green-200 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-base text-green-700">Newly Generated Codes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {generatedCodes.map((code, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                            <code className="font-mono font-semibold text-green-700">{code}</code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(code)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Existing Access Codes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Existing Access Codes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingCodes ? (
                      <p className="text-muted-foreground text-sm">Loading codes...</p>
                    ) : moduleAccessCodes.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No access codes generated yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {moduleAccessCodes.map((codeObj: any) => (
                          <div key={codeObj.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div className="flex-1">
                              <code className="font-mono font-semibold">{codeObj.code}</code>
                              <p className="text-xs text-muted-foreground mt-1">
                                {codeObj.isUsed ? (
                                  <span className="text-green-600">✓ Used by {codeObj.usedBy?.name || "a student"}</span>
                                ) : (
                                  <span>Not used yet</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(codeObj.code)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteCode(codeObj.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowCodesDialog(false)
                  setGeneratedCodes([])
                }}>
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </RequireAdmin>
  )
}
