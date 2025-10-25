"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video, CheckCircle, ExternalLink } from "lucide-react"
import CountdownTimer from "./CountdownTimer"
import { useToast } from "@/hooks/use-toast"

interface LiveSessionCardProps {
  liveSession: {
    id: string
    title: string
    scheduledDate: string // ISO date string
    instructorName?: string
    meetingUrl: string // Zoom meeting link
    meetingPassword?: string
    durationMinutes: number
  }
  isAttended: boolean
  onAttendanceToggle: (attended: boolean) => Promise<void>
  currentProgress: number // Current module progress (0-100)
  classId?: string | null
}

export default function LiveSessionCard({
  liveSession,
  isAttended,
  onAttendanceToggle,
  currentProgress,
  classId,
}: LiveSessionCardProps) {
  const [isLive, setIsLive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()


  // Ensure we have a valid date
  const sessionDate = new Date(liveSession.scheduledDate)
  const isValidDate = !isNaN(sessionDate.getTime())

  const handleJoinLive = () => {
    // Open Zoom link in new tab (or Zoom app if installed)
    window.open(liveSession.meetingUrl, "_blank", "noopener,noreferrer")
  }

  const handleAttendanceChange = async (checked: boolean) => {
    if (!classId) {
      toast({
        title: "Error",
        description: "Class ID is missing",
        variant: "destructive",
      })
      return
    }
    
    // Check if trying to mark as attended before the session has started
    if (checked && !isLive && isValidDate) {
      const now = new Date().getTime()
      const sessionTime = new Date(liveSession.scheduledDate).getTime()
      
      if (now < sessionTime) {
        toast({
          title: "Session Not Started Yet",
          description: "You can only mark attendance after the live session has started. Please wait for the session to begin.",
          variant: "destructive",
        })
        return
      }
    }
    
    setIsLoading(true)
    try {
      await onAttendanceToggle(checked)
    } catch (error) {
      console.error("Error updating attendance:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate progress with live session
  // If attended: progress jumps to 100% (assuming all videos done)
  // If not attended: shows current video progress only
  const progressWithLive = isAttended ? 100 : currentProgress

  return (
    <Card className="mt-8 border-l-4 border-l-red-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-red-500" />
            Live Session
          </CardTitle>
          {isLive && (
            <Badge variant="destructive" className="animate-pulse">
              🔴 LIVE NOW
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Session Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{liveSession.title}</h3>
          
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {isValidDate ? sessionDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              }) : "Invalid Date"}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {isValidDate ? sessionDate.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }) : "Invalid Date"}
            </div>

            {liveSession.instructorName && (
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {liveSession.instructorName}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {liveSession.durationMinutes} minutes
            </div>
          </div>

          {liveSession.meetingPassword && (
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm font-medium mb-1">Meeting Password:</p>
              <code className="text-sm bg-background px-2 py-1 rounded">
                {liveSession.meetingPassword}
              </code>
            </div>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg p-6">
          {isValidDate ? (
            <CountdownTimer
              targetDate={liveSession.scheduledDate}
              onCountdownEnd={() => setIsLive(true)}
            />
          ) : (
            <div className="text-center">
              <p className="text-red-500 font-medium">Invalid session date</p>
              <p className="text-sm text-muted-foreground mt-2">
                Please contact your instructor to fix the session schedule.
              </p>
            </div>
          )}
        </div>

        {/* Join Live Button - Opens in new tab */}
        <Button
          onClick={handleJoinLive}
          disabled={!isLive}
          className="w-full"
          size="lg"
          variant={isLive ? "default" : "secondary"}
        >
          {isLive ? (
            <>
              <Video className="mr-2 h-5 w-5" />
              Join Live Session
              <ExternalLink className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              <Clock className="mr-2 h-4 w-4" />
              Waiting for session to start...
            </>
          )}
        </Button>

        {isLive && (
          <p className="text-xs text-center text-muted-foreground">
            Clicking will open Zoom in a new tab or the Zoom app if installed
          </p>
        )}

        {/* Attendance Checkbox */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-muted rounded-lg border-2 border-transparent hover:border-primary/20 transition-colors">
            <input
              type="checkbox"
              id="attendance"
              checked={isAttended}
              onChange={(e) => handleAttendanceChange(e.target.checked)}
              disabled={isLoading}
              className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
            />
            <label
              htmlFor="attendance"
              className="flex-1 cursor-pointer font-medium"
            >
              I attended the live session
            </label>
            {isAttended && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Module Progress</span>
              <span className="font-semibold">{progressWithLive}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${progressWithLive}%` }}
              />
            </div>
            {isAttended && (
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Live session attendance recorded! Module progress updated to 100%
              </p>
            )}
            {!isAttended && currentProgress > 0 && (
              <p className="text-xs text-muted-foreground">
                Video progress: {currentProgress}% • Complete the live session to reach 100%
              </p>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-white text-xs font-bold">i</span>
              </div>
            </div>
            <div className="flex-1 text-sm text-blue-900 dark:text-blue-100">
              <p className="font-medium mb-1">How Live Sessions Work:</p>
              <ul className="space-y-1 text-xs">
                <li>• Wait for the countdown to reach zero</li>
                <li>• Click "Join Live Session" to open Zoom</li>
                <li>• Attend the full session with your instructor</li>
                <li>• After the session, check "I attended" to update your progress</li>
                <li>• Live sessions count for 50% of your module grade</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

