"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { Plus, Search, Edit, Trash2, ArrowLeft, Users, Mail, Calendar, Shield, Menu, X, Filter } from "lucide-react"
import Navbar from "../../components/Navbar"
import UserDropdown from "../../components/UserDropdown"
import { useUser } from "../../hooks/useUser"

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  imageUrl?: string
  enrollments?: Array<{
    classId: string
    className: string
    trainingName: string
    enrolledAt: string
  }>
}

interface Class {
  id: string
  name: string
  description?: string
  moduleId?: string
  moduleName?: string
}

export default function UserManagementPage() {
  const { user } = useUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [classes, setClasses] = useState<Class[]>([])
  const [userEnrollments, setUserEnrollments] = useState<Record<string, Array<{ classId: string; className: string }>>>({})
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "STUDENT",
    imageUrl: ""
  })
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)

  useEffect(() => {
    loadUsers()
    loadClasses()
  }, [])

  useEffect(() => {
    if (users.length > 0 && selectedClassId !== "all") {
      // Only load enrollments when a specific class is selected
      loadUserEnrollmentsForClass(selectedClassId)
    } else if (users.length > 0 && selectedClassId === "all") {
      // Clear enrollments when showing all users
      setUserEnrollments({})
    }
  }, [users, selectedClassId])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users", {
        credentials: "include"
      })
      if (res.ok) {
        const usersData = await res.json()
        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadClasses = async () => {
    try {
      const res = await fetch("/api/classes", {
        credentials: "include"
      })
      if (res.ok) {
        const classesData = await res.json()
        setClasses(classesData)
      }
    } catch (error) {
      console.error("Error loading classes:", error)
    }
  }

  const loadUserEnrollmentsForClass = async (classId: string) => {
    try {
      // Try to use class roster endpoint first (more efficient)
      try {
        const rosterRes = await fetch(`/api/admin/analytics/class-rosters?classId=${classId}`, {
          credentials: "include"
        })
        if (rosterRes.ok) {
          const rosterData = await rosterRes.json()
          if (rosterData.rosters && rosterData.rosters.length > 0) {
            const enrollmentsMap: Record<string, Array<{ classId: string; className: string }>> = {}
            rosterData.rosters.forEach((roster: any) => {
              if (roster.students) {
                roster.students.forEach((student: any) => {
                  if (!enrollmentsMap[student.id]) {
                    enrollmentsMap[student.id] = []
                  }
                  enrollmentsMap[student.id].push({
                    classId: classId,
                    className: roster.className || classes.find(c => c.id === classId)?.name || "Unknown"
                  })
                })
              }
            })
            setUserEnrollments(enrollmentsMap)
            return
          }
        }
      } catch (error) {
        console.error("Error loading class roster:", error)
      }

      // Fallback: Load enrollments for all users (slower but works)
      const enrollmentPromises = users.map(async (user) => {
        try {
          const res = await fetch(`/api/admin/users/${user.id}`, {
            credentials: "include"
          })
          if (res.ok) {
            const userData = await res.json()
            if (userData.enrollments) {
              const classEnrollments = userData.enrollments
                .filter((e: any) => e.classId === classId)
                .map((e: any) => ({
                  classId: e.classId,
                  className: e.className
                }))
              if (classEnrollments.length > 0) {
                return {
                  userId: user.id,
                  enrollments: classEnrollments
                }
              }
            }
          }
        } catch (error) {
          console.error(`Error loading enrollments for user ${user.id}:`, error)
        }
        return null
      })

      const enrollmentResults = await Promise.all(enrollmentPromises)
      const enrollmentsMap: Record<string, Array<{ classId: string; className: string }>> = {}
      enrollmentResults.forEach((result) => {
        if (result) {
          enrollmentsMap[result.userId] = result.enrollments
        }
      })
      setUserEnrollments(enrollmentsMap)
    } catch (error) {
      console.error("Error loading user enrollments:", error)
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Convert file to data URL if a file is selected
      let imageUrl = newUser.imageUrl
      if (selectedImageFile) {
        // Check file size (2MB limit for data URLs to avoid database issues)
        if (selectedImageFile.size > 2 * 1024 * 1024) {
          alert("File size too large. Please select an image smaller than 2MB to avoid database issues.")
          return
        }
        
        const reader = new FileReader()
        reader.onload = async () => {
          const dataUrl = reader.result as string
          const userData = { ...newUser, imageUrl: dataUrl }
          
          const res = await fetch("/api/admin/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(userData)
          })
          
          if (res.ok) {
            setNewUser({ name: "", email: "", password: "", role: "STUDENT", imageUrl: "" })
            setSelectedImageFile(null)
            setShowCreateUser(false)
            loadUsers()
          } else {
            alert("Failed to create user")
          }
        }
        reader.readAsDataURL(selectedImageFile)
        return
      }
      
      // If no file selected, proceed with original logic
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newUser)
      })
      
      if (res.ok) {
        setNewUser({ name: "", email: "", password: "", role: "STUDENT", imageUrl: "" })
        setSelectedImageFile(null)
        setShowCreateUser(false)
        loadUsers()
      } else {
        alert("Failed to create user")
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error creating user")
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include"
      })
      
      if (res.ok) {
        loadUsers()
      } else {
        alert("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
      
      // Class filter
      const matchesClass = selectedClassId === "all" || 
        (userEnrollments[user.id]?.some(e => e.classId === selectedClassId) ?? false) ||
        (user.enrollments?.some(e => e.classId === selectedClassId) ?? false)
      
      return matchesSearch && matchesClass
    })
  }, [users, searchTerm, selectedClassId, userEnrollments])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading users...</p>
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
              <Link href="/admin/trainings" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Trainings
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/classes" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                Classes
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
              </Link>
              <Link href="/admin/users" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
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
                className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
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
        {/* Page Header */}
        <div className="text-center space-y-3 sm:space-y-4 animate-fade-in px-4">
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-xs sm:text-sm font-medium">
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            User Management
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
            User Management
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Manage user accounts, permissions, and access controls
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 hover:bg-slate-100 text-sm -ml-2 sm:ml-0"
            >
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Back
            </Button>
          </div>
          <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
            <DialogTrigger asChild>
              <Button type="button" size="sm" className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 text-sm sm:text-base w-full sm:w-auto">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>Add a new user to the system</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STUDENT">Student</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Profile Image</Label>
                  <FileUpload
                    onFileSelect={setSelectedImageFile}
                    accept={{
                      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp']
                    }}
                    placeholder="Drag and drop an image here, or click to select"
                    currentFile={selectedImageFile}
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowCreateUser(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6 animate-slide-up">
          <Card className="lg:col-span-2 border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 sm:h-5 sm:w-5" />
                <Input
                  placeholder="Search users by name, email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 h-10 sm:h-12 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl"
                />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="class-filter" className="text-xs sm:text-sm text-slate-600 flex items-center gap-2">
                  <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Filter by Class
                </Label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger id="class-filter" className="h-10 sm:h-12 text-sm sm:text-base border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl">
                    <SelectValue placeholder="All Classes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-[#005eb8] mb-1.5 sm:mb-2">{filteredUsers.length}</div>
                <div className="text-xs sm:text-sm text-slate-600">
                  {selectedClassId === "all" ? "Total Users" : "Filtered Users"}
                </div>
                <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#005eb8] to-[#0476D7] rounded-full transition-all duration-300"
                    style={{ width: `${users.length > 0 ? (filteredUsers.length / users.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
          <CardHeader className="pb-4 sm:pb-6 px-4 sm:px-6">
            <CardTitle className="flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs sm:text-sm">Manage user accounts and permissions</CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <div className="space-y-3 sm:space-y-4">
              {filteredUsers.map((user, index) => (
                <div key={user.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-6 border-2 border-slate-200 rounded-lg sm:rounded-xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:bg-slate-50 hover:border-[#005eb8]/30 animate-fade-in gap-4 sm:gap-0" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="flex items-start sm:items-center space-x-3 sm:space-x-6 w-full sm:flex-1">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg sm:rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                      {user.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.name}
                          className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg sm:rounded-xl object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-[#005eb8] transition-colors duration-200 mb-1.5 sm:mb-2">{user.name}</p>
                      <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm text-slate-600 mb-2">
                        <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                        <Badge variant={user.role === "ADMIN" ? "default" : "outline"} className={`px-2 sm:px-3 py-0.5 sm:py-1 text-xs font-semibold ${
                          user.role === "ADMIN" ? "bg-gradient-to-r from-[#FFBC00] to-[#f59e0b] text-white hover:from-[#f59e0b] hover:to-[#FFBC00]" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {user.role}
                        </Badge>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span className="hidden sm:inline">{new Date(user.createdAt).toLocaleDateString()}</span>
                          <span className="sm:hidden">{new Date(user.createdAt).toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteUser(user.id)}
                      className="hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-200"
                    >
                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="space-y-6">
                    <div className="mx-auto w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Users className="h-12 w-12 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">No users found</h3>
                      <p className="text-slate-600 max-w-md mx-auto">
                        {searchTerm ? "Try adjusting your search terms" : "Get started by creating your first user account"}
                      </p>
                    </div>
                    {!searchTerm && (
                      <Button asChild className="bg-gradient-to-r from-[#005eb8] to-[#0476D7] hover:from-[#0476D7] hover:to-[#005eb8] text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                        <Link href="#" onClick={() => setShowCreateUser(true)}>
                          <Plus className="h-5 w-5 mr-2" />
                          Create User
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
