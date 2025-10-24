"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Trash2, ArrowLeft, GraduationCap, Users, Calendar, Clock, Key, Copy } from "lucide-react"
import Navbar from "../../components/Navbar"

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
  const [classes, setClasses] = useState<Class[]>([])
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showCreateClass, setShowCreateClass] = useState(false)
  const [showInactive, setShowInactive] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
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
      console.log("🔄 Loading classes...")
      setLoading(true)
      const res = await fetch("/api/classes", {
        credentials: "include"
      })
      if (res.ok) {
        const classesData = await res.json()
        console.log("✅ Classes loaded:", classesData.length, "classes")
        console.log("📋 Classes data:", classesData)
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

      console.log("Creating class with data:", classData)

      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(classData)
      })
      
      console.log("Response status:", res.status)
      
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
      
      console.log(`🔄 Changing class ${classId} to ${newState} state`)
      
      const res = await fetch(`/api/classes/${classId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: newIsActive, isArchived: newIsArchived })
      })
      
      console.log(`📡 Response status: ${res.status}`)
      
      if (res.ok) {
        const responseData = await res.json()
        console.log("✅ Class status updated successfully:", responseData)
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Class Management</h1>
              <p className="text-gray-600">Manage classes and enrollments</p>
            </div>
          </div>
          <Dialog open={showCreateClass} onOpenChange={setShowCreateClass}>
            <DialogTrigger asChild>
              <Button type="button">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>Add a new class to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass} className="space-y-4">
                <div>
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={newClass.name}
                    onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newClass.description}
                    onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="moduleId">Module</Label>
                  <select
                    id="moduleId"
                    value={newClass.moduleId}
                    onChange={(e) => setNewClass({ ...newClass, moduleId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newClass.startDate}
                      onChange={(e) => setNewClass({ ...newClass, startDate: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newClass.endDate}
                      onChange={(e) => setNewClass({ ...newClass, endDate: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="maxStudents">Max Students</Label>
                  <Input
                    id="maxStudents"
                    type="number"
                    value={newClass.maxStudents}
                    onChange={(e) => setNewClass({ ...newClass, maxStudents: parseInt(e.target.value) })}
                    min="1"
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateClass(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create Class</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search classes by name, description, or module..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{filteredClasses.length}</div>
                <div className="text-sm text-gray-600">
                  {(() => {
                    if (showArchived && showInactive) return 'All Classes'
                    if (showArchived) return 'Active + Archived'
                    if (showInactive) return 'Active + Inactive'
                    return 'Active Classes Only'
                  })()}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant={showArchived ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'Hide Archived' : 'Show Archived'}
                  </Button>
                  <Button
                    variant={showInactive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowInactive(!showInactive)}
                  >
                    {showInactive ? 'Hide Inactive' : 'Show Inactive'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Classes List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Classes ({filteredClasses.length})
            </CardTitle>
            <CardDescription>Manage classes and their enrollments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClasses.map((classItem) => {
                console.log(`Class ${classItem.name}: isActive=${classItem.isActive}, isArchived=${classItem.isArchived}`)
                return (
                <div 
                  key={classItem.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg ${
                    classItem.isActive && !classItem.isArchived
                      ? 'hover:bg-gray-50' 
                      : !classItem.isActive && classItem.isArchived
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-100 opacity-75'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`h-16 w-16 rounded-lg flex items-center justify-center ${
                      classItem.isActive && !classItem.isArchived
                        ? 'bg-purple-100' 
                        : !classItem.isActive && classItem.isArchived
                          ? 'bg-blue-100'
                          : 'bg-gray-200'
                    }`}>
                      <GraduationCap className={`h-8 w-8 ${
                        classItem.isActive && !classItem.isArchived
                          ? 'text-purple-600' 
                          : !classItem.isActive && classItem.isArchived
                            ? 'text-blue-600'
                            : 'text-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        classItem.isActive && !classItem.isArchived
                          ? 'text-gray-900' 
                          : !classItem.isActive && classItem.isArchived
                            ? 'text-blue-900'
                            : 'text-gray-600'
                      }`}>
                        {classItem.name}
                      </p>
                      <p className={`text-sm mb-2 ${
                        classItem.isActive 
                          ? 'text-gray-600' 
                          : 'text-gray-500'
                      }`}>
                        {classItem.description}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          classItem.isActive && !classItem.isArchived ? "default" : 
                          !classItem.isActive && classItem.isArchived ? "secondary" : 
                          "destructive"
                        }>
                          {classItem.isActive && !classItem.isArchived ? "Active" : 
                           !classItem.isActive && classItem.isArchived ? "Archived" : 
                           "Inactive"}
                        </Badge>
                        <span className={`text-xs ${
                          classItem.isActive && !classItem.isArchived
                            ? 'text-gray-500' 
                            : 'text-gray-400'
                        }`}>
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(classItem.startDate).toLocaleDateString()} - {new Date(classItem.endDate).toLocaleDateString()}
                        </span>
                        <span className={`text-xs ${
                          classItem.isActive 
                            ? 'text-gray-500' 
                            : 'text-gray-400'
                        }`}>
                          <Users className="h-3 w-3 inline mr-1" />
                          {classItem.currentStudents}/{classItem.maxStudents} students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openCodeGeneration(classItem)}
                      title="Generate enrollment codes"
                      disabled={!classItem.isActive}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant={classItem.isActive ? "default" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, true, false)} // Set to Active
                        disabled={classItem.isActive}
                      >
                        Active
                      </Button>
                      <Button
                        size="sm"
                        variant={classItem.isArchived ? "secondary" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, false, true)} // Set to Archived
                        disabled={classItem.isArchived}
                      >
                        Archived
                      </Button>
                      <Button
                        size="sm"
                        variant={!classItem.isActive && !classItem.isArchived ? "destructive" : "outline"}
                        onClick={() => handleToggleClassStatus(classItem.id, false, false)} // Set to Inactive
                        disabled={!classItem.isActive && !classItem.isArchived}
                      >
                        Inactive
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/admin/classes/${classItem.id}`}
                      disabled={!classItem.isActive}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClass(classItem.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                )
              })}
              {filteredClasses.length === 0 && (
                <div className="text-center py-8">
                  <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No classes found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Generation Dialog */}
        <Dialog open={showGenerateCodes} onOpenChange={setShowGenerateCodes}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Generate Enrollment Codes</DialogTitle>
              <DialogDescription>
                Generate enrollment codes for {selectedClassForCodes?.name}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Generate New Codes */}
              <div>
                <Label htmlFor="generateCount">Number of codes to generate</Label>
                <Input
                  id="generateCount"
                  type="number"
                  min="1"
                  max="50"
                  value={generateCount}
                  onChange={(e) => setGenerateCount(parseInt(e.target.value) || 1)}
                  className="mt-2"
                />
                <Button onClick={handleGenerateCodes} className="mt-4">
                  <Key className="h-4 w-4 mr-2" />
                  Generate Codes
                </Button>
              </div>

              {/* Generated Codes */}
              {generatedCodes.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Generated Codes:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {generatedCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                        <code className="font-mono text-sm">{code}</code>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyToClipboard(code)}
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
                <div>
                  <h3 className="font-medium mb-2">Existing Codes:</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {existingCodes.map((code, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 border rounded">
                        <div className="flex items-center space-x-2">
                          <code className="font-mono text-sm">***{code.id.substring(0, 8)}</code>
                          <Badge variant={code.used ? "destructive" : "secondary"}>
                            {code.used ? "Used" : "Available"}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(code.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowGenerateCodes(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
