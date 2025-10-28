"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ArrowLeft, GraduationCap, Users, Calendar, Clock, Key, Copy, Menu, X } from "lucide-react"
import Navbar from "../../components/Navbar"
import UserDropdown from "../../components/UserDropdown"
import { useUser } from "../../hooks/useUser"

interface Class {
  id: string
  name: string
  description: string
  moduleId: string
  moduleName: string
  startDate: string
  endDate: string
  maxStudents: number
  currentStudents: number
  isActive: boolean
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

interface Module {
  id: string
  title: string
  description: string
}

export default function ClassManagementPage() {
  const { user } = useUser()
  const [classes, setClasses] = useState<Class[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newClass, setNewClass] = useState({
    name: "",
    description: "",
    moduleId: "",
    startDate: "",
    endDate: "",
    maxStudents: 30
  })
  const [showGenerateCodes, setShowGenerateCodes] = useState(false)
  const [selectedClassForCodes, setSelectedClassForCodes] = useState<Class | null>(null)
  const [generateCount, setGenerateCount] = useState(5)
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([])
  const [existingCodes, setExistingCodes] = useState<any[]>([])

  useEffect(() => {
    loadClasses()
    loadModules()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/classes", {
        credentials: "include"
      })
      if (res.ok) {
        const classesData = await res.json()
        setClasses(classesData)
      } else {
        console.error("❌ Failed to load classes:", res.status)
      }
    } catch (error) {
      console.error("❌ Error loading classes:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadModules = async () => {
    try {
      const res = await fetch("/api/admin/courses", {
        credentials: "include"
      })
      if (res.ok) {
        const modulesData = await res.json()
        setModules(modulesData)
      }
    } catch (error) {
      console.error("Error loading modules:", error)
    }
  }

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Validate that moduleId is selected
      if (!newClass.moduleId || newClass.moduleId.trim() === "") {
        alert("Please select a module")
        return
      }

      const classData = {
        ...newClass,
        moduleId: newClass.moduleId.trim()
      }


      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(classData)
      })
      
      
      if (res.ok) {
        setNewClass({ name: "", description: "", moduleId: "", startDate: "", endDate: "", maxStudents: 30 })
        setShowCreateClass(false)
        loadClasses()
        alert("Class created successfully!")
      } else {
        const errorData = await res.json()
        console.error("Error response:", errorData)
        alert(`Failed to create class: ${errorData.error || res.statusText}`)
      }
    } catch (error) {
      console.error("Error creating class:", error)
      alert("Error creating class")
    }
  }

  const handleDeleteClass = async (classId: string) => {
    if (!confirm("Are you sure you want to delete this class?")) return
    
    try {
      const res = await fetch(`/api/classes/${classId}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      if (res.ok) {
        loadClasses()
      } else {
        alert("Failed to delete class")
      }
    } catch (error) {
      console.error("Error deleting class:", error)
      alert("Error deleting class")
    }
  }

  const handleToggleClassStatus = async (classId: string, newIsActive: boolean, newIsArchived: boolean) => {
    try {
      let newState = "";
      
      if (newIsActive) {
        newState = "active";
      } else if (newIsArchived) {
        newState = "archived";
      } else {
        newState = "inactive";
      }
      
      
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: newIsActive, isArchived: newIsArchived })
      })
      
      
      if (res.ok) {
        const responseData = await res.json()
        loadClasses()
      } else {
        const errorData = await res.text()
        console.error("❌ Failed to update class status:", res.status, errorData)
        alert(`Failed to update class status: ${res.status} - ${errorData}`)
      }
    } catch (error) {
      console.error("❌ Error updating class:", error)
      alert(`Error updating class: ${error.message}`)
    }
  }

  const loadExistingCodes = async (classId: string) => {
    try {
      const res = await fetch(`/api/admin/classes/${classId}/codes`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setExistingCodes(data)
      }
    } catch (error) {
      console.error("Error loading existing codes:", error)
    }
  }

  const handleGenerateCodes = async () => {
    if (!selectedClassForCodes) return
    
    try {
      const res = await fetch(`/api/admin/classes/${selectedClassForCodes.id}/codes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ count: generateCount })
      })
      
      if (res.ok) {
        const data = await res.json()
        setGeneratedCodes(data.codes)
        loadExistingCodes(selectedClassForCodes.id)
        alert(`Generated ${data.codes.length} enrollment codes!`)
      } else {
        alert("Failed to generate codes")
      }
    } catch (error) {
      console.error("Error generating codes:", error)
      alert("Error generating codes")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Code copied to clipboard!")
  }

  const openCodeGeneration = (classItem: Class) => {
    setSelectedClassForCodes(classItem)
    setGeneratedCodes([])
    setShowGenerateCodes(true)
    loadExistingCodes(classItem.id)
  }

  const filteredClasses = useMemo(() => {
    const searchFiltered = classes.filter(classItem =>
      classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      classItem.moduleName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    // Separate classes by state
    const activeClasses = searchFiltered.filter(classItem => classItem.isActive && !classItem.isArchived)
    const archivedClasses = searchFiltered.filter(classItem => !classItem.isActive && classItem.isArchived)
    const inactiveClasses = searchFiltered.filter(classItem => !classItem.isActive && !classItem.isArchived)
    
    // Show active classes by default, include others if toggles are on
    let result = activeClasses
    if (showArchived) result = [...result, ...archivedClasses]
    if (showInactive) result = [...result, ...inactiveClasses]
    
    return result
  }, [classes, searchTerm, showInactive, showArchived])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading classes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
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
              <Link href="/admin/trainings" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Trainings
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/classes" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
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
                className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Trainings
              </Link>
              <Link 
                href="/admin/classes" 
                className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
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
        {/* Page Header */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
            <GraduationCap className="h-4 w-4" />
            Class Management
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
            Class Management
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Manage classes, enrollments, and student access codes
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 hover:bg-slate-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>
          <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
            <DialogTrigger asChild>
              <Button type="button" className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                <Plus className="h-5 w-5 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="border-0 bg-white/95 backdrop-blur-md shadow-2xl">
              <DialogHeader className="text-center space-y-3 pb-4">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-full flex items-center justify-center">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                  Create New Class
                </DialogTitle>
                <DialogDescription className="text-slate-600 text-sm">
                  Add a new class to the system
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Class Name</Label>
                  <Input
                    id="name"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    required
                    className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                    placeholder="e.g., Web Development Bootcamp 2024"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Description</Label>
                  <Textarea
                    id="description"
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    required
                    className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                    placeholder="Describe the class objectives and content..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="moduleId" className="text-sm font-semibold text-slate-700">Module</Label>
                  <select
                    id="moduleId"
                    value={newClass.moduleId}
                    onChange={(e) => setNewClass({ ...newClass, moduleId: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#005eb8]/20 focus:border-[#005eb8] transition-colors duration-200"
                    required
                  >
                    <option value="">Select a module</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-semibold text-slate-700">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newClass.startDate}
                      onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                      required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-semibold text-slate-700">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newClass.endDate}
                      onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                      required
                      className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStudents" className="text-sm font-semibold text-slate-700">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={newClass.maxStudents}
                    onChange={(e) => setNewClass({ ...newClass, maxStudents: parseInt(e.target.value) })}
                    min="1"
                    required
                    className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                    placeholder="30"
                  />
                </div>
                <DialogFooter className="gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateClass(false)}
                    className="hover:bg-slate-100"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-6"
                  >
                    Create Class
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 animate-slide-up">
          <Card className="lg:col-span-3 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                <Input
                  placeholder="Search classes by name, description, or module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#005eb8] mb-2">{filteredClasses.length}</div>
                <div className="text-sm text-slate-600 mb-4">
                  {(() => {
                    if (showArchived && showInactive) return 'All Classes'
                    if (showArchived) return 'Active + Archived'
                    if (showInactive) return 'Active + Inactive'
                    return 'Active Classes Only'
                  })()}
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={showArchived ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                    className={showArchived ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "hover:bg-slate-100"}
                  >
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </Button>
                  <Button
                    variant={showInactive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                    className={showInactive ? "bg-amber-500 hover:bg-amber-600 text-white" : "hover:bg-slate-100"}
                  >
                    {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              Classes ({filteredClasses.length})
            </CardTitle>
            <CardDescription className="text-slate-600">Manage classes and their enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClasses.map((classItem, index) => {
                return (
                <div 
                  key={classItem.id} 
                  className={`group flex items-center justify-between p-6 border-2 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1 animate-fade-in ${
                    classItem.isActive && !classItem.isArchived
                      ? 'hover:bg-slate-50 border-slate-200 hover:border-[#005eb8]/30' 
                      : !classItem.isActive && classItem.isArchived
                        ? 'bg-blue-50/50 border-blue-200 hover:border-blue-300'
                        : 'bg-slate-100/50 border-slate-300 hover:border-slate-400'
                  }`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-6">
                    <div className={`h-20 w-20 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 ${
                      classItem.isActive && !classItem.isArchived
                        ? 'bg-gradient-to-br from-[#005eb8] to-[#0476D7]' 
                        : !classItem.isActive && classItem.isArchived
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-slate-400 to-slate-500'
                    }`}>
                      <GraduationCap className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className={`text-lg font-bold mb-2 ${
                        classItem.isActive && !classItem.isArchived
                          ? 'text-slate-800 group-hover:text-[#005eb8]' 
                          : !classItem.isActive && classItem.isArchived
                            ? 'text-blue-800'
                            : 'text-slate-600'
                      } transition-colors duration-200`}>
                        {classItem.name}
                      </p>
                      <p className={`text-sm mb-3 leading-relaxed ${
                        classItem.isActive 
                          ? 'text-slate-600' 
                          : 'text-slate-500'
                      }`}>
                        {classItem.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <Badge variant={
                          classItem.isActive && !classItem.isArchived ? "default" : 
                          !classItem.isActive && classItem.isArchived ? "secondary" : 
                          "destructive"
                        } className={`px-3 py-1 text-xs font-semibold ${
                          classItem.isActive && !classItem.isArchived ? "bg-emerald-500 hover:bg-emerald-600 text-white" :
                          !classItem.isActive && classItem.isArchived ? "bg-blue-500 hover:bg-blue-600 text-white" :
                          "bg-red-500 hover:bg-red-600 text-white"
                        }`}>
                          {classItem.isActive && !classItem.isArchived ? "Active" : 
                           !classItem.isActive && classItem.isArchived ? "Archived" : 
                           "Inactive"}
                        </Badge>
                        <span className={`text-sm flex items-center gap-1 ${
                          classItem.isActive && !classItem.isArchived
                            ? 'text-slate-500' 
                            : 'text-slate-400'
                        }`}>
                          <Calendar className="h-4 w-4" />
                          {new Date(classItem.startDate).toLocaleDateString()} - {new Date(classItem.endDate).toLocaleDateString()}
                        </span>
                        <span className={`text-sm flex items-center gap-1 ${
                          classItem.isActive 
                            ? 'text-slate-500' 
                            : 'text-slate-400'
                        }`}>
                          <Users className="h-4 w-4" />
                          {classItem.currentStudents}/{classItem.maxStudents} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCodeGeneration(classItem)}
                      title="Generate enrollment codes"
                      disabled={!classItem.isActive}
                      className="hover:bg-[#FFBC00]/10 hover:border-[#FFBC00] hover:text-[#FFBC00] transition-all duration-200"
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={classItem.isActive ? "default" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, true, false)}
                        disabled={classItem.isActive}
                        className={classItem.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "hover:bg-slate-100"}
                      >
                        Active
                      </Button>
                      <Button
                        size="sm"
                        variant={classItem.isArchived ? "secondary" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, false, true)}
                        disabled={classItem.isArchived}
                        className={classItem.isArchived ? "bg-blue-500 hover:bg-blue-600 text-white" : "hover:bg-slate-100"}
                      >
                        Archived
                      </Button>
                      <Button
                        size="sm"
                        variant={!classItem.isActive && !classItem.isArchived ? "destructive" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, false, false)}
                        disabled={!classItem.isActive && !classItem.isArchived}
                        className={(!classItem.isActive && !classItem.isArchived) ? "bg-red-500 hover:bg-red-600 text-white" : "hover:bg-slate-100"}
                      >
                        Inactive
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/admin/classes/${classItem.id}`}
                      disabled={!classItem.isActive}
                      className="hover:bg-[#005eb8]/10 hover:border-[#005eb8] hover:text-[#005eb8] transition-all duration-200"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClass(classItem.id)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                )
              })}
              {filteredClasses.length === 0 && (
                <div className="text-center py-16">
                  <div className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">No classes found</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        Create your first class to get started with managing student enrollments
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Generation Dialog */}
        <Dialog open={showGenerateCodes} onOpenChange={setShowGenerateCodes}>
          <DialogContent className="max-w-2xl border-0 bg-white/95 backdrop-blur-md shadow-2xl">
            <DialogHeader className="text-center space-y-3 pb-4">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
                Generate Enrollment Codes
              </DialogTitle>
              <DialogDescription className="text-slate-600 text-sm">
                Generate enrollment codes for <span className="font-semibold text-[#005eb8]">{selectedClassForCodes?.name}</span>
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Generate New Codes */}
              <div className="space-y-3">
                <Label htmlFor="generateCount" className="text-sm font-semibold text-slate-700">Number of codes to generate</Label>
                <Input
                  id="generateCount"
                  type="number"
                  min="1"
                  max="50"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  className="border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20"
                />
                <Button 
                  onClick={handleGenerateCodes} 
                  className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-6"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Generate Codes
                </Button>
              </div>

              {/* Generated Codes */}
              {generatedCodes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Generated Codes:
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {generatedCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-lg">
                        <code className="font-mono text-sm text-emerald-800 font-semibold">{code}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code)}
                          className="hover:bg-emerald-100 hover:border-emerald-300 hover:text-emerald-700 transition-all duration-200"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Codes */}
              {existingCodes.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                    Existing Codes:
                  </h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {existingCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-gray-50 border border-slate-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <code className="font-mono text-sm text-slate-700">***{code.id.substring(0, 8)}</code>
                          <Badge variant={code.used ? "destructive" : "secondary"} className={`px-2 py-1 text-xs font-semibold ${
                            code.used ? "bg-red-500 hover:bg-red-600 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}>
                            {code.used ? "Used" : "Available"}
                          </Badge>
                        </div>
                        <span className="text-xs text-slate-500">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="gap-3 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowGenerateCodes(false)}
                className="hover:bg-slate-100"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
