"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Video, CheckCircle, ExternalLink } from "lucide-react"
import CountdownTimer from "./CountdownTimer"
import { useToast } from "@/hooks/use-toast"

interface LiveSessionCardProps {
  liveSession: {
    id: string
    title: string
    scheduledDate: string
    instructorName?: string
    meetingUrl: string
    meetingPassword?: string
    durationMinutes: number
  }
  isAttended: boolean
  onAttendanceToggle: (attended: boolean) => Promise<void>
  currentProgress: number
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

  const sessionDate = new Date(liveSession.scheduledDate)
  const isValidDate = !isNaN(sessionDate.getTime())

  const handleJoinLive = () => {
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
    
    if (checked && !isLive && isValidDate) {
      const now = new Date().getTime()
      const sessionTime = new Date(liveSession.scheduledDate).getTime()
      
      if (now < sessionTime) {
        toast({
          title: "Session Not Started Yet",
          description: "You can only mark attendance after the live session has started.",
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

  const progressWithLive = isAttended ? 100 : currentProgress

  return (
    <div className="space-y-6">
      {/* Session Info */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl p-6 border border-gray-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-5">{liveSession.title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Calendar className="h-4 w-4 text-[#0476D7]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="font-semibold text-sm text-gray-800">
                {isValidDate ? sessionDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }) : "Invalid Date"}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 rounded-lg">
              <Clock className="h-4 w-4 text-[#0476D7]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Time</p>
              <p className="font-semibold text-sm text-gray-800">
                {isValidDate ? sessionDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Invalid Date"}
              </p>
            </div>
          </div>

          {liveSession.instructorName && (
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-100 rounded-lg">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Instructor</p>
                <p className="font-semibold text-sm text-gray-800">{liveSession.instructorName}</p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-100 rounded-lg">
              <Clock className="h-4 w-4 text-[#FFBC00]" />
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Duration</p>
              <p className="font-semibold text-sm text-gray-800">{liveSession.durationMinutes} minutes</p>
            </div>
          </div>
        </div>

        {liveSession.meetingPassword && (
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-sm font-semibold text-gray-700 mb-2">Meeting Password</p>
            <div className="inline-block bg-white px-5 py-2.5 rounded-lg border-2 border-gray-300 font-mono font-bold text-lg tracking-wider text-gray-800 shadow-sm">
              {liveSession.meetingPassword}
            </div>
          </div>
        )}
      </div>

      {/* Countdown Timer */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        {isValidDate ? (
          <CountdownTimer
            targetDate={liveSession.scheduledDate}
            onCountdownEnd={() => setIsLive(true)}
          />
        ) : (
          <div className="text-center py-8">
            <p className="text-red-500 font-semibold text-lg mb-2">Invalid session date</p>
            <p className="text-sm text-gray-500">
              Please contact your instructor to fix the session schedule.
            </p>
          </div>
        )}
      </div>

      {/* Join Live Button */}
      <Button
        onClick={handleJoinLive}
        disabled={!isLive}
        className={`w-full ${isLive ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        size="lg"
      >
        {isLive ? (
          <>
            <Video className="mr-2 h-5 w-5" />
            Join Live Session
            <ExternalLink className="ml-2 h-4 w-4" />
          </>
        ) : (
          <>
            <Clock className="mr-2 h-5 w-5" />
            Waiting for session to start...
          </>
        )}
      </Button>

      {/* Attendance Checkbox */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-[#0476D7]/30 transition-all">
          <input
            type="checkbox"
            id="attendance"
            checked={isAttended}
            onChange={(e) => handleAttendanceChange(e.target.checked)}
            disabled={isLoading}
            className="h-5 w-5 rounded border-gray-300 text-[#0476D7] focus:ring-[#0476D7] cursor-pointer"
          />
          <label htmlFor="attendance" className="flex-1 cursor-pointer font-semibold text-gray-800">
            I attended the live session
          </label>
          {isAttended && <CheckCircle className="h-5 w-5 text-green-500" />}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600 font-medium">Module Progress</span>
            <span className="font-bold text-gray-900">{progressWithLive}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0476D7] to-[#005eb8] transition-all duration-700"
              style={{ width: `${progressWithLive}%` }}
            />
          </div>
          {isAttended && (
            <p className="text-xs text-green-600 flex items-center gap-1.5 font-medium">
              <CheckCircle className="h-3.5 w-3.5" />
              Live session attendance recorded! Progress updated to 100%
            </p>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="h-7 w-7 rounded-full bg-[#0476D7] flex items-center justify-center">
              <span className="text-white text-xs font-bold">i</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 mb-2">How Live Sessions Work:</p>
            <ul className="space-y-1.5 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-[#0476D7] mt-1">•</span>
                <span>Wait for the countdown to reach zero</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0476D7] mt-1">•</span>
                <span>Click "Join Live Session" to open Zoom</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0476D7] mt-1">•</span>
                <span>Attend the full session with your instructor</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0476D7] mt-1">•</span>
                <span>After the session, check "I attended" to update your progress</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#0476D7] mt-1">•</span>
                <span>Live sessions count for 50% of your module grade</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
