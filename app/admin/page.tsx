"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Menu, X, PlayCircle, User, Eye, MessageSquare, GraduationCap, FileCheck } from "lucide-react"

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface User {
  id: string
  name: string
  email: string
  role: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
  const [userToDelete, setUserToDelete] = useState<string | null>(null)
  const [createCourseOpen, setCreateCourseOpen] = useState(false)
  const [editUserOpen, setEditUserOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  
  // Form states
  const [newCourse, setNewCourse] = useState({
    title: "",
    description: "",
    thumbnailUrl: "",
    isPublished: false
  })
  
  const [editUser, setEditUser] = useState({
    name: "",
    role: "",
    imageUrl: ""
  })
  
  const { toast } = useToast()

  // Load courses
  const loadCourses = async () => {
    try {
      const res = await fetch(`/api/admin/courses`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
        console.log("📚 Loaded", data.length, "courses")
      } else {
        throw new Error("Failed to load courses")
      }
    } catch (error) {
      console.error("Error loading courses:", error)
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    }
  }

  // Load users
  const loadUsers = async () => {
    try {
      const res = await fetch(`/api/admin/users`, {
        credentials: "include"
      })
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
        console.log("👥 Loaded", data.length, "users")
      } else {
        throw new Error("Failed to load users")
      }
    } catch (error) {
      console.error("Error loading users:", error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([loadCourses(), loadUsers()])
      setIsLoading(false)
    }
    loadData()
  }, [])

  const handleDeleteCourse = (courseId: string) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId)
    setDeleteDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setEditUser({
      name: user.name,
      role: user.role,
      imageUrl: user.imageUrl || ""
    })
    setEditUserOpen(true)
  }

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        const res = await fetch(`/api/admin/courses/${courseToDelete}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (res.ok) {
          toast({
            title: "Success",
            description: "Course deleted successfully",
          })
          // Invalidate cache and reload
          loadCourses()
        } else {
          toast({
            title: "Error",
            description: "Failed to delete course",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting course:", error)
        toast({
          title: "Error",
          description: "Failed to delete course",
          variant: "destructive",
        })
      }
      setCourseToDelete(null)
    }

    if (userToDelete) {
      try {
        const res = await fetch(`/api/admin/users/${userToDelete}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (res.ok) {
          toast({
            title: "Success",
            description: "User deleted successfully",
          })
          // Invalidate cache and reload
          loadUsers()
        } else {
          // Try to get error details from response
          let errorMessage = "Failed to delete user"
          try {
            const errorData = await res.json()
            errorMessage = errorData.error || errorData.message || errorMessage
            
            // Check for foreign key constraint violation
            if (errorMessage.includes("foreign key") || errorMessage.includes("constraint")) {
              errorMessage = "Cannot delete user: They have associated data (course progress, posts, etc.). Please apply the cascade delete migration (V5) to enable user deletion."
            }
          } catch {
            // If response is not JSON, use default message
            errorMessage = "Failed to delete user. The user may have associated data that needs to be deleted first."
          }
          
          toast({
            title: "Error",
            description: errorMessage,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user. Please check the console for details.",
          variant: "destructive",
        })
      }
      setUserToDelete(null)
    }

    setDeleteDialogOpen(false)
  }

  const handleCreateCourse = async () => {
    try {
      const res = await fetch(`/api/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCourse)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Course created successfully",
        })
        setNewCourse({ title: "", description: "", thumbnailUrl: "", isPublished: false })
        setCreateCourseOpen(false)
        // Invalidate cache and reload
        loadCourses()
      } else {
        const error = await res.text()
        console.error("Failed to create course:", error)
        toast({
          title: "Error",
          description: "Failed to create course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editUser)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "User updated successfully",
        })
        setEditUserOpen(false)
        setSelectedUser(null)
        // Invalidate cache and reload
        loadUsers()
      } else {
        const error = await res.text()
        console.error("Failed to update user:", error)
        toast({
          title: "Error",
          description: "Failed to update user",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error updating user:", error)
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      })
    }
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
        {/* Modern Header */}
        <header className="border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3 sm:space-x-6">
              <Link href="/" className="flex items-center gap-2 sm:gap-3 group hover:opacity-80 transition-opacity duration-200">
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
                <Link href="/admin" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/trainings" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
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
                <Link href="/admin/students" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Students
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
                  className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
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
                <Link 
                  href="/admin/students" 
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Students
                </Link>
              </nav>
            </div>
          )}
        </header>

        {/* Modern Admin Dashboard */}
        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-3 sm:space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-xs sm:text-sm font-medium">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-[#FFBC00] rounded-full animate-pulse"></div>
              Admin Dashboard
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent px-4">
              Welcome Back, Admin
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-2xl mx-auto px-4">
              Manage your training programs, monitor student progress, and oversee the learning experience
            </p>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-slide-up">
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Total Trainings</CardTitle>
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <PlayCircle className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#005eb8] mb-1">{courses.length}</div>
                <p className="text-sm text-slate-500">
                  Training programs available
                </p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#005eb8] to-[#0476D7] rounded-full w-3/4"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Total Users</CardTitle>
                <div className="p-2 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <User className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[#FFBC00] mb-1">{users.length}</div>
                <p className="text-sm text-slate-500">
                  Registered students
                </p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#FFBC00] to-[#f59e0b] rounded-full w-4/5"></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-semibold text-slate-600">Published</CardTitle>
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Eye className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 mb-1">{courses.filter(course => course.isPublished).length}</div>
                <p className="text-sm text-slate-500">
                  Published modules
                </p>
                <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enhanced Quick Actions */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
            <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
              <CardTitle className="text-xl sm:text-2xl font-bold text-slate-800">Quick Actions</CardTitle>
              <p className="text-sm sm:text-base text-slate-600">Access your most important admin functions</p>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-[#005eb8] group">
                  <Link href="/admin/trainings">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <PlayCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">Manage Trainings</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-[#FFBC00] group">
                  <Link href="/admin/classes">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-[#FFBC00] to-[#f59e0b] rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">Manage Classes</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-emerald-500 group">
                  <Link href="/admin/users">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <User className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">Manage Users</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-indigo-500 group">
                  <Link href="/admin/students">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">View Students</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-purple-500 group">
                  <Link href="/admin/feed">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">Monitor Feed</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 sm:h-24 flex-col gap-2 sm:gap-3 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-cyan-500 group">
                  <Link href="/admin/cv-score-users">
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <FileCheck className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <span className="font-semibold text-slate-700 text-xs sm:text-sm">CV Score Users</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this {courseToDelete ? "course" : "user"}? This action cannot be undone.
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

        {/* Create Course Dialog */}
        <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Training</DialogTitle>
              <DialogDescription>
                Add a new training to the system.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  placeholder="Training title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Training description"
                />
              </div>
              <div>
                <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
                <Input
                  id="thumbnailUrl"
                  value={newCourse.thumbnailUrl}
                  onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateCourseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Training
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={editUser.imageUrl}
                  onChange={(e) => setEditUser({ ...editUser, imageUrl: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditUserOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser}>
                Update User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}
