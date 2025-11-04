"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlayCircle, Trophy, Star, TrendingUp, ArrowLeft, Medal, Award, Crown, Zap, Target } from "lucide-react"
import { useUser } from "../hooks/useUser"
import UserDropdown from "../components/UserDropdown"
import RequireAuth from "../components/RequireAuth"
import Navbar from "../components/Navbar"
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
  const [selectedTraining, setSelectedTraining] = useState<string>("")
  const [selectedClass, setSelectedClass] = useState<string>("")
  const { user } = useUser()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  const headerRef = useRef(null)
  const leaderboardRef = useRef(null)
  const headerInView = useInView(headerRef, { once: true })
  const leaderboardInView = useInView(leaderboardRef, { once: true })

  // Handle URL parameters for training and class filtering
  useEffect(() => {
    const trainingParam = searchParams.get('training')
    const classParam = searchParams.get('class')
    
    if (trainingParam && classParam) {
      // If both training and class parameters are provided, use them directly
      setSelectedTraining(trainingParam)
      setSelectedClass(classParam)
      loadLeaderboardForClass(classParam, trainingParam)
    } else {
      // Otherwise, load user's default class and leaderboard
      loadMyClassAndLeaderboard()
    }
  }, [user, searchParams])

  // Auto-load user's class and leaderboard (fallback)
  useEffect(() => {
    if (!selectedTraining && !selectedClass) {
      loadMyClassAndLeaderboard()
    }
  }, [user])

  const loadMyClassAndLeaderboard = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      
      // Get user's enrolled classes
      const classesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/classes/my-classes`, {
        credentials: "include"
      })
      
      if (!classesRes.ok) {
        throw new Error("Failed to load classes")
      }
      
      const classes = await classesRes.json()
      
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
      
      // Load leaderboard for this class
      const leaderboardRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/class/${userClass.id}?limit=50`,
        { credentials: "include" }
      )
      
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
        
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

  const loadLeaderboardForClass = async (classId: string, trainingId?: string) => {
    try {
      setLoading(true)
      
      // Build URL with optional training parameter
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/leaderboard/class/${classId}?limit=50`
      if (trainingId) {
        url += `&training=${trainingId}`
      }
      
      const leaderboardRes = await fetch(url, { credentials: "include" })
      
      if (leaderboardRes.ok) {
        const data = await leaderboardRes.json()
        setLeaderboard(data.leaderboard || [])
        
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0476D7] to-[#005eb8] rounded-2xl mb-4">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading leaderboard...</h3>
            <p className="text-gray-500">Please wait while we fetch the rankings</p>
          </div>
        </div>
      </RequireAuth>
    )
  }

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50/30">
        <Navbar />

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
          {/* Page Header */}
          <motion.div 
            ref={headerRef}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8 sm:mb-12"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl shadow-blue-500/10">
              <div className="absolute inset-0 bg-gradient-to-br from-[#60A5FA] via-[#3B82F6] to-[#2563EB]" />
              <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px] opacity-50" />
              <div className="relative p-6 sm:p-8 md:p-10 lg:p-14">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-6">
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white border-yellow-400 mb-3 sm:mb-4 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm">
                      <Trophy className="h-3 w-3 mr-2" />
                      Class Rankings
                    </Badge>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                      Leaderboard
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-blue-100 mb-4 sm:mb-6 max-w-2xl">
                      {myClass ? `${myClass.name} - ` : ""}Top performers based on assignment ratings
                    </p>
                    <div className="flex flex-wrap items-center gap-6 text-blue-100">
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Target className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Competitive</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                        <Zap className="h-5 w-5 text-yellow-300" />
                        <span className="font-medium">Real-time</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Button variant="outline" asChild className="border-gray-200 hover:border-[#0476D7]/30 hover:bg-blue-50/50">
              <Link href={selectedTraining ? `/courses/${selectedTraining}` : "/"}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {selectedTraining ? "Back to Training" : "Back to Trainings"}
              </Link>
            </Button>
          </motion.div>

          {/* Class Selector - Only show if user has multiple classes */}
          {allClasses.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                    <Label htmlFor="class-select" className="text-xs sm:text-sm font-semibold text-gray-700">
                      Select Class:
                    </Label>
                    <Select value={myClass?.id || ""} onValueChange={handleClassChange}>
                      <SelectTrigger id="class-select" className="w-full sm:w-[300px] border-gray-200 focus:border-[#0476D7] focus:ring-[#0476D7]/20 rounded-lg sm:rounded-xl text-sm sm:text-base">
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {allClasses.map((classItem) => (
                          <SelectItem key={classItem.id} value={classItem.id} className="text-sm sm:text-base">
                            {classItem.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Class Info Card */}
          {myClass && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl sm:rounded-2xl border border-blue-200 shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center shadow-md flex-shrink-0">
                      <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-base sm:text-lg text-gray-900">Your Class</h3>
                      <p className="text-gray-600 text-sm sm:text-base">{myClass.name}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* My Rank Card */}
          {myRank && myRank > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="mb-6 sm:mb-8"
            >
              <div className="bg-gradient-to-r from-[#0476D7]/10 to-[#005eb8]/5 border-2 border-[#0476D7]/20 rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center shadow-lg flex-shrink-0">
                      <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1">Your Rank</h3>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0476D7] mb-0.5 sm:mb-1">#{myRank}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        In {myClass?.name || "your class"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Leaderboard */}
          <motion.div
            ref={leaderboardRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-6 sm:mb-8"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">{myClass?.name} Leaderboard</h3>
                    <p className="text-xs sm:text-sm text-gray-600">Compete with your classmates! Rankings based on assignment ratings.</p>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                {leaderboard.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl mb-6">
                      <Trophy className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">No rankings yet</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                      No rated assignments in your class yet. Be the first to submit and get rated!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {leaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.01, y: -2 }}
                        className={`group relative overflow-hidden rounded-xl sm:rounded-2xl transition-all duration-300 ${
                          index < 3 
                            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 shadow-lg" 
                            : "bg-white border border-gray-200 hover:border-[#0476D7]/30 hover:shadow-md"
                        }`}
                      >
                        {/* Gradient accent line for top 3 */}
                        {index < 3 && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 sm:w-2 bg-gradient-to-b from-yellow-400 to-orange-400" />
                        )}
                        
                        <div className="p-4 sm:p-6 pl-5 sm:pl-8">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                            {/* Rank - Mobile: Top-left, Desktop: Left */}
                            <div className="flex items-center gap-3 sm:gap-0 sm:block sm:flex-shrink-0">
                              <div className={`relative ${
                                index < 3 ? "h-12 w-12 sm:h-16 sm:w-16" : "h-10 w-10 sm:h-12 sm:w-12"
                              } rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md ${
                                index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                                index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                                index === 2 ? "bg-gradient-to-br from-amber-500 to-amber-700" :
                                "bg-gradient-to-br from-gray-100 to-gray-200"
                              }`}>
                                {getRankIcon(entry.rank)}
                              </div>
                              
                              {/* Rank Badge - Mobile: Next to rank icon, Desktop: Right side */}
                              <div className="sm:hidden">
                                {getRankBadge(entry.rank)}
                              </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 min-w-0 w-full">
                              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center shadow-md flex-shrink-0">
                                  {entry.user.imageUrl ? (
                                    <img
                                      src={entry.user.imageUrl}
                                      alt={entry.user.name}
                                      className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl object-cover"
                                    />
                                  ) : (
                                    <span className="text-base sm:text-lg font-bold text-white">
                                      {entry.user.name.charAt(0).toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-[#0476D7] transition-colors mb-2">
                                    {entry.user.name}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                                    <div className="flex items-center gap-1.5 bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-blue-100">
                                      <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-[#0476D7]" />
                                      <span className="font-semibold">{entry.totalPoints.toFixed(1)} points</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-200">
                                      <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600" />
                                      <span className="font-medium">{entry.assignmentCount} assignments</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-green-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-green-100">
                                      <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
                                      <span className="font-semibold text-green-700">Avg: {entry.avgScore.toFixed(1)}/10</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Rank Badge - Desktop only */}
                            <div className="hidden sm:block flex-shrink-0">
                              {getRankBadge(entry.rank)}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* How it Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="mt-6 sm:mt-8"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 sm:p-6 border-b border-gray-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gradient-to-br from-[#0476D7] to-[#005eb8] flex items-center justify-center flex-shrink-0">
                    <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">How Rankings Work</h3>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">1</span>
                    </div>
                    <p>Points are calculated as the sum of average scores from all your rated assignments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">2</span>
                    </div>
                    <p>Each assignment's average score is the mean of all ratings given by other students in your class</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">3</span>
                    </div>
                    <p>Rankings are class-specific - compete with your classmates!</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">4</span>
                    </div>
                    <p>Once you rate an assignment, you cannot change your rating</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">5</span>
                    </div>
                    <p>You cannot rate your own assignments</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-[#0476D7] text-xs font-bold">6</span>
                    </div>
                    <p>Ratings range from 0-10 points per assignment</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </RequireAuth>
  )
}
