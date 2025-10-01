"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { PlayCircle, Plus, Search, BookOpen, Users, TrendingUp, Edit, MoreVertical, LogOut } from "lucide-react"
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

// Mock data
const mockCourses = [
  {
    id: 1,
    title: "Web Development Fundamentals",
    description: "Master HTML, CSS, and JavaScript from scratch",
    totalModules: 12,
    enrolledStudents: 245,
    level: "Beginner",
    status: "Published",
  },
  {
    id: 2,
    title: "Advanced React Patterns",
    description: "Learn modern React patterns and best practices",
    totalModules: 10,
    enrolledStudents: 189,
    level: "Advanced",
    status: "Published",
  },
  {
    id: 3,
    title: "Full-Stack Development",
    description: "Build complete applications with modern tech stack",
    totalModules: 15,
    enrolledStudents: 312,
    level: "Intermediate",
    status: "Published",
  },
  {
    id: 4,
    title: "UI/UX Design Principles",
    description: "Create beautiful and intuitive user interfaces",
    totalModules: 8,
    enrolledStudents: 156,
    level: "Beginner",
    status: "Draft",
  },
]

const mockStats = {
  totalCourses: 12,
  totalStudents: 1247,
  totalModules: 98,
  avgCompletion: 67,
}

export default function AdminDashboard() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<number | null>(null)

  const filteredCourses = mockCourses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleDeleteCourse = (courseId: number) => {
    setCourseToDelete(courseId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    // TODO: Call Spring Boot backend: DELETE /api/admin/courses/{id}
    console.log("[v0] Deleting course:", courseToDelete)

    toast({
      title: "Course Deleted",
      description: "The course has been successfully deleted",
    })

    setDeleteDialogOpen(false)
    setCourseToDelete(null)
  }

  const handleSignOut = () => {
    console.log("[v0] Admin sign out")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <PlayCircle className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">The Xperience</span>
          </Link>
          <div className="flex items-center gap-4">
            <Badge variant="secondary">Admin</Badge>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Admin Dashboard</h1>
          <p className="text-muted-foreground text-lg">Manage courses, modules, and monitor platform activity</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalCourses}</div>
              <p className="text-xs text-muted-foreground">Active learning paths</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">Enrolled learners</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <PlayCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalModules}</div>
              <p className="text-xs text-muted-foreground">Video lessons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.avgCompletion}%</div>
              <p className="text-xs text-muted-foreground">Course completion rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Courses Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Courses Management</CardTitle>
                <CardDescription>Create, edit, and manage your course catalog</CardDescription>
              </div>
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="h-4 w-4 mr-2" />
                  New Course
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Courses Table */}
            <div className="border rounded-lg">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium">Course</th>
                      <th className="text-left p-4 font-medium">Level</th>
                      <th className="text-left p-4 font-medium">Modules</th>
                      <th className="text-left p-4 font-medium">Students</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCourses.map((course) => (
                      <tr key={course.id} className="border-t hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{course.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{course.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{course.level}</Badge>
                        </td>
                        <td className="p-4">{course.totalModules}</td>
                        <td className="p-4">{course.enrolledStudents}</td>
                        <td className="p-4">
                          <Badge variant={course.status === "Published" ? "default" : "secondary"}>
                            {course.status}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/admin/courses/${course.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/courses/${course.id}`}>Edit Course</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/admin/courses/${course.id}/modules`}>Manage Modules</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteCourse(course.id)}
                                >
                                  Delete Course
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredCourses.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No courses found matching your search.</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this course? This action cannot be undone and will remove all associated
              modules and student progress.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
