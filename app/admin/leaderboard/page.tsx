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
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <Link href="/admin" className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-200">
                <img 
                  src="/logos/dark blue secondary logo.svg" 
                  alt="XPERIENCE Logo" 
                  className="h-10 w-25"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </Link>
              <nav className="hidden md:flex items-center space-x-8">
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
            <div className="flex items-center space-x-4">
              {user && <UserDropdown user={user} />}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden hover:bg-slate-100"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white/95 backdrop-blur-md">
              <nav className="container mx-auto px-6 py-4 space-y-3">
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

        <div className="container mx-auto px-8 py-12 space-y-10 max-w-7xl">
          {/* Back Button */}
          <Button variant="outline" asChild className="hover:bg-slate-100">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          {/* Page Header */}
          <div className="text-center space-y-6 animate-fade-in py-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#005eb8] to-[#0476D7] text-white rounded-full text-sm font-medium">
              <Trophy className="h-4 w-4" />
              Leaderboard Management
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#005eb8] to-[#0476D7] bg-clip-text text-transparent">
              Class Leaderboards
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Monitor student performance and rankings across all classes
            </p>
          </div>

          {/* Class Selection */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg animate-slide-up p-6">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Select Class to Monitor
              </CardTitle>
              <CardDescription className="text-slate-600">
                Choose a class to view its leaderboard and student rankings
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex items-center gap-6">
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger className="w-80 h-12 text-lg border-2 border-slate-200 focus:border-[#005eb8] focus:ring-[#005eb8]/20 rounded-xl">
                    <SelectValue placeholder="Select a class..." />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((classItem) => (
                      <SelectItem key={classItem.id} value={classItem.id}>
                        {classItem.name} ({classItem.studentCount} students)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedClass && (
                  <div className="text-sm text-slate-600 bg-slate-50 px-6 py-3 rounded-lg">
                    Selected: <span className="font-semibold text-[#005eb8]">{selectedClass.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Class Info */}
          {selectedClass && (
            <Card className="border-0 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm shadow-lg animate-fade-in p-6">
              <CardContent className="pt-8">
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#005eb8] to-[#0476D7] flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl text-slate-800">{selectedClass.name} Leaderboard</h3>
                    <p className="text-slate-600">
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
              <CardHeader className="pb-8">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  {selectedClass.name} Leaderboard
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Student rankings based on assignment ratings
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
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
                      No rated assignments in this class yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user.id}
                        className={`flex items-center gap-6 p-6 rounded-xl border transition-all duration-300 hover:shadow-lg ${
                          index < 3 
                            ? "bg-gradient-to-r from-[#005eb8]/5 to-[#0476D7]/5 border-[#005eb8]/20 shadow-md" 
                            : "bg-white/60 hover:bg-white/80 border-slate-200"
                        }`}
                      >
                        {/* Rank */}
                        <div className={`flex items-center justify-center w-14 h-14 rounded-xl ${
                          index === 0 ? "bg-gradient-to-br from-[#005eb8] to-[#0476D7]" :
                          index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-400" :
                          index === 2 ? "bg-gradient-to-br from-amber-500 to-amber-600" :
                          "bg-gradient-to-br from-slate-100 to-slate-200"
                        }`}>
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#005eb8] to-[#0476D7] flex items-center justify-center">
                              {entry.user.imageUrl ? (
                                <img
                                  src={entry.user.imageUrl}
                                  alt={entry.user.name}
                                  className="h-12 w-12 rounded-xl object-cover"
                                />
                              ) : (
                                <span className="text-white font-bold text-lg">
                                  {entry.user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg text-slate-800">{entry.user.name}</h3>
                              <div className="flex items-center gap-6 text-sm text-slate-600">
                                <span className="flex items-center gap-2">
                                  <Star className="h-4 w-4 text-[#005eb8]" />
                                  {entry.totalPoints.toFixed(1)} points
                                </span>
                                <span>{entry.assignmentCount} rated assignments</span>
                                <span>Avg: {entry.avgScore.toFixed(1)}/10</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Rank Badge */}
                        <div>
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
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-[#005eb8] to-[#0476D7] rounded-lg">
                  <Star className="h-5 w-5 text-white" />
                </div>
                How Rankings Work
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#005eb8] mt-2"></div>
                  <p>Points are calculated as the sum of average scores from all rated assignments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0476D7] mt-2"></div>
                  <p>Each assignment's average score is the mean of all ratings given by other students in the class</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#005eb8] mt-2"></div>
                  <p>Rankings are class-specific - students compete with their classmates</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#005eb8] mt-2"></div>
                  <p>Once a student rates an assignment, they cannot change their rating</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0476D7] mt-2"></div>
                  <p>Students cannot rate their own assignments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#0476D7] mt-2"></div>
                  <p>Ratings range from 0-10 points per assignment</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}


