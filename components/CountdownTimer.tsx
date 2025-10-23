"use client"

import { useState, useEffect } from "react"
import { Clock } from "lucide-react"

interface CountdownTimerProps {
  targetDate: string // ISO date string
  onCountdownEnd: () => void
}

export default function CountdownTimer({
  targetDate,
  onCountdownEnd,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isEnded, setIsEnded] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const targetTime = new Date(targetDate).getTime()
      const currentTime = new Date().getTime()
      const difference = targetTime - currentTime

            if (difference <= 0) {
              setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
              if (!isEnded) {
                setIsEnded(true)
                onCountdownEnd()
              }
              return
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({ days, hours, minutes, seconds })
    }

    // Calculate immediately
    calculateTimeLeft()
    
    // Update every second
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onCountdownEnd, isEnded])

  const formatNumber = (num: number) => String(num).padStart(2, "0")

  if (isEnded) {
    return (
      <div className="text-center space-y-2">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          🎉 Session is Live!
        </div>
        <p className="text-sm text-muted-foreground">
          Click "Join Live Session" below to participate
        </p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-4">
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
        <Clock className="h-4 w-4" />
        <span>Session starts in:</span>
      </div>

          <div className="flex items-center justify-center gap-3 md:gap-4">
            {/* Days */}
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                {formatNumber(timeLeft.days)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Days
              </div>
            </div>

            <div className="text-2xl md:text-4xl font-bold text-muted-foreground self-start mt-1">:</div>

            {/* Hours */}
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                {formatNumber(timeLeft.hours)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Hours
              </div>
            </div>

            <div className="text-2xl md:text-4xl font-bold text-muted-foreground self-start mt-1">:</div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                {formatNumber(timeLeft.minutes)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Minutes
              </div>
            </div>

            <div className="text-2xl md:text-4xl font-bold text-muted-foreground self-start mt-1">:</div>

            {/* Seconds */}
            <div className="flex flex-col items-center">
              <div className="text-3xl md:text-5xl font-bold text-primary tabular-nums">
                {formatNumber(timeLeft.seconds)}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mt-1">
                Seconds
              </div>
            </div>
          </div>
    </div>
  )
}

