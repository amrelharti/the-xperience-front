"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, Trophy, Star, TrendingUp, ArrowLeft, Medal, Award, Users, Menu, X } from "lucide-react"
import { useUser } from "../../hooks/useUser"
import UserDropdown from "../../components/UserDropdown"
import RequireAuth from "../../components/RequireAuth"
import { useToast } from "@/hooks/use-toast"

interface LeaderboardEntry {
  rank: number
  user: {
    id: string
    name: string
    imageUrl: string
  }
  totalPoints: number
  assignmentCount: number
  avgScore: number
}

interface Class {
  id: string
  name: string
  description?: string
  studentCount: number
}

export default function AdminLeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/admin/classes`, {
        credentials: "include"
      })

      if (res.ok) {
        const data = await res.json()
        setClasses(data)
        console.log("📚 Loaded", data.length, "classes for admin")
      } else {
        throw new Error("Failed to load classes")
      }
    } catch (error) {
      console.error("Error loading classes:", error)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboard = async (classId: string) => {
    try {
      setLoadingLeaderboard(true)
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/class/${classId}?limit=100`,
        { credentials: "include" }
      )

      if (res.ok) {
        const data = await res.json()
        setLeaderboard(data.leaderboard || [])
        console.log("🏆 Loaded leaderboard for class:", selectedClass?.name)
      } else {
        throw new Error("Failed to load leaderboard")
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoadingLeaderboard(false)
    }
  }

  const handleClassChange = (classId: string) => {
    const selected = classes.find(c => c.id === classId)
    if (selected) {
      setSelectedClass(selected)
      loadLeaderboard(classId)
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-[#005eb8]" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-[#005eb8] text-white">🥇 1st</Badge>
    if (rank === 2) return <Badge className="bg-gray-400 text-white">🥈 2nd</Badge>
    if (rank === 3) return <Badge className="bg-amber-600 text-white">🥉 3rd</Badge>
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>
    return null
  }

  if (loading) {
    return (
      <RequireAuth>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading classes...</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
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
                <Link href="/admin/users" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Users
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/feed" className="text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
                  Feed
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#FFBC00] group-hover:w-full transition-all duration-200"></span>
                </Link>
                <Link href="/admin/leaderboard" className="text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-all duration-200 hover:scale-105 relative group">
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
                  className="block py-3 text-sm font-medium text-slate-600 hover:text-[#0476D7] transition-colors"
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
                  className="block py-3 text-sm font-semibold text-[#005eb8] hover:text-[#0476D7] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          )}
        </header>

        <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8 md:py-12 space-y-6 sm:space-y-8 md:space-y-10 max-w-7xl">
          {/* Back Button */}
          <Button variant="outline" asChild size="sm" className="hover:bg-slate-100 text-sm sm:text-base -ml-2 sm:ml-0">
            <Link href="/admin">
              <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          {/* Page Header */}
          <div className="text-center space-y-4 sm:space-y-6 animate-fade-in py-4 sm:py-8 px-4">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-xs sm:text-sm font-medium">
              <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Leaderboard Management
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              Class Leaderboards
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
              Monitor student performance and rankings across all classes
            </p>
          </div>

          {/* Class Selection */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-up p-4 sm:p-6">
            <CardHeader className="pb-4 sm:pb-8 px-0">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                Select Class to Monitor
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs sm:text-sm md:text-base">
                Choose a class to view its leaderboard and student rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3 sm:pt-4 px-0">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-6">
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger className="w-full sm:w-80 h-10 sm:h-12 text-sm sm:text-base md:text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-lg sm:rounded-xl">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id} className="text-sm sm:text-base">
                        {classItem.name} ({classItem.studentCount} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <div className="text-xs sm:text-sm text-slate-600 bg-slate-50 px-4 sm:px-6 py-2 sm:py-3 rounded-lg">
                    Selected: <span className="font-semibold text-[#005eb8]">{selectedClass.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Class Info */}
          {selectedClass && (
            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg animate-fade-in p-4 sm:p-6">
              <CardContent className="pt-4 sm:pt-8 px-0">
                <div className="flex items-center gap-4 sm:gap-6">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#005eb8] to-[#0476D7] flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg md:text-xl text-slate-800">{selectedClass.name} Leaderboard</h3>
                    <p className="text-slate-600 text-xs sm:text-sm md:text-base">
                      {selectedClass.studentCount} students enrolled
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          {selectedClass && (
            <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-scale-in">
              <CardHeader className="pb-4 sm:pb-8 px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  {selectedClass.name} Leaderboard
                </CardTitle>
              <CardDescription className="text-slate-600 text-xs sm:text-sm md:text-base">
                Student rankings based on assignment and weekly summary ratings
              </CardDescription>
              </CardHeader>
              <CardContent className="pt-3 sm:pt-4 px-4 sm:px-6">
                {loadingLeaderboard ? (
                  <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#005eb8] border-t-transparent mx-auto mb-6"></div>
                    <p className="text-slate-600">Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6">
                      <Trophy className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3 text-slate-700">No rankings yet</h3>
                    <p className="text-slate-600">
                      No rated assignments or weekly summaries in this class yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user.id}
                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          index < 3 
                            ? "bg-gradient-to-r from-[#005eb8]/5 to-[#0476D7]/5 border-[#005eb8]/20 shadow-md" 
                            : "bg-white/60 hover:bg-white/80 border-slate-200"
                        }`}
                      >
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl flex-shrink-0 ${
                          index === 0 ? "bg-gradient-to-br from-[#005eb8] to-[#0476D7]" :
                          index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                          index === 2 ? "bg-gradient-to-br from-amber-500 to-amber-600" :
                          "bg-gradient-to-br from-slate-100 to-slate-200"
                        }`}>
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0 w-full">
                          <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#005eb8] to-[#0476D7] flex items-center justify-center flex-shrink-0">
                              {entry.user.imageUrl ? (
                                <img
                                  src={entry.user.imageUrl}
                                  alt={entry.user.name}
                                  className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-sm sm:text-lg">
                                  {entry.user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base sm:text-lg text-slate-800">{entry.user.name}</h3>
                              <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-slate-600">
                                <span className="flex items-center gap-1.5 sm:gap-2">
                                  <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#005eb8] flex-shrink-0" />
                                  {entry.totalPoints.toFixed(1)} points
                                </span>
                                <span>{entry.assignmentCount} rated posts</span>
                                <span>Avg: {entry.avgScore.toFixed(1)}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rank Badge */}
                        <div className="w-full sm:w-auto flex justify-center sm:block">
                          {getRankBadge(entry.rank)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* How it Works */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-fade-in">
            <CardHeader className="pb-4 sm:pb-8 px-4 sm:px-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-base sm:text-lg md:text-xl">
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                How Rankings Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 text-slate-600 px-4 sm:px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#005eb8] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Points are calculated as the sum of average scores from all rated assignments and weekly summaries</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0476D7] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Each post's average score is the mean of all ratings given by other students in the class</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#005eb8] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Rankings are class-specific - students compete with their classmates</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#005eb8] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Once a student rates a post, they cannot change their rating</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0476D7] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Students cannot rate their own posts</p>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0476D7] mt-1.5 sm:mt-2 flex-shrink-0"></div>
                  <p className="text-xs sm:text-sm md:text-base">Ratings range from 0-10 points per post</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}


