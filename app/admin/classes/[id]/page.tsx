"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Trash2 } from "lucide-react"
import Navbar from "../../../components/Navbar"
import { useUser } from "../../../hooks/useUser"
import { useToast } from "@/hooks/use-toast"

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

export default function EditClassPage() {
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const { user, isLoading: userLoading } = useUser()
  const [classData, setClassData] = useState<Class | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    moduleId: "",
    startDate: "",
    endDate: "",
    maxStudents: 30,
    isActive: true,
    isArchived: false
  })

  // Check authentication
  useEffect(() => {
    if (!userLoading && !user) {
      router.push("/auth/signin")
    }
  }, [user, userLoading, router])

  // Load class data and modules when user is available
  useEffect(() => {
    if (user && params.id) {
      loadClassData()
      loadModules()
    }
  }, [user, params.id])

  const loadClassData = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/classes/${params.id}`, {
        credentials: "include"
      })
      if (res.ok) {
        const classData = await res.json()
        setClassData(classData)
        setFormData({
          name: classData.name || "",
          description: classData.description || "",
          moduleId: classData.moduleId || "",
          startDate: classData.startDate ? classData.startDate.split('T')[0] : "",
          endDate: classData.endDate ? classData.endDate.split('T')[0] : "",
          maxStudents: classData.maxStudents || 30,
          isActive: classData.isActive ?? true,
          isArchived: classData.isArchived ?? false
        })
      } else {
        toast({
          title: "Error",
          description: "Failed to load class data",
          variant: "destructive"
        })
        router.push("/admin/classes")
      }
    } catch (error) {
      console.error("Error loading class:", error)
      toast({
        title: "Error",
        description: "Failed to load class data",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const loadModules = async () => {
    try {
      const res = await fetch("/api/courses", {
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/classes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify(formData)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Class updated successfully"
        })
        router.push("/admin/classes")
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message || "Failed to update class",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error updating class:", error)
      toast({
        title: "Error",
        description: "Failed to update class",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this class? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/classes/${params.id}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Class deleted successfully"
        })
        router.push("/admin/classes")
      } else {
        const error = await res.json()
        toast({
          title: "Error",
          description: error.message || "Failed to delete class",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error deleting class:", error)
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive"
      })
    }
  }

  // Show loading while checking authentication
  if (userLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading class data...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!classData) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Class not found</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/classes")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Classes
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Class</h1>
            <p className="text-muted-foreground">Update class information and settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Class Information</CardTitle>
                <CardDescription>
                  Update the basic information for this class
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Class Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter class name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="moduleId">Module</Label>
                    <Select
                      value={formData.moduleId}
                      onValueChange={(value) => setFormData({ ...formData, moduleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a module" />
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((module) => (
                          <SelectItem key={module.id} value={module.id}>
                            {module.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter class description"
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 30 })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isArchived"
                      checked={formData.isArchived}
                      onChange={(e) => setFormData({ ...formData, isArchived: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isArchived">Archived</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Class
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Class Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Students:</span>
                  <span className="font-medium">{classData.currentStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Max Students:</span>
                  <span className="font-medium">{classData.maxStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="font-medium">
                    {new Date(classData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
