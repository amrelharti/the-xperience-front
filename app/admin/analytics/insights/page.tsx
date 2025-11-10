"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Trophy,
  Clock,
  RefreshCw,
  School,
  GraduationCap,
  Award,
  TrendingDown,
  Calendar,
  Mail,
  Filter,
  X,
  Video,
  Play,
  ChevronDown,
  ChevronUp,
  Eye
} from "lucide-react"
import RequireAdmin from "@/app/components/RequireAdmin"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"
import Link from "next/link"

export default function Phase1Insights() {
  const { user } = useUser()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("rosters")
  
  // Data states
  const [rosters, setRosters] = useState<any[]>([])
  const [completions, setCompletions] = useState<any[]>([])
  const [inactiveStudents, setInactiveStudents] = useState<any>({})
  const [progressOverview, setProgressOverview] = useState<any>({})
  const [scores, setScores] = useState<any>({})
  const [videoActivity, setVideoActivity] = useState<any[]>([])
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null)
  const [selectedStudents, setSelectedStudents] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState(false)
  const [comparisonData, setComparisonData] = useState<any[]>([])
  
  // Filter options
  const [availableFilters, setAvailableFilters] = useState<any>({})
  
  // Filter states
  const [inactiveDays, setInactiveDays] = useState(7)
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("all")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("all")

  useEffect(() => {
    loadFilters()
    loadAllData()
  }, [])
  
  useEffect(() => {
    if (activeTab === "progress") {
      loadProgressOverview()
    }
  }, [selectedClassId, selectedTrainingId, selectedModuleId, activeTab])

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadRosters(),
        loadCompletions(),
        loadInactiveStudents(inactiveDays),
        loadProgressOverview(),
        loadScores(),
        loadVideoActivity()
      ])
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRosters = async (classId?: string) => {
    try {
      const url = classId 
        ? `/api/admin/analytics/class-rosters?classId=${classId}`
        : `/api/admin/analytics/class-rosters`
      const response = await fetch(url, { credentials: "include" })
      if (response.ok) {
        const data = await response.json()
        setRosters(data.rosters)
      }
    } catch (error) {
      console.error("Error loading rosters:", error)
    }
  }

  const loadCompletions = async () => {
    try {
      const response = await fetch("/api/admin/analytics/completions", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setCompletions(data.completions)
      }
    } catch (error) {
      console.error("Error loading completions:", error)
    }
  }

  const loadInactiveStudents = async (days: number) => {
    try {
      const response = await fetch(`/api/admin/analytics/inactive-students?days=${days}`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setInactiveStudents(data)
      }
    } catch (error) {
      console.error("Error loading inactive students:", error)
    }
  }

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

  const loadProgressOverview = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedClassId && selectedClassId !== "all") params.append("classId", selectedClassId)
      if (selectedTrainingId && selectedTrainingId !== "all") params.append("trainingId", selectedTrainingId)
      if (selectedModuleId && selectedModuleId !== "all") params.append("moduleId", selectedModuleId)
      
      const url = params.toString() 
        ? `/api/admin/analytics/progress-overview?${params.toString()}`
        : "/api/admin/analytics/progress-overview"
      
      const response = await fetch(url, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setProgressOverview(data)
      }
    } catch (error) {
      console.error("Error loading progress overview:", error)
    }
  }
  
  const clearFilters = () => {
    setSelectedClassId("all")
    setSelectedTrainingId("all")
    setSelectedModuleId("all")
  }
  
  const hasActiveFilters = selectedClassId !== "all" || selectedTrainingId !== "all" || selectedModuleId !== "all"
  
  const getFilterLabel = () => {
    const parts = []
    if (progressOverview.filters?.class) parts.push(progressOverview.filters.class.name)
    if (progressOverview.filters?.training) parts.push(progressOverview.filters.training.title)
    if (progressOverview.filters?.module) parts.push(progressOverview.filters.module.title)
    return parts.length > 0 ? parts.join(" → ") : "All Students"
  }

  const loadScores = async () => {
    try {
      const response = await fetch("/api/admin/analytics/scores", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setScores(data)
      }
    } catch (error) {
      console.error("Error loading scores:", error)
    }
  }

  const loadVideoActivity = async () => {
    try {
      const response = await fetch("/api/admin/student-video-activity", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setVideoActivity(data.students)
      }
    } catch (error) {
      console.error("Error loading video activity:", error)
    }
  }

  const toggleStudentExpand = (studentId: string) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId)
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const loadComparison = async () => {
    if (selectedStudents.length === 0) return
    
    try {
      const params = selectedStudents.map(id => `studentIds=${id}`).join('&')
      const response = await fetch(`/api/admin/student-video-activity/compare?${params}`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setComparisonData(data.students)
        setComparisonMode(true)
      }
    } catch (error) {
      console.error("Error loading comparison:", error)
    }
  }

  const exitComparison = () => {
    setComparisonMode(false)
    setSelectedStudents([])
    setComparisonData([])
  }

  const handleInactiveDaysChange = async (days: number) => {
    setInactiveDays(days)
    await loadInactiveStudents(days)
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
          <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 sm:gap-4">
                <Link href="/admin/analytics/dashboard" className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  <span className="hidden sm:inline">Critical Insights</span>
                  <span className="sm:hidden">Insights</span>
                </Link>
                <Badge variant="outline" className="border-green-400 text-green-400 text-xs">
                  Phase 1
                </Badge>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={loadAllData}
                  variant="outline"
                  size="sm"
                  className="border-white/20 hover:bg-white/10"
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 sm:space-y-6">
            {/* Mobile: Horizontal scrolling tabs */}
            <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
              <TabsList className="bg-black/30 border border-white/10 inline-flex min-w-full sm:min-w-0 w-max sm:w-auto">
                <TabsTrigger value="rosters" className="text-xs sm:text-sm">
                  <School className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Class Rosters</span>
                  <span className="sm:hidden">Rosters</span>
                </TabsTrigger>
                <TabsTrigger value="videos" className="text-xs sm:text-sm">
                  <Video className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Video Activity</span>
                  <span className="sm:hidden">Videos</span>
                </TabsTrigger>
                <TabsTrigger value="completions" className="text-xs sm:text-sm">
                  <GraduationCap className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Completions</span>
                  <span className="sm:hidden">Complete</span>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="text-xs sm:text-sm">
                  <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Inactive Students</span>
                  <span className="sm:hidden">Inactive</span>
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-xs sm:text-sm">
                  <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Progress Overview</span>
                  <span className="sm:hidden">Progress</span>
                </TabsTrigger>
                <TabsTrigger value="scores" className="text-xs sm:text-sm">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  Scores
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Class Rosters Tab */}
            <TabsContent value="rosters" className="space-y-4 sm:space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <School className="h-4 w-4 sm:h-5 sm:w-5" />
                    Class Rosters
                  </CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    See all enrolled students with their progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {rosters.map((roster) => (
                    <div key={roster.classId} className="mb-6 sm:mb-8">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 p-3 sm:p-4 bg-white/5 rounded-lg">
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold">{roster.className}</h3>
                          <p className="text-xs sm:text-sm text-white/60">
                            {roster.startDate} {roster.endDate ? `- ${roster.endDate}` : "- Ongoing"}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="text-2xl sm:text-3xl font-bold">{roster.totalStudents}</div>
                          <div className="text-xs sm:text-sm text-white/70">Students</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        {roster.students.map((student: any) => (
                          <div
                            key={student.id}
                            className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base truncate">{student.name}</h4>
                                <p className="text-xs sm:text-sm text-white/60 truncate">{student.email}</p>
                                <p className="text-xs text-white/50 mt-1">
                                  Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0 sm:text-right sm:ml-4">
                                <div className="flex-1 sm:flex-none">
                                  <div className="text-xl sm:text-2xl font-bold">{student.completionRate}%</div>
                                  <div className="text-xs sm:text-sm text-white/70">
                                    {student.coursesCompleted}/{student.coursesTotal} courses
                                  </div>
                                </div>
                                {student.lastActivity && (
                                  <p className="text-xs text-white/50 sm:mt-1">
                                    Last: {new Date(student.lastActivity).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Video Activity Tab */}
            <TabsContent value="videos" className="space-y-4 sm:space-y-6">
              {/* Comparison Mode Toggle */}
              {!comparisonMode && (
                <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
                  <CardContent className="p-4 sm:pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold mb-1">Compare Students</h3>
                        <p className="text-xs sm:text-sm text-white/70">
                          {selectedStudents.length === 0 
                            ? "Select students below to compare" 
                            : `${selectedStudents.length} student${selectedStudents.length > 1 ? 's' : ''} selected`}
                        </p>
                      </div>
                      {selectedStudents.length > 0 && (
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            onClick={loadComparison}
                            disabled={selectedStudents.length < 2}
                            size="sm"
                            className="bg-blue-500 hover:bg-blue-600 flex-1 sm:flex-none"
                          >
                            <span className="hidden sm:inline">Compare {selectedStudents.length} Students</span>
                            <span className="sm:hidden">Compare ({selectedStudents.length})</span>
                          </Button>
                          <Button
                            onClick={() => setSelectedStudents([])}
                            variant="outline"
                            size="sm"
                            className="border-white/20 hover:bg-white/10"
                          >
                            Clear
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Comparison View */}
              {comparisonMode ? (
                <Card className="bg-black/30 border-white/10">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                          Comparing {comparisonData.length} Students
                        </CardTitle>
                        <CardDescription className="text-white/60 text-sm">
                          Side-by-side video activity comparison
                        </CardDescription>
                      </div>
                      <Button
                        onClick={exitComparison}
                        variant="outline"
                        size="sm"
                        className="border-white/20 hover:bg-white/10 w-full sm:w-auto"
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                        Exit Comparison
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                      {comparisonData.map((student) => (
                        <div key={student.id} className="p-3 sm:p-4 bg-white/5 rounded-lg border border-white/10">
                          <h4 className="font-bold text-base sm:text-lg mb-3 truncate">{student.name}</h4>
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-center">
                              <div className="p-2 bg-green-500/20 rounded">
                                <div className="text-xl sm:text-2xl font-bold text-green-400">{student.videosWatched}</div>
                                <div className="text-xs text-white/70">Watched</div>
                              </div>
                              <div className="p-2 bg-blue-500/20 rounded">
                                <div className="text-xl sm:text-2xl font-bold text-blue-400">{student.videosCompleted}</div>
                                <div className="text-xs text-white/70">Completed</div>
                              </div>
                              <div className="p-2 bg-orange-500/20 rounded">
                                <div className="text-xl sm:text-2xl font-bold text-orange-400">{student.videosNotWatched}</div>
                                <div className="text-xs text-white/70">Not Watched</div>
                              </div>
                              <div className="p-2 bg-purple-500/20 rounded">
                                <div className="text-xl sm:text-2xl font-bold text-purple-400">{student.watchTimeHours}h</div>
                                <div className="text-xs text-white/70">Watch Time</div>
                              </div>
                            </div>
                            <div className="text-xs text-white/60 space-y-1">
                              <p className="truncate">Classes: {student.enrolledClasses?.map((c: any) => c.name).join(", ")}</p>
                              <p>Completion: {Math.round((student.videosCompleted / student.totalVideosAvailable) * 100)}%</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
              <Card className="bg-black/30 border-white/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Video className="h-4 w-4 sm:h-5 sm:w-5" />
                    Student Video Activity
                  </CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    Track videos. Select students to compare.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3 sm:p-6">
                  <div className="space-y-2 sm:space-y-3">
                    {videoActivity.map((student) => (
                      <div key={student.id} className="bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                        {/* Student Header */}
                        <div className="p-3 sm:p-4 hover:bg-white/10 transition-colors">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <input
                              type="checkbox"
                              checked={selectedStudents.includes(student.id)}
                              onChange={() => toggleStudentSelection(student.id)}
                              className="w-4 h-4 sm:w-5 sm:h-5 rounded mt-1"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div 
                              className="flex-1 cursor-pointer min-w-0"
                              onClick={() => toggleStudentExpand(student.id)}
                            >
                              <div className="flex flex-col gap-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-sm sm:text-lg truncate">{student.name}</h4>
                                      {expandedStudent === student.id ? (
                                        <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 text-white/50 flex-shrink-0" />
                                      ) : (
                                        <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-white/50 flex-shrink-0" />
                                      )}
                                    </div>
                                    <p className="text-xs sm:text-sm text-white/60 truncate">{student.email}</p>
                                    {student.enrolledClasses && student.enrolledClasses.length > 0 && (
                                      <div className="flex items-center gap-2 mt-1 sm:mt-2">
                                        <School className="h-3 w-3 text-white/50 flex-shrink-0" />
                                        <span className="text-xs text-white/50 truncate">
                                          {student.enrolledClasses.join(", ")}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Stats - Stacked on mobile, side-by-side on desktop */}
                                <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                                  <div className="p-2 bg-green-500/10 rounded">
                                    <div className="text-lg sm:text-2xl font-bold text-green-400">{student.videosWatched}</div>
                                    <div className="text-xs text-white/70">Watched</div>
                                  </div>
                                  <div className="p-2 bg-blue-500/10 rounded">
                                    <div className="text-lg sm:text-2xl font-bold text-blue-400">{student.videosCompleted}</div>
                                    <div className="text-xs text-white/70">Complete</div>
                                  </div>
                                  <div className="p-2 bg-orange-500/10 rounded">
                                    <div className="text-lg sm:text-2xl font-bold text-orange-400">{student.videosNotWatched}</div>
                                    <div className="text-xs text-white/70">Not Yet</div>
                                  </div>
                                </div>
                                
                                {/* Additional info */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs text-white/50">
                                  <span>Watch time: {student.totalWatchTimeMinutes} min</span>
                                  {student.lastVideoActivity && (
                                    <span className="hidden sm:inline">•</span>
                                  )}
                                  {student.lastVideoActivity && (
                                    <span>Last: {new Date(student.lastVideoActivity).toLocaleDateString()}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details */}
                        {expandedStudent === student.id && (
                          <div className="p-3 sm:p-4 bg-black/20 border-t border-white/10">
                            {/* Watched Videos */}
                            {student.watchedVideos && student.watchedVideos.length > 0 && (
                              <div className="mb-6">
                                <h5 className="font-semibold mb-3 text-green-400 flex items-center gap-2">
                                  <Eye className="h-4 w-4" />
                                  Watched Videos ({student.watchedVideos.length})
                                </h5>
                                <div className="space-y-2">
                                  {student.watchedVideos.map((video: any) => (
                                    <div key={video.courseId} className="p-3 bg-white/5 rounded border border-green-500/20">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <p className="font-medium">{video.title}</p>
                                          <p className="text-xs text-white/60 mt-1">
                                            {video.moduleName} • {video.trainingName}
                                          </p>
                                        </div>
                                        <div className="text-right ml-4">
                                          <Badge className={
                                            video.status === "COMPLETED" 
                                              ? "bg-green-500/20 text-green-300" 
                                              : "bg-yellow-500/20 text-yellow-300"
                                          }>
                                            {video.status}
                                          </Badge>
                                          <div className="text-xs text-white/60 mt-1">
                                            {Math.round(video.completionPercentage || 0)}% complete
                                          </div>
                                          <div className="text-xs text-white/50">
                                            {Math.round((video.watchTimeSeconds || 0) / 60)} min watched
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Not Watched Videos */}
                            {student.notWatchedVideos && student.notWatchedVideos.length > 0 && (
                              <div>
                                <h5 className="font-semibold mb-3 text-orange-400 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Not Watched Yet ({student.notWatchedVideos.length})
                                </h5>
                                <div className="space-y-2">
                                  {student.notWatchedVideos.slice(0, 10).map((video: any) => (
                                    <div key={video.courseId} className="p-3 bg-white/5 rounded border border-orange-500/20">
                                      <p className="font-medium">{video.title}</p>
                                      <p className="text-xs text-white/60 mt-1">
                                        {video.moduleName} • {video.trainingName}
                                      </p>
                                      <p className="text-xs text-white/50 mt-1">
                                        Duration: {Math.round(video.durationSeconds / 60)} minutes
                                      </p>
                                    </div>
                                  ))}
                                  {student.notWatchedVideos.length > 10 && (
                                    <p className="text-xs text-white/50 text-center py-2">
                                      + {student.notWatchedVideos.length - 10} more videos
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              )}
            </TabsContent>

            {/* Completions Tab */}
            <TabsContent value="completions" className="space-y-4 sm:space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader className="p-4 sm:p-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5" />
                    Module Completions
                  </CardTitle>
                  <CardDescription className="text-white/60 text-sm">
                    Students who completed entire modules
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {completions.map((module) => (
                      <div key={module.moduleId} className="p-4 sm:p-6 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-0 mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold truncate">{module.moduleName}</h3>
                            <p className="text-xs sm:text-sm text-white/60 truncate">{module.trainingName}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="text-2xl sm:text-3xl font-bold text-green-400">{module.studentsCompleted}</div>
                            <div className="text-xs sm:text-sm text-white/70">Completed</div>
                          </div>
                        </div>
                        
                        {module.completedBy && module.completedBy.length > 0 ? (
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-white/80 mb-2">Completed By:</h4>
                            {module.completedBy.map((student: any) => (
                              <div
                                key={student.id}
                                className="p-3 bg-white/5 rounded border border-green-500/20 flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium">{student.name}</p>
                                  <p className="text-xs text-white/60">{student.className}</p>
                                </div>
                                <div className="text-right">
                                  {student.completedAt && (
                                    <div className="flex items-center gap-2">
                                      <CheckCircle className="h-4 w-4 text-green-400" />
                                      <span className="text-sm">
                                        {new Date(student.completedAt).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-white/50 italic">No students have completed this module yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inactive Students Tab */}
            <TabsContent value="inactive" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-orange-400" />
                        Inactive Students Alert
                      </CardTitle>
                      <CardDescription className="text-white/60">
                        Students who need re-engagement
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {[7, 14, 30, 60].map((days) => (
                        <Button
                          key={days}
                          onClick={() => handleInactiveDaysChange(days)}
                          variant={inactiveDays === days ? "default" : "outline"}
                          size="sm"
                          className={inactiveDays === days ? "" : "border-white/20 hover:bg-white/10"}
                        >
                          {days}d
                        </Button>
                      ))}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-6 p-4 bg-orange-500/20 rounded-lg border border-orange-500/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-8 w-8 text-orange-400" />
                        <div>
                          <p className="text-xl font-bold">{inactiveStudents.totalInactive || 0} Students</p>
                          <p className="text-sm text-white/70">
                            Inactive for {inactiveStudents.daysThreshold || 7}+ days
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        className="border-orange-400 text-orange-400 hover:bg-orange-400/20"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Send Reminder Emails
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {inactiveStudents.inactiveStudents && inactiveStudents.inactiveStudents.map((student: any) => (
                      <div
                        key={student.id}
                        className="p-4 bg-white/5 rounded-lg border border-orange-500/20 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{student.name}</h4>
                              {student.daysSinceActivity > 30 && (
                                <Badge variant="destructive">Critical</Badge>
                              )}
                            </div>
                            <p className="text-sm text-white/60">{student.email}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                              <span>{student.coursesStarted} courses started</span>
                              <span>{student.coursesCompleted} completed</span>
                              {student.enrolledClasses && student.enrolledClasses.length > 0 && (
                                <span className="flex items-center gap-1">
                                  <School className="h-3 w-3" />
                                  {student.enrolledClasses.join(", ")}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold text-orange-400">
                              {student.daysSinceActivity > 0 
                                ? `${student.daysSinceActivity}d` 
                                : "Never"}
                            </div>
                            <div className="text-sm text-white/70">Since last activity</div>
                            {student.lastActivity && (
                              <p className="text-xs text-white/50 mt-1">
                                {new Date(student.lastActivity).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Progress Overview Tab */}
            <TabsContent value="progress" className="space-y-6">
              {/* Filters */}
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filter Progress View
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    View progress for specific class, training, or module
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Class</label>
                      <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Classes</SelectItem>
                          {availableFilters.classes?.map((cls: any) => (
                            <SelectItem key={cls.id} value={cls.id}>
                              {cls.name} {!cls.isActive && "(Inactive)"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Training</label>
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
                    
                    <div>
                      <label className="text-sm text-white/70 mb-2 block">Module</label>
                      <Select value={selectedModuleId} onValueChange={setSelectedModuleId}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="All Modules" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Modules</SelectItem>
                          {availableFilters.modules
                            ?.filter((mod: any) => selectedTrainingId === "all" || mod.trainingId === selectedTrainingId)
                            .map((mod: any) => (
                              <SelectItem key={mod.id} value={mod.id}>
                                {mod.title} ({mod.trainingName})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-end">
                      {hasActiveFilters && (
                        <Button
                          onClick={clearFilters}
                          variant="outline"
                          className="w-full border-white/20 hover:bg-white/10"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Clear Filters
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {hasActiveFilters && (
                    <div className="mt-4 p-3 bg-purple-500/20 rounded border border-purple-500/30">
                      <p className="text-sm">
                        <span className="text-white/70">Showing progress for: </span>
                        <span className="font-semibold">{getFilterLabel()}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                {[
                  { key: "notStarted", label: "Not Started", color: "gray", icon: Clock },
                  { key: "justStarted", label: "Just Started (1-24%)", color: "blue", icon: TrendingDown },
                  { key: "inProgress", label: "In Progress (25-74%)", color: "yellow", icon: Users },
                  { key: "nearComplete", label: "Near Complete (75-99%)", color: "purple", icon: Award },
                  { key: "completed", label: "Completed (100%)", color: "green", icon: CheckCircle },
                ].map(({ key, label, color, icon: Icon }) => (
                  <Card key={key} className={`bg-${color}-500/20 border-${color}-500/30`}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-white/70 flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">
                        {progressOverview.counts ? progressOverview.counts[key] : 0}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {Object.keys(progressOverview.progressBuckets || {}).map((bucket) => {
                const students = progressOverview.progressBuckets[bucket]
                if (!students || students.length === 0) return null

                return (
                  <Card key={bucket} className="bg-black/30 border-white/10">
                    <CardHeader>
                      <CardTitle className="capitalize">
                        {bucket.replace(/([A-Z])/g, " $1").trim()} ({students.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {students.map((student: any) => (
                          <div
                            key={student.id}
                            className="p-3 bg-white/5 rounded border border-white/10 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{student.name}</p>
                              <p className="text-xs text-white/60">{student.email}</p>
                              {student.classes && student.classes.length > 0 && (
                                <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                                  <School className="h-3 w-3" />
                                  {student.classes.join(", ")}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="font-bold">{student.completionRate}%</div>
                              <div className="text-xs text-white/60">
                                {student.coursesCompleted}/{student.coursesTotal}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            {/* Scores Tab */}
            <TabsContent value="scores" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Assignment Score Analytics
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Overall Average: {scores.overallAverageScore || 0}/5.0 • {scores.totalStudentsWithScores || 0} students with scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {scores.studentScores && scores.studentScores.map((student: any) => (
                      <div
                        key={student.id}
                        className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold">{student.name}</h4>
                            <p className="text-sm text-white/60">{student.email}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs">
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-400"></span>
                                {student.excellent} Excellent
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                                {student.good} Good
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                                {student.average} Average
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                                {student.needsImprovement} Needs Help
                              </span>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-3xl font-bold ${
                              student.averageScore >= 4.5 ? "text-green-400" :
                              student.averageScore >= 3.5 ? "text-blue-400" :
                              student.averageScore >= 2.5 ? "text-yellow-400" :
                              "text-red-400"
                            }`}>
                              {student.averageScore}
                            </div>
                            <div className="text-sm text-white/70">
                              {student.totalAssignments} assignments
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </RequireAdmin>
  )
}

