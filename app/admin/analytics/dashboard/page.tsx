"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  BookOpen, 
  TrendingUp,
  Activity,
  GraduationCap,
  Video,
  FileText,
  Award,
  RefreshCw,
  Calendar,
  Eye,
  CheckCircle,
  Clock,
  BarChart3,
  School
} from "lucide-react"
import RequireAdmin from "@/app/components/RequireAdmin"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"
import Link from "next/link"

interface OverviewData {
  users: {
    total: number
    students: number
    admins: number
    recentSignups: number
  }
  courses: {
    total: number
    published: number
    totalModules: number
    publishedModules: number
  }
  progress: {
    totalRecords: number
    completed: number
    inProgress: number
    completionRate: number
    avgWatchTimeMinutes: number
  }
  videos: {
    totalAccesses: number
    recentAccesses: number
  }
  classes: {
    total: number
    active: number
    totalEnrollments: number
    activeEnrollments: number
  }
  posts: {
    total: number
    assignments: number
    weeklySummaries: number
    questions: number
  }
}

interface CourseAnalytics {
  id: string
  title: string
  isPublished: boolean
  totalEnrolled: number
  completed: number
  inProgress: number
  completionRate: number
  avgWatchTimeMinutes: number
}

interface StudentEngagement {
  id: string
  name: string
  email: string
  coursesStarted: number
  coursesCompleted: number
  totalWatchTimeMinutes: number
  totalPosts: number
  assignments: number
  weeklySummaries: number
  videoAccesses: number
  classesEnrolled: number
  engagementScore: number
}

interface ClassAnalytics {
  id: string
  name: string
  code: string
  isActive: boolean
  totalEnrolled: number
  totalProgress: number
  totalCompleted: number
  avgCompletionRate: number
  avgWatchTimeMinutes: number
  totalPosts: number
}

interface TrendsData {
  signupsByDate: Record<string, number>
  videoAccessesByDate: Record<string, number>
  completionsByDate: Record<string, number>
  postsByDate: Record<string, number>
  period: string
}

export default function AnalyticsDashboard() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<OverviewData | null>(null)
  const [courseAnalytics, setCourseAnalytics] = useState<CourseAnalytics[]>([])
  const [studentEngagement, setStudentEngagement] = useState<StudentEngagement[]>([])
  const [classAnalytics, setClassAnalytics] = useState<ClassAnalytics[]>([])
  const [trends, setTrends] = useState<TrendsData | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [trendsDays, setTrendsDays] = useState(30)

  useEffect(() => {
    loadAllAnalytics()
  }, [])

  const loadAllAnalytics = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadOverview(),
        loadCourseAnalytics(),
        loadEngagement(),
        loadClassAnalytics(),
        loadTrends(trendsDays)
      ])
    } catch (error) {
      console.error("Error loading analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadOverview = async () => {
    try {
      const response = await fetch("/api/admin/analytics/overview", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setOverview(data)
      }
    } catch (error) {
      console.error("Error loading overview:", error)
    }
  }

  const loadCourseAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/courses", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setCourseAnalytics(data.courses)
      }
    } catch (error) {
      console.error("Error loading course analytics:", error)
    }
  }

  const loadEngagement = async () => {
    try {
      const response = await fetch("/api/admin/analytics/engagement", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setStudentEngagement(data.students)
      }
    } catch (error) {
      console.error("Error loading engagement:", error)
    }
  }

  const loadClassAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/classes", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setClassAnalytics(data.classes)
      }
    } catch (error) {
      console.error("Error loading class analytics:", error)
    }
  }

  const loadTrends = async (days: number) => {
    try {
      const response = await fetch(`/api/admin/analytics/trends?days=${days}`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setTrends(data)
      }
    } catch (error) {
      console.error("Error loading trends:", error)
    }
  }

  const handleTrendsFilter = async (days: number) => {
    setTrendsDays(days)
    await loadTrends(days)
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
          <div className="flex items-center justify-center h-screen">
            <RefreshCw className="h-8 w-8 animate-spin text-white" />
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Analytics Dashboard
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={loadAllAnalytics}
                  variant="outline"
                  className="border-white/20 hover:bg-white/10"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                <UserDropdown user={user} />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          {/* Quick Access to Phase 1 Insights */}
          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    Phase 1: Critical Insights
                  </h3>
                  <p className="text-sm text-white/70">
                    Class rosters, completions, inactive students, progress overview & scores
                  </p>
                </div>
                <Button asChild size="lg">
                  <Link href="/admin/analytics/insights">
                    View Insights
                    <Award className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-black/30 border border-white/10">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="students">Students</TabsTrigger>
              <TabsTrigger value="classes">Classes</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {overview && (
                <>
                  {/* User Statistics */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Users className="h-6 w-6" />
                      User Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Total Users</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.users.total}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Students</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.users.students}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Admins</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.users.admins}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Recent Signups (30d)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.users.recentSignups}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Course Statistics */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <BookOpen className="h-6 w-6" />
                      Course & Module Statistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Total Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.courses.total}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Published Courses</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.courses.published}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-teal-500/20 to-teal-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Total Modules</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.courses.totalModules}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">Published Modules</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.courses.publishedModules}</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Progress Statistics */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Activity className="h-6 w-6" />
                      Learning Progress
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Completed
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.progress.completed}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              In Progress
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.progress.inProgress}</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-indigo-500/20 to-indigo-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="h-4 w-4" />
                              Completion Rate
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.progress.completionRate}%</div>
                        </CardContent>
                      </Card>

                      <Card className="bg-gradient-to-br from-rose-500/20 to-rose-600/20 border-white/10">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-white/70">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Avg Watch Time
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-3xl font-bold">{overview.progress.avgWatchTimeMinutes}m</div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* Video & Class Stats */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card className="bg-black/30 border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Video className="h-5 w-5" />
                          Video Access Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Total Video Accesses</span>
                          <span className="text-2xl font-bold">{overview.videos.totalAccesses}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Recent Accesses (30d)</span>
                          <span className="text-2xl font-bold">{overview.videos.recentAccesses}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-black/30 border-white/10">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <School className="h-5 w-5" />
                          Class Statistics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Active Classes</span>
                          <span className="text-2xl font-bold">{overview.classes.active}/{overview.classes.total}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70">Active Enrollments</span>
                          <span className="text-2xl font-bold">{overview.classes.activeEnrollments}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Posts Statistics */}
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Post Statistics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-3xl font-bold">{overview.posts.total}</div>
                          <div className="text-sm text-white/70 mt-1">Total Posts</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-3xl font-bold">{overview.posts.assignments}</div>
                          <div className="text-sm text-white/70 mt-1">Assignments</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-3xl font-bold">{overview.posts.weeklySummaries}</div>
                          <div className="text-sm text-white/70 mt-1">Weekly Summaries</div>
                        </div>
                        <div className="text-center p-4 bg-white/5 rounded-lg">
                          <div className="text-3xl font-bold">{overview.posts.questions}</div>
                          <div className="text-sm text-white/70 mt-1">Questions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle>Course Analytics</CardTitle>
                  <CardDescription className="text-white/60">
                    Performance metrics for each course
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {courseAnalytics.slice(0, 20).map((course) => (
                      <div
                        key={course.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{course.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded ${
                              course.isPublished
                                ? "bg-green-500/20 text-green-300"
                                : "bg-gray-500/20 text-gray-300"
                            }`}>
                              {course.isPublished ? "Published" : "Draft"}
                            </span>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{course.totalEnrolled}</div>
                            <div className="text-sm text-white/70">Enrolled</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-white/70">Completed</div>
                            <div className="font-semibold">{course.completed}</div>
                          </div>
                          <div>
                            <div className="text-white/70">In Progress</div>
                            <div className="font-semibold">{course.inProgress}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Completion Rate</div>
                            <div className="font-semibold">{course.completionRate}%</div>
                          </div>
                          <div>
                            <div className="text-white/70">Avg Watch Time</div>
                            <div className="font-semibold">{course.avgWatchTimeMinutes}m</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle>Student Engagement</CardTitle>
                  <CardDescription className="text-white/60">
                    Top 50 students ranked by engagement score
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentEngagement.map((student, index) => (
                      <div
                        key={student.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{student.name}</h3>
                              <p className="text-sm text-white/60">{student.email}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{student.engagementScore}</div>
                            <div className="text-xs text-white/70">Engagement Score</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 text-sm">
                          <div>
                            <div className="text-white/70">Started</div>
                            <div className="font-semibold">{student.coursesStarted}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Completed</div>
                            <div className="font-semibold">{student.coursesCompleted}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Watch Time</div>
                            <div className="font-semibold">{student.totalWatchTimeMinutes}m</div>
                          </div>
                          <div>
                            <div className="text-white/70">Assignments</div>
                            <div className="font-semibold">{student.assignments}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Summaries</div>
                            <div className="font-semibold">{student.weeklySummaries}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Classes</div>
                            <div className="font-semibold">{student.classesEnrolled}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classes Tab */}
            <TabsContent value="classes" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle>Class Analytics</CardTitle>
                  <CardDescription className="text-white/60">
                    Performance metrics for each class
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classAnalytics.map((classItem) => (
                      <div
                        key={classItem.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-lg">{classItem.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-300">
                                {classItem.code}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded ${
                                classItem.isActive
                                  ? "bg-green-500/20 text-green-300"
                                  : "bg-gray-500/20 text-gray-300"
                              }`}>
                                {classItem.isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{classItem.totalEnrolled}</div>
                            <div className="text-sm text-white/70">Students</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                          <div>
                            <div className="text-white/70">Progress Records</div>
                            <div className="font-semibold">{classItem.totalProgress}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Completed</div>
                            <div className="font-semibold">{classItem.totalCompleted}</div>
                          </div>
                          <div>
                            <div className="text-white/70">Completion Rate</div>
                            <div className="font-semibold">{classItem.avgCompletionRate}%</div>
                          </div>
                          <div>
                            <div className="text-white/70">Avg Watch Time</div>
                            <div className="font-semibold">{classItem.avgWatchTimeMinutes}m</div>
                          </div>
                          <div>
                            <div className="text-white/70">Total Posts</div>
                            <div className="font-semibold">{classItem.totalPosts}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Trends Tab */}
            <TabsContent value="trends" className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Activity Trends</h2>
                <div className="flex gap-2">
                  {[7, 14, 30, 60, 90].map((days) => (
                    <Button
                      key={days}
                      onClick={() => handleTrendsFilter(days)}
                      variant={trendsDays === days ? "default" : "outline"}
                      size="sm"
                      className={trendsDays === days ? "" : "border-white/20 hover:bg-white/10"}
                    >
                      {days}d
                    </Button>
                  ))}
                </div>
              </div>

              {trends && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">User Signups</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(trends.signupsByDate)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .slice(0, 10)
                          .map(([date, count]) => (
                            <div key={date} className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{new Date(date).toLocaleDateString()}</span>
                              <span className="font-semibold">{count} signups</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Video Accesses</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(trends.videoAccessesByDate)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .slice(0, 10)
                          .map(([date, count]) => (
                            <div key={date} className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{new Date(date).toLocaleDateString()}</span>
                              <span className="font-semibold">{count} accesses</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Course Completions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(trends.completionsByDate)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .slice(0, 10)
                          .map(([date, count]) => (
                            <div key={date} className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{new Date(date).toLocaleDateString()}</span>
                              <span className="font-semibold">{count} completions</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="text-lg">Posts Created</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(trends.postsByDate)
                          .sort(([a], [b]) => b.localeCompare(a))
                          .slice(0, 10)
                          .map(([date, count]) => (
                            <div key={date} className="flex items-center justify-between text-sm">
                              <span className="text-white/70">{new Date(date).toLocaleDateString()}</span>
                              <span className="font-semibold">{count} posts</span>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RequireAdmin>
  )
}

