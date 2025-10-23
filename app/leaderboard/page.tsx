"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, Trophy, Star, TrendingUp, ArrowLeft, Medal, Award } from "lucide-react"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import RequireAuth from "../components/RequireAuth"
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
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [myClass, setMyClass] = useState<Class | null>(null)
  const [allClasses, setAllClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [myRank, setMyRank] = useState<number | null>(null)
  const { user } = useUser()
  const { toast } = useToast()

  // Auto-load user's class and leaderboard
  useEffect(() => {
    loadMyClassAndLeaderboard()
  }, [user])

  const loadMyClassAndLeaderboard = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      console.log("🔍 Loading user's class leaderboard automatically...")
      
      // Get user's enrolled classes
      const classesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/my-classes`, {
        credentials: "include"
      })
      
      if (!classesRes.ok) {
        throw new Error("Failed to load classes")
      }
      
      const classes = await classesRes.json()
      console.log("📚 User enrolled in", classes.length, "classes")
      
      if (classes.length === 0) {
        toast({
          title: "No Classes",
          description: "You're not enrolled in any classes yet",
          variant: "destructive",
        })
        setLoading(false)
        return
      }
      
      // Store all classes
      setAllClasses(classes)
      
      // Automatically use first class
      const userClass = classes[0]
      setMyClass(userClass)
      console.log("✅ Auto-selected class:", userClass.name)
      
      // Load leaderboard for this class
      const leaderboardRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/class/${userClass.id}?limit=50`,
        { credentials: "include" }
      )
      
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
        console.log("🏆 Loaded", data.leaderboard?.length || 0, "students in leaderboard")
        
        // Find my rank
        const myUserId = user.id
        const myEntry = data.leaderboard?.find((entry: LeaderboardEntry) => entry.user.id === myUserId)
        if (myEntry) {
          setMyRank(myEntry.rank)
        }
      } else {
        console.error("Failed to load leaderboard:", leaderboardRes.status)
      }
      
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadLeaderboardForClass = async (classId: string) => {
    try {
      setLoading(true)
      console.log("🔍 Loading leaderboard for class:", classId)
      
      const leaderboardRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/class/${classId}?limit=50`,
        { credentials: "include" }
      )
      
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
        console.log("🏆 Loaded", data.leaderboard?.length || 0, "students in leaderboard")
        
        // Find my rank
        const myUserId = user?.id
        const myEntry = data.leaderboard?.find((entry: LeaderboardEntry) => entry.user.id === myUserId)
        if (myEntry) {
          setMyRank(myEntry.rank)
        } else {
          setMyRank(null)
        }
      } else {
        console.error("Failed to load leaderboard:", leaderboardRes.status)
        setLeaderboard([])
        setMyRank(null)
      }
    } catch (error) {
      console.error("Error loading leaderboard:", error)
      toast({
        title: "Error",
        description: "Failed to load leaderboard",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClassChange = (classId: string) => {
    const selectedClass = allClasses.find(c => c.id === classId)
    if (selectedClass) {
      setMyClass(selectedClass)
      loadLeaderboardForClass(classId)
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
            <p>Loading leaderboard...</p>
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
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Trainings
            </Link>
          </Button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 font-[family-name:var(--font-space-grotesk)]">Leaderboard</h1>
            <p className="text-muted-foreground text-lg">
              {myClass ? `${myClass.name} - ` : ""}Top performers based on assignment ratings
            </p>
          </div>

          {/* Class Selector - Only show if user has multiple classes */}
          {allClasses.length > 1 && (
            <Card className="mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <Label htmlFor="class-select" className="text-sm font-medium">
                    Select Class:
                  </Label>
                  <Select value={myClass?.id || ""} onValueChange={handleClassChange}>
                    <SelectTrigger id="class-select" className="w-[300px]">
                      <SelectValue placeholder="Choose a class" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClasses.map((classItem) => (
                        <SelectItem key={classItem.id} value={classItem.id}>
                          {classItem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Class Info Card */}
          {myClass && (
            <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Your Class</h3>
                    <p className="text-muted-foreground">{myClass.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* My Rank Card */}
          {myRank && myRank > 0 && (
            <Card className="mb-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                    <Trophy className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Your Rank</h3>
                    <p className="text-2xl font-bold text-primary">#{myRank}</p>
                    <p className="text-sm text-muted-foreground">
                      In {myClass?.name || "your class"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {myClass?.name} Leaderboard
              </CardTitle>
              <CardDescription>
                Compete with your classmates! Rankings based on assignment ratings.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leaderboard.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No rankings yet</h3>
                  <p className="text-muted-foreground mb-4">
                    No rated assignments in your class yet. Be the first!
                  </p>
                  <Button asChild>
                    <Link href="/feed/new">Submit First Assignment</Link>
                  </Button>
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

          {/* How it Works */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>How Rankings Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Points are calculated as the sum of average scores from all your rated assignments</p>
              <p>• Each assignment's average score is the mean of all ratings given by other students in your class</p>
              <p>• Rankings are class-specific - compete with your classmates!</p>
              <p>• Once you rate an assignment, you cannot change your rating</p>
              <p>• You cannot rate your own assignments</p>
              <p>• Ratings range from 0-10 points per assignment</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireAuth>
  )
}
