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
import { Menu, X, PlayCircle, User, Eye, MessageSquare } from "lucide-react"

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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseToDelete}`, {
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${userToDelete}`, {
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
          toast({
            title: "Error",
            description: "Failed to delete user",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user",
          variant: "destructive",
        })
      }
      setUserToDelete(null)
    }

    setDeleteDialogOpen(false)
  }

  const handleCreateCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses`, {
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
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
      <div className="min-h-screen bg-background">
        <div className="border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-2xl font-bold">
                TheXperience
              </Link>
              <nav className="hidden md:flex items-center space-x-6">
                <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/admin/trainings" className="text-sm font-medium hover:text-primary transition-colors">
                  Trainings
                </Link>
                <Link href="/admin/classes" className="text-sm font-medium hover:text-primary transition-colors">
                  Classes
                </Link>
                <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
                  Users
                </Link>
                <Link href="/admin/feed" className="text-sm font-medium hover:text-primary transition-colors">
                  Feed
                </Link>
                <Link href="/admin/leaderboard" className="text-sm font-medium hover:text-primary transition-colors">
                  Leaderboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <UserDropdown user={user} />
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-background">
              <nav className="container mx-auto px-4 py-4 space-y-2">
                <Link 
                  href="/admin" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link 
                  href="/admin/trainings" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Trainings
                </Link>
                <Link 
                  href="/admin/classes" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Classes
                </Link>
                <Link 
                  href="/admin/users" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Users
                </Link>
                <Link 
                  href="/admin/feed" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Feed
                </Link>
                <Link 
                  href="/admin/leaderboard" 
                  className="block py-2 text-sm font-medium hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Simple Admin Dashboard */}
        <div className="container mx-auto py-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="text-sm text-muted-foreground">
              Welcome back, Admin
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
                <PlayCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.length}</div>
                <p className="text-xs text-muted-foreground">
                  Training modules available
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{users.length}</div>
                <p className="text-xs text-muted-foreground">
                  Registered users
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{courses.filter(course => course.isPublished).length}</div>
                <p className="text-xs text-muted-foreground">
                  Published modules
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/trainings">
                    <PlayCircle className="h-6 w-6" />
                    <span>Manage Trainings</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/classes">
                    <User className="h-6 w-6" />
                    <span>Manage Classes</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/users">
                    <User className="h-6 w-6" />
                    <span>Manage Users</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-20 flex-col gap-2">
                  <Link href="/admin/feed">
                    <MessageSquare className="h-6 w-6" />
                    <span>Monitor Feed</span>
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
