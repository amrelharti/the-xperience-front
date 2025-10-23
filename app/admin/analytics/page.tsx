"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  BarChart3, 
  Eye, 
  Users, 
  Clock, 
  TrendingUp,
  Search,
  RefreshCw
} from "lucide-react"

interface VideoAnalytics {
  videoId: string
  totalViews: number
  uniqueUsers: number
  averageWatchTime?: number
  lastViewed?: string
}

interface VideoAccessLog {
  id: string
  videoId: string
  userEmail: string
  userIp: string
  accessedAt: string
  expiresAt: string
  termsAccepted: boolean
}

export default function VideoAnalyticsPage() {
  const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null)
  const [accessLogs, setAccessLogs] = useState<VideoAccessLog[]>([])
  const [videoId, setVideoId] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchAnalytics = async () => {
    if (!videoId.trim()) {
      setError("Please enter a video ID")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/videos/vimeo/${videoId}/analytics`, {
        credentials: "include"
      })

      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to fetch analytics")
      }
    } catch (err) {
      setError("Network error fetching analytics")
    } finally {
      setLoading(false)
    }
  }

  const fetchAccessLogs = async () => {
    if (!videoId.trim()) return

    try {
      // This would be a separate endpoint for access logs
      // For now, we'll simulate the data
      setAccessLogs([])
    } catch (err) {
      console.error("Error fetching access logs:", err)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchAccessLogs()
    }
  }, [videoId])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Video Analytics</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Label htmlFor="videoId">Video ID:</Label>
            <Input
              id="videoId"
              value={videoId}
              onChange={(e) => setVideoId(e.target.value)}
              placeholder="Enter Vimeo video ID"
              className="w-64"
            />
          </div>
          <Button onClick={fetchAnalytics} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Loading..." : "Get Analytics"}
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalViews}</div>
              <p className="text-xs text-muted-foreground">
                All time views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unique Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.uniqueUsers}</div>
              <p className="text-xs text-muted-foreground">
                Distinct viewers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Watch Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.averageWatchTime ? `${analytics.averageWatchTime}m` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">
                Average duration
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Viewed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics.lastViewed ? new Date(analytics.lastViewed).toLocaleDateString() : "Never"}
              </div>
              <p className="text-xs text-muted-foreground">
                Most recent access
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {analytics && (
        <Card>
          <CardHeader>
            <CardTitle>Video Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Video ID:</strong> {analytics.videoId}</p>
              <p><strong>Total Views:</strong> {analytics.totalViews}</p>
              <p><strong>Unique Users:</strong> {analytics.uniqueUsers}</p>
              {analytics.averageWatchTime && (
                <p><strong>Average Watch Time:</strong> {analytics.averageWatchTime} minutes</p>
              )}
              {analytics.lastViewed && (
                <p><strong>Last Viewed:</strong> {new Date(analytics.lastViewed).toLocaleString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {accessLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Access Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {accessLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <p className="font-medium">{log.userEmail}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(log.accessedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">{log.userIp}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.termsAccepted ? "Terms Accepted" : "Terms Pending"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

