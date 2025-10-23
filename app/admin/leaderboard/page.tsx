"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, Trophy, Star, TrendingUp, ArrowLeft, Medal, Award, Users } from "lucide-react"
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
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />
    return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 text-white">🥇 1st</Badge>
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
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <PlayCircle className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl font-[family-name:var(--font-space-grotesk)]">Admin Dashboard</span>
            </Link>
            <div className="flex items-center gap-4">
              {user && <UserDropdown user={user} />}
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/admin">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin Dashboard
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Class Leaderboards</h1>
            <p className="text-muted-foreground text-lg">
              Monitor student performance across all classes
            </p>
          </div>

          {/* Class Selection */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Class to Monitor
              </CardTitle>
              <CardDescription>
                Choose a class to view its leaderboard and student rankings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Select onValueChange={handleClassChange}>
                  <SelectTrigger className="w-80">
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
                  <div className="text-sm text-muted-foreground">
                    Selected: <span className="font-medium">{selectedClass.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Selected Class Info */}
          {selectedClass && (
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{selectedClass.name}</h3>
                    <p className="text-muted-foreground">
                      {selectedClass.studentCount} students enrolled
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          {selectedClass && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {selectedClass.name} Leaderboard
                </CardTitle>
                <CardDescription>
                  Student rankings based on assignment ratings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingLeaderboard ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p>Loading leaderboard...</p>
                  </div>
                ) : leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
                    <p className="text-muted-foreground">
                      No rated assignments in this class yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leaderboard.map((entry, index) => (
                      <div
                        key={entry.user.id}
                        className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                          index < 3 ? "bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20" : "hover:bg-muted/50"
                        }`}
                      >
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          {getRankIcon(entry.rank)}
                        </div>

                        {/* User Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                              {entry.user.imageUrl ? (
                                <img
                                  src={entry.user.imageUrl}
                                  alt={entry.user.name}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-primary-foreground font-bold">
                                  {entry.user.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{entry.user.name}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Star className="h-4 w-4" />
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
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How Rankings Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Points are calculated as the sum of average scores from all rated assignments</p>
              <p>• Each assignment's average score is the mean of all ratings given by other students in the class</p>
              <p>• Rankings are class-specific - students compete with their classmates</p>
              <p>• Once a student rates an assignment, they cannot change their rating</p>
              <p>• Students cannot rate their own assignments</p>
              <p>• Ratings range from 0-10 points per assignment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}


