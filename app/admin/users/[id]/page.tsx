"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  Users,
  Trophy,
  Video,
  CheckCircle,
  Clock,
  PlayCircle,
  School,
  Award,
  TrendingUp,
  AlertTriangle,
  Eye,
  FileDown,
  Edit,
  RefreshCw,
  Menu,
  X,
  UserCircle,
  BarChart3,
  Target,
  BookOpen
} from "lucide-react"
import RequireAdmin from "@/app/components/RequireAdmin"
import UserDropdown from "@/app/components/UserDropdown"
import { useUser } from "@/app/hooks/useUser"
import { useToast } from "@/hooks/use-toast"

interface Student {
  id: string
  name: string
  email: string
  globalRank: number
  totalStudents: number
  leaderboardStats?: {
    totalPoints: number
    averageScore: number
    assignmentCount: number
  }
  videoStatistics?: {
    total: number
    completed: number
    watched: number
    inProgress: number
    notStarted: number
    totalWatchTimeHours: number
  }
  enrollments?: Array<{
    classId: string
    className: string
    trainingName: string
    enrolledAt: string
  }>
  videos?: Array<{
    courseId: string
    title: string
    moduleName: string
    trainingName: string
    completed: boolean
    watched: boolean
    completionPercentage: number
    watchTimeSeconds: number
  }>
  lastActivity?: string
}

interface UserBasic {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
  imageUrl?: string
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useUser()
  const studentId = params.id as string
  
  const [loading, setLoading] = useState(true)
  const [student, setStudent] = useState<Student | null>(null)
  const [userBasic, setUserBasic] = useState<UserBasic | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState<string>("all")
  const [availableClasses, setAvailableClasses] = useState<any[]>([])
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: ""
  })

  useEffect(() => {
    loadFilters()
  }, [])

  useEffect(() => {
    loadStudentData()
  }, [studentId, selectedClassId])

  const loadFilters = async () => {
    try {
      const response = await fetch("/api/admin/analytics/filters", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setAvailableClasses(data.classes || [])
      }
    } catch (error) {
      console.error("Error loading filters:", error)
    }
  }

  const loadStudentData = async () => {
    setLoading(true)
    try {
      // Load basic user info (only once, doesn't depend on class)
      if (!userBasic) {
        const userRes = await fetch(`/api/admin/users`, {
          credentials: "include"
        })
        if (userRes.ok) {
          const users = await userRes.json()
          const foundUser = users.find((u: UserBasic) => u.id === studentId)
          if (foundUser) {
            setUserBasic(foundUser)
            setEditForm({
              name: foundUser.name,
              email: foundUser.email,
              role: foundUser.role
            })
          }
        }
      }

      // Load detailed student analytics with class filter
      const params = new URLSearchParams()
      if (selectedClassId !== "all") {
        params.append("classId", selectedClassId)
      }
      
      const url = params.toString() 
        ? `/api/admin/student-analysis/students?${params.toString()}`
        : "/api/admin/student-analysis/students"
      
      const studentRes = await fetch(url, {
        credentials: "include"
      })
      if (studentRes.ok) {
        const data = await studentRes.json()
        const foundStudent = data.students?.find((s: Student) => s.id === studentId)
        if (foundStudent) {
          setStudent(foundStudent)
        }
      }
    } catch (error) {
      console.error("Error loading student data:", error)
      toast({
        title: "Error",
        description: "Failed to load student data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStudent = async () => {
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm)
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Student information updated successfully",
        })
        setEditDialogOpen(false)
        loadStudentData()
      } else {
        throw new Error("Failed to update student")
      }
    } catch (error) {
      console.error("Error updating student:", error)
      toast({
        title: "Error",
        description: "Failed to update student information",
        variant: "destructive",
      })
    }
  }

  const handleDeleteStudent = async () => {
    try {
      const res = await fetch(`/api/admin/users/${studentId}`, {
        method: "DELETE",
        credentials: "include"
      })

      if (res.ok) {
        toast({
          title: "Success",
          description: "Student deleted successfully",
        })
        router.push("/admin/students")
      } else {
        throw new Error("Failed to delete student")
      }
    } catch (error) {
      console.error("Error deleting student:", error)
      toast({
        title: "Error",
        description: "Failed to delete student",
        variant: "destructive",
      })
    }
    setDeleteDialogOpen(false)
  }

  const exportStudentData = () => {
    if (!student || !userBasic) return

    const data = {
      "Basic Information": {
        "Name": userBasic.name,
        "Email": userBasic.email,
        "Role": userBasic.role,
        "Account Created": new Date(userBasic.createdAt).toLocaleDateString(),
        "Last Login": userBasic.lastLogin ? new Date(userBasic.lastLogin).toLocaleDateString() : "Never"
      },
      "Performance": {
        "Global Rank": `#${student.globalRank} of ${student.totalStudents}`,
        "Total Points": student.leaderboardStats?.totalPoints || 0,
        "Average Score": `${student.leaderboardStats?.averageScore || 0}/5`,
        "Assignments": student.leaderboardStats?.assignmentCount || 0
      },
      "Video Progress": {
        "Total Videos": student.videoStatistics?.total || 0,
        "Completed": student.videoStatistics?.completed || 0,
        "Watched": student.videoStatistics?.watched || 0,
        "In Progress": student.videoStatistics?.inProgress || 0,
        "Not Started": student.videoStatistics?.notStarted || 0,
        "Completion %": `${Math.round(((student.videoStatistics?.completed || 0) / (student.videoStatistics?.total || 1)) * 100)}%`,
        "Total Watch Time": `${student.videoStatistics?.totalWatchTimeHours || 0} hours`
      },
      "Enrollments": student.enrollments?.map(e => `${e.className} (${e.trainingName})`).join(", ") || "None"
    }

    const jsonContent = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonContent], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    
    link.setAttribute("href", url)
    link.setAttribute("download", `student_${userBasic.name.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.json`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

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

  const completionPercentage = student?.videoStatistics
    ? Math.round(((student.videoStatistics.completed || 0) / (student.videoStatistics.total || 1)) * 100)
    : 0

  // Group videos by training and module
  const groupedVideos = student?.videos ? student.videos.reduce((acc: any, video: any) => {
    const trainingName = video.trainingName || "Unknown Training"
    const moduleName = video.moduleName || "Unknown Module"
    
    if (!acc[trainingName]) {
      acc[trainingName] = {}
    }
    if (!acc[trainingName][moduleName]) {
      acc[trainingName][moduleName] = []
    }
    acc[trainingName][moduleName].push(video)
    return acc
  }, {}) : {}

  // Sort training names and module names within each training
  const sortedTrainings = Object.keys(groupedVideos).sort()
  const sortedGroupedVideos = sortedTrainings.reduce((acc: any, training: string) => {
    acc[training] = {}
    const modules = Object.keys(groupedVideos[training]).sort()
    modules.forEach(module => {
      // Sort videos within each module by completion status (completed first, then in progress, then not started)
      acc[training][module] = groupedVideos[training][module].sort((a: any, b: any) => {
        if (a.completed && !b.completed) return -1
        if (!a.completed && b.completed) return 1
        if (a.watched && !b.watched) return -1
        if (!a.watched && b.watched) return 1
        return 0
      })
    })
    return acc
  }, {})

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

  if (!student && !userBasic) {
    return (
      <RequireAdmin>
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="py-12 text-center">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Student Not Found</h3>
                <p className="text-muted-foreground mb-4">The student profile you're looking for doesn't exist.</p>
                <Button asChild>
                  <Link href="/admin/students">Back to Students</Link>
                </Button>
              </CardContent>
            </Card>
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
              <div className="flex items-center gap-3 sm:gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="flex items-center gap-2"
                >
                  <Link href="/admin/students">
                    <ArrowLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-lg sm:text-2xl font-bold text-gray-900">
                    {userBasic?.name || "Student Profile"}
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Complete student profile and analytics
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-4">
                <Button
                  onClick={loadStudentData}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Refresh</span>
                </Button>
                <Button
                  onClick={exportStudentData}
                  variant="outline"
                  size="sm"
                >
                  <FileDown className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
                <UserDropdown user={user} />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
          {/* Class Filter */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5" />
                Filter by Class
              </CardTitle>
              <CardDescription>
                Select a class to view class-specific analytics for this student
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes (General Analytics)</SelectItem>
                    {availableClasses.map((cls: any) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClassId !== "all" && (
                  <div className="text-sm text-muted-foreground bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    Showing analytics for: <span className="font-semibold text-blue-700">
                      {availableClasses.find((c: any) => c.id === selectedClassId)?.name || "Selected Class"}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Information Card */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditDialogOpen(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${userBasic?.email}`}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl sm:text-2xl font-bold flex-shrink-0">
                    {userBasic?.name?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-base sm:text-lg font-semibold">{userBasic?.name || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email</p>
                  <p className="text-base font-medium break-all">{userBasic?.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Role</p>
                  <Badge variant={userBasic?.role === "ADMIN" ? "default" : "outline"}>
                    <Shield className="h-3 w-3 mr-1" />
                    {userBasic?.role || "N/A"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Created</p>
                  <p className="text-base font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {userBasic?.createdAt ? new Date(userBasic.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Trophy className="h-3 w-3 sm:h-4 sm:w-4" />
                  Global Rank
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  #{student?.globalRank || "N/A"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  of {student?.totalStudents || 0} students
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Award className="h-3 w-3 sm:h-4 sm:w-4" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600">
                  {student?.leaderboardStats?.totalPoints || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                  Avg Score
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className="text-2xl sm:text-3xl font-bold text-blue-600">
                  {student?.leaderboardStats?.averageScore || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">out of 5</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2 p-3 sm:p-4">
                <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1 sm:gap-2">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                  Completion
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 pt-0">
                <div className={`text-2xl sm:text-3xl font-bold ${getStatusColor(completionPercentage)}`}>
                  {completionPercentage}%
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {student?.videoStatistics?.completed || 0}/{student?.videoStatistics?.total || 0} videos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* Video Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  Video Progress
                </CardTitle>
                <CardDescription>Detailed video engagement statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Overall Progress</span>
                      <span className="font-semibold">{completionPercentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
                        style={{ width: `${Math.min(100, completionPercentage)}%` }}
                      />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 bg-green-50 rounded border border-green-200">
                      <div className="text-muted-foreground text-xs">Completed</div>
                      <div className="font-semibold text-green-600 text-lg">
                        {student?.videoStatistics?.completed || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="text-muted-foreground text-xs">In Progress</div>
                      <div className="font-semibold text-yellow-600 text-lg">
                        {student?.videoStatistics?.inProgress || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <div className="text-muted-foreground text-xs">Watched</div>
                      <div className="font-semibold text-blue-600 text-lg">
                        {student?.videoStatistics?.watched || 0}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded border border-orange-200">
                      <div className="text-muted-foreground text-xs">Not Started</div>
                      <div className="font-semibold text-orange-600 text-lg">
                        {student?.videoStatistics?.notStarted || 0}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Total Watch Time</span>
                      <span className="font-semibold text-lg">
                        {student?.videoStatistics?.totalWatchTimeHours || 0} hours
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enrollments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <School className="h-5 w-5 text-indigo-600" />
                  Enrollments
                </CardTitle>
                <CardDescription>Classes and trainings the student is enrolled in</CardDescription>
              </CardHeader>
              <CardContent>
                {student?.enrollments && student.enrollments.length > 0 ? (
                  <div className="space-y-3">
                    {student.enrollments.map((enrollment) => (
                      <div
                        key={enrollment.classId}
                        className="p-3 bg-gray-50 rounded border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">{enrollment.className}</span>
                          <Badge variant="outline" className="border-blue-500 text-blue-700">
                            {enrollment.trainingName}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No enrollments found</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Video List */}
          {student?.videos && student.videos.length > 0 && (
            <Card className="mb-4 sm:mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-5 w-5 text-blue-600" />
                  Video Progress Details ({student.videos.length} videos)
                </CardTitle>
                <CardDescription>Complete list of all videos and their progress, organized by training module</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-96 overflow-y-auto">
                  {Object.entries(sortedGroupedVideos).map(([trainingName, modules]: [string, any]) => (
                    <div key={trainingName} className="space-y-4">
                      {/* Training Header */}
                      <div className="sticky top-0 bg-white z-10 pb-2 border-b border-gray-200">
                        <h3 className="font-semibold text-base text-gray-900 flex items-center gap-2">
                          <School className="h-4 w-4 text-indigo-600" />
                          {trainingName}
                        </h3>
                      </div>
                      
                      {/* Modules within Training */}
                      {Object.entries(modules).map(([moduleName, videos]: [string, any]) => (
                        <div key={moduleName} className="space-y-2 ml-4">
                          {/* Module Header */}
                          <div className="mb-2">
                            <h4 className="font-medium text-sm text-gray-700 flex items-center gap-2">
                              <BookOpen className="h-3 w-3 text-blue-600" />
                              {moduleName}
                            </h4>
                            <p className="text-xs text-muted-foreground ml-5">
                              {videos.length} video{videos.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          {/* Videos in Module */}
                          <div className="space-y-2 ml-4">
                            {videos.map((video: any) => (
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
                                    {video.watched && video.completionPercentage > 0 && (
                                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                                          style={{ width: `${Math.min(100, video.completionPercentage)}%` }}
                                        />
                                      </div>
                                    )}
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
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Performance Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground text-sm">Global Rank</span>
                    <Badge className={student ? getRankBadgeColor(student.globalRank) : ""}>
                      #{student?.globalRank || "N/A"}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">
                    {student?.leaderboardStats?.totalPoints || 0} pts
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total Points Earned</p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="text-muted-foreground text-sm mb-2">Average Score</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {student?.leaderboardStats?.averageScore || 0}/5
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Across all assignments
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-muted-foreground text-sm mb-2">Assignments</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {student?.leaderboardStats?.assignmentCount || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total submitted</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student Information</DialogTitle>
              <DialogDescription>
                Update the student's basic information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  disabled
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Role changes are restricted for security reasons
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStudent}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Student</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteStudent}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </RequireAdmin>
  )
}

