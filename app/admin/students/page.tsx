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
    if (percentage >= 75) return "text-green-400"
    if (percentage >= 50) return "text-blue-400"
    if (percentage >= 25) return "text-yellow-400"
    return "text-orange-400"
  }

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30"
    if (rank === 2) return "bg-gray-400/20 text-gray-300 border-gray-400/30"
    if (rank === 3) return "bg-orange-500/20 text-orange-300 border-orange-500/30"
    if (rank <= 10) return "bg-purple-500/20 text-purple-300 border-purple-500/30"
    return "bg-blue-500/20 text-blue-300 border-blue-500/30"
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
              <div>
                <Link href="/admin" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Student Analysis Hub
                </Link>
                <p className="text-sm text-white/60 mt-1">Complete 360° view of each student</p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={loadData}
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total Students
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.totalStudents || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/20 to-green-600/20 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Active (7d)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.activeStudents || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Inactive
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.inactiveStudents || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  High Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.highPerformers || 0}</div>
                <p className="text-xs text-white/60 mt-1">Avg score ≥4.0</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-500/20 to-red-600/20 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Needs Help
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{summary.needsHelp || 0}</div>
                <p className="text-xs text-white/60 mt-1">Avg score &lt;3.0</p>
              </CardContent>
            </Card>
          </div>

          {/* Filters & Search */}
          <Card className="bg-black/30 border-white/10 mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm text-white/70 mb-2 block">Search Student</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Name or email..."
                      className="pl-10 bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">Filter by Class</label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger className="bg-white/5 border-white/10">
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
                  <label className="text-sm text-white/70 mb-2 block">Filter by Training</label>
                  <Select value={selectedTrainingId} onValueChange={setSelectedTrainingId}>
                    <SelectTrigger className="bg-white/5 border-white/10">
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
                      className="w-full border-white/20 hover:bg-white/10"
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
              <Card key={student.id} className="bg-black/30 border-white/10 hover:bg-black/40 transition-all">
                <CardContent className="p-6">
                  {/* Student Header */}
                  <div 
                    className="cursor-pointer"
                    onClick={() => toggleExpand(student.id)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-xl font-bold">{student.name}</h3>
                            {expandedStudent === student.id ? (
                              <ChevronUp className="h-5 w-5 text-white/50" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-white/50" />
                            )}
                          </div>
                          <p className="text-sm text-white/60">{student.email}</p>
                          <div className="flex items-center gap-3 mt-2">
                            {student.enrollments?.map((enrollment: any) => (
                              <Badge key={enrollment.classId} variant="outline" className="border-blue-400/30 text-blue-300">
                                <School className="h-3 w-3 mr-1" />
                                {enrollment.className}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-4 gap-6 text-center">
                        <div>
                          <div className="text-3xl font-bold text-yellow-400">#{student.globalRank}</div>
                          <div className="text-xs text-white/70">Rank</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-purple-400">{student.leaderboardStats?.totalPoints || 0}</div>
                          <div className="text-xs text-white/70">Points</div>
                        </div>
                        <div>
                          <div className={`text-3xl font-bold ${getStatusColor((student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0)}`}>
                            {student.videoStatistics?.completed || 0}/{student.videoStatistics?.total || 0}
                          </div>
                          <div className="text-xs text-white/70">Videos</div>
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-blue-400">
                            {student.leaderboardStats?.averageScore || 0}
                          </div>
                          <div className="text-xs text-white/70">Avg Score</div>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-white/70">Overall Progress</span>
                        <span className="font-semibold">
                          {Math.round((student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0)}%
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(100, (student.videoStatistics?.completed / student.videoStatistics?.total * 100) || 0)}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                      <div className="p-3 bg-white/5 rounded">
                        <div className="text-white/70 text-xs">Watched</div>
                        <div className="font-semibold text-green-400">{student.videoStatistics?.watched || 0}</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <div className="text-white/70 text-xs">In Progress</div>
                        <div className="font-semibold text-yellow-400">{student.videoStatistics?.inProgress || 0}</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <div className="text-white/70 text-xs">Not Started</div>
                        <div className="font-semibold text-orange-400">{student.videoStatistics?.notStarted || 0}</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <div className="text-white/70 text-xs">Watch Time</div>
                        <div className="font-semibold">{student.videoStatistics?.totalWatchTimeHours || 0}h</div>
                      </div>
                      <div className="p-3 bg-white/5 rounded">
                        <div className="text-white/70 text-xs">Assignments</div>
                        <div className="font-semibold">{student.leaderboardStats?.assignmentCount || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedStudent === student.id && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Videos Section */}
                        <div>
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Video className="h-5 w-5 text-blue-400" />
                            Video Progress ({student.videos?.length || 0} total)
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {student.videos?.map((video: any) => (
                              <div 
                                key={video.courseId}
                                className={`p-3 rounded border ${
                                  video.completed 
                                    ? "bg-green-500/10 border-green-500/20" 
                                    : video.watched 
                                      ? "bg-yellow-500/10 border-yellow-500/20"
                                      : "bg-white/5 border-white/10"
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="font-medium text-sm">{video.title}</p>
                                    <p className="text-xs text-white/60 mt-1">
                                      {video.moduleName} • {video.trainingName}
                                    </p>
                                  </div>
                                  <div className="text-right ml-3">
                                    {video.completed ? (
                                      <Badge className="bg-green-500/20 text-green-300">
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        Done
                                      </Badge>
                                    ) : video.watched ? (
                                      <div>
                                        <Badge className="bg-yellow-500/20 text-yellow-300">
                                          <PlayCircle className="h-3 w-3 mr-1" />
                                          {Math.round(video.completionPercentage)}%
                                        </Badge>
                                        <p className="text-xs text-white/50 mt-1">
                                          {Math.round(video.watchTimeSeconds / 60)}min
                                        </p>
                                      </div>
                                    ) : (
                                      <Badge className="bg-gray-500/20 text-gray-300">
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
                          <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-400" />
                            Performance & Ranking
                          </h4>
                          <div className="space-y-4">
                            {/* Leaderboard Stats */}
                            <div className="p-4 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
                              <div className="flex items-center justify-between mb-3">
                                <span className="text-white/70">Global Rank</span>
                                <Badge className={getRankBadgeColor(student.globalRank)}>
                                  #{student.globalRank} of {student.totalStudents}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <div className="text-white/70">Total Points</div>
                                  <div className="text-2xl font-bold text-purple-400">
                                    {student.leaderboardStats?.totalPoints || 0}
                                  </div>
                                </div>
                                <div>
                                  <div className="text-white/70">Avg Score</div>
                                  <div className="text-2xl font-bold text-blue-400">
                                    {student.leaderboardStats?.averageScore || 0}/5
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Video Stats */}
                            <div className="p-4 bg-white/5 rounded-lg">
                              <h5 className="font-semibold mb-3 text-sm">Video Engagement</h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/70">Total Available</span>
                                  <span className="font-semibold">{student.videoStatistics?.total || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3 text-green-400" />
                                    Completed
                                  </span>
                                  <span className="font-semibold text-green-400">{student.videoStatistics?.completed || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <PlayCircle className="h-3 w-3 text-yellow-400" />
                                    In Progress
                                  </span>
                                  <span className="font-semibold text-yellow-400">{student.videoStatistics?.inProgress || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70 flex items-center gap-1">
                                    <Eye className="h-3 w-3 text-blue-400" />
                                    Watched
                                  </span>
                                  <span className="font-semibold text-blue-400">{student.videoStatistics?.watched || 0}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/70">Not Started</span>
                                  <span className="font-semibold text-orange-400">{student.videoStatistics?.notStarted || 0}</span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-white/10">
                                  <span className="text-white/70">Total Watch Time</span>
                                  <span className="font-semibold">{student.videoStatistics?.totalWatchTimeHours || 0} hours</span>
                                </div>
                              </div>
                            </div>

                            {/* Enrollments */}
                            <div className="p-4 bg-white/5 rounded-lg">
                              <h5 className="font-semibold mb-3 text-sm">Enrollments</h5>
                              <div className="space-y-2">
                                {student.enrollments?.map((enrollment: any) => (
                                  <div key={enrollment.classId} className="text-sm">
                                    <div className="flex items-center justify-between">
                                      <span className="text-white/70">{enrollment.className}</span>
                                      <span className="text-xs text-white/50">
                                        {new Date(enrollment.enrolledAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                    <p className="text-xs text-white/50">{enrollment.trainingName}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Last Activity */}
                            {student.lastActivity && (
                              <div className="p-4 bg-white/5 rounded-lg">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-white/70">Last Activity</span>
                                  <span className="font-semibold">
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
            <Card className="bg-black/30 border-white/10">
              <CardContent className="py-12 text-center">
                <Users className="h-12 w-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No students found matching your filters</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </RequireAdmin>
  )
}

