"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, Search, BookOpen, Clock, CheckCircle, Award, TrendingUp, Filter } from "lucide-react"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import RequireAuth from "../components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

type CourseItem = {
  id: string
  title: string
  description: string
  thumbnailUrl?: string
  isPublished?: boolean
  progress?: { startedModules: number; completedModules: number; totalModules: number; percent: number }
  level?: string
  duration?: string
  instructor?: string
  status?: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"
}

export default function MyCoursesPage() {
  const { user } = useUser()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
  const [courses, setCourses] = useState<CourseItem[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadEnrolledCourses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/my-courses`, { 
          credentials: "include" 
        })
        if (res.ok) {
          const data = await res.json()
          setCourses(data)
        } else {
          toast({
            title: "Error",
            description: "Failed to load your enrolled courses",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error loading enrolled courses:", error)
        toast({
          title: "Error",
          description: "Failed to load your enrolled courses",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }
    loadEnrolledCourses()
  }, [toast])

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = !selectedLevel || course.level === selectedLevel
    const matchesStatus = !selectedStatus || 
      (selectedStatus === "completed" && course.status === "COMPLETED") ||
      (selectedStatus === "in-progress" && course.status === "IN_PROGRESS") ||
      (selectedStatus === "not-started" && course.status === "NOT_STARTED")
    
    return matchesSearch && matchesLevel && matchesStatus
  })

  const getStatusBadge = (course: CourseItem) => {
    if (course.status === "COMPLETED") return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    if (course.status === "IN_PROGRESS") return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    return <Badge variant="outline">Not Started</Badge>
  }

  const getLevelBadge = (level?: string) => {
    if (!level) return <Badge variant="secondary">Beginner</Badge>
    const levelColors = {
      "Beginner": "bg-green-100 text-green-800",
      "Intermediate": "bg-yellow-100 text-yellow-800",
      "Advanced": "bg-red-100 text-red-800"
    }
    return <Badge className={levelColors[level as keyof typeof levelColors] || "bg-gray-100 text-gray-800"}>
      {level}
    </Badge>
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading your courses...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
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
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">My Courses</h1>
            <p className="text-muted-foreground text-lg">Continue your learning journey</p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedLevel || ""}
                  onChange={(e) => setSelectedLevel(e.target.value || null)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <select
                  value={selectedStatus || ""}
                  onChange={(e) => setSelectedStatus(e.target.value || null)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{courses.length}</p>
                    <p className="text-sm text-muted-foreground">Total Courses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {courses.filter(c => c.status === "IN_PROGRESS").length}
                    </p>
                    <p className="text-sm text-muted-foreground">In Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {courses.filter(c => c.status === "COMPLETED").length}
                    </p>
                    <p className="text-sm text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">
                      {Math.round(courses.reduce((acc, c) => acc + (c.progress?.percent || 0), 0) / Math.max(courses.length, 1))}%
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Progress</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Courses Grid */}
          {filteredCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery || selectedLevel || selectedStatus
                    ? "Try adjusting your search or filters"
                    : "You haven't enrolled in any courses yet"}
                </p>
                <Button asChild>
                  <Link href="/courses">Browse All Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map((course) => (
                <Card key={course.id} className="group hover:shadow-lg transition-shadow">
                  <div className="aspect-video bg-muted rounded-t-lg overflow-hidden">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <BookOpen className="h-12 w-12 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {course.title}
                      </h3>
                      {getStatusBadge(course)}
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                      {course.description}
                    </p>
                    
                    {/* Course Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      {course.level && (
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3" />
                          {getLevelBadge(course.level)}
                        </div>
                      )}
                      {course.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.duration}
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {course.progress && (
                      <div className="mb-4">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Progress</span>
                          <span>{course.progress.percent}%</span>
                        </div>
                        <Progress value={course.progress.percent} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                          {course.progress.startedModules} of {course.progress.totalModules} modules started
                        </p>
                      </div>
                    )}

                    <Button asChild className="w-full">
                      <Link href={`/courses/${course.id}`}>
                        <PlayCircle className="h-4 w-4 mr-2" />
                        {course.progress && course.progress.percent > 0 ? "Continue" : "Start Course"}
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </RequireAuth>
  )
}
