"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import RequireAdmin from "@/app/components/RequireAdmin"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import AdminDashboard from "./components/AdminDashboard"
import { fetchWithCache, cacheInvalidation } from "../utils/apiCache"
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

  // Load courses with caching
  const loadCourses = async () => {
    try {
      const res = await fetchWithCache(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses`,
        { credentials: "include" },
        5 * 60 * 1000 // 5 minutes cache
      )
      if (res.ok) {
        const data = await res.json()
        setCourses(data)
      } else {
        console.error("Failed to load courses")
        toast({
          title: "Error",
          description: "Failed to load courses",
          variant: "destructive",
        })
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

  // Load users with caching
  const loadUsers = async () => {
    try {
      const res = await fetchWithCache(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`,
        { credentials: "include" },
        10 * 60 * 1000 // 10 minutes cache
      )
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        console.error("Failed to load users")
        toast({
          title: "Error",
          description: "Failed to load users",
          variant: "destructive",
        })
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
          cacheInvalidation.invalidateCourses()
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
          cacheInvalidation.invalidateUsers()
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
        cacheInvalidation.invalidateCourses()
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
        cacheInvalidation.invalidateUsers()
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
                <Link href="/admin/modules" className="text-sm font-medium hover:text-primary transition-colors">
                  Trainings
                </Link>
                <Link href="/admin/classes" className="text-sm font-medium hover:text-primary transition-colors">
                  Classes
                </Link>
                <Link href="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
                  Users
                </Link>
                <Link href="/admin/analytics" className="text-sm font-medium hover:text-primary transition-colors">
                  Analytics
                </Link>
              </nav>
            </div>
            <UserDropdown user={user} />
          </div>
        </div>

        <AdminDashboard
          courses={courses}
          users={users}
          isLoading={isLoading}
          onLoadCourses={loadCourses}
          onLoadUsers={loadUsers}
          onEditCourse={(courseId) => {
            // Navigate to edit page
            window.location.href = `/admin/modules/${courseId}`
          }}
          onDeleteCourse={handleDeleteCourse}
          onEditUser={handleEditUser}
          onDeleteUser={handleDeleteUser}
        />

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


