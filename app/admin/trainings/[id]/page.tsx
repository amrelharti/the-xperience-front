"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import NextImage from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Trash2, Save, Calendar, BookOpen, GraduationCap } from "lucide-react"
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
import ImageUpload from "@/components/ui/image-upload"

interface Training {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function TrainingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string
  const { toast } = useToast()

  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [modulesCount, setModulesCount] = useState(0)

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    isPublished: false
  })

  useEffect(() => {
    loadTraining()
    loadModulesCount()
  }, [trainingId])

  const loadTraining = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/courses/${trainingId}`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setTraining(data)
        setEditForm({
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl || "",
          isPublished: data.isPublished
        })
      }
    } catch (error) {
      console.error("Error loading training:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadModulesCount = async () => {
    try {
      const res = await fetch(`/api/admin/courses/${trainingId}/training-modules`, {
        credentials: "include"
      })
      if (res.ok) {
        const modules = await res.json()
        setModulesCount(modules.length)
      }
    } catch (error) {
      console.error("Error loading modules count:", error)
    }
  }

  const handleUpdateTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`/api/admin/courses/${trainingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Training updated successfully"
        })
        setShowEditDialog(false)
        loadTraining()
      } else {
        toast({
          title: "Error",
          description: "Failed to update training",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating training:", error)
      toast({
        title: "Error",
        description: "Failed to update training",
        variant: "destructive"
      })
    }
  }

  const handleDeleteTraining = async () => {
    // First check if there are modules
    if (modulesCount > 0) {
      const confirmMessage = `This training has ${modulesCount} module(s). Do you want to delete the training and all its modules?\n\nThis action cannot be undone.`
      if (!confirm(confirmMessage)) return
    } else {
      if (!confirm("Are you sure you want to delete this training? This action cannot be undone.")) return
    }

    try {
      console.log("🗑️ Deleting training:", trainingId)
      
      const res = await fetch(`/api/admin/courses/${trainingId}`, {
        method: "DELETE",
        credentials: "include"
      })

      console.log("Delete response status:", res.status)

      if (res.ok) {
        toast({
          title: "Success",
          description: "Training deleted successfully"
        })
        
        // Wait a moment for the toast to show, then redirect
        setTimeout(() => {
          console.log("Redirecting to /admin/trainings")
          router.push("/admin/trainings")
        }, 500)
      } else {
        const error = await res.json()
        console.error("Delete failed:", error)
        
        // Provide more helpful error message
        let errorMessage = error.error || "Failed to delete training"
        
        // Check for common backend issues
        if (errorMessage.includes("foreign key") || errorMessage.includes("constraint")) {
          errorMessage = "Cannot delete training because it has associated modules or data. Please delete all modules first."
        } else if (errorMessage === "" || errorMessage.includes("Bad Request")) {
          errorMessage = "Cannot delete training. It may have associated modules or courses. Please delete them first."
        }
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting training:", error)
      toast({
        title: "Error",
        description: "Failed to delete training. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading training...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  if (!training) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Training Not Found</h2>
            <Button asChild>
              <Link href="/admin/trainings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
            </Button>
          </div>
        </div>
      </RequireAdmin>
    )
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
                <h1 className="text-4xl font-bold mb-2">{training.title}</h1>
                <Badge variant={training.isPublished ? "default" : "secondary"}>
                  {training.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(true)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Training
                </Button>
                <Button variant="destructive" onClick={handleDeleteTraining}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Training Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Training Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {training.thumbnailUrl && (
                    <div className="relative h-64 w-full rounded-lg overflow-hidden">
                      <NextImage
                        src={training.thumbnailUrl}
                        alt={training.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 66vw"
                      />
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Description</Label>
                    <p className="mt-2">{training.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Created</Label>
                      <p className="mt-1">{new Date(training.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Updated</Label>
                      <p className="mt-1">{new Date(training.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Modules</span>
                    </div>
                    <span className="font-semibold">{modulesCount}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Modules */}
              <Card>
                <CardHeader>
                  <CardTitle>Curriculum Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href={`/admin/trainings/${trainingId}/modules`}>
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Manage Modules
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Create and organize training modules (weeks)
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Edit Training Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-2xl">
              <form onSubmit={handleUpdateTraining}>
                <DialogHeader>
                  <DialogTitle>Edit Training</DialogTitle>
                  <DialogDescription>
                    Update training information
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="edit-title">Title *</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Description *</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      required
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-thumbnail">Thumbnail</Label>
                    <ImageUpload
                      value={editForm.thumbnailUrl}
                      onChange={(url) => setEditForm({ ...editForm, thumbnailUrl: url })}
                      id="edit-thumbnail"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-published"
                      checked={editForm.isPublished}
                      onChange={(e) => setEditForm({ ...editForm, isPublished: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="edit-published">Published (visible to students)</Label>
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
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

