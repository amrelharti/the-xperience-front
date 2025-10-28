"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, BookOpen, Key, Copy, Video, Menu, X, Calendar, Users, GraduationCap } from "lucide-react"
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
import NextImage from "next/image"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"

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
  thumbnailUrl?: string
  createdAt: string
  updatedAt: string
}

export default function TrainingModulesPage() {
  const params = useParams()
  const router = useRouter()
  const trainingId = params.id as string
  const { toast } = useToast()
  const { user } = useUser()

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    orderIndex: 0,
    thumbnailUrl: ""
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
        setFormData({ title: "", description: "", orderIndex: 0, thumbnailUrl: "" })
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
          thumbnailUrl: ""
        })
    setShowCreateDialog(true)
  }

  const openEditDialog = (module: TrainingModule) => {
    setSelectedModule(module)
    setFormData({
      title: module.title,
      description: module.description,
      orderIndex: module.orderIndex,
      thumbnailUrl: module.thumbnailUrl || ""
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
              <Link href={`/admin/trainings/${trainingId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Link>
            </Button>

          {/* Page Header */}
          <div className="text-center space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              Module Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                  Manage Training Modules
                </h1>
                {training && (
              <p className="text-lg text-slate-600">
                Training: <span className="font-semibold text-[#005eb8]">{training.title}</span>
                  </p>
                )}
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Modules are the curriculum content shared by all classes in this training
                </p>
              </div>

          {/* Action Button */}
          <div className="flex items-center justify-center animate-slide-up">
            <Button 
              onClick={openCreateDialog}
              className="h-12 px-8 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
            >
              <Plus className="h-5 w-5 mr-2" />
                Create Module
              </Button>
          </div>

          {/* Modules List */}
          {loading ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-16">
                <div className="space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005eb8] mx-auto"></div>
                  <p className="text-slate-600 text-lg">Loading modules...</p>
            </div>
              </CardContent>
            </Card>
          ) : modules.length === 0 ? (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-16">
                <div className="space-y-6">
                  <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-slate-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-800">No modules yet</h3>
                    <p className="text-slate-600 max-w-md mx-auto">
                  Create your first module to define the training curriculum
                </p>
                  </div>
                  <Button 
                    onClick={openCreateDialog}
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                  Create First Module
                </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((module, index) => (
                  <Card 
                    key={module.id} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          {/* Module Thumbnail */}
                          <div className="relative h-24 w-24 rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-[#005eb8]/30 transition-colors duration-200">
                            {module.thumbnailUrl ? (
                              <NextImage
                                src={module.thumbnailUrl}
                                alt={module.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="96px"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#005eb8]/20 to-[#0476D7]/10 group-hover:from-[#005eb8]/30 group-hover:to-[#0476D7]/20 transition-all duration-300">
                                <GraduationCap className="h-10 w-10 text-[#005eb8]/50 group-hover:text-[#005eb8]/70 transition-colors duration-300" />
                            </div>
                          )}
                          </div>
                          
                          <div className="flex-1">
                            <CardTitle className="text-xl font-bold text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200 mb-2">
                              {module.title}
                            </CardTitle>
                            <p className="text-slate-600 leading-relaxed mb-4">
                              {module.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2 text-slate-500">
                                <BookOpen className="h-4 w-4" />
                                <span className="font-medium">{module.coursesCount} courses</span>
                          </div>
                              <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="h-4 w-4" />
                                <span>Order: {module.orderIndex}</span>
                        </div>
                              <Badge variant={module.isActive ? "default" : "secondary"} className={`px-3 py-1 text-xs font-semibold ${
                                module.isActive 
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                  : "bg-amber-500 hover:bg-amber-600 text-white"
                              }`}>
                                {module.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCodesDialog(module)}
                            title="Manage Access Codes"
                            className="hover:bg-[#FFBC00]/10 hover:border-[#FFBC00] hover:text-[#FFBC00] transition-all duration-200"
                          >
                            <Key className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                            className="hover:bg-[#005eb8]/10 hover:border-[#005eb8] hover:text-[#005eb8] transition-all duration-200"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200"
                            onClick={() => router.push(`/admin/trainings/${trainingId}/modules/${module.id}`)}
                          >
                            <Video className="h-4 w-4 mr-2" />
                            Live Session Management
                          </Button>
                          <Button asChild size="sm" className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5">
                            <Link href={`/admin/training-modules/${module.id}/courses`}>
                              <BookOpen className="h-4 w-4 mr-2" />
                              Manage Courses
                            </Link>
                          </Button>
                        </div>
                        <div className="text-xs text-slate-400">
                          Created {new Date(module.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}

          {/* Create Module Dialog */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <form onSubmit={handleCreateModule}>
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Create New Module
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-lg">
                    Add a new module/week to this training's curriculum
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-700 font-semibold text-base">Module Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Module 1: Introduction to Programming"
                      className="mt-2 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 font-semibold text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Module description..."
                      className="mt-2 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="orderIndex" className="text-slate-700 font-semibold text-base">Order *</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                      className="mt-2 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      required
                    />
                  </div>

                  <ImageUpload
                    value={formData.thumbnailUrl}
                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                    label="Module Thumbnail"
                    placeholder="Enter image URL or upload a file"
                    description="Upload a thumbnail image for your module (recommended: 800×450px)"
                  />
                </div>

                <DialogFooter className="pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateDialog(false)}
                    className="hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Module
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Module Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <form onSubmit={handleUpdateModule}>
                <DialogHeader className="pb-6">
                  <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-lg">
                      <Edit className="h-5 w-5 text-white" />
                    </div>
                    Edit Module
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-lg">
                    Update module details
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div>
                    <Label htmlFor="edit-title" className="text-slate-700 font-semibold text-base">Module Title *</Label>
                    <Input
                      id="edit-title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="mt-2 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description" className="text-slate-700 font-semibold text-base">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-2 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-orderIndex" className="text-slate-700 font-semibold text-base">Order *</Label>
                    <Input
                      id="edit-orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                      className="mt-2 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      required
                    />
                  </div>

                  <ImageUpload
                    value={formData.thumbnailUrl}
                    onChange={(url) => setFormData({ ...formData, thumbnailUrl: url })}
                    label="Module Thumbnail"
                    placeholder="Enter image URL or upload a file"
                    description="Upload a thumbnail image for your module (recommended: 800×450px)"
                  />
                </div>

                <DialogFooter className="pt-6">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowEditDialog(false)}
                    className="hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#FFBC00] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#FFBC00] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <Edit className="h-5 w-5 mr-2" />
                    Update Module
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Access Codes Dialog */}
          <Dialog open={showCodesDialog} onOpenChange={setShowCodesDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <DialogHeader className="pb-6">
                <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  Module Access Codes
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-lg">
                  Generate and manage access codes for <span className="font-semibold text-[#005eb8]">{selectedModule?.title}</span>. 
                  Students will use these codes to unlock this module.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Generate New Codes */}
                <Card className="border-0 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                        <Plus className="h-4 w-4 text-white" />
                      </div>
                      Generate New Codes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="codeCount" className="text-slate-700 font-semibold">Number of codes to generate</Label>
                      <Input
                        id="codeCount"
                        type="number"
                        min="1"
                        max="100"
                        value={codeCount}
                        onChange={(e) => setCodeCount(parseInt(e.target.value))}
                        className="mt-2 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                      />
                    </div>
                    <Button 
                      onClick={handleGenerateCodes} 
                      className="w-full h-12 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                    >
                      <Key className="h-5 w-5 mr-2" />
                      Generate Codes
                    </Button>
                  </CardContent>
                </Card>

                {/* Newly Generated Codes */}
                {generatedCodes.length > 0 && (
                  <Card className="border-0 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm shadow-lg border-emerald-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-emerald-700 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                          <Key className="h-4 w-4 text-white" />
                        </div>
                        Newly Generated Codes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {generatedCodes.map((code, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-emerald-200 shadow-sm">
                            <code className="font-mono font-bold text-emerald-700 text-lg">{code}</code>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(code)}
                              className="hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200"
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
                <Card className="border-0 bg-gradient-to-r from-slate-50/80 to-blue-50/80 backdrop-blur-sm shadow-lg">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-gradient-to-br from-slate-500 to-slate-600 rounded-lg">
                        <Key className="h-4 w-4 text-white" />
                      </div>
                      Existing Access Codes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingCodes ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#005eb8] mx-auto mb-4"></div>
                        <p className="text-slate-600">Loading codes...</p>
                      </div>
                    ) : moduleAccessCodes.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mb-4">
                          <Key className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600">No access codes generated yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {moduleAccessCodes.map((codeObj: any) => (
                          <div key={codeObj.id} className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-slate-200 shadow-sm">
                            <div className="flex-1">
                              <code className="font-mono font-bold text-slate-800 text-lg">{codeObj.code}</code>
                              <p className="text-sm text-slate-500 mt-1">
                                {codeObj.isUsed ? (
                                  <span className="text-emerald-600 font-semibold">✓ Used by {codeObj.usedBy?.name || "a student"}</span>
                                ) : (
                                  <span className="text-amber-600 font-semibold">Not used yet</span>
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(codeObj.code)}
                                className="hover:bg-slate-50 hover:border-slate-300 hover:text-slate-700 transition-all duration-200"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteCode(codeObj.id)}
                                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
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

              <DialogFooter className="pt-6">
                <Button 
                  variant="outline" 
                  onClick={() => {
                  setShowCodesDialog(false)
                  setGeneratedCodes([])
                  }}
                  className="hover:bg-slate-100"
                >
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
