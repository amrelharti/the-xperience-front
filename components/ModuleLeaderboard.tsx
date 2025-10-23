"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, CheckCircle, Clock } from "lucide-react"

interface ModuleLeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userImage?: string
  completedCourses: number
  totalCourses: number
  completionPercentage: number // 0-100
  liveSessionAttended: boolean
  completedAt?: string // When they finished the module
}

interface ModuleLeaderboardProps {
  moduleId: string
  moduleTitle: string
  className?: string
  leaderboard: ModuleLeaderboardEntry[]
  currentUserId?: string
}

export default function ModuleLeaderboard({
  moduleId,
  moduleTitle,
  leaderboard,
  currentUserId,
  className = ""
}: ModuleLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-orange-600" />
      default:
        return null
    }
  }

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white"
      case 2:
        return "bg-gray-400 text-white"
      case 3:
        return "bg-orange-600 text-white"
      default:
        return "bg-muted text-foreground"
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress === 100) return "text-green-600"
    if (progress >= 75) return "text-blue-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-muted-foreground"
  }

  const formatCompletionDate = (dateString?: string) => {
    if (!dateString) return null
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Module Rankings
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {moduleTitle}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Top performers in this module
        </p>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-6">
            <Trophy className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No students have started this module yet
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.userId === currentUserId
              const isTop3 = entry.rank <= 3
              
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    isCurrentUser
                      ? "bg-primary/10 border-2 border-primary"
                      : isTop3
                      ? "bg-gradient-to-r from-muted to-muted/50"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="flex-shrink-0">
                    {isTop3 ? (
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        getRankBadgeColor(entry.rank)
                      } shadow-sm`}>
                        {getRankIcon(entry.rank)}
                      </div>
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">
                        {entry.rank}
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    {entry.userImage ? (
                      <img
                        src={entry.userImage}
                        alt={entry.userName}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-background"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/60 to-primary/40 flex items-center justify-center ring-2 ring-background">
                        <span className="text-white font-bold text-sm">
                          {entry.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">
                        {entry.userName}
                      </span>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                      {entry.completionPercentage === 100 && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        📹 {entry.completedCourses}/{entry.totalCourses} videos
                      </span>
                      {entry.liveSessionAttended ? (
                        <span className="text-green-600 font-medium">
                          ✅ Live attended
                        </span>
                      ) : (
                        <span className="text-orange-500">
                          ⏳ No live yet
                        </span>
                      )}
                    </div>
                    
                    {entry.completedAt && entry.completionPercentage === 100 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Completed {formatCompletionDate(entry.completedAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-xl font-bold ${getProgressColor(entry.completionPercentage)}`}>
                      {entry.completionPercentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Module Progress Explanation */}
        {leaderboard.length > 0 && (
          <div className="mt-4 pt-3 border-t">
            <p className="text-xs text-muted-foreground font-medium mb-2">
              Module Completion = 50% Videos + 50% Live Session
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span>Complete all videos</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span>Attend live session</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



