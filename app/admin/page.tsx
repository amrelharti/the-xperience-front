"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlayCircle, Plus, Search, BookOpen, Users, TrendingUp, Edit, MoreVertical, UserCheck, UserX, Mail } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"

interface Course {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface Module {
  id: string
  courseId: string
  title: string
  description: string
  videoUrl?: string
  durationSeconds: number
  orderIndex: number
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
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"courses" | "users">("courses")
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
        credentials: "include",
      })
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


  // Load users
  const loadUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users`, {
        credentials: "include",
      })
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
    loadCourses()
    loadUsers()
    setIsLoading(false)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('[id^="course-menu-"]') && !target.closest('[id^="user-menu-"]')) {
        // Close all dropdowns
        document.querySelectorAll('[id^="course-menu-"], [id^="user-menu-"]').forEach(menu => {
          menu.classList.add('hidden')
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateCourse = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newCourse),
      })
      
      if (res.ok) {
        toast({
          title: "Course Created",
          description: "The course has been successfully created",
        })
        setCreateCourseOpen(false)
        setNewCourse({ title: "", description: "", thumbnailUrl: "", isPublished: false })
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

  const handleUpdateUser = async () => {
    if (!selectedUser) return
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editUser),
      })
      
      if (res.ok) {
        toast({
          title: "User Updated",
          description: "The user has been successfully updated",
        })
        setEditUserOpen(false)
        setSelectedUser(null)
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

  const confirmDelete = async () => {
    if (courseToDelete) {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/courses/${courseToDelete}`, {
          method: "DELETE",
          credentials: "include",
        })
        
        if (res.ok) {
    toast({
      title: "Course Deleted",
      description: "The course has been successfully deleted",
    })
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
            title: "User Deleted",
            description: "The user has been successfully deleted",
          })
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



  if (isLoading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading...</p>
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-blue-50 to-purple-50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">Manage courses and users</p>
            </div>
            </div>
          <div className="flex items-center space-x-4">
            {user && <UserDropdown user={user} />}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-blue-600" />
        </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{courses.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Active courses</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Published</CardTitle>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{courses.filter(c => c.isPublished).length}</div>
              <p className="text-xs text-muted-foreground mt-1">Live courses</p>
            </CardContent>
          </Card>
              <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-purple-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
            </CardHeader>
            <CardContent>
                  <div className="text-3xl font-bold text-purple-600">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Registered users</p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{users.filter(u => u.role === "STUDENT").length}</div>
              <p className="text-xs text-muted-foreground mt-1">Enrolled users</p>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 rounded-lg bg-muted p-1 mb-6">
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "courses"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("courses")}
          >
            <BookOpen className="h-4 w-4 mr-2 inline" />
            Courses
          </button>
          <button
            className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === "users"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("users")}
          >
            <Users className="h-4 w-4 mr-2 inline" />
            Users
          </button>
              </div>

        {/* Search and Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
              placeholder={activeTab === "courses" ? "Search courses..." : "Search users..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          {activeTab === "courses" && (
            <Button onClick={() => setCreateCourseOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Course
            </Button>
          )}
        </div>


        {/* Content based on active tab */}
        {activeTab === "courses" && (
          <>
            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow duration-200 group">
                  <CardContent className="p-6">
                    {/* Course Image */}
                    <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 relative overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-16 w-16 text-muted-foreground/50" />
                        </div>
                      )}
                      <div className="absolute top-3 right-3">
                        <Badge 
                          variant={course.isPublished ? "default" : "secondary"}
                          className="shadow-sm"
                        >
                          {course.isPublished ? "Published" : "Draft"}
                        </Badge>
                      </div>
                    </div>

                    {/* Course Info */}
                    <div className="space-y-3">
                          <div>
                        <h3 className="font-semibold text-lg line-clamp-2">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                          {course.description}
                        </p>
                      </div>

                      {/* Actions and Status */}
                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm text-muted-foreground">Active</span>
                          </div>
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                            onClick={() => {
                              console.log("Dropdown trigger clicked for course:", course.id)
                              const menu = document.getElementById(`course-menu-${course.id}`)
                              if (menu) {
                                menu.classList.toggle('hidden')
                              }
                            }}
                          >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                          <div 
                            id={`course-menu-${course.id}`}
                            className="hidden absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                          >
                            <div 
                              className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100"
                              onClick={() => {
                                console.log("View Modules clicked for course:", course.id)
                                window.location.href = `/admin/courses/${course.id}/modules`
                                document.getElementById(`course-menu-${course.id}`)?.classList.add('hidden')
                              }}
                            >
                              <PlayCircle className="h-4 w-4 mr-3 text-blue-600" />
                              <span className="font-medium">View Modules</span>
                            </div>
                            <div
                              className="px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center text-red-600"
                              onClick={() => {
                                console.log("Delete Course clicked for course:", course.id)
                                handleDeleteCourse(course.id)
                                document.getElementById(`course-menu-${course.id}`)?.classList.add('hidden')
                              }}
                            >
                              <div className="h-4 w-4 mr-3 rounded-full bg-red-100 flex items-center justify-center">
                                <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                              </div>
                              <span className="font-medium">Delete Course</span>
                            </div>
                          </div>
              </div>
                      </div>

                      {/* Date */}
                      <div className="text-xs text-muted-foreground pt-1 border-t border-gray-100">
                        Created {new Date(course.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? "Try adjusting your search terms" : "Get started by creating your first course"}
                </p>
                <Button onClick={() => setCreateCourseOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Button>
              </div>
            )}

          </>
        )}

        {activeTab === "users" && (
          <>
            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200 group">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center ring-2 ring-white shadow-md">
                          {user.imageUrl ? (
                            <img
                              src={user.imageUrl}
                              alt={user.name}
                              className="h-14 w-14 rounded-full object-cover"
                            />
                          ) : (
                            <UserCheck className="h-7 w-7 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{user.name}</h3>
                          <p className="text-sm text-muted-foreground flex items-center mt-1">
                            <Mail className="h-4 w-4 mr-2" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                          onClick={() => {
                            console.log("User dropdown trigger clicked for user:", user.id)
                            const menu = document.getElementById(`user-menu-${user.id}`)
                            if (menu) {
                              menu.classList.toggle('hidden')
                            }
                          }}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                        <div 
                          id={`user-menu-${user.id}`}
                          className="hidden absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50"
                        >
                          <div 
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center border-b border-gray-100"
                            onClick={() => {
                              console.log("Edit User clicked for user:", user.id)
                              handleEditUser(user)
                              document.getElementById(`user-menu-${user.id}`)?.classList.add('hidden')
                            }}
                          >
                            <Edit className="h-4 w-4 mr-3 text-blue-600" />
                            <span className="font-medium">Edit User</span>
                          </div>
                          <div 
                            className="px-4 py-3 hover:bg-red-50 cursor-pointer flex items-center text-red-600"
                            onClick={() => {
                              console.log("Delete User clicked for user:", user.id)
                              handleDeleteUser(user.id)
                              document.getElementById(`user-menu-${user.id}`)?.classList.add('hidden')
                            }}
                          >
                            <UserX className="h-4 w-4 mr-3" />
                            <span className="font-medium">Delete User</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={user.role === "ADMIN" ? "default" : "secondary"} 
                        className="px-3 py-1"
                      >
                        {user.role === "ADMIN" ? "👑 Admin" : "👤 Student"}
                      </Badge>
                      <div className="text-sm text-muted-foreground">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
          </CardContent>
        </Card>
              ))}
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchQuery ? "Try adjusting your search terms" : "No users registered yet"}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Course Dialog */}
      <Dialog open={createCourseOpen} onOpenChange={setCreateCourseOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to your learning platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newCourse.title}
                onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                placeholder="Course title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCourse.description}
                onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                placeholder="Course description"
                rows={3}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input
                id="thumbnailUrl"
                value={newCourse.thumbnailUrl}
                onChange={(e) => setNewCourse({ ...newCourse, thumbnailUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={newCourse.isPublished}
                onChange={(e) => setNewCourse({ ...newCourse, isPublished: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isPublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateCourseOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCourse} disabled={!newCourse.title || !newCourse.description}>
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Edit User Dialog */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and role.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="userName">Name</Label>
              <Input
                id="userName"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                placeholder="User name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userRole">Role</Label>
              <select
                id="userRole"
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="STUDENT">Student</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="userImageUrl">Image URL</Label>
              <Input
                id="userImageUrl"
                value={editUser.imageUrl}
                onChange={(e) => setEditUser({ ...editUser, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUserOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={!editUser.name || !editUser.role}>
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{courseToDelete ? "Delete Course" : "Delete User"}</DialogTitle>
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
    </div>
    </RequireAdmin>
  )
}