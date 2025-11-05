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
  const [activeCode, setActiveCode] = useState<{
    hasCode: boolean
    code?: string
    codeId?: string
    createdAt?: string
    generatedBy?: string
    usageCount?: number
    recentUsage?: Array<{userName: string, userEmail: string, usedAt: string}>
  } | null>(null)
  const [showGeneratedCode, setShowGeneratedCode] = useState(false)
  const [newlyGeneratedCode, setNewlyGeneratedCode] = useState("")
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
    setShowGeneratedCode(false)
    setNewlyGeneratedCode("")
    setShowCodesDialog(true)
    await loadActiveCode(module.id)
  }

  const loadActiveCode = async (moduleId: string) => {
    try {
      setLoadingCodes(true)
      const res = await fetch(`/api/admin/training-modules/${moduleId}/access-codes`, {
        credentials: "include"
      })
      
      if (res.ok) {
        const data = await res.json()
        console.log("🔍 Loaded active code data:", data)
        setActiveCode(data)
        // After successfully loading the active code, hide the "newly generated" section
        // so the persistent "Active Code" section is shown instead
        if (data?.hasCode) {
          setShowGeneratedCode(false)
        }
      }
    } catch (error) {
      console.error("Error loading active code:", error)
    } finally {
      setLoadingCodes(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!selectedModule) return
    
    try {
      const res = await fetch(`/api/admin/training-modules/${selectedModule.id}/access-codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ count: 1 })
      })

      if (res.ok) {
        const data = await res.json()
        console.log("🔍 Response data:", data)
        console.log("🔍 Code value:", data.code)
        
        if (data.code) {
          setNewlyGeneratedCode(data.code)
          setShowGeneratedCode(true)
        } else {
          console.error("❌ No code in response:", data)
          toast({
            title: "Error",
            description: "Generated code was not returned properly",
            variant: "destructive"
          })
          return
        }
        toast({
          title: "Access Code Generated",
          description: "New access code created successfully"
        })
        await loadActiveCode(selectedModule.id)
      } else {
        toast({
          title: "Error",
          description: "Failed to generate access code",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error generating code:", error)
      toast({
        title: "Error",
        description: "Failed to generate access code",
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
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/admin" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-8 sm:h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden lg:flex items-center space-x-4 xl:space-x-8">
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
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-slate-100 p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-4 sm:px-6 py-4 space-y-2 sm:space-y-3">
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

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Back Button */}
          <Button variant="outline" asChild size="sm" className="hover:bg-slate-100 text-sm sm:text-base -ml-2 sm:ml-0">
              <Link href={`/admin/trainings/${trainingId}`}>
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                Back to Training
              </Link>
            </Button>

          {/* Page Header */}
          <div className="text-center space-y-3 sm:space-y-4 animate-fade-in px-4">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-xs sm:text-sm font-medium">
              <GraduationCap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Module Management
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                  Manage Training Modules
                </h1>
                {training && (
              <p className="text-sm sm:text-base md:text-lg text-slate-600">
                Training: <span className="font-semibold text-[#005eb8]">{training.title}</span>
                  </p>
                )}
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
                  Modules are the curriculum content shared by all classes in this training
                </p>
              </div>

          {/* Action Button */}
          <div className="flex items-center justify-center animate-slide-up px-4">
            <Button 
              onClick={openCreateDialog}
              size="sm"
              className="h-10 sm:h-12 px-6 sm:px-8 bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
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
            <div className="grid gap-4 sm:gap-6">
              {modules
                .sort((a, b) => a.orderIndex - b.orderIndex)
                .map((module, index) => (
                  <Card 
                    key={module.id} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border-0 bg-white/80 backdrop-blur-sm animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full sm:flex-1">
                          {/* Module Thumbnail */}
                          <div className="relative h-20 w-20 sm:h-24 sm:w-24 rounded-lg sm:rounded-xl overflow-hidden border-2 border-slate-200 group-hover:border-[#005eb8]/30 transition-colors duration-200 flex-shrink-0">
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
                          
                          <div className="flex-1 w-full min-w-0">
                            <CardTitle className="text-base sm:text-lg md:text-xl font-bold text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200 mb-1.5 sm:mb-2">
                              {module.title}
                            </CardTitle>
                            <p className="text-slate-600 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base line-clamp-3">
                              {module.description}
                            </p>
                            <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-wrap">
                              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span className="font-medium">{module.coursesCount} courses</span>
                          </div>
                              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-500">
                                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                <span>Order: {module.orderIndex}</span>
                        </div>
                              <Badge variant={module.isActive ? "default" : "secondary"} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold ${
                                module.isActive 
                                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                                  : "bg-amber-500 hover:bg-amber-600 text-white"
                              }`}>
                                {module.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end sm:justify-start">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openCodesDialog(module)}
                            title="Manage Access Codes"
                            className="hover:bg-[#FFBC00]/10 hover:border-[#FFBC00] hover:text-[#FFBC00] transition-all duration-200"
                          >
                            <Key className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(module)}
                            className="hover:bg-[#005eb8]/10 hover:border-[#005eb8] hover:text-[#005eb8] transition-all duration-200"
                          >
                            <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteModule(module.id)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                          >
                            <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 px-4 sm:px-6">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 md:gap-4 flex-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200 text-blue-700 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 text-xs sm:text-sm w-full xs:w-auto"
                            onClick={() => router.push(`/admin/trainings/${trainingId}/modules/${module.id}`)}
                          >
                            <Video className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            <span className="hidden sm:inline">Live Session Management</span>
                            <span className="sm:hidden">Live Session</span>
                          </Button>
                          <Button asChild size="sm" className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 text-xs sm:text-sm w-full xs:w-auto">
                            <Link href={`/admin/training-modules/${module.id}/courses`}>
                              <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                              Manage Courses
                            </Link>
                          </Button>
                        </div>
                        <div className="text-xs text-slate-400 text-center sm:text-right">
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
            <DialogContent className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <form onSubmit={handleCreateModule}>
                <DialogHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
                    <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    Create New Module
                  </DialogTitle>
                  <DialogDescription className="text-slate-600 text-sm sm:text-base md:text-lg">
                    Add a new module/week to this training's curriculum
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 sm:space-y-6 py-3 sm:py-4 px-4 sm:px-6">
                  <div>
                    <Label htmlFor="title" className="text-slate-700 font-semibold text-sm sm:text-base">Module Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Module 1: Introduction"
                      className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 font-semibold text-sm sm:text-base">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Module description..."
                      className="mt-1.5 sm:mt-2 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl"
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="orderIndex" className="text-slate-700 font-semibold text-sm sm:text-base">Order *</Label>
                    <Input
                      id="orderIndex"
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) => setFormData({ ...formData, orderIndex: parseInt(e.target.value) })}
                      className="mt-1.5 sm:mt-2 h-10 sm:h-12 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl"
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

                <DialogFooter className="pt-4 sm:pt-6 px-4 sm:px-6 flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowCreateDialog(false)}
                    className="hover:bg-slate-100 w-full sm:w-auto text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Create Module
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Edit Module Dialog */}
          <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
            <DialogContent className="max-w-3xl mx-4 max-h-[90vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <form onSubmit={handleUpdateModule}>
                <DialogHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
                  <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
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

                <DialogFooter className="pt-4 sm:pt-6 px-4 sm:px-6 flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowEditDialog(false)}
                    className="hover:bg-slate-100 w-full sm:w-auto text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    size="sm"
                    className="bg-gradient-to-r from-[#FFBC00] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#FFBC00] text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto text-sm sm:text-base"
                  >
                    <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                    Update Module
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Access Codes Dialog */}
          <Dialog open={showCodesDialog} onOpenChange={setShowCodesDialog}>
            <DialogContent className="max-w-2xl mx-4 max-h-[80vh] overflow-y-auto border-0 bg-white/95 backdrop-blur-sm shadow-2xl">
              <DialogHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
                <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2 sm:gap-3">
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
                {/* Current Active Code */}
                {activeCode?.hasCode && !showGeneratedCode && (
                  <Card className="border-0 bg-gradient-to-r from-emerald-50/80 to-green-50/80 backdrop-blur-sm shadow-lg">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                          <Key className="h-4 w-4 text-white" />
                        </div>
                        Active Code
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Display the actual code */}
                      {activeCode.code && (
                        <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                          <code className="font-mono text-xl text-emerald-800 font-bold tracking-wider">{activeCode.code}</code>
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(activeCode.code!)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      )}
                      <div className="flex items-center justify-between p-3 bg-white/60 rounded-lg">
                        <div>
                          <p className="text-xs text-slate-600 mb-1">Created by {activeCode.generatedBy}</p>
                          <p className="text-xs text-slate-500">{new Date(activeCode.createdAt!).toLocaleString()}</p>
                        </div>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">
                          Active
                        </Badge>
                      </div>
                      <div className="pt-2 border-t border-emerald-200">
                        <p className="text-sm text-slate-600 mb-2">Usage: <span className="font-semibold text-emerald-700">{activeCode.usageCount} students</span></p>
                        {activeCode.recentUsage && activeCode.recentUsage.length > 0 && (
                          <div className="text-xs text-slate-600">
                            <p className="font-semibold mb-2">Recent Usage:</p>
                            <div className="space-y-1 max-h-32 overflow-y-auto bg-white/40 p-2 rounded">
                              {activeCode.recentUsage.slice(0, 5).map((usage, idx) => (
                                <div key={idx} className="text-xs">• {usage.userName} - {new Date(usage.usedAt).toLocaleString()}</div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Newly Generated Code */}
                {showGeneratedCode && newlyGeneratedCode && (
                  <Card className="border-0 bg-gradient-to-r from-emerald-100/80 to-green-100/80 backdrop-blur-sm shadow-lg animate-pulse">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg font-bold text-emerald-800 flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg">
                          <Key className="h-4 w-4 text-white" />
                        </div>
                        New Code Generated!
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-slate-700 font-semibold">Share this code with students:</p>
                      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                        <code className="font-mono text-xl text-emerald-800 font-bold tracking-wider">{newlyGeneratedCode}</code>
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(newlyGeneratedCode)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      <p className="text-xs text-emerald-700 font-semibold">✓ This code will remain active and visible until you generate a new one.</p>
                    </CardContent>
                  </Card>
                )}

                {/* No Code Yet */}
                {!activeCode?.hasCode && !showGeneratedCode && (
                  <Card className="border-0 bg-gradient-to-r from-slate-50/80 to-gray-50/80 backdrop-blur-sm shadow-lg">
                    <CardContent className="text-center py-12">
                      <Key className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                      <p className="text-slate-600">No access code generated yet</p>
                    </CardContent>
                  </Card>
                )}

                {/* Generate/Regenerate Button */}
                <Button 
                  onClick={handleGenerateCode} 
                  className="w-full bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold py-6"
                >
                  <Key className="h-5 w-5 mr-2" />
                  {activeCode?.hasCode ? "Regenerate Code" : "Generate Code"}
                </Button>
                {activeCode?.hasCode && (
                  <p className="text-xs text-amber-600 text-center">
                    ⚠️ Regenerating will deactivate the current code
                  </p>
                )}
              </div>

              <DialogFooter className="pt-4 sm:pt-6 px-4 sm:px-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowCodesDialog(false)}
                  className="hover:bg-slate-100 w-full sm:w-auto text-sm sm:text-base"
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
