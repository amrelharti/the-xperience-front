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
  X
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
  
  // Filter options
  const [availableFilters, setAvailableFilters] = useState<any>({})
  
  // Filter states
  const [inactiveDays, setInactiveDays] = useState(7)
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("")
  const [selectedModuleId, setSelectedModuleId] = useState<string>("")

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
        loadScores()
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
      if (selectedClassId) params.append("classId", selectedClassId)
      if (selectedTrainingId) params.append("trainingId", selectedTrainingId)
      if (selectedModuleId) params.append("moduleId", selectedModuleId)
      
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
    setSelectedClassId("")
    setSelectedTrainingId("")
    setSelectedModuleId("")
  }
  
  const hasActiveFilters = selectedClassId || selectedTrainingId || selectedModuleId
  
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
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/analytics/dashboard" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Critical Insights
                </Link>
                <Badge variant="outline" className="border-green-400 text-green-400">
                  Phase 1
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  onClick={loadAllData}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-black/30 border border-white/10">
              <TabsTrigger value="rosters">
                <School className="h-4 w-4 mr-2" />
                Class Rosters
              </TabsTrigger>
              <TabsTrigger value="completions">
                <GraduationCap className="h-4 w-4 mr-2" />
                Completions
              </TabsTrigger>
              <TabsTrigger value="inactive">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Inactive Students
              </TabsTrigger>
              <TabsTrigger value="progress">
                <TrendingDown className="h-4 w-4 mr-2" />
                Progress Overview
              </TabsTrigger>
              <TabsTrigger value="scores">
                <Trophy className="h-4 w-4 mr-2" />
                Scores
              </TabsTrigger>
            </TabsList>

            {/* Class Rosters Tab */}
            <TabsContent value="rosters" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <School className="h-5 w-5" />
                    Class Rosters
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    See all enrolled students with their progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {rosters.map((roster) => (
                    <div key={roster.classId} className="mb-8">
                      <div className="flex items-center justify-between mb-4 p-4 bg-white/5 rounded-lg">
                        <div>
                          <h3 className="text-xl font-bold">{roster.className}</h3>
                          <p className="text-sm text-white/60">
                            {roster.startDate} {roster.endDate ? `- ${roster.endDate}` : "- Ongoing"}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">{roster.totalStudents}</div>
                          <div className="text-sm text-white/70">Students</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        {roster.students.map((student: any) => (
                          <div
                            key={student.id}
                            className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold">{student.name}</h4>
                                <p className="text-sm text-white/60">{student.email}</p>
                                <p className="text-xs text-white/50 mt-1">
                                  Enrolled: {new Date(student.enrolledAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right ml-4">
                                <div className="text-2xl font-bold">{student.completionRate}%</div>
                                <div className="text-sm text-white/70">
                                  {student.coursesCompleted}/{student.coursesTotal} courses
                                </div>
                                {student.lastActivity && (
                                  <p className="text-xs text-white/50 mt-1">
                                    Last active: {new Date(student.lastActivity).toLocaleDateString()}
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

            {/* Completions Tab */}
            <TabsContent value="completions" className="space-y-6">
              <Card className="bg-black/30 border-white/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Module Completions
                  </CardTitle>
                  <CardDescription className="text-white/60">
                    Students who completed entire modules
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {completions.map((module) => (
                      <div key={module.moduleId} className="p-6 bg-white/5 rounded-lg border border-white/10">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-bold">{module.moduleName}</h3>
                            <p className="text-sm text-white/60">{module.trainingName}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-400">{module.studentsCompleted}</div>
                            <div className="text-sm text-white/70">Completed</div>
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
                          <SelectItem value="">All Classes</SelectItem>
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
                          <SelectItem value="">All Trainings</SelectItem>
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
                          <SelectItem value="">All Modules</SelectItem>
                          {availableFilters.modules
                            ?.filter((mod: any) => !selectedTrainingId || mod.trainingId === selectedTrainingId)
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

