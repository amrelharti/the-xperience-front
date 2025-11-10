"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Trophy,
  Clock,
  RefreshCw,
  School,
  Video,
  Award,
  TrendingUp,
  Search,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
  PlayCircle,
  Download
} from "lucide-react"
import RequireAdmin from "@/app/components/RequireAdmin"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"
import Link from "next/link"

export default function StudentAnalysisHub() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [students, setStudents] = useState<any[]>([])
  const [summary, setSummary] = useState<any>({})
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("all")
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [availableFilters, setAvailableFilters] = useState<any>({})

  useEffect(() => {
    loadFilters()
    loadData()
  }, [])

  useEffect(() => {
    loadData()
  }, [selectedClassId, selectedTrainingId])

  const loadFilters = async () => {
    try {
      const response = await fetch("/api/admin/analytics/filters", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableFilters(data)
      }
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      await Promise.all([loadStudents(), loadSummary()])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadStudents = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedClassId !== "all") params.append("classId", selectedClassId)
      if (selectedTrainingId !== "all") params.append("trainingId", selectedTrainingId)
      
      const url = params.toString() 
        ? `/api/admin/student-analysis/students?${params.toString()}`
        : "/api/admin/student-analysis/students"
      
      const response = await fetch(url, { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setStudents(data.students)
      }
    } catch (error) {
      console.error("Error loading students:", error)
    }
  }

  const loadSummary = async () => {
    try {
      const response = await fetch("/api/admin/student-analysis/summary", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setSummary(data)
      }
    } catch (error) {
      console.error("Error loading summary:", error)
    }
  }

  const toggleExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  const clearFilters = () => {
    setSelectedClassId("all")
    setSelectedTrainingId("all")
    setSearchQuery("")
  }

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return "text-green-600"
    if (percentage >= 50) return "text-blue-600"
    if (percentage >= 25) return "text-yellow-600"
    return "text-orange-600"
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-800 border-yellow-400"
    if (rank === 2) return "bg-gray-200 text-gray-800 border-gray-400"
    if (rank === 3) return "bg-orange-100 text-orange-800 border-orange-400"
    if (rank <= 10) return "bg-purple-100 text-purple-800 border-purple-400"
    return "bg-blue-100 text-blue-800 border-blue-400"
  }

  if (loading) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-screen">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </RequireAdmin>
    )
  }

  return (
    <RequireAdmin>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex-1 min-w-0">
                <Link href="/admin" className="text-lg sm:text-2xl font-bold text-gray-900 block truncate">
                  <span className="hidden sm:inline">Student Analysis Hub</span>
                  <span className="sm:hidden">Students</span>
                </Link>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">Complete 360° view of each student</p>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={loadData}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <UserDropdown user={user} />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Total Students</span>
                  <span className="sm:hidden">Total</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold">{summary.totalStudents || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-green-600">{summary.activeStudents || 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Inactive
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-orange-600">{summary.inactiveStudents || 0}</div>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-1">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">High Performers</span>
                  <span className="sm:hidden">Top</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">{summary.highPerformers || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg ≥4.0</p>
              </CardContent>
            </Card>

            <Card className="hidden sm:block">
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4" />
                  Needs Help
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-red-600">{summary.needsHelp || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">Avg &lt;3.0</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="mb-4 sm:mb-6">
            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Search Student</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name or email..."
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Filter by Class</label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Classes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {availableFilters.classes?.map((cls: any) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Filter by Training</label>
                  <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Trainings" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Trainings</SelectItem>
                      {availableFilters.trainings?.map((training: any) => (
                        <SelectItem key={training.id} value={training.id}>
                          {training.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  {(selectedClassId !== "all" || selectedTrainingId !== "all" || searchQuery) && (
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Student Cards */}
          <div className="space-y-4">
            {filteredStudents.map((student, index) => (
              <Card key={student.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-4 sm:p-6">
                  {/* Student Header */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => toggleExpand(student.id)}
                  >
                    <div className="flex flex-col gap-4 mb-4">
                      {/* Student Info - Mobile Stacked, Desktop Side-by-side */}
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg sm:text-xl font-bold flex-shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base sm:text-xl font-bold truncate">{student.name}</h3>
                            {expandedStudent === student.id ? (
                              <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-muted-foreground truncate">{student.email}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {student.enrollments?.map((enrollment: any) => (
                              <Badge key={enrollment.classId} variant="outline" className="border-blue-500 text-blue-700 text-xs">
                                <School className="h-3 w-3 mr-1" />
                                <span className="hidden sm:inline">{enrollment.className}</span>
                                <span className="sm:hidden">{enrollment.className.substring(0, 15)}{enrollment.className.length > 15 ? '...' : ''}</span>
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats - Responsive Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 text-center">
                        <div className="p-2 sm:p-0">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-yellow-600">#{student.globalRank}</div>
                          <div className="text-xs text-muted-foreground">Rank</div>
                        </div>
                        <div className="p-2 sm:p-0">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600">{student.leaderboardStats?.totalPoints || 0}</div>
                          <div className="text-xs text-muted-foreground">Points</div>
                        </div>
                        <div className="p-2 sm:p-0">
                          <div className={`text-xl sm:text-2xl lg:text-3xl font-bold ${getStatusColor((student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0).replace('text-', 'text-').replace('-400', '-600')}`}>
                            {student.videoStatistics?.completed || 0}/{student.videoStatistics?.total || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Videos</div>
                        </div>
                        <div className="p-2 sm:p-0">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
                            {student.leaderboardStats?.averageScore || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Avg Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Overall Progress</span>
                        <span className="font-semibold">
                          {Math.round((student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="p-3 bg-green-50 rounded border border-green-200">
                        <div className="text-muted-foreground text-xs">Watched</div>
                        <div className="font-semibold text-green-600">{student.videoStatistics?.watched || 0}</div>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                        <div className="text-muted-foreground text-xs">In Progress</div>
                        <div className="font-semibold text-yellow-600">{student.videoStatistics?.inProgress || 0}</div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="text-muted-foreground text-xs">Not Started</div>
                        <div className="font-semibold text-orange-600">{student.videoStatistics?.notStarted || 0}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-muted-foreground text-xs">Watch Time</div>
                        <div className="font-semibold text-blue-600">{student.videoStatistics?.totalWatchTimeHours || 0}h</div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded border border-purple-200">
                        <div className="text-muted-foreground text-xs">Assignments</div>
                        <div className="font-semibold text-purple-600">{student.leaderboardStats?.assignmentCount || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedStudent === student.id && (
                    <div className="mt-6 pt-6 border-t">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Videos Section */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                            <Video className="h-5 w-5 text-blue-600" />
                            Video Progress ({student.videos?.length || 0} total)
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {student.videos?.map((video: any) => (
                              <div 
                                key={video.courseId}
                                className={`p-3 rounded border ${
                                  video.completed 
                                    ? "bg-green-50 border-green-200" 
                                    : video.watched 
                                      ? "bg-yellow-50 border-yellow-200"
                                      : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm text-gray-900">{video.title}</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {video.moduleName} • {video.trainingName}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    {video.completed ? (
                                      <Badge className="bg-green-100 text-green-700 border-green-300">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Done
                                      </Badge>
                                    ) : video.watched ? (
                                      <div>
                                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                          <PlayCircle className="h-3 w-3 mr-1" />
                                          {Math.round(video.completionPercentage)}%
                                        </Badge>
                                        <p className="text-xs text-muted-foreground mt-1">
                                          {Math.round(video.watchTimeSeconds / 60)}min
                                        </p>
                                      </div>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-700 border-gray-300">
                                        <Clock className="h-3 w-3 mr-1" />
                                        Not Started
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Performance Section */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-900">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            Performance & Ranking
                          </h4>
                          <div className="space-y-4">
                            {/* Leaderboard Stats */}
                            <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-muted-foreground">Global Rank</span>
                                <Badge className={getRankBadgeColor(student.globalRank)}>
                                  #{student.globalRank} of {student.totalStudents}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="text-muted-foreground">Total Points</div>
                                  <div className="text-2xl font-bold text-purple-600">
                                    {student.leaderboardStats?.totalPoints || 0}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-muted-foreground">Avg Score</div>
                                  <div className="text-2xl font-bold text-blue-600">
                                    {student.leaderboardStats?.averageScore || 0}/5
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Video Stats */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <h5 className="font-semibold mb-3 text-sm text-gray-900">Video Engagement</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Total Available</span>
                                  <span className="font-semibold text-gray-900">{student.videoStatistics?.total || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-600" />
                                    Completed
                                  </span>
                                  <span className="font-semibold text-green-600">{student.videoStatistics?.completed || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3 text-yellow-600" />
                                    In Progress
                                  </span>
                                  <span className="font-semibold text-yellow-600">{student.videoStatistics?.inProgress || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-blue-600" />
                                    Watched
                                  </span>
                                  <span className="font-semibold text-blue-600">{student.videoStatistics?.watched || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Not Started</span>
                                  <span className="font-semibold text-orange-600">{student.videoStatistics?.notStarted || 0}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t">
                                  <span className="text-muted-foreground">Total Watch Time</span>
                                  <span className="font-semibold text-gray-900">{student.videoStatistics?.totalWatchTimeHours || 0} hours</span>
                                </div>
                              </div>
                            </div>

                            {/* Enrollments */}
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <h5 className="font-semibold mb-3 text-sm text-gray-900">Enrollments</h5>
                              <div className="space-y-2">
                                {student.enrollments?.map((enrollment: any) => (
                                  <div key={enrollment.classId} className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-gray-900 font-medium">{enrollment.className}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{enrollment.trainingName}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Last Activity */}
                            {student.lastActivity && (
                              <div className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Last Activity</span>
                                  <span className="font-semibold text-gray-900">
                                    {new Date(student.lastActivity).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredStudents.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No students found matching your filters</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </RequireAdmin>
  )
}

