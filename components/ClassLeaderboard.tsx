"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award, TrendingUp } from "lucide-react"

interface LeaderboardEntry {
  rank: number
  userId: string
  userName: string
  userImage?: string
  totalProgress: number // 0-100% (50% live + 50% modules)
  attendedLiveSessions: number
  totalLiveSessions: number
  completedModules: number
  totalModules: number
  points?: number // Optional gamification points
}

interface ClassLeaderboardProps {
  classId: string
  className?: string
  leaderboard: LeaderboardEntry[]
  currentUserId?: string
}

export default function ClassLeaderboard({
  classId,
  leaderboard,
  currentUserId,
  className = ""
}: ClassLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-orange-600" />
      default:
        return <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center font-bold text-sm">{rank}</div>
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
    if (progress >= 90) return "text-green-600"
    if (progress >= 70) return "text-blue-600"
    if (progress >= 50) return "text-yellow-600"
    return "text-muted-foreground"
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Class Leaderboard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Rankings based on live session attendance and module completion
        </p>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No rankings yet. Be the first to complete modules and attend live sessions!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const isCurrentUser = entry.userId === currentUserId
              
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    isCurrentUser
                      ? "bg-primary/10 border-2 border-primary shadow-md"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {/* Rank Badge/Icon */}
                  <div className="flex-shrink-0">
                    {index < 3 ? (
                      getRankIcon(entry.rank)
                    ) : (
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        getRankBadgeColor(entry.rank)
                      }`}>
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
                        className="h-12 w-12 rounded-full object-cover ring-2 ring-background shadow-sm"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center ring-2 ring-background shadow-sm">
                        <span className="text-white font-bold text-sm">
                          {entry.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-base truncate">
                        {entry.userName}
                      </h3>
                      {isCurrentUser && (
                        <Badge variant="secondary" className="text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        🎥 {entry.attendedLiveSessions}/{entry.totalLiveSessions} live sessions
                      </span>
                      <span>
                        📚 {entry.completedModules}/{entry.totalModules} modules
                      </span>
                      {entry.points !== undefined && (
                        <span className="font-medium text-primary">
                          ⭐ {entry.points} pts
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Score */}
                  <div className="flex-shrink-0 text-right">
                    <div className={`text-2xl font-bold ${getProgressColor(entry.totalProgress)}`}>
                      {entry.totalProgress.toFixed(0)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Total Progress
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Leaderboard Key/Legend */}
        {leaderboard.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Progress Breakdown:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>• Live Sessions: 50% of total</div>
              <div>• Module Completion: 50% of total</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



