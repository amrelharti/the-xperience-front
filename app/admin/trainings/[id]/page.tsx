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
import { ArrowLeft, Edit, Trash2, Save, Calendar, BookOpen, GraduationCap, Menu, X } from "lucide-react"
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
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"

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
  const { user } = useUser()

  const [training, setTraining] = useState<Training | null>(null)
  const [loading, setLoading] = useState(true)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [modulesCount, setModulesCount] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Modern Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-10 w-25"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
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
            <div className="flex items-center space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-6 py-4 space-y-3">
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

        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Back Button */}
          <Button variant="outline" asChild className="hover:bg-slate-100">
              <Link href="/admin/trainings">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Trainings
              </Link>
            </Button>

          {/* Page Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              Training Details
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              {training.title}
            </h1>
            <div className="flex items-center justify-center gap-4">
              <Badge variant={training.isPublished ? "default" : "secondary"} className={`px-4 py-2 text-sm font-semibold ${
                training.isPublished 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-amber-500 hover:bg-amber-600 text-white"
              }`}>
                  {training.isPublished ? "Published" : "Draft"}
                </Badge>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 animate-slide-up">
            <Button variant="outline" onClick={() => setShowEditDialog(true)} className="hover:bg-slate-100">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Training
                </Button>
            <Button variant="destructive" onClick={handleDeleteTraining} className="hover:bg-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Training Info */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    Training Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {training.thumbnailUrl && (
                    <div className="relative h-80 w-full rounded-xl overflow-hidden border-2 border-slate-200">
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
                    <Label className="text-slate-600 font-semibold">Description</Label>
                    <p className="mt-3 text-slate-700 text-lg leading-relaxed">{training.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-sm">
                    <div>
                      <Label className="text-slate-600 font-semibold">Created</Label>
                      <p className="mt-2 text-slate-700">{new Date(training.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-slate-600 font-semibold">Updated</Label>
                      <p className="mt-2 text-slate-700">{new Date(training.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-up">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-slate-500" />
                      <span className="text-slate-600 font-medium">Modules</span>
                    </div>
                    <span className="text-2xl font-bold text-[#005eb8]">{modulesCount}</span>
                  </div>
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#005eb8] to-[#0476D7] rounded-full w-3/4"></div>
                  </div>
                </CardContent>
              </Card>

              {/* Manage Modules */}
              <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-lg">
                      <GraduationCap className="h-5 w-5 text-white" />
                    </div>
                    Curriculum Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button asChild className="w-full h-12 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                    <Link href={`/admin/trainings/${trainingId}/modules`}>
                      <GraduationCap className="h-5 w-5 mr-2" />
                      Manage Modules
                    </Link>
                  </Button>
                  <p className="text-xs text-slate-500 text-center leading-relaxed">
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

